import { describe, expect, it } from 'vitest';
import { blankThesis, riskQuadrant, QA_THEME_LABEL, THESIS_WEIGHT_LABEL } from '@/lib/research/types';
import type { PeerComparisonRow } from '@/lib/research/types';
import { buildComparison, COMPARISON_METRICS } from '@/lib/research/comparison';

describe('risk quadrant', () => {
  it('puts a likely, damaging risk in the manage quadrant', () => {
    expect(riskQuadrant(0.7, 0.8).key).toBe('MANAGE');
  });

  it('puts an unlikely but damaging risk in the contingency quadrant', () => {
    expect(riskQuadrant(0.2, 0.9).key).toBe('CONTINGENCY');
  });

  it('puts a likely but minor risk in the monitor quadrant', () => {
    expect(riskQuadrant(0.8, 0.2).key).toBe('MONITOR');
  });

  it('puts an unlikely, minor risk in the accept quadrant', () => {
    expect(riskQuadrant(0.1, 0.1).key).toBe('ACCEPT');
  });

  it('treats the midpoint as high on both axes', () => {
    expect(riskQuadrant(0.5, 0.5).key).toBe('MANAGE');
  });
});

describe('deck theses', () => {
  it('makes the first thesis core and the rest supporting', () => {
    expect(blankThesis(1).weight).toBe('CORE');
    expect(blankThesis(2).weight).toBe('SUPPORTING');
  });

  it('starts with nothing asserted', () => {
    const t = blankThesis(1);
    expect(t.requires).toEqual([]);
    expect(t.breaks).toEqual([]);
    expect(t.rationale).toBe('');
  });

  it('labels every weight and theme', () => {
    for (const w of Object.keys(THESIS_WEIGHT_LABEL)) expect(THESIS_WEIGHT_LABEL[w as keyof typeof THESIS_WEIGHT_LABEL]).toBeTruthy();
    for (const t of Object.keys(QA_THEME_LABEL)) expect(QA_THEME_LABEL[t as keyof typeof QA_THEME_LABEL]).toBeTruthy();
  });
});

describe('peer comparison', () => {
  const universe = new Map([
    ['VALE3', { ticker: 'VALE3', bankLike: false, ebitdaMargin: 0.42, netDebtToEbitda: 0.6, pe: 5.1 }],
    ['PETR4', { ticker: 'PETR4', bankLike: false, ebitdaMargin: 0.38, netDebtToEbitda: 0.9, pe: 4.2 }],
    ['SUZB3', { ticker: 'SUZB3', bankLike: false, ebitdaMargin: 0.46, netDebtToEbitda: 2.8, pe: null }],
    ['ITUB4', { ticker: 'ITUB4', bankLike: true, ebitdaMargin: null, netDebtToEbitda: null, pe: 8.4 }],
  ]);

  const metricRow = (metric: string, inverse = false): PeerComparisonRow => {
    const def = COMPARISON_METRICS.find((m) => m.key === metric)!;
    return { key: metric, label: def.label, kind: 'METRIC', metric, format: def.format, inverse };
  };

  const tickers = ['VALE3', 'PETR4', 'SUZB3', 'ITUB4'];

  it('ranks the highest value first when higher is better', () => {
    const [row] = buildComparison([metricRow('ebitdaMargin')], tickers, universe);
    expect(row.cells.find((c) => c.ticker === 'SUZB3')?.rank).toBe(1);
    expect(row.cells.find((c) => c.ticker === 'PETR4')?.rank).toBe(3);
  });

  it('ranks the lowest value first when lower is better', () => {
    const [row] = buildComparison([metricRow('netDebtToEbitda', true)], tickers, universe);
    expect(row.cells.find((c) => c.ticker === 'VALE3')?.rank).toBe(1);
    expect(row.cells.find((c) => c.ticker === 'SUZB3')?.rank).toBe(3);
  });

  it('leaves a bank out of a measure that does not describe it, rather than filling the cell', () => {
    const [row] = buildComparison([metricRow('ebitdaMargin')], tickers, universe);
    const bank = row.cells.find((c) => c.ticker === 'ITUB4');
    expect(bank?.value).toBeNull();
    expect(bank?.notMeaningful).toBe(true);
    expect(row.excluded).toEqual(['ITUB4']);
  });

  it('keeps a bank in a measure that does describe it', () => {
    const [row] = buildComparison([metricRow('pe', true)], tickers, universe);
    const bank = row.cells.find((c) => c.ticker === 'ITUB4');
    expect(bank?.notMeaningful).toBe(false);
    expect(bank?.value).toBe(8.4);
  });

  it('takes the median of the companies the measure applies to, not of every column', () => {
    const [row] = buildComparison([metricRow('ebitdaMargin')], tickers, universe);
    expect(row.median).toBeCloseTo(0.42, 10);
  });

  it('does not invent a value for a company with no data', () => {
    const [row] = buildComparison([metricRow('pe', true)], tickers, universe);
    const missing = row.cells.find((c) => c.ticker === 'SUZB3');
    expect(missing?.value).toBeNull();
    expect(missing?.rank).toBeNull();
    expect(missing?.notMeaningful).toBe(false);
  });

  it('carries a manual row through untouched and ranks nothing in it', () => {
    const row: PeerComparisonRow = {
      key: 'regime', label: 'Regulatory regime', kind: 'MANUAL', format: 'text',
      values: { VALE3: 'Mining code', ITUB4: 'Central bank' },
    };
    const [built] = buildComparison([row], tickers, universe);
    expect(built.cells.find((c) => c.ticker === 'VALE3')?.value).toBe('Mining code');
    expect(built.cells.find((c) => c.ticker === 'PETR4')?.value).toBeNull();
    expect(built.cells.every((c) => c.rank === null)).toBe(true);
    expect(built.median).toBeNull();
  });

  it('ships no template for any sector', () => {
    const groups = new Set(COMPARISON_METRICS.map((m) => m.group));
    expect(groups.has('Valuation')).toBe(true);
    // The catalogue is organised by what a measure describes, never by industry.
    expect([...groups].some((g) => /bank|mining|retail|utilit|telecom/i.test(g))).toBe(false);
  });
});
