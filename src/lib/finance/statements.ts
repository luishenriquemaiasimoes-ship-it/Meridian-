import { add, cagr, growth, isNum, safeDiv, sub, sum } from './core';
import type {
  BalanceSheet,
  CashFlowStatement,
  FinancialPeriod,
  IncomeStatement,
  NormalizationAdjustment,
} from './types';

export const EMPTY_INCOME: IncomeStatement = {
  revenue: null, cogs: null, grossProfit: null, sga: null, rnd: null, otherOpex: null,
  ebitda: null, da: null, ebit: null, financialResult: null, ebt: null, taxes: null,
  netIncome: null, minorityInterest: null, eps: null, dilutedShares: null,
};

export const EMPTY_BALANCE: BalanceSheet = {
  cash: null, accountsReceivable: null, inventory: null, otherCurrentAssets: null,
  ppe: null, intangibles: null, goodwill: null, otherAssets: null, totalAssets: null,
  accountsPayable: null, shortTermDebt: null, otherCurrentLiabilities: null,
  longTermDebt: null, leaseLiabilities: null, otherLiabilities: null, totalLiabilities: null,
  shareCapital: null, retainedEarnings: null, treasuryStock: null,
  minorityInterestEquity: null, totalEquity: null,
};

export const EMPTY_CASHFLOW: CashFlowStatement = {
  netIncome: null, da: null, workingCapitalChange: null, otherOperating: null, cfo: null,
  capex: null, acquisitions: null, otherInvesting: null, cfi: null,
  debtIssued: null, debtRepaid: null, dividendsPaid: null, buybacks: null,
  otherFinancing: null, cff: null, netChangeInCash: null,
};

/**
 * Fills the derivable lines of an income statement from whatever was reported.
 * Conventions: `cogs`, `sga`, `rnd`, `otherOpex`, `da` and `taxes` are stored as
 * positive magnitudes of costs; `financialResult` is signed (negative = expense).
 */
export function deriveIncomeStatement(i: IncomeStatement): IncomeStatement {
  const out: IncomeStatement = { ...i };

  if (!isNum(out.grossProfit) && isNum(out.revenue) && isNum(out.cogs)) {
    out.grossProfit = out.revenue - out.cogs;
  }
  if (!isNum(out.ebit) && isNum(out.ebitda) && isNum(out.da)) {
    out.ebit = out.ebitda - out.da;
  }
  if (!isNum(out.ebitda) && isNum(out.ebit) && isNum(out.da)) {
    out.ebitda = out.ebit + out.da;
  }
  if (!isNum(out.ebit) && isNum(out.grossProfit)) {
    const opex = sum(out.sga, out.rnd, out.otherOpex);
    if (isNum(opex)) out.ebit = out.grossProfit - opex;
  }
  if (!isNum(out.ebitda) && isNum(out.ebit) && isNum(out.da)) out.ebitda = out.ebit + out.da;
  if (!isNum(out.ebt) && isNum(out.ebit) && isNum(out.financialResult)) {
    out.ebt = out.ebit + out.financialResult;
  }
  if (!isNum(out.netIncome) && isNum(out.ebt) && isNum(out.taxes)) {
    out.netIncome = out.ebt - out.taxes - (isNum(out.minorityInterest) ? out.minorityInterest : 0);
  }
  if (!isNum(out.taxes) && isNum(out.ebt) && isNum(out.netIncome)) {
    out.taxes = out.ebt - out.netIncome - (isNum(out.minorityInterest) ? out.minorityInterest : 0);
  }
  if (!isNum(out.eps) && isNum(out.netIncome) && isNum(out.dilutedShares) && out.dilutedShares !== 0) {
    out.eps = out.netIncome / out.dilutedShares;
  }
  return out;
}

export function deriveBalanceSheet(b: BalanceSheet): BalanceSheet {
  const out: BalanceSheet = { ...b };
  if (!isNum(out.totalAssets)) {
    out.totalAssets = sum(
      out.cash, out.accountsReceivable, out.inventory, out.otherCurrentAssets,
      out.ppe, out.intangibles, out.goodwill, out.otherAssets,
    );
  }
  if (!isNum(out.totalLiabilities)) {
    out.totalLiabilities = sum(
      out.accountsPayable, out.shortTermDebt, out.otherCurrentLiabilities,
      out.longTermDebt, out.leaseLiabilities, out.otherLiabilities,
    );
  }
  if (!isNum(out.totalEquity)) {
    const stated = sum(out.shareCapital, out.retainedEarnings, out.treasuryStock, out.minorityInterestEquity);
    out.totalEquity = isNum(stated) ? stated : sub(out.totalAssets, out.totalLiabilities);
  }
  return out;
}

export function deriveCashFlow(c: CashFlowStatement): CashFlowStatement {
  const out: CashFlowStatement = { ...c };
  if (!isNum(out.cfo)) {
    out.cfo = sum(out.netIncome, out.da, out.workingCapitalChange, out.otherOperating);
  }
  if (!isNum(out.cfi)) out.cfi = sum(out.capex, out.acquisitions, out.otherInvesting);
  if (!isNum(out.cff)) {
    out.cff = sum(out.debtIssued, out.debtRepaid, out.dividendsPaid, out.buybacks, out.otherFinancing);
  }
  if (!isNum(out.netChangeInCash)) out.netChangeInCash = sum(out.cfo, out.cfi, out.cff);
  return out;
}

export function derivePeriod(p: FinancialPeriod): FinancialPeriod {
  return {
    ...p,
    income: deriveIncomeStatement(p.income),
    balance: deriveBalanceSheet(p.balance),
    cashFlow: deriveCashFlow(p.cashFlow),
  };
}

/** Balance-sheet identity check: Assets = Liabilities + Equity (within tolerance). */
export function balanceSheetCheck(b: BalanceSheet, tolerancePct = 0.005): {
  balances: boolean; gap: number | null; gapPct: number | null;
} {
  const rhs = add(b.totalLiabilities, b.totalEquity);
  const gap = sub(b.totalAssets, rhs);
  const gapPct = safeDiv(gap, b.totalAssets);
  return {
    balances: isNum(gapPct) ? Math.abs(gapPct) <= tolerancePct : false,
    gap,
    gapPct,
  };
}

/* ------------------------------------------------------------------ */
/* Aggregation                                                         */
/* ------------------------------------------------------------------ */

const FLOW_INCOME_KEYS: (keyof IncomeStatement)[] = [
  'revenue', 'cogs', 'grossProfit', 'sga', 'rnd', 'otherOpex', 'ebitda', 'da',
  'ebit', 'financialResult', 'ebt', 'taxes', 'netIncome', 'minorityInterest', 'eps',
];

const FLOW_CF_KEYS: (keyof CashFlowStatement)[] = [
  'netIncome', 'da', 'workingCapitalChange', 'otherOperating', 'cfo', 'capex',
  'acquisitions', 'otherInvesting', 'cfi', 'debtIssued', 'debtRepaid',
  'dividendsPaid', 'buybacks', 'otherFinancing', 'cff', 'netChangeInCash',
];

/**
 * Last twelve months. Flow items are summed across the four most recent
 * quarters; stock items (balance sheet, share count) are taken from the latest
 * quarter. Returns null when fewer than four quarters are available — LTM is
 * never approximated from an incomplete window.
 */
export function computeLTM(quarters: FinancialPeriod[]): FinancialPeriod | null {
  const qs = quarters
    .filter((q) => q.periodType === 'Q')
    .slice()
    .sort((a, b) => a.endDate.localeCompare(b.endDate));
  if (qs.length < 4) return null;
  const window = qs.slice(-4);
  const latest = window[window.length - 1];

  const income = { ...EMPTY_INCOME };
  for (const k of FLOW_INCOME_KEYS) {
    (income[k] as number | null) = sum(...window.map((q) => q.income[k] as number | null));
  }
  income.dilutedShares = latest.income.dilutedShares;
  if (isNum(income.netIncome) && isNum(income.dilutedShares) && income.dilutedShares !== 0) {
    income.eps = income.netIncome / income.dilutedShares;
  }

  const cashFlow = { ...EMPTY_CASHFLOW };
  for (const k of FLOW_CF_KEYS) {
    (cashFlow[k] as number | null) = sum(...window.map((q) => q.cashFlow[k] as number | null));
  }

  return derivePeriod({
    label: 'LTM',
    periodType: 'LTM',
    fiscalYear: latest.fiscalYear,
    fiscalQuarter: latest.fiscalQuarter ?? null,
    endDate: latest.endDate,
    currency: latest.currency,
    standard: latest.standard,
    unit: latest.unit,
    income,
    balance: { ...latest.balance },
    cashFlow,
    source: 'MERIDIAN LTM aggregation',
  });
}

/** Year-over-year comparison for a quarter against the same quarter a year prior. */
export function findYoYComparable(
  target: FinancialPeriod,
  all: FinancialPeriod[],
): FinancialPeriod | null {
  if (target.periodType === 'Q') {
    return (
      all.find(
        (p) =>
          p.periodType === 'Q' &&
          p.fiscalQuarter === target.fiscalQuarter &&
          p.fiscalYear === target.fiscalYear - 1,
      ) ?? null
    );
  }
  return all.find((p) => p.periodType === 'FY' && p.fiscalYear === target.fiscalYear - 1) ?? null;
}

export function findQoQComparable(
  target: FinancialPeriod,
  all: FinancialPeriod[],
): FinancialPeriod | null {
  if (target.periodType !== 'Q') return null;
  const qs = all
    .filter((p) => p.periodType === 'Q')
    .slice()
    .sort((a, b) => a.endDate.localeCompare(b.endDate));
  const idx = qs.findIndex((p) => p.endDate === target.endDate);
  return idx > 0 ? qs[idx - 1] : null;
}

export interface SeriesPoint { label: string; endDate: string; value: number | null }

export function series(
  periods: FinancialPeriod[],
  pick: (p: FinancialPeriod) => number | null,
): SeriesPoint[] {
  return periods.map((p) => ({ label: p.label, endDate: p.endDate, value: pick(p) }));
}

/** CAGR across a series of annual points; falls back to null when unusable. */
export function seriesCagr(points: SeriesPoint[]): number | null {
  const vals = points.filter((p) => isNum(p.value));
  if (vals.length < 2) return null;
  return cagr(vals[vals.length - 1].value, vals[0].value, vals.length - 1);
}

export function seriesGrowth(points: SeriesPoint[]): (number | null)[] {
  return points.map((p, i) => (i === 0 ? null : growth(p.value, points[i - 1].value)));
}

/* ------------------------------------------------------------------ */
/* Normalization                                                       */
/* ------------------------------------------------------------------ */

export interface NormalizedResult {
  reportedEbitda: number | null;
  ebitdaAdjustments: number | null;
  normalizedEbitda: number | null;
  reportedEbit: number | null;
  ebitAdjustments: number | null;
  normalizedEbit: number | null;
  reportedNetIncome: number | null;
  netIncomeAdjustments: number | null;
  normalizedNetIncome: number | null;
  applied: NormalizationAdjustment[];
}

/**
 * Applies user-authored adjustments to a reported period. An EBITDA adjustment
 * flows through to EBIT and net income (net of tax) unless the user has already
 * booked an explicit adjustment at that level.
 */
export function normalizePeriod(
  period: FinancialPeriod,
  adjustments: NormalizationAdjustment[],
  taxRate = 0.34,
): NormalizedResult {
  const applied = adjustments.filter((a) => a.periodLabel === period.label);
  const byLine = (line: NormalizationAdjustment['lineItem']) =>
    applied.filter((a) => a.lineItem === line).reduce((acc, a) => acc + a.amount, 0);

  const ebitdaAdj = applied.some((a) => a.lineItem === 'EBITDA') ? byLine('EBITDA') : null;
  const ebitOwn = applied.some((a) => a.lineItem === 'EBIT') ? byLine('EBIT') : null;
  const niOwn = applied.some((a) => a.lineItem === 'NET_INCOME') ? byLine('NET_INCOME') : null;

  // EBITDA adjustments cascade down the P&L.
  const ebitAdj =
    ebitOwn !== null ? ebitOwn + (ebitdaAdj ?? 0) : ebitdaAdj !== null ? ebitdaAdj : null;
  const cascadedToNi = ebitAdj !== null ? ebitAdj * (1 - taxRate) : null;
  const niAdj =
    niOwn !== null ? niOwn + (cascadedToNi ?? 0) : cascadedToNi !== null ? cascadedToNi : null;

  const r = period.income;
  return {
    reportedEbitda: r.ebitda,
    ebitdaAdjustments: ebitdaAdj,
    normalizedEbitda: ebitdaAdj === null ? r.ebitda : add(r.ebitda, ebitdaAdj),
    reportedEbit: r.ebit,
    ebitAdjustments: ebitAdj,
    normalizedEbit: ebitAdj === null ? r.ebit : add(r.ebit, ebitAdj),
    reportedNetIncome: r.netIncome,
    netIncomeAdjustments: niAdj,
    normalizedNetIncome: niAdj === null ? r.netIncome : add(r.netIncome, niAdj),
    applied,
  };
}
