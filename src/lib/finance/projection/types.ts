import type { Currency } from '../types';

/* ==================================================================
   A model that projects the three statements, not a margin.

   The shape here follows how a full model is actually built: revenue
   is driven by something (a volume and a price, a segment split, a
   contract), costs are built from their own drivers, capex feeds an
   asset base that depreciates on a vintage schedule, debt runs on a
   schedule of draws and amortisations, and working capital falls out
   of payment terms. The statements are the *result*, not the input.

   Everything is nominal, in the company's reporting unit, and every
   projected year carries the same fields as a reported one so the two
   can sit in the same table.
   ================================================================== */

/** How the top line is built. */
export type RevenueDriverKind =
  /** A volume and a price, each with its own growth path. */
  | 'VOLUME_PRICE'
  /** A stated growth path applied to the base year. */
  | 'GROWTH'
  /** A share of another line, e.g. accessory revenue as % of toll revenue. */
  | 'PCT_OF'
  /** Capex recognised as revenue, as concession accounting requires. */
  | 'CONSTRUCTION';

export interface RevenueLine {
  key: string;
  label: string;
  kind: RevenueDriverKind;

  /** VOLUME_PRICE: units in the base year, and the path from there. */
  baseVolume?: number | null;
  volumeGrowth?: number[];
  /** VOLUME_PRICE: price per unit in the base year. */
  basePrice?: number | null;
  /** Price growth. Where a tariff is index-linked this is the index path. */
  priceGrowth?: number[];
  /** The index the price follows, named so the reader knows what it is. */
  priceIndex?: string | null;

  /** GROWTH: base-year revenue and its growth path. */
  baseRevenue?: number | null;
  revenueGrowth?: number[];

  /** PCT_OF: the line this one is a share of, and the share. */
  ofKey?: string | null;
  pctOf?: number[];

  /** CONSTRUCTION: the share of capex recognised as revenue. */
  pctOfCapex?: number[];

  source?: string | null;
}

/** A cost line, built from its own driver rather than from a margin. */
export interface CostLine {
  key: string;
  label: string;
  /** Which statement block it belongs to. */
  block: 'COGS' | 'SGA';
  kind:
    /** A share of net revenue. */
    | 'PCT_REVENUE'
    /** A share of a named revenue line. */
    | 'PCT_REVENUE_LINE'
    /** A cost per unit of volume, indexed. */
    | 'PER_UNIT'
    /** A fixed amount, indexed. */
    | 'FIXED'
    /** Capex recognised as cost, the mirror of construction revenue. */
    | 'CONSTRUCTION';
  pct?: number[];
  /**
   * What a percentage driver is a percentage OF. Construction revenue is a
   * pass-through that inflates the top line without adding economics, so a
   * cost stated as a share of revenue usually means the operating line, not
   * the reported one. Getting this wrong silently overstates every cost.
   */
  base?: 'NET_REVENUE' | 'NET_REVENUE_EX_CONSTRUCTION';
  ofKey?: string | null;
  basePerUnit?: number | null;
  perUnitGrowth?: number[];
  volumeKey?: string | null;
  baseAmount?: number | null;
  amountGrowth?: number[];
  /** A negotiated discount applied to the line, e.g. a synergy. */
  discount?: number | null;
  source?: string | null;
}

/** One capital programme: what is spent, on what, and how it is classified. */
export interface CapexLine {
  key: string;
  label: string;
  /** Amount per projected year, positive. Shorter arrays reuse the last value. */
  amounts?: number[];
  /** Or a share of net revenue, when the programme scales with the business. */
  pctRevenue?: number[];
  /** Share booked as tangible fixed assets; the rest is intangible. */
  tangibleShare: number;
  /** Useful life in years for what is added here. */
  usefulLife: number;
  /**
   * A concession amortises over the years left on the contract, not over a
   * fixed life. When set, each vintage is amortised over the years remaining
   * to this final year.
   */
  amortiseToYear?: number | null;
  /** Total still contracted, for the disclosure panel. */
  contractedRemaining?: number | null;
  source?: string | null;
}

/** Payment terms, in days. Working capital falls out of these. */
export interface WorkingCapitalTerms {
  /** Days of receivables on revenue. */
  receivableDays: number;
  /** Days of payables on cost of goods. */
  payableDays: number;
  /** Days of inventory on cost of goods. */
  inventoryDays: number;
  /** Other operating assets and liabilities, as days on revenue. */
  otherAssetDays?: number;
  otherLiabilityDays?: number;
  /** Named provisions carried as days on cost, e.g. a maintenance provision. */
  provisionDays?: { key: string; label: string; days: number; onCost?: boolean }[];
}

/** The debt the company starts with and how it evolves. */
export interface DebtPlan {
  /** Gross debt at the base year. */
  openingBalance: number;
  /** Cost of the debt, pre-tax. Where it is index-linked, this is all-in. */
  costOfDebt: number;
  /** Years over which existing debt amortises, straight-line. */
  amortisationYears: number;
  /** Share of each year's capex funded with new debt. */
  capexFundedByDebt: number;
  /** Tenor of new draws. */
  newDebtTenor: number;
  /** Explicit draws per year, when the programme is known rather than derived. */
  draws?: number[];
  /** Explicit amortisations per year, overriding the straight-line schedule. */
  amortisations?: number[];
  /** Rate earned on the cash balance. */
  cashYield?: number;
  source?: string | null;
}

/** What the company pays out, and what that leaves for the balance sheet. */
export interface DistributionPlan {
  /** Share of net income paid as dividends and interest on capital. */
  payout: number[];
  /** A one-off return of capital, e.g. at the end of a concession. */
  liquidationDividendYear?: number | null;
}

/** The starting point: the last reported balance sheet the model builds on. */
export interface OpeningBalance {
  cash: number;
  shortTermInvestments?: number;
  receivables: number;
  inventory?: number;
  otherCurrentAssets?: number;
  tangibleAssets: number;
  intangibleAssets: number;
  otherNonCurrentAssets?: number;

  payables: number;
  shortTermDebt: number;
  longTermDebt: number;
  otherCurrentLiabilities?: number;
  otherNonCurrentLiabilities?: number;
  provisions?: number;

  shareCapital: number;
  retainedEarnings: number;
  minorityInterest?: number;
}

/** Everything the projection needs. */
export interface ProjectionInput {
  ticker?: string;
  currency?: Currency;
  /** Fiscal year of the last reported period. */
  baseYear: number;
  /** Number of years to project. */
  years: number;
  /** The last reported balance sheet. */
  opening: OpeningBalance;

  revenue: RevenueLine[];
  /** Direct taxes on gross revenue, as a share. */
  revenueDeductions?: number[];
  costs: CostLine[];
  capex: CapexLine[];
  workingCapital: WorkingCapitalTerms;
  debt: DebtPlan;
  distribution: DistributionPlan;

  /** Effective tax rate on pre-tax profit. */
  taxRate: number[];
  /** Base-year revenue by line, used where a driver is a share of revenue. */
  baseNetRevenue?: number | null;

  /** Discount rates, for the valuation block. */
  wacc?: number | null;
  costOfEquity?: number | null;
  /** Shares outstanding, for the per-share bridge. */
  sharesOutstanding?: number | null;
  currentPrice?: number | null;
  /** Ownership, where the model values a partial stake. */
  ownership?: number;
  /** Covenant thresholds tested every year. */
  covenants?: CovenantTest[];
}

export interface CovenantTest {
  key: string;
  label: string;
  /** Which computed ratio it tests. */
  measure: 'DSCR' | 'NET_DEBT_EBITDA' | 'INTEREST_COVERAGE' | 'EBITDA_INTEREST';
  /** The threshold, and which side of it is compliant. */
  threshold: number;
  comparator: 'GTE' | 'LTE';
}
