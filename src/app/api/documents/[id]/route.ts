import { prisma } from '@/lib/db';
import { route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';

function idFrom(req: Request): string {
  const parts = new URL(req.url).pathname.split('/');
  return parts[parts.length - 1];
}

export const DELETE = route(async (ctx, req) => {
  const id = idFrom(req);
  const doc = await prisma.document.findFirst({ where: { id, workspaceId: ctx.workspaceId } });
  if (!doc) {
    const err = new Error('Document not found in this workspace.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  await prisma.document.delete({ where: { id: doc.id } });
  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'DELETE', entityType: 'Document', entityId: doc.id, entityLabel: doc.name,
    summary: `Deleted document "${doc.name}".`,
  });
  return { deleted: true };
}, 'document:upload');
