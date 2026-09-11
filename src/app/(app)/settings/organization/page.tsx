import type { Metadata } from 'next';
import Link from 'next/link';
import { requireContext } from '@/server/context';
import { prisma } from '@/lib/db';
import { PageHeader } from '@/components/ui/primitives';
import { OrganizationPanel } from './organization-panel';

export const metadata: Metadata = { title: 'Organization' };
export const dynamic = 'force-dynamic';

export default async function OrganizationPage() {
  const ctx = await requireContext();

  const [organization, memberships, workspaces] = await Promise.all([
    prisma.organization.findUnique({ where: { id: ctx.organizationId } }),
    prisma.membership.findMany({
      where: { organizationId: ctx.organizationId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.workspace.count({ where: { organizationId: ctx.organizationId } }),
  ]);

  const activity = await prisma.auditLog.groupBy({
    by: ['userId'],
    where: { workspaceId: ctx.workspaceId, userId: { not: null } },
    _count: { _all: true },
  });
  const activityByUser = new Map(activity.map((a) => [a.userId as string, a._count._all]));

  return (
    <>
      <PageHeader
        title={organization?.name ?? 'Organization'}
        subtitle={`${memberships.length} member${memberships.length === 1 ? '' : 's'} across ${workspaces} workspace${workspaces === 1 ? '' : 's'}.`}
        breadcrumb={<Link href="/settings" className="hover:text-accent">Settings</Link>}
      />
      <OrganizationPanel
        canManage={ctx.can('member:manage')}
        currentUserId={ctx.userId}
        plan={organization?.plan ?? 'TEAM'}
        members={memberships.map((m) => ({
          userId: m.userId,
          name: m.user.name,
          email: m.user.email,
          title: m.user.title,
          role: m.role,
          avatarColor: m.user.avatarColor,
          joinedAt: m.createdAt.toISOString(),
          changes: activityByUser.get(m.userId) ?? 0,
        }))}
      />
    </>
  );
}
