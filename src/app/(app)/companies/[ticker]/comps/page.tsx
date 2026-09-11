import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requirePageContext } from '@/server/context';
import { getCompanyDossier, buildHistoricalMultiples } from '@/server/services/company';
import { getComps, listPeerGroups } from '@/server/services/comps';
import { CompsWorkbench } from './comps-workbench';
import type { Currency } from '@/lib/finance/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} — Comparables` };
}

export default async function CompsPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const ctx = await requirePageContext();
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) notFound();

  const [comps, peerGroups] = await Promise.all([
    getComps(dossier.company.ticker),
    listPeerGroups(ctx.workspaceId),
  ]);
  if (!comps) notFound();

  const historical = buildHistoricalMultiples(
    dossier.periods,
    dossier.prices,
    dossier.metrics.sharesOutstanding,
    dossier.metrics.bankLike,
  );

  return (
    <CompsWorkbench
      ticker={dossier.company.ticker}
      currency={dossier.company.currency as Currency}
      bankLike={comps.bankLike}
      note={comps.note}
      anchor={comps.anchor}
      peers={comps.peers}
      stats={comps.stats}
      multipleKeys={comps.multipleKeys}
      operatingKeys={comps.operatingKeys}
      anchorPercentiles={comps.anchorPercentiles}
      anchorMetrics={{
        revenue: dossier.metrics.revenue,
        ebitda: dossier.metrics.ebitda,
        ebit: dossier.metrics.ebit,
        netIncome: dossier.metrics.netIncome,
        equityBookValue: dossier.metrics.equityBookValue,
        netDebt: dossier.metrics.netDebt,
        sharesOutstanding: dossier.metrics.sharesOutstanding,
        price: dossier.metrics.price,
        basisLabel: dossier.metrics.basisLabel,
      }}
      historical={historical.map((h) => ({
        metric: h.metric,
        label: h.label,
        points: h.points.filter((p) => p.value !== null),
        stats: h.stats,
      }))}
      peerGroups={peerGroups}
    />
  );
}
