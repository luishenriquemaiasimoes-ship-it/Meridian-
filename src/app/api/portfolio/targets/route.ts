import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';

const schema = z.object({
  portfolioId: z.string().min(1),
  targets: z.array(z.object({ ticker: z.string().min(1).max(12), targetWeight: z.number().min(0).max(1) })).max(100),
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  const portfolio = await prisma.portfolio.findFirst({
    where: { id: body.portfolioId, workspaceId: ctx.workspaceId },
  });
  if (!portfolio) {
    const err = new Error('Portfolio not found in this workspace.') as Error & { status?: number };
    err.status = 404; throw err;
  }

  const total = body.targets.reduce((s, t) => s + t.targetWeight, 0);
  await prisma.rebalanceTargetRecord.deleteMany({ where: { portfolioId: portfolio.id } });
  await prisma.rebalanceTargetRecord.createMany({
    data: body.targets.map((t) => ({
      portfolioId: portfolio.id, ticker: t.ticker.toUpperCase(), targetWeight: t.targetWeight,
    })),
  });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'UPDATE', entityType: 'RebalanceTarget', entityId: portfolio.id, entityLabel: portfolio.name,
    summary: `Target weights set for ${body.targets.length} positions in ${portfolio.name}, summing to ${(total * 100).toFixed(1)}%.`,
  });

  return { saved: body.targets.length, totalWeight: total };
}, 'portfolio:rebalance');
