import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { listPortfolios } from '@/server/services/portfolio';
import { recordAudit } from '@/server/services/audit';
import { invalidateAll } from '@/server/cache';

export const GET = route(async (ctx) => ({ portfolios: await listPortfolios(ctx.workspaceId) }));

const schema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(400).nullable().optional(),
  baseCurrency: z.enum(['BRL', 'USD', 'EUR', 'GBP']).default('BRL'),
  cash: z.number().min(0).default(0),
  benchmarkCode: z.string().max(12).default('IBOV'),
  isModel: z.boolean().default(false),
});

export const POST = route(async (ctx, req) => {
  const parsed = await parseBody(req, schema);
  const body = {
    ...parsed,
    cash: parsed.cash ?? 0,
    baseCurrency: parsed.baseCurrency ?? 'BRL',
    benchmarkCode: parsed.benchmarkCode ?? 'IBOV',
    isModel: parsed.isModel ?? false,
  };
  const portfolio = await prisma.portfolio.create({
    data: {
      workspaceId: ctx.workspaceId, name: body.name, description: body.description ?? null,
      baseCurrency: body.baseCurrency, cash: body.cash, benchmarkCode: body.benchmarkCode,
      isModel: body.isModel,
    },
  });
  if (body.cash > 0) {
    await prisma.portfolioTransaction.create({
      data: {
        portfolioId: portfolio.id, kind: 'DEPOSIT', amount: body.cash,
        tradeDate: new Date(), note: 'Opening cash balance.', createdBy: ctx.name,
      },
    });
  }
  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'CREATE', entityType: 'Portfolio', entityId: portfolio.id, entityLabel: body.name,
    summary: `Portfolio "${body.name}" created in ${body.baseCurrency} against the ${body.benchmarkCode} benchmark.`,
  });
  invalidateAll();
  return { portfolio: { id: portfolio.id } };
}, 'portfolio:write');
