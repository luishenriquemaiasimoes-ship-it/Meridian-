import type { FinancialPeriod } from '@/lib/finance/types';
import { derivePeriod, EMPTY_BALANCE, EMPTY_CASHFLOW, EMPTY_INCOME } from '@/lib/finance/statements';

/** Builds a fully derived period from partial input; all values in BRL millions. */
export function makePeriod(overrides: {
  label: string;
  fiscalYear: number;
  fiscalQuarter?: number;
  endDate: string;
  periodType?: 'FY' | 'Q';
  income?: Partial<FinancialPeriod['income']>;
  balance?: Partial<FinancialPeriod['balance']>;
  cashFlow?: Partial<FinancialPeriod['cashFlow']>;
}): FinancialPeriod {
  return derivePeriod({
    label: overrides.label,
    periodType: overrides.periodType ?? 'FY',
    fiscalYear: overrides.fiscalYear,
    fiscalQuarter: overrides.fiscalQuarter ?? null,
    endDate: overrides.endDate,
    currency: 'BRL',
    standard: 'IFRS',
    unit: 'MILLIONS',
    income: { ...EMPTY_INCOME, ...overrides.income },
    balance: { ...EMPTY_BALANCE, ...overrides.balance },
    cashFlow: { ...EMPTY_CASHFLOW, ...overrides.cashFlow },
  });
}

/** A clean, internally consistent two-year set used across the test suite. */
export const FY2023 = makePeriod({
  label: 'FY2023',
  fiscalYear: 2023,
  endDate: '2023-12-31',
  income: {
    revenue: 1000, cogs: 600, sga: 120, rnd: 30, da: 80,
    financialResult: -40, taxes: 71.4, dilutedShares: 100,
  },
  balance: {
    cash: 200, accountsReceivable: 150, inventory: 120, otherCurrentAssets: 30,
    ppe: 700, intangibles: 50, goodwill: 100, otherAssets: 40,
    accountsPayable: 110, shortTermDebt: 80, otherCurrentLiabilities: 60,
    longTermDebt: 420, leaseLiabilities: 50, otherLiabilities: 70,
    shareCapital: 300, retainedEarnings: 300,
  },
  cashFlow: {
    netIncome: 138.6, da: 80, workingCapitalChange: -20, otherOperating: 5,
    capex: -90, otherInvesting: -5,
    debtIssued: 60, debtRepaid: -40, dividendsPaid: -35,
  },
});

export const FY2024 = makePeriod({
  label: 'FY2024',
  fiscalYear: 2024,
  endDate: '2024-12-31',
  income: {
    revenue: 1150, cogs: 670, sga: 132, rnd: 34, da: 92,
    financialResult: -45, taxes: 91.46, dilutedShares: 100,
  },
  balance: {
    cash: 240, accountsReceivable: 172, inventory: 134, otherCurrentAssets: 34,
    ppe: 760, intangibles: 55, goodwill: 100, otherAssets: 45,
    accountsPayable: 124, shortTermDebt: 90, otherCurrentLiabilities: 66,
    longTermDebt: 430, leaseLiabilities: 55, otherLiabilities: 75,
    shareCapital: 300, retainedEarnings: 400,
  },
  cashFlow: {
    netIncome: 177.54, da: 92, workingCapitalChange: -26, otherOperating: 6,
    capex: -105, otherInvesting: -6,
    debtIssued: 70, debtRepaid: -50, dividendsPaid: -45,
  },
});

export function makeQuarters(): FinancialPeriod[] {
  const base = [
    { q: 1, rev: 260, ebitda: 92, ni: 40, date: '2024-03-31', year: 2024 },
    { q: 2, rev: 280, ebitda: 99, ni: 43, date: '2024-06-30', year: 2024 },
    { q: 3, rev: 300, ebitda: 106, ni: 46, date: '2024-09-30', year: 2024 },
    { q: 4, rev: 310, ebitda: 109, ni: 48.54, date: '2024-12-31', year: 2024 },
  ];
  return base.map((b) =>
    makePeriod({
      label: `${b.q}Q24`,
      periodType: 'Q',
      fiscalYear: b.year,
      fiscalQuarter: b.q,
      endDate: b.date,
      income: { revenue: b.rev, ebitda: b.ebitda, da: 23, netIncome: b.ni, dilutedShares: 100 },
      balance: { cash: 240, ppe: 760, totalEquity: 700, shortTermDebt: 90, longTermDebt: 430 },
      cashFlow: { netIncome: b.ni, da: 23, cfo: b.ni + 23, capex: -26 },
    }),
  );
}
