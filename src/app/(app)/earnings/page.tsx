import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { listEarnings } from '@/server/services/earnings';
import { prisma } from '@/lib/db';
import { PageHeader } from '@/components/ui/primitives';
import { EarningsWorkbench } from './earnings-workbench';

export const metadata: Metadata = { title: 'Earnings' };
export const dynamic = 'force-dynamic';

export default async function EarningsPage() {
  const ctx = await requireContext();

  const [events, positions, watchItems] = await Promise.all([
    listEarnings(ctx.workspaceId, 160),
    prisma.portfolioPosition.findMany({
      where: { portfolio: { workspaceId: ctx.workspaceId } },
      select: { company: { select: { ticker: true } } },
    }),
    prisma.watchlistItem.findMany({
      where: { watchlist: { workspaceId: ctx.workspaceId } },
      select: { company: { select: { ticker: true } } },
    }),
  ]);

  const held = new Set(positions.map((p) => p.company.ticker));
  const watched = new Set(watchItems.map((w) => w.company.ticker));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title="Earnings"
        subtitle="What did the print change? Scheduled dates ahead, reported results behind, and which of them the desk has written up."
      />
      <EarningsWorkbench
        today={today}
        events={events.map((e) => ({
          ...e,
          held: held.has(e.ticker),
          watched: watched.has(e.ticker),
        }))}
      />
    </>
  );
}
