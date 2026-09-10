import { describe, expect, it } from 'vitest';
import {
  balanceSheetCheck, computeLTM, deriveIncomeStatement, derivePeriod,
  EMPTY_BALANCE, EMPTY_CASHFLOW, EMPTY_INCOME, findQoQComparable, findYoYComparable,
  normalizePeriod, series, seriesCagr, seriesGrowth,
} from '@/lib/finance/statements';
import { FY2023, FY2024, makePeriod, makeQuarters } from './fixtures';

describe('income statement derivation', () => {
  it('derives gross profit, EBIT, EBITDA, EBT and net income', () => {
    expect(FY2023.income.grossProfit).toBe(400);
    expect(FY2023.income.ebit).toBe(250);
    expect(FY2023.income.ebitda).toBe(330);
    expect(FY2023.income.ebt).toBe(210);
    expect(FY2023.income.netIncome).toBeCloseTo(138.6, 6);
    expect(FY2023.income.eps).toBeCloseTo(1.386, 6);
  });

  it('derives EBITDA from EBIT when EBIT is reported directly', () => {
    const s = deriveIncomeStatement({ ...EMPTY_INCOME, ebit: 100, da: 25 });
    expect(s.ebitda).toBe(125);
  });

  it('derives EBIT from EBITDA when EBITDA is reported directly', () => {
    const s = deriveIncomeStatement({ ...EMPTY_INCOME, ebitda: 125, da: 25 });
    expect(s.ebit).toBe(100);
  });

  it('back-solves the tax line from EBT and net income', () => {
    const s = deriveIncomeStatement({ ...EMPTY_INCOME, ebt: 200, netIncome: 140 });
    expect(s.taxes).toBe(60);
  });

  it('leaves everything null when nothing is reported', () => {
    const s = deriveIncomeStatement({ ...EMPTY_INCOME });
    expect(s.revenue).toBeNull();
    expect(s.ebitda).toBeNull();
    expect(s.netIncome).toBeNull();
  });

  it('does not fabricate EPS without a share count', () => {
    const s = deriveIncomeStatement({ ...EMPTY_INCOME, netIncome: 100, dilutedShares: null });
    expect(s.eps).toBeNull();
  });

  it('handles a zero share count without producing Infinity', () => {
    const s = deriveIncomeStatement({ ...EMPTY_INCOME, netIncome: 100, dilutedShares: 0 });
    expect(s.eps).toBeNull();
  });

  it('handles a loss-making period', () => {
    const s = deriveIncomeStatement({ ...EMPTY_INCOME, revenue: 500, cogs: 620, sga: 40, da: 30 });
    expect(s.grossProfit).toBe(-120);
    expect(s.ebit).toBe(-160);
    expect(s.ebitda).toBe(-130);
  });
});

describe('balance sheet', () => {
  it('totals assets, liabilities and equity', () => {
    expect(FY2023.balance.totalAssets).toBe(1390);
    expect(FY2023.balance.totalLiabilities).toBe(790);
    expect(FY2023.balance.totalEquity).toBe(600);
  });

  it('balances', () => {
    const c = balanceSheetCheck(FY2023.balance);
    expect(c.balances).toBe(true);
    expect(c.gap).toBe(0);
  });

  it('flags an unbalanced sheet', () => {
    const broken = { ...FY2023.balance, totalAssets: 1500 };
    const c = balanceSheetCheck(broken);
    expect(c.balances).toBe(false);
    expect(c.gap).toBe(110);
  });

  it('reports not-balanced when totals are missing', () => {
    expect(balanceSheetCheck(EMPTY_BALANCE).balances).toBe(false);
  });
});

describe('cash flow', () => {
  it('derives CFO, CFI, CFF and the net change in cash', () => {
    expect(FY2023.cashFlow.cfo).toBeCloseTo(203.6, 6);
    expect(FY2023.cashFlow.cfi).toBeCloseTo(-95, 6);
    expect(FY2023.cashFlow.cff).toBeCloseTo(-15, 6);
    expect(FY2023.cashFlow.netChangeInCash).toBeCloseTo(93.6, 6);
  });

  it('leaves CFO null when nothing is reported', () => {
    const p = derivePeriod({
      label: 'X', periodType: 'FY', fiscalYear: 2020, endDate: '2020-12-31',
      currency: 'BRL', standard: 'IFRS', unit: 'MILLIONS',
      income: { ...EMPTY_INCOME }, balance: { ...EMPTY_BALANCE }, cashFlow: { ...EMPTY_CASHFLOW },
    });
    expect(p.cashFlow.cfo).toBeNull();
  });
});

describe('LTM aggregation', () => {
  const quarters = makeQuarters();

  it('sums four quarters of flows and takes the latest balance sheet', () => {
    const ltm = computeLTM(quarters);
    expect(ltm).not.toBeNull();
    expect(ltm!.income.revenue).toBe(1150);
    expect(ltm!.income.ebitda).toBe(406);
    expect(ltm!.income.netIncome).toBeCloseTo(177.54, 6);
    expect(ltm!.balance.cash).toBe(240);
    expect(ltm!.periodType).toBe('LTM');
  });

  it('recomputes EPS from summed net income and the latest share count', () => {
    const ltm = computeLTM(quarters)!;
    expect(ltm.income.eps).toBeCloseTo(1.7754, 6);
  });

  it('refuses to approximate with fewer than four quarters', () => {
    expect(computeLTM(quarters.slice(0, 3))).toBeNull();
    expect(computeLTM([])).toBeNull();
  });

  it('uses only the four most recent quarters', () => {
    const older = makePeriod({
      label: '4Q23', periodType: 'Q', fiscalYear: 2023, fiscalQuarter: 4,
      endDate: '2023-12-31', income: { revenue: 999, dilutedShares: 100 },
    });
    const ltm = computeLTM([older, ...quarters])!;
    expect(ltm.income.revenue).toBe(1150);
  });
});

describe('period comparables', () => {
  const quarters = makeQuarters();

  it('finds the year-ago quarter', () => {
    const prior = makePeriod({
      label: '3Q23', periodType: 'Q', fiscalYear: 2023, fiscalQuarter: 3,
      endDate: '2023-09-30', income: { revenue: 270, dilutedShares: 100 },
    });
    const target = quarters[2];
    expect(findYoYComparable(target, [...quarters, prior])?.label).toBe('3Q23');
  });

  it('finds the prior year for an annual period', () => {
    expect(findYoYComparable(FY2024, [FY2023, FY2024])?.label).toBe('FY2023');
  });

  it('finds the sequential quarter', () => {
    expect(findQoQComparable(quarters[2], quarters)?.label).toBe('2Q24');
    expect(findQoQComparable(quarters[0], quarters)).toBeNull();
  });

  it('returns null for QoQ on an annual period', () => {
    expect(findQoQComparable(FY2024, [FY2023, FY2024])).toBeNull();
  });
});

describe('series helpers', () => {
  const points = series([FY2023, FY2024], (p) => p.income.revenue);

  it('extracts a labelled series', () => {
    expect(points.map((p) => p.value)).toEqual([1000, 1150]);
  });

  it('computes period growth with a null first entry', () => {
    const g = seriesGrowth(points);
    expect(g[0]).toBeNull();
    expect(g[1]).toBeCloseTo(0.15, 10);
  });

  it('computes CAGR across the window', () => {
    expect(seriesCagr(points)).toBeCloseTo(0.15, 10);
  });

  it('returns null CAGR with fewer than two points', () => {
    expect(seriesCagr(points.slice(0, 1))).toBeNull();
  });
});

describe('normalization', () => {
  const author = 'analyst@meridian.test';
  const adj = (over: Partial<Parameters<typeof normalizePeriod>[1][number]>) => ({
    id: 'a1', periodLabel: 'FY2024', lineItem: 'EBITDA' as const,
    category: 'RESTRUCTURING' as const, amount: 30,
    rationale: 'Plant closure costs', author, createdAt: '2025-01-10T00:00:00Z',
    ...over,
  });

  it('adds an EBITDA adjustment and cascades it to EBIT and net income', () => {
    const r = normalizePeriod(FY2024, [adj({})], 0.34);
    expect(r.reportedEbitda).toBe(406);
    expect(r.normalizedEbitda).toBe(436);
    expect(r.normalizedEbit).toBe(344);
    expect(r.normalizedNetIncome).toBeCloseTo(177.54 + 30 * 0.66, 6);
  });

  it('keeps reported figures when no adjustment exists', () => {
    const r = normalizePeriod(FY2024, []);
    expect(r.normalizedEbitda).toBe(406);
    expect(r.ebitdaAdjustments).toBeNull();
  });

  it('ignores adjustments booked to another period', () => {
    const r = normalizePeriod(FY2024, [adj({ periodLabel: 'FY2023' })]);
    expect(r.normalizedEbitda).toBe(406);
    expect(r.applied).toHaveLength(0);
  });

  it('combines multiple adjustments on the same line', () => {
    const r = normalizePeriod(FY2024, [adj({}), adj({ id: 'a2', amount: -10, category: 'EXTRAORDINARY_GAIN' })]);
    expect(r.ebitdaAdjustments).toBe(20);
    expect(r.normalizedEbitda).toBe(426);
  });

  it('supports a net-income-only adjustment', () => {
    const r = normalizePeriod(FY2024, [adj({ lineItem: 'NET_INCOME', amount: 12, category: 'UNUSUAL_TAX' })]);
    expect(r.normalizedEbitda).toBe(406);
    expect(r.normalizedNetIncome).toBeCloseTo(189.54, 6);
  });

  it('records the audit fields the user supplied', () => {
    const r = normalizePeriod(FY2024, [adj({})]);
    expect(r.applied[0].author).toBe(author);
    expect(r.applied[0].rationale).toBe('Plant closure costs');
  });
});
