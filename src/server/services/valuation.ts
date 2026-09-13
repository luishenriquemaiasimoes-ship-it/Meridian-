import { prisma, parseJson } from '@/lib/db';
import { getCompanyDossier } from './company';
import { ratesForCurrency } from './metrics';
import { buildDefaultDcfAssumptions } from '@/lib/finance/modelDefaults';
import { resolveInstitutionalWacc } from './wacc';
import {
  axisRange, buildSensitivity, calculateDcf, normalizeAssumptions, reverseDcf,
  type DcfAssumptions, type DcfResult, type SensitivityAxis,
} from '@/lib/finance/dcf';
import { deriveScenarioSet, runScenarios, type ScenarioDefinition } from '@/lib/finance/scenarios';
import { calculateSotp, type SotpInput } from '@/lib/finance/sotp';
import { expectedReturn, valuationBridge } from '@/lib/finance/expectedReturn';

export interface ValuationModelRecord {
  id: string;
  companyTicker: string;
  companyName: string;
  name: string;
  kind: string;
  status: string;
  assumptions: DcfAssumptions | SotpInput | Record<string, unknown>;
  scenarios: ScenarioDefinition[] | null;
  outputs: Record<string, unknown> | null;
  notes: string | null;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export async function listValuationModels(workspaceId: string, ticker?: string): Promise<ValuationModelRecord[]> {
  const rows = await prisma.valuationModel.findMany({
    where: { workspaceId, ...(ticker ? { company: { ticker: ticker.toUpperCase() } } : {}) },
    include: { company: true },
    orderBy: { updatedAt: 'desc' },
  });
  return rows.map((r) => ({
    id: r.id,
    companyTicker: r.company.ticker,
    companyName: r.company.name,
    name: r.name,
    kind: r.kind,
    status: r.status,
    assumptions: parseJson<Record<string, unknown>>(r.assumptions, {}),
    scenarios: parseJson<ScenarioDefinition[] | null>(r.scenarios, null),
    outputs: parseJson<Record<string, unknown> | null>(r.outputs, null),
    notes: r.notes,
    authorName: r.authorName,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

/** Builds a starting DCF for a company from its own reported history. */
export async function defaultAssumptionsFor(
  ticker: string,
  opts?: { workspaceId?: string | null; modelId?: string | null },
): Promise<DcfAssumptions | null> {
  const dossier = await getCompanyDossier(ticker);
  if (!dossier || !dossier.security) return null;
  // One cost of capital per company. When the institutional build cannot be
  // produced the CAPM fallback inside buildDefaultDcfAssumptions still runs.
  const published = await resolveInstitutionalWacc(ticker, opts);
  return buildDefaultDcfAssumptions(
    dossier.periods,
    {
      price: dossier.security.lastPrice,
      sharesOutstanding: dossier.security.sharesOutstanding,
      beta: dossier.security.beta ?? 1,
    },
    ratesForCurrency(dossier.company.currency),
    5,
    published?.wacc ?? null,
  );
}

export interface DcfWorkbench {
  assumptions: DcfAssumptions;
  result: DcfResult;
  sensitivity: {
    waccVsGrowth: ReturnType<typeof buildSensitivity>;
    waccVsExitMultiple: ReturnType<typeof buildSensitivity>;
    growthVsMargin: ReturnType<typeof buildSensitivity>;
  };
  reverse: ReturnType<typeof reverseDcf>;
  scenarios: ReturnType<typeof runScenarios>;
  expectedReturn: ReturnType<typeof expectedReturn>;
  bridge: ReturnType<typeof valuationBridge>;
}

/** Runs the full valuation workbench for a set of assumptions. */
export function runDcfWorkbench(
  input: Partial<DcfAssumptions>,
  options: {
    scenarios?: ScenarioDefinition[];
    currentMultiple?: number | null;
    exitMultipleForBridge?: number | null;
    dividendYield?: number;
    targetPrice?: number | null;
  } = {},
): DcfWorkbench {
  const assumptions = normalizeAssumptions(input);
  const result = calculateDcf(assumptions);
  const price = assumptions.currentPrice ?? null;

  const waccSteps = axisRange(assumptions.wacc, 0.005, 2);
  const growthSteps = axisRange(assumptions.terminalGrowth, 0.005, 2);
  const exitSteps = axisRange(assumptions.exitMultiple, Math.max(0.5, assumptions.exitMultiple * 0.08), 2);
  const revenueCenter = assumptions.revenueGrowth[0] ?? 0.05;
  const marginCenter = assumptions.ebitdaMargin[0] ?? 0.2;

  const scenarioDefs = options.scenarios?.length
    ? options.scenarios
    : deriveScenarioSet(assumptions);

  return {
    assumptions,
    result,
    sensitivity: {
      waccVsGrowth: buildSensitivity(assumptions, 'WACC' as SensitivityAxis, waccSteps, 'TERMINAL_GROWTH', growthSteps),
      waccVsExitMultiple: buildSensitivity(assumptions, 'WACC', waccSteps, 'EXIT_MULTIPLE', exitSteps),
      growthVsMargin: buildSensitivity(
        assumptions, 'REVENUE_GROWTH', axisRange(revenueCenter, 0.02, 2),
        'EBITDA_MARGIN', axisRange(marginCenter, 0.02, 2),
      ),
    },
    reverse: reverseDcf(assumptions, price ?? result.fairValuePerShare ?? 0),
    scenarios: runScenarios(scenarioDefs, price),
    expectedReturn: expectedReturn({
      currentPrice: price ?? 0,
      targetPrice: options.targetPrice ?? result.fairValuePerShare,
      dividendYield: options.dividendYield ?? 0,
      years: 1,
    }),
    bridge: valuationBridge({
      currentPrice: price ?? 0,
      earningsGrowth: assumptions.revenueGrowth[0] ?? 0.05,
      currentMultiple: options.currentMultiple ?? null,
      exitMultiple: options.exitMultipleForBridge ?? options.currentMultiple ?? null,
      dividendYield: options.dividendYield ?? 0,
      shareCountChange: 0,
      years: 3,
    }),
  };
}

/** Sum-of-the-parts built from the company's reported segment disclosure. */
export async function defaultSotpFor(ticker: string): Promise<SotpInput | null> {
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) return null;
  const latestYear = Math.max(...dossier.segments.map((s) => s.fiscalYear), 0);
  const business = dossier.segments.filter((s) => s.kind === 'BUSINESS' && s.fiscalYear === latestYear);
  if (!business.length) return null;

  const peerMultiple = dossier.metrics.evEbitda ?? 7;
  return {
    segments: business.map((s, i) => ({
      id: `${i}`,
      name: s.segment,
      revenue: s.revenue,
      ebitda: s.ebitda,
      multiple: Math.round(peerMultiple * 100) / 100,
      ownership: 1,
      method: 'EV_EBITDA' as const,
    })),
    corporateCosts: null,
    corporateMultiple: null,
    netDebt: dossier.metrics.netDebt ?? 0,
    minorityInterest: 0,
    sharesOutstanding: dossier.metrics.sharesOutstanding ?? 0,
    currentPrice: dossier.metrics.price,
  };
}

export { calculateSotp, calculateDcf, deriveScenarioSet, normalizeAssumptions };
