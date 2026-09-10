import { clamp, isNum, mean, percentileRank } from './core';

/* =================  FACTOR SCORING / INVESTMENT SCORE  ================= */

export type FactorKey =
  | 'VALUE' | 'QUALITY' | 'GROWTH' | 'MOMENTUM'
  | 'PROFITABILITY' | 'LOW_LEVERAGE' | 'FCF';

export interface FactorMetricSpec {
  key: string;
  label: string;
  /** true when a *lower* raw value is better (e.g. EV/EBITDA). */
  inverse?: boolean;
  weight: number;
}

export const FACTOR_DEFINITIONS: Record<FactorKey, { label: string; description: string; metrics: FactorMetricSpec[] }> = {
  VALUE: {
    label: 'Value',
    description: 'How cheap the security is versus its own cash generation and book.',
    metrics: [
      { key: 'evEbitda', label: 'EV/EBITDA', inverse: true, weight: 0.35 },
      { key: 'pe', label: 'P/E', inverse: true, weight: 0.25 },
      { key: 'fcfYield', label: 'FCF yield', weight: 0.3 },
      { key: 'pb', label: 'P/B', inverse: true, weight: 0.1 },
    ],
  },
  QUALITY: {
    label: 'Quality',
    description: 'Durability of returns on capital and earnings stability.',
    metrics: [
      { key: 'roic', label: 'ROIC', weight: 0.4 },
      { key: 'ebitdaMargin', label: 'EBITDA margin', weight: 0.2 },
      { key: 'fcfConversion', label: 'FCF conversion', weight: 0.2 },
      { key: 'earningsStability', label: 'Earnings stability', weight: 0.2 },
    ],
  },
  GROWTH: {
    label: 'Growth',
    description: 'Top-line and earnings expansion.',
    metrics: [
      { key: 'revenueGrowth', label: 'Revenue growth', weight: 0.4 },
      { key: 'ebitdaGrowth', label: 'EBITDA growth', weight: 0.35 },
      { key: 'epsGrowth', label: 'EPS growth', weight: 0.25 },
    ],
  },
  MOMENTUM: {
    label: 'Momentum',
    description: 'Price trend over medium horizons.',
    metrics: [
      { key: 'return6m', label: '6M return', weight: 0.5 },
      { key: 'return12m', label: '12M return', weight: 0.5 },
    ],
  },
  PROFITABILITY: {
    label: 'Profitability',
    description: 'Absolute level of returns to shareholders and assets.',
    metrics: [
      { key: 'roe', label: 'ROE', weight: 0.4 },
      { key: 'netMargin', label: 'Net margin', weight: 0.3 },
      { key: 'roa', label: 'ROA', weight: 0.3 },
    ],
  },
  LOW_LEVERAGE: {
    label: 'Low leverage',
    description: 'Balance-sheet resilience.',
    metrics: [
      { key: 'netDebtToEbitda', label: 'Net debt/EBITDA', inverse: true, weight: 0.5 },
      { key: 'interestCoverage', label: 'Interest coverage', weight: 0.3 },
      { key: 'debtToEquity', label: 'Debt/equity', inverse: true, weight: 0.2 },
    ],
  },
  FCF: {
    label: 'Free cash flow',
    description: 'Cash actually available to owners.',
    metrics: [
      { key: 'fcfYield', label: 'FCF yield', weight: 0.4 },
      { key: 'fcfMargin', label: 'FCF margin', weight: 0.3 },
      { key: 'fcfConversion', label: 'FCF conversion', weight: 0.3 },
    ],
  },
};

export interface ScoredMetric {
  key: string;
  label: string;
  raw: number | null;
  percentile: number | null;
  score: number | null;       // 0–10
  weight: number;
  inverse: boolean;
}

export interface FactorScore {
  factor: FactorKey;
  label: string;
  score: number | null;       // 0–10
  coverage: number;           // share of weight with data
  metrics: ScoredMetric[];
}

export type MetricUniverse = Record<string, (number | null)[]>;

/**
 * Cross-sectional scoring: each metric is ranked against the universe, then
 * weighted into a factor score on a 0–10 scale. Metrics without data are
 * excluded and the remaining weights renormalised, with coverage reported so
 * that a thin score is never mistaken for a confident one.
 */
export function scoreFactor(
  factor: FactorKey,
  company: Record<string, number | null | undefined>,
  universe: MetricUniverse,
): FactorScore {
  const def = FACTOR_DEFINITIONS[factor];
  const metrics: ScoredMetric[] = def.metrics.map((m) => {
    const raw = company[m.key];
    const rawNum = isNum(raw) ? (raw as number) : null;
    const pool = universe[m.key] ?? [];
    let pct = rawNum === null ? null : percentileRank(pool, rawNum);
    if (pct !== null && m.inverse) pct = 1 - pct;
    return {
      key: m.key,
      label: m.label,
      raw: rawNum,
      percentile: pct,
      score: pct === null ? null : clamp(pct * 10, 0, 10),
      weight: m.weight,
      inverse: !!m.inverse,
    };
  });

  const scored = metrics.filter((m) => m.score !== null);
  const totalWeight = def.metrics.reduce((s, m) => s + m.weight, 0);
  const usedWeight = scored.reduce((s, m) => s + m.weight, 0);
  const score =
    usedWeight > 0 ? scored.reduce((s, m) => s + (m.score as number) * m.weight, 0) / usedWeight : null;

  return {
    factor,
    label: def.label,
    score,
    coverage: totalWeight > 0 ? usedWeight / totalWeight : 0,
    metrics,
  };
}

export function scoreAllFactors(
  company: Record<string, number | null | undefined>,
  universe: MetricUniverse,
): FactorScore[] {
  return (Object.keys(FACTOR_DEFINITIONS) as FactorKey[]).map((f) => scoreFactor(f, company, universe));
}

/* -------------------------- Investment score -------------------------- */

export interface InvestmentScoreWeights {
  growth: number;
  quality: number;
  valuation: number;
  momentum: number;
  balanceSheet: number;
  capitalAllocation: number;
  catalysts: number;
  risk: number;
}

export const DEFAULT_SCORE_WEIGHTS: InvestmentScoreWeights = {
  growth: 0.15,
  quality: 0.2,
  valuation: 0.2,
  momentum: 0.05,
  balanceSheet: 0.1,
  capitalAllocation: 0.1,
  catalysts: 0.1,
  risk: 0.1,
};

export interface InvestmentScoreComponent {
  key: keyof InvestmentScoreWeights;
  label: string;
  score: number | null;   // 0–100
  weight: number;
  basis: string;
}

export interface InvestmentScoreResult {
  total: number | null;   // 0–100
  components: InvestmentScoreComponent[];
  coverage: number;
  weights: InvestmentScoreWeights;
}

/**
 * Composite 0–100 investment score. Every component states the basis it was
 * computed from so the user can trace the number back to its inputs.
 */
export function investmentScore(
  inputs: {
    factorScores: FactorScore[];
    upside?: number | null;
    catalystCount?: number | null;
    catalystProbabilityAvg?: number | null;
    riskCount?: number | null;
    capitalAllocationScore?: number | null; // 0–10
  },
  weights: InvestmentScoreWeights = DEFAULT_SCORE_WEIGHTS,
): InvestmentScoreResult {
  const f = (k: FactorKey) => inputs.factorScores.find((x) => x.factor === k)?.score ?? null;
  const to100 = (v: number | null) => (isNum(v) ? clamp((v as number) * 10, 0, 100) : null);

  const valuationBase = mean([f('VALUE'), isNum(inputs.upside) ? clamp(5 + (inputs.upside as number) * 12.5, 0, 10) : null]);

  const catalystScore = isNum(inputs.catalystCount)
    ? clamp(
        Math.min(inputs.catalystCount as number, 5) * 1.2 * (isNum(inputs.catalystProbabilityAvg) ? 0.5 + (inputs.catalystProbabilityAvg as number) / 2 : 1),
        0,
        10,
      )
    : null;

  const riskScore = isNum(inputs.riskCount)
    ? clamp(10 - Math.min(inputs.riskCount as number, 8) * 1.1, 0, 10)
    : null;

  const components: InvestmentScoreComponent[] = [
    { key: 'growth', label: 'Growth', score: to100(f('GROWTH')), weight: weights.growth, basis: 'Revenue / EBITDA / EPS growth percentile vs universe' },
    { key: 'quality', label: 'Quality', score: to100(f('QUALITY')), weight: weights.quality, basis: 'ROIC, margins, FCF conversion, earnings stability' },
    { key: 'valuation', label: 'Valuation', score: to100(valuationBase), weight: weights.valuation, basis: 'Value factor percentile blended with DCF upside' },
    { key: 'momentum', label: 'Momentum', score: to100(f('MOMENTUM')), weight: weights.momentum, basis: '6M and 12M price return percentile' },
    { key: 'balanceSheet', label: 'Balance sheet', score: to100(f('LOW_LEVERAGE')), weight: weights.balanceSheet, basis: 'Net debt/EBITDA, coverage, debt/equity' },
    { key: 'capitalAllocation', label: 'Capital allocation', score: to100(inputs.capitalAllocationScore ?? f('FCF')), weight: weights.capitalAllocation, basis: 'FCF generation and deployment discipline' },
    { key: 'catalysts', label: 'Catalysts', score: to100(catalystScore), weight: weights.catalysts, basis: 'Number and probability of tracked catalysts' },
    { key: 'risk', label: 'Risk', score: to100(riskScore), weight: weights.risk, basis: 'Inverse of tracked thesis risks' },
  ];

  const usable = components.filter((c) => isNum(c.score));
  const usedWeight = usable.reduce((s, c) => s + c.weight, 0);
  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  const total = usedWeight > 0 ? usable.reduce((s, c) => s + (c.score as number) * c.weight, 0) / usedWeight : null;

  return {
    total,
    components,
    coverage: totalWeight > 0 ? usedWeight / totalWeight : 0,
    weights,
  };
}

/** Coefficient-of-variation based stability score on 0–1 (higher = steadier). */
export function earningsStability(series: (number | null)[]): number | null {
  const xs = series.filter(isNum) as number[];
  if (xs.length < 3) return null;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  if (m === 0) return null;
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
  const cv = Math.abs(sd / m);
  return clamp(1 / (1 + cv), 0, 1);
}
