import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route, searchParams } from '@/server/http';

export const GET = route(async (ctx, req) => {
  const unreadOnly = searchParams(req).get('unread') === 'true';
  const rows = await prisma.notification.findMany({
    where: {
      workspaceId: ctx.workspaceId,
      OR: [{ userId: ctx.userId }, { userId: null }],
      ...(unreadOnly ? { readAt: null } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 60,
  });
  return {
    notifications: rows.map((n) => ({
      id: n.id, severity: n.severity, category: n.category, title: n.title, body: n.body,
      ticker: n.ticker, href: n.href, readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    })),
    unread: rows.filter((n) => !n.readAt).length,
  };
});

const markSchema = z.object({ ids: z.array(z.string()).optional(), all: z.boolean().optional() });

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, markSchema);
  const where = body.all
    ? { workspaceId: ctx.workspaceId, OR: [{ userId: ctx.userId }, { userId: null }], readAt: null }
    : { id: { in: body.ids ?? [] }, workspaceId: ctx.workspaceId };
  const result = await prisma.notification.updateMany({ where, data: { readAt: new Date() } });
  return { updated: result.count };
});
