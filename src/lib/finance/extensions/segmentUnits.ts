import { isNum } from '../core';
import type { CashFlowUnit, ExtraAssumption } from './types';
import type { DcfAssumptions } from '../dcf';

/* ==================================================================
   Building cash-flow units without an extension.

   Most companies that need unit-level treatment need it for a mundane
   reason: they report segments that behave differently. This builder
   turns a reported segment split into units using only the generic DCF
   premises, so an analyst can get unit-level treatment without writing
   an extension at all.

   An extension is for the cases this does not cover — a finite contract
   life, a ramp curve, a phased capex programme, a per-unit discount
   rate. Those are the hooks; this is the floor.
   ================================================================== */

export interface SegmentInput {
  name: string;
  /** Share of base-year revenue, 0 to 1. */
  revenueShare: number;
  /** EBITDA margin for this segment, overriding the model-wide margin. */
  ebitdaMargin?: number | null;
  /** Revenue growth for this segment, overriding the model-wide path. */
  revenueGrowth?: number | null;
  /** Capex as a share of this segment's revenue. */
  capexPctRevenue?: number | null;
  /** Last year this segment produces cash. Null means indefinite. */
  endYear?: number | null;
  /** Ownership share, for a segment held through a partial stake. */
  ownership?: number | null;
  /** Net debt carried at this segment. */
  netDebt?: number | null;
  /** Discount rate for this segment, when it differs from the model. */
  wacc?: number | null;
  source?: string | null;
}

export const SEGMENT_ASSUMPTIONS: ExtraAssumption[] = [
  { key: 'revenueShare', label: 'Share of revenue', kind: 'percent', scope: 'UNIT', help: 'Share of base-year revenue this unit accounts for. The shares should sum to one.' },
  { key: 'ebitdaMargin', label: 'EBITDA margin', kind: 'percent', scope: 'UNIT', help: 'Leave blank to use the model-wide margin.' },
  { key: 'revenueGrowth', label: 'Revenue growth', kind: 'percent', scope: 'UNIT', help: 'Leave blank to use the model-wide growth path.' },
  { key: 'capexPctRevenue', label: 'Capex % of revenue', kind: 'percent', scope: 'UNIT' },
  { key: 'endYear', label: 'Final year', kind: 'number', scope: 'UNIT', help: 'The last year this unit produces cash. Leave blank for an indefinite life — a unit with an end year gets no terminal value.' },
  { key: 'ownership', label: 'Ownership', kind: 'percent', scope: 'UNIT', help: 'Defaults to 100%.' },
  { key: 'netDebt', label: 'Net debt at this unit', kind: 'currency', scope: 'UNIT', help: 'Used under a sum of the parts, where each unit nets its own debt.' },
  { key: 'wacc', label: 'Discount rate', kind: 'percent', scope: 'UNIT', help: 'Leave blank to use the model WACC.' },
];

function at(arr: number[] | undefined, i: number, fallback: number): number {
  if (!arr?.length) return fallback;
  const v = arr[Math.min(i, arr.length - 1)];
  return isNum(v) ? v : fallback;
}

/**
 * Projects each segment forward on the model's premises, overridden per
 * segment where the analyst has said something different.
 */
export function buildSegmentUnits(
  assumptions: DcfAssumptions,
  segments: SegmentInput[],
): CashFlowUnit[] {
  const horizon = Math.max(assumptions.revenueGrowth.length, 1);

  return segments.map((seg, index) => {
    const baseRevenue = assumptions.baseRevenue * (isNum(seg.revenueShare) ? seg.revenueShare : 0);
    const cashFlows: CashFlowUnit['cashFlows'] = [];
    let revenue = baseRevenue;
    let prevNwc = baseRevenue * at(assumptions.nwcPctRevenue, 0, 0);

    for (let i = 0; i < horizon; i++) {
      const year = assumptions.baseYear + i + 1;
      const g = isNum(seg.revenueGrowth) ? (seg.revenueGrowth as number) : at(assumptions.revenueGrowth, i, 0);
      revenue = revenue * (1 + g);

      const margin = isNum(seg.ebitdaMargin) ? (seg.ebitdaMargin as number) : at(assumptions.ebitdaMargin, i, 0);
      const ebitda = revenue * margin;
      const da = revenue * at(assumptions.daPctRevenue, i, 0);
      const ebit = ebitda - da;
      const taxes = ebit > 0 ? ebit * assumptions.taxRate : 0;
      const capexPct = isNum(seg.capexPctRevenue) ? (seg.capexPctRevenue as number) : at(assumptions.capexPctRevenue, i, 0);
      const capex = revenue * capexPct;
      const nwc = revenue * at(assumptions.nwcPctRevenue, i, 0);
      const fcff = ebit - taxes + da - capex - (nwc - prevNwc);
      prevNwc = nwc;

      // A unit past its final year produces nothing; it is not extrapolated.
      const past = isNum(seg.endYear) && year > (seg.endYear as number);
      cashFlows.push({
        year,
        revenue: past ? 0 : revenue,
        ebitda: past ? 0 : ebitda,
        capex: past ? 0 : capex,
        fcff: past ? 0 : fcff,
      });
    }

    return {
      id: `segment-${index}-${seg.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: seg.name,
      kind: 'Segment',
      startYear: assumptions.baseYear + 1,
      endYear: isNum(seg.endYear) ? (seg.endYear as number) : null,
      ownership: isNum(seg.ownership) ? (seg.ownership as number) : 1,
      cashFlows,
      wacc: isNum(seg.wacc) ? (seg.wacc as number) : null,
      netDebt: isNum(seg.netDebt) ? (seg.netDebt as number) : null,
      source: seg.source ?? null,
    };
  });
}

/** Warns when the declared revenue shares do not describe the whole company. */
export function checkSegmentCoverage(segments: SegmentInput[]): { total: number; warning: string | null } {
  const total = segments.reduce((s, x) => s + (isNum(x.revenueShare) ? x.revenueShare : 0), 0);
  if (Math.abs(total - 1) <= 0.005) return { total, warning: null };
  return {
    total,
    warning: total < 1
      ? `The units account for ${(total * 100).toFixed(1)}% of revenue. The remaining ${((1 - total) * 100).toFixed(1)}% is not valued anywhere.`
      : `The units account for ${(total * 100).toFixed(1)}% of revenue, more than the company reports. Something is being counted twice.`,
  };
}
