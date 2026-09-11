import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';

const patchSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  anchorTicker: z.string().max(12).nullable().optional(),
  tickers: z.array(z.string().max(12)).min(2).max(30).optional(),
});

function idFrom(req: Request): string {
  const parts = new URL(req.url).pathname.split('/');
  return parts[parts.length - 1];
}

async function loadOwned(workspaceId: string, id: string) {
  const group = await prisma.peerGroup.findFirst({ where: { id, workspaceId } });
  if (!group) {
    const err = new Error('Peer group not found in this workspace.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  return group;
}

export const PATCH = route(async (ctx, req) => {
  const group = await loadOwned(ctx.workspaceId, idFrom(req));
  const body = await parseBody(req, patchSchema);
  const tickers = body.tickers ? Array.from(new Set(body.tickers.map((t) => t.toUpperCase()))) : null;

  const updated = await prisma.peerGroup.update({
    where: { id: group.id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.anchorTicker !== undefined
        ? { anchorTicker: body.anchorTicker ? body.anchorTicker.toUpperCase() : null }
        : {}),
      ...(tickers ? { companyIds: JSON.stringify(tickers) } : {}),
    },
  });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'UPDATE', entityType: 'PeerGroup', entityId: updated.id, entityLabel: updated.name,
    summary: `Updated peer group "${updated.name}".`,
  });
  return { ok: true };
}, 'research:write');

export const DELETE = route(async (ctx, req) => {
  const group = await loadOwned(ctx.workspaceId, idFrom(req));
  await prisma.peerGroup.delete({ where: { id: group.id } });
  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'DELETE', entityType: 'PeerGroup', entityId: group.id, entityLabel: group.name,
    summary: `Deleted peer group "${group.name}".`,
  });
  return { deleted: true };
}, 'research:write');
