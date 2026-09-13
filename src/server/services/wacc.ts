import { prisma, parseJson } from '@/lib/db';
import { getCompanyDossier } from './company';
import { getComps } from './comps';
import { getUniverseMetrics } from './metrics';
import {
  buildWaccInstitutional, diffWaccBuilds,
  type PeerBeta, type WaccBuildInput, type WaccBuildResult,
} from '@/lib/finance/waccBuilder';
import { isNum } from '@/lib/finance/core';

/* ==================================================================
   Assembling a WACC build from what the workspace already holds.

   The defaults are a starting point with every source named, not an
   answer. The analyst changes what they disagree with; what they leave
   alone still carries its provenance.
   ================================================================== */

export interface MacroInput {
  code: string;
  name: string;
  /** As a ratio, not a percentage. */
  value: number;
  asOf: string;
  category: string;
}

export interface WaccBuildContext {
  ticker: string;
  companyName: string;
  currency: string;
  country: string | null;
  /** Rate instruments the workspace can point at. */
  instruments: MacroInput[];
  /** Peers with the data needed to unlever a beta. */
  peers: PeerBeta[];
  /** The build as the platform would start it, fully sourced. */
  suggested: WaccBuildInput;
  /** The build currently saved on the model, when there is one. */
  saved: WaccBuildInput | null;
}

/** Instruments whose quoted yield is a real rate. */
const REAL_RATE_CODES = new Set(['NTNB35', 'NTNB', 'TIPS10']);

function pickInstrument(instruments: MacroInput[], preferred: string[]): MacroInput | null {
  for (const code of preferred) {
    const found = instruments.find((i) => i.code === code);
    if (found) return found;
  }
  return null;
}

export async function getWaccBuildContext(
  workspaceId: string,
  ticker: string,
  modelId?: string | null,
): Promise<WaccBuildContext | null> {
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) return null;

  const [indicatorRows, comps, universe, workspace, model] = await Promise.all([
    prisma.marketIndicator.findMany({ where: { category: { in: ['RATE', 'MACRO'] } }, orderBy: { code: 'asc' } }),
    getComps(ticker),
    getUniverseMetrics(),
    prisma.workspace.findUnique({ where: { id: workspaceId } }),
    modelId ? prisma.valuationModel.findFirst({ where: { id: modelId, workspaceId } }) : Promise.resolve(null),
  ]);

  const instruments: MacroInput[] = indicatorRows.map((i) => ({
    code: i.code,
    name: i.name,
    value: i.value / 100,           // indicators are quoted in percent
    asOf: i.asOf.toISOString().slice(0, 10),
    category: i.category,
  }));

  const currency = dossier.company.currency;
  const isLocal = currency === 'BRL';

  // Prefer a nominal instrument. An inflation-linked one is offered only as a
  // fallback, and the builder then converts it and says so.
  const rfInstrument = isLocal
    ? pickInstrument(instruments, ['NTNF33', 'NTNB35', 'SELIC'])
    : pickInstrument(instruments, ['US10Y']);
  const inflation = instruments.find((i) => i.code === 'IPCA')?.value ?? null;
  const erpInstrument = pickInstrument(instruments, ['ERPUS']);
  const crpInstrument = isLocal ? pickInstrument(instruments, ['EMBIBR']) : null;

  const m = dossier.metrics;
  const marketEquity = m.marketCap;
  const netDebt = m.netDebt;

  const peers: PeerBeta[] = (comps?.peerMetrics ?? [])
    .filter((p) => isNum(p.beta) && isNum(p.marketCap) && isNum(p.netDebt) && (p.marketCap as number) > 0)
    .map((p) => ({
      ticker: p.ticker,
      leveredBeta: p.beta as number,
      debtToEquity: (p.netDebt as number) / (p.marketCap as number),
      taxRate: isNum(p.effectiveTaxRate) && (p.effectiveTaxRate as number) > 0 && (p.effectiveTaxRate as number) < 0.6
        ? (p.effectiveTaxRate as number)
        : workspace?.statutoryTaxRate ?? 0.34,
    }));

  const asOf = m.priceAsOf ?? new Date().toISOString().slice(0, 10);
  const isReal = rfInstrument ? REAL_RATE_CODES.has(rfInstrument.code) : false;

  const suggested: WaccBuildInput = {
    currency,
    erpIsDevelopedMarket: true,
    riskFree: {
      value: rfInstrument?.value ?? 0,
      source: rfInstrument ? `${rfInstrument.name} (MockMarketDataProvider)` : '',
      asOf: rfInstrument?.asOf ?? null,
      basis: isReal ? 'REAL' : 'NOMINAL',
      inflation: isReal ? inflation : null,
      instrument: rfInstrument?.name ?? null,
    },
    equityRiskPremium: {
      value: erpInstrument?.value ?? 0.055,
      source: erpInstrument ? `${erpInstrument.name} (MockMarketDataProvider)` : '',
      asOf: erpInstrument?.asOf ?? null,
    },
    // The Brazilian risk-free instruments above are issued by the same
    // sovereign whose EMBI+ spread is used as the country premium below.
    riskFreeIsLocalSovereign: isLocal,
    countryRiskPremium: crpInstrument
      ? { value: crpInstrument.value, source: `${crpInstrument.name} (MockMarketDataProvider)`, asOf: crpInstrument.asOf }
      : null,
    betaMethod: 'OBSERVED',
    observedBeta: isNum(m.beta)
      ? { value: m.beta as number, source: 'Regression against the market benchmark', asOf, window: '3y daily', benchmark: isLocal ? 'IBOV' : 'SPX' }
      : null,
    peerBetas: peers,
    targetDebtToEquity: isNum(netDebt) && isNum(marketEquity) && (marketEquity as number) > 0
      ? (netDebt as number) / (marketEquity as number)
      : null,
    costOfDebt: {
      value: isNum(m.costOfDebt) ? (m.costOfDebt as number) : 0,
      source: 'Implied by the reported financial expense over average gross debt',
      asOf: m.basisEndDate,
      basis: 'REPORTED',
    },
    taxRate: {
      value: isNum(m.effectiveTaxRate) && (m.effectiveTaxRate as number) > 0 && (m.effectiveTaxRate as number) < 0.6
        ? (m.effectiveTaxRate as number)
        : workspace?.statutoryTaxRate ?? 0.34,
      source: isNum(m.effectiveTaxRate) && (m.effectiveTaxRate as number) > 0 && (m.effectiveTaxRate as number) < 0.6
        ? `Effective rate on ${m.basisLabel}`
        : 'Workspace statutory rate',
      asOf: m.basisEndDate,
    },
    marketValueEquity: {
      value: isNum(marketEquity) ? (marketEquity as number) : 0,
      source: 'Market price x shares outstanding',
      asOf,
    },
    debt: {
      value: isNum(netDebt) ? (netDebt as number) : 0,
      source: `Net debt on ${m.basisLabel}`,
      asOf: m.basisEndDate,
      basis: 'NET_DEBT',
    },
    cash: null,
    targetEquityWeight: null,
    rationale: null,
  };

  return {
    ticker: dossier.company.ticker,
    companyName: dossier.company.name,
    currency,
    country: dossier.company.country,
    instruments,
    peers,
    suggested,
    saved: model?.waccBuild ? parseJson<WaccBuildInput | null>(model.waccBuild, null) : null,
  };
}

export interface WaccBuildRun {
  result: WaccBuildResult;
  diff: ReturnType<typeof diffWaccBuilds>;
}

/** Runs a build and compares it against what the model held before. */
export function runWaccBuild(input: WaccBuildInput, previous: WaccBuildInput | null): WaccBuildRun {
  const result = buildWaccInstitutional(input);
  const before = previous ? buildWaccInstitutional(previous) : null;
  return { result, diff: diffWaccBuilds(before, result) };
}

export { buildWaccInstitutional };
export type { WaccBuildInput, WaccBuildResult };
