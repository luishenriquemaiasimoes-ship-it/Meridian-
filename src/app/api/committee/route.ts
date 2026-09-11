import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';

const createSchema = z.object({
  ticker: z.string().min(1).max(12),
  memoId: z.string().max(40).nullable().optional(),
  title: z.string().min(3, 'Give the item a title.').max(200),
  proposal: z.enum(['BUY', 'SELL', 'INCREASE', 'REDUCE', 'HOLD']),
  recommendation: z.enum(['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL']).nullable().optional(),
  targetPrice: z.number().nullable().optional(),
  proposedWeight: z.number().min(0).max(1).nullable().optional(),
  meetingDate: z.string().max(10).nullable().optional(),
  summary: z.string().min(10, 'Say what is being proposed and why.').max(4000),
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, createSchema);
  const company = await prisma.company.findUnique({ where: { ticker: body.ticker.toUpperCase() } });
  if (!company) {
    const err = new Error(`No company with ticker ${body.ticker.toUpperCase()}.`) as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const item = await prisma.committeeItem.create({
    data: {
      workspaceId: ctx.workspaceId,
      companyId: company.id,
      memoId: body.memoId || null,
      title: body.title,
      proposal: body.proposal,
      recommendation: body.recommendation ?? null,
      targetPrice: body.targetPrice ?? null,
      proposedWeight: body.proposedWeight ?? null,
      status: 'UNDER_REVIEW',
      meetingDate: body.meetingDate ? new Date(`${body.meetingDate}T00:00:00.000Z`) : null,
      summary: body.summary,
      createdBy: ctx.name,
    },
  });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'CREATE', entityType: 'CommitteeItem', entityId: item.id, entityLabel: item.title,
    summary: `Tabled "${item.title}" for the committee (${body.proposal.toLowerCase()} ${company.ticker}).`,
  });

  return { item: { id: item.id, title: item.title } };
}, 'memo:write');
