import type { Metadata } from 'next';
import { requirePageContext } from '@/server/context';
import { prisma } from '@/lib/db';
import { EmptyState, PageHeader, Panel } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { AuditTrail } from './audit-trail';

export const metadata: Metadata = { title: 'Audit trail' };
export const dynamic = 'force-dynamic';

export default async function AuditPage({
  searchParams,
}: { searchParams: Promise<{ entity?: string; action?: string; actor?: string }> }) {
  const ctx = await requirePageContext();
  const sp = await searchParams;

  if (!ctx.can('audit:read')) {
    return (
      <>
        <PageHeader title="Audit trail" subtitle="Every change made in this workspace." />
        <Panel>
          <EmptyState
            icon={<Icon.Book size={22} />}
            title="Your role does not include the audit trail"
            description="A portfolio manager or an administrator can read it. The record itself is always written, whatever your role."
          />
        </Panel>
      </>
    );
  }

  const rows = await prisma.auditLog.findMany({
    where: {
      workspaceId: ctx.workspaceId,
      ...(sp.entity ? { entityType: sp.entity } : {}),
      ...(sp.action ? { action: sp.action } : {}),
      ...(sp.actor ? { actorName: sp.actor } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 400,
  });

  const all = await prisma.auditLog.findMany({
    where: { workspaceId: ctx.workspaceId },
    select: { entityType: true, action: true, actorName: true },
  });

  // An entry is a permanent record; the thing it changed may since have been
  // deleted. Only the ids that still exist are linked, so the trail never sends
  // the reader to a page that is gone.
  const live = await resolveLiveEntities(
    ctx.workspaceId,
    rows.filter((r) => r.entityId).map((r) => ({ type: r.entityType, id: r.entityId as string })),
  );

  return (
    <>
      <PageHeader
        title="Audit trail"
        subtitle="Every change to a model, thesis, portfolio, target price or member is recorded on the request that made it, so a change can never land without its record."
      />
      <AuditTrail
        entries={rows.map((r) => ({
          id: r.id,
          actorName: r.actorName,
          action: r.action,
          entityType: r.entityType,
          entityId: r.entityId,
          entityLabel: r.entityLabel,
          field: r.field,
          previousValue: r.previousValue,
          newValue: r.newValue,
          summary: r.summary,
          createdAt: r.createdAt.toISOString(),
          linkable: !!r.entityId && live.has(`${r.entityType}:${r.entityId}`),
        }))}
        entityTypes={Array.from(new Set(all.map((a) => a.entityType))).sort()}
        actions={Array.from(new Set(all.map((a) => a.action))).sort()}
        actors={Array.from(new Set(all.map((a) => a.actorName))).sort()}
        filters={{ entity: sp.entity ?? '', action: sp.action ?? '', actor: sp.actor ?? '' }}
        total={all.length}
      />
    </>
  );
}


/**
 * Which of the referenced entities still exist. Only the types the audit trail
 * links to are checked; anything else is never a link in the first place.
 */
async function resolveLiveEntities(
  workspaceId: string,
  refs: { type: string; id: string }[],
): Promise<Set<string>> {
  const byType = new Map<string, string[]>();
  for (const r of refs) byType.set(r.type, [...(byType.get(r.type) ?? []), r.id]);

  const finders: Record<string, (ids: string[]) => Promise<{ id: string }[]>> = {
    ResearchNote: (ids) => prisma.researchNote.findMany({ where: { workspaceId, id: { in: ids } }, select: { id: true } }),
    InvestmentMemo: (ids) => prisma.investmentMemo.findMany({ where: { workspaceId, id: { in: ids } }, select: { id: true } }),
    Document: (ids) => prisma.document.findMany({ where: { workspaceId, id: { in: ids } }, select: { id: true } }),
    ValuationModel: (ids) => prisma.valuationModel.findMany({ where: { workspaceId, id: { in: ids } }, select: { id: true } }),
    Alert: (ids) => prisma.alert.findMany({ where: { workspaceId, id: { in: ids } }, select: { id: true } }),
    Watchlist: (ids) => prisma.watchlist.findMany({ where: { workspaceId, id: { in: ids } }, select: { id: true } }),
    CommitteeItem: (ids) => prisma.committeeItem.findMany({ where: { workspaceId, id: { in: ids } }, select: { id: true } }),
    PeerGroup: (ids) => prisma.peerGroup.findMany({ where: { workspaceId, id: { in: ids } }, select: { id: true } }),
  };

  const live = new Set<string>();
  await Promise.all(
    Array.from(byType.entries()).map(async ([type, ids]) => {
      const find = finders[type];
      if (!find) {
        // Types without a per-record page — a thesis, a portfolio, a membership —
        // link to a screen that always exists.
        for (const id of ids) live.add(`${type}:${id}`);
        return;
      }
      const found = await find(Array.from(new Set(ids)));
      for (const row of found) live.add(`${type}:${row.id}`);
    }),
  );
  return live;
}
