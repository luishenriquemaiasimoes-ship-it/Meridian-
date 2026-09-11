import type { DcfAssumptions, DcfResult } from '../dcf';

/* ==================================================================
   Sector extensions.

   The generic DCF discounts one stream of free cash flow. Some companies
   do not generate cash that way: a bank earns on a book of loans, a
   miner on a set of orebodies with finite lives, a retailer on stores
   that each take years to mature, an infrastructure owner on contracts
   that expire on a stated date.

   Rather than bend the generic engine to every shape, or hardcode any
   one industry into the core, an extension declares how to break the
   company into cash-flow units and how to put them back together. The
   generic model stays the default and needs none of this.

   Nothing in this file, and nothing in the registry, names an industry.
   Extensions are supplied by the workspace, written for the case in
   hand, and are always opt-in.
   ================================================================== */

/** What the product knows about a company when deciding what to offer. */
export interface CompanyClassification {
  ticker: string;
  sector: string | null;
  industry: string | null;
  country: string | null;
  currency: string;
  /** Segment names reported by the company, when it reports any. */
  segments: string[];
  /** Free-form tags the workspace has applied. */
  tags: string[];
}

export type AssumptionKind = 'percent' | 'currency' | 'multiple' | 'number' | 'years' | 'date' | 'text' | 'select';

/** A premise an extension needs that the generic model has no field for. */
export interface ExtraAssumption {
  key: string;
  label: string;
  kind: AssumptionKind;
  /** Why this input exists, in the analyst's terms. */
  help?: string;
  options?: { value: string; label: string }[];
  defaultValue?: number | string | null;
  /** Which unit this assumption belongs to, or undefined for model-wide. */
  scope?: 'MODEL' | 'UNIT';
}

/**
 * One stream of cash flow inside the company: a contract, a mine, a store
 * cluster, a loan book, a licence — whatever the case calls for.
 */
export interface CashFlowUnit {
  id: string;
  name: string;
  /** Free-form label for what kind of thing this is, e.g. "Concession". */
  kind: string;
  /** First year the unit produces cash. */
  startYear: number;
  /**
   * Last year the unit produces cash. A finite life is the point of this
   * abstraction: a contract that ends in 2034 contributes nothing after it.
   */
  endYear: number | null;
  /** Ownership share, for units held through a partial stake. */
  ownership: number;
  /** Year-by-year cash flow, in the model's reporting unit. */
  cashFlows: { year: number; revenue: number | null; ebitda: number | null; capex: number | null; fcff: number | null }[];
  /** Discount rate for this unit, when it differs from the model WACC. */
  wacc?: number | null;
  /** Net debt sitting at this unit, for a sum-of-the-parts bridge. */
  netDebt?: number | null;
  /** Where the numbers behind this unit came from. */
  source?: string | null;
  notes?: string | null;
}

export type AggregationMethod = 'CONSOLIDATED' | 'SOTP';

export interface UnitValuation {
  unit: CashFlowUnit;
  /** Present value of the unit's own cash flows. */
  presentValue: number | null;
  /** Terminal value, when the unit has an indefinite life. */
  terminalValue: number | null;
  enterpriseValue: number | null;
  /** Equity value after the unit's own net debt and the ownership share. */
  equityValue: number | null;
  /** Years of remaining life at the valuation date. */
  remainingYears: number | null;
  warnings: string[];
}

export interface AggregatedValuation {
  method: AggregationMethod;
  units: UnitValuation[];
  /** Sum of unit enterprise values, before any group-level items. */
  enterpriseValue: number | null;
  /** Group net debt applied once under CONSOLIDATED; unit-level under SOTP. */
  netDebt: number;
  minorityInterest: number;
  equityValue: number | null;
  sharesOutstanding: number;
  fairValuePerShare: number | null;
  currentPrice: number | null;
  upside: number | null;
  /** Share of value each unit contributes, for the contribution chart. */
  contributions: { id: string; name: string; value: number | null; share: number | null }[];
  warnings: string[];
}

/** A structural risk an extension raises for the thesis monitor to watch. */
export interface ExtensionRisk {
  id: string;
  title: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  detail: string;
  /** A measure the monitor can track, when one exists. */
  watch?: { metric: string; comparator: 'GT' | 'LT'; threshold: number } | null;
}

/**
 * The contract an extension implements. Every hook is optional except the
 * identity: an extension that only adds risks is legitimate.
 */
export interface SectorExtension {
  id: string;
  name: string;
  /** One line on what kind of company this is for and why. */
  description: string;
  /** Offered when this returns true. Never applied automatically. */
  appliesWhen?: (c: CompanyClassification) => boolean;
  /** Premises the generic model has no field for. */
  extraAssumptions?: () => ExtraAssumption[];
  /** Breaks the company into cash-flow units from the supplied inputs. */
  buildCashFlowUnits?: (input: {
    assumptions: DcfAssumptions;
    extra: Record<string, number | string | null>;
    classification: CompanyClassification;
  }) => CashFlowUnit[];
  /** Structural risks worth monitoring for this shape of business. */
  extraRisks?: (input: { units: CashFlowUnit[]; classification: CompanyClassification }) => ExtensionRisk[];
  /** Overrides the default aggregation when the shape demands it. */
  aggregate?: (units: CashFlowUnit[], method: AggregationMethod, context: AggregationContext) => AggregatedValuation;
}

export interface AggregationContext {
  wacc: number;
  netDebt: number;
  minorityInterest: number;
  sharesOutstanding: number;
  currentPrice: number | null;
  baseYear: number;
  /** Perpetuity growth for units with no stated end year. */
  terminalGrowth: number;
  midYearConvention?: boolean;
}

export type { DcfAssumptions, DcfResult };
