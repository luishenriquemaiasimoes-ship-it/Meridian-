import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SCORE_WEIGHTS, earningsStability, investmentScore,
  scoreAllFactors, scoreFactor, type MetricUniverse,
} from '@/lib/finance/factors';
import { detectIntent } from '@/lib/ai/intent';
import {
  formatBps, formatCompact, formatDays, formatMetric, formatMoney,
  formatMultiple, formatNumber, formatPercent, signClass, DASH,
} from '@/lib/finance/format';

const UNIVERSE: MetricUniverse = {
  evEbitda: [4, 6, 8, 10, 12, 14],
  pe: [5, 8, 12, 16, 20, 30],
  fcfYield: [0.02, 0.04, 0.06, 0.08, 0.1, 0.14],
  pb: [0.6, 1, 1.5, 2, 3, 5],
  roic: [0.04, 0.08, 0.12, 0.16, 0.2, 0.28],
  ebitdaMargin: [0.1, 0.15, 0.2, 0.25, 0.3, 0.4],
  fcfConversion: [0.2, 0.4, 0.5, 0.6, 0.7, 0.9],
  earningsStability: [0.2, 0.4, 0.5, 0.6, 0.8, 0.9],
  revenueGrowth: [-0.05, 0, 0.05, 0.1, 0.15, 0.25],
  ebitdaGrowth: [-0.1, 0, 0.06, 0.12, 0.18, 0.3],
  epsGrowth: [-0.2, 0, 0.05, 0.15, 0.2, 0.35],
  netDebtToEbitda: [-0.5, 0, 1, 2, 3, 4.5],
  interestCoverage: [1, 2, 4, 6, 10, 20],
  debtToEquity: [0, 0.2, 0.5, 0.8, 1.2, 2],
};

describe('factor scoring', () => {
  it('scores a cheap company highly on value', () => {
    const cheap = scoreFactor('VALUE', { evEbitda: 4, pe: 5, fcfYield: 0.14, pb: 0.6 }, UNIVERSE);
    const rich = scoreFactor('VALUE', { evEbitda: 14, pe: 30, fcfYield: 0.02, pb: 5 }, UNIVERSE);
    expect(cheap.score as number).toBeGreaterThan(rich.score as number);
    expect(cheap.score as number).toBeGreaterThan(8);
  });

  it('inverts metrics where a lower value is better', () => {
    const s = scoreFactor('VALUE', { evEbitda: 4, pe: null, fcfYield: null, pb: null }, UNIVERSE);
    const m = s.metrics.find((x) => x.key === 'evEbitda')!;
    expect(m.inverse).toBe(true);
    expect(m.score as number).toBeGreaterThan(8);
  });

  it('renormalises weights when metrics are missing and reports coverage', () => {
    const s = scoreFactor('VALUE', { evEbitda: 4, pe: null, fcfYield: null, pb: null }, UNIVERSE);
    expect(s.coverage).toBeCloseTo(0.35, 10);
    expect(s.score).not.toBeNull();
  });

  it('returns a null score with no data at all', () => {
    const s = scoreFactor('VALUE', {}, UNIVERSE);
    expect(s.score).toBeNull();
    expect(s.coverage).toBe(0);
  });

  it('returns a null score when the universe is empty', () => {
    const s = scoreFactor('QUALITY', { roic: 0.2 }, {});
    expect(s.score).toBeNull();
  });

  it('scores every factor', () => {
    const all = scoreAllFactors({ roic: 0.28, evEbitda: 4, revenueGrowth: 0.25 }, UNIVERSE);
    expect(all).toHaveLength(7);
    expect(all.map((f) => f.factor)).toContain('MOMENTUM');
  });

  it('bounds scores to the 0–10 range', () => {
    const s = scoreFactor('QUALITY', { roic: 99, ebitdaMargin: 99, fcfConversion: 99, earningsStability: 99 }, UNIVERSE);
    expect(s.score as number).toBeLessThanOrEqual(10);
    const low = scoreFactor('QUALITY', { roic: -99, ebitdaMargin: -99, fcfConversion: -99, earningsStability: -99 }, UNIVERSE);
    expect(low.score as number).toBeGreaterThanOrEqual(0);
  });
});

describe('earnings stability', () => {
  it('scores a steady series above a volatile one', () => {
    const steady = earningsStability([100, 102, 101, 103, 104]) as number;
    const volatile = earningsStability([100, 40, 160, 20, 190]) as number;
    expect(steady).toBeGreaterThan(volatile);
    expect(steady).toBeLessThanOrEqual(1);
  });
  it('is null with too few observations', () => {
    expect(earningsStability([100, 102])).toBeNull();
  });
  it('is null when the mean is zero', () => {
    expect(earningsStability([-10, 0, 10])).toBeNull();
  });
});

describe('investment score', () => {
  const factors = scoreAllFactors(
    { evEbitda: 6, pe: 8, fcfYield: 0.1, pb: 1, roic: 0.2, ebitdaMargin: 0.3, fcfConversion: 0.7, earningsStability: 0.8, revenueGrowth: 0.15, ebitdaGrowth: 0.18, epsGrowth: 0.2, netDebtToEbitda: 1, interestCoverage: 10, debtToEquity: 0.5 },
    UNIVERSE,
  );

  it('produces a 0–100 composite with traceable components', () => {
    const s = investmentScore({ factorScores: factors, upside: 0.25, catalystCount: 3, catalystProbabilityAvg: 0.6, riskCount: 3 });
    expect(s.total as number).toBeGreaterThan(0);
    expect(s.total as number).toBeLessThanOrEqual(100);
    expect(s.components).toHaveLength(8);
    expect(s.components.every((c) => c.basis.length > 0)).toBe(true);
  });

  it('rewards a larger upside', () => {
    const low = investmentScore({ factorScores: factors, upside: -0.2 });
    const high = investmentScore({ factorScores: factors, upside: 0.5 });
    expect(high.total as number).toBeGreaterThan(low.total as number);
  });

  it('penalises a longer risk list', () => {
    const few = investmentScore({ factorScores: factors, riskCount: 1 });
    const many = investmentScore({ factorScores: factors, riskCount: 8 });
    expect(few.total as number).toBeGreaterThan(many.total as number);
  });

  it('respects custom weights', () => {
    const valueHeavy = investmentScore({ factorScores: factors, upside: 0.3 }, { ...DEFAULT_SCORE_WEIGHTS, valuation: 0.6, growth: 0.05 });
    expect(valueHeavy.weights.valuation).toBe(0.6);
    expect(valueHeavy.total).not.toBeNull();
  });

  it('reports partial coverage without data', () => {
    const s = investmentScore({ factorScores: [] });
    expect(s.total).toBeNull();
    expect(s.coverage).toBe(0);
  });
});

describe('financial formatting', () => {
  it('formats BRL in the Brazilian convention', () => {
    expect(formatCompact(1_250_000_000, { currency: 'BRL' })).toBe('R$ 1,25 bi');
    expect(formatCompact(3_400_000, { currency: 'BRL' })).toBe('R$ 3,40 mi');
  });

  it('formats USD in the US convention', () => {
    expect(formatCompact(1_250_000_000, { currency: 'USD' })).toBe('$1.25B');
    expect(formatCompact(980_000_000_000, { currency: 'USD' })).toBe('$980.00B');
  });

  it('formats negatives in accounting style when asked', () => {
    expect(formatCompact(-1_250_000_000, { currency: 'USD', accounting: true })).toBe('($1.25B)');
    expect(formatCompact(-1_250_000_000, { currency: 'USD' })).toBe('-$1.25B');
  });

  it('formats percentages and basis points', () => {
    expect(formatPercent(0.124)).toBe('12.4%');
    expect(formatPercent(0.124, 2)).toBe('12.40%');
    expect(formatPercent(0.124, 1, { signed: true })).toBe('+12.4%');
    expect(formatPercent(-0.031)).toBe('-3.1%');
    expect(formatBps(0.022)).toBe('+220 bps');
    expect(formatBps(-0.022)).toBe('-220 bps');
  });

  it('formats multiples and days', () => {
    expect(formatMultiple(8.42)).toBe('8.4x');
    expect(formatMultiple(8.42, 2)).toBe('8.42x');
    expect(formatDays(54.6)).toBe('55d');
  });

  it('uses accounting parentheses for negative numbers', () => {
    expect(formatNumber(-120)).toBe('(120)');
    expect(formatNumber(-120, 0, { accounting: false })).toBe('-120');
    expect(formatNumber(1234567)).toBe('1.234.567');
  });

  it('renders missing data as an em dash, never as zero', () => {
    expect(formatCompact(null)).toBe(DASH);
    expect(formatPercent(undefined)).toBe(DASH);
    expect(formatMultiple(null)).toBe(DASH);
    expect(formatMoney(null)).toBe(DASH);
    expect(formatNumber(Number.NaN)).toBe(DASH);
  });

  it('formats money at full precision', () => {
    expect(formatMoney(1234.5, 'BRL')).toBe('R$ 1.234,50');
    expect(formatMoney(1234.5, 'USD')).toBe('$1,234.50');
    expect(formatMoney(-12.3, 'USD', 2, true)).toBe('($12.30)');
  });

  it('routes through formatMetric by declared format', () => {
    expect(formatMetric(0.124, 'percent')).toBe('12.4%');
    expect(formatMetric(8.4, 'multiple')).toBe('8.4x');
    expect(formatMetric(1_250_000_000, 'currencyCompact', { currency: 'USD' })).toBe('$1.25B');
    expect(formatMetric(null, 'currency')).toBe(DASH);
  });

  it('scales values reported in thousands', () => {
    expect(formatCompact(1_250_000, { currency: 'USD', scale: 1000 })).toBe('$1.25B');
  });

  it('classifies sign for colouring, with inversion support', () => {
    expect(signClass(0.1)).toBe('pos');
    expect(signClass(-0.1)).toBe('neg');
    expect(signClass(0)).toBe('flat');
    expect(signClass(null)).toBe('flat');
    expect(signClass(0.1, true)).toBe('neg');
  });
});

describe('AI intent routing', () => {
  it('reads a risk question on a portfolio screen as a portfolio question', () => {
    expect(detectIntent('What is the biggest risk?').intent).toBe('THESIS_RISK');
    expect(detectIntent('What is the biggest risk?', { type: 'PORTFOLIO', id: null }).intent)
      .toBe('PORTFOLIO_RISK');
  });

  it('reads a question that names the book as a portfolio question, scope or no scope', () => {
    expect(detectIntent('What is the biggest risk in the book?').intent).toBe('PORTFOLIO_RISK');
    expect(detectIntent('Qual o maior risco do livro?').intent).toBe('PORTFOLIO_RISK');
  });

  it('leaves a company scope alone', () => {
    expect(detectIntent('What is the biggest risk?', { type: 'COMPANY', id: 'VALE3' }).intent)
      .toBe('THESIS_RISK');
  });

  it('keeps an explicitly portfolio-worded question on the portfolio intent', () => {
    expect(detectIntent('Qual o risco da carteira?').intent).toBe('PORTFOLIO_RISK');
    expect(detectIntent('What is the portfolio risk?').intent).toBe('PORTFOLIO_RISK');
  });

  it('does not redirect a measure that has no portfolio equivalent', () => {
    expect(detectIntent('What is the EBITDA margin?', { type: 'PORTFOLIO', id: null }).intent)
      .toBe('MARGINS');
  });
});

describe('AI intent scoring', () => {
  it.each([
    ['Is VALE3 cheap?', 'VALUATION'],
    ['O que aconteceu com o ROIC?', 'ROIC'],
    ['Compare ITUB4 with its peers', 'PEER_COMPARISON'],
    ['What does the current price already imply?', 'REVERSE_DCF'],
    ['Monte um DCF', 'DCF'],
    ['Qual o preço-alvo?', 'TARGET_PRICE'],
    ['Summarise the last quarter', 'EARNINGS'],
    ['Como está a alavancagem?', 'LEVERAGE'],
    ['What is the dividend policy?', 'CAPITAL_ALLOCATION'],
    ['O que mudou na tese?', 'WHAT_CHANGED'],
    ['Show me the portfolio attribution', 'PORTFOLIO_REVIEW'],
    ['What is the portfolio drawdown?', 'PORTFOLIO_RISK'],
  ])('routes %s to %s', (question, expected) => {
    expect(detectIntent(question).intent).toBe(expected);
  });

  it('falls back to an overview when nothing matches', () => {
    expect(detectIntent('Tell me something interesting').intent).toBe('OVERVIEW');
  });
});
