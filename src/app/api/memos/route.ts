import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';

const sectionSchema = z.object({
  key: z.string().min(1).max(60),
  title: z.string().min(1).max(160),
  body: z.string().max(30000),
});

const createSchema = z.object({
  ticker: z.string().min(1).max(12),
  title: z.string().min(3, 'Give the memo a title.').max(200),
  sections: z.array(sectionSchema).min(1).max(24),
  recommendation: z.enum(['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL']).nullable().optional(),
  targetPrice: z.number().nullable().optional(),
  portfolioRole: z.string().max(400).nullable().optional(),
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, createSchema);
  const company = await prisma.company.findUnique({ where: { ticker: body.ticker.toUpperCase() } });
  if (!company) {
    const err = new Error(`No company with ticker ${body.ticker.toUpperCase()}.`) as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const memo = await prisma.investmentMemo.create({
    data: {
      workspaceId: ctx.workspaceId,
      companyId: company.id,
      authorId: ctx.userId,
      title: body.title,
      status: 'DRAFT',
      sections: JSON.stringify(body.sections),
      recommendation: body.recommendation ?? null,
      targetPrice: body.targetPrice ?? null,
      portfolioRole: body.portfolioRole ?? null,
    },
  });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'CREATE', entityType: 'InvestmentMemo', entityId: memo.id, entityLabel: memo.title,
    summary: `Created investment memo "${memo.title}" on ${company.ticker}.`,
  });

  return { memo: { id: memo.id, title: memo.title } };
}, 'memo:write');
