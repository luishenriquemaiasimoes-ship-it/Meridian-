import { prisma, parseJson } from '@/lib/db';
import { getUniverseMetrics } from './metrics';
import type { PeerComparisonRow, SectorSection } from '@/lib/research/types';
import { buildComparison, COMPARISON_METRICS } from '@/lib/research/comparison';
import type { ComparisonRowResult } from '@/lib/research/comparison';

export { COMPARISON_METRICS, buildComparison } from '@/lib/research/comparison';
export type { ComparisonCell, ComparisonRowResult } from '@/lib/research/comparison';

/* ==================================================================
   Sector analysis.

   The product does not decide which measures matter in an industry. It
   supplies every metric it computes, lets the analyst pick the rows,
   and lets them add rows it cannot compute at all. Nothing ships
   pre-loaded for any sector: a template exists because someone built
   it while covering something.
   ================================================================== */

export interface SectorAnalysisRecord {
  id: string;
  sector: string;
  title: string;
  status: string;
  sections: SectorSection[];
  tickers: string[];
  rows: PeerComparisonRow[];
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export async function listSectorAnalyses(workspaceId: string): Promise<SectorAnalysisRecord[]> {
  const rows = await prisma.sectorAnalysis.findMany({
    where: { workspaceId },
    orderBy: { updatedAt: 'desc' },
  });
  return rows.map((r) => ({
    id: r.id,
    sector: r.sector,
    title: r.title,
    status: r.status,
    sections: parseJson<SectorSection[]>(r.sections, []),
    tickers: parseJson<string[]>(r.tickers, []),
    rows: parseJson<PeerComparisonRow[]>(r.rows, []),
    authorName: r.authorName,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export interface SectorWorkbenchData {
  analyses: SectorAnalysisRecord[];
  templates: { id: string; name: string; sector: string | null; rows: PeerComparisonRow[]; authorName: string }[];
  universe: { ticker: string; name: string; sector: string; industry: string; country: string; currency: string; bankLike: boolean }[];
  sectors: string[];
  metrics: typeof COMPARISON_METRICS;
}

export async function getSectorWorkbench(workspaceId: string): Promise<SectorWorkbenchData> {
  const [analyses, templateRows, universe] = await Promise.all([
    listSectorAnalyses(workspaceId),
    prisma.peerComparisonTemplate.findMany({ where: { workspaceId }, orderBy: { name: 'asc' } }),
    getUniverseMetrics(),
  ]);

  return {
    analyses,
    templates: templateRows.map((t) => ({
      id: t.id,
      name: t.name,
      sector: t.sector,
      rows: parseJson<PeerComparisonRow[]>(t.rows, []),
      authorName: t.authorName,
    })),
    universe: universe.map((m) => ({
      ticker: m.ticker, name: m.name, sector: m.sector, industry: m.industry,
      country: m.country, currency: m.currency, bankLike: m.bankLike,
    })),
    sectors: Array.from(new Set(universe.map((m) => m.sector))).sort(),
    metrics: COMPARISON_METRICS,
  };
}

/** Resolves a comparison for one analysis, ready to render. */
export async function resolveComparison(
  rows: PeerComparisonRow[],
  tickers: string[],
): Promise<ComparisonRowResult[]> {
  const universe = await getUniverseMetrics();
  const map = new Map(universe.map((m) => [m.ticker, m]));
  return buildComparison(rows, tickers, map);
}
