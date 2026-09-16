/* ==================================================================
   Beta, from prices.

   A beta is a regression slope: how much a stock has moved for a given
   move in its market. The platform had been carrying one as a stored
   number with no derivation, which meant nobody could ask what window
   it covered or what index it was against — and both change the answer
   materially.
   ================================================================== */

export interface BetaResult {
  beta: number;
  /** How much of the stock's variance the market explains. */
  rSquared: number;
  /** Standard error of the slope — how firmly the data pins it down. */
  standardError: number;
  observations: number;
  benchmark: string;
  from: string;
  to: string;
}

/**
 * Pairs two price series on the dates both traded.
 *
 * Brazilian and American calendars differ, and so do halts and holidays. A
 * regression run on unaligned series measures the calendar as much as the
 * stock, so only dates present in both are used.
 */
export function alignedReturns(
  stock: { date: string; close: number }[],
  market: { date: string; close: number }[],
): { dates: string[]; stock: number[]; market: number[] } {
  const byDate = new Map(market.map((b) => [b.date, b.close]));
  const dates: string[] = [];
  const rs: number[] = [];
  const rm: number[] = [];

  let priorStock: number | null = null;
  let priorMarket: number | null = null;

  for (const bar of stock) {
    const m = byDate.get(bar.date);
    if (m === undefined || bar.close <= 0 || m <= 0) continue;
    if (priorStock !== null && priorMarket !== null) {
      dates.push(bar.date);
      rs.push(bar.close / priorStock - 1);
      rm.push(m / priorMarket - 1);
    }
    priorStock = bar.close;
    priorMarket = m;
  }
  return { dates, stock: rs, market: rm };
}

/**
 * The regression, with the diagnostics that say how much to trust it.
 *
 * The standard error matters as much as the slope. A beta of 1.4 that is pinned
 * to within 0.05 and one pinned to within 0.6 are different facts, and only the
 * second is a reason to prefer a peer-derived figure instead.
 */
export function regressBeta(
  stock: { date: string; close: number }[],
  market: { date: string; close: number }[],
  benchmark: string,
  minimumObservations = 120,
): BetaResult | null {
  const { dates, stock: rs, market: rm } = alignedReturns(stock, market);
  const n = rs.length;
  if (n < minimumObservations) return null;

  const meanS = rs.reduce((a, b) => a + b, 0) / n;
  const meanM = rm.reduce((a, b) => a + b, 0) / n;

  let covariance = 0;
  let varianceM = 0;
  let varianceS = 0;
  for (let i = 0; i < n; i++) {
    const ds = rs[i] - meanS;
    const dm = rm[i] - meanM;
    covariance += ds * dm;
    varianceM += dm * dm;
    varianceS += ds * ds;
  }
  // A market that did not move cannot explain anything.
  if (varianceM === 0 || varianceS === 0) return null;

  const beta = covariance / varianceM;
  const rSquared = (covariance * covariance) / (varianceM * varianceS);

  // Residual variance over the market's, the standard form for a slope.
  const residual = (varianceS - beta * covariance) / (n - 2);
  const standardError = Math.sqrt(Math.max(residual, 0) / varianceM);

  return {
    beta,
    rSquared,
    standardError,
    observations: n,
    benchmark,
    from: dates[0],
    to: dates[dates.length - 1],
  };
}
