import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';

const sectionSchema = z.object({
  key: z.string().min(1).max(60),
  title: z.string().min(1).max(160),
  body: z.string().max(30000),
});

const patchSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED']).optional(),
  sections: z.array(sectionSchema).min(1).max(24).optional(),
  recommendation: z.enum(['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL']).nullable().optional(),
  targetPrice: z.number().nullable().optional(),
  portfolioRole: z.string().max(400).nullable().optional(),
});

function idFrom(req: Request): string {
  const parts = new URL(req.url).pathname.split('/');
  return parts[parts.length - 1];
}

export const PATCH = route(async (ctx, req) => {
  const id = idFrom(req);
  const existing = await prisma.investmentMemo.findFirst({
    where: { id, workspaceId: ctx.workspaceId }, include: { company: true },
  });
  if (!existing) {
    const err = new Error('Memo not found in this workspace.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  const body = await parseBody(req, patchSchema);

  // Only the committee decides an approval; an author can move a memo as far as
  // review and no further.
  if ((body.status === 'APPROVED' || body.status === 'REJECTED') && !ctx.can('committee:decide')) {
    const err = new Error('Only a portfolio manager can approve or reject a memo.') as Error & { status?: number };
    err.status = 403;
    throw err;
  }

  const memo = await prisma.investmentMemo.update({
    where: { id: existing.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.sections !== undefined ? { sections: JSON.stringify(body.sections) } : {}),
      ...(body.recommendation !== undefined ? { recommendation: body.recommendation } : {}),
      ...(body.targetPrice !== undefined ? { targetPrice: body.targetPrice } : {}),
      ...(body.portfolioRole !== undefined ? { portfolioRole: body.portfolioRole } : {}),
    },
  });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'UPDATE', entityType: 'InvestmentMemo', entityId: memo.id, entityLabel: memo.title,
    field: body.status !== undefined ? 'status' : null,
    previousValue: body.status !== undefined ? existing.status : null,
    newValue: body.status !== undefined ? memo.status : null,
    summary: body.status !== undefined
      ? `Memo "${memo.title}" moved from ${existing.status.toLowerCase()} to ${memo.status.toLowerCase()}.`
      : `Edited memo "${memo.title}".`,
  });

  return { memo: { id: memo.id, title: memo.title, status: memo.status } };
}, 'memo:write');

export const DELETE = route(async (ctx, req) => {
  const id = idFrom(req);
  const existing = await prisma.investmentMemo.findFirst({ where: { id, workspaceId: ctx.workspaceId } });
  if (!existing) {
    const err = new Error('Memo not found in this workspace.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  await prisma.investmentMemo.delete({ where: { id: existing.id } });
  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'DELETE', entityType: 'InvestmentMemo', entityId: existing.id, entityLabel: existing.title,
    summary: `Deleted memo "${existing.title}".`,
  });
  return { deleted: true };
}, 'memo:write');
