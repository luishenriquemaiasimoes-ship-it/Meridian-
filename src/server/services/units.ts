import { prisma, parseJson } from '@/lib/db';
import { getCompanyDossier } from './company';
import { defaultAssumptionsFor } from './valuation';
import { buildSegmentUnits, checkSegmentCoverage, SEGMENT_ASSUMPTIONS, type SegmentInput } from '@/lib/finance/extensions/segmentUnits';
import { aggregateUnits, valueExpiringWithin } from '@/lib/finance/extensions/aggregate';
import { listExtensions, suggestExtensions } from '@/lib/finance/extensions/registry';
import type { AggregatedValuation, AggregationMethod, CompanyClassification } from '@/lib/finance/extensions/types';
import { normalizeAssumptions, type DcfAssumptions } from '@/lib/finance/dcf';
import { isNum, safeDiv } from '@/lib/finance/core';

/* ==================================================================
   Valuing a company as a set of units rather than one stream.

   The reported segment split is the floor: any company that discloses
   segments can be valued unit by unit without anyone writing an
   extension, on the model's own premises, overridden per unit where
   the analyst has a view. Extensions exist for what this does not
   reach — a finite contract life, a ramp curve, a phased capex
   programme — and the registry they plug into ships empty on purpose.
   ================================================================== */

export interface UnitModelState {
  method: AggregationMethod;
  segments: SegmentInput[];
}

export interface UnitModelContext {
  ticker: string;
  companyName: string;
  currency: string;
  classification: CompanyClassification;
  baseYear: number;
  assumptions: DcfAssumptions;
  /** The split the platform derives from the company's own segment disclosure. */
  suggested: UnitModelState;
  /** What is saved on the model, when anything is. */
  saved: UnitModelState | null;
  /** Segment years available, so the analyst can see what the split is built on. */
  segmentYear: number | null;
  /** Extensions registered in this build that would claim this company. */
  extensions: { id: string; label: string; applies: boolean }[];
  assumptionSchema: typeof SEGMENT_ASSUMPTIONS;
  modelId: string | null;
  netDebt: number;
  minorityInterest: number;
  sharesOutstanding: number;
  currentPrice: number | null;
}

export interface UnitModelRun {
  aggregated: AggregatedValuation;
  coverage: { total: number; warning: string | null };
  /** Share of value in units that end within ten years of the base year. */
  expiringWithin10y: number | null;
}

/** Runs the units through the aggregator on the model's own bridge. */
export function runUnitModel(
  assumptions: DcfAssumptions,
  state: UnitModelState,
  bridge: { netDebt: number; minorityInterest: number; sharesOutstanding: number; currentPrice: number | null },
): UnitModelRun {
  const units = buildSegmentUnits(assumptions, state.segments);
  const aggregated = aggregateUnits(units, state.method, {
    wacc: assumptions.wacc,
    netDebt: bridge.netDebt,
    minorityInterest: bridge.minorityInterest,
    sharesOutstanding: bridge.sharesOutstanding,
    currentPrice: bridge.currentPrice,
    baseYear: assumptions.baseYear,
    terminalGrowth: assumptions.terminalGrowth,
    midYearConvention: assumptions.midYearConvention,
  });
  return {
    aggregated,
    coverage: checkSegmentCoverage(state.segments),
    expiringWithin10y: valueExpiringWithin(aggregated, assumptions.baseYear, 10),
  };
}

export async function getUnitModelContext(
  workspaceId: string,
  ticker: string,
  modelId?: string | null,
): Promise<UnitModelContext | null> {
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) return null;
  const symbol = dossier.company.ticker;

  const model = modelId
    ? await prisma.valuationModel.findFirst({ where: { id: modelId, workspaceId } })
    : await prisma.valuationModel.findFirst({
        where: { workspaceId, company: { ticker: symbol }, kind: 'DCF' },
        orderBy: { updatedAt: 'desc' },
      });

  const assumptions = model
    ? normalizeAssumptions(parseJson<Partial<DcfAssumptions>>(model.assumptions, {}))
    : await defaultAssumptionsFor(symbol);
  if (!assumptions) return null;

  /* --- the split the company itself reports -------------------------- */
  const rows = await prisma.segmentDatum.findMany({
    where: { company: { ticker: symbol }, kind: 'BUSINESS' },
    orderBy: [{ fiscalYear: 'desc' }, { segment: 'asc' }],
  });
  const segmentYear = rows[0]?.fiscalYear ?? null;
  const latest = segmentYear === null ? [] : rows.filter((r) => r.fiscalYear === segmentYear);
  const totalRevenue = latest.reduce((s, r) => s + (r.revenue ?? 0), 0);

  const suggestedSegments: SegmentInput[] = latest.map((r) => ({
    name: r.segment,
    revenueShare: totalRevenue > 0 ? (r.revenue ?? 0) / totalRevenue : 0,
    ebitdaMargin: safeDiv(r.ebitda, r.revenue),
    revenueGrowth: null,
    capexPctRevenue: safeDiv(r.capex, r.revenue),
    endYear: null,
    ownership: 1,
    netDebt: null,
    wacc: null,
    source: `Segment disclosure, FY${r.fiscalYear}`,
  }));

  const saved = model?.unitModel ? parseJson<UnitModelState | null>(model.unitModel, null) : null;

  /* --- would any registered extension claim this company? ------------ */
  const classification: CompanyClassification = {
    ticker: symbol,
    sector: dossier.company.sector,
    industry: dossier.company.industry,
    country: dossier.company.country,
    currency: dossier.company.currency,
    segments: suggestedSegments.map((x) => x.name),
    tags: [],
  };
  const claiming = new Set(suggestExtensions(classification).map((e) => e.id));

  return {
    ticker: symbol,
    companyName: dossier.company.name,
    currency: dossier.company.currency,
    classification,
    baseYear: assumptions.baseYear,
    assumptions,
    suggested: { method: 'CONSOLIDATED', segments: suggestedSegments },
    saved,
    segmentYear,
    extensions: listExtensions().map((e) => ({ id: e.id, label: e.name, applies: claiming.has(e.id) })),
    assumptionSchema: SEGMENT_ASSUMPTIONS,
    modelId: model?.id ?? null,
    netDebt: assumptions.netDebt,
    minorityInterest: assumptions.minorityInterest ?? 0,
    sharesOutstanding: assumptions.sharesOutstanding,
    currentPrice: isNum(assumptions.currentPrice) ? (assumptions.currentPrice as number) : dossier.metrics.price,
  };
}
