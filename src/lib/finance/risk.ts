import { correlation, covariance, isNum, mean, percentile, safeDiv, stdev } from './core';

/* ==========================  RISK ENGINE  ========================== */

export const TRADING_DAYS = 252;
export const MONTHS = 12;

export function simpleReturns(prices: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1];
    if (!Number.isFinite(prev) || prev === 0) continue;
    out.push(prices[i] / prev - 1);
  }
  return out;
}

export function logReturns(prices: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] <= 0 || prices[i] <= 0) continue;
    out.push(Math.log(prices[i] / prices[i - 1]));
  }
  return out;
}

/** Annualised standard deviation of periodic returns. */
export function volatility(returns: number[], periodsPerYear = TRADING_DAYS): number | null {
  const sd = stdev(returns);
  return isNum(sd) ? (sd as number) * Math.sqrt(periodsPerYear) : null;
}

/** Beta = Cov(asset, benchmark) / Var(benchmark). */
export function beta(assetReturns: number[], benchmarkReturns: number[]): number | null {
  const n = Math.min(assetReturns.length, benchmarkReturns.length);
  if (n < 2) return null;
  const cov = covariance(assetReturns.slice(0, n), benchmarkReturns.slice(0, n));
  const sd = stdev(benchmarkReturns.slice(0, n));
  if (!isNum(cov) || !isNum(sd) || sd === 0) return null;
  return (cov as number) / ((sd as number) ** 2);
}

/** Jensen's alpha, annualised. */
export function alpha(
  assetReturns: number[],
  benchmarkReturns: number[],
  riskFreeRate: number,
  periodsPerYear = TRADING_DAYS,
): number | null {
  const b = beta(assetReturns, benchmarkReturns);
  const ra = mean(assetReturns);
  const rb = mean(benchmarkReturns);
  if (!isNum(b) || !isNum(ra) || !isNum(rb)) return null;
  const rfPeriod = riskFreeRate / periodsPerYear;
  return ((ra as number) - rfPeriod - (b as number) * ((rb as number) - rfPeriod)) * periodsPerYear;
}

/** Sharpe = (annualised return - Rf) / annualised volatility. */
export function sharpe(
  returns: number[],
  riskFreeRate = 0,
  periodsPerYear = TRADING_DAYS,
): number | null {
  const m = mean(returns);
  const vol = volatility(returns, periodsPerYear);
  if (!isNum(m) || !isNum(vol) || (vol as number) === 0) return null;
  const annualised = (m as number) * periodsPerYear;
  return (annualised - riskFreeRate) / (vol as number);
}

/** Downside deviation against a minimum acceptable return (default 0). */
export function downsideDeviation(
  returns: number[],
  mar = 0,
  periodsPerYear = TRADING_DAYS,
): number | null {
  const below = returns.filter((r) => r < mar);
  if (below.length < 1) return null;
  const sq = below.reduce((s, r) => s + (r - mar) ** 2, 0) / returns.length;
  return Math.sqrt(sq) * Math.sqrt(periodsPerYear);
}

export function sortino(
  returns: number[],
  riskFreeRate = 0,
  periodsPerYear = TRADING_DAYS,
): number | null {
  const m = mean(returns);
  const dd = downsideDeviation(returns, 0, periodsPerYear);
  if (!isNum(m) || !isNum(dd) || (dd as number) === 0) return null;
  return ((m as number) * periodsPerYear - riskFreeRate) / (dd as number);
}

export interface DrawdownResult {
  maxDrawdown: number | null;   // negative number, e.g. -0.32
  peakIndex: number | null;
  troughIndex: number | null;
  recoveryIndex: number | null;
  currentDrawdown: number | null;
  series: number[];
}

/** Maximum peak-to-trough decline of a value series. */
export function maxDrawdown(values: number[]): DrawdownResult {
  if (values.length < 2) {
    return { maxDrawdown: null, peakIndex: null, troughIndex: null, recoveryIndex: null, currentDrawdown: null, series: [] };
  }
  let peak = values[0];
  let peakIdx = 0;
  let worst = 0;
  let worstPeakIdx = 0;
  let worstTroughIdx = 0;
  const series: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (values[i] > peak) { peak = values[i]; peakIdx = i; }
    const dd = peak !== 0 ? values[i] / peak - 1 : 0;
    series.push(dd);
    if (dd < worst) { worst = dd; worstPeakIdx = peakIdx; worstTroughIdx = i; }
  }
  let recoveryIndex: number | null = null;
  const peakValue = values[worstPeakIdx];
  for (let i = worstTroughIdx + 1; i < values.length; i++) {
    if (values[i] >= peakValue) { recoveryIndex = i; break; }
  }
  return {
    maxDrawdown: worst,
    peakIndex: worstPeakIdx,
    troughIndex: worstTroughIdx,
    recoveryIndex,
    currentDrawdown: series[series.length - 1],
    series,
  };
}

/** Historical VaR: the loss at the (1 - confidence) quantile. Returned negative. */
export function historicalVar(returns: number[], confidence = 0.95): number | null {
  if (returns.length < 5) return null;
  return percentile(returns, 1 - confidence);
}

/** Parametric (normal) VaR. */
export function parametricVar(returns: number[], confidence = 0.95): number | null {
  const m = mean(returns);
  const sd = stdev(returns);
  if (!isNum(m) || !isNum(sd)) return null;
  return (m as number) - zScore(confidence) * (sd as number);
}

/** Conditional VaR — mean of the losses beyond the VaR threshold. */
export function conditionalVar(returns: number[], confidence = 0.95): number | null {
  const v = historicalVar(returns, confidence);
  if (!isNum(v)) return null;
  const tail = returns.filter((r) => r <= (v as number));
  return tail.length ? mean(tail) : v;
}

/** Inverse standard normal CDF (Acklam's rational approximation). */
export function zScore(confidence: number): number {
  const p = confidence;
  if (p <= 0 || p >= 1) return 0;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number;
  let r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

export interface CorrelationMatrix {
  labels: string[];
  values: (number | null)[][];
}

export function correlationMatrix(series: Record<string, number[]>): CorrelationMatrix {
  const labels = Object.keys(series);
  const values = labels.map((a) =>
    labels.map((b) => (a === b ? 1 : correlation(series[a], series[b]))),
  );
  return { labels, values };
}

export interface RiskContributionRow {
  key: string;
  weight: number;
  volatility: number | null;
  marginalContribution: number | null;
  contribution: number | null;
  contributionPct: number | null;
}

/**
 * Marginal and total risk contribution using the full covariance matrix.
 * MCR_i = (Sigma w)_i / sigma_p ; RC_i = w_i x MCR_i ; sum(RC) = sigma_p.
 */
export function riskContribution(
  weights: Record<string, number>,
  series: Record<string, number[]>,
  periodsPerYear = TRADING_DAYS,
): { rows: RiskContributionRow[]; portfolioVolatility: number | null } {
  const keys = Object.keys(weights).filter((k) => series[k]?.length > 2);
  if (!keys.length) return { rows: [], portfolioVolatility: null };
  const n = Math.min(...keys.map((k) => series[k].length));
  const cov: number[][] = keys.map((a) =>
    keys.map((b) => covariance(series[a].slice(-n), series[b].slice(-n)) ?? 0),
  );
  const w = keys.map((k) => weights[k]);
  const sigmaW = cov.map((row) => row.reduce((s, v, j) => s + v * w[j], 0));
  const variance = w.reduce((s, wi, i) => s + wi * sigmaW[i], 0);
  if (variance <= 0) return { rows: [], portfolioVolatility: null };
  const sigmaP = Math.sqrt(variance);
  const annualisedSigma = sigmaP * Math.sqrt(periodsPerYear);

  const rows: RiskContributionRow[] = keys.map((k, i) => {
    const mcr = sigmaW[i] / sigmaP;
    const rc = w[i] * mcr;
    return {
      key: k,
      weight: w[i],
      volatility: volatility(series[k].slice(-n), periodsPerYear),
      marginalContribution: mcr * Math.sqrt(periodsPerYear),
      contribution: rc * Math.sqrt(periodsPerYear),
      contributionPct: sigmaP !== 0 ? rc / sigmaP : null,
    };
  });
  return { rows, portfolioVolatility: annualisedSigma };
}

export interface PerformanceStats {
  totalReturn: number | null;
  annualizedReturn: number | null;
  volatility: number | null;
  sharpe: number | null;
  sortino: number | null;
  maxDrawdown: number | null;
  var95: number | null;
  cvar95: number | null;
  bestPeriod: number | null;
  worstPeriod: number | null;
  positivePeriodsPct: number | null;
  observations: number;
}

export function performanceStats(
  values: number[],
  riskFreeRate = 0,
  periodsPerYear = TRADING_DAYS,
): PerformanceStats {
  const rets = simpleReturns(values);
  const totalReturn = values.length > 1 && values[0] !== 0 ? values[values.length - 1] / values[0] - 1 : null;
  const years = rets.length / periodsPerYear;
  const annualizedReturn =
    isNum(totalReturn) && years > 0 ? (1 + (totalReturn as number)) ** (1 / years) - 1 : null;
  return {
    totalReturn,
    annualizedReturn,
    volatility: volatility(rets, periodsPerYear),
    sharpe: sharpe(rets, riskFreeRate, periodsPerYear),
    sortino: sortino(rets, riskFreeRate, periodsPerYear),
    maxDrawdown: maxDrawdown(values).maxDrawdown,
    var95: historicalVar(rets, 0.95),
    cvar95: conditionalVar(rets, 0.95),
    bestPeriod: rets.length ? Math.max(...rets) : null,
    worstPeriod: rets.length ? Math.min(...rets) : null,
    positivePeriodsPct: rets.length ? rets.filter((r) => r > 0).length / rets.length : null,
    observations: rets.length,
  };
}

/** Tracking error and information ratio vs a benchmark series. */
export function trackingStats(
  portfolioReturns: number[],
  benchmarkReturns: number[],
  periodsPerYear = TRADING_DAYS,
): { trackingError: number | null; informationRatio: number | null; correlation: number | null } {
  const n = Math.min(portfolioReturns.length, benchmarkReturns.length);
  if (n < 2) return { trackingError: null, informationRatio: null, correlation: null };
  const active = Array.from({ length: n }, (_, i) => portfolioReturns[i] - benchmarkReturns[i]);
  const te = volatility(active, periodsPerYear);
  const activeMean = mean(active);
  return {
    trackingError: te,
    informationRatio:
      isNum(te) && (te as number) !== 0 && isNum(activeMean)
        ? ((activeMean as number) * periodsPerYear) / (te as number)
        : null,
    correlation: correlation(portfolioReturns.slice(0, n), benchmarkReturns.slice(0, n)),
  };
}

/* ------------------------ Scenario analysis ------------------------ */

export interface ScenarioShock {
  id: string;
  name: string;
  description: string;
  /** Sensitivity of the portfolio to the shock, by sector (as a return). */
  sectorImpact: Record<string, number>;
  /** Applied to any sector not listed. */
  defaultImpact: number;
  /** Additional impact scaled by portfolio beta. */
  marketMove?: number;
}

export interface ScenarioImpactRow {
  ticker: string;
  name: string;
  sector: string;
  weight: number;
  impact: number;
  contribution: number;
}

export interface ScenarioImpactResult {
  scenario: ScenarioShock;
  rows: ScenarioImpactRow[];
  portfolioImpact: number;
  worst: ScenarioImpactRow | null;
  best: ScenarioImpactRow | null;
}

export function applyScenario(
  positions: { ticker: string; name: string; sector: string | null; weight: number | null; beta?: number | null }[],
  scenario: ScenarioShock,
): ScenarioImpactResult {
  const rows: ScenarioImpactRow[] = positions.map((p) => {
    const sector = p.sector ?? 'Unclassified';
    const base = scenario.sectorImpact[sector] ?? scenario.defaultImpact;
    const betaPart =
      isNum(scenario.marketMove) && isNum(p.beta) ? (scenario.marketMove as number) * (p.beta as number) : 0;
    const impact = base + betaPart;
    const weight = isNum(p.weight) ? (p.weight as number) : 0;
    return { ticker: p.ticker, name: p.name, sector, weight, impact, contribution: weight * impact };
  });
  const portfolioImpact = rows.reduce((s, r) => s + r.contribution, 0);
  const sorted = rows.slice().sort((a, b) => a.contribution - b.contribution);
  return {
    scenario,
    rows: rows.sort((a, b) => a.contribution - b.contribution),
    portfolioImpact,
    worst: sorted[0] ?? null,
    best: sorted[sorted.length - 1] ?? null,
  };
}

export { safeDiv };
