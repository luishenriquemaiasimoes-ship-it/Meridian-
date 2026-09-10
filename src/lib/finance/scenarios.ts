import { isNum } from './core';
import { calculateDcf, type DcfAssumptions, type DcfResult } from './dcf';

export type ScenarioKey = 'BULL' | 'BASE' | 'BEAR';

export interface ScenarioDefinition {
  key: ScenarioKey;
  label: string;
  probability: number;          // 0..1
  assumptions: Partial<DcfAssumptions>;
  narrative?: string;
}

export interface ScenarioOutcome {
  key: ScenarioKey;
  label: string;
  probability: number;
  fairValue: number | null;
  upside: number | null;
  enterpriseValue: number | null;
  equityValue: number | null;
  result: DcfResult;
}

export interface ScenarioAnalysis {
  scenarios: ScenarioOutcome[];
  probabilityTotal: number;
  probabilitiesValid: boolean;
  expectedValue: number | null;
  expectedUpside: number | null;
  currentPrice: number | null;
  /** Spread between the bull and bear fair values, as a multiple of price. */
  dispersion: number | null;
  /** Expected value / downside — a crude risk-reward ratio. */
  riskReward: number | null;
}

export function runScenarios(
  defs: ScenarioDefinition[],
  currentPrice: number | null,
): ScenarioAnalysis {
  const scenarios: ScenarioOutcome[] = defs.map((d) => {
    const result = calculateDcf({ ...d.assumptions, currentPrice: currentPrice ?? undefined });
    return {
      key: d.key,
      label: d.label,
      probability: d.probability,
      fairValue: result.fairValuePerShare,
      upside: result.upside,
      enterpriseValue: result.enterpriseValue,
      equityValue: result.equityValue,
      result,
    };
  });

  const probabilityTotal = scenarios.reduce((s, x) => s + (isNum(x.probability) ? x.probability : 0), 0);
  const probabilitiesValid = Math.abs(probabilityTotal - 1) < 0.005;

  const weighted = scenarios.filter((s) => isNum(s.fairValue));
  const wTotal = weighted.reduce((s, x) => s + x.probability, 0);
  const expectedValue =
    weighted.length && wTotal > 0
      ? weighted.reduce((s, x) => s + (x.fairValue as number) * x.probability, 0) / wTotal
      : null;

  const expectedUpside =
    isNum(expectedValue) && isNum(currentPrice) && (currentPrice as number) > 0
      ? (expectedValue as number) / (currentPrice as number) - 1
      : null;

  const bull = scenarios.find((s) => s.key === 'BULL')?.fairValue ?? null;
  const bear = scenarios.find((s) => s.key === 'BEAR')?.fairValue ?? null;
  const dispersion =
    isNum(bull) && isNum(bear) && isNum(currentPrice) && (currentPrice as number) > 0
      ? ((bull as number) - (bear as number)) / (currentPrice as number)
      : null;

  const riskReward =
    isNum(bull) && isNum(bear) && isNum(currentPrice) && (currentPrice as number) > 0
      ? (() => {
          const up = (bull as number) - (currentPrice as number);
          const down = (currentPrice as number) - (bear as number);
          return down > 0 ? up / down : null;
        })()
      : null;

  return {
    scenarios,
    probabilityTotal,
    probabilitiesValid,
    expectedValue,
    expectedUpside,
    currentPrice,
    dispersion,
    riskReward,
  };
}

/** Derives bull / bear cases from a base case by shifting the key drivers. */
export function deriveScenarioSet(
  base: Partial<DcfAssumptions>,
  opts: {
    growthDelta?: number;   // absolute, e.g. 0.03 = +300bps of revenue growth
    marginDelta?: number;   // absolute, e.g. 0.02 = +200bps of EBITDA margin
    waccDelta?: number;     // absolute, e.g. 0.01 = +100bps
    terminalGrowthDelta?: number;
    probabilities?: { bull: number; base: number; bear: number };
  } = {},
): ScenarioDefinition[] {
  const g = opts.growthDelta ?? 0.03;
  const m = opts.marginDelta ?? 0.02;
  const w = opts.waccDelta ?? 0.01;
  const tg = opts.terminalGrowthDelta ?? 0.005;
  const p = opts.probabilities ?? { bull: 0.25, base: 0.5, bear: 0.25 };

  const shift = (dir: 1 | -1): Partial<DcfAssumptions> => ({
    ...base,
    revenueGrowth: (base.revenueGrowth ?? []).map((x) => x + dir * g),
    ebitdaMargin: (base.ebitdaMargin ?? []).map((x) => Math.max(0.01, x + dir * m)),
    wacc: (base.wacc ?? 0.11) - dir * w,
    terminalGrowth: (base.terminalGrowth ?? 0.03) + dir * tg,
  });

  return [
    { key: 'BULL', label: 'Bull', probability: p.bull, assumptions: shift(1) },
    { key: 'BASE', label: 'Base', probability: p.base, assumptions: base },
    { key: 'BEAR', label: 'Bear', probability: p.bear, assumptions: shift(-1) },
  ];
}
