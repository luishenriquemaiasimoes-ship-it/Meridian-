import { prisma, parseJson } from '@/lib/db';
import { getCompanyDossier } from './company';
import { getComps } from './comps';
import { listValuationModels } from './valuation';
import { evaluateThesisHealth, type ThesisHealth } from './alerts';
import { getModelReconciliation } from './reconciliation';
import type { DeckThesis } from '@/lib/research/types';
import { isNum } from '@/lib/finance/core';
import { MEMO_SECTIONS, blankMemoSections, type MemoSection } from '@/lib/memo/sections';
import { MULTIPLE_LABELS } from '@/lib/finance/comps';
import type { Currency } from '@/lib/finance/types';

export interface MemoEvidence {
  ticker: string;
  name: string;
  currency: Currency;
  sector: string;
  bankLike: boolean;
  price: number | null;
  marketCap: number | null;
  enterpriseValue: number | null;
  basisLabel: string;
  fundamentals: {
    revenueGrowth: number | null; ebitdaMargin: number | null; netMargin: number | null;
    roic: number | null; roe: number | null; wacc: number | null; roicSpread: number | null;
    netDebtToEbitda: number | null; interestCoverage: number | null;
    fcfYield: number | null; fcfConversion: number | null;
  };
  multiples: {
    pe: number | null; pb: number | null; evEbitda: number | null; evEbit: number | null;
    evRevenue: number | null; dividendYield: number | null;
  };
  peerMedians: { key: string; label: string; company: number | null; median: number | null; percentile: number | null }[];
  thesis: ThesisHealth | null;
  catalysts: { title: string; expectedDate: string | null; impact: string; probability: number | null; status: string }[];
  risks: { title: string; category: string; severity: string; probability: number | null; mitigation: string | null }[];
  models: { id: string; name: string; kind: string; fairValue: number | null; upside: number | null; updatedAt: string }[];
  position: { quantity: number; weight: number | null; averagePrice: number; unrealizedPnlPct: number | null } | null;
  /**
   * Where the model's target sits against the contributed range, and the
   * reason recorded for the difference. A memo that argues a target the
   * market does not hold should say why in the author's own words, and the
   * words already exist: they were written when the model was reconciled.
   */
  consensus: {
    summary: string;
    position: string;
    count: number;
    median: number | null;
    rationale: { text: string; recordedBy: string; recordedAt: string } | null;
  } | null;
  /** The deck's points, core first, so a memo can quote the case it rests on. */
  deckPoints: { title: string; weight: string; conviction: string; breaks: string[] }[];
  /** Committee questions nobody has closed yet. */
  openQuestions: { question: string; theme: string; status: string; hasGap: boolean }[];
}

/**
 * Everything a memo writer should be able to cite, gathered from the same
 * computations the rest of the product uses. Nothing here is generated text:
 * each figure is a number the workspace already holds, so a memo can quote it
 * and a reader can check it on the company screen.
 */
export async function getMemoEvidence(workspaceId: string, ticker: string): Promise<MemoEvidence | null> {
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) return null;

  const [comps, models, health, thesisRow, position, reconciliation, deckRow, openQa] = await Promise.all([
    getComps(ticker),
    listValuationModels(workspaceId, ticker),
    evaluateThesisHealth(workspaceId),
    prisma.investmentThesis.findFirst({
      where: { workspaceId, company: { ticker: ticker.toUpperCase() } },
      include: { catalysts: { orderBy: { expectedDate: 'asc' } }, risks: true },
    }),
    prisma.portfolioPosition.findFirst({
      where: { company: { ticker: ticker.toUpperCase() }, portfolio: { workspaceId } },
      include: { portfolio: true },
    }),
    getModelReconciliation(workspaceId, ticker).catch(() => null),
    prisma.qualitativeDeck.findFirst({
      where: { workspaceId, company: { ticker: ticker.toUpperCase() } },
    }),
    prisma.qaItem.findMany({
      where: { workspaceId, company: { ticker: ticker.toUpperCase() }, status: { not: 'PREPARED' } },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const m = dossier.metrics;
  const price = m.price;

  const peerMedians = comps
    ? comps.multipleKeys.map((key) => ({
        key,
        label: MULTIPLE_LABELS[key] ?? key,
        company: (comps.anchor as unknown as Record<string, number | null>)[key] ?? null,
        median: comps.stats[key]?.median ?? null,
        percentile: comps.anchorPercentiles[key] ?? null,
      }))
    : [];

  return {
    ticker: dossier.company.ticker,
    name: dossier.company.name,
    currency: dossier.company.currency as Currency,
    sector: dossier.company.sector,
    bankLike: m.bankLike,
    price,
    marketCap: m.marketCap,
    enterpriseValue: m.enterpriseValue,
    basisLabel: m.basisLabel,
    fundamentals: {
      revenueGrowth: m.revenueGrowth, ebitdaMargin: m.ebitdaMargin, netMargin: m.netMargin,
      roic: m.roic, roe: m.roe, wacc: m.wacc, roicSpread: m.roicSpread,
      netDebtToEbitda: m.netDebtToEbitda, interestCoverage: m.interestCoverage,
      fcfYield: m.fcfYield, fcfConversion: m.fcfConversion,
    },
    multiples: {
      pe: m.pe, pb: m.pb, evEbitda: m.evEbitda, evEbit: m.evEbit,
      evRevenue: m.evRevenue, dividendYield: m.dividendYield,
    },
    peerMedians,
    thesis: health.find((h) => h.ticker === dossier.company.ticker) ?? null,
    catalysts: (thesisRow?.catalysts ?? []).map((c) => ({
      title: c.title,
      expectedDate: c.expectedDate?.toISOString().slice(0, 10) ?? null,
      impact: c.expectedImpact,
      probability: c.probability,
      status: c.status,
    })),
    risks: (thesisRow?.risks ?? []).map((r) => ({
      title: r.title, category: r.category, severity: r.severity,
      probability: r.probability, mitigation: r.mitigation,
    })),
    models: models.map((v) => {
      // The fair value a model produced is stored with its outputs; a model that
      // has never been run has none, and says so rather than showing zero.
      const outputs = v.outputs ?? {};
      const raw = outputs.fairValuePerShare ?? outputs.valuePerShare ?? null;
      const fairValue = typeof raw === 'number' && Number.isFinite(raw) ? raw : null;
      return {
        id: v.id,
        name: v.name,
        kind: v.kind,
        fairValue,
        upside: isNum(fairValue) && isNum(price) && (price as number) > 0
          ? (fairValue as number) / (price as number) - 1
          : null,
        updatedAt: v.updatedAt,
      };
    }),
    consensus: reconciliation && reconciliation.consensus.position !== 'UNAVAILABLE'
      ? {
          summary: reconciliation.consensus.summary,
          position: reconciliation.consensus.position,
          count: reconciliation.consensus.count,
          median: reconciliation.consensus.median,
          rationale: reconciliation.consensusNote
            ? {
                text: reconciliation.consensusNote.rationale,
                recordedBy: reconciliation.consensusNote.recordedBy,
                recordedAt: reconciliation.consensusNote.recordedAt,
              }
            : null,
        }
      : null,
    deckPoints: (() => {
      const order: Record<string, number> = { CORE: 0, SUPPORTING: 1, OPTIONAL: 2 };
      const theses = deckRow ? parseJson<DeckThesis[]>(deckRow.theses, []) : [];
      return theses
        .slice()
        .sort((a, b) => (order[a.weight] ?? 3) - (order[b.weight] ?? 3) || a.order - b.order)
        .map((t) => ({ title: t.title, weight: t.weight, conviction: t.conviction, breaks: t.breaks }));
    })(),
    openQuestions: openQa.map((q) => ({
      question: q.question, theme: q.theme, status: q.status, hasGap: q.hasGap,
    })),
    position: position
      ? {
          quantity: position.quantity,
          weight: null,
          averagePrice: position.averagePrice,
          unrealizedPnlPct: isNum(price) && position.averagePrice > 0
            ? (price as number) / position.averagePrice - 1
            : null,
        }
      : null,
  };
}

export { parseJson, MEMO_SECTIONS, blankMemoSections };
export type { MemoSection };
