import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';

const schema = z.object({
  hidden: z.array(z.string().max(60)).max(40),
  order: z.array(z.string().max(60)).max(40),
});

/**
 * The home dashboard layout. It belongs to the workspace rather than the user:
 * a desk that decides the catalyst list matters more than recent results wants
 * everyone looking at the same page in the morning.
 */
export const PATCH = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  await prisma.workspace.update({
    where: { id: ctx.workspaceId },
    data: { layout: JSON.stringify({ hidden: body.hidden, order: body.order }) },
  });
  return { ok: true, hidden: body.hidden.length, order: body.order.length };
});
