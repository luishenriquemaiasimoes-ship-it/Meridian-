import { bisect, discountFactor, isNum, safeDiv } from './core';

/* ================================================================
   DCF ENGINE
   FCFF = EBIT x (1 - t) + D&A - Capex - dNWC
   EV   = SUM PV(FCFF) + PV(Terminal value)
   ================================================================ */

export type TerminalMethod = 'GORDON' | 'EXIT_MULTIPLE';

export interface DcfAssumptions {
  /** Fiscal year of the last actual period, e.g. 2025. */
  baseYear: number;
  /** Revenue of the last actual period, in reporting units. */
  baseRevenue: number;
  /** Operating net working capital at the base year (for the first dNWC). */
  baseNwc?: number | null;

  /** One entry per forecast year. Shorter arrays reuse the final value. */
  revenueGrowth: number[];
  ebitdaMargin: number[];
  daPctRevenue: number[];
  capexPctRevenue: number[];
  nwcPctRevenue: number[];

  taxRate: number;
  wacc: number;

  terminalMethod: TerminalMethod;
  terminalGrowth: number;
  exitMultiple: number;

  netDebt: number;
  minorityInterest?: number;
  investments?: number;
  sharesOutstanding: number;
  currentPrice?: number | null;

  midYearConvention?: boolean;
}

export interface DcfYear {
  year: number;
  index: number;              // 1-based forecast index
  revenue: number;
  revenueGrowth: number;
  ebitdaMargin: number;
  ebitda: number;
  da: number;
  ebit: number;
  ebitMargin: number;
  taxes: number;
  nopat: number;
  capex: number;
  nwc: number;
  nwcChange: number;
  fcff: number;
  discountFactor: number;
  presentValue: number;
}

export interface DcfResult {
  years: DcfYear[];
  sumPvFcff: number | null;
  terminalValue: number | null;
  pvTerminalValue: number | null;
  terminalValuePctOfEv: number | null;
  enterpriseValue: number | null;
  netDebt: number;
  minorityInterest: number;
  investments: number;
  equityValue: number | null;
  sharesOutstanding: number;
  fairValuePerShare: number | null;
  currentPrice: number | null;
  upside: number | null;
  impliedExitMultiple: number | null;
  impliedPerpetuityGrowth: number | null;
  assumptions: DcfAssumptions;
  warnings: string[];
}

function at(arr: number[], i: number, fallback: number): number {
  if (!arr || arr.length === 0) return fallback;
  const v = arr[Math.min(i, arr.length - 1)];
  return isNum(v) ? v : fallback;
}

export function normalizeAssumptions(a: Partial<DcfAssumptions>): DcfAssumptions {
  return {
    baseYear: a.baseYear ?? new Date().getFullYear() - 1,
    baseRevenue: a.baseRevenue ?? 0,
    baseNwc: a.baseNwc ?? null,
    revenueGrowth: a.revenueGrowth?.length ? a.revenueGrowth : [0.05, 0.05, 0.04, 0.04, 0.03],
    ebitdaMargin: a.ebitdaMargin?.length ? a.ebitdaMargin : [0.25, 0.25, 0.25, 0.25, 0.25],
    daPctRevenue: a.daPctRevenue?.length ? a.daPctRevenue : [0.05],
    capexPctRevenue: a.capexPctRevenue?.length ? a.capexPctRevenue : [0.05],
    nwcPctRevenue: a.nwcPctRevenue?.length ? a.nwcPctRevenue : [0.1],
    taxRate: a.taxRate ?? 0.34,
    wacc: a.wacc ?? 0.11,
    terminalMethod: a.terminalMethod ?? 'GORDON',
    terminalGrowth: a.terminalGrowth ?? 0.03,
    exitMultiple: a.exitMultiple ?? 7,
    netDebt: a.netDebt ?? 0,
    minorityInterest: a.minorityInterest ?? 0,
    investments: a.investments ?? 0,
    sharesOutstanding: a.sharesOutstanding ?? 0,
    currentPrice: a.currentPrice ?? null,
    midYearConvention: a.midYearConvention ?? false,
  };
}

/** Projects the explicit forecast period. */
export function projectFcff(a: DcfAssumptions): DcfYear[] {
  const n = a.revenueGrowth.length;
  const years: DcfYear[] = [];
  let revenue = a.baseRevenue;
  let prevNwc = isNum(a.baseNwc)
    ? (a.baseNwc as number)
    : a.baseRevenue * at(a.nwcPctRevenue, 0, 0);

  for (let i = 0; i < n; i++) {
    const g = at(a.revenueGrowth, i, 0);
    revenue = revenue * (1 + g);
    const margin = at(a.ebitdaMargin, i, 0);
    const ebitda = revenue * margin;
    const da = revenue * at(a.daPctRevenue, i, 0);
    const ebit = ebitda - da;
    const taxes = ebit > 0 ? ebit * a.taxRate : 0; // no tax shield modelled on losses
    const nopatV = ebit - taxes;
    const capex = revenue * at(a.capexPctRevenue, i, 0);
    const nwc = revenue * at(a.nwcPctRevenue, i, 0);
    const dNwc = nwc - prevNwc;
    const fcff = nopatV + da - capex - dNwc;
    const df = discountFactor(a.wacc, i + 1, a.midYearConvention) ?? 0;

    years.push({
      year: a.baseYear + i + 1,
      index: i + 1,
      revenue,
      revenueGrowth: g,
      ebitdaMargin: margin,
      ebitda,
      da,
      ebit,
      ebitMargin: revenue !== 0 ? ebit / revenue : 0,
      taxes,
      nopat: nopatV,
      capex,
      nwc,
      nwcChange: dNwc,
      fcff,
      discountFactor: df,
      presentValue: fcff * df,
    });
    prevNwc = nwc;
  }
  return years;
}

export function gordonTerminalValue(
  finalFcff: number,
  wacc: number,
  terminalGrowth: number,
): number | null {
  if (!isNum(finalFcff) || !isNum(wacc) || !isNum(terminalGrowth)) return null;
  if (wacc <= terminalGrowth) return null; // undefined perpetuity
  return (finalFcff * (1 + terminalGrowth)) / (wacc - terminalGrowth);
}

export function exitMultipleTerminalValue(finalEbitda: number, multiple: number): number | null {
  if (!isNum(finalEbitda) || !isNum(multiple)) return null;
  return finalEbitda * multiple;
}

export function calculateDcf(input: Partial<DcfAssumptions>): DcfResult {
  const a = normalizeAssumptions(input);
  const warnings: string[] = [];

  if (a.sharesOutstanding <= 0) warnings.push('Shares outstanding is zero — per-share value unavailable.');
  if (a.baseRevenue <= 0) warnings.push('Base revenue is zero or negative — projection is not meaningful.');
  if (a.terminalMethod === 'GORDON' && a.wacc <= a.terminalGrowth) {
    warnings.push('WACC must exceed terminal growth for a Gordon terminal value.');
  }

  const years = projectFcff(a);
  const sumPvFcff = years.length ? years.reduce((s, y) => s + y.presentValue, 0) : null;
  const last = years[years.length - 1];

  let terminalValue: number | null = null;
  if (last) {
    terminalValue =
      a.terminalMethod === 'GORDON'
        ? gordonTerminalValue(last.fcff, a.wacc, a.terminalGrowth)
        : exitMultipleTerminalValue(last.ebitda, a.exitMultiple);
  }

  const tvDf = last ? discountFactor(a.wacc, last.index, a.midYearConvention) : null;
  const pvTerminalValue = isNum(terminalValue) && isNum(tvDf) ? terminalValue * tvDf : null;

  const enterpriseValue =
    isNum(sumPvFcff) && isNum(pvTerminalValue) ? sumPvFcff + pvTerminalValue : null;

  const equityValue = isNum(enterpriseValue)
    ? enterpriseValue - a.netDebt - (a.minorityInterest ?? 0) + (a.investments ?? 0)
    : null;

  const fairValuePerShare =
    isNum(equityValue) && a.sharesOutstanding > 0 ? equityValue / a.sharesOutstanding : null;

  const upside =
    isNum(fairValuePerShare) && isNum(a.currentPrice) && (a.currentPrice as number) > 0
      ? fairValuePerShare / (a.currentPrice as number) - 1
      : null;

  const impliedExitMultiple =
    isNum(terminalValue) && last && last.ebitda !== 0 ? terminalValue / last.ebitda : null;

  // g implied by an exit-multiple terminal value: g = (WACC x TV - FCFF_n) / (TV + FCFF_n)
  let impliedPerpetuityGrowth: number | null = null;
  if (a.terminalMethod === 'EXIT_MULTIPLE' && isNum(terminalValue) && last) {
    const denom = terminalValue + last.fcff;
    impliedPerpetuityGrowth = denom !== 0 ? (a.wacc * terminalValue - last.fcff) / denom : null;
  } else {
    impliedPerpetuityGrowth = a.terminalGrowth;
  }

  if (isNum(enterpriseValue) && isNum(pvTerminalValue) && enterpriseValue !== 0) {
    const share = pvTerminalValue / enterpriseValue;
    // Above three quarters of the value sitting past the forecast horizon means
    // the explicit years are decoration: the answer is the terminal assumption.
    if (share > 0.75) {
      warnings.push(
        `Terminal value is ${(share * 100).toFixed(0)}% of enterprise value — the valuation rests mostly on perpetuity assumptions rather than on the explicit forecast.`,
      );
    }
  }

  return {
    years,
    sumPvFcff,
    terminalValue,
    pvTerminalValue,
    terminalValuePctOfEv: safeDiv(pvTerminalValue, enterpriseValue),
    enterpriseValue,
    netDebt: a.netDebt,
    minorityInterest: a.minorityInterest ?? 0,
    investments: a.investments ?? 0,
    equityValue,
    sharesOutstanding: a.sharesOutstanding,
    fairValuePerShare,
    currentPrice: a.currentPrice ?? null,
    upside,
    impliedExitMultiple,
    impliedPerpetuityGrowth,
    assumptions: a,
    warnings,
  };
}

/* ----------------------------- Sensitivity ----------------------------- */

export type SensitivityAxis =
  | 'WACC'
  | 'TERMINAL_GROWTH'
  | 'EXIT_MULTIPLE'
  | 'REVENUE_GROWTH'
  | 'EBITDA_MARGIN'
  | 'TAX_RATE'
  | 'CAPEX_PCT';

export interface SensitivityCell {
  row: number;
  col: number;
  fairValue: number | null;
  upside: number | null;
}

export interface SensitivityMatrix {
  rowAxis: SensitivityAxis;
  colAxis: SensitivityAxis;
  rowValues: number[];
  colValues: number[];
  cells: SensitivityCell[][];
  baseFairValue: number | null;
}

function applyAxis(a: DcfAssumptions, axis: SensitivityAxis, v: number): DcfAssumptions {
  const next: DcfAssumptions = { ...a };
  switch (axis) {
    case 'WACC': next.wacc = v; break;
    case 'TERMINAL_GROWTH': next.terminalGrowth = v; next.terminalMethod = 'GORDON'; break;
    case 'EXIT_MULTIPLE': next.exitMultiple = v; next.terminalMethod = 'EXIT_MULTIPLE'; break;
    case 'REVENUE_GROWTH': next.revenueGrowth = a.revenueGrowth.map(() => v); break;
    case 'EBITDA_MARGIN': next.ebitdaMargin = a.ebitdaMargin.map(() => v); break;
    case 'TAX_RATE': next.taxRate = v; break;
    case 'CAPEX_PCT': next.capexPctRevenue = a.capexPctRevenue.map(() => v); break;
  }
  return next;
}

export function buildSensitivity(
  base: Partial<DcfAssumptions>,
  rowAxis: SensitivityAxis,
  rowValues: number[],
  colAxis: SensitivityAxis,
  colValues: number[],
): SensitivityMatrix {
  const a = normalizeAssumptions(base);
  const baseResult = calculateDcf(a);
  const cells = rowValues.map((rv, ri) =>
    colValues.map((cv, ci) => {
      const scenario = applyAxis(applyAxis(a, rowAxis, rv), colAxis, cv);
      const r = calculateDcf(scenario);
      return { row: ri, col: ci, fairValue: r.fairValuePerShare, upside: r.upside };
    }),
  );
  return { rowAxis, colAxis, rowValues, colValues, cells, baseFairValue: baseResult.fairValuePerShare };
}

/** Symmetric ladder around a centre value, e.g. WACC 10% +/- 2 steps of 50bps. */
export function axisRange(center: number, step: number, steps = 2): number[] {
  const out: number[] = [];
  for (let i = -steps; i <= steps; i++) out.push(Number((center + i * step).toFixed(6)));
  return out;
}

/* ------------------------------ Reverse DCF ---------------------------- */

export interface ReverseDcfResult {
  targetPrice: number;
  impliedRevenueCagr: number | null;
  impliedEbitdaMargin: number | null;
  impliedTerminalGrowth: number | null;
  impliedExitMultiple: number | null;
  impliedRoic: number | null;
  impliedFcffYear1: number | null;
  baseAssumptions: DcfAssumptions;
  solved: boolean;
  message: string;
}

function solveFor(
  a: DcfAssumptions,
  axis: SensitivityAxis,
  targetPrice: number,
  lo: number,
  hi: number,
): number | null {
  const f = (x: number): number | null => {
    const r = calculateDcf(applyAxis(a, axis, x));
    if (!isNum(r.fairValuePerShare)) return null;
    return (r.fairValuePerShare as number) - targetPrice;
  };
  return bisect(f, lo, hi, { tolerance: 1e-6, maxIterations: 300 });
}

/**
 * "What does the current price imply?" — holds every assumption fixed except
 * one and solves for the value that reproduces the market price.
 */
export function reverseDcf(
  base: Partial<DcfAssumptions>,
  currentPrice: number,
): ReverseDcfResult {
  const a = normalizeAssumptions({ ...base, currentPrice });
  const impliedRevenueCagr = solveFor(a, 'REVENUE_GROWTH', currentPrice, -0.5, 1.0);
  const impliedEbitdaMargin = solveFor(a, 'EBITDA_MARGIN', currentPrice, 0.001, 0.95);
  const impliedTerminalGrowth =
    a.terminalMethod === 'GORDON'
      ? solveFor(a, 'TERMINAL_GROWTH', currentPrice, -0.1, Math.max(0, a.wacc - 0.0005))
      : null;
  const impliedExitMultiple = solveFor(
    { ...a, terminalMethod: 'EXIT_MULTIPLE' },
    'EXIT_MULTIPLE',
    currentPrice,
    0.1,
    60,
  );

  // Implied ROIC on the marginal capital the price requires.
  let impliedRoic: number | null = null;
  let impliedFcffYear1: number | null = null;
  if (isNum(impliedRevenueCagr)) {
    const solvedRun = calculateDcf(applyAxis(a, 'REVENUE_GROWTH', impliedRevenueCagr as number));
    const lastYear = solvedRun.years[solvedRun.years.length - 1];
    impliedFcffYear1 = solvedRun.years[0]?.fcff ?? null;
    if (lastYear && lastYear.nopat !== 0) {
      const reinvestment = lastYear.capex + lastYear.nwcChange - lastYear.da;
      const reinvestmentRate = reinvestment / lastYear.nopat;
      impliedRoic = reinvestmentRate !== 0 ? a.terminalGrowth / reinvestmentRate : null;
      if (isNum(impliedRoic) && (impliedRoic as number) < 0) impliedRoic = null;
    }
  }

  const solved = isNum(impliedRevenueCagr) || isNum(impliedEbitdaMargin);
  return {
    targetPrice: currentPrice,
    impliedRevenueCagr,
    impliedEbitdaMargin,
    impliedTerminalGrowth,
    impliedExitMultiple,
    impliedRoic,
    impliedFcffYear1,
    baseAssumptions: a,
    solved,
    message: solved
      ? 'Solved by holding all other assumptions constant and varying one input at a time.'
      : 'No solution inside the searched range — the price cannot be reproduced by this model without changing more than one assumption.',
  };
}

/* ---------------------- Enterprise / equity bridges --------------------- */

export function enterpriseValueFromMarket(
  marketCap: number | null,
  netDebtValue: number | null,
  minorityInterest = 0,
  investments = 0,
): number | null {
  if (!isNum(marketCap) || !isNum(netDebtValue)) return null;
  return marketCap + netDebtValue + minorityInterest - investments;
}

export function equityValueFromEv(
  ev: number | null,
  netDebtValue: number | null,
  minorityInterest = 0,
  investments = 0,
): number | null {
  if (!isNum(ev) || !isNum(netDebtValue)) return null;
  return ev - netDebtValue - minorityInterest + investments;
}

export function targetPrice(equityValue: number | null, shares: number | null): number | null {
  return safeDiv(equityValue, shares);
}

export function upsideVsPrice(fairValue: number | null, price: number | null): number | null {
  if (!isNum(fairValue) || !isNum(price) || price <= 0) return null;
  return fairValue / price - 1;
}
