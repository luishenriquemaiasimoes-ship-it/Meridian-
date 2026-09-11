import { isNum, safeDiv, sum } from './core';

/* =====================  PORTFOLIO ANALYTICS  ===================== */

export interface PositionInput {
  id: string;
  ticker: string;
  name: string;
  sector: string | null;
  industry?: string | null;
  country: string | null;
  currency: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number | null;
  previousClose?: number | null;
  fxRate?: number;              // to portfolio base currency
  /** Fundamentals for portfolio-level look-through valuation. */
  pe?: number | null;
  evEbitda?: number | null;
  fcfYield?: number | null;
  roic?: number | null;
  revenueGrowth?: number | null;
  ebitdaMargin?: number | null;
  netDebtToEbitda?: number | null;
  dividendYield?: number | null;
  beta?: number | null;
  marketCap?: number | null;
  targetPrice?: number | null;
  thesisStatus?: string | null;
  conviction?: string | null;
}

export interface PositionResult extends PositionInput {
  costBasis: number;
  marketValue: number | null;
  weight: number | null;
  unrealizedPnl: number | null;
  unrealizedPnlPct: number | null;
  dailyChange: number | null;
  dailyChangePct: number | null;
  dailyPnl: number | null;
  upsideToTarget: number | null;
}

export interface PortfolioSummary {
  positions: PositionResult[];
  cash: number;
  totalMarketValue: number | null;
  /** What the positions cost, plus cash: the capital put into the book. */
  totalCostBasis: number;
  /** Market value of the positions alone, excluding cash. */
  investedValue: number | null;
  unrealizedPnl: number | null;
  unrealizedPnlPct: number | null;
  dailyPnl: number | null;
  dailyPnlPct: number | null;
  positionCount: number;
  baseCurrency: string;
}

export function buildPortfolio(
  positions: PositionInput[],
  cash: number,
  baseCurrency = 'BRL',
): PortfolioSummary {
  const withValues = positions.map((p) => {
    const fx = isNum(p.fxRate) ? (p.fxRate as number) : 1;
    const costBasis = p.quantity * p.averagePrice * fx;
    const marketValue = isNum(p.currentPrice) ? p.quantity * (p.currentPrice as number) * fx : null;
    const unrealizedPnl = isNum(marketValue) ? (marketValue as number) - costBasis : null;
    const dailyChange =
      isNum(p.currentPrice) && isNum(p.previousClose)
        ? (p.currentPrice as number) - (p.previousClose as number)
        : null;
    const dailyChangePct =
      isNum(dailyChange) && isNum(p.previousClose) && (p.previousClose as number) !== 0
        ? (dailyChange as number) / (p.previousClose as number)
        : null;
    return { p, costBasis, marketValue, unrealizedPnl, dailyChange, dailyChangePct, fx };
  });

  const investedValue = withValues.some((x) => isNum(x.marketValue))
    ? withValues.reduce((s, x) => s + (isNum(x.marketValue) ? (x.marketValue as number) : 0), 0)
    : null;
  const totalMarketValue = isNum(investedValue) ? (investedValue as number) + cash : null;
  const totalCostBasis = withValues.reduce((s, x) => s + x.costBasis, 0) + cash;

  const results: PositionResult[] = withValues.map(({ p, costBasis, marketValue, unrealizedPnl, dailyChange, dailyChangePct, fx }) => ({
    ...p,
    costBasis,
    marketValue,
    weight: safeDiv(marketValue, totalMarketValue),
    unrealizedPnl,
    unrealizedPnlPct: safeDiv(unrealizedPnl, costBasis),
    dailyChange,
    dailyChangePct,
    dailyPnl: isNum(dailyChange) ? (dailyChange as number) * p.quantity * fx : null,
    upsideToTarget:
      isNum(p.targetPrice) && isNum(p.currentPrice) && (p.currentPrice as number) > 0
        ? (p.targetPrice as number) / (p.currentPrice as number) - 1
        : null,
  }));

  const unrealizedPnl = results.some((r) => isNum(r.unrealizedPnl))
    ? results.reduce((s, r) => s + (isNum(r.unrealizedPnl) ? (r.unrealizedPnl as number) : 0), 0)
    : null;
  const dailyPnl = results.some((r) => isNum(r.dailyPnl))
    ? results.reduce((s, r) => s + (isNum(r.dailyPnl) ? (r.dailyPnl as number) : 0), 0)
    : null;

  const investedCost = totalCostBasis - cash;

  return {
    positions: results,
    cash,
    totalMarketValue,
    totalCostBasis,
    investedValue,
    unrealizedPnl,
    unrealizedPnlPct: investedCost !== 0 ? safeDiv(unrealizedPnl, investedCost) : null,
    dailyPnl,
    dailyPnlPct:
      isNum(dailyPnl) && isNum(totalMarketValue) && (totalMarketValue as number) !== 0
        ? (dailyPnl as number) / ((totalMarketValue as number) - (dailyPnl as number))
        : null,
    positionCount: results.length,
    baseCurrency,
  };
}

/* --------------------------- Attribution --------------------------- */

export interface ContributionRow {
  key: string;
  label: string;
  weight: number | null;
  return: number | null;
  contribution: number | null;
  marketValue: number | null;
  pnl: number | null;
}

/**
 * Contribution to return: weight x return, using the beginning-of-period weight
 * implied by cost basis. Rows sum to the portfolio return on invested capital.
 */
export function contributionByPosition(summary: PortfolioSummary): ContributionRow[] {
  const investedCost = summary.totalCostBasis - summary.cash;
  return summary.positions
    .map((p) => {
      const w = investedCost !== 0 ? p.costBasis / investedCost : null;
      const r = p.unrealizedPnlPct;
      return {
        key: p.ticker,
        label: p.name,
        weight: w,
        return: r,
        contribution: isNum(w) && isNum(r) ? (w as number) * (r as number) : null,
        marketValue: p.marketValue,
        pnl: p.unrealizedPnl,
      };
    })
    .sort((a, b) => (b.contribution ?? -Infinity) - (a.contribution ?? -Infinity));
}

export function groupContribution(
  rows: ContributionRow[],
  positions: PositionResult[],
  dimension: 'sector' | 'country' | 'currency' | 'industry',
): ContributionRow[] {
  const map = new Map<string, { weight: number; contribution: number; mv: number; pnl: number; any: boolean }>();
  rows.forEach((row) => {
    const pos = positions.find((p) => p.ticker === row.key);
    const key = (pos?.[dimension] as string | null | undefined) ?? 'Unclassified';
    const cur = map.get(key) ?? { weight: 0, contribution: 0, mv: 0, pnl: 0, any: false };
    cur.weight += isNum(row.weight) ? (row.weight as number) : 0;
    cur.contribution += isNum(row.contribution) ? (row.contribution as number) : 0;
    cur.mv += isNum(row.marketValue) ? (row.marketValue as number) : 0;
    cur.pnl += isNum(row.pnl) ? (row.pnl as number) : 0;
    cur.any = cur.any || isNum(row.contribution);
    map.set(key, cur);
  });
  return Array.from(map.entries())
    .map(([key, v]) => ({
      key,
      label: key,
      weight: v.weight,
      return: v.weight !== 0 ? v.contribution / v.weight : null,
      contribution: v.any ? v.contribution : null,
      marketValue: v.mv,
      pnl: v.pnl,
    }))
    .sort((a, b) => (b.contribution ?? -Infinity) - (a.contribution ?? -Infinity));
}

/* ---------------------------- Exposure ----------------------------- */

export interface ExposureRow {
  key: string;
  label: string;
  marketValue: number;
  weight: number;
  count: number;
}

export function exposureBy(
  summary: PortfolioSummary,
  dimension: 'sector' | 'country' | 'currency' | 'industry' | 'marketCapBucket',
): ExposureRow[] {
  const total = summary.investedValue ?? 0;
  const map = new Map<string, { mv: number; count: number }>();
  for (const p of summary.positions) {
    let key: string;
    if (dimension === 'marketCapBucket') key = marketCapBucket(p.marketCap);
    else key = (p[dimension] as string | null | undefined) ?? 'Unclassified';
    const mv = isNum(p.marketValue) ? (p.marketValue as number) : 0;
    const cur = map.get(key) ?? { mv: 0, count: 0 };
    cur.mv += mv;
    cur.count += 1;
    map.set(key, cur);
  }
  return Array.from(map.entries())
    .map(([key, v]) => ({
      key,
      label: key,
      marketValue: v.mv,
      weight: total !== 0 ? v.mv / total : 0,
      count: v.count,
    }))
    .sort((a, b) => b.marketValue - a.marketValue);
}

export function marketCapBucket(marketCap: number | null | undefined): string {
  if (!isNum(marketCap)) return 'Unclassified';
  const v = marketCap as number;
  if (v >= 200e9) return 'Mega (>200bn)';
  if (v >= 50e9) return 'Large (50–200bn)';
  if (v >= 10e9) return 'Mid (10–50bn)';
  if (v >= 2e9) return 'Small (2–10bn)';
  return 'Micro (<2bn)';
}

export interface ConcentrationResult {
  top1: number | null;
  top5: number | null;
  top10: number | null;
  hhi: number | null;
  effectiveNumberOfPositions: number | null;
  positionCount: number;
}

/** Herfindahl-Hirschman index over position weights (0–1 scale). */
export function concentration(summary: PortfolioSummary): ConcentrationResult {
  const weights = summary.positions
    .map((p) => p.weight)
    .filter(isNum)
    .slice()
    .sort((a, b) => b - a);
  if (!weights.length) {
    return { top1: null, top5: null, top10: null, hhi: null, effectiveNumberOfPositions: null, positionCount: 0 };
  }
  const take = (n: number) => weights.slice(0, n).reduce((s, w) => s + w, 0);
  const hhi = weights.reduce((s, w) => s + w * w, 0);
  return {
    top1: take(1),
    top5: take(5),
    top10: take(10),
    hhi,
    effectiveNumberOfPositions: hhi > 0 ? 1 / hhi : null,
    positionCount: weights.length,
  };
}

/* --------------------- Look-through valuation ---------------------- */

export type WeightedMetricKey =
  | 'pe' | 'evEbitda' | 'fcfYield' | 'roic' | 'revenueGrowth'
  | 'ebitdaMargin' | 'netDebtToEbitda' | 'dividendYield' | 'beta';

/**
 * Weighted-average portfolio metric. Positions missing the metric are excluded
 * and the remaining weights are renormalised, with coverage reported.
 */
export function weightedMetric(
  summary: PortfolioSummary,
  key: WeightedMetricKey,
): { value: number | null; coverage: number } {
  let wSum = 0;
  let acc = 0;
  let totalW = 0;
  for (const p of summary.positions) {
    const w = isNum(p.weight) ? (p.weight as number) : 0;
    totalW += w;
    const v = p[key];
    if (isNum(v)) {
      wSum += w;
      acc += w * (v as number);
    }
  }
  return { value: wSum > 0 ? acc / wSum : null, coverage: totalW > 0 ? wSum / totalW : 0 };
}

/* ---------------------------- Rebalancing --------------------------- */

export interface RebalanceTarget { ticker: string; targetWeight: number }

export interface RebalanceRow {
  ticker: string;
  name: string;
  currentWeight: number | null;
  targetWeight: number;
  difference: number | null;
  action: 'BUY' | 'SELL' | 'HOLD';
  notionalDelta: number | null;
  shareDelta: number | null;
  currentPrice: number | null;
}

/** Produces recommendations only — MERIDIAN never routes or executes orders. */
export function rebalance(
  summary: PortfolioSummary,
  targets: RebalanceTarget[],
  toleranceBps = 50,
): RebalanceRow[] {
  const total = summary.totalMarketValue ?? 0;
  const tol = toleranceBps / 10000;
  const byTicker = new Map(summary.positions.map((p) => [p.ticker, p]));
  const tickers = new Set<string>([...targets.map((t) => t.ticker), ...summary.positions.map((p) => p.ticker)]);

  return Array.from(tickers).map((ticker): RebalanceRow => {
    const pos = byTicker.get(ticker);
    const target = targets.find((t) => t.ticker === ticker)?.targetWeight ?? 0;
    const current = pos?.weight ?? 0;
    const diff = target - current;
    const notionalDelta = total !== 0 ? diff * total : null;
    const price = pos?.currentPrice ?? null;
    return {
      ticker,
      name: pos?.name ?? ticker,
      currentWeight: current,
      targetWeight: target,
      difference: diff,
      action: Math.abs(diff) <= tol ? 'HOLD' : diff > 0 ? 'BUY' : 'SELL',
      notionalDelta,
      shareDelta: isNum(notionalDelta) && isNum(price) && (price as number) > 0
        ? (notionalDelta as number) / (price as number)
        : null,
      currentPrice: price,
    };
  }).sort((a, b) => Math.abs(b.difference ?? 0) - Math.abs(a.difference ?? 0));
}

export { sum };
