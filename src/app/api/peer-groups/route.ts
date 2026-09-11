import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';
import { listPeerGroups } from '@/server/services/comps';

const schema = z.object({
  name: z.string().min(2, 'Give the peer group a name.').max(80),
  anchorTicker: z.string().max(12).nullable().optional(),
  tickers: z.array(z.string().max(12)).min(2, 'A peer group needs at least two companies.').max(30),
});

export const GET = route(async (ctx) => ({ groups: await listPeerGroups(ctx.workspaceId) }));

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  const tickers = Array.from(new Set(body.tickers.map((t) => t.toUpperCase())));
  const known = await prisma.company.findMany({ where: { ticker: { in: tickers } }, select: { ticker: true } });
  const missing = tickers.filter((t) => !known.some((k) => k.ticker === t));
  if (missing.length) {
    const err = new Error(`Not covered in this workspace: ${missing.join(', ')}.`) as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const group = await prisma.peerGroup.create({
    data: {
      workspaceId: ctx.workspaceId,
      name: body.name,
      anchorTicker: body.anchorTicker ? body.anchorTicker.toUpperCase() : null,
      companyIds: JSON.stringify(tickers),
    },
  });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'CREATE', entityType: 'PeerGroup', entityId: group.id, entityLabel: group.name,
    summary: `Created peer group "${group.name}" with ${tickers.length} names.`,
  });

  return { group: { id: group.id, name: group.name, tickers } };
}, 'research:write');
