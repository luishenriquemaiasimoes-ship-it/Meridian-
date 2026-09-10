import { describe, expect, it } from 'vitest';
import {
  computeMultiples, historicalMultipleStats, impliedValuation,
  peerStats, peerStatsTable, summarize, type CompanyMultipleInputs,
} from '@/lib/finance/comps';
import { calculateSotp } from '@/lib/finance/sotp';
import { deriveScenarioSet, runScenarios } from '@/lib/finance/scenarios';
import { expectedReturn, valuationBridge } from '@/lib/finance/expectedReturn';

const BASE: CompanyMultipleInputs = {
  ticker: 'ABCD3', name: 'Alpha Beta', price: 20, sharesOutstanding: 100,
  marketCap: null, netDebt: 300, revenue: 1000, ebitda: 250, ebit: 180,
  netIncome: 100, equityBookValue: 700, fcf: 120, dividends: -40,
  revenueGrowth: 0.1, ebitdaGrowth: 0.12, roic: 0.15, roe: 0.14, currency: 'BRL',
};

describe('multiples', () => {
  const m = computeMultiples(BASE);

  it('derives market cap from price x shares', () => expect(m.marketCap).toBe(2000));
  it('derives enterprise value', () => expect(m.enterpriseValue).toBe(2300));
  it('EV/Revenue', () => expect(m.evRevenue).toBeCloseTo(2.3, 10));
  it('EV/EBITDA', () => expect(m.evEbitda).toBeCloseTo(9.2, 10));
  it('EV/EBIT', () => expect(m.evEbit).toBeCloseTo(12.7777778, 6));
  it('P/E', () => expect(m.pe).toBeCloseTo(20, 10));
  it('P/B', () => expect(m.pb).toBeCloseTo(2.8571429, 6));
  it('P/S', () => expect(m.ps).toBeCloseTo(2, 10));
  it('FCF yield', () => expect(m.fcfYield).toBeCloseTo(0.06, 10));
  it('dividend yield uses the absolute payment', () => expect(m.dividendYield).toBeCloseTo(0.02, 10));

  it('adds minority interest to enterprise value', () => {
    expect(computeMultiples({ ...BASE, minorityInterest: 100 }).enterpriseValue).toBe(2400);
  });

  it('suppresses EV/EBITDA when EBITDA is negative', () => {
    expect(computeMultiples({ ...BASE, ebitda: -50 }).evEbitda).toBeNull();
  });

  it('suppresses P/E when the company is loss-making', () => {
    expect(computeMultiples({ ...BASE, netIncome: -20 }).pe).toBeNull();
  });

  it('suppresses P/E on zero earnings rather than returning Infinity', () => {
    expect(computeMultiples({ ...BASE, netIncome: 0 }).pe).toBeNull();
  });

  it('returns nulls when price and market cap are both missing', () => {
    const x = computeMultiples({ ...BASE, price: null, marketCap: null });
    expect(x.marketCap).toBeNull();
    expect(x.enterpriseValue).toBeNull();
    expect(x.evEbitda).toBeNull();
  });

  it('prefers an explicitly supplied market cap', () => {
    expect(computeMultiples({ ...BASE, marketCap: 2500 }).marketCap).toBe(2500);
  });
});

describe('peer statistics', () => {
  const peers = [
    computeMultiples({ ...BASE, ticker: 'A', ebitda: 250 }),   // 9.2x
    computeMultiples({ ...BASE, ticker: 'B', ebitda: 200 }),   // 11.5x
    computeMultiples({ ...BASE, ticker: 'C', ebitda: 400 }),   // 5.75x
    computeMultiples({ ...BASE, ticker: 'D', ebitda: -10 }),   // excluded
  ];

  it('summarises a multiple across peers, excluding unusable values', () => {
    const s = peerStats(peers, 'evEbitda');
    expect(s.count).toBe(3);
    expect(s.min).toBeCloseTo(5.75, 6);
    expect(s.max).toBeCloseTo(11.5, 6);
    expect(s.median).toBeCloseTo(9.2, 6);
    expect(s.mean).toBeCloseTo((9.2 + 11.5 + 5.75) / 3, 6);
  });

  it('reports quartiles', () => {
    const s = summarize([1, 2, 3, 4, 5]);
    expect(s.p25).toBeCloseTo(2, 10);
    expect(s.p75).toBeCloseTo(4, 10);
  });

  it('handles an empty peer set', () => {
    const s = summarize([null, null]);
    expect(s.count).toBe(0);
    expect(s.median).toBeNull();
  });

  it('builds a statistics table over several keys', () => {
    const t = peerStatsTable(peers, ['evEbitda', 'pe']);
    expect(Object.keys(t)).toEqual(['evEbitda', 'pe']);
    expect(t.pe.count).toBe(4);
  });
});

describe('implied valuation', () => {
  it('EV/EBITDA basis bridges to a share price', () => {
    const r = impliedValuation({
      basis: 'EV_EBITDA', multiple: 8, metric: 250, netDebt: 300,
      sharesOutstanding: 100, currentPrice: 20,
    });
    expect(r.impliedEnterpriseValue).toBe(2000);
    expect(r.impliedEquityValue).toBe(1700);
    expect(r.impliedSharePrice).toBe(17);
    expect(r.upside).toBeCloseTo(-0.15, 10);
  });

  it('P/E basis produces equity value directly', () => {
    const r = impliedValuation({ basis: 'PE', multiple: 12, metric: 100, netDebt: 300, sharesOutstanding: 100, currentPrice: 10 });
    expect(r.equityBased).toBe(true);
    expect(r.impliedEnterpriseValue).toBeNull();
    expect(r.impliedEquityValue).toBe(1200);
    expect(r.impliedSharePrice).toBe(12);
    expect(r.upside).toBeCloseTo(0.2, 10);
  });

  it('nets minority interest on an EV basis', () => {
    const r = impliedValuation({ basis: 'EV_EBITDA', multiple: 8, metric: 250, netDebt: 300, minorityInterest: 200, sharesOutstanding: 100 });
    expect(r.impliedEquityValue).toBe(1500);
  });

  it('returns nulls with a missing metric', () => {
    const r = impliedValuation({ basis: 'EV_EBITDA', multiple: 8, metric: null, netDebt: 300, sharesOutstanding: 100 });
    expect(r.impliedSharePrice).toBeNull();
    expect(r.upside).toBeNull();
  });

  it('returns null price with zero shares', () => {
    const r = impliedValuation({ basis: 'EV_EBITDA', multiple: 8, metric: 250, netDebt: 300, sharesOutstanding: 0 });
    expect(r.impliedSharePrice).toBeNull();
  });
});

describe('historical valuation context', () => {
  const points = [
    { date: '2020-12-31', value: 6 },
    { date: '2021-12-31', value: 8 },
    { date: '2022-12-31', value: 10 },
    { date: '2023-12-31', value: 9 },
    { date: '2024-12-31', value: 7 },
    { date: '2025-06-30', value: 5.5 },
  ];

  it('summarises the five-year window', () => {
    const s = historicalMultipleStats(points);
    expect(s.current).toBe(5.5);
    expect(s.min5y).toBe(5.5);
    expect(s.max5y).toBe(10);
    expect(s.observations).toBe(6);
  });

  it('places the current multiple in its own range', () => {
    const s = historicalMultipleStats(points);
    expect(s.percentileIn5y).not.toBeNull();
    expect(s.percentileIn5y as number).toBeLessThan(0.2);
  });

  it('reports the discount to the five-year median', () => {
    const s = historicalMultipleStats(points);
    expect(s.discountToMedian5y as number).toBeLessThan(0);
  });

  it('handles an empty history', () => {
    const s = historicalMultipleStats([]);
    expect(s.current).toBeNull();
    expect(s.percentileIn5y).toBeNull();
    expect(s.observations).toBe(0);
  });
});

describe('sum of the parts', () => {
  const input = {
    segments: [
      { id: '1', name: 'Iron Ore', revenue: 600, ebitda: 300, multiple: 5 },
      { id: '2', name: 'Base Metals', revenue: 250, ebitda: 80, multiple: 7 },
      { id: '3', name: 'Logistics', revenue: 150, ebitda: 60, multiple: 9, ownership: 0.5 },
    ],
    corporateCosts: 40,
    corporateMultiple: 6,
    netDebt: 500,
    sharesOutstanding: 100,
    currentPrice: 18,
  };

  it('values each segment and totals enterprise value', () => {
    const r = calculateSotp(input);
    expect(r.segments[0].enterpriseValue).toBe(1500);
    expect(r.segments[1].enterpriseValue).toBe(560);
    expect(r.segments[2].enterpriseValue).toBe(540);
    expect(r.segments[2].attributableEv).toBe(270);
    expect(r.corporateEv).toBe(-240);
    expect(r.totalEnterpriseValue).toBe(1500 + 560 + 270 - 240);
  });

  it('bridges to an implied share price', () => {
    const r = calculateSotp(input);
    expect(r.equityValue).toBe(2090 - 500);
    expect(r.impliedSharePrice).toBeCloseTo(15.9, 8);
    expect(r.upside).toBeCloseTo(15.9 / 18 - 1, 8);
  });

  it('reports each segment share of enterprise value', () => {
    const r = calculateSotp(input);
    const total = r.segments.reduce((s, x) => s + (x.pctOfTotalEv ?? 0), 0);
    expect(total).toBeGreaterThan(1); // corporate costs are negative, so segments exceed 100%
    expect(r.segments[0].pctOfTotalEv as number).toBeGreaterThan(0.5);
  });

  it('supports a revenue-multiple segment', () => {
    const r = calculateSotp({ ...input, segments: [{ id: '1', name: 'SaaS', revenue: 200, ebitda: null, multiple: 4, method: 'EV_REVENUE' }] });
    expect(r.segments[0].enterpriseValue).toBe(800);
  });

  it('supports a book-value segment', () => {
    const r = calculateSotp({ ...input, segments: [{ id: '1', name: 'Stake', revenue: null, ebitda: null, multiple: null, method: 'BOOK', bookValue: 350 }] });
    expect(r.segments[0].enterpriseValue).toBe(350);
  });

  it('returns nulls when no segment can be valued', () => {
    const r = calculateSotp({ ...input, segments: [{ id: '1', name: 'X', revenue: null, ebitda: null, multiple: null }], corporateCosts: null, corporateMultiple: null });
    expect(r.totalEnterpriseValue).toBeNull();
    expect(r.impliedSharePrice).toBeNull();
  });
});

describe('bull / base / bear scenarios', () => {
  const base = {
    baseYear: 2024, baseRevenue: 1000, baseNwc: 100,
    revenueGrowth: [0.08, 0.08, 0.07, 0.06, 0.05],
    ebitdaMargin: [0.28, 0.28, 0.28, 0.28, 0.28],
    daPctRevenue: [0.07], capexPctRevenue: [0.07], nwcPctRevenue: [0.1],
    taxRate: 0.34, wacc: 0.12, terminalMethod: 'GORDON' as const,
    terminalGrowth: 0.03, exitMultiple: 7, netDebt: 300, sharesOutstanding: 100,
  };

  it('orders bull above base above bear', () => {
    const a = runScenarios(deriveScenarioSet(base), 20);
    const bull = a.scenarios.find((s) => s.key === 'BULL')!.fairValue as number;
    const mid = a.scenarios.find((s) => s.key === 'BASE')!.fairValue as number;
    const bear = a.scenarios.find((s) => s.key === 'BEAR')!.fairValue as number;
    expect(bull).toBeGreaterThan(mid);
    expect(mid).toBeGreaterThan(bear);
  });

  it('computes a probability-weighted expected value', () => {
    const a = runScenarios(deriveScenarioSet(base, { probabilities: { bull: 0.3, base: 0.5, bear: 0.2 } }), 20);
    const manual =
      (a.scenarios[0].fairValue as number) * 0.3 +
      (a.scenarios[1].fairValue as number) * 0.5 +
      (a.scenarios[2].fairValue as number) * 0.2;
    expect(a.expectedValue).toBeCloseTo(manual, 6);
    expect(a.probabilitiesValid).toBe(true);
  });

  it('flags probabilities that do not sum to one', () => {
    const a = runScenarios(deriveScenarioSet(base, { probabilities: { bull: 0.5, base: 0.5, bear: 0.3 } }), 20);
    expect(a.probabilitiesValid).toBe(false);
  });

  it('computes risk-reward against the current price', () => {
    const a = runScenarios(deriveScenarioSet(base), 20);
    expect(a.riskReward).not.toBeNull();
    expect(a.dispersion as number).toBeGreaterThan(0);
  });

  it('returns null expected upside without a price', () => {
    const a = runScenarios(deriveScenarioSet(base), null);
    expect(a.expectedUpside).toBeNull();
  });
});

describe('valuation bridge and expected return', () => {
  it('decomposes expected return into its drivers', () => {
    const b = valuationBridge({
      currentPrice: 100, earningsGrowth: 0.1, currentMultiple: 10,
      exitMultiple: 12, dividendYield: 0.04, shareCountChange: -0.02, years: 3,
    });
    expect(b.earningsGrowthContribution as number).toBeGreaterThan(0);
    expect(b.multipleChangeContribution as number).toBeGreaterThan(0);
    expect(b.dilutionContribution as number).toBeGreaterThan(0); // buyback is accretive
    expect(b.dividendContribution).toBeCloseTo(12, 6);
    expect(b.annualizedReturn as number).toBeGreaterThan(0.1);
  });

  it('charges de-rating against the return', () => {
    const b = valuationBridge({
      currentPrice: 100, earningsGrowth: 0.1, currentMultiple: 12,
      exitMultiple: 9, dividendYield: 0, shareCountChange: 0, years: 3,
    });
    expect(b.multipleChangeContribution as number).toBeLessThan(0);
  });

  it('penalises dilution', () => {
    const b = valuationBridge({
      currentPrice: 100, earningsGrowth: 0, currentMultiple: 10,
      exitMultiple: 10, dividendYield: 0, shareCountChange: 0.05, years: 2,
    });
    expect(b.dilutionContribution as number).toBeLessThan(0);
    expect(b.totalReturn as number).toBeLessThan(0);
  });

  it('handles a missing multiple by holding the rating flat', () => {
    const b = valuationBridge({
      currentPrice: 100, earningsGrowth: 0.1, currentMultiple: null,
      exitMultiple: null, dividendYield: 0, shareCountChange: 0, years: 1,
    });
    expect(b.multipleChangeContribution).toBeCloseTo(0, 8);
    expect(b.endPrice).toBeCloseTo(110, 8);
  });

  it('returns nulls for a zero price', () => {
    const b = valuationBridge({ currentPrice: 0, earningsGrowth: 0.1, currentMultiple: 10, exitMultiple: 10, dividendYield: 0, shareCountChange: 0, years: 1 });
    expect(b.totalReturn).toBeNull();
  });

  it('expected return combines appreciation and income', () => {
    const r = expectedReturn({ currentPrice: 20, targetPrice: 26, dividendYield: 0.05, years: 2 });
    expect(r.priceAppreciation).toBeCloseTo(0.3, 10);
    expect(r.totalReturn).toBeCloseTo(0.4, 10);
    expect(r.annualizedReturn).toBeCloseTo(1.4 ** 0.5 - 1, 10);
  });

  it('is null without a target price', () => {
    const r = expectedReturn({ currentPrice: 20, targetPrice: null, dividendYield: 0.05, years: 2 });
    expect(r.totalReturn).toBeNull();
  });

  it('handles a downside target', () => {
    const r = expectedReturn({ currentPrice: 20, targetPrice: 15, dividendYield: 0, years: 1 });
    expect(r.priceAppreciation).toBeCloseTo(-0.25, 10);
  });
});
