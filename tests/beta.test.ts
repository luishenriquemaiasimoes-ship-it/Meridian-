import { describe, expect, it } from 'vitest';
import { alignedReturns, regressBeta } from '@/lib/finance/beta';

/* A beta is a regression slope and the platform had been carrying one as a
   stored number with no derivation — no window, no index, no error bar, all
   three of which change the answer materially. */

function series(closes: number[], start = '2024-01-01'): { date: string; close: number }[] {
  const d = new Date(start);
  return closes.map((close, i) => {
    const day = new Date(d.getTime() + i * 86_400_000);
    return { date: day.toISOString().slice(0, 10), close };
  });
}

/** A stock that moves exactly `beta` times the market, plus a constant drift. */
function driven(market: number[], beta: number): number[] {
  const out = [100];
  for (let i = 1; i < market.length; i++) {
    const marketReturn = market[i] / market[i - 1] - 1;
    out.push(out[i - 1] * (1 + beta * marketReturn));
  }
  return out;
}

const marketPath = Array.from({ length: 400 }, (_, i) =>
  1000 * (1 + 0.0004 * i + 0.02 * Math.sin(i / 3) + 0.01 * Math.cos(i / 7)));

describe('recovering a beta from prices', () => {
  it('finds the slope it was generated with', () => {
    for (const trueBeta of [0.6, 1.0, 1.7]) {
      const r = regressBeta(series(driven(marketPath, trueBeta)), series(marketPath), '^BVSP')!;
      expect(r.beta).toBeCloseTo(trueBeta, 6);
      // Driven exactly by the market, so the market explains all of it.
      expect(r.rSquared).toBeCloseTo(1, 6);
      expect(r.standardError).toBeLessThan(1e-6);
    }
  });

  it('reports how firmly the data pins the slope down', () => {
    // A stock with its own noise on top has the same slope and a wider error.
    const noisy = driven(marketPath, 1.2).map((p, i) => p * (1 + 0.03 * Math.sin(i * 2.7)));
    const r = regressBeta(series(noisy), series(marketPath), '^BVSP')!;
    expect(r.standardError).toBeGreaterThan(0);
    expect(r.rSquared).toBeLessThan(1);
    // A beta of 1.4 pinned to 0.05 and one pinned to 0.6 are different facts.
    expect(r.beta).toBeGreaterThan(0.5);
    expect(r.beta).toBeLessThan(2.0);
  });

  it('says which index and window it measured', () => {
    const r = regressBeta(series(driven(marketPath, 1.1)), series(marketPath), '^GSPC')!;
    expect(r.benchmark).toBe('^GSPC');
    expect(r.from < r.to).toBe(true);
    expect(r.observations).toBe(399);
  });

  it('refuses a window too short to regress on', () => {
    const short = marketPath.slice(0, 40);
    expect(regressBeta(series(driven(short, 1.1)), series(short), '^BVSP')).toBeNull();
  });

  it('refuses when the market did not move', () => {
    const flat = new Array(300).fill(1000);
    expect(regressBeta(series(driven(flat, 1.1)), series(flat), '^BVSP')).toBeNull();
  });
});

describe('pairing two price series', () => {
  it('uses only the dates both traded', () => {
    // Brazilian and American calendars differ, and so do halts. A regression on
    // unaligned series measures the calendar as much as the stock.
    const stock = series([100, 101, 102, 103, 104]);
    const market = [stock[0], stock[2], stock[3], stock[4]].map((b, i) =>
      ({ date: b.date, close: 1000 + i }));
    const { dates, stock: rs } = alignedReturns(stock, market);
    expect(dates).toEqual(['2024-01-03', '2024-01-04', '2024-01-05']);
    expect(rs.length).toBe(3);
  });

  it('computes the stock return across the gap it actually spans', () => {
    // When a day is missing from the market, the stock return paired with the
    // next one has to span the same gap, not a single day.
    const stock = series([100, 110, 121]);
    const market = [
      { date: '2024-01-01', close: 1000 },
      { date: '2024-01-03', close: 1100 },
    ];
    const { stock: rs, market: rm } = alignedReturns(stock, market);
    expect(rs.length).toBe(1);
    // 121 against 100, two days of compounding, not 121 against 110.
    expect(rs[0]).toBeCloseTo(0.21, 10);
    expect(rm[0]).toBeCloseTo(0.10, 10);
  });

  it('drops a non-positive close rather than producing an infinite return', () => {
    const stock = [...series([100, 0, 120])];
    const market = series([1000, 1010, 1020]);
    const { stock: rs } = alignedReturns(stock, market);
    for (const r of rs) expect(Number.isFinite(r)).toBe(true);
  });
});
