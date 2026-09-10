import { describe, expect, it } from 'vitest';
import {
  buildPortfolio, concentration, contributionByPosition, exposureBy,
  groupContribution, marketCapBucket, rebalance, weightedMetric,
  type PositionInput,
} from '@/lib/finance/portfolio';

const POSITIONS: PositionInput[] = [
  {
    id: '1', ticker: 'VALE3', name: 'Vale', sector: 'Materials', country: 'Brazil',
    currency: 'BRL', quantity: 1000, averagePrice: 60, currentPrice: 66, previousClose: 65,
    pe: 6.5, evEbitda: 4.2, fcfYield: 0.11, roic: 0.19, beta: 1.25, marketCap: 300e9, targetPrice: 78,
  },
  {
    id: '2', ticker: 'ITUB4', name: 'Itaú Unibanco', sector: 'Financials', country: 'Brazil',
    currency: 'BRL', quantity: 2000, averagePrice: 30, currentPrice: 33, previousClose: 33.3,
    pe: 8.4, evEbitda: null, fcfYield: 0.09, roic: null, beta: 0.95, marketCap: 320e9, targetPrice: 38,
  },
  {
    id: '3', ticker: 'WEGE3', name: 'WEG', sector: 'Industrials', country: 'Brazil',
    currency: 'BRL', quantity: 500, averagePrice: 40, currentPrice: 36, previousClose: 35.5,
    pe: 28, evEbitda: 18, fcfYield: 0.03, roic: 0.28, beta: 0.85, marketCap: 150e9, targetPrice: 42,
  },
];

const CASH = 20000;

describe('portfolio construction', () => {
  const p = buildPortfolio(POSITIONS, CASH);

  it('values positions and the book', () => {
    expect(p.positions[0].marketValue).toBe(66000);
    expect(p.positions[1].marketValue).toBe(66000);
    expect(p.positions[2].marketValue).toBe(18000);
    expect(p.investedValue).toBe(150000);
    expect(p.totalMarketValue).toBe(170000);
  });

  it('computes weights that sum to one including cash', () => {
    const sum = p.positions.reduce((s, x) => s + (x.weight ?? 0), 0);
    expect(sum).toBeCloseTo(150000 / 170000, 10);
    expect(p.positions[0].weight).toBeCloseTo(66000 / 170000, 10);
  });

  it('computes unrealised P&L per position and in total', () => {
    expect(p.positions[0].unrealizedPnl).toBe(6000);
    expect(p.positions[2].unrealizedPnl).toBe(-2000);
    expect(p.unrealizedPnl).toBe(6000 + 6000 - 2000);
    expect(p.positions[0].unrealizedPnlPct).toBeCloseTo(0.1, 10);
  });

  it('computes the daily move', () => {
    expect(p.positions[0].dailyChange).toBe(1);
    expect(p.positions[1].dailyChange).toBeCloseTo(-0.3, 10);
    expect(p.dailyPnl).toBeCloseTo(1000 - 600 + 250, 6);
  });

  it('computes upside to target', () => {
    expect(p.positions[0].upsideToTarget).toBeCloseTo(78 / 66 - 1, 10);
  });

  it('converts foreign positions at the supplied FX rate', () => {
    const usd = buildPortfolio(
      [{ ...POSITIONS[0], ticker: 'AAPL', currency: 'USD', quantity: 100, averagePrice: 200, currentPrice: 220, fxRate: 5 }],
      0,
    );
    expect(usd.positions[0].marketValue).toBe(110000);
    expect(usd.positions[0].costBasis).toBe(100000);
  });

  it('handles a position without a price', () => {
    const q = buildPortfolio([{ ...POSITIONS[0], currentPrice: null }], 0);
    expect(q.positions[0].marketValue).toBeNull();
    expect(q.positions[0].unrealizedPnl).toBeNull();
  });

  it('handles an empty portfolio', () => {
    const q = buildPortfolio([], 0);
    expect(q.positionCount).toBe(0);
    expect(q.investedValue).toBeNull();
    expect(q.unrealizedPnl).toBeNull();
  });

  it('handles a cash-only portfolio', () => {
    const q = buildPortfolio([], 50000);
    expect(q.totalMarketValue).toBeNull();
    expect(q.cash).toBe(50000);
  });
});

describe('attribution', () => {
  const p = buildPortfolio(POSITIONS, CASH);
  const rows = contributionByPosition(p);

  it('ranks contributors from best to worst', () => {
    // VALE3 and ITUB4 both returned +10% on an equal cost basis, so they tie at the top.
    expect(['VALE3', 'ITUB4']).toContain(rows[0].key);
    expect(rows[0].contribution).toBeCloseTo(rows[1].contribution as number, 12);
    expect(rows[rows.length - 1].key).toBe('WEGE3');
    expect(rows[rows.length - 1].contribution as number).toBeLessThan(0);
  });

  it('contributions sum to the return on invested capital', () => {
    const total = rows.reduce((s, r) => s + (r.contribution ?? 0), 0);
    const investedCost = 60000 + 60000 + 20000;
    expect(total).toBeCloseTo(10000 / investedCost, 10);
  });

  it('groups contribution by sector', () => {
    const g = groupContribution(rows, p.positions, 'sector');
    expect(g.map((x) => x.key).sort()).toEqual(['Financials', 'Industrials', 'Materials']);
    const total = g.reduce((s, r) => s + (r.contribution ?? 0), 0);
    expect(total).toBeCloseTo(rows.reduce((s, r) => s + (r.contribution ?? 0), 0), 10);
  });

  it('labels unclassified positions rather than dropping them', () => {
    const q = buildPortfolio([{ ...POSITIONS[0], sector: null }], 0);
    const g = groupContribution(contributionByPosition(q), q.positions, 'sector');
    expect(g[0].key).toBe('Unclassified');
  });
});

describe('exposure and concentration', () => {
  const p = buildPortfolio(POSITIONS, CASH);

  it('computes sector exposure on invested value', () => {
    const e = exposureBy(p, 'sector');
    expect(e[0].marketValue).toBe(66000);
    const total = e.reduce((s, x) => s + x.weight, 0);
    expect(total).toBeCloseTo(1, 10);
  });

  it('buckets by market capitalisation', () => {
    expect(marketCapBucket(300e9)).toBe('Mega (>200bn)');
    expect(marketCapBucket(60e9)).toBe('Large (50–200bn)');
    expect(marketCapBucket(1e9)).toBe('Micro (<2bn)');
    expect(marketCapBucket(null)).toBe('Unclassified');
    const e = exposureBy(p, 'marketCapBucket');
    expect(e.length).toBeGreaterThan(0);
  });

  it('computes concentration and the effective number of positions', () => {
    const c = concentration(p);
    expect(c.positionCount).toBe(3);
    expect(c.top1).toBeCloseTo(66000 / 170000, 10);
    expect(c.top5).toBeCloseTo(150000 / 170000, 10);
    expect(c.hhi as number).toBeGreaterThan(0);
    expect(c.effectiveNumberOfPositions as number).toBeGreaterThan(1);
  });

  it('reports a single-position book as maximally concentrated', () => {
    const q = buildPortfolio([POSITIONS[0]], 0);
    const c = concentration(q);
    expect(c.top1).toBeCloseTo(1, 10);
    expect(c.hhi).toBeCloseTo(1, 10);
    expect(c.effectiveNumberOfPositions).toBeCloseTo(1, 10);
  });

  it('returns nulls for an empty book', () => {
    const c = concentration(buildPortfolio([], 0));
    expect(c.hhi).toBeNull();
  });
});

describe('look-through valuation', () => {
  const p = buildPortfolio(POSITIONS, CASH);

  it('weights a metric by position weight', () => {
    const r = weightedMetric(p, 'pe');
    expect(r.coverage).toBeCloseTo(1, 10);
    const w = [66000, 66000, 18000].map((v) => v / 150000);
    expect(r.value).toBeCloseTo(w[0] * 6.5 + w[1] * 8.4 + w[2] * 28, 6);
  });

  it('renormalises around missing data and reports coverage', () => {
    const r = weightedMetric(p, 'evEbitda');
    expect(r.coverage).toBeCloseTo(84000 / 150000, 6);
    expect(r.value).toBeCloseTo((66000 * 4.2 + 18000 * 18) / 84000, 6);
  });

  it('returns null when no position carries the metric', () => {
    const q = buildPortfolio(POSITIONS.map((x) => ({ ...x, roic: null })), 0);
    const r = weightedMetric(q, 'roic');
    expect(r.value).toBeNull();
    expect(r.coverage).toBe(0);
  });
});

describe('rebalancing', () => {
  const p = buildPortfolio(POSITIONS, CASH);

  it('recommends buys and sells against target weights', () => {
    const rows = rebalance(p, [
      { ticker: 'VALE3', targetWeight: 0.5 },
      { ticker: 'ITUB4', targetWeight: 0.3 },
      { ticker: 'WEGE3', targetWeight: 0.1 },
    ]);
    const vale = rows.find((r) => r.ticker === 'VALE3')!;
    expect(vale.action).toBe('BUY');
    expect(vale.notionalDelta as number).toBeGreaterThan(0);
    expect(vale.shareDelta as number).toBeCloseTo((vale.notionalDelta as number) / 66, 6);

    const itub = rows.find((r) => r.ticker === 'ITUB4')!;
    expect(itub.action).toBe('SELL');
  });

  it('holds inside the tolerance band', () => {
    const currentWeight = (p.positions[0].weight as number);
    const rows = rebalance(p, [{ ticker: 'VALE3', targetWeight: currentWeight + 0.001 }], 50);
    expect(rows.find((r) => r.ticker === 'VALE3')!.action).toBe('HOLD');
  });

  it('recommends a full exit for positions with no target', () => {
    const rows = rebalance(p, [{ ticker: 'VALE3', targetWeight: 1 }]);
    expect(rows.find((r) => r.ticker === 'WEGE3')!.action).toBe('SELL');
    expect(rows.find((r) => r.ticker === 'WEGE3')!.targetWeight).toBe(0);
  });

  it('includes targets not currently held', () => {
    const rows = rebalance(p, [{ ticker: 'PETR4', targetWeight: 0.2 }]);
    const petr = rows.find((r) => r.ticker === 'PETR4')!;
    expect(petr.action).toBe('BUY');
    expect(petr.currentWeight).toBe(0);
    expect(petr.shareDelta).toBeNull(); // no price known for an unheld name
  });
});
