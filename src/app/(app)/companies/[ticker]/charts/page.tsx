import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { getCompanyDossier, buildHistoricalMultiples } from '@/server/services/company';
import { prisma } from '@/lib/db';
import { ChartsWorkbench } from './charts-workbench';
import { simpleReturns } from '@/lib/finance/risk';
import type { Currency } from '@/lib/finance/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} — Charts` };
}

export default async function ChartsPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const ctx = await requireContext();
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) notFound();

  const benchmarkCode = ctx.market === 'US' ? 'SPX' : 'IBOV';
  const benchmark = await prisma.benchmark.findUnique({
    where: { code: benchmarkCode },
    include: { history: { orderBy: { date: 'asc' } } },
  });

  const targetHistory = await prisma.targetPriceRecord.findMany({
    where: { companyId: dossier.company.id, thesis: { workspaceId: ctx.workspaceId } },
    orderBy: { createdAt: 'asc' },
  });

  const benchmarkByDate = new Map(
    (benchmark?.history ?? []).map((p) => [p.date.toISOString().slice(0, 10), p.value]),
  );

  const prices = dossier.prices.map((p) => ({
    date: p.date, close: p.close, high: p.high, low: p.low, volume: p.volume,
  }));

  const returns = simpleReturns(prices.map((p) => p.close));

  const historical = buildHistoricalMultiples(
    dossier.periods, dossier.prices, dossier.metrics.sharesOutstanding, dossier.metrics.bankLike,
  );

  return (
    <ChartsWorkbench
      ticker={dossier.company.ticker}
      currency={dossier.company.currency as Currency}
      benchmarkCode={benchmarkCode}
      prices={prices}
      benchmarkSeries={Array.from(benchmarkByDate.entries()).map(([date, value]) => ({ date, value }))}
      returns={returns}
      targetHistory={targetHistory.map((t) => ({
        date: t.createdAt.toISOString().slice(0, 10),
        targetPrice: t.targetPrice,
        recommendation: t.recommendation,
        reason: t.reason,
      }))}
      multiples={historical.map((h) => ({
        metric: h.metric, label: h.label,
        points: h.points.filter((p) => p.value !== null),
        median5y: h.stats.median5y,
      }))}
      week52High={dossier.metrics.week52High}
      week52Low={dossier.metrics.week52Low}
    />
  );
}
