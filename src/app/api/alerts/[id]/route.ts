import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';

const patchSchema = z.object({
  enabled: z.boolean().optional(),
  threshold: z.number().optional(),
  severity: z.enum(['CRITICAL', 'IMPORTANT', 'INFORMATIONAL']).optional(),
  name: z.string().min(2).max(120).optional(),
});

async function loadOwned(workspaceId: string, id: string) {
  const alert = await prisma.alert.findFirst({ where: { id, workspaceId } });
  if (!alert) {
    const err = new Error('Alert not found in this workspace.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  return alert;
}

function idFrom(req: Request): string {
  const parts = new URL(req.url).pathname.split('/');
  return parts[parts.length - 1];
}

export const PATCH = route(async (ctx, req) => {
  const id = idFrom(req);
  const existing = await loadOwned(ctx.workspaceId, id);
  const body = await parseBody(req, patchSchema);

  const alert = await prisma.alert.update({ where: { id: existing.id }, data: body });
  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'UPDATE', entityType: 'Alert', entityId: alert.id, entityLabel: alert.name,
    summary: `Updated alert "${alert.name}" (${Object.keys(body).join(', ') || 'no change'}).`,
  });
  return { alert: { id: alert.id, enabled: alert.enabled, threshold: alert.threshold, severity: alert.severity, name: alert.name } };
}, 'alert:write');

export const DELETE = route(async (ctx, req) => {
  const id = idFrom(req);
  const existing = await loadOwned(ctx.workspaceId, id);
  await prisma.alert.delete({ where: { id: existing.id } });
  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'DELETE', entityType: 'Alert', entityId: existing.id, entityLabel: existing.name,
    summary: `Deleted alert "${existing.name}".`,
  });
  return { deleted: true };
}, 'alert:write');
