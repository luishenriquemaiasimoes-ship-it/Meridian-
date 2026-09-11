import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';

const patchSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(400).nullable().optional(),
  addTicker: z.string().max(12).optional(),
  removeTicker: z.string().max(12).optional(),
  note: z.string().max(400).nullable().optional(),
});

function idFrom(req: Request): string {
  const parts = new URL(req.url).pathname.split('/');
  return parts[parts.length - 1];
}

async function loadOwned(workspaceId: string, id: string) {
  const w = await prisma.watchlist.findFirst({ where: { id, workspaceId } });
  if (!w) {
    const err = new Error('Watchlist not found in this workspace.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  return w;
}

export const PATCH = route(async (ctx, req) => {
  const watchlist = await loadOwned(ctx.workspaceId, idFrom(req));
  const body = await parseBody(req, patchSchema);
  let summary = '';

  if (body.addTicker) {
    const company = await prisma.company.findUnique({ where: { ticker: body.addTicker.toUpperCase() } });
    if (!company) {
      const err = new Error(`No company with ticker ${body.addTicker.toUpperCase()}.`) as Error & { status?: number };
      err.status = 404;
      throw err;
    }
    const existing = await prisma.watchlistItem.findFirst({
      where: { watchlistId: watchlist.id, companyId: company.id },
    });
    if (existing) {
      const err = new Error(`${company.ticker} is already on ${watchlist.name}.`) as Error & { status?: number };
      err.status = 409;
      throw err;
    }
    await prisma.watchlistItem.create({
      data: { watchlistId: watchlist.id, companyId: company.id, note: body.note ?? null },
    });
    summary = `Added ${company.ticker} to "${watchlist.name}".`;
  }

  if (body.removeTicker) {
    const company = await prisma.company.findUnique({ where: { ticker: body.removeTicker.toUpperCase() } });
    if (company) {
      await prisma.watchlistItem.deleteMany({ where: { watchlistId: watchlist.id, companyId: company.id } });
      summary = `Removed ${company.ticker} from "${watchlist.name}".`;
    }
  }

  if (body.name !== undefined || body.description !== undefined) {
    await prisma.watchlist.update({
      where: { id: watchlist.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
      },
    });
    summary ||= `Renamed watchlist to "${body.name ?? watchlist.name}".`;
  }

  if (summary) {
    await recordAudit({
      workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
      action: 'UPDATE', entityType: 'Watchlist', entityId: watchlist.id, entityLabel: watchlist.name,
      summary,
    });
  }

  return { ok: true, summary };
}, 'watchlist:write');

export const DELETE = route(async (ctx, req) => {
  const watchlist = await loadOwned(ctx.workspaceId, idFrom(req));
  await prisma.watchlist.delete({ where: { id: watchlist.id } });
  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'DELETE', entityType: 'Watchlist', entityId: watchlist.id, entityLabel: watchlist.name,
    summary: `Deleted watchlist "${watchlist.name}".`,
  });
  return { deleted: true };
}, 'watchlist:write');
