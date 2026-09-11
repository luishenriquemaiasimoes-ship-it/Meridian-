import type { BlockKind } from './types';

/* ==================================================================
   The agent contract.

   An agent is not a chat window with a different prompt. It is a
   procedure over workspace data that produces a report a reviewer can
   check line by line: every statement typed by what kind of claim it
   is, and every figure carrying the screen it was read from.

   The guardrails in the brief are enforced here rather than asked for
   politely: a finding without a source cannot be constructed, and a
   figure the workspace does not hold has one legal representation —
   a MISSING statement saying what is absent.
   ================================================================== */

export type AgentId = 'DCF_BUILD' | 'MODEL_AUDIT' | 'QA_PREP' | 'THESIS_MONITOR';

export const AGENT_META: Record<AgentId, { name: string; purpose: string; scope: 'COMPANY' | 'WORKSPACE' }> = {
  DCF_BUILD: {
    name: 'DCF Build Agent',
    purpose: 'Walks a model from base year to target price, asking for each premise before it is used and saying what the workspace can offer.',
    scope: 'COMPANY',
  },
  MODEL_AUDIT: {
    name: 'Model Audit Agent',
    purpose: 'Reviews a finished model the way a senior would: arithmetic, discount rate, terminal assumption, provenance, and the market it disagrees with.',
    scope: 'COMPANY',
  },
  QA_PREP: {
    name: 'Q&A Prep Agent',
    purpose: 'Drafts the questions a committee would ask and answers each from workspace data, or says what is missing.',
    scope: 'COMPANY',
  },
  THESIS_MONITOR: {
    name: 'Thesis Monitor Agent',
    purpose: 'Checks live theses and the premises behind their models against what the company has since reported.',
    scope: 'WORKSPACE',
  },
};

/** How a check came out. PASS/WARNING/FAIL is the Model Health vocabulary. */
export type FindingSeverity = 'PASS' | 'INFO' | 'WARNING' | 'FAIL';

export const SEVERITY_ORDER: Record<FindingSeverity, number> = {
  FAIL: 0, WARNING: 1, INFO: 2, PASS: 3,
};

export interface AgentFinding {
  id: string;
  severity: FindingSeverity;
  /** What the check looked at, for grouping in the report. */
  area: string;
  title: string;
  detail: string;
  /** What the analyst would do about it. Absent on a PASS. */
  remedy?: string | null;
  /**
   * Where in the product this can be verified. Never empty: a finding
   * nobody can trace back is an assertion, and the brief forbids those.
   */
  sources: string[];
}

/** One statement in an agent's narrative, typed like every other AI output. */
export interface AgentStatement {
  kind: BlockKind;
  text: string;
  sources: string[];
}

/** A step in a guided build. */
export interface AgentStep {
  id: string;
  order: number;
  title: string;
  /** What the agent needs to know before this part of the model is usable. */
  question: string;
  status: 'DONE' | 'NEEDS_INPUT' | 'BLOCKED';
  /**
   * What the workspace can offer towards the answer, with its source. The
   * agent never writes it into the model: outside Demo Mode a premise is
   * the analyst's to enter, which is the whole point of asking.
   */
  offered: { label: string; value: string; source: string }[];
  /** Checks that already fire on what has been entered so far. */
  findings: AgentFinding[];
  /** Where the analyst goes to answer it. */
  href?: string | null;
}

export interface AgentReport {
  agent: AgentId;
  /** The company, portfolio or workspace the run was about. */
  subject: string;
  subjectLabel: string;
  headline: string;
  /** The one-word verdict, where the agent produces one. */
  verdict: FindingSeverity | null;
  statements: AgentStatement[];
  findings: AgentFinding[];
  steps: AgentStep[];
  /** Counts by severity, for the header of the report. */
  counts: Record<FindingSeverity, number>;
  generatedAt: string;
  /** True when the underlying data is simulated, stated rather than hidden. */
  simulated: boolean;
}

export function countSeverities(findings: AgentFinding[]): Record<FindingSeverity, number> {
  const counts: Record<FindingSeverity, number> = { PASS: 0, INFO: 0, WARNING: 0, FAIL: 0 };
  for (const f of findings) counts[f.severity] += 1;
  return counts;
}

/** The worst thing the run found. Nothing found at all is not a pass. */
export function verdictOf(findings: AgentFinding[]): FindingSeverity | null {
  if (!findings.length) return null;
  return findings.reduce<FindingSeverity>(
    (worst, f) => (SEVERITY_ORDER[f.severity] < SEVERITY_ORDER[worst] ? f.severity : worst),
    'PASS',
  );
}

export function sortFindings(findings: AgentFinding[]): AgentFinding[] {
  return findings.slice().sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

/**
 * Builds a finding. The source list is required and checked: this is where
 * "never present a number without pointing at where it came from" stops being
 * a rule someone has to remember.
 */
export function finding(f: Omit<AgentFinding, 'sources'> & { sources: string[] }): AgentFinding {
  if (!f.sources.length) {
    throw new Error(`Agent finding "${f.id}" has no source. Every finding must name where it can be checked.`);
  }
  return { ...f, remedy: f.remedy ?? null };
}

/** The one legal way to report a figure the workspace does not hold. */
export function missing(what: string, where: string): AgentStatement {
  return { kind: 'MISSING', text: `Data unavailable: ${what}.`, sources: [where] };
}
