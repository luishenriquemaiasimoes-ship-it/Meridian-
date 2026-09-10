import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route, searchParams } from '@/server/http';
import { recordAudit } from '@/server/services/audit';
import { invalidate } from '@/server/cache';
import { getNormalizationAdjustments } from '@/server/services/company';

export const GET = route(async (ctx, req) => {
  const companyId = searchParams(req).get('companyId');
  if (!companyId) return { adjustments: [] };
  return { adjustments: await getNormalizationAdjustments(ctx.workspaceId, companyId) };
});

const schema = z.object({
  companyId: z.string().min(1),
  periodLabel: z.string().min(1),
  lineItem: z.enum(['EBITDA', 'EBIT', 'NET_INCOME']),
  category: z.enum(['ONE_OFF_EXPENSE', 'EXTRAORDINARY_GAIN', 'RESTRUCTURING', 'IMPAIRMENT', 'UNUSUAL_TAX', 'M_AND_A', 'DISCONTINUED_OPS', 'OTHER']),
  amount: z.number(),
  rationale: z.string().min(4, 'Explain why this item is not representative.').max(600),
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  const company = await prisma.company.findUnique({ where: { id: body.companyId } });
  if (!company) {
    const err = new Error('Company not found.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const created = await prisma.normalizationAdjustment.create({
    data: {
      workspaceId: ctx.workspaceId, companyId: body.companyId, periodLabel: body.periodLabel,
      lineItem: body.lineItem, category: body.category, amount: body.amount,
      rationale: body.rationale, authorName: ctx.name,
    },
  });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'CREATE', entityType: 'NormalizationAdjustment', entityId: created.id,
    entityLabel: `${company.ticker} ${body.periodLabel} ${body.lineItem}`,
    field: 'amount', previousValue: null, newValue: String(body.amount),
    summary: `Normalization adjustment of ${body.amount} recorded against ${company.ticker} ${body.periodLabel} ${body.lineItem.replace('_', ' ')}: ${body.rationale}`,
  });
  invalidate(`dossier:${company.ticker}`);

  return { adjustment: { id: created.id } };
}, 'valuation:write');
