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
import { isBalanceSheetFunded } from '@/lib/data-providers/mock/blueprints';

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

/** Long-run nominal growth by currency: real growth plus the inflation the currency runs at. */
const LONG_RUN_NOMINAL_GROWTH: Record<string, number> = { BRL: 0.055, USD: 0.040, EUR: 0.030 };

/**
 * Geometric decay per year toward long-run growth — a half-life near four years.
 *
 * The first version used 0.7, a two-year half-life, and it fixed the companies
 * that were extrapolating impossible growth by breaking the ones that are
 * genuinely compounding. Amazon, WEG and Equinix came out at roughly a third of
 * their market enterprise value, because excess growth was gone by year five.
 *
 * Competition does erode returns, but not that fast: the empirical work on
 * fade rates puts the half-life of excess growth in the four-to-seven year
 * range for businesses with a real advantage. 0.85 sits at the conservative end
 * of that and still removes the impossible cases — a company off a 100% year
 * is under 20% by year ten rather than being assumed to stay there.
 */
const FADE_FACTOR = 0.85;

/** The explicit forecast horizon. */
const PROJECTION_YEARS = 10;

/**
 * The capex a business needs once it is only growing at the long-run rate:
 * replace what wears out, and equip the increment.
 *
 * The starting point is the depreciation charge grown at the long-run rate.
 * Two adjustments sit on top of it, and they pull in opposite directions.
 *
 * Downward: only the TANGIBLE part of D&A demands replacement. Amortisation of
 * an acquired intangible is a charge against a price already paid — nothing has
 * to be rebuilt when it runs off. AMD is 13% tangible against 87% Xilinx
 * amortisation; charging its whole D&A as a spending requirement would have
 * made a fabless designer invest like a foundry.
 *
 * Upward: the tangible share is measured off the balance sheet, and the balance
 * sheet is a poor proxy for what actually depreciates. Goodwill is never
 * amortised at all, and neither is an indefinite-lived licence, so both sit in
 * the denominator contributing nothing to the numerator. That read Verizon as
 * 38% tangible and set its maintenance capex at 5.2% of revenue — against the
 * 12.8% Verizon has spent every year for a decade, and a 13.0% depreciation
 * charge. The model was manufacturing seven points of revenue as free cash flow
 * the company has never had. Comcast, AT&T, Merck, Pfizer and SLB all carried
 * the same error, and all five valued out at more than twice their market price.
 *
 * The guard is what the company itself has demonstrated. A business already
 * spending at or below its own depreciation charge is not in an investment
 * phase — there is nothing to fade away, and its own sustained spending is the
 * better evidence of what it needs. So the tangible haircut can only ever apply
 * to a company spending LESS than it depreciates, which is the case it was
 * written for.
 */
export function maintenanceCapex(
  capexPct: number,
  daPct: number,
  tangibleShare: number,
  longRun: number,
): number {
  const replacement = daPct * (1 + longRun);
  const tangibleFloor = replacement * tangibleShare;
  const sustained = Math.min(capexPct, replacement);
  return Math.max(tangibleFloor, sustained);
}

/**
 * Capex converges on the level the forecast growth actually requires.
 *
 * The trailing ratio used to be applied to all ten years, so whatever
 * investment phase a company happened to be in became permanent. The error was
 * systematic and one-directional: of the fourteen companies furthest from
 * market value, every one the model read low was spending above depreciation
 * and every one it read high was spending below it. Tesla at 1.8x depreciation
 * came out at 6% of its market enterprise value; AMD at 0.3x came out high on
 * cash it was not reinvesting.
 *
 * Reinvestment has to be consistent with growth. A business growing 12% needs
 * capex well above depreciation; the same business growing 4% needs only
 * maintenance. So capex fades on the same schedule the growth fades, and the
 * two stay coupled instead of being assumed independently.
 */
export function capexFadePath(
  capexPct: number,
  maintenancePct: number,
  years = PROJECTION_YEARS,
  fade = FADE_FACTOR,
): number[] {
  return Array.from({ length: years }, (_, i) => maintenancePct + (capexPct - maintenancePct) * fade ** i);
}

/**
 * The growth prior, measured from the universe rather than chosen.
 *
 * A single company's five-year window gives a growth mean with a large standard
 * error, so it is weighted against what companies in general do. That needs two
 * numbers the company itself cannot supply, and both are derived by
 * `npm run audit:growth` from the cross-section, with a test pinning these
 * constants to what the derivation returns.
 *
 * EXCESS is where the population sits: these are large listed companies, and
 * they have grown 4.5 points a year faster than their currencies' long-run
 * nominal rate. Shrinking a noisy company toward the economy's growth instead
 * of toward its own population is the wrong centre and biases every uncertain
 * company downward — it moved the universe's median model value from 1.03x
 * market to 0.91x when it was tried that way.
 *
 * SPREAD is how far apart the underlying rates genuinely are: the cross-section
 * of trailing means has a standard deviation of 9.1 points, the average
 * sampling noise inside one company's window is 4.9, and what is left —
 * sqrt(9.1² - 4.9²) — is 7.6 points.
 */
export const GROWTH_PRIOR_EXCESS = 0.045;
export const CROSS_SECTIONAL_GROWTH_SPREAD = 0.076;

/**
 * The trailing growth rate, weighted by how much of it is signal.
 *
 * Five years of revenue give four or five growth observations, and for a
 * cyclical their dispersion swamps their mean: ConocoPhillips averages -4.8% a
 * year against a standard deviation of 11 points, NVIDIA 65% against 54. Taken
 * literally, the first forecasts an oil major shrinking by a third over the
 * decade and the second a revenue line twenty times its own market. Neither
 * mean is wrong as arithmetic; neither is measuring a durable rate.
 *
 * A binary test — trend or no trend — was tried first and does not work, because
 * NVIDIA's mean does clear any reasonable significance bar. It is large AND
 * uncertain, and a threshold has to call it one or the other.
 *
 * So the mean is weighted against the prior in proportion to its own
 * reliability, which is the standard treatment of a noisy estimate. The weight
 * is tau2 / (tau2 + se2): where a company's own window is tight the trailing
 * rate passes through untouched — Visa's 9.8% carries a 0.4-point standard
 * error and keeps 99.8% of its weight — and where the window is mostly noise
 * the population takes over.
 *
 * It reproduces, without being fitted to them, the judgement calls that had been
 * hand-written into the blueprints — Booking, Lilly, PRIO, Azzas all land within
 * a few points of their hand-set rates — while correcting the ones that had been
 * set in the wrong direction entirely, AT&T at 3.5% on a top line that has been
 * shrinking for five years.
 */
export function shrinkGrowth(
  yearly: number[],
  longRun: number,
  tau = CROSS_SECTIONAL_GROWTH_SPREAD,
  priorExcess = GROWTH_PRIOR_EXCESS,
): { growth: number; weight: number; standardError: number; prior: number } {
  const prior = longRun + priorExcess;
  const m = mean(yearly);
  if (!isNum(m) || yearly.length < 2) {
    return { growth: prior, weight: 0, standardError: Infinity, prior };
  }

  const variance = yearly.reduce((s, g) => s + (g - (m as number)) ** 2, 0) / (yearly.length - 1);
  const standardError = Math.sqrt(variance / yearly.length);
  const weight = tau ** 2 / (tau ** 2 + standardError ** 2);
  return { growth: weight * (m as number) + (1 - weight) * prior, weight, standardError, prior };
}

export async function buildProjectionContext(
  workspaceId: string,
  ticker: string,
  modelId?: string | null,
): Promise<ProjectionContext | null> {
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) return null;
  const symbol = dossier.company.ticker;
  /**
   * Ratios read off the recent window; growth read off all of it.
   *
   * A cost structure from six years ago is not the cost structure the company
   * runs on now, so margins, payment terms and capital intensity come from the
   * last four years. A growth rate is the opposite problem: it is estimated
   * from differences, and three differences is not enough to tell a rate from
   * the window it was measured in. Nike's last three years average -5.0% and
   * its last five average +1.2% — the same company, and the shorter window put
   * a decade of 3% decline into the model.
   */
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

  const growthYears = dossier.annuals;
  const yearlyGrowth = growthYears.slice(1).map((p, i) => {
    const prior = growthYears[i].income.revenue;
    return isNum(p.income.revenue) && isNum(prior) && (prior as number) !== 0
      ? (p.income.revenue as number) / Math.abs(prior as number) - 1
      : null;
  }).filter((g): g is number => g !== null);
  const trailingGrowth = mean(yearlyGrowth) ?? 0.04;

  /**
   * Growth fades toward long-run nominal growth; it is not held at the trailing
   * average for ten years.
   *
   * The trailing mean was being written into a one-element array, and the
   * engine repeats the last entry, so every company grew at its own recent rate
   * for the whole horizon. For a mature telecom that is nearly harmless. For a
   * company coming off two years above 100% it forecasts sixty percent a year
   * for a decade, and the model valued NVIDIA at three times its market price
   * on a revenue line that reached numbers no market is that large.
   *
   * Nothing grows faster than the economy forever — that is what a perpetuity
   * assumption means, and a ten-year explicit period that ignores it just moves
   * the impossibility inside the forecast. The decay here is geometric with a
   * half-life near two years, which is the shape excess returns actually take
   * as competition arrives.
   */
  const longRun = LONG_RUN_NOMINAL_GROWTH[dossier.company.currency] ?? 0.04;

  const shrunk = shrinkGrowth(yearlyGrowth, longRun);
  const historicalGrowth = shrunk.growth;
  /**
   * The fade only ever slows a company down.
   *
   * Converging toward long-run growth from BELOW would forecast a mature
   * telecom growing 1.5% today accelerating to 4% by year ten, which is not
   * mean reversion, it is an assumption that maturity reverses. Where the
   * starting rate is already at or under the long-run rate the path is flat;
   * the decay applies only to growth that is above what an economy can sustain.
   */
  const fadeGrowth = (start: number, target = longRun): number[] => {
    const floor = Math.min(target, start);
    return Array.from({ length: PROJECTION_YEARS }, (_, i) => floor + (start - floor) * FADE_FACTOR ** i);
  };

  /**
   * Where the business has one natural unit, the top line is built from it:
   * a volume and a price, each with its own path, so an analyst can hold
   * traffic flat while the tariff follows inflation. Where it does not —
   * a conglomerate, a bank — the segment split is the better reading, and
   * where neither exists there is one line.
   */
  const driver = findBlueprint(symbol)?.driver ?? null;
  const driverShare = driver?.shareOfRevenue ?? 1;
  const driverPriceGrowth = driver?.priceGrowth ?? 0;

  /**
   * The build-up reconciles with the statements in growth as well as in level.
   *
   * The unit and its price were carried as independent constants, so the
   * revenue they compounded to owed nothing to the company's own top line.
   * Across the universe ninety companies are built this way and sixty-four of
   * them disagreed with their own reported growth by more than 1.5 points a
   * year: AT&T was given 3.5% against a top line that has shrunk 0.9% a year,
   * Comcast 3.0% against 0.9%, ConocoPhillips 4.0% against -4.8%. Over ten
   * years that is a different company.
   *
   * The price path is the half that is genuinely observable — an inflation
   * index, a tariff formula, a contracted escalator — so it keeps its own path
   * and the volume is solved for. That is also the order an analyst works in:
   * revenue grew 1.1%, the tariff was indexed at 2.0%, so units fell 0.9%.
   */
  const impliedVolumeGrowth = (total: number): number =>
    (1 + total) / (1 + driverPriceGrowth) - 1;
  const revenue: RevenueLine[] = driver
    ? [
        {
          key: 'volume', label: `Receita de ${driver.unit}`, kind: 'VOLUME_PRICE' as const,
          baseVolume: driver.volume,
          volumeGrowth: fadeGrowth(historicalGrowth).map(impliedVolumeGrowth),
          // The price is recomputed from the reported top line so the two
          // reconcile: an anchor that has drifted from the statements would
          // otherwise show a build-up that does not add up to the revenue.
          basePrice: driver.volume > 0 ? (baseRevenue * driverShare) / driver.volume : driver.price,
          priceGrowth: [driverPriceGrowth],
          priceIndex: driver.priceIndex ?? null,
          source: `${driver.unit} reportado, FY${baseYear} — volume conciliado à receita reportada`,
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
          revenueGrowth: fadeGrowth(historicalGrowth),
          source: `Divulgação de segmentos, FY${baseYear} — crescimento convergindo ao nominal de longo prazo`,
        }))
      : [{
          key: 'revenue', label: 'Receita', kind: 'GROWTH' as const,
          baseRevenue, revenueGrowth: fadeGrowth(historicalGrowth), source: statementSource,
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

  const daPct = Math.abs(mean(annuals.map((p) =>
    ratio(isNum(p.income.da) ? Math.abs(p.income.da as number) : null, p.income.revenue))) ?? 0.05);
  const tangibleShare = ppe + intangibles > 0 ? ppe / (ppe + intangibles) : 1;
  const maintenanceCapexPct = maintenanceCapex(capexPct, daPct, tangibleShare, longRun);
  const capexPath = capexFadePath(capexPct, maintenanceCapexPct);

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
  // The cost of capital belongs to the company, not to a model.
  //
  // This used to pass modelId through, so the discount rate came from whichever
  // model the caller happened to name — and the valuation page, which names the
  // DCF model, discounted Embraer at a different rate from every other screen
  // and published a different fair value because of it. A saved WACC build is
  // still editable on the WACC tab; it just cannot make the published number
  // depend on the route the reader took.
  const waccContext = await getWaccBuildContext(workspaceId, symbol, null);
  const built = waccContext ? buildWaccInstitutional(waccContext.saved ?? waccContext.suggested) : null;

  const terms = termsFrom(annuals);
  const payout = ratio(
    isNum(latest.cashFlow.dividendsPaid) ? Math.abs(latest.cashFlow.dividendsPaid as number) : null,
    latest.income.netIncome,
  ) ?? 0.3;

  const suggested: ProjectionInput = {
    ticker: symbol,
    currency: dossier.company.currency,
    balanceSheetFunded: isBalanceSheetFunded(dossier.company.industry),
    baseYear,
    years: PROJECTION_YEARS,
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
      pctRevenue: capexPath,
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
    { path: 'revenue.growth', label: 'Crescimento ano 1', value: fadeGrowth(historicalGrowth)[0],
      source: `Média de ${yearlyGrowth.length} anos reportados (${(trailingGrowth * 100).toFixed(1)}%), `
        + `com peso de ${(shrunk.weight * 100).toFixed(0)}% dado o erro padrão de `
        + `${(shrunk.standardError * 100).toFixed(1)} pontos — o restante converge ao nominal de longo prazo` },
    { path: 'costs.cogs', label: 'Custo % da receita', value: cogsPct, source: `${statementSource} — ex-depreciação` },
    { path: 'costs.sga', label: 'Despesas % da receita', value: sgaPct, source: statementSource },
    { path: 'capex.pct', label: 'Capex % da receita (ano 1)', value: capexPath[0], source: `Fluxo de caixa, média de ${annuals.length} anos` },
    { path: 'capex.maintenance', label: 'Capex de manutenção % da receita', value: maintenanceCapexPct, source: 'Depreciação a repor mais o crescimento de longo prazo, limitada ao que a empresa sustenta — o nível que o crescimento projetado exige' },
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
  opts?: { workspaceId?: string | null },
): Promise<{
  valuePerShare: number | null;
  upside: number | null;
  currentPrice: number | null;
  enterpriseValue: number | null;
  equityValue: number | null;
  wacc: number | null;
  costOfEquity: number | null;
  /** What multiple of current EBITDA the model's enterprise value implies. */
  impliedEvEbitda: number | null;
  /** What the market is paying, on the same EBITDA. */
  marketEvEbitda: number | null;
  warnings: string[];
} | null> {
  // No modelId. Deliberately.
  //
  // Passing one made the published value depend on which screen asked: the
  // valuation page passed the DCF model's id, which loaded that model's saved
  // WACC build and returned 17.87 for Embraer, while every other screen asked
  // without an id, got the default build, and returned 18.54. A company cannot
  // have a fair value that changes with the route the reader took to reach it.
  //
  // A saved model still belongs on the valuation page as the analyst's own
  // working copy. It just does not get to be the published number.
  const context = await buildProjectionContext(opts?.workspaceId ?? '', ticker, null);
  if (!context) return null;
  const input = context.saved ?? context.suggested;
  const run = runProjection(input);
  const v = run.valuation;

  // The cross-check every practitioner does by hand: what multiple does the
  // model imply, and what is the market paying?
  //
  // A discounted cash flow will disagree with market multiples, and the
  // disagreement is the output — it is why anyone builds one. What is not
  // acceptable is publishing the disagreement without its size. The model puts
  // Embraer at 3.7x EBITDA against a market at 10.8x; stated that way a reader
  // can weigh it, and stated as "fair value R$18.54" alone they cannot.
  const dossier = await getCompanyDossier(ticker);
  const baseEbitda = dossier?.metrics.ebitda ?? null;
  const marketEv = dossier?.metrics.enterpriseValue ?? null;
  const impliedEvEbitda = isNum(v.enterpriseValue) && isNum(baseEbitda) && (baseEbitda as number) > 0
    ? (v.enterpriseValue as number) / (baseEbitda as number)
    : null;
  const marketEvEbitda = isNum(marketEv) && isNum(baseEbitda) && (baseEbitda as number) > 0
    ? (marketEv as number) / (baseEbitda as number)
    : null;

  return {
    impliedEvEbitda,
    marketEvEbitda,
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

/**
 * Moves both discount rates together, keeping the spread between them.
 *
 * The published value per share comes from the levered route, discounted at the
 * cost of equity — so varying the WACC alone moves the unlevered route and
 * leaves the published number untouched. A sensitivity built that way produces
 * a grid whose rows are identical, which is worse than no grid: it reads as
 * evidence that the valuation is insensitive to the cost of capital.
 *
 * Shifting both by the same amount keeps the capital structure coherent and
 * moves both routes, so the axis labelled WACC means something for the number
 * on the page.
 */
function shiftDiscountRates(input: ProjectionInput, targetWacc: number): ProjectionInput {
  const baseWacc = input.wacc ?? targetWacc;
  const delta = targetWacc - baseWacc;
  return {
    ...input,
    wacc: targetWacc,
    costOfEquity: input.costOfEquity != null ? input.costOfEquity + delta : input.costOfEquity,
  };
}

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
      const variant = shiftDiscountRates(input, waccPoints[r]);
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

/**
 * Reverse the projection: what does the current price already assume?
 *
 * A forward model answers "what is it worth"; this answers "what would have to
 * be true for today's price to be right", which is the more useful question
 * when the two disagree. It solves twice, because the price can be justified by
 * either half of the equation and the reader should see both: the uniform
 * revenue growth adjustment that makes the model agree with the price, and the
 * discount rate that does the same at unchanged growth.
 *
 * Bisection rather than a closed form, because the projection is a full
 * three-statement run with a debt schedule and a tax charge that respond to the
 * inputs; there is no expression to invert. Both solves are monotonic in their
 * variable over any sane range, so bisection converges and a failure to bracket
 * is reported rather than hidden behind a plausible number.
 */
export function projectionReverse(
  input: ProjectionInput,
  targetPrice: number,
): {
  impliedGrowthDelta: number | null;
  impliedWacc: number | null;
  baseValuePerShare: number | null;
  targetPrice: number;
} {
  const valueAt = (variant: ProjectionInput): number | null =>
    runProjection(variant).valuation.valuePerShare;

  const withGrowthDelta = (d: number): ProjectionInput => ({
    ...input,
    revenue: input.revenue.map((line) =>
      line.kind === 'VOLUME_PRICE'
        ? { ...line, volumeGrowth: (line.volumeGrowth ?? [0]).map((g: number) => g + d) }
        : line.kind === 'GROWTH'
          ? { ...line, revenueGrowth: (line.revenueGrowth ?? [0]).map((g: number) => g + d) }
          : line,
    ),
  });

  const solve = (
    make: (x: number) => ProjectionInput,
    lo: number,
    hi: number,
  ): number | null => {
    const f = (x: number) => {
      const v = valueAt(make(x));
      return v == null ? null : v - targetPrice;
    };
    let a = f(lo);
    let b = f(hi);
    if (a == null || b == null) return null;
    // Not bracketed means the price cannot be reached anywhere in the range,
    // which is itself the answer and should not be rounded into one.
    if (a > 0 === b > 0) return null;
    let x = lo;
    for (let i = 0; i < 60; i += 1) {
      x = (lo + hi) / 2;
      const mid = f(x);
      if (mid == null) return null;
      if (Math.abs(mid) < 1e-6) break;
      if ((mid > 0) === (a > 0)) { lo = x; a = mid; } else { hi = x; b = mid; }
    }
    return x;
  };

  return {
    impliedGrowthDelta: solve(withGrowthDelta, -0.30, 0.30),
    impliedWacc: solve((w) => shiftDiscountRates(input, w), 0.02, 0.60),
    baseValuePerShare: valueAt(input),
    targetPrice,
  };
}
