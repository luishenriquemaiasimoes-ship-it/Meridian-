import { discountFactor, irr, isNum, safeDiv } from '../core';
import type { ProjectionResult } from './engine';
import type { CovenantTest, ProjectionInput } from './types';

/* ==================================================================
   From the projected statements to a value.

   Two cash flows, not one. FCFF is what the assets throw off before
   anyone is paid, discounted at the WACC to an enterprise value. FCFE
   is what is left for the shareholder after the debt has been served
   and rolled, discounted at the cost of equity to an equity value
   directly. A levered model that reports only the first is hiding the
   thing the equity actually receives, which in a project with a heavy
   amortisation schedule is a different story entirely.
   ================================================================== */

export interface CashFlowYear {
  year: number;
  period: number;
  ebit: number;
  taxOnEbit: number;
  nopat: number;
  da: number;
  capex: number;
  workingCapitalChange: number;
  fcff: number;
  /** FCFF discounted at the WACC. */
  pvFcff: number | null;

  debtDrawn: number;
  debtRepaid: number;
  netInterestAfterTax: number;
  fcfe: number;
  /** FCFE discounted at the cost of equity. */
  pvFcfe: number | null;
}

export interface CovenantYear {
  year: number;
  key: string;
  label: string;
  measure: CovenantTest['measure'];
  value: number | null;
  threshold: number;
  comparator: CovenantTest['comparator'];
  passes: boolean | null;
  headroom: number | null;
}

export interface ProjectionValuation {
  cashFlows: CashFlowYear[];

  /** Sum of discounted FCFF over the explicit horizon. */
  pvExplicitFcff: number | null;
  terminalValue: number | null;
  pvTerminalValue: number | null;
  enterpriseValue: number | null;
  netDebt: number;
  equityValueFromFcff: number | null;

  /** Equity value from discounting FCFE directly, the levered route. */
  equityValueFromFcfe: number | null;
  /** The two routes should agree; where they do not, by how much. */
  routeGap: number | null;

  /** IRR on the unlevered stream, given the enterprise value paid today. */
  unleveredIrr: number | null;
  /** IRR on the equity stream, given the equity value paid today. */
  leveredIrr: number | null;

  ownership: number;
  attributableEquityValue: number | null;
  valuePerShare: number | null;
  currentPrice: number | null;
  upside: number | null;

  covenants: CovenantYear[];
  /** Years where any covenant fails. */
  covenantBreaches: number[];
  warnings: string[];
}

function terminalGrowthFrom(input: ProjectionInput): number | null {
  // A concession with a stated end has no perpetuity: the asset stops.
  const ends = input.capex.find((c) => isNum(c.amortiseToYear));
  if (ends) return null;
  return 0.03;
}

export function valueProjection(
  input: ProjectionInput,
  projected: ProjectionResult,
  opts: { terminalGrowth?: number | null } = {},
): ProjectionValuation {
  const warnings: string[] = [];
  const wacc = input.wacc;
  const ke = input.costOfEquity;
  const ownership = isNum(input.ownership) ? (input.ownership as number) : 1;

  const cashFlows: CashFlowYear[] = projected.income.map((inc, i) => {
    const period = i + 1;
    const cf = projected.cashFlow[i];
    const debtYear = projected.debtSchedule.years[i];
    const rate = inc.effectiveTaxRate ?? 0;

    // Tax on EBIT, not the reported tax charge: FCFF is unlevered, so the
    // shield the debt provides belongs in the discount rate, not the flow.
    const taxOnEbit = inc.ebit > 0 ? -inc.ebit * rate : 0;
    const nopat = inc.ebit + taxOnEbit;
    const da = -inc.da;
    const capex = -projected.capexTotal[i];
    const fcff = nopat + da + capex + cf.workingCapitalChange;

    // Interest is after tax because the shield is real cash to the equity.
    const netInterest = inc.financialExpense + inc.financialIncome;
    const netInterestAfterTax = netInterest * (1 - rate);
    const fcfe = fcff + debtYear.draws - debtYear.amortisation + netInterestAfterTax;

    return {
      year: inc.year, period,
      ebit: inc.ebit, taxOnEbit, nopat, da, capex,
      workingCapitalChange: cf.workingCapitalChange, fcff,
      pvFcff: isNum(wacc) ? fcff * (discountFactor(wacc, period) ?? 0) : null,
      debtDrawn: debtYear.draws, debtRepaid: -debtYear.amortisation,
      netInterestAfterTax, fcfe,
      pvFcfe: isNum(ke) ? fcfe * (discountFactor(ke, period) ?? 0) : null,
    };
  });

  const pvExplicitFcff = isNum(wacc)
    ? cashFlows.reduce((s, c) => s + (c.pvFcff ?? 0), 0)
    : null;

  const g = opts.terminalGrowth !== undefined ? opts.terminalGrowth : terminalGrowthFrom(input);
  let terminalValue: number | null = null;
  let pvTerminalValue: number | null = null;
  if (isNum(g) && isNum(wacc) && cashFlows.length) {
    if ((g as number) >= (wacc as number)) {
      warnings.push('Perpetuity growth is at or above the WACC, so no terminal value is defined.');
    } else {
      const last = cashFlows[cashFlows.length - 1];
      terminalValue = (last.fcff * (1 + (g as number))) / ((wacc as number) - (g as number));
      pvTerminalValue = terminalValue * (discountFactor(wacc, last.period) ?? 0);
    }
  }

  const enterpriseValue = isNum(pvExplicitFcff)
    ? (pvExplicitFcff as number) + (pvTerminalValue ?? 0)
    : null;

  const openingDebt = input.debt.openingBalance;
  const openingCash = input.opening.cash + (input.opening.shortTermInvestments ?? 0);
  const netDebt = openingDebt - openingCash;
  const equityValueFromFcff = isNum(enterpriseValue) ? (enterpriseValue as number) - netDebt : null;

  // The levered route. A finite-life project needs no terminal equity value;
  // an ongoing business does, and it is the residual equity at the horizon.
  let equityValueFromFcfe = isNum(ke) ? cashFlows.reduce((s, c) => s + (c.pvFcfe ?? 0), 0) : null;
  if (isNum(equityValueFromFcfe) && isNum(g) && isNum(ke) && cashFlows.length && (g as number) < (ke as number)) {
    const last = cashFlows[cashFlows.length - 1];
    const tv = (last.fcfe * (1 + (g as number))) / ((ke as number) - (g as number));
    equityValueFromFcfe = (equityValueFromFcfe as number) + tv * (discountFactor(ke, last.period) ?? 0);
  }

  const routeGap = isNum(equityValueFromFcff) && isNum(equityValueFromFcfe)
    ? (equityValueFromFcfe as number) - (equityValueFromFcff as number)
    : null;
  if (isNum(routeGap) && isNum(equityValueFromFcff) && Math.abs(equityValueFromFcff as number) > 0) {
    const rel = Math.abs((routeGap as number) / (equityValueFromFcff as number));
    if (rel > 0.1) {
      warnings.push(
        `The unlevered and levered routes differ by ${(rel * 100).toFixed(0)}%. ` +
        'They agree only when the discount rates are consistent with the capital structure the model actually runs; the gap is the size of that inconsistency.',
      );
    }
  }

  // IRRs: pay the value today, receive the stream.
  const unleveredIrr = isNum(enterpriseValue)
    ? irr([-(enterpriseValue as number), ...cashFlows.map((c, i) =>
        i === cashFlows.length - 1 ? c.fcff + (terminalValue ?? 0) : c.fcff)])
    : null;
  const leveredIrr = isNum(equityValueFromFcfe)
    ? irr([-(equityValueFromFcfe as number), ...cashFlows.map((c) => c.fcfe)])
    : null;

  const attributable = isNum(equityValueFromFcfe)
    ? (equityValueFromFcfe as number) * ownership
    : isNum(equityValueFromFcff) ? (equityValueFromFcff as number) * ownership : null;
  const shares = input.sharesOutstanding;
  const valuePerShare = isNum(attributable) && isNum(shares) && (shares as number) > 0
    ? (attributable as number) / (shares as number)
    : null;
  const upside = isNum(valuePerShare) && isNum(input.currentPrice) && (input.currentPrice as number) > 0
    ? (valuePerShare as number) / (input.currentPrice as number) - 1
    : null;

  /* --------------------------- covenants --------------------------- */
  const covenants: CovenantYear[] = [];
  for (const test of input.covenants ?? []) {
    projected.income.forEach((inc, i) => {
      const debtYear = projected.debtSchedule.years[i];
      const interest = Math.abs(inc.financialExpense);
      const service = interest + debtYear.amortisation;
      let value: number | null = null;
      if (test.measure === 'DSCR') value = safeDiv(inc.ebitda, service);
      else if (test.measure === 'NET_DEBT_EBITDA') {
        value = safeDiv(debtYear.closing - projected.balance[i].cash, inc.ebitda);
      } else if (test.measure === 'INTEREST_COVERAGE') value = safeDiv(inc.ebit, interest);
      else if (test.measure === 'EBITDA_INTEREST') value = safeDiv(inc.ebitda, interest);

      const passes = isNum(value)
        ? test.comparator === 'GTE' ? (value as number) >= test.threshold : (value as number) <= test.threshold
        : null;
      covenants.push({
        year: inc.year, key: test.key, label: test.label, measure: test.measure,
        value, threshold: test.threshold, comparator: test.comparator, passes,
        headroom: isNum(value)
          ? test.comparator === 'GTE' ? (value as number) - test.threshold : test.threshold - (value as number)
          : null,
      });
    });
  }
  const covenantBreaches = Array.from(new Set(covenants.filter((c) => c.passes === false).map((c) => c.year)));
  if (covenantBreaches.length) {
    warnings.push(
      `A covenant fails in ${covenantBreaches.join(', ')}. A breach is an event of default before it is a valuation input.`,
    );
  }

  return {
    cashFlows,
    pvExplicitFcff, terminalValue, pvTerminalValue, enterpriseValue,
    netDebt, equityValueFromFcff, equityValueFromFcfe, routeGap,
    unleveredIrr, leveredIrr,
    ownership, attributableEquityValue: attributable, valuePerShare,
    currentPrice: input.currentPrice ?? null, upside,
    covenants, covenantBreaches,
    warnings: [...projected.warnings, ...warnings],
  };
}
