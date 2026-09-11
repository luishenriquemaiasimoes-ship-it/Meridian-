import { isNum, median, percentileRank } from './core';

/* ==================================================================
   Where the model sits against everyone else.

   A target price that falls outside the sell-side range is not wrong —
   it is the whole point of doing the work. But it should be a position
   the analyst has taken deliberately, with a reason recorded, not a
   number they discover is an outlier at committee.
   ================================================================== */

export interface ConsensusTarget {
  /** Broker or contributor name. */
  source: string;
  targetPrice: number;
  recommendation?: string | null;
  asOf?: string | null;
}

export interface ConsensusReconciliation {
  targetPrice: number | null;
  currentPrice: number | null;
  count: number;
  low: number | null;
  high: number | null;
  median: number | null;
  mean: number | null;
  /** Where the model's target falls inside the contributed range, 0 to 1. */
  percentile: number | null;
  /** ABOVE / WITHIN / BELOW the contributed range. */
  position: 'ABOVE' | 'WITHIN' | 'BELOW' | 'UNAVAILABLE';
  /** Model target against the consensus median, as a proportion. */
  vsMedian: number | null;
  /** Upside the consensus median implies from the current price. */
  consensusUpside: number | null;
  /** Upside the model implies from the current price. */
  modelUpside: number | null;
  /** True when the gap is wide enough to want an explanation. */
  needsRationale: boolean;
  summary: string;
}

const UNAVAILABLE: ConsensusReconciliation = {
  targetPrice: null, currentPrice: null, count: 0, low: null, high: null,
  median: null, mean: null, percentile: null, position: 'UNAVAILABLE',
  vsMedian: null, consensusUpside: null, modelUpside: null,
  needsRationale: false,
  summary: 'No sell-side targets are recorded for this company, so the model cannot be placed against a consensus.',
};

export function reconcileWithConsensus(
  targetPrice: number | null,
  targets: ConsensusTarget[],
  currentPrice: number | null,
  /** Gap beyond which a rationale is requested. Default 15%. */
  rationaleThreshold = 0.15,
): ConsensusReconciliation {
  const values = (targets ?? []).map((t) => t.targetPrice).filter(isNum) as number[];
  if (!values.length || !isNum(targetPrice)) {
    return {
      ...UNAVAILABLE,
      targetPrice: isNum(targetPrice) ? targetPrice : null,
      currentPrice: isNum(currentPrice) ? currentPrice : null,
      count: values.length,
    };
  }

  const sorted = values.slice().sort((a, b) => a - b);
  const low = sorted[0];
  const high = sorted[sorted.length - 1];
  const med = median(sorted);
  const mean = sorted.reduce((s, v) => s + v, 0) / sorted.length;
  const tp = targetPrice as number;

  const position: ConsensusReconciliation['position'] =
    tp > high ? 'ABOVE' : tp < low ? 'BELOW' : 'WITHIN';

  const vsMedian = isNum(med) && (med as number) !== 0 ? tp / (med as number) - 1 : null;
  const consensusUpside = isNum(med) && isNum(currentPrice) && (currentPrice as number) > 0
    ? (med as number) / (currentPrice as number) - 1
    : null;
  const modelUpside = isNum(currentPrice) && (currentPrice as number) > 0
    ? tp / (currentPrice as number) - 1
    : null;

  const needsRationale = isNum(vsMedian) && Math.abs(vsMedian as number) > rationaleThreshold;

  const pct = (v: number | null) => (isNum(v) ? `${((v as number) * 100).toFixed(1)}%` : 'unavailable');
  const summary =
    position === 'WITHIN'
      ? `The model's target sits inside the contributed range of ${low.toFixed(2)} to ${high.toFixed(2)}, ${pct(vsMedian)} against the median of ${(med as number).toFixed(2)}.`
      : position === 'ABOVE'
        ? `The model's target of ${tp.toFixed(2)} is above every contributed target; the highest is ${high.toFixed(2)}. That is a position, and it needs a reason.`
        : `The model's target of ${tp.toFixed(2)} is below every contributed target; the lowest is ${low.toFixed(2)}. That is a position, and it needs a reason.`;

  return {
    targetPrice: tp,
    currentPrice: isNum(currentPrice) ? currentPrice : null,
    count: sorted.length,
    low,
    high,
    median: med,
    mean,
    percentile: percentileRank(sorted, tp),
    position,
    vsMedian,
    consensusUpside,
    modelUpside,
    needsRationale,
    summary,
  };
}

/* ------------------- Premise against what was reported ------------------ */

export type PremiseKey =
  | 'revenueGrowth' | 'ebitdaMargin' | 'ebitMargin' | 'daPctRevenue'
  | 'capexPctRevenue' | 'nwcPctRevenue' | 'taxRate';

export interface PremiseCheck {
  key: PremiseKey;
  label: string;
  /** What the model assumes for the year the period falls in. */
  assumed: number | null;
  /** What the company actually reported. */
  actual: number | null;
  /** actual − assumed, in the unit of the measure. */
  deviation: number | null;
  /** Deviation in basis points, for rates and margins. */
  deviationBps: number | null;
  /** The period the actual came from. */
  period: string;
  status: 'ON_TRACK' | 'ABOVE' | 'BELOW' | 'UNAVAILABLE';
}

export interface PremiseValidation {
  checks: PremiseCheck[];
  /** Periods in a row where the same measure has been outside tolerance. */
  persistentBreaches: { key: PremiseKey; label: string; periods: number; averageBps: number }[];
  summary: string;
}

const PREMISE_LABELS: Record<PremiseKey, string> = {
  revenueGrowth: 'Revenue growth',
  ebitdaMargin: 'EBITDA margin',
  ebitMargin: 'EBIT margin',
  daPctRevenue: 'D&A % of revenue',
  capexPctRevenue: 'Capex % of revenue',
  nwcPctRevenue: 'Working capital % of revenue',
  taxRate: 'Effective tax rate',
};

/**
 * Compares each model premise against what the company actually reported,
 * period by period. A premise is not wrong because one quarter missed it; it
 * is wrong when it keeps missing in the same direction.
 */
export function validatePremises(
  assumed: Partial<Record<PremiseKey, number | null>>,
  actualsByPeriod: { period: string; values: Partial<Record<PremiseKey, number | null>> }[],
  /** Tolerance in basis points before a period counts as a breach. Default 100. */
  toleranceBps = 100,
): PremiseValidation {
  const keys = Object.keys(PREMISE_LABELS) as PremiseKey[];
  const latest = actualsByPeriod[actualsByPeriod.length - 1];

  const checks: PremiseCheck[] = keys.map((key) => {
    const a = assumed[key];
    const actual = latest?.values[key] ?? null;
    const deviation = isNum(a) && isNum(actual) ? (actual as number) - (a as number) : null;
    const bps = isNum(deviation) ? (deviation as number) * 10_000 : null;
    const status: PremiseCheck['status'] = !isNum(deviation)
      ? 'UNAVAILABLE'
      : Math.abs(bps as number) <= toleranceBps
        ? 'ON_TRACK'
        : (deviation as number) > 0 ? 'ABOVE' : 'BELOW';
    return {
      key,
      label: PREMISE_LABELS[key],
      assumed: isNum(a) ? a : null,
      actual: isNum(actual) ? actual : null,
      deviation,
      deviationBps: bps,
      period: latest?.period ?? '—',
      status,
    };
  });

  // A run of periods breaching in the same direction is the signal worth acting on.
  const persistentBreaches: PremiseValidation['persistentBreaches'] = [];
  for (const key of keys) {
    const a = assumed[key];
    if (!isNum(a)) continue;
    let run = 0;
    let sum = 0;
    let direction = 0;
    for (let i = actualsByPeriod.length - 1; i >= 0; i--) {
      const actual = actualsByPeriod[i].values[key];
      if (!isNum(actual)) break;
      const bps = ((actual as number) - (a as number)) * 10_000;
      if (Math.abs(bps) <= toleranceBps) break;
      const thisDirection = bps > 0 ? 1 : -1;
      if (direction === 0) direction = thisDirection;
      else if (thisDirection !== direction) break;
      run += 1;
      sum += bps;
    }
    if (run >= 2) {
      persistentBreaches.push({
        key,
        label: PREMISE_LABELS[key],
        periods: run,
        averageBps: sum / run,
      });
    }
  }

  const breached = checks.filter((c) => c.status === 'ABOVE' || c.status === 'BELOW');
  const summary = !latest
    ? 'No reported period is available to check the premises against.'
    : breached.length === 0
      ? `Every premise with data is within ${toleranceBps} bps of what ${latest.period} reported.`
      : `${breached.length} premise${breached.length === 1 ? '' : 's'} missed by more than ${toleranceBps} bps in ${latest.period}: ${breached.map((c) => c.label.toLowerCase()).join(', ')}.`;

  return { checks, persistentBreaches, summary };
}
