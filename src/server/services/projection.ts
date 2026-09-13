import { getCompanyDossier } from './company';
import { prisma, parseJson } from '@/lib/db';
import { project, type ProjectionResult } from '@/lib/finance/projection/engine';
import { valueProjection, type ProjectionValuation } from '@/lib/finance/projection/valuation';
import type { CostLine, ProjectionInput, RevenueLine } from '@/lib/finance/projection/types';
import { buildWaccInstitutional } from '@/lib/finance/waccBuilder';
import { getWaccBuildContext } from './wacc';
import { isNum, mean, safeDiv } from '@/lib/finance/core';
import type { FinancialPeriod } from '@/lib/finance/types';
import { findBlueprint } from '@/lib/data-providers/mock/blueprints';

/* ==================================================================
   Building a full model from what the company has reported.

   The starting point is not a template: it is the company's own last
   balance sheet, its own segment split, its own payment terms and its
   own capital intensity, read off the statements. The analyst then
   changes whatever they disagree with — which is a different starting
   position from a blank model, and a different one again from a model
   that arrives with someone else's assumptions in it.
   ================================================================== */

const DAYS = 365;

function ratio(a: number | null | undefined, b: number | null | undefined): number | null {
  if (!isNum(a) || !isNum(b) || b === 0) return null;
  return (a as number) / (b as number);
}

/** Payment terms read off the balance sheet, averaged over what is reported. */
function termsFrom(annuals: FinancialPeriod[]): {
  receivableDays: number; payableDays: number; inventoryDays: number;
  otherAssetDays: number; otherLiabilityDays: number;
} {
  const days = (pick: (p: FinancialPeriod) => number | null, base: (p: FinancialPeriod) => number | null) =>
    mean(annuals.map((p) => {
      const r = ratio(pick(p), base(p));
      return isNum(r) ? (r as number) * DAYS : null;
    })) ?? 0;

  const revenue = (p: FinancialPeriod) => p.income.revenue;
  const cogs = (p: FinancialPeriod) => (isNum(p.income.cogs) ? Math.abs(p.income.cogs as number) : null);

  return {
    receivableDays: days((p) => p.balance.accountsReceivable, revenue),
    payableDays: days((p) => p.balance.accountsPayable, cogs),
    inventoryDays: days((p) => p.balance.inventory, cogs),
    otherAssetDays: days((p) => p.balance.otherCurrentAssets, revenue),
    otherLiabilityDays: days((p) => p.balance.otherCurrentLiabilities, revenue),
  };
}

export interface ProjectionContext {
  ticker: string;
  companyName: string;
  currency: string;
  baseYear: number;
  /** The model as the platform would start it, from reported history. */
  suggested: ProjectionInput;
  /** What is saved against the company's model, when anything is. */
  saved: ProjectionInput | null;
  modelId: string | null;
  /** Where each starting figure was read from. */
  provenance: { path: string; label: string; value: number | null; source: string }[];
}

export async function buildProjectionContext(
  workspaceId: string,
  ticker: string,
  modelId?: string | null,
): Promise<ProjectionContext | null> {
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) return null;
  const symbol = dossier.company.ticker;
  const annuals = dossier.annuals.slice(-4);
  const latest = annuals[annuals.length - 1];
  if (!latest) return null;

  const baseYear = latest.fiscalYear;
  const m = dossier.metrics;
  const baseRevenue = latest.income.revenue ?? 0;
  const statementSource = `Demonstrações de ${symbol}, FY${baseYear}`;

  /* --- revenue: one line per reported segment --------------------- */
  const segments = dossier.segments.filter((s) => s.fiscalYear === baseYear && s.kind === 'BUSINESS');
  const segmentTotal = segments.reduce((s, x) => s + (x.revenue ?? 0), 0);

  const historicalGrowth = mean(
    annuals.slice(1).map((p, i) => {
      const prior = annuals[i].income.revenue;
      return isNum(p.income.revenue) && isNum(prior) && (prior as number) !== 0
        ? (p.income.revenue as number) / Math.abs(prior as number) - 1
        : null;
    }),
  ) ?? 0.04;

  /**
   * Where the business has one natural unit, the top line is built from it:
   * a volume and a price, each with its own path, so an analyst can hold
   * traffic flat while the tariff follows inflation. Where it does not —
   * a conglomerate, a bank — the segment split is the better reading, and
   * where neither exists there is one line.
   */
  const driver = findBlueprint(symbol)?.driver ?? null;
  const driverShare = driver?.shareOfRevenue ?? 1;

  const revenue: RevenueLine[] = driver
    ? [
        {
          key: 'volume', label: `Receita de ${driver.unit}`, kind: 'VOLUME_PRICE' as const,
          baseVolume: driver.volume,
          volumeGrowth: [driver.volumeGrowth],
          // The price is recomputed from the reported top line so the two
          // reconcile: an anchor that has drifted from the statements would
          // otherwise show a build-up that does not add up to the revenue.
          basePrice: driver.volume > 0 ? (baseRevenue * driverShare) / driver.volume : driver.price,
          priceGrowth: [driver.priceGrowth],
          priceIndex: driver.priceIndex ?? null,
          source: `${driver.unit} reportado, FY${baseYear}`,
        },
        ...(driverShare < 0.999
          ? [{
              key: 'other', label: 'Demais receitas', kind: 'PCT_OF' as const,
              ofKey: 'volume', pctOf: [(1 - driverShare) / driverShare],
              source: statementSource,
            }]
          : []),
      ]
    : segments.length && segmentTotal > 0
      ? segments.map((s) => ({
          key: s.segment.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          label: s.segment,
          kind: 'GROWTH' as const,
          baseRevenue: (s.revenue ?? 0) / segmentTotal * baseRevenue,
          revenueGrowth: [historicalGrowth],
          source: `Divulgação de segmentos, FY${baseYear}`,
        }))
      : [{
          key: 'revenue', label: 'Receita', kind: 'GROWTH' as const,
          baseRevenue, revenueGrowth: [historicalGrowth], source: statementSource,
        }];

  /* --- costs: from the reported cost structure --------------------- */
  const cogsPct = Math.abs(mean(annuals.map((p) => {
    const da = isNum(p.income.da) ? Math.abs(p.income.da as number) : 0;
    const c = isNum(p.income.cogs) ? Math.abs(p.income.cogs as number) : null;
    // D&A is charged separately by the engine, so it comes out of COGS here.
    return c === null ? null : ratio((c as number) - da, p.income.revenue);
  })) ?? 0.6);
  const sgaPct = Math.abs(mean(annuals.map((p) => {
    const sga = (isNum(p.income.sga) ? Math.abs(p.income.sga as number) : 0)
      + (isNum(p.income.rnd) ? Math.abs(p.income.rnd as number) : 0);
    return ratio(sga, p.income.revenue);
  })) ?? 0.1);

  const costs: CostLine[] = [
    { key: 'cogs', label: 'Custo dos produtos e serviços', block: 'COGS', kind: 'PCT_REVENUE',
      pct: [cogsPct], source: `${statementSource} — ex-depreciação` },
    { key: 'sga', label: 'Despesas gerais, administrativas e P&D', block: 'SGA', kind: 'PCT_REVENUE',
      pct: [sgaPct], source: statementSource },
  ];

  /* --- capex and the asset base ------------------------------------ */
  const capexPct = Math.abs(mean(annuals.map((p) =>
    ratio(isNum(p.cashFlow.capex) ? Math.abs(p.cashFlow.capex as number) : null, p.income.revenue))) ?? 0.05);
  const ppe = latest.balance.ppe ?? 0;
  const intangibles = (latest.balance.intangibles ?? 0) + (latest.balance.goodwill ?? 0);
  const daAmount = isNum(latest.income.da) ? Math.abs(latest.income.da as number) : 0;
  // Implied life: the asset base divided by what is charged against it.
  const impliedLife = daAmount > 0 ? Math.round((ppe + intangibles) / daAmount) : 12;

  /* --- debt --------------------------------------------------------- */
  const grossDebt = (latest.balance.shortTermDebt ?? 0) + (latest.balance.longTermDebt ?? 0)
    + (latest.balance.leaseLiabilities ?? 0);
  /**
   * The amortisation profile is on the balance sheet already: the share of
   * gross debt sitting in current liabilities is what the company itself says
   * falls due within a year. A concession with 5% current is telling you it
   * amortises over twenty years, and assuming eight instead invents a funding
   * gap that does not exist.
   */
  const currentShare = grossDebt > 0 ? (latest.balance.shortTermDebt ?? 0) / grossDebt : 0;
  const amortisationYears = currentShare > 0.01
    ? Math.max(2, Math.min(25, Math.round(1 / currentShare)))
    : 10;
  /** New capex is funded in the proportion the balance sheet is funded today. */
  const bookEquity = latest.balance.totalEquity ?? 0;
  const capexFundedByDebt = grossDebt + bookEquity > 0
    ? Math.min(0.85, Math.max(0, grossDebt / (grossDebt + bookEquity)))
    : 0.4;
  const financial = latest.income.financialResult;
  const impliedKd = isNum(financial) && (financial as number) < 0 && grossDebt > 0
    ? Math.min(0.45, Math.abs(financial as number) / grossDebt)
    : 0.12;

  /* --- the discount rates from the WACC build ----------------------- */
  const waccContext = await getWaccBuildContext(workspaceId, symbol, modelId ?? null);
  const built = waccContext ? buildWaccInstitutional(waccContext.saved ?? waccContext.suggested) : null;

  const terms = termsFrom(annuals);
  const payout = ratio(
    isNum(latest.cashFlow.dividendsPaid) ? Math.abs(latest.cashFlow.dividendsPaid as number) : null,
    latest.income.netIncome,
  ) ?? 0.3;

  const suggested: ProjectionInput = {
    ticker: symbol,
    currency: dossier.company.currency,
    baseYear,
    years: 10,
    opening: {
      cash: latest.balance.cash ?? 0,
      shortTermInvestments: 0,
      receivables: latest.balance.accountsReceivable ?? 0,
      inventory: latest.balance.inventory ?? 0,
      otherCurrentAssets: latest.balance.otherCurrentAssets ?? 0,
      tangibleAssets: ppe,
      intangibleAssets: intangibles,
      otherNonCurrentAssets: latest.balance.otherAssets ?? 0,
      payables: latest.balance.accountsPayable ?? 0,
      shortTermDebt: latest.balance.shortTermDebt ?? 0,
      longTermDebt: (latest.balance.longTermDebt ?? 0) + (latest.balance.leaseLiabilities ?? 0),
      otherCurrentLiabilities: latest.balance.otherCurrentLiabilities ?? 0,
      otherNonCurrentLiabilities: latest.balance.otherLiabilities ?? 0,
      provisions: 0,
      shareCapital: latest.balance.shareCapital ?? 0,
      retainedEarnings: (latest.balance.retainedEarnings ?? 0) + (latest.balance.treasuryStock ?? 0),
      minorityInterest: latest.balance.minorityInterestEquity ?? 0,
    },
    revenue,
    revenueDeductions: [0],
    costs,
    capex: [{
      key: 'capex', label: 'Investimentos',
      pctRevenue: [capexPct],
      tangibleShare: ppe + intangibles > 0 ? ppe / (ppe + intangibles) : 1,
      usefulLife: Math.max(3, Math.min(40, impliedLife)),
      source: `Fluxo de caixa, média de ${annuals.length} anos`,
    }],
    workingCapital: {
      receivableDays: terms.receivableDays,
      payableDays: terms.payableDays,
      inventoryDays: terms.inventoryDays,
      otherAssetDays: terms.otherAssetDays,
      otherLiabilityDays: terms.otherLiabilityDays,
      provisionDays: [],
    },
    debt: {
      openingBalance: grossDebt,
      costOfDebt: impliedKd,
      amortisationYears,
      capexFundedByDebt,
      rollMaturities: true,
      newDebtTenor: amortisationYears,
      cashYield: dossier.company.currency === 'BRL' ? 0.10 : 0.035,
      source: `Resultado financeiro sobre a dívida bruta, FY${baseYear}`,
    },
    distribution: { payout: [Math.min(1, Math.max(0, payout))] },
    taxRate: [Math.min(0.45, Math.max(0, ratio(
      isNum(latest.income.taxes) ? Math.abs(latest.income.taxes as number) : null,
      latest.income.ebt) ?? 0.34))],
    baseNetRevenue: baseRevenue,
    wacc: built?.wacc ?? m.wacc ?? null,
    costOfEquity: built?.costOfEquity ?? null,
    sharesOutstanding: m.sharesOutstanding ?? null,
    currentPrice: m.price ?? null,
    ownership: 1,
    covenants: [
      { key: 'nd-ebitda', label: 'Dívida líquida / EBITDA', measure: 'NET_DEBT_EBITDA', threshold: 3.5, comparator: 'LTE' },
      { key: 'icr', label: 'Cobertura de juros', measure: 'EBITDA_INTEREST', threshold: 2, comparator: 'GTE' },
    ],
  };

  const model = modelId
    ? await prisma.valuationModel.findFirst({ where: { id: modelId, workspaceId } })
    : await prisma.valuationModel.findFirst({
        where: { workspaceId, company: { ticker: symbol }, kind: 'DCF' },
        orderBy: { updatedAt: 'desc' },
      });
  const saved = model?.projection ? parseJson<ProjectionInput | null>(model.projection, null) : null;

  const provenance = [
    { path: 'opening.balance', label: 'Balanço de abertura', value: latest.balance.totalAssets ?? null, source: statementSource },
    { path: 'revenue.base', label: 'Receita base', value: baseRevenue, source: statementSource },
    driver
      ? { path: 'revenue.driver', label: `Volume (${driver.unit})`, value: driver.volume, source: `Operacional reportado, FY${baseYear}` }
      : { path: 'revenue.segments', label: 'Divisão por segmento', value: segments.length, source: `Divulgação de segmentos, FY${baseYear}` },
    { path: 'costs.cogs', label: 'Custo % da receita', value: cogsPct, source: `${statementSource} — ex-depreciação` },
    { path: 'costs.sga', label: 'Despesas % da receita', value: sgaPct, source: statementSource },
    { path: 'capex.pct', label: 'Capex % da receita', value: capexPct, source: `Fluxo de caixa, média de ${annuals.length} anos` },
    { path: 'capex.life', label: 'Vida útil implícita', value: impliedLife, source: 'Base de ativos dividida pela depreciação do período' },
    { path: 'debt.opening', label: 'Dívida bruta', value: grossDebt, source: statementSource },
    { path: 'debt.cost', label: 'Custo da dívida implícito', value: impliedKd, source: `Resultado financeiro sobre a dívida bruta, FY${baseYear}` },
    { path: 'debt.amortisation', label: 'Anos de amortização implícitos', value: amortisationYears, source: `Parcela circulante sobre a dívida bruta, FY${baseYear}` },
    { path: 'debt.capexFunding', label: 'Capex financiado por dívida', value: capexFundedByDebt, source: `Estrutura de capital contábil, FY${baseYear}` },
    { path: 'wacc', label: 'WACC', value: suggested.wacc ?? null, source: built ? 'Construção do WACC componente a componente' : 'Indisponível' },
    { path: 'ke', label: 'Custo do equity', value: suggested.costOfEquity ?? null, source: built ? 'CAPM na construção do WACC' : 'Indisponível' },
  ];

  return {
    ticker: symbol,
    companyName: dossier.company.name,
    currency: dossier.company.currency,
    baseYear,
    suggested,
    saved,
    modelId: model?.id ?? null,
    provenance,
  };
}

export interface ProjectionRun {
  projected: ProjectionResult;
  valuation: ProjectionValuation;
}

export function runProjection(input: ProjectionInput): ProjectionRun {
  const projected = project(input);
  return { projected, valuation: valueProjection(input, projected) };
}

export { project, valueProjection };
export type { ProjectionInput, ProjectionResult, ProjectionValuation };

/**
 * The one fair value the product publishes for a company.
 *
 * Everything that quotes a value per share or an upside — the overview, the
 * screener, the thesis, memos, alerts, the AI answers — reads this. There is
 * no second valuation to disagree with it.
 *
 * It is the full three-statement projection rather than the standalone DCF
 * because the projection is the model that can be checked: it carries a balance
 * sheet that has to close, a debt schedule that has to amortise, vintage
 * depreciation, and both routes to equity with the gap between them reported.
 * A five-year FCFF sketch cannot be audited the same way, and a product that
 * published both published two answers to one question.
 *
 * Returns null when the projection cannot be built. Callers then show nothing
 * rather than falling back to a different model, because a fallback is how a
 * second valuation gets back in.
 */
export async function getPublishedValuation(
  ticker: string,
  opts?: { workspaceId?: string | null; modelId?: string | null },
): Promise<{
  valuePerShare: number | null;
  upside: number | null;
  currentPrice: number | null;
  enterpriseValue: number | null;
  equityValue: number | null;
  wacc: number | null;
  costOfEquity: number | null;
  warnings: string[];
} | null> {
  const context = await buildProjectionContext(
    opts?.workspaceId ?? '',
    ticker,
    opts?.modelId ?? null,
  );
  if (!context) return null;
  const input = context.saved ?? context.suggested;
  const run = runProjection(input);
  const v = run.valuation;
  return {
    valuePerShare: v.valuePerShare,
    upside: v.upside,
    currentPrice: v.currentPrice,
    enterpriseValue: v.enterpriseValue,
    equityValue: v.attributableEquityValue,
    wacc: input.wacc ?? null,
    costOfEquity: input.costOfEquity ?? null,
    warnings: v.warnings ?? [],
  };
}

/**
 * Sensitivity and scenarios, run on the projection rather than on a second
 * engine.
 *
 * The point of moving these is not that the grid is better maths — it is that
 * a sensitivity computed on a different model from the published value is not
 * a sensitivity of the published value. Every cell here is a full run of the
 * same three-statement projection, with the balance sheet closing in each one.
 */
export function projectionSensitivity(
  input: ProjectionInput,
  waccPoints: number[],
  growthPoints: number[],
): {
  waccAxis: number[];
  growthAxis: number[];
  cells: { row: number; col: number; valuePerShare: number | null; upside: number | null }[];
  base: number | null;
} {
  const cells: { row: number; col: number; valuePerShare: number | null; upside: number | null }[] = [];
  for (let r = 0; r < waccPoints.length; r += 1) {
    for (let c = 0; c < growthPoints.length; c += 1) {
      const variant: ProjectionInput = { ...input, wacc: waccPoints[r] };
      const projected = project(variant);
      const v = valueProjection(variant, projected, { terminalGrowth: growthPoints[c] });
      cells.push({ row: r, col: c, valuePerShare: v.valuePerShare, upside: v.upside });
    }
  }
  const base = runProjection(input).valuation.valuePerShare;
  return { waccAxis: waccPoints, growthAxis: growthPoints, cells, base };
}

/**
 * Bull, base and bear as three runs of the same model.
 *
 * The levers are revenue growth and operating margin, because those are what an
 * analyst actually disagrees about; the discount rate is held so that the three
 * cases differ on the business rather than on the arithmetic.
 */
export function projectionScenarios(
  input: ProjectionInput,
  deltas: { key: 'BULL' | 'BASE' | 'BEAR'; growthDelta: number; costDelta: number }[] = [
    { key: 'BULL', growthDelta: 0.02, costDelta: -0.01 },
    { key: 'BASE', growthDelta: 0, costDelta: 0 },
    { key: 'BEAR', growthDelta: -0.02, costDelta: 0.01 },
  ],
): { key: string; valuePerShare: number | null; upside: number | null }[] {
  return deltas.map((d) => {
    const variant: ProjectionInput = {
      ...input,
      revenue: input.revenue.map((line) =>
        line.kind === 'VOLUME_PRICE'
          ? { ...line, volumeGrowth: (line.volumeGrowth ?? [0]).map((g: number) => g + d.growthDelta) }
          : line.kind === 'GROWTH'
            ? { ...line, revenueGrowth: (line.revenueGrowth ?? [0]).map((g: number) => g + d.growthDelta) }
            : line,
      ),
      costs: input.costs.map((c) =>
        c.kind === 'PCT_REVENUE' ? { ...c, pct: (c.pct ?? [0]).map((x: number) => x + d.costDelta) } : c,
      ),
    };
    const run = runProjection(variant);
    return { key: d.key, valuePerShare: run.valuation.valuePerShare, upside: run.valuation.upside };
  });
}
