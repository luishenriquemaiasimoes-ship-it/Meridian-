import { describe, expect, it } from 'vitest';
import {
  bisect, cagr, correlation, growth, irr, isNum, mean, median, percentile,
  percentileRank, round, safeDiv, stdev, sum, toNum,
} from '@/lib/finance/core';

describe('safeDiv', () => {
  it('divides finite numbers', () => expect(safeDiv(10, 4)).toBe(2.5));
  it('returns null on zero denominator', () => expect(safeDiv(10, 0)).toBeNull());
  it('returns null on missing inputs', () => {
    expect(safeDiv(null, 4)).toBeNull();
    expect(safeDiv(10, null)).toBeNull();
    expect(safeDiv(undefined, undefined)).toBeNull();
  });
  it('handles negatives', () => expect(safeDiv(-10, 4)).toBe(-2.5));
  it('returns zero for a zero numerator', () => expect(safeDiv(0, 5)).toBe(0));
});

describe('growth', () => {
  it('computes positive growth', () => expect(growth(110, 100)).toBeCloseTo(0.1, 10));
  it('computes negative growth', () => expect(growth(90, 100)).toBeCloseTo(-0.1, 10));
  it('returns zero for no change', () => expect(growth(100, 100)).toBe(0));
  it('returns null on a zero base', () => expect(growth(100, 0)).toBeNull());
  it('returns null on missing data', () => expect(growth(null, 100)).toBeNull());
  it('uses the absolute base so a loss-to-profit swing is positive', () => {
    expect(growth(50, -100)).toBeCloseTo(1.5, 10);
  });
  it('reports a widening loss as negative', () => {
    expect(growth(-150, -100)).toBeCloseTo(-0.5, 10);
  });
});

describe('cagr', () => {
  it('computes a 3-year CAGR', () => {
    expect(cagr(1331, 1000, 3)).toBeCloseTo(0.1, 10);
  });
  it('handles decline', () => expect(cagr(729, 1000, 3)).toBeCloseTo(-0.1, 6));
  it('returns null with a non-positive endpoint', () => {
    expect(cagr(-100, 1000, 3)).toBeNull();
    expect(cagr(1000, 0, 3)).toBeNull();
  });
  it('returns null for zero years', () => expect(cagr(1000, 500, 0)).toBeNull());
  it('returns null on missing data', () => expect(cagr(null, 500, 3)).toBeNull());
});

describe('statistics', () => {
  const xs = [1, 2, 3, 4, 5, 100];
  it('mean ignores nulls', () => expect(mean([1, null, 3])).toBe(2));
  it('median of an even set averages the middle two', () => expect(median([1, 2, 3, 4])).toBe(2.5));
  it('median of an odd set', () => expect(median([5, 1, 3])).toBe(3));
  it('returns null when everything is missing', () => {
    expect(mean([null, undefined])).toBeNull();
    expect(median([])).toBeNull();
  });
  it('percentile matches the inclusive convention', () => {
    expect(percentile([1, 2, 3, 4], 0.5)).toBe(2.5);
    expect(percentile([1, 2, 3, 4], 0)).toBe(1);
    expect(percentile([1, 2, 3, 4], 1)).toBe(4);
    expect(percentile([1, 2, 3, 4], 0.25)).toBeCloseTo(1.75, 10);
  });
  it('percentileRank places a value in its universe', () => {
    expect(percentileRank([1, 2, 3, 4], 3)).toBeCloseTo(0.625, 10);
    expect(percentileRank([1, 2, 3, 4], 0)).toBe(0);
  });
  it('stdev needs two observations', () => {
    expect(stdev([5])).toBeNull();
    expect(stdev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.13809, 4);
  });
  it('correlation of identical series is 1', () => {
    expect(correlation([1, 2, 3, 4], [1, 2, 3, 4])).toBeCloseTo(1, 10);
  });
  it('correlation of inverted series is -1', () => {
    expect(correlation([1, 2, 3, 4], [4, 3, 2, 1])).toBeCloseTo(-1, 10);
  });
  it('correlation is null with a flat series', () => {
    expect(correlation([1, 1, 1, 1], [1, 2, 3, 4])).toBeNull();
  });
  it('sum ignores missing but returns null when nothing is present', () => {
    expect(sum(1, null, 2)).toBe(3);
    expect(sum(null, undefined)).toBeNull();
  });
  it('percentile of a single observation is that observation', () => {
    expect(percentile([7], 0.9)).toBe(7);
  });
  it('has a fixture of the expected size', () => { expect(xs.length).toBe(6); });
});

describe('toNum', () => {
  it('parses plain numbers', () => expect(toNum('1234.56')).toBe(1234.56));
  it('parses pt-BR decimals', () => expect(toNum('1.234,56')).toBe(1234.56));
  it('parses en-US thousands', () => expect(toNum('1,234.56')).toBe(1234.56));
  it('parses accounting negatives', () => expect(toNum('(120)')).toBe(-120));
  it('strips currency symbols', () => expect(toNum('R$ 1.250,00')).toBe(1250));
  it('returns null on junk', () => {
    expect(toNum('n/a')).toBeNull();
    expect(toNum('')).toBeNull();
    expect(toNum(undefined)).toBeNull();
  });
  it('passes through finite numbers only', () => {
    expect(toNum(5)).toBe(5);
    expect(toNum(Number.NaN)).toBeNull();
    expect(toNum(Infinity)).toBeNull();
  });
});

describe('solvers', () => {
  it('bisect finds a root', () => {
    const r = bisect((x) => x * x - 4, 0, 10);
    expect(r).toBeCloseTo(2, 5);
  });
  it('bisect returns null without a sign change', () => {
    expect(bisect((x) => x * x + 1, 0, 10)).toBeNull();
  });
  it('irr solves a simple project', () => {
    const r = irr([-100, 60, 60]);
    expect(r).toBeCloseTo(0.1306, 3);
  });
  it('irr returns null for an all-positive series', () => {
    expect(irr([100, 60, 60])).toBeNull();
  });
});

describe('round & isNum', () => {
  it('rounds to the requested precision', () => { expect(round(1.005, 2)).toBe(1.01); });
  it('propagates null', () => expect(round(null)).toBeNull());
  it('isNum rejects NaN and Infinity', () => {
    expect(isNum(Number.NaN)).toBe(false);
    expect(isNum(Infinity)).toBe(false);
    expect(isNum(0)).toBe(true);
  });
});
