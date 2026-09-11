import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { prisma } from '@/lib/db';
import { EmptyState, PageHeader, Panel } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { AuditTrail } from './audit-trail';

export const metadata: Metadata = { title: 'Audit trail' };
export const dynamic = 'force-dynamic';

export default async function AuditPage({
  searchParams,
}: { searchParams: Promise<{ entity?: string; action?: string; actor?: string }> }) {
  const ctx = await requireContext();
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
