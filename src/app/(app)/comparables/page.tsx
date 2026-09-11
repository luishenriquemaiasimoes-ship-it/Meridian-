import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { listPeerGroups } from '@/server/services/comps';
import { getUniverseMetrics } from '@/server/services/metrics';
import { PageHeader } from '@/components/ui/primitives';
import { ComparablesWorkbench } from './comparables-workbench';
import { MULTIPLE_LABELS, MULTIPLE_FORMATS } from '@/lib/finance/comps';
import type { Currency } from '@/lib/finance/types';

export const metadata: Metadata = { title: 'Comparables' };
export const dynamic = 'force-dynamic';

export default async function ComparablesPage({
  searchParams,
}: { searchParams: Promise<{ group?: string; tickers?: string }> }) {
  const ctx = await requireContext();
  const { group, tickers } = await searchParams;

  const [groups, universe] = await Promise.all([
    listPeerGroups(ctx.workspaceId),
    getUniverseMetrics(),
  ]);

  const companies = universe.map((m) => ({
    ticker: m.ticker,
    name: m.name,
    sector: m.sector,
    industry: m.industry,
    country: m.country,
    currency: m.currency as Currency,
    bankLike: m.bankLike,
    basisLabel: m.basisLabel,
    marketCap: m.marketCap,
    enterpriseValue: m.enterpriseValue,
    evRevenue: m.evRevenue,
    evEbitda: m.evEbitda,
    evEbit: m.evEbit,
    pe: m.pe,
    pb: m.pb,
    ps: m.ps,
    fcfYield: m.fcfYield,
    dividendYield: m.dividendYield,
    revenueGrowth: m.revenueGrowth,
    ebitdaGrowth: m.ebitdaGrowth,
    ebitdaMargin: m.ebitdaMargin,
    roic: m.roic,
    roe: m.roe,
    netDebtToEbitda: m.netDebtToEbitda,
  }));

  const requested = (tickers ?? '')
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter((t) => companies.some((c) => c.ticker === t));

  const selectedGroup = group ? groups.find((g) => g.id === group) ?? null : null;

  return (
    <>
      <PageHeader
        title="Comparables"
        subtitle="How is this rated against its peers? Pick the set yourself — a peer group is a judgement, not a sector code."
      />
      <ComparablesWorkbench
        canWrite={ctx.can('research:write')}
        companies={companies}
        groups={groups}
        initialGroupId={selectedGroup?.id ?? null}
        initialTickers={requested.length ? requested : selectedGroup?.tickers ?? []}
        initialAnchor={selectedGroup?.anchorTicker ?? requested[0] ?? null}
        labels={MULTIPLE_LABELS}
        formats={MULTIPLE_FORMATS}
      />
    </>
  );
}
