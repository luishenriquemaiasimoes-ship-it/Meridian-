import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { recordAudit } from '@/server/services/audit';

const schema = z.object({
  name: z.string().min(2).max(80).optional(),
  title: z.string().max(80).nullable().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  currentPassword: z.string().max(200).optional(),
  newPassword: z.string().min(8, 'Use at least eight characters.').max(200).optional(),
});

export const PATCH = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  const user = await prisma.user.findUnique({ where: { id: ctx.userId } });
  if (!user) {
    const err = new Error('Account not found.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  let passwordHash: string | undefined;
  if (body.newPassword) {
    if (!body.currentPassword) {
      const err = new Error('Enter your current password to change it.') as Error & { status?: number };
      err.status = 400;
      throw err;
    }
    const ok = await verifyPassword(body.currentPassword, user.passwordHash);
    if (!ok) {
      const err = new Error('That is not your current password.') as Error & { status?: number };
      err.status = 400;
      throw err;
    }
    passwordHash = await hashPassword(body.newPassword);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.theme !== undefined ? { theme: body.theme } : {}),
      ...(passwordHash ? { passwordHash } : {}),
    },
  });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'UPDATE', entityType: 'User', entityId: user.id, entityLabel: user.name,
    summary: passwordHash ? 'Changed their password.' : 'Updated their profile.',
  });

  return { ok: true };
});
