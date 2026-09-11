import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { prisma } from '@/lib/db';
import { PageHeader } from '@/components/ui/primitives';
import { NotificationList } from './notification-list';

export const metadata: Metadata = { title: 'Notifications' };
export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const ctx = await requireContext();

  const rows = await prisma.notification.findMany({
    where: { workspaceId: ctx.workspaceId, OR: [{ userId: ctx.userId }, { userId: null }] },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const unread = rows.filter((n) => !n.readAt).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={
          unread
            ? `${unread} unread of ${rows.length}. Alerts, earnings and thesis changes write here.`
            : `${rows.length} notification${rows.length === 1 ? '' : 's'}, all read.`
        }
      />
      <NotificationList
        notifications={rows.map((n) => ({
          id: n.id,
          severity: n.severity,
          category: n.category,
          title: n.title,
          body: n.body,
          ticker: n.ticker,
          href: n.href,
          readAt: n.readAt?.toISOString() ?? null,
          createdAt: n.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
