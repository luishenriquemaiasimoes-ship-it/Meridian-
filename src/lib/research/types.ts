/* ==================================================================
   The shapes the research workflow stores.

   Everything here is deliberately loose about structure and strict
   about provenance. An analyst decides how many theses a company has,
   what a stress test tests, and which rows belong in a peer comparison;
   the product decides that every figure cited has to come from
   somewhere a reader can check.
   ================================================================== */

/** One row of a peer comparison. The analyst decides what belongs. */
export interface PeerComparisonRow {
  key: string;
  label: string;
  /** A metric the platform already computes, or a free row the analyst fills. */
  kind: 'METRIC' | 'MANUAL';
  /** The CompanyMetrics key when kind is METRIC. */
  metric?: string | null;
  format: 'percent' | 'multiple' | 'currency' | 'currencyMillions' | 'number' | 'text';
  /** true when a lower number is better, for the ranking colour. */
  inverse?: boolean;
  /** Per-ticker values when kind is MANUAL. */
  values?: Record<string, string | number | null>;
  note?: string | null;
}

export interface SectorSection {
  key: string;
  title: string;
  body: string;
}

/**
 * One thesis inside a deck. Depth is explicit because it is real: a core
 * thesis gets pages and a secondary one gets a paragraph, and pretending
 * otherwise makes the deck harder to read, not more rigorous.
 */
export interface DeckThesis {
  id: string;
  /** Display order; the deck is read in sequence. */
  order: number;
  title: string;
  /** CORE carries the recommendation; SUPPORTING and OPTIONAL do not. */
  weight: 'CORE' | 'SUPPORTING' | 'OPTIONAL';
  rationale: string;
  /** What has to be true for this to work. */
  requires: string[];
  /** What would prove it wrong. */
  breaks: string[];
  /** Measures that track it, pointing at the monitoring engine. */
  drivers: { label: string; metric?: string | null; target?: number | null; comparator?: 'GTE' | 'LTE' | null }[];
  /** How sure the analyst is, in their own words. */
  conviction: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  notes?: string | null;
}

/** A risk placed on the probability-by-impact grid. */
export interface DeckRisk {
  id: string;
  title: string;
  category: string;
  /** 0 to 1. */
  probability: number;
  /** 0 to 1, as a share of the thesis it would destroy. */
  impact: number;
  detail?: string | null;
  mitigation?: string | null;
  /** The thesis this risk attacks, when it attacks a specific one. */
  thesisId?: string | null;
}

/**
 * A test of the thesis against something happening outside it. The trigger is
 * whatever the analyst decides matters for this company: a competitor's move,
 * an auction, a product launch, a refinancing window, a price change.
 */
export interface StressTest {
  id: string;
  kind: 'COMPETITIVE' | 'FINANCING' | 'OPERATIONAL' | 'REGULATORY' | 'OTHER';
  title: string;
  /** What happens in the test. */
  trigger: string;
  /** What it would do to the business, in the analyst's words. */
  consequence: string;
  /** Quantified effect, when the analyst has quantified it. */
  effect?: {
    measure: string;
    /** The change, signed, in the measure's own unit. */
    delta: number | null;
    format: 'percent' | 'currency' | 'multiple' | 'number';
  } | null;
  /** Whether the thesis survives it. */
  verdict: 'SURVIVES' | 'WEAKENED' | 'BROKEN' | 'UNTESTED';
  response?: string | null;
}

/** Themes the Q&A generator organises questions under. */
export type QaTheme =
  | 'VALUATION'
  | 'CAPITAL_STRUCTURE'
  | 'GOVERNANCE'
  | 'COMPETITION'
  | 'REGULATION'
  | 'OPERATIONS'
  | 'PORTFOLIO'
  | 'THESIS'
  | 'DATA';

export const QA_THEME_LABEL: Record<QaTheme, string> = {
  VALUATION: 'Valuation',
  CAPITAL_STRUCTURE: 'Capital structure and financing',
  GOVERNANCE: 'Governance and control',
  COMPETITION: 'Competition',
  REGULATION: 'Regulation and the cycle',
  OPERATIONS: 'Operations',
  PORTFOLIO: 'Portfolio fit',
  THESIS: 'The thesis itself',
  DATA: 'The data behind the model',
};

/** The quadrant a risk falls into on the probability-by-impact grid. */
export function riskQuadrant(probability: number, impact: number): {
  key: 'MANAGE' | 'MONITOR' | 'ACCEPT' | 'CONTINGENCY';
  label: string;
  tone: 'neg' | 'warn' | 'neutral' | 'pos';
} {
  const high = (v: number) => v >= 0.5;
  if (high(probability) && high(impact)) return { key: 'MANAGE', label: 'Manage', tone: 'neg' };
  if (!high(probability) && high(impact)) return { key: 'CONTINGENCY', label: 'Plan for', tone: 'warn' };
  if (high(probability) && !high(impact)) return { key: 'MONITOR', label: 'Monitor', tone: 'warn' };
  return { key: 'ACCEPT', label: 'Accept', tone: 'neutral' };
}

export const THESIS_WEIGHT_LABEL: Record<DeckThesis['weight'], string> = {
  CORE: 'Core', SUPPORTING: 'Supporting', OPTIONAL: 'Optional',
};

export function blankThesis(order: number): DeckThesis {
  return {
    id: `thesis-${Date.now()}-${order}`,
    order,
    title: '',
    weight: order === 1 ? 'CORE' : 'SUPPORTING',
    rationale: '',
    requires: [],
    breaks: [],
    drivers: [],
    conviction: 'MEDIUM',
  };
}
