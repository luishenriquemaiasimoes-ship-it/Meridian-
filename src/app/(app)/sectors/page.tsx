import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { getSectorAggregates, THEMES } from '@/server/services/screener';
import { getUniverseMetrics } from '@/server/services/metrics';
import { PageHeader } from '@/components/ui/primitives';
import { SectorsWorkbench } from './sectors-workbench';

export const metadata: Metadata = { title: 'Sectors & themes' };
export const dynamic = 'force-dynamic';

export default async function SectorsPage({
  searchParams,
}: { searchParams: Promise<{ sector?: string; theme?: string }> }) {
  await requireContext();
  const { sector, theme } = await searchParams;

  const [aggregates, universe] = await Promise.all([getSectorAggregates(), getUniverseMetrics()]);

  const companies = universe.map((m) => ({
    ticker: m.ticker,
    name: m.name,
    sector: m.sector,
    industry: m.industry,
    country: m.country,
    currency: m.currency,
    themes: m.themes,
    bankLike: m.bankLike,
    marketCap: m.marketCap,
    revenueGrowth: m.revenueGrowth,
    ebitdaMargin: m.ebitdaMargin,
    roic: m.roic,
    roe: m.roe,
    roicSpread: m.roicSpread,
    netDebtToEbitda: m.netDebtToEbitda,
    evEbitda: m.evEbitda,
    pe: m.pe,
    fcfYield: m.fcfYield,
    return12m: m.return12m,
  }));

  const themeCounts = THEMES.map((t) => ({
    ...t,
    count: companies.filter((c) => c.themes.includes(t.slug)).length,
  })).filter((t) => t.count > 0);

  return (
    <>
      <PageHeader
        title="Sectors & themes"
        subtitle={`${aggregates.length} sectors and ${themeCounts.length} themes across ${companies.length} covered companies. Medians, not averages, so one outlier cannot move a sector.`}
      />
      <SectorsWorkbench
        aggregates={aggregates}
        companies={companies}
        themes={themeCounts}
        initialSector={sector ?? null}
        initialTheme={theme ?? null}
      />
    </>
  );
}
