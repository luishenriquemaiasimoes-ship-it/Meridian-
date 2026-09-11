import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';
import { ROLES } from '@/lib/auth/rbac';

const schema = z.object({
  userId: z.string().min(1),
  role: z.enum(ROLES as unknown as [string, ...string[]]),
});

export const PATCH = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  const membership = await prisma.membership.findFirst({
    where: { organizationId: ctx.organizationId, userId: body.userId },
    include: { user: true },
  });
  if (!membership) {
    const err = new Error('That person is not a member of this organisation.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  if (membership.userId === ctx.userId) {
    const err = new Error('You cannot change your own role.') as Error & { status?: number };
    err.status = 400;
    throw err;
  }

  const admins = await prisma.membership.count({ where: { organizationId: ctx.organizationId, role: 'ADMIN' } });
  if (membership.role === 'ADMIN' && body.role !== 'ADMIN' && admins <= 1) {
    const err = new Error('The organisation must keep at least one administrator.') as Error & { status?: number };
    err.status = 400;
    throw err;
  }

  const updated = await prisma.membership.update({
    where: { id: membership.id },
    data: { role: body.role },
  });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'UPDATE', entityType: 'Membership', entityId: updated.id, entityLabel: membership.user.name,
    field: 'role', previousValue: membership.role, newValue: body.role,
    summary: `${membership.user.name} moved from ${membership.role.replace('_', ' ').toLowerCase()} to ${body.role.replace('_', ' ').toLowerCase()}.`,
  });

  return { membership: { userId: updated.userId, role: updated.role } };
}, 'member:manage');
