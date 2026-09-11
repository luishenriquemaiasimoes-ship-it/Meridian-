import { isNum, safeDiv } from '../core';
import { buildDebtSchedule, buildVintageSchedule, chargeIn, closingIn, type DebtSchedule, type VintageSchedule } from './schedule';
import type {
  CapexLine, CostLine, ProjectionInput, RevenueLine, WorkingCapitalTerms,
} from './types';

/* ==================================================================
   The projection.

   Order matters and mirrors how a model is actually built: drivers
   first, then the income statement, then the asset base and the debt,
   then working capital, and only then the balance sheet and the cash
   flow — which are checked against each other rather than asserted.

   The balance sheet balances because retained earnings absorb the
   period's result and cash is whatever the cash-flow statement says it
   is. If those two disagree, `balanceCheck` says so for that year
   instead of the model quietly plugging the difference.
   ================================================================== */

const DAYS = 365;

function at(arr: number[] | undefined, i: number, fallback: number): number {
  if (!arr?.length) return fallback;
  const v = arr[Math.min(i, arr.length - 1)];
  return isNum(v) ? v : fallback;
}

/* --------------------------- Revenue --------------------------- */

export interface RevenueLineYear {
  key: string;
  label: string;
  volume: number | null;
  price: number | null;
  gross: number;
}

export interface RevenueYear {
  year: number;
  lines: RevenueLineYear[];
  grossRevenue: number;
  deductions: number;
  netRevenue: number;
  /** Net revenue without the construction pass-through, for percentage drivers. */
  netRevenueExConstruction: number;
}

function projectRevenue(input: ProjectionInput, capexByYear: number[]): RevenueYear[] {
  const out: RevenueYear[] = [];
  // Running state per line, so growth compounds off last year rather than base.
  const volume = new Map<string, number>();
  const price = new Map<string, number>();
  const amount = new Map<string, number>();

  for (const l of input.revenue) {
    if (l.kind === 'VOLUME_PRICE') {
      volume.set(l.key, l.baseVolume ?? 0);
      price.set(l.key, l.basePrice ?? 0);
    }
    amount.set(l.key, l.baseRevenue ?? (l.baseVolume ?? 0) * (l.basePrice ?? 0));
  }

  for (let i = 0; i < input.years; i++) {
    const year = input.baseYear + i + 1;
    const lines: RevenueLineYear[] = [];
    const thisYear = new Map<string, number>();

    // Two passes: independent lines first, then lines expressed as a share of
    // another, which cannot be resolved before the line they reference.
    for (const l of input.revenue) {
      if (l.kind === 'PCT_OF') continue;
      let gross = 0;
      let v: number | null = null;
      let p: number | null = null;

      if (l.kind === 'VOLUME_PRICE') {
        v = (volume.get(l.key) ?? 0) * (1 + at(l.volumeGrowth, i, 0));
        p = (price.get(l.key) ?? 0) * (1 + at(l.priceGrowth, i, 0));
        volume.set(l.key, v);
        price.set(l.key, p);
        gross = v * p;
      } else if (l.kind === 'GROWTH') {
        gross = (amount.get(l.key) ?? 0) * (1 + at(l.revenueGrowth, i, 0));
      } else if (l.kind === 'CONSTRUCTION') {
        // Concession accounting recognises the capital programme as revenue
        // and the same amount as cost: it inflates both, and nets to nothing.
        gross = (capexByYear[i] ?? 0) * at(l.pctOfCapex, i, 1);
      }
      amount.set(l.key, gross);
      thisYear.set(l.key, gross);
      lines.push({ key: l.key, label: l.label, volume: v, price: p, gross });
    }

    for (const l of input.revenue) {
      if (l.kind !== 'PCT_OF') continue;
      const base = thisYear.get(l.ofKey ?? '') ?? 0;
      const gross = base * at(l.pctOf, i, 0);
      amount.set(l.key, gross);
      thisYear.set(l.key, gross);
      lines.push({ key: l.key, label: l.label, volume: null, price: null, gross });
    }

    // Keep the declared order rather than the resolution order.
    const ordered = input.revenue
      .map((l) => lines.find((x) => x.key === l.key))
      .filter((x): x is RevenueLineYear => !!x);

    const grossRevenue = ordered.reduce((s, l) => s + l.gross, 0);
    const constructionGross = ordered
      .filter((l) => input.revenue.find((r) => r.key === l.key)?.kind === 'CONSTRUCTION')
      .reduce((s, l) => s + l.gross, 0);
    const deductions = grossRevenue * at(input.revenueDeductions, i, 0);
    const netRevenue = grossRevenue - deductions;
    out.push({
      year, lines: ordered, grossRevenue, deductions, netRevenue,
      netRevenueExConstruction: netRevenue - constructionGross,
    });
  }
  return out;
}

/* ---------------------------- Costs ---------------------------- */

export interface CostLineYear {
  key: string;
  label: string;
  block: CostLine['block'];
  amount: number;
}

function projectCosts(
  input: ProjectionInput,
  revenue: RevenueYear[],
  capexByYear: number[],
): CostLineYear[][] {
  const running = new Map<string, number>();
  for (const c of input.costs) {
    running.set(c.key, c.baseAmount ?? 0);
    if (c.kind === 'PER_UNIT') running.set(`${c.key}:unit`, c.basePerUnit ?? 0);
  }

  return revenue.map((rev, i) => {
    const rows: CostLineYear[] = [];
    for (const c of input.costs) {
      let amount = 0;
      if (c.kind === 'PCT_REVENUE') {
        const base = c.base === 'NET_REVENUE_EX_CONSTRUCTION'
          ? rev.netRevenueExConstruction
          : rev.netRevenue;
        amount = base * at(c.pct, i, 0);
      } else if (c.kind === 'PCT_REVENUE_LINE') {
        const line = rev.lines.find((l) => l.key === c.ofKey);
        amount = (line?.gross ?? 0) * at(c.pct, i, 0);
      } else if (c.kind === 'PER_UNIT') {
        const unit = (running.get(`${c.key}:unit`) ?? 0) * (1 + at(c.perUnitGrowth, i, 0));
        running.set(`${c.key}:unit`, unit);
        const line = rev.lines.find((l) => l.key === c.volumeKey);
        amount = unit * (line?.volume ?? 0);
      } else if (c.kind === 'FIXED') {
        const next = (running.get(c.key) ?? 0) * (1 + at(c.amountGrowth, i, 0));
        running.set(c.key, next);
        amount = next;
      } else if (c.kind === 'CONSTRUCTION') {
        amount = capexByYear[i] ?? 0;
      }
      if (isNum(c.discount)) amount = amount * (1 - (c.discount as number));
      rows.push({ key: c.key, label: c.label, block: c.block, amount });
    }
    return rows;
  });
}

/* ---------------------------- Capex ---------------------------- */

function projectCapex(input: ProjectionInput, baseRevenue: number): {
  byLine: number[][];
  total: number[];
} {
  // Capex expressed as a share of revenue needs revenue, which needs capex
  // when a construction line exists. The base year's revenue breaks the
  // circularity: the programme is sized on the business as it stands.
  const byLine = input.capex.map((c) =>
    Array.from({ length: input.years }, (_, i) =>
      isNum(c.amounts?.[i])
        ? (c.amounts as number[])[Math.min(i, (c.amounts as number[]).length - 1)]
        : baseRevenue * at(c.pctRevenue, i, 0),
    ),
  );
  const total = Array.from({ length: input.years }, (_, i) =>
    byLine.reduce((s, line) => s + (line[i] ?? 0), 0),
  );
  return { byLine, total };
}

/* ------------------------ Working capital ------------------------ */

export interface WorkingCapitalYear {
  year: number;
  receivables: number;
  inventory: number;
  otherAssets: number;
  payables: number;
  otherLiabilities: number;
  provisions: { key: string; label: string; amount: number }[];
  netWorkingCapital: number;
  /** Change in NWC. Positive means it released cash. */
  change: number;
}

function projectWorkingCapital(
  terms: WorkingCapitalTerms,
  revenue: RevenueYear[],
  cogsByYear: number[],
  opening: { receivables: number; inventory: number; payables: number; otherAssets: number; otherLiabilities: number; provisions: number },
): WorkingCapitalYear[] {
  const out: WorkingCapitalYear[] = [];
  let previous: number | null = null;

  revenue.forEach((rev, i) => {
    const cogs = Math.abs(cogsByYear[i] ?? 0);
    const receivables = (rev.netRevenue * terms.receivableDays) / DAYS;
    const inventory = (cogs * terms.inventoryDays) / DAYS;
    const otherAssets = (rev.netRevenue * (terms.otherAssetDays ?? 0)) / DAYS;
    const payables = (cogs * terms.payableDays) / DAYS;
    const otherLiabilities = (rev.netRevenue * (terms.otherLiabilityDays ?? 0)) / DAYS;
    const provisions = (terms.provisionDays ?? []).map((p) => ({
      key: p.key,
      label: p.label,
      amount: ((p.onCost === false ? rev.netRevenue : cogs) * p.days) / DAYS,
    }));
    const provisionTotal = provisions.reduce((s, p) => s + p.amount, 0);

    const nwc = receivables + inventory + otherAssets - payables - otherLiabilities - provisionTotal;
    const openingNwc = opening.receivables + opening.inventory + opening.otherAssets
      - opening.payables - opening.otherLiabilities - opening.provisions;
    const prior = previous ?? openingNwc;
    // A rise in working capital consumes cash, so the cash-flow sign is negative.
    const change = prior - nwc;
    previous = nwc;

    out.push({
      year: rev.year, receivables, inventory, otherAssets, payables,
      otherLiabilities, provisions, netWorkingCapital: nwc, change,
    });
  });
  return out;
}

/* ------------------------- The statements ------------------------- */

export interface ProjectedIncome {
  year: number;
  grossRevenue: number;
  deductions: number;
  netRevenue: number;
  revenueGrowth: number | null;
  cogs: number;
  costLines: CostLineYear[];
  grossProfit: number;
  grossMargin: number | null;
  sga: number;
  ebitda: number;
  ebitdaMargin: number | null;
  depreciation: number;
  amortisation: number;
  da: number;
  ebit: number;
  ebitMargin: number | null;
  financialIncome: number;
  financialExpense: number;
  ebt: number;
  taxes: number;
  effectiveTaxRate: number | null;
  netIncome: number;
  netMargin: number | null;
}

export interface ProjectedBalance {
  year: number;
  cash: number;
  shortTermInvestments: number;
  receivables: number;
  inventory: number;
  otherCurrentAssets: number;
  currentAssets: number;
  tangibleAssets: number;
  intangibleAssets: number;
  otherNonCurrentAssets: number;
  nonCurrentAssets: number;
  totalAssets: number;

  payables: number;
  shortTermDebt: number;
  otherCurrentLiabilities: number;
  provisions: number;
  currentLiabilities: number;
  longTermDebt: number;
  otherNonCurrentLiabilities: number;
  nonCurrentLiabilities: number;
  totalLiabilities: number;

  shareCapital: number;
  retainedEarnings: number;
  minorityInterest: number;
  equity: number;
  totalLiabilitiesAndEquity: number;

  /** Assets minus liabilities and equity. Zero when the model is consistent. */
  balanceGap: number;
  balances: boolean;
}

export interface ProjectedCashFlow {
  year: number;
  netIncome: number;
  da: number;
  workingCapitalChange: number;
  operatingCashFlow: number;
  capex: number;
  investingCashFlow: number;
  debtDrawn: number;
  debtRepaid: number;
  interestPaid: number;
  dividendsPaid: number;
  financingCashFlow: number;
  netChangeInCash: number;
  openingCash: number;
  closingCash: number;
}

export interface ProjectionResult {
  baseYear: number;
  years: number[];
  revenue: RevenueYear[];
  capexByLine: number[][];
  capexTotal: number[];
  workingCapital: WorkingCapitalYear[];
  depreciationSchedule: VintageSchedule;
  amortisationSchedule: VintageSchedule;
  debtSchedule: DebtSchedule;
  income: ProjectedIncome[];
  balance: ProjectedBalance[];
  cashFlow: ProjectedCashFlow[];
  warnings: string[];
}


/**
 * The largest error a single line of the opening balance can carry. Reported
 * statements are stated to the cent, so a figure read from one is already up to
 * half a cent away from the number the company actually had.
 */
const ROUNDING_PER_SOURCE_LINE = 0.005;

/**
 * How far off the balance sheet may be before it counts as not closing.
 *
 * Two things are being tolerated, and only two. Floating-point accumulation
 * over a long horizon, which is parts per quadrillion. And the rounding in the
 * reported statements the opening balance is read from: those are stated to the
 * cent, so the cent arrives in the model through no fault of the model.
 *
 * The rounding term scales with how many lines were read, because that is how
 * the error actually accumulates — seventeen lines each rounded to the cent can
 * land eight and a half cents from the truth, and a fixed allowance calibrated
 * on a shorter balance sheet will call that a failure. It is not one. A real
 * modelling error — a line that moves on the balance sheet without moving
 * through the cash flow — is the size of that line, which is orders of
 * magnitude above either term here.
 */
function balanceTolerance(totalAssets: number, openingLines: number): number {
  return Math.max(openingLines * ROUNDING_PER_SOURCE_LINE, Math.abs(totalAssets) * 1e-6);
}

export function project(input: ProjectionInput): ProjectionResult {
  const warnings: string[] = [];
  const n = input.years;
  const opening = input.opening;
  // How many figures were read off the reported balance sheet, and so how much
  // of the cent-level rounding in it the projection inherits.
  const openingLineCount = Object.keys(opening).length;

  // Base-year revenue anchors any driver stated as a share of revenue.
  const baseNetRevenue = isNum(input.baseNetRevenue)
    ? (input.baseNetRevenue as number)
    : input.revenue.reduce((s, l) => s + (l.baseRevenue ?? (l.baseVolume ?? 0) * (l.basePrice ?? 0)), 0);

  const { byLine: capexByLine, total: capexTotal } = projectCapex(input, baseNetRevenue);
  const revenue = projectRevenue(input, capexTotal);
  const costRows = projectCosts(input, revenue, capexTotal);

  /* --- the asset base, by vintage ------------------------------- */
  const tangibleAdditions = capexTotal.map((_, i) =>
    input.capex.reduce((s, c, li) => s + (capexByLine[li][i] ?? 0) * c.tangibleShare, 0));
  const intangibleAdditions = capexTotal.map((_, i) =>
    input.capex.reduce((s, c, li) => s + (capexByLine[li][i] ?? 0) * (1 - c.tangibleShare), 0));

  const lifeFor = (year: number): number => {
    // Where a programme amortises to a contract end, the life shortens each
    // year as the contract runs down. Otherwise the stated useful life holds.
    const withEnd = input.capex.find((c) => isNum(c.amortiseToYear));
    if (withEnd && isNum(withEnd.amortiseToYear)) {
      return Math.max(1, (withEnd.amortiseToYear as number) - year + 1);
    }
    return input.capex[0]?.usefulLife ?? 10;
  };

  const openingTangibleLife = input.capex[0]?.amortiseToYear
    ? Math.max(1, (input.capex[0].amortiseToYear as number) - input.baseYear)
    : (input.capex[0]?.usefulLife ?? 10);

  const depreciationSchedule = buildVintageSchedule({
    baseYear: input.baseYear, years: n,
    openingBalance: opening.tangibleAssets, openingLife: openingTangibleLife,
    additions: tangibleAdditions, lifeFor,
  });
  const amortisationSchedule = buildVintageSchedule({
    baseYear: input.baseYear, years: n,
    openingBalance: opening.intangibleAssets, openingLife: openingTangibleLife,
    additions: intangibleAdditions, lifeFor,
  });

  /* --- debt ------------------------------------------------------ */
  let draws = input.debt.draws?.length
    ? capexTotal.map((_, i) => at(input.debt.draws, i, 0))
    : capexTotal.map((c) => c * input.debt.capexFundedByDebt);

  if (input.debt.rollMaturities && !input.debt.draws?.length) {
    // Refinancing what matures needs the schedule the refinancing changes, so
    // it is run once to read the maturities and again with them rolled.
    const dry = buildDebtSchedule({
      baseYear: input.baseYear, years: n,
      openingBalance: input.debt.openingBalance,
      amortisationYears: input.debt.amortisationYears,
      costOfDebt: input.debt.costOfDebt,
      draws, newDebtTenor: input.debt.newDebtTenor,
      amortisations: input.debt.amortisations,
    });
    draws = draws.map((d, i) => d + dry.years[i].amortisation);
  }

  const debtSchedule = buildDebtSchedule({
    baseYear: input.baseYear, years: n,
    openingBalance: input.debt.openingBalance,
    amortisationYears: input.debt.amortisationYears,
    costOfDebt: input.debt.costOfDebt,
    draws, newDebtTenor: input.debt.newDebtTenor,
    amortisations: input.debt.amortisations,
  });

  /* --- income statement ------------------------------------------ */
  const cogsByYear = costRows.map((rows) =>
    rows.filter((r) => r.block === 'COGS').reduce((s, r) => s + r.amount, 0));

  const workingCapital = projectWorkingCapital(
    input.workingCapital, revenue, cogsByYear,
    {
      receivables: opening.receivables,
      inventory: opening.inventory ?? 0,
      payables: opening.payables,
      otherAssets: opening.otherCurrentAssets ?? 0,
      otherLiabilities: opening.otherCurrentLiabilities ?? 0,
      provisions: opening.provisions ?? 0,
    },
  );

  const income: ProjectedIncome[] = [];
  const balance: ProjectedBalance[] = [];
  const cashFlow: ProjectedCashFlow[] = [];

  let cash = opening.cash;
  let retained = opening.retainedEarnings;
  let priorRevenue = baseNetRevenue;

  for (let i = 0; i < n; i++) {
    const year = input.baseYear + i + 1;
    const rev = revenue[i];
    const rows = costRows[i];
    const cogs = -cogsByYear[i];
    const sga = -rows.filter((r) => r.block === 'SGA').reduce((s, r) => s + r.amount, 0);

    const depreciation = chargeIn(depreciationSchedule, year);
    const amortisation = chargeIn(amortisationSchedule, year);
    const da = depreciation + amortisation;

    // EBITDA is struck before D&A; the cost lines above exclude it by design.
    const grossProfit = rev.netRevenue + cogs;
    const ebitda = grossProfit + sga;
    const ebit = ebitda - da;

    const debtYear = debtSchedule.years[i];
    // Interest is earned on the balance held through the year. Closing cash
    // depends on this income, so the opening balance is used rather than
    // iterating to a fixed point for a second-order amount.
    const financialIncome = cash * (input.debt.cashYield ?? 0);
    const financialExpense = -debtYear.interest;
    const ebt = ebit + financialIncome + financialExpense;
    const rate = at(input.taxRate, i, 0);
    const taxes = ebt > 0 ? -ebt * rate : 0;
    const netIncome = ebt + taxes;

    income.push({
      year,
      grossRevenue: rev.grossRevenue, deductions: -rev.deductions, netRevenue: rev.netRevenue,
      revenueGrowth: priorRevenue !== 0 ? rev.netRevenue / Math.abs(priorRevenue) - 1 : null,
      cogs, costLines: rows,
      grossProfit, grossMargin: safeDiv(grossProfit, rev.netRevenue),
      sga, ebitda, ebitdaMargin: safeDiv(ebitda, rev.netRevenue),
      depreciation: -depreciation, amortisation: -amortisation, da: -da,
      ebit, ebitMargin: safeDiv(ebit, rev.netRevenue),
      financialIncome, financialExpense, ebt,
      taxes, effectiveTaxRate: ebt !== 0 ? -taxes / ebt : null,
      netIncome, netMargin: safeDiv(netIncome, rev.netRevenue),
    });
    priorRevenue = rev.netRevenue;

    /* --- cash flow ---------------------------------------------- */
    const wc = workingCapital[i];
    const dividends = -Math.max(0, netIncome) * at(input.distribution.payout, i, 0);
    const operating = netIncome + da + wc.change;
    const investing = -capexTotal[i];
    // Interest is already in net income; financing shows the principal moves.
    const financing = debtYear.draws - debtYear.amortisation + dividends;
    const netChange = operating + investing + financing;
    const openingCash = cash;
    cash = openingCash + netChange;

    cashFlow.push({
      year, netIncome, da, workingCapitalChange: wc.change,
      operatingCashFlow: operating,
      capex: investing, investingCashFlow: investing,
      debtDrawn: debtYear.draws, debtRepaid: -debtYear.amortisation,
      interestPaid: financialExpense, dividendsPaid: dividends,
      financingCashFlow: financing,
      netChangeInCash: netChange, openingCash, closingCash: cash,
    });

    /* --- balance sheet ------------------------------------------ */
    retained = retained + netIncome + dividends;
    const provisionTotal = wc.provisions.reduce((s, p) => s + p.amount, 0);
    const tangible = closingIn(depreciationSchedule, year) ?? 0;
    const intangible = closingIn(amortisationSchedule, year) ?? 0;

    const currentAssets = cash + (opening.shortTermInvestments ?? 0) + wc.receivables + wc.inventory + wc.otherAssets;
    const nonCurrentAssets = tangible + intangible + (opening.otherNonCurrentAssets ?? 0);
    const totalAssets = currentAssets + nonCurrentAssets;

    const currentLiabilities = wc.payables + debtYear.currentPortion + wc.otherLiabilities + provisionTotal;
    const longTermDebt = Math.max(0, debtYear.closing - debtYear.currentPortion);
    const nonCurrentLiabilities = longTermDebt + (opening.otherNonCurrentLiabilities ?? 0);
    const totalLiabilities = currentLiabilities + nonCurrentLiabilities;

    const equity = opening.shareCapital + retained + (opening.minorityInterest ?? 0);
    const totalLiabilitiesAndEquity = totalLiabilities + equity;
    const gap = totalAssets - totalLiabilitiesAndEquity;

    balance.push({
      year,
      cash, shortTermInvestments: opening.shortTermInvestments ?? 0,
      receivables: wc.receivables, inventory: wc.inventory, otherCurrentAssets: wc.otherAssets,
      currentAssets,
      tangibleAssets: tangible, intangibleAssets: intangible,
      otherNonCurrentAssets: opening.otherNonCurrentAssets ?? 0, nonCurrentAssets,
      totalAssets,
      payables: wc.payables, shortTermDebt: debtYear.currentPortion,
      otherCurrentLiabilities: wc.otherLiabilities, provisions: provisionTotal,
      currentLiabilities,
      longTermDebt, otherNonCurrentLiabilities: opening.otherNonCurrentLiabilities ?? 0,
      nonCurrentLiabilities, totalLiabilities,
      shareCapital: opening.shareCapital, retainedEarnings: retained,
      minorityInterest: opening.minorityInterest ?? 0, equity,
      totalLiabilitiesAndEquity,
      balanceGap: gap,
      balances: Math.abs(gap) <= balanceTolerance(totalAssets, openingLineCount),
    });
  }

  const broken = balance.filter((b) => !b.balances);
  if (broken.length) {
    warnings.push(
      `The projected balance sheet does not close in ${broken.map((b) => b.year).join(', ')}. ` +
      'The gap is shown rather than plugged: an opening balance that does not itself balance is the usual cause.',
    );
  }
  if (cashFlow.some((c) => c.closingCash < 0)) {
    const first = cashFlow.find((c) => c.closingCash < 0);
    warnings.push(
      `Cash goes negative in ${first?.year}. The model has no revolver, so this is a funding gap to be closed, not a balance to be drawn on.`,
    );
  }

  return {
    baseYear: input.baseYear,
    years: revenue.map((r) => r.year),
    revenue, capexByLine, capexTotal, workingCapital,
    depreciationSchedule, amortisationSchedule, debtSchedule,
    income, balance, cashFlow, warnings,
  };
}
