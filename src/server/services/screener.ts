import { getUniverseMetrics, type CompanyMetrics } from './metrics';
import {
  investmentScore, scoreAllFactors, DEFAULT_SCORE_WEIGHTS,
  type FactorScore, type InvestmentScoreWeights, type MetricUniverse,
} from '@/lib/finance/factors';
import { isNum } from '@/lib/finance/core';

/* ==========================  SCREENING ENGINE  ========================== */

export type Comparator = 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ' | 'BETWEEN';

export interface ScreenFilter {
  metric: ScreenMetric;
  comparator: Comparator;
  value: number;
  value2?: number;
}

export interface ScreenRequest {
  filters: ScreenFilter[];
  sectors?: string[];
  countries?: string[];
  themes?: string[];
  search?: string;
  sortBy?: ScreenMetric | 'ticker' | 'name' | 'investmentScore';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  factorWeights?: Partial<InvestmentScoreWeights>;
}

export const SCREEN_METRICS = {
  marketCap: { label: 'Market cap', format: 'currencyCompact', group: 'Size' },
  enterpriseValue: { label: 'Enterprise value', format: 'currencyCompact', group: 'Size' },
  price: { label: 'Price', format: 'currency', group: 'Size' },
  revenue: { label: 'Revenue', format: 'currencyCompact', group: 'Size' },
  ebitda: { label: 'EBITDA', format: 'currencyCompact', group: 'Size' },
  netIncome: { label: 'Net income', format: 'currencyCompact', group: 'Size' },
  fcf: { label: 'Free cash flow', format: 'currencyCompact', group: 'Size' },

  revenueGrowth: { label: 'Revenue growth', format: 'percent', group: 'Growth' },
  ebitdaGrowth: { label: 'EBITDA growth', format: 'percent', group: 'Growth' },
  epsGrowth: { label: 'EPS growth', format: 'percent', group: 'Growth' },
  revenueCagr3y: { label: 'Revenue CAGR 3Y', format: 'percent', group: 'Growth' },
  revenueCagr5y: { label: 'Revenue CAGR 5Y', format: 'percent', group: 'Growth' },

  grossMargin: { label: 'Gross margin', format: 'percent', group: 'Margins' },
  ebitdaMargin: { label: 'EBITDA margin', format: 'percent', group: 'Margins' },
  ebitMargin: { label: 'EBIT margin', format: 'percent', group: 'Margins' },
  netMargin: { label: 'Net margin', format: 'percent', group: 'Margins' },
  fcfMargin: { label: 'FCF margin', format: 'percent', group: 'Margins' },

  roic: { label: 'ROIC', format: 'percent', group: 'Returns' },
  roe: { label: 'ROE', format: 'percent', group: 'Returns' },
  roa: { label: 'ROA', format: 'percent', group: 'Returns' },
  roce: { label: 'ROCE', format: 'percent', group: 'Returns' },
  roicSpread: { label: 'ROIC − WACC', format: 'percent', group: 'Returns' },

  evEbitda: { label: 'EV / EBITDA', format: 'multiple', group: 'Valuation' },
  evEbit: { label: 'EV / EBIT', format: 'multiple', group: 'Valuation' },
  evRevenue: { label: 'EV / Revenue', format: 'multiple', group: 'Valuation' },
  pe: { label: 'P / E', format: 'multiple', group: 'Valuation' },
  pb: { label: 'P / Book', format: 'multiple', group: 'Valuation' },
  ps: { label: 'P / Sales', format: 'multiple', group: 'Valuation' },
  fcfYield: { label: 'FCF yield', format: 'percent', group: 'Valuation' },
  earningsYield: { label: 'Earnings yield', format: 'percent', group: 'Valuation' },
  dividendYield: { label: 'Dividend yield', format: 'percent', group: 'Valuation' },

  netDebtToEbitda: { label: 'Net debt / EBITDA', format: 'multiple', group: 'Leverage' },
  debtToEquity: { label: 'Debt / Equity', format: 'multiple', group: 'Leverage' },
  interestCoverage: { label: 'Interest coverage', format: 'multiple', group: 'Leverage' },

  return1m: { label: '1M return', format: 'percent', group: 'Price' },
  return3m: { label: '3M return', format: 'percent', group: 'Price' },
  return6m: { label: '6M return', format: 'percent', group: 'Price' },
  return12m: { label: '12M return', format: 'percent', group: 'Price' },
  returnYtd: { label: 'YTD return', format: 'percent', group: 'Price' },
  volatility: { label: 'Volatility (ann.)', format: 'percent', group: 'Price' },
  beta: { label: 'Beta', format: 'ratio', group: 'Price' },

  cashConversionCycle: { label: 'Cash conversion cycle', format: 'days', group: 'Working capital' },
  dso: { label: 'DSO', format: 'days', group: 'Working capital' },
  dio: { label: 'DIO', format: 'days', group: 'Working capital' },
  dpo: { label: 'DPO', format: 'days', group: 'Working capital' },
} as const;

export type ScreenMetric = keyof typeof SCREEN_METRICS;

export const SCREEN_METRIC_LIST = Object.entries(SCREEN_METRICS).map(([key, def]) => ({
  key: key as ScreenMetric, ...def,
}));

function passes(value: number | null, filter: ScreenFilter): boolean {
  if (!isNum(value)) return false; // a company without the datum cannot satisfy the test
  const v = value as number;
  switch (filter.comparator) {
    case 'GT': return v > filter.value;
    case 'GTE': return v >= filter.value;
    case 'LT': return v < filter.value;
    case 'LTE': return v <= filter.value;
    case 'EQ': return Math.abs(v - filter.value) < 1e-9;
    case 'BETWEEN': return v >= filter.value && v <= (filter.value2 ?? filter.value);
    default: return false;
  }
}

export interface ScreenRow {
  metrics: CompanyMetrics;
  factorScores: FactorScore[];
  investmentScore: number | null;
  /** Filters this company failed, so the UI can explain a near-miss. */
  failed: ScreenMetric[];
}

export interface ScreenResult {
  rows: ScreenRow[];
  universeSize: number;
  matched: number;
  excludedForMissingData: number;
  appliedFilters: ScreenFilter[];
}

/** Builds the cross-sectional universe used by the factor scorer. */
export function buildMetricUniverse(all: CompanyMetrics[]): MetricUniverse {
  const keys = [
    'evEbitda', 'pe', 'fcfYield', 'pb', 'roic', 'ebitdaMargin', 'fcfConversion',
    'earningsStability', 'revenueGrowth', 'ebitdaGrowth', 'epsGrowth',
    'netDebtToEbitda', 'interestCoverage', 'debtToEquity', 'roe', 'netMargin', 'roa',
    'fcfMargin', 'return6m', 'return12m',
  ] as const;
  const universe: MetricUniverse = {};
  for (const k of keys) {
    universe[k] = all.map((m) => (m as unknown as Record<string, number | null>)[k] ?? null);
  }
  return universe;
}

export function companyFactorInput(m: CompanyMetrics): Record<string, number | null> {
  return {
    evEbitda: m.evEbitda, pe: m.pe, fcfYield: m.fcfYield, pb: m.pb,
    roic: m.roic, ebitdaMargin: m.ebitdaMargin, fcfConversion: m.fcfConversion,
    earningsStability: m.earningsStability, revenueGrowth: m.revenueGrowth,
    ebitdaGrowth: m.ebitdaGrowth, epsGrowth: m.epsGrowth,
    netDebtToEbitda: m.netDebtToEbitda, interestCoverage: m.interestCoverage,
    debtToEquity: m.debtToEquity, roe: m.roe, netMargin: m.netMargin, roa: m.roa,
    fcfMargin: m.fcfMargin, return6m: m.return6m, return12m: m.return12m,
  };
}

export async function runScreen(request: ScreenRequest): Promise<ScreenResult> {
  const all = await getUniverseMetrics();
  const universe = buildMetricUniverse(all);
  const weights = { ...DEFAULT_SCORE_WEIGHTS, ...(request.factorWeights ?? {}) };

  let candidates = all;
  if (request.sectors?.length) candidates = candidates.filter((m) => request.sectors!.includes(m.sector));
  if (request.countries?.length) candidates = candidates.filter((m) => request.countries!.includes(m.country));
  if (request.themes?.length) {
    candidates = candidates.filter((m) => m.themes.some((t) => request.themes!.includes(t)));
  }
  if (request.search) {
    const q = request.search.toLowerCase();
    candidates = candidates.filter(
      (m) => m.ticker.toLowerCase().includes(q) || m.name.toLowerCase().includes(q),
    );
  }

  let excludedForMissingData = 0;
  const rows: ScreenRow[] = [];
  for (const m of candidates) {
    const record = m as unknown as Record<string, number | null>;
    const failed: ScreenMetric[] = [];
    let missingOnly = true;
    for (const f of request.filters) {
      const value = record[f.metric] ?? null;
      if (!passes(value, f)) {
        failed.push(f.metric);
        if (isNum(value)) missingOnly = false;
      }
    }
    if (failed.length && missingOnly && request.filters.length) excludedForMissingData++;
    if (failed.length) continue;

    const factorScores = scoreAllFactors(companyFactorInput(m), universe);
    const score = investmentScore({ factorScores, upside: null }, weights);
    rows.push({ metrics: m, factorScores, investmentScore: score.total, failed: [] });
  }

  const sortKey = request.sortBy ?? 'marketCap';
  const dir = request.sortDirection ?? 'desc';
  rows.sort((a, b) => {
    let av: number | string | null;
    let bv: number | string | null;
    if (sortKey === 'ticker' || sortKey === 'name') {
      av = a.metrics[sortKey];
      bv = b.metrics[sortKey];
      const cmp = String(av).localeCompare(String(bv));
      return dir === 'asc' ? cmp : -cmp;
    }
    if (sortKey === 'investmentScore') {
      av = a.investmentScore;
      bv = b.investmentScore;
    } else {
      av = (a.metrics as unknown as Record<string, number | null>)[sortKey];
      bv = (b.metrics as unknown as Record<string, number | null>)[sortKey];
    }
    const an = isNum(av) ? (av as number) : dir === 'asc' ? Infinity : -Infinity;
    const bn = isNum(bv) ? (bv as number) : dir === 'asc' ? Infinity : -Infinity;
    return dir === 'asc' ? an - bn : bn - an;
  });

  return {
    rows: request.limit ? rows.slice(0, request.limit) : rows,
    universeSize: all.length,
    matched: rows.length,
    excludedForMissingData,
    appliedFilters: request.filters,
  };
}

/** Factor scores and composite for a single company, in universe context. */
export async function getFactorProfile(
  ticker: string,
  extras: { upside?: number | null; catalystCount?: number | null; catalystProbabilityAvg?: number | null; riskCount?: number | null } = {},
  weights?: Partial<InvestmentScoreWeights>,
) {
  const all = await getUniverseMetrics();
  const m = all.find((x) => x.ticker === ticker.toUpperCase());
  if (!m) return null;
  const universe = buildMetricUniverse(all);
  const factorScores = scoreAllFactors(companyFactorInput(m), universe);
  const score = investmentScore(
    { factorScores, ...extras },
    { ...DEFAULT_SCORE_WEIGHTS, ...(weights ?? {}) },
  );
  return { metrics: m, factorScores, score };
}

/** Sector aggregates used by the sector analysis and competitive-landscape views. */
export interface SectorAggregate {
  sector: string;
  companies: number;
  medianRevenueGrowth: number | null;
  medianEbitdaMargin: number | null;
  medianRoic: number | null;
  medianRoe: number | null;
  medianNetDebtToEbitda: number | null;
  medianEvEbitda: number | null;
  medianPe: number | null;
  totalMarketCap: number | null;
  median12mReturn: number | null;
}

function med(values: (number | null)[]): number | null {
  const xs = values.filter(isNum).slice().sort((a, b) => a - b);
  if (!xs.length) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
}

export async function getSectorAggregates(): Promise<SectorAggregate[]> {
  const all = await getUniverseMetrics();
  const bySector = new Map<string, CompanyMetrics[]>();
  for (const m of all) {
    const list = bySector.get(m.sector) ?? [];
    list.push(m);
    bySector.set(m.sector, list);
  }
  return Array.from(bySector.entries())
    .map(([sector, list]) => ({
      sector,
      companies: list.length,
      medianRevenueGrowth: med(list.map((m) => m.revenueGrowth)),
      medianEbitdaMargin: med(list.map((m) => m.ebitdaMargin)),
      medianRoic: med(list.map((m) => m.roic)),
      medianRoe: med(list.map((m) => m.roe)),
      medianNetDebtToEbitda: med(list.map((m) => m.netDebtToEbitda)),
      medianEvEbitda: med(list.map((m) => m.evEbitda)),
      medianPe: med(list.map((m) => m.pe)),
      totalMarketCap: list.reduce((s, m) => s + (isNum(m.marketCap) ? (m.marketCap as number) : 0), 0),
      median12mReturn: med(list.map((m) => m.return12m)),
    }))
    .sort((a, b) => (b.totalMarketCap ?? 0) - (a.totalMarketCap ?? 0));
}

export const THEMES = [
  { slug: 'ai', label: 'Artificial intelligence', description: 'Compute, platforms and applications monetising machine learning.' },
  { slug: 'energy-transition', label: 'Energy transition', description: 'Electrification, grid investment and transition metals.' },
  { slug: 'brazilian-banks', label: 'Brazilian banks', description: 'Credit cycle, spreads and fee income in Brazil.' },
  { slug: 'commodities', label: 'Commodities', description: 'Producers whose earnings track a benchmark price.' },
  { slug: 'infrastructure', label: 'Infrastructure', description: 'Regulated and concession-based asset owners.' },
  { slug: 'consumer', label: 'Consumer', description: 'Brands and retail exposed to household income.' },
  { slug: 'healthcare', label: 'Health care', description: 'Providers, payors and pharmacy retail.' },
  { slug: 'technology', label: 'Technology', description: 'Software, hardware and platform businesses.' },
];
