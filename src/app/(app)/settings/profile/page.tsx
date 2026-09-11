import type { Metadata } from 'next';
import Link from 'next/link';
import { requireContext } from '@/server/context';
import { PERMISSIONS, permissionsFor } from '@/lib/auth/rbac';
import { prisma } from '@/lib/db';
import { PageHeader } from '@/components/ui/primitives';
import { ProfileForm } from './profile-form';

export const metadata: Metadata = { title: 'Profile' };
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const ctx = await requireContext();

  const [user, activity, sessions] = await Promise.all([
    prisma.user.findUnique({ where: { id: ctx.userId } }),
    prisma.auditLog.count({ where: { workspaceId: ctx.workspaceId, userId: ctx.userId } }),
    prisma.session.count({ where: { userId: ctx.userId, expiresAt: { gt: new Date() } } }),
  ]);
  if (!user) return <PageHeader title="Profile" subtitle="Your account could not be loaded." />;

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="Your account and how the application looks to you."
        breadcrumb={<Link href="/settings" className="hover:text-accent">Settings</Link>}
      />
      <ProfileForm
        name={user.name}
        email={user.email}
        title={user.title}
        theme={user.theme}
        role={ctx.role}
        organizationName={ctx.organizationName}
        workspaceName={ctx.workspaceName}
        createdAt={user.createdAt.toISOString()}
        activityCount={activity}
        activeSessions={sessions}
        permissions={PERMISSIONS.filter((p) => permissionsFor(ctx.role).has(p))}
      />
    </>
  );
}
