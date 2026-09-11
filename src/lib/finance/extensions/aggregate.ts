import { discountFactor, isNum, safeDiv } from '../core';
import { gordonTerminalValue } from '../dcf';
import type {
  AggregatedValuation, AggregationContext, AggregationMethod, CashFlowUnit, UnitValuation,
} from './types';

/* ==================================================================
   Putting the units back together.

   Two ways, and the analyst picks. Consolidating sums the cash flows and
   discounts once, which is right when the units share a balance sheet
   and a cost of capital. A sum of the parts values each unit on its own
   terms and nets its own debt, which is right when they do not — a
   partial stake, a ring-fenced project, a subsidiary that cannot upstream
   cash. Neither is the default, because neither is always correct.
   ================================================================== */

/**
 * Values one unit on its own. A unit with a stated end year gets no
 * terminal value: a contract that expires is worth its remaining cash
 * flows and nothing more, and pretending otherwise is the single most
 * expensive error in valuing finite-life assets.
 */
export function valueUnit(unit: CashFlowUnit, ctx: AggregationContext): UnitValuation {
  const warnings: string[] = [];
  const wacc = isNum(unit.wacc) ? (unit.wacc as number) : ctx.wacc;
  if (!isNum(wacc) || wacc <= 0) {
    return {
      unit, presentValue: null, terminalValue: null, enterpriseValue: null,
      equityValue: null, remainingYears: null,
      warnings: ['No usable discount rate for this unit.'],
    };
  }

  const live = unit.cashFlows
    .filter((c) => c.year > ctx.baseYear)
    .filter((c) => unit.endYear === null || c.year <= (unit.endYear as number))
    .sort((a, b) => a.year - b.year);

  const dropped = unit.cashFlows.filter(
    (c) => unit.endYear !== null && c.year > (unit.endYear as number) && isNum(c.fcff) && c.fcff !== 0,
  );
  if (dropped.length) {
    warnings.push(
      `${dropped.length} year${dropped.length === 1 ? '' : 's'} of cash flow fall after this unit ends in ${unit.endYear} and were excluded.`,
    );
  }

  let presentValue: number | null = null;
  for (const cf of live) {
    if (!isNum(cf.fcff)) continue;
    const t = cf.year - ctx.baseYear;
    const df = discountFactor(wacc, t, ctx.midYearConvention) ?? 0;
    presentValue = (presentValue ?? 0) + (cf.fcff as number) * df;
  }

  // Only an indefinite-life unit earns a terminal value.
  let terminalValue: number | null = null;
  if (unit.endYear === null && live.length) {
    const last = live[live.length - 1];
    if (isNum(last.fcff)) {
      const tv = gordonTerminalValue(last.fcff as number, wacc, ctx.terminalGrowth);
      const df = discountFactor(wacc, last.year - ctx.baseYear, ctx.midYearConvention);
      terminalValue = isNum(tv) && isNum(df) ? (tv as number) * (df as number) : null;
      if (!isNum(tv)) {
        warnings.push('Perpetuity growth is at or above this unit’s discount rate, so no terminal value could be computed.');
      }
    }
  }

  const gross = isNum(presentValue) || isNum(terminalValue)
    ? (presentValue ?? 0) + (terminalValue ?? 0)
    : null;
  const ownership = isNum(unit.ownership) ? unit.ownership : 1;
  const enterpriseValue = isNum(gross) ? (gross as number) * ownership : null;
  const equityValue = isNum(enterpriseValue)
    ? (enterpriseValue as number) - (isNum(unit.netDebt) ? (unit.netDebt as number) * ownership : 0)
    : null;

  const remainingYears = unit.endYear === null ? null : Math.max(0, (unit.endYear as number) - ctx.baseYear);
  if (remainingYears === 0) {
    warnings.push(`This unit ended in ${unit.endYear}, on or before the valuation year, and contributes nothing.`);
  }

  return { unit, presentValue, terminalValue, enterpriseValue, equityValue, remainingYears, warnings };
}

export function aggregateUnits(
  units: CashFlowUnit[],
  method: AggregationMethod,
  ctx: AggregationContext,
): AggregatedValuation {
  const valued = units.map((u) => valueUnit(u, ctx));
  const warnings = valued.flatMap((v) => v.warnings.map((w) => `${v.unit.name}: ${w}`));

  const usable = valued.filter((v) => isNum(v.enterpriseValue));
  const enterpriseValue = usable.length
    ? usable.reduce((s, v) => s + (v.enterpriseValue as number), 0)
    : null;

  if (usable.length < valued.length) {
    warnings.push(
      `${valued.length - usable.length} of ${valued.length} units could not be valued and are excluded from the total rather than counted as zero.`,
    );
  }

  // Under a sum of the parts each unit nets its own debt; consolidating nets
  // the group's debt once against the summed enterprise value.
  let equityValue: number | null = null;
  if (method === 'SOTP') {
    const withEquity = valued.filter((v) => isNum(v.equityValue));
    equityValue = withEquity.length
      ? withEquity.reduce((s, v) => s + (v.equityValue as number), 0) - ctx.minorityInterest
      : null;
    const unitDebt = units.reduce((s, u) => s + (isNum(u.netDebt) ? (u.netDebt as number) : 0), 0);
    if (unitDebt === 0 && ctx.netDebt !== 0) {
      warnings.push(
        'No debt is recorded at unit level while the group carries net debt. Under a sum of the parts the group figure is not deducted, so the equity value is overstated until the debt is allocated.',
      );
    }
  } else {
    equityValue = isNum(enterpriseValue)
      ? (enterpriseValue as number) - ctx.netDebt - ctx.minorityInterest
      : null;
  }

  const fairValuePerShare = isNum(equityValue) && ctx.sharesOutstanding > 0
    ? (equityValue as number) / ctx.sharesOutstanding
    : null;
  const upside = isNum(fairValuePerShare) && isNum(ctx.currentPrice) && (ctx.currentPrice as number) > 0
    ? (fairValuePerShare as number) / (ctx.currentPrice as number) - 1
    : null;

  const total = usable.reduce((s, v) => s + Math.abs(v.enterpriseValue as number), 0);
  const contributions = valued.map((v) => ({
    id: v.unit.id,
    name: v.unit.name,
    value: v.enterpriseValue,
    share: isNum(v.enterpriseValue) && total > 0 ? (v.enterpriseValue as number) / total : null,
  }));

  return {
    method,
    units: valued,
    enterpriseValue,
    netDebt: ctx.netDebt,
    minorityInterest: ctx.minorityInterest,
    equityValue,
    sharesOutstanding: ctx.sharesOutstanding,
    fairValuePerShare,
    currentPrice: ctx.currentPrice,
    upside,
    contributions,
    warnings,
  };
}

/** Fraction of total value that expires within `years`, for the runway chart. */
export function valueExpiringWithin(agg: AggregatedValuation, baseYear: number, years: number): number | null {
  const total = agg.units.reduce((s, u) => s + (isNum(u.enterpriseValue) ? (u.enterpriseValue as number) : 0), 0);
  if (total === 0) return null;
  const expiring = agg.units
    .filter((u) => u.unit.endYear !== null && (u.unit.endYear as number) - baseYear <= years)
    .reduce((s, u) => s + (isNum(u.enterpriseValue) ? (u.enterpriseValue as number) : 0), 0);
  return safeDiv(expiring, total);
}
