import { describe, expect, it } from 'vitest';
import {
  assetTurnover, bookValuePerShare, capitalEmployed, cashConversionCycle,
  debtToEquity, dio, dpo, dso, ebitMargin, ebitdaMargin, effectiveTaxRate,
  fcfConversion, fcfMargin, freeCashFlow, fundamentalSnapshot, grossMargin,
  interestCoverage, inventoryTurnover, netDebt, netDebtToEbitda, netMargin,
  netWorkingCapital, nwcChange, receivablesTurnover, roa, roce, roe, totalDebt,
} from '@/lib/finance/ratios';
import { EMPTY_BALANCE } from '@/lib/finance/statements';
import { FY2023, FY2024, makePeriod } from './fixtures';

describe('margins', () => {
  it('gross margin', () => expect(grossMargin(FY2024.income)).toBeCloseTo(0.4173913, 6));
  it('EBITDA margin', () => expect(ebitdaMargin(FY2024.income)).toBeCloseTo(0.3530435, 6));
  it('EBIT margin', () => expect(ebitMargin(FY2024.income)).toBeCloseTo(0.2730435, 6));
  it('net margin', () => expect(netMargin(FY2024.income)).toBeCloseTo(0.1543826, 6));

  it('returns null on zero revenue', () => {
    const p = makePeriod({ label: 'Z', fiscalYear: 2024, endDate: '2024-12-31', income: { revenue: 0, ebitda: 10 } });
    expect(ebitdaMargin(p.income)).toBeNull();
  });

  it('returns null when revenue is missing', () => {
    const p = makePeriod({ label: 'Z', fiscalYear: 2024, endDate: '2024-12-31', income: { ebitda: 10 } });
    expect(ebitdaMargin(p.income)).toBeNull();
  });

  it('reports a negative margin for a loss-making period', () => {
    const p = makePeriod({ label: 'L', fiscalYear: 2024, endDate: '2024-12-31', income: { revenue: 500, ebitda: -50 } });
    expect(ebitdaMargin(p.income)).toBeCloseTo(-0.1, 10);
  });
});

describe('free cash flow', () => {
  it('is CFO less capex', () => expect(freeCashFlow(FY2024)).toBeCloseTo(144.54, 6));

  it('treats capex sign-agnostically', () => {
    const p = makePeriod({
      label: 'P', fiscalYear: 2024, endDate: '2024-12-31',
      cashFlow: { cfo: 200, capex: 50 },
    });
    expect(freeCashFlow(p)).toBe(150);
  });

  it('falls back to CFO when capex is missing', () => {
    const p = makePeriod({ label: 'P', fiscalYear: 2024, endDate: '2024-12-31', cashFlow: { cfo: 200 } });
    expect(freeCashFlow(p)).toBe(200);
  });

  it('is null when CFO is unavailable', () => {
    const p = makePeriod({ label: 'P', fiscalYear: 2024, endDate: '2024-12-31', cashFlow: { capex: -50 } });
    expect(freeCashFlow(p)).toBeNull();
  });

  it('can be negative', () => {
    const p = makePeriod({ label: 'P', fiscalYear: 2024, endDate: '2024-12-31', cashFlow: { cfo: 40, capex: -120 } });
    expect(freeCashFlow(p)).toBe(-80);
  });

  it('margins and conversion', () => {
    expect(fcfMargin(FY2024)).toBeCloseTo(0.1256870, 6);
    expect(fcfConversion(FY2024)).toBeCloseTo(0.3560099, 6);
  });
});

describe('leverage', () => {
  it('total debt includes leases', () => expect(totalDebt(FY2024.balance)).toBe(575));
  it('net debt nets cash', () => expect(netDebt(FY2024.balance)).toBe(335));
  it('net debt/EBITDA', () => expect(netDebtToEbitda(FY2024)).toBeCloseTo(0.8251232, 6));
  it('debt/equity', () => expect(debtToEquity(FY2024.balance)).toBeCloseTo(0.8214286, 6));
  it('interest coverage', () => expect(interestCoverage(FY2024)).toBeCloseTo(6.9777778, 6));

  it('net cash position produces negative net debt', () => {
    const b = { ...FY2024.balance, cash: 900 };
    expect(netDebt(b)).toBe(-325);
  });

  it('interest coverage is null when the company has net financial income', () => {
    const p = makePeriod({
      label: 'P', fiscalYear: 2024, endDate: '2024-12-31',
      income: { revenue: 100, ebit: 20, financialResult: 5 },
    });
    expect(interestCoverage(p)).toBeNull();
  });

  it('debt is null when nothing is reported', () => {
    expect(totalDebt(EMPTY_BALANCE)).toBeNull();
    expect(netDebt(EMPTY_BALANCE)).toBeNull();
  });
});

describe('returns', () => {
  it('ROE uses average equity when a prior period is supplied', () => {
    expect(roe(FY2024, FY2023)).toBeCloseTo(0.2731385, 6);
  });
  it('ROE falls back to closing equity', () => {
    expect(roe(FY2024)).toBeCloseTo(0.2536286, 6);
  });
  it('ROA', () => expect(roa(FY2024, FY2023)).toBeCloseTo(0.1211877, 6));
  it('capital employed excludes non-interest-bearing current liabilities', () => {
    expect(capitalEmployed(FY2024.balance)).toBe(1350);
  });
  it('ROCE', () => expect(roce(FY2024, FY2023)).toBeCloseTo(0.2443580, 6));
  it('ROE is null with zero equity', () => {
    const p = makePeriod({ label: 'P', fiscalYear: 2024, endDate: '2024-12-31', income: { netIncome: 10 }, balance: { totalEquity: 0 } });
    expect(roe(p)).toBeNull();
  });
  it('ROE is negative on a loss', () => {
    const p = makePeriod({ label: 'P', fiscalYear: 2024, endDate: '2024-12-31', income: { netIncome: -50 }, balance: { totalEquity: 500 } });
    expect(roe(p)).toBeCloseTo(-0.1, 10);
  });
});

describe('efficiency and working capital', () => {
  it('asset turnover', () => expect(assetTurnover(FY2024, FY2023)).toBeCloseTo(0.7849829, 6));
  it('inventory turnover', () => expect(inventoryTurnover(FY2024, FY2023)).toBeCloseTo(5.2755906, 6));
  it('receivables turnover', () => expect(receivablesTurnover(FY2024, FY2023)).toBeCloseTo(7.1428571, 6));
  it('DSO', () => expect(dso(FY2024)).toBeCloseTo(54.5913043, 5));
  it('DIO', () => expect(dio(FY2024)).toBeCloseTo(73, 5));
  it('DPO', () => expect(dpo(FY2024)).toBeCloseTo(67.5522388, 5));
  it('cash conversion cycle', () => expect(cashConversionCycle(FY2024)).toBeCloseTo(60.0390655, 5));
  it('CCC is null when any leg is missing', () => {
    const p = makePeriod({ label: 'P', fiscalYear: 2024, endDate: '2024-12-31', income: { revenue: 100, cogs: 60 }, balance: { accountsReceivable: 10 } });
    expect(cashConversionCycle(p)).toBeNull();
  });
  it('net working capital excludes cash and debt', () => {
    expect(netWorkingCapital(FY2024.balance)).toBe(150);
    expect(netWorkingCapital(FY2023.balance)).toBe(130);
  });
  it('NWC change', () => {
    expect(nwcChange(FY2024, FY2023)).toBe(20);
    expect(nwcChange(FY2024, null)).toBeNull();
  });
});

describe('tax and per-share', () => {
  it('effective tax rate', () => expect(effectiveTaxRate(FY2024.income)).toBeCloseTo(0.34, 6));
  it('is null with zero pre-tax income', () => {
    expect(effectiveTaxRate({ ...FY2024.income, ebt: 0 })).toBeNull();
  });
  it('book value per share', () => expect(bookValuePerShare(FY2024)).toBe(7));
  it('book value per share nets out minority interest', () => {
    const p = makePeriod({
      label: 'P', fiscalYear: 2024, endDate: '2024-12-31',
      income: { dilutedShares: 100 },
      balance: { totalEquity: 700, minorityInterestEquity: 100 },
    });
    expect(bookValuePerShare(p)).toBe(6);
  });
});

describe('fundamentalSnapshot', () => {
  it('bundles every ratio for a period', () => {
    const s = fundamentalSnapshot(FY2024, FY2023);
    expect(s.ebitdaMargin).toBeCloseTo(0.3530435, 6);
    expect(s.netDebt).toBe(335);
    expect(s.fcf).toBeCloseTo(144.54, 6);
    expect(s.roe).toBeCloseTo(0.2731385, 6);
    expect(s.cashConversionCycle).toBeCloseTo(60.0390655, 5);
  });

  it('degrades to nulls rather than throwing on an empty period', () => {
    const p = makePeriod({ label: 'E', fiscalYear: 2024, endDate: '2024-12-31' });
    const s = fundamentalSnapshot(p);
    expect(s.ebitdaMargin).toBeNull();
    expect(s.roe).toBeNull();
    expect(s.fcf).toBeNull();
  });
});
