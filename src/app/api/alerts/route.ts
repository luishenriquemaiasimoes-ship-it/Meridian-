import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';
import { evaluateAlerts } from '@/server/services/alerts';

const schema = z.object({
  name: z.string().min(2, 'Give the alert a name.').max(120),
  ticker: z.string().max(12).nullable().optional(),
  category: z.enum(['PRICE', 'VALUATION', 'FUNDAMENTAL', 'EARNINGS', 'THESIS', 'PORTFOLIO']),
  metric: z.string().min(1).max(60),
  comparator: z.enum(['GT', 'GTE', 'LT', 'LTE', 'CROSSES_ABOVE', 'CROSSES_BELOW']),
  threshold: z.number(),
  severity: z.enum(['CRITICAL', 'IMPORTANT', 'INFORMATIONAL']),
  enabled: z.boolean().optional(),
});

export const GET = route(async (ctx) => ({ alerts: await evaluateAlerts(ctx.workspaceId) }));

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);

  let companyId: string | null = null;
  if (body.ticker) {
    const company = await prisma.company.findUnique({ where: { ticker: body.ticker.toUpperCase() } });
    if (!company) {
      const err = new Error(`No company with ticker ${body.ticker.toUpperCase()}.`) as Error & { status?: number };
      err.status = 404;
      throw err;
    }
    companyId = company.id;
  }

  const alert = await prisma.alert.create({
    data: {
      workspaceId: ctx.workspaceId,
      companyId,
      name: body.name,
      category: body.category,
      metric: body.metric,
      comparator: body.comparator,
      threshold: body.threshold,
      severity: body.severity,
      enabled: body.enabled ?? true,
      createdBy: ctx.name,
    },
  });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'CREATE', entityType: 'Alert', entityId: alert.id, entityLabel: alert.name,
    summary: `Created alert "${alert.name}": ${body.metric} ${body.comparator} ${body.threshold}.`,
  });

  return { alert: { id: alert.id } };
}, 'alert:write');
