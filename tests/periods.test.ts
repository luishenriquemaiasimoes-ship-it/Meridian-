import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readZip } from '@/lib/data-providers/live/zip';
import { parseCsv, type Row } from '@/lib/data-providers/live/csv';
import type { DfpYear } from '@/lib/data-providers/live/cvm';
import { isUsable, missingFrom, periodFromCvm } from '@/lib/data-providers/live/periods';
import type { FinancialPeriod } from '@/lib/finance/types';

const PETRO = '33.000.167/0001-01';

function archive(): DfpYear {
  const buf = readFileSync(join(__dirname, 'fixtures', 'dfp_cia_aberta_2024.zip'));
  const files = new Map<string, Row[]>();
  for (const e of readZip(buf)) {
    if (/\.csv$/i.test(e.name)) files.set(e.name.toLowerCase(), parseCsv(e.data));
  }
  return { year: 2024, files };
}

describe('turning a filing into a period the engine can read', () => {
  const p = periodFromCvm(archive(), PETRO)!;

  it('produces one annual period with the filed figures', () => {
    expect(p.label).toBe('FY2024');
    expect(p.periodType).toBe('FY');
    expect(p.currency).toBe('BRL');
    expect(p.unit).toBe('MILLIONS');
    expect(p.income.revenue).toBeCloseTo(490_000, 6);
    expect(p.balance.totalAssets).toBeCloseTo(1_100_000, 6);
    expect(p.cashFlow.cfo).toBeCloseTo(200_000, 6);
  });

  it('carries depreciation from the cash flow onto the income statement', () => {
    // The standardised Brazilian income statement has no depreciation line, so
    // the engine would otherwise have none to charge against.
    expect(p.cashFlow.da).toBeCloseTo(75_000, 6);
    expect(p.income.da).toBeCloseTo(75_000, 6);
    expect(p.income.ebitda).toBeCloseTo(180_000 + 75_000, 6);
  });

  it('signs capex as an outflow', () => {
    expect(p.cashFlow.capex).toBeCloseTo(-85_000, 6);
  });

  it('returns null for a company not in the filing, rather than an empty period', () => {
    expect(periodFromCvm(archive(), '00.000.000/0001-00')).toBeNull();
  });
});

describe('deciding whether a period can be valued at all', () => {
  const base = (over: Partial<FinancialPeriod['income']> = {}, bal: Partial<FinancialPeriod['balance']> = {}) =>
    ({
      label: 'FY2024', periodType: 'FY' as const, fiscalYear: 2024, fiscalQuarter: null,
      endDate: '2024-12-31', currency: 'BRL' as const, standard: 'IFRS' as const, unit: 'MILLIONS' as const,
      income: { revenue: 100, ebit: 10, ...over } as FinancialPeriod['income'],
      balance: { totalAssets: 500, totalEquity: 200, ...bal } as FinancialPeriod['balance'],
      cashFlow: {} as FinancialPeriod['cashFlow'],
    }) as FinancialPeriod;

  it('accepts a period with a top line, a profit and an asset base', () => {
    expect(isUsable(base())).toBe(true);
  });

  it('rejects one with no revenue', () => {
    // A parse that produced a balance sheet and no revenue is a failure, not a
    // company. Loaded, it would pass through the projection as zeros and come
    // out the other side as a valuation.
    expect(isUsable(base({ revenue: null }))).toBe(false);
    expect(isUsable(base({ revenue: 0 }))).toBe(false);
  });

  it('rejects one with no operating profit or no assets', () => {
    expect(isUsable(base({ ebit: null }))).toBe(false);
    expect(isUsable(base({}, { totalAssets: null }))).toBe(false);
  });

  it('names what is missing, so a skip can be explained', () => {
    const gaps = missingFrom(base({ revenue: null, ebit: null }));
    expect(gaps).toContain('receita');
    expect(gaps).toContain('EBIT');
  });
});
