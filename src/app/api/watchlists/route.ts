import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';
import { listWatchlists } from '@/server/services/watchlists';

const createSchema = z.object({
  name: z.string().min(2, 'Give the watchlist a name.').max(80),
  description: z.string().max(400).nullable().optional(),
  tickers: z.array(z.string().max(12)).max(200).optional(),
});

export const GET = route(async (ctx) => ({ watchlists: await listWatchlists(ctx.workspaceId) }));

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, createSchema);
  const tickers = (body.tickers ?? []).map((t) => t.toUpperCase());
  const companies = tickers.length
    ? await prisma.company.findMany({ where: { ticker: { in: tickers } } })
    : [];

  const watchlist = await prisma.watchlist.create({
    data: {
      workspaceId: ctx.workspaceId,
      name: body.name,
      description: body.description ?? null,
      items: { create: companies.map((c) => ({ companyId: c.id })) },
    },
  });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'CREATE', entityType: 'Watchlist', entityId: watchlist.id, entityLabel: watchlist.name,
    summary: `Created watchlist "${watchlist.name}" with ${companies.length} name${companies.length === 1 ? '' : 's'}.`,
  });

  return { watchlist: { id: watchlist.id, name: watchlist.name } };
}, 'watchlist:write');
