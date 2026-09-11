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
 * Builds the schedule. The opening balance is itself a vintage, written off
 * over the life it has left — which is what makes the first projected year's
 * charge continuous with the last reported one instead of restarting.
 */
export function buildVintageSchedule(input: {
  baseYear: number;
  years: number;
  /** The balance already on the books, and the life it has left. */
  openingBalance: number;
  openingLife: number;
  /** Additions per projected year, positive, in order from baseYear + 1. */
  additions: number[];
  /** Life applied to each addition. */
  lifeFor: (year: number) => number;
}): VintageSchedule {
  const { baseYear, years, openingBalance, openingLife, additions, lifeFor } = input;

  const vintages: Vintage[] = [];
  if (openingBalance > 0 && openingLife > 0) {
    vintages.push({ year: baseYear, amount: openingBalance, life: openingLife });
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
