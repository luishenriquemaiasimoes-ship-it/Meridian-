import { prisma } from '@/lib/db';
import { getMetricsMap } from './metrics';
import { evaluateThesisHealth } from './alerts';
import { isNum } from '@/lib/finance/core';

export interface WatchlistItemRow {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  country: string;
  currency: string;
  note: string | null;
  addedAt: string;
  price: number | null;
  dailyChangePct: number | null;
  return1m: number | null;
  return12m: number | null;
  week52High: number | null;
  week52Low: number | null;
  /** Where the price sits inside its own 52-week band. 0 = low, 1 = high. */
  rangePosition: number | null;
  marketCap: number | null;
  pe: number | null;
  evEbitda: number | null;
  fcfYield: number | null;
  roic: number | null;
  revenueGrowth: number | null;
  netDebtToEbitda: number | null;
  bankLike: boolean;
  targetPrice: number | null;
  upside: number | null;
  recommendation: string | null;
  thesisVerdict: string | null;
}

export interface WatchlistRecord {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  items: WatchlistItemRow[];
}

export async function listWatchlists(workspaceId: string): Promise<WatchlistRecord[]> {
  const [lists, metrics, health] = await Promise.all([
    prisma.watchlist.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
      include: { items: { include: { company: true }, orderBy: { addedAt: 'asc' } } },
    }),
    getMetricsMap(),
    evaluateThesisHealth(workspaceId),
  ]);

  const healthByTicker = new Map(health.map((h) => [h.ticker, h]));

  return lists.map((w) => ({
    id: w.id,
    name: w.name,
    description: w.description,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
    items: w.items.map((item) => {
      const m = metrics.get(item.company.ticker);
      const h = healthByTicker.get(item.company.ticker);
      const rangePosition =
        isNum(m?.price) && isNum(m?.week52High) && isNum(m?.week52Low) && (m!.week52High as number) > (m!.week52Low as number)
          ? ((m!.price as number) - (m!.week52Low as number)) / ((m!.week52High as number) - (m!.week52Low as number))
          : null;
      return {
        id: item.id,
        ticker: item.company.ticker,
        name: item.company.name,
        sector: item.company.sector,
        country: item.company.country,
        currency: item.company.currency,
        note: item.note,
        addedAt: item.addedAt.toISOString(),
        price: m?.price ?? null,
        dailyChangePct: m?.dailyChangePct ?? null,
        return1m: m?.return1m ?? null,
        return12m: m?.return12m ?? null,
        week52High: m?.week52High ?? null,
        week52Low: m?.week52Low ?? null,
        rangePosition,
        marketCap: m?.marketCap ?? null,
        pe: m?.pe ?? null,
        evEbitda: m?.evEbitda ?? null,
        fcfYield: m?.fcfYield ?? null,
        roic: m?.roic ?? null,
        revenueGrowth: m?.revenueGrowth ?? null,
        netDebtToEbitda: m?.netDebtToEbitda ?? null,
        bankLike: m?.bankLike ?? false,
        targetPrice: h?.targetPrice ?? null,
        upside: h?.upside ?? null,
        recommendation: h?.recommendation ?? null,
        thesisVerdict: h?.verdict ?? null,
      };
    }),
  }));
}
