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
 *   - non-current operating liabilities
 * Cash is deliberately excluded — it is not capital employed in operations.
 *
 * The last term is the one that is easy to forget. Provisions, deferred tax and
 * other non-current operating liabilities fund part of the asset base at no
 * cost, exactly as trade payables do in working capital, and they are not debt —
 * debt has its own lines. Omitting them overstates the capital employed and so
 * understates ROIC, and it breaks the reconciliation against the financing-side
 * definition below by precisely that amount, which is how this was found.
 */
export function investedCapital(b: BalanceSheet): number | null {
  const nwc = netWorkingCapital(b);
  const fixed = sum(b.ppe, b.intangibles, b.goodwill, b.otherAssets);
  if (!isNum(nwc) && !isNum(fixed)) return null;
  return (nwc ?? 0) + (fixed ?? 0) - (isNum(b.otherLiabilities) ? b.otherLiabilities : 0);
}

/**
 * Invested capital excluding goodwill and acquired intangibles.
 *
 * The two versions answer different questions and serious practice reports
 * both. Including them measures the return on everything shareholders put in,
 * the acquisition premiums included, which is what belongs against a WACC when
 * judging capital allocation. Excluding them measures the operating business on
 * the assets it actually runs, which is what tells you whether the business is
 * good and what an incremental unit of investment should earn.
 *
 * The gap between the two is the price paid for growth, and it is the single
 * most informative number about a company built by acquisition.
 */
export function investedCapitalExGoodwill(b: BalanceSheet): number | null {
  const full = investedCapital(b);
  if (!isNum(full)) return null;
  const acquired = sum(b.goodwill, b.intangibles) ?? 0;
  return full - acquired;
}

/**
 * Financing-side cross-check: total debt + equity - cash.
 *
 * On a balance sheet that balances this equals investedCapital above. The two
 * are kept as separate functions so that the identity can be asserted rather
 * than assumed — a gap between them means a line has been classified as neither
 * operating nor financing, which is a data-integrity failure, not a rounding one.
 */
export function investedCapitalFinancing(b: BalanceSheet): number | null {
  const debt = sum(b.shortTermDebt, b.longTermDebt, b.leaseLiabilities);
  const eq = b.totalEquity;
  if (!isNum(debt) && !isNum(eq)) return null;
  return (debt ?? 0) + (eq ?? 0) - (isNum(b.cash) ? b.cash : 0);
}

export interface RoicResult {
  roic: number | null;
  /** Same NOPAT over capital that excludes goodwill and acquired intangibles. */
  roicExGoodwill: number | null;
  nopat: number | null;
  investedCapital: number | null;
  investedCapitalExGoodwill: number | null;
  /** Goodwill and acquired intangibles as a share of invested capital. */
  acquiredShareOfCapital: number | null;
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

  const icExCurrent = investedCapitalExGoodwill(p.balance);
  const icExPrior = prior ? investedCapitalExGoodwill(prior.balance) : null;
  const icEx = isNum(icExPrior) ? mean([icExCurrent, icExPrior]) : icExCurrent;

  const roic = safeDiv(np, ic);
  const nopatMargin = safeDiv(np, p.income.revenue);
  const capitalTurnover = safeDiv(p.income.revenue, ic);

  return {
    roic,
    roicExGoodwill: safeDiv(np, icEx),
    nopat: np,
    investedCapital: ic,
    investedCapitalExGoodwill: icEx,
    acquiredShareOfCapital: isNum(ic) && isNum(icEx) && ic !== 0 ? (ic - icEx) / ic : null,
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
