import { isNum, mean, safeDiv, sub, sum } from './core';
import { effectiveTaxRate, netWorkingCapital } from './ratios';
import type { BalanceSheet, FinancialPeriod } from './types';

/**
 * NOPAT = EBIT x (1 - effective tax rate).
 * The tax rate falls back to the supplied statutory rate when the reported
 * effective rate is unusable (loss-making year, tax credit, missing tax line).
 */
export function nopat(p: FinancialPeriod, statutoryTaxRate = 0.34): number | null {
  if (!isNum(p.income.ebit)) return null;
  const eff = effectiveTaxRate(p.income);
  const t = isNum(eff) && eff >= 0 && eff < 0.7 ? eff : statutoryTaxRate;
  return p.income.ebit * (1 - t);
}

/**
 * Invested capital, operating (asset-side) definition:
 *   net working capital + net PP&E + intangibles + goodwill + other assets
 * Cash is deliberately excluded — it is not capital employed in operations.
 */
export function investedCapital(b: BalanceSheet): number | null {
  const nwc = netWorkingCapital(b);
  const fixed = sum(b.ppe, b.intangibles, b.goodwill, b.otherAssets);
  if (!isNum(nwc) && !isNum(fixed)) return null;
  return (nwc ?? 0) + (fixed ?? 0);
}

/** Financing-side cross-check: total debt + equity - cash. */
export function investedCapitalFinancing(b: BalanceSheet): number | null {
  const debt = sum(b.shortTermDebt, b.longTermDebt, b.leaseLiabilities);
  const eq = b.totalEquity;
  if (!isNum(debt) && !isNum(eq)) return null;
  return (debt ?? 0) + (eq ?? 0) - (isNum(b.cash) ? b.cash : 0);
}

export interface RoicResult {
  roic: number | null;
  nopat: number | null;
  investedCapital: number | null;
  /** NOPAT / Revenue */
  nopatMargin: number | null;
  /** Revenue / Invested capital */
  capitalTurnover: number | null;
  taxRateUsed: number | null;
  averageCapitalUsed: boolean;
}

/**
 * ROIC = NOPAT / Invested capital, with the DuPont-style decomposition
 * ROIC = NOPAT margin x invested-capital turnover.
 * When a prior period is supplied, average invested capital is used.
 */
export function calculateRoic(
  p: FinancialPeriod,
  prior?: FinancialPeriod | null,
  statutoryTaxRate = 0.34,
): RoicResult {
  const np = nopat(p, statutoryTaxRate);
  const icCurrent = investedCapital(p.balance);
  const icPrior = prior ? investedCapital(prior.balance) : null;
  const ic = isNum(icPrior) ? mean([icCurrent, icPrior]) : icCurrent;

  const eff = effectiveTaxRate(p.income);
  const taxRateUsed = isNum(eff) && eff >= 0 && eff < 0.7 ? eff : statutoryTaxRate;

  const roic = safeDiv(np, ic);
  const nopatMargin = safeDiv(np, p.income.revenue);
  const capitalTurnover = safeDiv(p.income.revenue, ic);

  return {
    roic,
    nopat: np,
    investedCapital: ic,
    nopatMargin,
    capitalTurnover,
    taxRateUsed,
    averageCapitalUsed: isNum(icPrior),
  };
}

export interface RoicSpreadResult {
  roic: number | null;
  wacc: number | null;
  spread: number | null;
  createsValue: boolean | null;
  /** Economic profit = (ROIC - WACC) x invested capital */
  economicProfit: number | null;
}

export function roicSpread(
  roicValue: number | null,
  waccValue: number | null,
  investedCapitalValue: number | null,
): RoicSpreadResult {
  const spread = sub(roicValue, waccValue);
  return {
    roic: roicValue,
    wacc: waccValue,
    spread,
    createsValue: isNum(spread) ? spread > 0 : null,
    economicProfit: isNum(spread) && isNum(investedCapitalValue) ? spread * investedCapitalValue : null,
  };
}

/** ROIC history across a period set (uses the preceding period for averaging). */
export function roicSeries(
  periods: FinancialPeriod[],
  statutoryTaxRate = 0.34,
): { label: string; endDate: string; roic: number | null; nopatMargin: number | null; capitalTurnover: number | null }[] {
  const ordered = periods.slice().sort((a, b) => a.endDate.localeCompare(b.endDate));
  return ordered.map((p, i) => {
    const r = calculateRoic(p, i > 0 ? ordered[i - 1] : null, statutoryTaxRate);
    return {
      label: p.label,
      endDate: p.endDate,
      roic: r.roic,
      nopatMargin: r.nopatMargin,
      capitalTurnover: r.capitalTurnover,
    };
  });
}
