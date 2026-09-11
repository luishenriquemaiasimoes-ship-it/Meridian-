import { isNum } from './core';

/* ==================================================================
   Provenance.

   A number in a model is either traceable to something a reader can
   open, or it is an assertion. The product does not refuse assertions —
   an analyst's own estimate is a legitimate input — but it does insist
   on knowing which is which, and it will not let an estimate wear the
   clothes of a filing.
   ================================================================== */

export type SourceKind =
  | 'FILING'        // a regulatory filing
  | 'RELEASE'       // an earnings release or company statement
  | 'PRESENTATION'  // an investor presentation or call
  | 'RESEARCH'      // sell-side or in-house research
  | 'MARKET'        // an observed market price or yield
  | 'MANUAL'        // the analyst's own input
  | 'DERIVED'       // computed by the platform from other inputs
  | 'MOCK';         // simulated data

export interface SourceRecord {
  path: string;
  label: string;
  kind: SourceKind;
  reference: string;
  documentId?: string | null;
  url?: string | null;
  asOf?: string | null;
  value?: number | null;
  note?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
}

/** How much weight a reader should put on a figure of this kind. */
export const SOURCE_STANDING: Record<SourceKind, 'PRIMARY' | 'SECONDARY' | 'ASSERTED' | 'SIMULATED'> = {
  FILING: 'PRIMARY',
  RELEASE: 'PRIMARY',
  PRESENTATION: 'SECONDARY',
  RESEARCH: 'SECONDARY',
  MARKET: 'PRIMARY',
  MANUAL: 'ASSERTED',
  DERIVED: 'SECONDARY',
  MOCK: 'SIMULATED',
};

export const SOURCE_LABEL: Record<SourceKind, string> = {
  FILING: 'Regulatory filing',
  RELEASE: 'Earnings release',
  PRESENTATION: 'Investor presentation',
  RESEARCH: 'Research',
  MARKET: 'Market observation',
  MANUAL: 'Analyst input',
  DERIVED: 'Computed by MERIDIAN',
  MOCK: 'Simulated',
};

/** One input the model needs, and whether anything vouches for it. */
export interface RequiredInput {
  path: string;
  label: string;
  value: number | null;
  /** Inputs the model cannot produce a number without. */
  critical: boolean;
  /** Group for the panel, e.g. "Discount rate" or "Forecast". */
  group: string;
}

export interface VerificationRow extends RequiredInput {
  source: SourceRecord | null;
  standing: 'PRIMARY' | 'SECONDARY' | 'ASSERTED' | 'SIMULATED' | 'NONE';
  /** Days between the observation and the valuation date. */
  ageDays: number | null;
  status: 'VERIFIED' | 'ASSERTED' | 'SIMULATED' | 'STALE' | 'UNVERIFIED';
}

export interface VerificationReport {
  rows: VerificationRow[];
  counts: {
    total: number;
    verified: number;
    asserted: number;
    simulated: number;
    stale: number;
    unverified: number;
    criticalUnverified: number;
  };
  /** 0 to 100. Primary sources score full; an unsourced critical input costs most. */
  score: number;
  summary: string;
}

function ageInDays(asOf: string | null | undefined, against: string): number | null {
  if (!asOf) return null;
  const a = new Date(asOf).getTime();
  const b = new Date(against).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.round((b - a) / 86_400_000);
}

/**
 * Builds the verification report for one model. `staleAfterDays` is the point
 * past which a market observation stops describing today — a risk-free rate
 * from six months ago is not the risk-free rate.
 */
export function verifyInputs(
  required: RequiredInput[],
  sources: SourceRecord[],
  asOf: string,
  staleAfterDays = 90,
): VerificationReport {
  const byPath = new Map(sources.map((s) => [s.path, s]));

  const rows: VerificationRow[] = required.map((input) => {
    const source = byPath.get(input.path) ?? null;
    const standing = source ? SOURCE_STANDING[source.kind] : 'NONE';
    const age = ageInDays(source?.asOf, asOf);

    let status: VerificationRow['status'];
    if (!source) status = 'UNVERIFIED';
    else if (standing === 'SIMULATED') status = 'SIMULATED';
    else if (standing === 'ASSERTED') status = 'ASSERTED';
    else if (isNum(age) && (age as number) > staleAfterDays) status = 'STALE';
    else status = 'VERIFIED';

    return { ...input, source, standing, ageDays: age, status };
  });

  const counts = {
    total: rows.length,
    verified: rows.filter((r) => r.status === 'VERIFIED').length,
    asserted: rows.filter((r) => r.status === 'ASSERTED').length,
    simulated: rows.filter((r) => r.status === 'SIMULATED').length,
    stale: rows.filter((r) => r.status === 'STALE').length,
    unverified: rows.filter((r) => r.status === 'UNVERIFIED').length,
    criticalUnverified: rows.filter((r) => r.status === 'UNVERIFIED' && r.critical).length,
  };

  // An unsourced critical input is the expensive case; an analyst's own
  // estimate, declared as one, costs almost nothing.
  const penalty = rows.reduce((sum, r) => {
    if (r.status === 'VERIFIED') return sum;
    if (r.status === 'ASSERTED') return sum + (r.critical ? 6 : 3);
    if (r.status === 'SIMULATED') return sum + (r.critical ? 8 : 4);
    if (r.status === 'STALE') return sum + (r.critical ? 10 : 5);
    return sum + (r.critical ? 20 : 8);
  }, 0);
  const score = rows.length === 0 ? 0 : Math.max(0, Math.min(100, 100 - penalty));

  const summary = counts.unverified === 0
    ? counts.asserted + counts.simulated === 0
      ? 'Every input traces to a source a reader can open.'
      : `Every input has a source; ${counts.asserted} ${counts.asserted === 1 ? 'is' : 'are'} the analyst's own estimate and ${counts.simulated} simulated.`
    : `${counts.unverified} input${counts.unverified === 1 ? '' : 's'} carry no source${counts.criticalUnverified ? `, ${counts.criticalUnverified} of them load-bearing` : ''}.`;

  return { rows, counts, score, summary };
}

/**
 * The inputs a DCF needs, as paths the source table can key on. Kept here so
 * the panel, the model audit and the API all agree on what "complete" means.
 */
export function requiredDcfInputs(a: {
  wacc?: number | null;
  riskFree?: number | null;
  equityRiskPremium?: number | null;
  countryRiskPremium?: number | null;
  beta?: number | null;
  costOfDebt?: number | null;
  taxRate?: number | null;
  marketValueEquity?: number | null;
  debt?: number | null;
  baseRevenue?: number | null;
  revenueGrowth?: number[];
  ebitdaMargin?: number[];
  capexPctRevenue?: number[];
  nwcPctRevenue?: number[];
  terminalGrowth?: number | null;
  exitMultiple?: number | null;
  netDebt?: number | null;
  sharesOutstanding?: number | null;
}): RequiredInput[] {
  const n = (v: number | null | undefined) => (isNum(v) ? (v as number) : null);
  const first = (arr: number[] | undefined) => (arr?.length ? arr[0] : null);

  return [
    { path: 'wacc.riskFree', label: 'Risk-free rate', value: n(a.riskFree), critical: true, group: 'Discount rate' },
    { path: 'wacc.equityRiskPremium', label: 'Equity risk premium', value: n(a.equityRiskPremium), critical: true, group: 'Discount rate' },
    { path: 'wacc.countryRiskPremium', label: 'Country risk premium', value: n(a.countryRiskPremium), critical: false, group: 'Discount rate' },
    { path: 'wacc.beta', label: 'Beta', value: n(a.beta), critical: true, group: 'Discount rate' },
    { path: 'wacc.costOfDebt', label: 'Cost of debt', value: n(a.costOfDebt), critical: true, group: 'Discount rate' },
    { path: 'wacc.taxRate', label: 'Tax rate', value: n(a.taxRate), critical: true, group: 'Discount rate' },
    { path: 'wacc.marketValueEquity', label: 'Market value of equity', value: n(a.marketValueEquity), critical: true, group: 'Capital structure' },
    { path: 'wacc.debt', label: 'Debt', value: n(a.debt), critical: true, group: 'Capital structure' },
    { path: 'forecast.baseRevenue', label: 'Base-year revenue', value: n(a.baseRevenue), critical: true, group: 'Forecast' },
    { path: 'forecast.revenueGrowth', label: 'Revenue growth path', value: first(a.revenueGrowth), critical: true, group: 'Forecast' },
    { path: 'forecast.ebitdaMargin', label: 'EBITDA margin path', value: first(a.ebitdaMargin), critical: true, group: 'Forecast' },
    { path: 'forecast.capexPctRevenue', label: 'Capex % of revenue', value: first(a.capexPctRevenue), critical: false, group: 'Forecast' },
    { path: 'forecast.nwcPctRevenue', label: 'Working capital % of revenue', value: first(a.nwcPctRevenue), critical: false, group: 'Forecast' },
    { path: 'terminal.growth', label: 'Perpetuity growth', value: n(a.terminalGrowth), critical: true, group: 'Terminal value' },
    { path: 'terminal.exitMultiple', label: 'Exit multiple', value: n(a.exitMultiple), critical: false, group: 'Terminal value' },
    { path: 'bridge.netDebt', label: 'Net debt', value: n(a.netDebt), critical: true, group: 'Equity bridge' },
    { path: 'bridge.shares', label: 'Shares outstanding', value: n(a.sharesOutstanding), critical: true, group: 'Equity bridge' },
  ];
}
