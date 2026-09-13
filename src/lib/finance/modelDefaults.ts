import { computeLTM } from './statements';
import { freeCashFlow, netDebt, netWorkingCapital, effectiveTaxRate } from './ratios';
import { buildWacc } from './wacc';
import type { DcfAssumptions } from './dcf';
import type { FinancialPeriod } from './types';
import { isNum, mean } from './core';

export interface MarketAssumptions {
  riskFreeRate: number;
  equityRiskPremium: number;
  statutoryTaxRate: number;
  countryRiskPremium?: number;
}

export interface CompanyMarketState {
  price: number;
  sharesOutstanding: number;
  beta: number;
}

/**
 * Builds a defensible first-pass DCF from a company's own reported history.
 * Every assumption is anchored to an observed figure so that the user starts
 * from the company's actual economics rather than a blank template.
 */
export function buildDefaultDcfAssumptions(
  periods: FinancialPeriod[],
  market: CompanyMarketState,
  rates: MarketAssumptions,
  forecastYears = 5,
  /**
   * The cost of capital the product publishes for this company, when one has
   * been resolved. Supplied rather than rebuilt here so that the DCF discounts
   * at the same rate as everything else; the CAPM fallback below runs only when
   * the institutional build could not be produced.
   */
  publishedWacc?: number | null,
): DcfAssumptions {
  const annuals = periods
    .filter((p) => p.periodType === 'FY')
    .slice()
    .sort((a, b) => a.endDate.localeCompare(b.endDate));
  const latest = annuals[annuals.length - 1];
  const prior = annuals[annuals.length - 2] ?? null;
  const quarters = periods.filter((p) => p.periodType === 'Q');
  const ltm = computeLTM(quarters);
  const base = ltm ?? latest;

  const baseRevenue = base?.income.revenue ?? 0;
  const baseYear = latest?.fiscalYear ?? new Date().getFullYear() - 1;

  // Historical growth, fading toward a long-run rate over the forecast window.
  const growthObservations = annuals
    .map((p, i) => (i === 0 ? null : growthOf(p.income.revenue, annuals[i - 1].income.revenue)))
    .filter(isNum) as number[];
  const recent = growthObservations.slice(-3);
  const startGrowth = clampRate(mean(recent) ?? 0.05, -0.15, 0.35);
  const terminalGrowth = 0.03;
  const revenueGrowth = Array.from({ length: forecastYears }, (_, i) =>
    round4(startGrowth + ((terminalGrowth + 0.005) - startGrowth) * ((i + 1) / forecastYears)),
  );

  const latestMargin = ratio(base?.income.ebitda, base?.income.revenue) ?? 0.2;
  const avgMargin = mean(annuals.slice(-3).map((p) => ratio(p.income.ebitda, p.income.revenue))) ?? latestMargin;
  const targetMargin = clampRate((latestMargin + avgMargin) / 2, 0.01, 0.85);
  const ebitdaMargin = Array.from({ length: forecastYears }, (_, i) =>
    round4(latestMargin + (targetMargin - latestMargin) * ((i + 1) / forecastYears)),
  );

  const daPct = clampRate(ratio(base?.income.da, base?.income.revenue) ?? 0.05, 0.005, 0.4);
  const capexHistory = annuals.slice(-3).map((p) =>
    ratio(isNum(p.cashFlow.capex) ? Math.abs(p.cashFlow.capex as number) : null, p.income.revenue),
  );
  const capexPct = clampRate(mean(capexHistory) ?? daPct, 0.002, 0.5);
  /**
   * Capex fades from what the company currently spends toward what it has to
   * spend to stand still. Holding an investment cycle flat into the perpetuity
   * is arithmetically impossible: capex permanently above depreciation grows
   * the asset base without bound relative to revenue, and a terminal value
   * computed on that cash flow is a statement about a company that cannot
   * exist. Maintenance is depreciation indexed to the terminal growth rate.
   */
  const maintenanceCapexPct = round4(clampRate(daPct * (1 + terminalGrowth), 0.002, 0.5));
  const capexPath = Array.from({ length: forecastYears }, (_, i) =>
    round4(capexPct + (maintenanceCapexPct - capexPct) * ((i + 1) / forecastYears)),
  );
  const nwcPct = clampRate(ratio(netWorkingCapital(base?.balance ?? latest.balance), baseRevenue) ?? 0.1, -0.3, 0.6);

  const observedTax = effectiveTaxRate(base?.income ?? latest.income);
  const taxRate = isNum(observedTax) && (observedTax as number) > 0.05 && (observedTax as number) < 0.6
    ? round4(observedTax as number)
    : rates.statutoryTaxRate;

  const nd = netDebt(base?.balance ?? latest.balance) ?? 0;
  const marketCap = market.price * market.sharesOutstanding;
  const grossDebt =
    (base?.balance.shortTermDebt ?? 0) + (base?.balance.longTermDebt ?? 0) + (base?.balance.leaseLiabilities ?? 0);
  const impliedKd = impliedCostOfDebtFrom(base ?? latest, grossDebt, rates.riskFreeRate);

  const wacc = buildWacc({
    riskFreeRate: rates.riskFreeRate,
    beta: market.beta,
    equityRiskPremium: rates.equityRiskPremium,
    countryRiskPremium: rates.countryRiskPremium ?? 0,
    costOfDebt: impliedKd,
    taxRate,
    marketValueEquity: marketCap,
    marketValueDebt: Math.max(grossDebt, 0),
  });

  const exitMultiple = round4(
    clampRate(ratio(marketCap + nd, base?.income.ebitda) ?? 7, 2, 25),
  );

  return {
    baseYear,
    baseRevenue: round2(baseRevenue),
    baseNwc: round2(netWorkingCapital(base?.balance ?? latest.balance) ?? 0),
    revenueGrowth,
    ebitdaMargin,
    daPctRevenue: [round4(daPct)],
    capexPctRevenue: capexPath,
    nwcPctRevenue: [round4(nwcPct)],
    taxRate,
    wacc: round4(publishedWacc ?? wacc.wacc ?? rates.riskFreeRate + market.beta * rates.equityRiskPremium),
    terminalMethod: 'GORDON',
    terminalGrowth,
    exitMultiple,
    netDebt: round2(nd),
    minorityInterest: round2(base?.balance.minorityInterestEquity ?? 0),
    investments: 0,
    sharesOutstanding: market.sharesOutstanding,
    currentPrice: market.price,
    midYearConvention: false,
  };
}

/** Fallback chain for Kd: reported financial expense, else Rf plus a spread. */
export function impliedCostOfDebtFrom(period: FinancialPeriod, grossDebt: number, riskFreeRate: number): number {
  const fin = period.income.financialResult;
  if (isNum(fin) && (fin as number) < 0 && grossDebt > 0) {
    const implied = Math.abs(fin as number) / grossDebt;
    if (implied > 0.005 && implied < 0.5) return round4(implied);
  }
  return round4(riskFreeRate + 0.02);
}

function growthOf(current: number | null, previous: number | null): number | null {
  if (!isNum(current) || !isNum(previous) || previous === 0) return null;
  return (current - previous) / Math.abs(previous);
}

function ratio(a: number | null | undefined, b: number | null | undefined): number | null {
  if (!isNum(a) || !isNum(b) || b === 0) return null;
  return (a as number) / (b as number);
}

function clampRate(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

const round4 = (v: number) => Math.round(v * 10000) / 10000;
const round2 = (v: number) => Math.round(v * 100) / 100;

export { freeCashFlow };
