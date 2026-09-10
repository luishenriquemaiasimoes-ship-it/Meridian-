import { isNum, safeDiv } from './core';

export interface CostOfEquityInputs {
  riskFreeRate: number;
  beta: number;
  equityRiskPremium: number;
  /** Optional country / size premium added on top of CAPM. */
  countryRiskPremium?: number;
  sizePremium?: number;
}

/** CAPM: Ke = Rf + Beta x ERP (+ country premium + size premium). */
export function costOfEquity(i: CostOfEquityInputs): number | null {
  const { riskFreeRate: rf, beta, equityRiskPremium: erp } = i;
  if (!isNum(rf) || !isNum(beta) || !isNum(erp)) return null;
  return rf + beta * erp + (i.countryRiskPremium ?? 0) + (i.sizePremium ?? 0);
}

/** Hamada: levered beta = unlevered beta x [1 + (1 - t) x D/E]. */
export function leveredBeta(unleveredBeta: number, debtToEquity: number, taxRate: number): number | null {
  if (!isNum(unleveredBeta) || !isNum(debtToEquity) || !isNum(taxRate)) return null;
  return unleveredBeta * (1 + (1 - taxRate) * debtToEquity);
}

export function unleveredBeta(levered: number, debtToEquity: number, taxRate: number): number | null {
  if (!isNum(levered) || !isNum(debtToEquity) || !isNum(taxRate)) return null;
  const denom = 1 + (1 - taxRate) * debtToEquity;
  return denom === 0 ? null : levered / denom;
}

/** Pre-tax cost of debt implied by the reported financial expense. */
export function impliedCostOfDebt(financialExpense: number | null, averageGrossDebt: number | null): number | null {
  if (!isNum(financialExpense) || !isNum(averageGrossDebt) || averageGrossDebt === 0) return null;
  return Math.abs(financialExpense) / averageGrossDebt;
}

export interface WaccInputs {
  costOfEquity: number;
  costOfDebt: number;      // pre-tax
  taxRate: number;
  marketValueEquity: number;
  marketValueDebt: number;
}

export interface WaccResult {
  wacc: number | null;
  equityWeight: number | null;
  debtWeight: number | null;
  afterTaxCostOfDebt: number | null;
  costOfEquity: number | null;
  costOfDebt: number | null;
  taxRate: number | null;
}

/** WACC = E/(D+E) x Ke + D/(D+E) x Kd x (1 - t). */
export function calculateWacc(i: WaccInputs): WaccResult {
  const { costOfEquity: ke, costOfDebt: kd, taxRate: t, marketValueEquity: e, marketValueDebt: d } = i;
  const base: WaccResult = {
    wacc: null, equityWeight: null, debtWeight: null, afterTaxCostOfDebt: null,
    costOfEquity: isNum(ke) ? ke : null, costOfDebt: isNum(kd) ? kd : null, taxRate: isNum(t) ? t : null,
  };
  if (!isNum(ke) || !isNum(kd) || !isNum(t) || !isNum(e) || !isNum(d)) return base;
  const total = e + d;
  if (total <= 0) return base;
  const we = e / total;
  const wd = d / total;
  const atKd = kd * (1 - t);
  return {
    ...base,
    equityWeight: we,
    debtWeight: wd,
    afterTaxCostOfDebt: atKd,
    wacc: we * ke + wd * atKd,
  };
}

/** Convenience: full CAPM -> WACC chain in one call. */
export function buildWacc(params: {
  riskFreeRate: number;
  beta: number;
  equityRiskPremium: number;
  countryRiskPremium?: number;
  sizePremium?: number;
  costOfDebt: number;
  taxRate: number;
  marketValueEquity: number;
  marketValueDebt: number;
}): WaccResult & { impliedCostOfEquity: number | null } {
  const ke = costOfEquity(params);
  const w = calculateWacc({
    costOfEquity: ke ?? NaN,
    costOfDebt: params.costOfDebt,
    taxRate: params.taxRate,
    marketValueEquity: params.marketValueEquity,
    marketValueDebt: params.marketValueDebt,
  });
  return { ...w, impliedCostOfEquity: ke };
}

/** Debt/equity from market values, used for re-levering beta. */
export function marketDebtToEquity(marketValueDebt: number, marketValueEquity: number): number | null {
  return safeDiv(marketValueDebt, marketValueEquity);
}
