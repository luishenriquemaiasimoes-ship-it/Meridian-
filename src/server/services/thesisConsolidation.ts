import { prisma, parseJson } from '@/lib/db';
import { getComps } from './comps';
import { getModelReconciliation } from './reconciliation';
import { defaultAssumptionsFor } from './valuation';
import { calculateDcf, normalizeAssumptions, type DcfAssumptions } from '@/lib/finance/dcf';
import { deriveScenarioSet, runScenarios } from '@/lib/finance/scenarios';
import { MULTIPLE_LABELS, MULTIPLE_FORMATS, type MultipleKey } from '@/lib/finance/comps';
import type { DeckRisk, DeckThesis, StressTest } from '@/lib/research/types';
import { isNum } from '@/lib/finance/core';

/* ==================================================================
   The final thesis, assembled from the work rather than retyped.

   Everything here already exists somewhere in the workspace: the
   scenarios come from the model, the multiples from the comparables,
   the points from the deck, the open items from the committee
   questions nobody has answered yet. Consolidating means pulling them
   together, not restating them — a number that appears twice and
   disagrees with itself is worse than a number that appears once.
   ================================================================== */

export interface ConsolidatedScenario {
  key: 'BULL' | 'BASE' | 'BEAR';
  label: string;
  fairValue: number | null;
  upside: number | null;
  probability: number;
  /** What the scenario changes, in the analyst's own premise names. */
  drivers: string[];
}

export interface ConsolidatedMultiple {
  key: string;
  label: string;
  format: 'multiple' | 'percent';
  company: number | null;
  peerMedian: number | null;
  /** Where the company sits in the peer distribution, 0 to 1. */
  percentile: number | null;
}

export interface OpenItem {
  id: string;
  kind: 'QUESTION' | 'RISK' | 'STRESS' | 'PREMISE' | 'SOURCE';
  title: string;
  detail: string;
  /** Where to go and close it. */
  href: string;
}

export interface ThesisConsolidation {
  ticker: string;
  companyName: string;
  currency: string;
  currentPrice: number | null;
  /** Probability-weighted value across the three cases. */
  expectedValue: number | null;
  expectedUpside: number | null;
  scenarios: ConsolidatedScenario[];
  multiples: ConsolidatedMultiple[];
  /** Deck theses, core first, with what would break each one. */
  points: { id: string; title: string; weight: DeckThesis['weight']; conviction: string; breaks: string[] }[];
  /** Risks the deck placed in the manage quadrant. */
  topRisks: { id: string; title: string; probability: number; impact: number }[];
  stressTests: { id: string; title: string; verdict: StressTest['verdict'] }[];
  openItems: OpenItem[];
  /** What the consolidation could not find, said rather than skipped. */
  gaps: string[];
}

const SCENARIO_LABEL: Record<'BULL' | 'BASE' | 'BEAR', string> = {
  BULL: 'Bull', BASE: 'Base', BEAR: 'Bear',
};


const PREMISE_LABEL: Record<string, string> = {
  revenueGrowth: 'Revenue growth',
  ebitdaMargin: 'EBITDA margin',
  daPctRevenue: 'D&A % of revenue',
  capexPctRevenue: 'Capex % of revenue',
  nwcPctRevenue: 'Working capital % of revenue',
  taxRate: 'Tax rate',
  wacc: 'WACC',
  terminalGrowth: 'Terminal growth',
  exitMultiple: 'Exit multiple',
};

/** Names what a scenario changed, in the premise names the analyst set. */
function describeOverrides(base: DcfAssumptions, override: Partial<DcfAssumptions>): string[] {
  const out: string[] = [];
  for (const [key, value] of Object.entries(override)) {
    const label = PREMISE_LABEL[key];
    if (!label || value === undefined) continue;
    const before = (base as unknown as Record<string, unknown>)[key];
    const first = (v: unknown) => (Array.isArray(v) ? (v[0] as number | undefined) : (v as number | undefined));
    const a = first(before);
    const b = first(value);
    if (!isNum(a) || !isNum(b) || a === b) continue;
    const bps = Math.round(((b as number) - (a as number)) * 10_000);
    out.push(key === 'exitMultiple'
      ? `${label} ${(a as number).toFixed(1)}x to ${(b as number).toFixed(1)}x`
      : `${label} ${bps > 0 ? '+' : ''}${bps} bps`);
  }
  return out;
}

export async function getThesisConsolidation(
  workspaceId: string,
  ticker: string,
): Promise<ThesisConsolidation | null> {
  const company = await prisma.company.findUnique({ where: { ticker: ticker.toUpperCase() } });
  if (!company) return null;
  const symbol = company.ticker;

  const [model, deckRow, qaRows, comps] = await Promise.all([
    prisma.valuationModel.findFirst({
      where: { workspaceId, companyId: company.id, kind: 'DCF' },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.qualitativeDeck.findFirst({ where: { workspaceId, companyId: company.id } }),
    prisma.qaItem.findMany({
      where: { workspaceId, companyId: company.id, status: { not: 'PREPARED' } },
      orderBy: { createdAt: 'asc' },
    }),
    getComps(symbol).catch(() => null),
  ]);

  const gaps: string[] = [];

  /* --- scenarios, from the model ------------------------------------ */
  const assumptions: DcfAssumptions | null = model
    ? normalizeAssumptions(parseJson<Partial<DcfAssumptions>>(model.assumptions, {}))
    : await defaultAssumptionsFor(symbol);

  const base = assumptions ? calculateDcf(assumptions) : null;
  const currentPrice = base?.currentPrice ?? null;

  let scenarios: ConsolidatedScenario[] = [];
  let expectedValue: number | null = null;
  if (assumptions) {
    const set = deriveScenarioSet(assumptions);
    const analysis = runScenarios(set, currentPrice);
    const byKey = new Map(set.map((d) => [d.key, d]));
    scenarios = analysis.scenarios.map((s) => ({
      key: s.key as 'BULL' | 'BASE' | 'BEAR',
      label: SCENARIO_LABEL[s.key as 'BULL' | 'BASE' | 'BEAR'] ?? s.label,
      fairValue: s.fairValue,
      upside: s.upside,
      probability: s.probability,
      drivers: describeOverrides(assumptions, byKey.get(s.key)?.assumptions ?? {}),
    }));
    expectedValue = analysis.expectedValue;
  } else {
    gaps.push('No valuation model, so the cases carry no numbers.');
  }
  if (!model) gaps.push('The scenarios below come from the model the platform would start from, not from a saved one.');

  /* --- multiples, from the comparables ------------------------------- */
  const multiples: ConsolidatedMultiple[] = comps
    ? comps.multipleKeys.map((key: MultipleKey) => ({
        key,
        label: MULTIPLE_LABELS[key],
        format: MULTIPLE_FORMATS[key],
        company: (comps.anchor as unknown as Record<string, number | null>)[key] ?? null,
        peerMedian: comps.stats[key]?.median ?? null,
        percentile: comps.anchorPercentiles[key] ?? null,
      })).filter((m) => isNum(m.company) || isNum(m.peerMedian))
    : [];
  if (!multiples.length) gaps.push('No peer set, so there is nothing to compare the multiples against.');

  /* --- the points, from the deck ------------------------------------- */
  const theses = deckRow ? parseJson<DeckThesis[]>(deckRow.theses, []) : [];
  const risks = deckRow ? parseJson<DeckRisk[]>(deckRow.risks, []) : [];
  const stress = deckRow ? parseJson<StressTest[]>(deckRow.stressTests, []) : [];

  const weightOrder: Record<DeckThesis['weight'], number> = { CORE: 0, SUPPORTING: 1, OPTIONAL: 2 };
  const points = theses
    .slice()
    .sort((a, b) => weightOrder[a.weight] - weightOrder[b.weight] || a.order - b.order)
    .map((t) => ({ id: t.id, title: t.title, weight: t.weight, conviction: t.conviction, breaks: t.breaks }));

  if (!deckRow) gaps.push('No qualitative deck, so the case rests on the model alone.');
  else if (!points.some((p) => p.weight === 'CORE')) gaps.push('The deck has no core thesis, so nothing in it carries the recommendation.');

  const topRisks = risks
    .filter((r) => r.probability >= 0.5 && r.impact >= 0.5)
    .sort((a, b) => b.probability * b.impact - a.probability * a.impact)
    .map((r) => ({ id: r.id, title: r.title, probability: r.probability, impact: r.impact }));

  /* --- what is still open -------------------------------------------- */
  const openItems: OpenItem[] = [];

  for (const q of qaRows) {
    openItems.push({
      id: `qa-${q.id}`,
      kind: 'QUESTION',
      title: q.question,
      detail: q.hasGap
        ? (q.notes ?? 'The workspace holds nothing to answer this with.')
        : q.status === 'NEEDS_WORK'
          ? 'Marked as needing more work.'
          : 'Drafted but not reviewed.',
      href: `/companies/${symbol}/deck`,
    });
  }

  for (const t of stress.filter((x) => x.verdict === 'UNTESTED' || x.verdict === 'BROKEN')) {
    openItems.push({
      id: `stress-${t.id}`,
      kind: 'STRESS',
      title: t.title,
      detail: t.verdict === 'BROKEN'
        ? `The thesis does not survive it: ${t.consequence}`
        : 'Written but never run to a verdict.',
      href: `/companies/${symbol}/deck`,
    });
  }

  for (const t of theses.filter((x) => x.weight === 'CORE' && !x.breaks.length)) {
    openItems.push({
      id: `thesis-${t.id}`,
      kind: 'RISK',
      title: `"${t.title || 'Untitled core thesis'}" has nothing that would disprove it`,
      detail: 'A core thesis with no falsifier cannot be monitored, and cannot be wrong in a way anyone would notice.',
      href: `/companies/${symbol}/deck`,
    });
  }

  /* --- premises and provenance, from the reconciliation --------------- */
  const reconciliation = await getModelReconciliation(workspaceId, symbol, model?.id ?? null).catch(() => null);
  if (reconciliation) {
    for (const breach of reconciliation.premises.persistentBreaches) {
      openItems.push({
        id: `premise-${breach.key}`,
        kind: 'PREMISE',
        title: `${breach.label} has missed for ${breach.periods} periods`,
        detail: `Average deviation of ${Math.round(breach.averageBps)} bps from what the model assumes.`,
        href: `/companies/${symbol}/valuation`,
      });
    }
    if (reconciliation.verification.counts.criticalUnverified > 0) {
      openItems.push({
        id: 'sources-critical',
        kind: 'SOURCE',
        title: `${reconciliation.verification.counts.criticalUnverified} load-bearing inputs have no source`,
        detail: 'The target price rests on figures nobody can trace.',
        href: '/settings/data-quality',
      });
    }
    if (reconciliation.consensus.needsRationale && !reconciliation.consensusNote) {
      openItems.push({
        id: 'consensus-rationale',
        kind: 'PREMISE',
        title: 'The target differs materially from the contributed range',
        detail: reconciliation.consensus.summary,
        href: `/companies/${symbol}/valuation`,
      });
    }
  }

  return {
    ticker: symbol,
    companyName: company.name,
    currency: company.currency,
    currentPrice,
    expectedValue,
    expectedUpside: isNum(expectedValue) && isNum(currentPrice) && (currentPrice as number) > 0
      ? (expectedValue as number) / (currentPrice as number) - 1
      : null,
    scenarios,
    multiples,
    points,
    topRisks,
    stressTests: stress.map((t) => ({ id: t.id, title: t.title, verdict: t.verdict })),
    openItems,
    gaps,
  };
}
