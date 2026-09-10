import { describe, expect, it } from 'vitest';
import { calculateRoic, investedCapital, investedCapitalFinancing, nopat, roicSeries, roicSpread } from '@/lib/finance/roic';
import {
  buildWacc, calculateWacc, costOfEquity, impliedCostOfDebt, leveredBeta,
  marketDebtToEquity, unleveredBeta,
} from '@/lib/finance/wacc';
import {
  axisRange, buildSensitivity, calculateDcf, enterpriseValueFromMarket,
  equityValueFromEv, exitMultipleTerminalValue, gordonTerminalValue,
  normalizeAssumptions, projectFcff, reverseDcf, targetPrice, upsideVsPrice,
} from '@/lib/finance/dcf';
import { FY2023, FY2024, makePeriod } from './fixtures';

/* ------------------------------- ROIC ------------------------------- */

describe('ROIC engine', () => {
  it('computes NOPAT from EBIT and the effective tax rate', () => {
    expect(nopat(FY2024)).toBeCloseTo(207.24, 6);
  });

  it('falls back to the statutory rate when the effective rate is unusable', () => {
    const p = makePeriod({
      label: 'P', fiscalYear: 2024, endDate: '2024-12-31',
      income: { revenue: 100, ebit: 50, ebt: 0, taxes: 5 },
    });
    expect(nopat(p, 0.25)).toBeCloseTo(37.5, 6);
  });

  it('returns null NOPAT without EBIT', () => {
    const p = makePeriod({ label: 'P', fiscalYear: 2024, endDate: '2024-12-31' });
    expect(nopat(p)).toBeNull();
  });

  it('computes invested capital on the operating definition', () => {
    expect(investedCapital(FY2024.balance)).toBe(1110);
    expect(investedCapital(FY2023.balance)).toBe(1020);
  });

  it('cross-checks invested capital from the financing side', () => {
    // Debt 575 + equity 700 - cash 240
    expect(investedCapitalFinancing(FY2024.balance)).toBe(1035);
  });

  it('computes ROIC on average invested capital', () => {
    const r = calculateRoic(FY2024, FY2023);
    expect(r.investedCapital).toBe(1065);
    expect(r.roic).toBeCloseTo(0.1945915, 6);
    expect(r.averageCapitalUsed).toBe(true);
  });

  it('decomposes into NOPAT margin x capital turnover', () => {
    const r = calculateRoic(FY2024, FY2023);
    expect(r.nopatMargin).toBeCloseTo(0.1802087, 6);
    expect(r.capitalTurnover).toBeCloseTo(1.0798122, 6);
    expect((r.nopatMargin as number) * (r.capitalTurnover as number)).toBeCloseTo(r.roic as number, 10);
  });

  it('uses closing capital when no prior period is given', () => {
    const r = calculateRoic(FY2024);
    expect(r.averageCapitalUsed).toBe(false);
    expect(r.roic).toBeCloseTo(207.24 / 1110, 8);
  });

  it('identifies value creation versus the cost of capital', () => {
    const above = roicSpread(0.19, 0.11, 1065);
    expect(above.createsValue).toBe(true);
    expect(above.spread).toBeCloseTo(0.08, 10);
    expect(above.economicProfit).toBeCloseTo(85.2, 6);

    const below = roicSpread(0.08, 0.11, 1065);
    expect(below.createsValue).toBe(false);
    expect(below.economicProfit).toBeCloseTo(-31.95, 6);
  });

  it('reports unknown value creation when either leg is missing', () => {
    expect(roicSpread(null, 0.11, 1000).createsValue).toBeNull();
    expect(roicSpread(0.19, null, 1000).spread).toBeNull();
  });

  it('builds a ROIC history', () => {
    const s = roicSeries([FY2023, FY2024]);
    expect(s).toHaveLength(2);
    expect(s[1].roic).toBeCloseTo(0.1945915, 6);
  });
});

/* ------------------------------- WACC ------------------------------- */

describe('cost of capital', () => {
  it('CAPM cost of equity', () => {
    expect(costOfEquity({ riskFreeRate: 0.1, beta: 1.2, equityRiskPremium: 0.055 })).toBeCloseTo(0.166, 10);
  });

  it('adds country and size premia', () => {
    const ke = costOfEquity({ riskFreeRate: 0.04, beta: 1, equityRiskPremium: 0.05, countryRiskPremium: 0.025, sizePremium: 0.01 });
    expect(ke).toBeCloseTo(0.125, 10);
  });

  it('handles a zero beta (Ke collapses to the risk-free rate)', () => {
    expect(costOfEquity({ riskFreeRate: 0.1, beta: 0, equityRiskPremium: 0.055 })).toBeCloseTo(0.1, 10);
  });

  it('handles a negative beta', () => {
    expect(costOfEquity({ riskFreeRate: 0.1, beta: -0.3, equityRiskPremium: 0.06 })).toBeCloseTo(0.082, 10);
  });

  it('returns null with missing inputs', () => {
    expect(costOfEquity({ riskFreeRate: Number.NaN, beta: 1, equityRiskPremium: 0.05 })).toBeNull();
  });

  it('levers and unlevers beta consistently (Hamada)', () => {
    const lev = leveredBeta(0.9, 0.5, 0.34) as number;
    expect(lev).toBeCloseTo(1.197, 6);
    expect(unleveredBeta(lev, 0.5, 0.34)).toBeCloseTo(0.9, 10);
  });

  it('derives an implied pre-tax cost of debt', () => {
    expect(impliedCostOfDebt(-45, 500)).toBeCloseTo(0.09, 10);
    expect(impliedCostOfDebt(-45, 0)).toBeNull();
    expect(impliedCostOfDebt(null, 500)).toBeNull();
  });

  it('computes WACC from weights', () => {
    const w = calculateWacc({ costOfEquity: 0.15, costOfDebt: 0.1, taxRate: 0.34, marketValueEquity: 700, marketValueDebt: 300 });
    expect(w.equityWeight).toBeCloseTo(0.7, 10);
    expect(w.debtWeight).toBeCloseTo(0.3, 10);
    expect(w.afterTaxCostOfDebt).toBeCloseTo(0.066, 10);
    expect(w.wacc).toBeCloseTo(0.7 * 0.15 + 0.3 * 0.066, 10);
  });

  it('is the cost of equity for an all-equity company', () => {
    const w = calculateWacc({ costOfEquity: 0.14, costOfDebt: 0.1, taxRate: 0.34, marketValueEquity: 1000, marketValueDebt: 0 });
    expect(w.wacc).toBeCloseTo(0.14, 10);
  });

  it('returns null when total capital is zero', () => {
    const w = calculateWacc({ costOfEquity: 0.14, costOfDebt: 0.1, taxRate: 0.34, marketValueEquity: 0, marketValueDebt: 0 });
    expect(w.wacc).toBeNull();
  });

  it('runs the full CAPM to WACC chain', () => {
    const w = buildWacc({
      riskFreeRate: 0.105, beta: 1.15, equityRiskPremium: 0.055,
      costOfDebt: 0.115, taxRate: 0.34, marketValueEquity: 800, marketValueDebt: 200,
    });
    expect(w.impliedCostOfEquity).toBeCloseTo(0.16825, 10);
    expect(w.wacc).toBeCloseTo(0.8 * 0.16825 + 0.2 * 0.115 * 0.66, 10);
  });

  it('computes market D/E', () => {
    expect(marketDebtToEquity(300, 700)).toBeCloseTo(0.4285714, 6);
    expect(marketDebtToEquity(300, 0)).toBeNull();
  });
});

/* -------------------------------- DCF -------------------------------- */

const BASE_DCF = {
  baseYear: 2024,
  baseRevenue: 1000,
  baseNwc: 100,
  revenueGrowth: [0.1, 0.1, 0.1, 0.1, 0.1],
  ebitdaMargin: [0.3, 0.3, 0.3, 0.3, 0.3],
  daPctRevenue: [0.08],
  capexPctRevenue: [0.08],
  nwcPctRevenue: [0.1],
  taxRate: 0.34,
  wacc: 0.12,
  terminalMethod: 'GORDON' as const,
  terminalGrowth: 0.03,
  exitMultiple: 8,
  netDebt: 300,
  sharesOutstanding: 100,
  currentPrice: 20,
};

describe('terminal value', () => {
  it('Gordon growth', () => {
    expect(gordonTerminalValue(100, 0.12, 0.03)).toBeCloseTo((100 * 1.03) / 0.09, 8);
  });
  it('is undefined when WACC does not exceed g', () => {
    expect(gordonTerminalValue(100, 0.03, 0.03)).toBeNull();
    expect(gordonTerminalValue(100, 0.02, 0.03)).toBeNull();
  });
  it('exit multiple', () => expect(exitMultipleTerminalValue(300, 8)).toBe(2400));
  it('returns null with missing inputs', () => {
    expect(exitMultipleTerminalValue(Number.NaN, 8)).toBeNull();
    expect(gordonTerminalValue(Number.NaN, 0.12, 0.03)).toBeNull();
  });
});

describe('FCFF projection', () => {
  const years = projectFcff(normalizeAssumptions(BASE_DCF));

  it('projects the requested number of years', () => expect(years).toHaveLength(5));

  it('grows revenue at the assumed rate', () => {
    expect(years[0].revenue).toBeCloseTo(1100, 8);
    expect(years[4].revenue).toBeCloseTo(1000 * 1.1 ** 5, 6);
  });

  it('computes FCFF as EBIT x (1-t) + D&A - capex - dNWC', () => {
    const y = years[0];
    const expected = y.ebit * (1 - 0.34) + y.da - y.capex - y.nwcChange;
    expect(y.fcff).toBeCloseTo(expected, 8);
    // 1100 revenue: EBITDA 330, D&A 88, EBIT 242, NOPAT 159.72, capex 88, dNWC 10
    expect(y.ebitda).toBeCloseTo(330, 8);
    expect(y.ebit).toBeCloseTo(242, 8);
    expect(y.nopat).toBeCloseTo(159.72, 8);
    expect(y.nwcChange).toBeCloseTo(10, 8);
    expect(y.fcff).toBeCloseTo(149.72, 8);
  });

  it('discounts each year at the WACC', () => {
    expect(years[0].discountFactor).toBeCloseTo(1 / 1.12, 10);
    expect(years[2].discountFactor).toBeCloseTo(1 / 1.12 ** 3, 10);
    expect(years[0].presentValue).toBeCloseTo(years[0].fcff / 1.12, 8);
  });

  it('supports the mid-year convention', () => {
    const y = projectFcff(normalizeAssumptions({ ...BASE_DCF, midYearConvention: true }));
    expect(y[0].discountFactor).toBeCloseTo(1 / 1.12 ** 0.5, 10);
  });

  it('does not book a tax benefit on operating losses', () => {
    const loss = projectFcff(normalizeAssumptions({ ...BASE_DCF, ebitdaMargin: [0.02], daPctRevenue: [0.08] }));
    expect(loss[0].ebit).toBeLessThan(0);
    expect(loss[0].taxes).toBe(0);
    expect(loss[0].nopat).toBeCloseTo(loss[0].ebit, 8);
  });

  it('reuses the last supplied value for shorter assumption arrays', () => {
    const y = projectFcff(normalizeAssumptions({ ...BASE_DCF, capexPctRevenue: [0.12] }));
    expect(y[4].capex).toBeCloseTo(y[4].revenue * 0.12, 8);
  });
});

describe('DCF valuation', () => {
  const r = calculateDcf(BASE_DCF);

  it('builds the enterprise-to-equity bridge', () => {
    const sumPv = r.years.reduce((s, y) => s + y.presentValue, 0);
    expect(r.sumPvFcff).toBeCloseTo(sumPv, 8);
    expect(r.enterpriseValue).toBeCloseTo((r.sumPvFcff as number) + (r.pvTerminalValue as number), 8);
    expect(r.equityValue).toBeCloseTo((r.enterpriseValue as number) - 300, 8);
    expect(r.fairValuePerShare).toBeCloseTo((r.equityValue as number) / 100, 8);
  });

  it('discounts the terminal value at the final forecast year', () => {
    const last = r.years[4];
    const tv = gordonTerminalValue(last.fcff, 0.12, 0.03) as number;
    expect(r.terminalValue).toBeCloseTo(tv, 6);
    expect(r.pvTerminalValue).toBeCloseTo(tv / 1.12 ** 5, 6);
  });

  it('computes upside against the current price', () => {
    expect(r.upside).toBeCloseTo((r.fairValuePerShare as number) / 20 - 1, 10);
  });

  it('reports the terminal value share of enterprise value', () => {
    expect(r.terminalValuePctOfEv).toBeGreaterThan(0.5);
    expect(r.terminalValuePctOfEv).toBeLessThan(1);
  });

  it('raising the WACC lowers the fair value', () => {
    const higher = calculateDcf({ ...BASE_DCF, wacc: 0.14 });
    expect(higher.fairValuePerShare as number).toBeLessThan(r.fairValuePerShare as number);
  });

  it('raising terminal growth raises the fair value', () => {
    const higher = calculateDcf({ ...BASE_DCF, terminalGrowth: 0.04 });
    expect(higher.fairValuePerShare as number).toBeGreaterThan(r.fairValuePerShare as number);
  });

  it('more net debt lowers the equity value one-for-one', () => {
    const more = calculateDcf({ ...BASE_DCF, netDebt: 400 });
    expect((r.equityValue as number) - (more.equityValue as number)).toBeCloseTo(100, 6);
  });

  it('subtracts minority interest from equity value', () => {
    const mi = calculateDcf({ ...BASE_DCF, minorityInterest: 50 });
    expect((r.equityValue as number) - (mi.equityValue as number)).toBeCloseTo(50, 6);
  });

  it('warns and returns null when WACC does not exceed terminal growth', () => {
    const bad = calculateDcf({ ...BASE_DCF, wacc: 0.03, terminalGrowth: 0.03 });
    expect(bad.terminalValue).toBeNull();
    expect(bad.enterpriseValue).toBeNull();
    expect(bad.fairValuePerShare).toBeNull();
    expect(bad.warnings.join(' ')).toContain('terminal growth');
  });

  it('returns null per-share value with zero shares outstanding', () => {
    const z = calculateDcf({ ...BASE_DCF, sharesOutstanding: 0 });
    expect(z.fairValuePerShare).toBeNull();
    expect(z.warnings.join(' ')).toContain('Shares outstanding');
  });

  it('returns null upside without a price', () => {
    const noPrice = calculateDcf({ ...BASE_DCF, currentPrice: null });
    expect(noPrice.upside).toBeNull();
  });

  it('supports an exit-multiple terminal value and reports the implied g', () => {
    const em = calculateDcf({ ...BASE_DCF, terminalMethod: 'EXIT_MULTIPLE', exitMultiple: 8 });
    const last = em.years[4];
    expect(em.terminalValue).toBeCloseTo(last.ebitda * 8, 6);
    expect(em.impliedPerpetuityGrowth).not.toBeNull();
    expect(em.impliedPerpetuityGrowth as number).toBeLessThan(0.12);
  });

  it('reports the implied exit multiple of a Gordon terminal value', () => {
    expect(r.impliedExitMultiple).toBeCloseTo((r.terminalValue as number) / r.years[4].ebitda, 8);
  });

  it('flags a valuation dominated by the terminal value', () => {
    const heavy = calculateDcf({ ...BASE_DCF, terminalGrowth: 0.055, wacc: 0.08 });
    expect(heavy.warnings.some((w) => w.includes('Terminal value'))).toBe(true);
  });
});

describe('EV / equity bridges', () => {
  it('EV from market cap and net debt', () => {
    expect(enterpriseValueFromMarket(1000, 300, 50, 20)).toBe(1330);
  });
  it('equity value from EV', () => {
    expect(equityValueFromEv(1330, 300, 50, 20)).toBe(1000);
  });
  it('round-trips', () => {
    const ev = enterpriseValueFromMarket(2000, 500) as number;
    expect(equityValueFromEv(ev, 500)).toBeCloseTo(2000, 10);
  });
  it('target price and upside', () => {
    expect(targetPrice(1000, 100)).toBe(10);
    expect(targetPrice(1000, 0)).toBeNull();
    expect(upsideVsPrice(12, 10)).toBeCloseTo(0.2, 10);
    expect(upsideVsPrice(8, 10)).toBeCloseTo(-0.2, 10);
    expect(upsideVsPrice(12, 0)).toBeNull();
    expect(upsideVsPrice(null, 10)).toBeNull();
  });
  it('returns null with missing inputs', () => {
    expect(enterpriseValueFromMarket(null, 300)).toBeNull();
    expect(equityValueFromEv(1000, null)).toBeNull();
  });
});

describe('sensitivity', () => {
  it('builds a WACC x terminal growth grid', () => {
    const m = buildSensitivity(BASE_DCF, 'WACC', axisRange(0.12, 0.005), 'TERMINAL_GROWTH', axisRange(0.03, 0.005));
    expect(m.rowValues).toHaveLength(5);
    expect(m.colValues).toHaveLength(5);
    expect(m.cells).toHaveLength(5);
    expect(m.cells[0]).toHaveLength(5);
    expect(m.cells[2][2].fairValue).toBeCloseTo(m.baseFairValue as number, 6);
  });

  it('is monotonic: value falls as WACC rises and rises with g', () => {
    const m = buildSensitivity(BASE_DCF, 'WACC', [0.1, 0.12, 0.14], 'TERMINAL_GROWTH', [0.02, 0.03, 0.04]);
    expect(m.cells[0][1].fairValue as number).toBeGreaterThan(m.cells[2][1].fairValue as number);
    expect(m.cells[1][2].fairValue as number).toBeGreaterThan(m.cells[1][0].fairValue as number);
  });

  it('builds a growth x margin grid', () => {
    const m = buildSensitivity(BASE_DCF, 'REVENUE_GROWTH', [0.05, 0.1], 'EBITDA_MARGIN', [0.25, 0.3]);
    expect(m.cells[1][1].fairValue as number).toBeGreaterThan(m.cells[0][0].fairValue as number);
  });

  it('axisRange builds a symmetric ladder', () => {
    expect(axisRange(0.12, 0.01, 2)).toEqual([0.1, 0.11, 0.12, 0.13, 0.14]);
  });
});

describe('reverse DCF', () => {
  it('recovers the assumption that reproduces the model price', () => {
    const fair = calculateDcf(BASE_DCF).fairValuePerShare as number;
    const rev = reverseDcf(BASE_DCF, fair);
    expect(rev.solved).toBe(true);
    expect(rev.impliedRevenueCagr).toBeCloseTo(0.1, 3);
    expect(rev.impliedEbitdaMargin).toBeCloseTo(0.3, 3);
  });

  it('implies lower growth at a lower price', () => {
    const fair = calculateDcf(BASE_DCF).fairValuePerShare as number;
    const cheap = reverseDcf(BASE_DCF, fair * 0.7);
    expect(cheap.impliedRevenueCagr as number).toBeLessThan(0.1);
  });

  it('implies higher growth at a higher price', () => {
    const fair = calculateDcf(BASE_DCF).fairValuePerShare as number;
    const rich = reverseDcf(BASE_DCF, fair * 1.4);
    expect(rich.impliedRevenueCagr as number).toBeGreaterThan(0.1);
  });

  it('solves an implied exit multiple', () => {
    const fair = calculateDcf(BASE_DCF).fairValuePerShare as number;
    const rev = reverseDcf(BASE_DCF, fair);
    expect(rev.impliedExitMultiple).not.toBeNull();
    expect(rev.impliedExitMultiple as number).toBeGreaterThan(0);
  });

  it('reports no solution for an unreachable price', () => {
    const rev = reverseDcf(BASE_DCF, 1e9);
    expect(rev.impliedRevenueCagr).toBeNull();
    expect(rev.impliedEbitdaMargin).toBeNull();
    expect(rev.solved).toBe(false);
    expect(rev.message).toContain('No solution');
  });
});
