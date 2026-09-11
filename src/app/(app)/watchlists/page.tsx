import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { prisma } from '@/lib/db';
import { listWatchlists } from '@/server/services/watchlists';
import { PageHeader } from '@/components/ui/primitives';
import { WatchlistWorkbench } from './watchlist-workbench';

export const metadata: Metadata = { title: 'Watchlists' };
export const dynamic = 'force-dynamic';

export default async function WatchlistsPage({
  searchParams,
}: { searchParams: Promise<{ id?: string }> }) {
  const ctx = await requireContext();
  const { id } = await searchParams;

  const [watchlists, companies] = await Promise.all([
    listWatchlists(ctx.workspaceId),
    prisma.company.findMany({ select: { ticker: true, name: true, sector: true }, orderBy: { ticker: 'asc' } }),
  ]);

  const selectedId = id && watchlists.some((w) => w.id === id) ? id : watchlists[0]?.id ?? null;
  const totalNames = new Set(watchlists.flatMap((w) => w.items.map((i) => i.ticker))).size;

  return (
    <>
      <PageHeader
        title="Watchlists"
        subtitle={
          watchlists.length
            ? `${watchlists.length} list${watchlists.length === 1 ? '' : 's'} covering ${totalNames} distinct name${totalNames === 1 ? '' : 's'}.`
            : 'What am I tracking and what moved?'
        }
      />
      <WatchlistWorkbench
        watchlists={watchlists}
        selectedId={selectedId}
        canWrite={ctx.can('watchlist:write')}
        companies={companies}
      />
    </>
  );
}
