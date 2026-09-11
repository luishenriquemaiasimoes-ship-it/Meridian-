import { add, isNum, mean, safeDiv, sub, sum } from './core';
import type { BalanceSheet, FinancialPeriod, IncomeStatement } from './types';

/* --------------------------- Margins ---------------------------- */

export const grossMargin = (i: IncomeStatement) => safeDiv(i.grossProfit, i.revenue);
export const ebitdaMargin = (i: IncomeStatement) => safeDiv(i.ebitda, i.revenue);
export const ebitMargin = (i: IncomeStatement) => safeDiv(i.ebit, i.revenue);
export const netMargin = (i: IncomeStatement) => safeDiv(i.netIncome, i.revenue);

/* ------------------------- Cash generation ----------------------- */

/**
 * Free cash flow to the firm's equity holders as reported: CFO less capex.
 * `capex` is stored as a negative number in the cash-flow statement, so it is
 * added rather than subtracted.
 */
export function freeCashFlow(p: FinancialPeriod): number | null {
  const { cfo, capex } = p.cashFlow;
  if (!isNum(cfo)) return null;
  if (!isNum(capex)) return cfo;
  return cfo + (capex <= 0 ? capex : -capex);
}

export const fcfMargin = (p: FinancialPeriod) => safeDiv(freeCashFlow(p), p.income.revenue);
export const fcfConversion = (p: FinancialPeriod) => safeDiv(freeCashFlow(p), p.income.ebitda);
export const capexToRevenue = (p: FinancialPeriod) =>
  safeDiv(isNum(p.cashFlow.capex) ? Math.abs(p.cashFlow.capex) : null, p.income.revenue);
export const capexToDA = (p: FinancialPeriod) =>
  safeDiv(isNum(p.cashFlow.capex) ? Math.abs(p.cashFlow.capex) : null, p.income.da);

/* ---------------------------- Leverage --------------------------- */

export function totalDebt(b: BalanceSheet): number | null {
  return sum(b.shortTermDebt, b.longTermDebt, b.leaseLiabilities);
}

export function netDebt(b: BalanceSheet): number | null {
  const d = totalDebt(b);
  if (!isNum(d)) return null;
  return d - (isNum(b.cash) ? b.cash : 0);
}

export const netDebtToEbitda = (p: FinancialPeriod) => safeDiv(netDebt(p.balance), p.income.ebitda);
export const debtToEquity = (b: BalanceSheet) => safeDiv(totalDebt(b), b.totalEquity);
export const netDebtToEquity = (b: BalanceSheet) => safeDiv(netDebt(b), b.totalEquity);

/** EBIT / |net financial expense|. Null when the company has net financial income. */
export function interestCoverage(p: FinancialPeriod): number | null {
  const fin = p.income.financialResult;
  if (!isNum(p.income.ebit) || !isNum(fin) || fin >= 0) return null;
  return p.income.ebit / Math.abs(fin);
}

/* ---------------------------- Returns ---------------------------- */

export function effectiveTaxRate(i: IncomeStatement): number | null {
  if (!isNum(i.taxes) || !isNum(i.ebt) || i.ebt === 0) return null;
  const r = i.taxes / i.ebt;
  return Number.isFinite(r) ? r : null;
}

/** Return on equity. Uses average equity when a prior period is supplied. */
export function roe(current: FinancialPeriod, prior?: FinancialPeriod | null): number | null {
  const base = prior
    ? mean([current.balance.totalEquity, prior.balance.totalEquity])
    : current.balance.totalEquity;
  return safeDiv(current.income.netIncome, base);
}

export function roa(current: FinancialPeriod, prior?: FinancialPeriod | null): number | null {
  const base = prior
    ? mean([current.balance.totalAssets, prior.balance.totalAssets])
    : current.balance.totalAssets;
  return safeDiv(current.income.netIncome, base);
}

/** Capital employed = total assets - non-interest-bearing current liabilities. */
export function capitalEmployed(b: BalanceSheet): number | null {
  if (!isNum(b.totalAssets)) return null;
  const nibcl = sum(b.accountsPayable, b.otherCurrentLiabilities);
  return b.totalAssets - (isNum(nibcl) ? nibcl : 0);
}

export function roce(current: FinancialPeriod, prior?: FinancialPeriod | null): number | null {
  const base = prior
    ? mean([capitalEmployed(current.balance), capitalEmployed(prior.balance)])
    : capitalEmployed(current.balance);
  return safeDiv(current.income.ebit, base);
}

/* --------------------------- Efficiency -------------------------- */

export function assetTurnover(current: FinancialPeriod, prior?: FinancialPeriod | null): number | null {
  const base = prior
    ? mean([current.balance.totalAssets, prior.balance.totalAssets])
    : current.balance.totalAssets;
  return safeDiv(current.income.revenue, base);
}

export function inventoryTurnover(current: FinancialPeriod, prior?: FinancialPeriod | null): number | null {
  const base = prior
    ? mean([current.balance.inventory, prior.balance.inventory])
    : current.balance.inventory;
  return safeDiv(current.income.cogs, base);
}

export function receivablesTurnover(current: FinancialPeriod, prior?: FinancialPeriod | null): number | null {
  const base = prior
    ? mean([current.balance.accountsReceivable, prior.balance.accountsReceivable])
    : current.balance.accountsReceivable;
  return safeDiv(current.income.revenue, base);
}

/* ------------------------- Working capital ----------------------- */

const DAYS_IN_YEAR = 365;

export function dso(p: FinancialPeriod, days = DAYS_IN_YEAR): number | null {
  const r = safeDiv(p.balance.accountsReceivable, p.income.revenue);
  return isNum(r) ? r * days : null;
}

export function dio(p: FinancialPeriod, days = DAYS_IN_YEAR): number | null {
  const r = safeDiv(p.balance.inventory, p.income.cogs);
  return isNum(r) ? r * days : null;
}

export function dpo(p: FinancialPeriod, days = DAYS_IN_YEAR): number | null {
  const r = safeDiv(p.balance.accountsPayable, p.income.cogs);
  return isNum(r) ? r * days : null;
}

export function cashConversionCycle(p: FinancialPeriod, days = DAYS_IN_YEAR): number | null {
  const a = dso(p, days);
  const b = dio(p, days);
  const c = dpo(p, days);
  if (!isNum(a) || !isNum(b) || !isNum(c)) return null;
  return a + b - c;
}

/** Operating net working capital (excludes cash and debt). */
export function netWorkingCapital(b: BalanceSheet): number | null {
  const opAssets = sum(b.accountsReceivable, b.inventory, b.otherCurrentAssets);
  const opLiabs = sum(b.accountsPayable, b.otherCurrentLiabilities);
  if (!isNum(opAssets) && !isNum(opLiabs)) return null;
  return (opAssets ?? 0) - (opLiabs ?? 0);
}

export function nwcChange(current: FinancialPeriod, prior: FinancialPeriod | null): number | null {
  if (!prior) return null;
  return sub(netWorkingCapital(current.balance), netWorkingCapital(prior.balance));
}

/* ------------------------ Per-share metrics ---------------------- */

export function bookValuePerShare(p: FinancialPeriod): number | null {
  const equityExMinority = isNum(p.balance.minorityInterestEquity)
    ? sub(p.balance.totalEquity, p.balance.minorityInterestEquity)
    : p.balance.totalEquity;
  return safeDiv(equityExMinority, p.income.dilutedShares);
}

export function fcfPerShare(p: FinancialPeriod): number | null {
  return safeDiv(freeCashFlow(p), p.income.dilutedShares);
}

export function dividendPerShare(p: FinancialPeriod): number | null {
  const div = p.cashFlow.dividendsPaid;
  if (!isNum(div)) return null;
  return safeDiv(Math.abs(div), p.income.dilutedShares);
}

/* -------------------------- Bundle helper ------------------------ */

export interface FundamentalSnapshot {
  grossMargin: number | null;
  ebitdaMargin: number | null;
  ebitMargin: number | null;
  netMargin: number | null;
  fcfMargin: number | null;
  roe: number | null;
  roa: number | null;
  roce: number | null;
  assetTurnover: number | null;
  inventoryTurnover: number | null;
  receivablesTurnover: number | null;
  dso: number | null;
  dio: number | null;
  dpo: number | null;
  cashConversionCycle: number | null;
  netDebt: number | null;
  totalDebt: number | null;
  netDebtToEbitda: number | null;
  debtToEquity: number | null;
  interestCoverage: number | null;
  cfo: number | null;
  capex: number | null;
  fcf: number | null;
  fcfConversion: number | null;
  capexToRevenue: number | null;
  effectiveTaxRate: number | null;
  bookValuePerShare: number | null;
  netWorkingCapital: number | null;
}

/** A snapshot for a company whose statements are not loaded yet. */
const EMPTY_SNAPSHOT: FundamentalSnapshot = {
  grossMargin: null,
  ebitdaMargin: null,
  ebitMargin: null,
  netMargin: null,
  fcfMargin: null,
  roe: null,
  roa: null,
  roce: null,
  assetTurnover: null,
  inventoryTurnover: null,
  receivablesTurnover: null,
  dso: null,
  dio: null,
  dpo: null,
  cashConversionCycle: null,
  netDebt: null,
  totalDebt: null,
  netDebtToEbitda: null,
  debtToEquity: null,
  interestCoverage: null,
  cfo: null,
  capex: null,
  fcf: null,
  fcfConversion: null,
  capexToRevenue: null,
  effectiveTaxRate: null,
  bookValuePerShare: null,
  netWorkingCapital: null,
};

/**
 * Every ratio for one period. The period is nullable because a company can be
 * covered before its statements are loaded, and the honest answer then is a
 * snapshot of nulls — not a snapshot computed from an object shaped like a
 * period but empty, which is how this used to throw.
 */
export function fundamentalSnapshot(
  p: FinancialPeriod | null | undefined,
  prior?: FinancialPeriod | null,
): FundamentalSnapshot {
  if (!p?.income) return EMPTY_SNAPSHOT;
  return {
    grossMargin: grossMargin(p.income),
    ebitdaMargin: ebitdaMargin(p.income),
    ebitMargin: ebitMargin(p.income),
    netMargin: netMargin(p.income),
    fcfMargin: fcfMargin(p),
    roe: roe(p, prior),
    roa: roa(p, prior),
    roce: roce(p, prior),
    assetTurnover: assetTurnover(p, prior),
    inventoryTurnover: inventoryTurnover(p, prior),
    receivablesTurnover: receivablesTurnover(p, prior),
    dso: dso(p),
    dio: dio(p),
    dpo: dpo(p),
    cashConversionCycle: cashConversionCycle(p),
    netDebt: netDebt(p.balance),
    totalDebt: totalDebt(p.balance),
    netDebtToEbitda: netDebtToEbitda(p),
    debtToEquity: debtToEquity(p.balance),
    interestCoverage: interestCoverage(p),
    cfo: p.cashFlow.cfo,
    capex: p.cashFlow.capex,
    fcf: freeCashFlow(p),
    fcfConversion: fcfConversion(p),
    capexToRevenue: capexToRevenue(p),
    effectiveTaxRate: effectiveTaxRate(p.income),
    bookValuePerShare: bookValuePerShare(p),
    netWorkingCapital: netWorkingCapital(p.balance),
  };
}

export { add, sub };
