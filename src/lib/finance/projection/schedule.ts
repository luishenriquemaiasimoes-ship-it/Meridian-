import { isNum } from '../core';

/* ==================================================================
   Vintage schedules.

   An asset base is not a single number depreciating at a rate: it is a
   stack of vintages, each with its own remaining life. The distinction
   matters most where the life is set by a contract — a concession
   amortises what it adds in year five over the years left on the
   contract, not over a fresh useful life — and it is exactly what a
   flat "D&A as a percent of revenue" assumption throws away.
   ================================================================== */

export interface Vintage {
  /** Year the amount was added. */
  year: number;
  amount: number;
  /** Years over which this vintage is written off, from the year after it lands. */
  life: number;
}

export interface VintageSchedule {
  vintages: Vintage[];
  /**
   * One row per projected year. An array rather than a Map on purpose: this
   * crosses an API boundary, and a Map serialises to `{}` — which is the kind
   * of bug that shows up as an empty table rather than as an error.
   */
  rows: { year: number; charge: number; closing: number }[];
  /** Total charged over the horizon. */
  totalCharge: number;
}

/** Charge for one year, or zero when the year is outside the horizon. */
export function chargeIn(schedule: VintageSchedule, year: number): number {
  return schedule.rows.find((r) => r.year === year)?.charge ?? 0;
}

/** Closing balance for one year, or null when the year is outside the horizon. */
export function closingIn(schedule: VintageSchedule, year: number): number | null {
  return schedule.rows.find((r) => r.year === year)?.closing ?? null;
}

/**
 * Builds the schedule.
 *
 * The opening balance is laid out as a STACK, not as one vintage. A base a
 * company already owns is a mix of assets of every age — some nearly new, some
 * about to retire — and the difference is not cosmetic. Treated as a single
 * vintage of one age, nothing retires while new capex piles on top, so the
 * charge climbs year after year even for a company spending exactly what it
 * consumes. Shell's projected operating margin fell from 7.3% to zero over ten
 * years that way, on a revenue line that only declined 11%, and the model then
 * refused to value it at all.
 *
 * Laid out properly the stack retires one vintage a year, which is what offsets
 * the new capex being added, and a business in steady state shows a steady
 * charge. `openingLife` is the USEFUL life of that base — not the average life
 * remaining on it, which is roughly half as long.
 */
export function buildVintageSchedule(input: {
  baseYear: number;
  years: number;
  /** The balance already on the books, and the useful life of what is in it. */
  openingBalance: number;
  openingLife: number;
  /**
   * How that balance is laid out.
   *
   * STACK — the default — is a base built up over years of ordinary investment:
   * a mix of assets of every age, one cohort retiring each year. TO_DATE is a
   * base that all ends together on a stated date, which is what a concession
   * asset does when the contract expires; there `openingLife` is the years left
   * on the contract rather than a useful life.
   */
  openingShape?: 'STACK' | 'TO_DATE';
  /** Additions per projected year, positive, in order from baseYear + 1. */
  additions: number[];
  /** Life applied to each addition. */
  lifeFor: (year: number) => number;
}): VintageSchedule {
  const { baseYear, years, openingBalance, openingLife, additions, lifeFor } = input;
  const openingShape = input.openingShape ?? 'STACK';

  const vintages: Vintage[] = [];
  if (openingBalance > 0 && openingLife > 0) {
    if (openingShape === 'TO_DATE') {
      vintages.push({ year: baseYear, amount: openingBalance, life: openingLife });
    } else {
      // Under straight line the vintage with `r` years left still carries `r/L`
      // of its cost, so the book value splits across remaining lives in
      // proportion to them. Summed, the stack charges 2 * balance / (L + 1) in
      // the first year — the balance over its average remaining life, and so
      // continuous with the last reported charge.
      const life = Math.max(1, Math.round(openingLife));
      const weight = (life * (life + 1)) / 2;
      for (let remaining = 1; remaining <= life; remaining++) {
        vintages.push({ year: baseYear, amount: (openingBalance * remaining) / weight, life: remaining });
      }
    }
  }
  for (let i = 0; i < years; i++) {
    const year = baseYear + i + 1;
    const amount = isNum(additions[i]) ? additions[i] : 0;
    if (amount <= 0) continue;
    const life = Math.max(1, Math.round(lifeFor(year)));
    vintages.push({ year, amount, life });
  }

  const chargeByYear = new Map<number, number>();
  for (let i = 0; i < years; i++) chargeByYear.set(baseYear + i + 1, 0);

  for (const v of vintages) {
    const annual = v.amount / v.life;
    // A vintage added in year Y starts charging in year Y, except the opening
    // balance, which is already charging and continues from the next year.
    const first = v.year === baseYear ? baseYear + 1 : v.year;
    for (let y = first; y < first + v.life; y++) {
      if (!chargeByYear.has(y)) continue;
      chargeByYear.set(y, (chargeByYear.get(y) ?? 0) + annual);
    }
  }

  const rows: { year: number; charge: number; closing: number }[] = [];
  let balance = openingBalance;
  let totalCharge = 0;
  for (let i = 0; i < years; i++) {
    const year = baseYear + i + 1;
    const addition = isNum(additions[i]) ? additions[i] : 0;
    const charge = chargeByYear.get(year) ?? 0;
    balance = balance + addition - charge;
    totalCharge += charge;
    rows.push({ year, charge, closing: balance });
  }

  return { vintages, rows, totalCharge };
}

/* ------------------------------ Debt ------------------------------ */

export interface DebtYear {
  year: number;
  opening: number;
  draws: number;
  amortisation: number;
  closing: number;
  /** Interest on the average balance, positive. */
  interest: number;
  /** The portion of closing debt due within a year. */
  currentPortion: number;
}

export interface DebtSchedule {
  years: DebtYear[];
  /** Amortisation profile by vintage, for the disclosure table. */
  vintages: Vintage[];
}

/**
 * Runs the debt. Opening balance amortises straight-line over its remaining
 * term; each draw amortises over its own tenor from the year after it lands.
 * Interest accrues on the average of opening and closing, which is what a
 * balance drawn through the year actually costs.
 */
export function buildDebtSchedule(input: {
  baseYear: number;
  years: number;
  openingBalance: number;
  amortisationYears: number;
  costOfDebt: number;
  /** Draw per projected year. */
  draws: number[];
  newDebtTenor: number;
  /** Explicit amortisations, when the profile is known. */
  amortisations?: number[];
}): DebtSchedule {
  const { baseYear, years, openingBalance, amortisationYears, costOfDebt, draws, newDebtTenor } = input;

  const vintages: Vintage[] = [];
  if (openingBalance > 0) {
    vintages.push({ year: baseYear, amount: openingBalance, life: Math.max(1, amortisationYears) });
  }
  for (let i = 0; i < years; i++) {
    const amount = isNum(draws[i]) ? draws[i] : 0;
    if (amount > 0) vintages.push({ year: baseYear + i + 1, amount, life: Math.max(1, newDebtTenor) });
  }

  // Scheduled amortisation per year from the vintages.
  const scheduled = new Map<number, number>();
  for (let i = 0; i < years + 1; i++) scheduled.set(baseYear + i + 1, 0);
  for (const v of vintages) {
    const annual = v.amount / v.life;
    const first = v.year === baseYear ? baseYear + 1 : v.year + 1;
    for (let y = first; y < first + v.life; y++) {
      if (!scheduled.has(y)) continue;
      scheduled.set(y, (scheduled.get(y) ?? 0) + annual);
    }
  }

  const rows: DebtYear[] = [];
  let opening = openingBalance;
  for (let i = 0; i < years; i++) {
    const year = baseYear + i + 1;
    const drawn = isNum(draws[i]) ? draws[i] : 0;
    const override = input.amortisations?.[i];
    const amortisation = Math.min(
      isNum(override) ? override : (scheduled.get(year) ?? 0),
      opening + drawn,
    );
    const closing = opening + drawn - amortisation;
    const interest = ((opening + closing) / 2) * costOfDebt;
    // What falls due next year is next year's scheduled amortisation.
    const currentPortion = Math.min(scheduled.get(year + 1) ?? amortisation, closing);
    rows.push({ year, opening, draws: drawn, amortisation, closing, interest, currentPortion });
    opening = closing;
  }

  return { years: rows, vintages };
}
