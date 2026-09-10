import { describe, expect, it } from 'vitest';
import {
  applyScenario, beta, alpha, conditionalVar, correlationMatrix, downsideDeviation,
  historicalVar, logReturns, maxDrawdown, parametricVar, performanceStats,
  riskContribution, sharpe, simpleReturns, sortino, trackingStats, volatility, zScore,
} from '@/lib/finance/risk';

const PRICES = [100, 102, 101, 105, 103, 108, 106, 110, 104, 112];

describe('returns', () => {
  it('computes simple returns', () => {
    const r = simpleReturns([100, 110, 99]);
    expect(r[0]).toBeCloseTo(0.1, 10);
    expect(r[1]).toBeCloseTo(-0.1, 10);
  });
  it('computes log returns', () => {
    const r = logReturns([100, 110]);
    expect(r[0]).toBeCloseTo(Math.log(1.1), 10);
  });
  it('skips zero and negative prices', () => {
    expect(simpleReturns([0, 100])).toHaveLength(0);
    expect(logReturns([-5, 100])).toHaveLength(0);
  });
  it('returns nothing for a single observation', () => {
    expect(simpleReturns([100])).toHaveLength(0);
  });
});

describe('volatility and beta', () => {
  const rets = simpleReturns(PRICES);

  it('annualises the standard deviation', () => {
    const v = volatility(rets, 252) as number;
    const daily = volatility(rets, 1) as number;
    expect(v).toBeCloseTo(daily * Math.sqrt(252), 8);
    expect(v).toBeGreaterThan(0);
  });

  it('returns null with fewer than two observations', () => {
    expect(volatility([0.01])).toBeNull();
    expect(volatility([])).toBeNull();
  });

  it('beta of a series against itself is 1', () => {
    expect(beta(rets, rets)).toBeCloseTo(1, 10);
  });

  it('beta of a doubled series is 2', () => {
    expect(beta(rets.map((r) => r * 2), rets)).toBeCloseTo(2, 10);
  });

  it('beta of an inverted series is negative', () => {
    expect(beta(rets.map((r) => -r), rets)).toBeCloseTo(-1, 10);
  });

  it('beta is null against a flat benchmark', () => {
    expect(beta(rets, rets.map(() => 0))).toBeNull();
  });

  it('beta is null with too few observations', () => {
    expect(beta([0.01], [0.02])).toBeNull();
  });

  it('alpha is zero when the asset is the benchmark', () => {
    expect(alpha(rets, rets, 0)).toBeCloseTo(0, 10);
  });
});

describe('risk-adjusted return', () => {
  const rets = simpleReturns(PRICES);

  it('sharpe rises when the risk-free rate falls', () => {
    const a = sharpe(rets, 0.1, 252) as number;
    const b = sharpe(rets, 0.02, 252) as number;
    expect(b).toBeGreaterThan(a);
  });

  it('sharpe is null for a constant series', () => {
    expect(sharpe([0.01, 0.01, 0.01])).toBeNull();
  });

  it('sharpe is negative when returns trail the risk-free rate', () => {
    const flat = [-0.001, -0.002, 0.0005, -0.0015, 0.0002];
    expect(sharpe(flat, 0.05, 252) as number).toBeLessThan(0);
  });

  it('downside deviation only counts losses', () => {
    expect(downsideDeviation([0.02, 0.03, 0.01], 0)).toBeNull();
    expect(downsideDeviation([-0.02, 0.03, -0.01], 0) as number).toBeGreaterThan(0);
  });

  it('sortino exceeds sharpe when downside is limited', () => {
    const skewed = [0.05, 0.04, -0.005, 0.03, -0.004, 0.06];
    expect(sortino(skewed, 0, 252) as number).toBeGreaterThan(sharpe(skewed, 0, 252) as number);
  });

  it('sortino is null without any downside', () => {
    expect(sortino([0.01, 0.02, 0.03])).toBeNull();
  });
});

describe('drawdown', () => {
  it('finds the deepest peak-to-trough decline', () => {
    const d = maxDrawdown([100, 120, 90, 130, 80, 140]);
    expect(d.maxDrawdown).toBeCloseTo(80 / 130 - 1, 10);
    expect(d.peakIndex).toBe(3);
    expect(d.troughIndex).toBe(4);
    expect(d.recoveryIndex).toBe(5);
  });

  it('is zero for a monotonically rising series', () => {
    expect(maxDrawdown([100, 110, 120]).maxDrawdown).toBe(0);
  });

  it('reports no recovery when the series never regains its peak', () => {
    const d = maxDrawdown([100, 120, 60, 80]);
    expect(d.recoveryIndex).toBeNull();
    expect(d.currentDrawdown).toBeCloseTo(80 / 120 - 1, 10);
  });

  it('returns null for a series that is too short', () => {
    expect(maxDrawdown([100]).maxDrawdown).toBeNull();
  });

  it('produces a drawdown series the same length as the input', () => {
    const d = maxDrawdown(PRICES);
    expect(d.series).toHaveLength(PRICES.length);
  });
});

describe('value at risk', () => {
  const rets = [-0.08, -0.05, -0.03, -0.02, -0.01, 0.005, 0.01, 0.02, 0.03, 0.06];

  it('historical VaR sits in the left tail', () => {
    const v = historicalVar(rets, 0.95) as number;
    expect(v).toBeLessThan(0);
    expect(v).toBeLessThanOrEqual(-0.05);
  });

  it('a higher confidence level implies a deeper loss', () => {
    expect(historicalVar(rets, 0.99) as number).toBeLessThanOrEqual(historicalVar(rets, 0.9) as number);
  });

  it('CVaR is at least as severe as VaR', () => {
    expect(conditionalVar(rets, 0.95) as number).toBeLessThanOrEqual(historicalVar(rets, 0.95) as number);
  });

  it('is null with too few observations', () => {
    expect(historicalVar([-0.01, 0.02], 0.95)).toBeNull();
    expect(conditionalVar([-0.01], 0.95)).toBeNull();
  });

  it('parametric VaR is negative for a loss-prone series', () => {
    expect(parametricVar(rets, 0.95) as number).toBeLessThan(0);
  });

  it('zScore matches the standard normal quantiles', () => {
    expect(zScore(0.95)).toBeCloseTo(1.6449, 3);
    expect(zScore(0.99)).toBeCloseTo(2.3263, 3);
    expect(zScore(0.5)).toBeCloseTo(0, 6);
  });
});

describe('correlation matrix', () => {
  it('has a unit diagonal and is symmetric', () => {
    const m = correlationMatrix({
      A: [0.01, 0.02, -0.01, 0.03],
      B: [0.02, 0.01, -0.02, 0.04],
      C: [-0.01, -0.02, 0.01, -0.03],
    });
    expect(m.labels).toEqual(['A', 'B', 'C']);
    expect(m.values[0][0]).toBe(1);
    expect(m.values[0][1]).toBeCloseTo(m.values[1][0] as number, 12);
    expect(m.values[0][2]).toBeCloseTo(-1, 6);
  });
});

describe('risk contribution', () => {
  const series = {
    A: [0.01, -0.02, 0.015, 0.005, -0.01, 0.02],
    B: [0.02, -0.01, 0.005, 0.01, -0.02, 0.015],
  };

  it('contributions sum to portfolio volatility', () => {
    const r = riskContribution({ A: 0.6, B: 0.4 }, series);
    const total = r.rows.reduce((s, x) => s + (x.contribution ?? 0), 0);
    expect(total).toBeCloseTo(r.portfolioVolatility as number, 8);
  });

  it('contribution percentages sum to one', () => {
    const r = riskContribution({ A: 0.6, B: 0.4 }, series);
    const total = r.rows.reduce((s, x) => s + (x.contributionPct ?? 0), 0);
    expect(total).toBeCloseTo(1, 8);
  });

  it('returns nothing without usable series', () => {
    const r = riskContribution({ A: 1 }, { A: [0.01] });
    expect(r.rows).toHaveLength(0);
    expect(r.portfolioVolatility).toBeNull();
  });
});

describe('performance statistics', () => {
  it('summarises a value series', () => {
    const s = performanceStats(PRICES, 0, 252);
    expect(s.totalReturn).toBeCloseTo(0.12, 10);
    expect(s.observations).toBe(9);
    expect(s.maxDrawdown as number).toBeLessThan(0);
    expect(s.positivePeriodsPct as number).toBeGreaterThan(0);
    expect(s.bestPeriod as number).toBeGreaterThan(s.worstPeriod as number);
  });

  it('degrades gracefully on a short series', () => {
    const s = performanceStats([100], 0, 252);
    expect(s.totalReturn).toBeNull();
    expect(s.volatility).toBeNull();
  });

  it('computes tracking error and information ratio', () => {
    const port = simpleReturns(PRICES);
    const bench = port.map((r) => r * 0.8);
    const t = trackingStats(port, bench, 252);
    expect(t.trackingError as number).toBeGreaterThan(0);
    expect(t.correlation).toBeCloseTo(1, 8);
    expect(t.informationRatio).not.toBeNull();
  });

  it('tracking stats are null with too little data', () => {
    expect(trackingStats([0.01], [0.02]).trackingError).toBeNull();
  });
});

describe('scenario analysis', () => {
  const positions = [
    { ticker: 'VALE3', name: 'Vale', sector: 'Materials', weight: 0.4, beta: 1.25 },
    { ticker: 'ITUB4', name: 'Itaú', sector: 'Financials', weight: 0.4, beta: 0.95 },
    { ticker: 'WEGE3', name: 'WEG', sector: 'Industrials', weight: 0.2, beta: 0.85 },
  ];

  const shock = {
    id: 'rates', name: 'Selic +300bps',
    description: 'Policy rate shock',
    sectorImpact: { Materials: -0.02, Financials: 0.01, Industrials: -0.06 },
    defaultImpact: -0.04,
    marketMove: -0.03,
  };

  it('applies sector and beta effects to every position', () => {
    const r = applyScenario(positions, shock);
    const vale = r.rows.find((x) => x.ticker === 'VALE3')!;
    expect(vale.impact).toBeCloseTo(-0.02 + -0.03 * 1.25, 10);
    expect(vale.contribution).toBeCloseTo(0.4 * vale.impact, 10);
  });

  it('aggregates to a portfolio impact', () => {
    const r = applyScenario(positions, shock);
    const manual = r.rows.reduce((s, x) => s + x.contribution, 0);
    expect(r.portfolioImpact).toBeCloseTo(manual, 10);
    expect(r.portfolioImpact).toBeLessThan(0);
  });

  it('identifies the worst and best positions', () => {
    const r = applyScenario(positions, shock);
    expect(r.worst!.contribution).toBeLessThanOrEqual(r.best!.contribution);
  });

  it('falls back to the default impact for unmapped sectors', () => {
    const r = applyScenario([{ ticker: 'X', name: 'X', sector: 'Utilities', weight: 1, beta: null }], shock);
    expect(r.rows[0].impact).toBeCloseTo(-0.04, 10);
  });

  it('treats a missing weight as zero exposure', () => {
    const r = applyScenario([{ ticker: 'X', name: 'X', sector: 'Materials', weight: null }], shock);
    expect(r.portfolioImpact).toBe(0);
  });
});
