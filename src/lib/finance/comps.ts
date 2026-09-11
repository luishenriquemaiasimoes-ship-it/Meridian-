import { isNum, max, mean, median, min, percentile, percentileRank, safeDiv } from './core';

/* =====================  TRADING COMPARABLES  ===================== */

export interface CompanyMultipleInputs {
  ticker: string;
  name: string;
  price: number | null;
  sharesOutstanding: number | null;
  marketCap: number | null;
  netDebt: number | null;
  minorityInterest?: number | null;
  revenue: number | null;
  ebitda: number | null;
  ebit: number | null;
  netIncome: number | null;
  equityBookValue: number | null;
  fcf: number | null;
  dividends: number | null;
  revenueGrowth?: number | null;
  ebitdaGrowth?: number | null;
  ebitdaMargin?: number | null;
  roic?: number | null;
  roe?: number | null;
  netDebtToEbitda?: number | null;
  currency?: string;
}

export interface CompanyMultiples {
  ticker: string;
  name: string;
  marketCap: number | null;
  enterpriseValue: number | null;
  evRevenue: number | null;
  evEbitda: number | null;
  evEbit: number | null;
  pe: number | null;
  pb: number | null;
  ps: number | null;
  fcfYield: number | null;
  dividendYield: number | null;
  revenueGrowth: number | null;
  ebitdaGrowth: number | null;
  ebitdaMargin: number | null;
  roic: number | null;
  roe: number | null;
  netDebtToEbitda: number | null;
}

export function computeMultiples(c: CompanyMultipleInputs): CompanyMultiples {
  const marketCap = isNum(c.marketCap)
    ? c.marketCap
    : isNum(c.price) && isNum(c.sharesOutstanding)
      ? c.price * c.sharesOutstanding
      : null;
  const ev =
    isNum(marketCap) && isNum(c.netDebt)
      ? marketCap + c.netDebt + (isNum(c.minorityInterest) ? c.minorityInterest : 0)
      : null;

  return {
    ticker: c.ticker,
    name: c.name,
    marketCap,
    enterpriseValue: ev,
    evRevenue: safeDiv(ev, c.revenue),
    // Negative EBITDA makes the multiple meaningless rather than merely negative.
    evEbitda: isNum(c.ebitda) && c.ebitda > 0 ? safeDiv(ev, c.ebitda) : null,
    evEbit: isNum(c.ebit) && c.ebit > 0 ? safeDiv(ev, c.ebit) : null,
    pe: isNum(c.netIncome) && c.netIncome > 0 ? safeDiv(marketCap, c.netIncome) : null,
    pb: isNum(c.equityBookValue) && c.equityBookValue > 0 ? safeDiv(marketCap, c.equityBookValue) : null,
    ps: safeDiv(marketCap, c.revenue),
    fcfYield: safeDiv(c.fcf, marketCap),
    dividendYield: safeDiv(isNum(c.dividends) ? Math.abs(c.dividends) : null, marketCap),
    revenueGrowth: c.revenueGrowth ?? null,
    ebitdaGrowth: c.ebitdaGrowth ?? null,
    ebitdaMargin: c.ebitdaMargin ?? safeDiv(c.ebitda, c.revenue),
    roic: c.roic ?? null,
    roe: c.roe ?? null,
    netDebtToEbitda: c.netDebtToEbitda ?? safeDiv(c.netDebt, c.ebitda),
  };
}

export interface StatSummary {
  mean: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  p25: number | null;
  p75: number | null;
  count: number;
}

export function summarize(values: (number | null)[]): StatSummary {
  const xs = values.filter(isNum);
  return {
    mean: mean(xs),
    median: median(xs),
    min: min(xs),
    max: max(xs),
    p25: percentile(xs, 0.25),
    p75: percentile(xs, 0.75),
    count: xs.length,
  };
}

export type MultipleKey = keyof Pick<
  CompanyMultiples,
  'evRevenue' | 'evEbitda' | 'evEbit' | 'pe' | 'pb' | 'ps' | 'fcfYield' | 'dividendYield'
  | 'revenueGrowth' | 'ebitdaGrowth' | 'ebitdaMargin' | 'roic' | 'roe' | 'netDebtToEbitda'
>;

/** Display names for every comparable key, shared by the screens and exports. */
export const MULTIPLE_LABELS: Record<MultipleKey, string> = {
  evRevenue: 'EV / Revenue', evEbitda: 'EV / EBITDA', evEbit: 'EV / EBIT',
  pe: 'P / E', pb: 'P / Book', ps: 'P / Sales',
  fcfYield: 'FCF yield', dividendYield: 'Dividend yield',
  revenueGrowth: 'Revenue growth', ebitdaGrowth: 'EBITDA growth', ebitdaMargin: 'EBITDA margin',
  roic: 'ROIC', roe: 'ROE', netDebtToEbitda: 'Net debt / EBITDA',
};

/** How each comparable key should be rendered. */
export const MULTIPLE_FORMATS: Record<MultipleKey, 'multiple' | 'percent'> = {
  evRevenue: 'multiple', evEbitda: 'multiple', evEbit: 'multiple',
  pe: 'multiple', pb: 'multiple', ps: 'multiple', netDebtToEbitda: 'multiple',
  fcfYield: 'percent', dividendYield: 'percent', revenueGrowth: 'percent',
  ebitdaGrowth: 'percent', ebitdaMargin: 'percent', roic: 'percent', roe: 'percent',
};

export function peerStats(peers: CompanyMultiples[], key: MultipleKey): StatSummary {
  return summarize(peers.map((p) => p[key] as number | null));
}

export function peerStatsTable(peers: CompanyMultiples[], keys: MultipleKey[]): Record<string, StatSummary> {
  const out: Record<string, StatSummary> = {};
  for (const k of keys) out[k] = peerStats(peers, k);
  return out;
}

/* =====================  IMPLIED VALUATION  ===================== */

export type ImpliedBasis = 'EV_EBITDA' | 'EV_EBIT' | 'EV_REVENUE' | 'PE' | 'PB' | 'PS';

export interface ImpliedValuationInput {
  basis: ImpliedBasis;
  multiple: number;
  /** The company's own metric matching the basis. */
  metric: number | null;
  netDebt: number | null;
  minorityInterest?: number;
  sharesOutstanding: number | null;
  currentPrice?: number | null;
}

export interface ImpliedValuationResult {
  basis: ImpliedBasis;
  multiple: number;
  metric: number | null;
  impliedEnterpriseValue: number | null;
  impliedEquityValue: number | null;
  impliedSharePrice: number | null;
  currentPrice: number | null;
  upside: number | null;
  /** True when the basis produces equity value directly (P/E, P/B, P/S). */
  equityBased: boolean;
}

export function impliedValuation(i: ImpliedValuationInput): ImpliedValuationResult {
  const equityBased = i.basis === 'PE' || i.basis === 'PB' || i.basis === 'PS';
  const product = isNum(i.metric) ? i.metric * i.multiple : null;

  const impliedEnterpriseValue = equityBased ? null : product;
  const impliedEquityValue = equityBased
    ? product
    : isNum(product) && isNum(i.netDebt)
      ? product - i.netDebt - (i.minorityInterest ?? 0)
      : null;

  const impliedSharePrice = safeDiv(impliedEquityValue, i.sharesOutstanding);
  const upside =
    isNum(impliedSharePrice) && isNum(i.currentPrice) && (i.currentPrice as number) > 0
      ? (impliedSharePrice as number) / (i.currentPrice as number) - 1
      : null;

  return {
    basis: i.basis,
    multiple: i.multiple,
    metric: i.metric,
    impliedEnterpriseValue,
    impliedEquityValue,
    impliedSharePrice,
    currentPrice: i.currentPrice ?? null,
    upside,
    equityBased,
  };
}

/* =================  HISTORICAL VALUATION CONTEXT  ================= */

export interface HistoricalMultiplePoint { date: string; value: number | null }

export interface HistoricalMultipleStats {
  current: number | null;
  avg5y: number | null;
  median5y: number | null;
  avg10y: number | null;
  median10y: number | null;
  min5y: number | null;
  max5y: number | null;
  percentileIn5y: number | null;
  discountToMedian5y: number | null;
  observations: number;
}

function windowValues(points: HistoricalMultiplePoint[], years: number): number[] {
  if (!points.length) return [];
  const sorted = points.slice().sort((a, b) => a.date.localeCompare(b.date));
  const lastDate = new Date(sorted[sorted.length - 1].date);
  const cutoff = new Date(lastDate);
  cutoff.setFullYear(cutoff.getFullYear() - years);
  return sorted
    .filter((p) => new Date(p.date) >= cutoff)
    .map((p) => p.value)
    .filter(isNum);
}

export function historicalMultipleStats(points: HistoricalMultiplePoint[]): HistoricalMultipleStats {
  const sorted = points.slice().sort((a, b) => a.date.localeCompare(b.date));
  const current = sorted.length ? sorted[sorted.length - 1].value : null;
  const w5 = windowValues(sorted, 5);
  const w10 = windowValues(sorted, 10);
  const med5 = median(w5);
  return {
    current,
    avg5y: mean(w5),
    median5y: med5,
    avg10y: mean(w10),
    median10y: median(w10),
    min5y: min(w5),
    max5y: max(w5),
    percentileIn5y: percentileRank(w5, current),
    discountToMedian5y:
      isNum(current) && isNum(med5) && med5 !== 0 ? current / med5 - 1 : null,
    observations: sorted.filter((p) => isNum(p.value)).length,
  };
}
