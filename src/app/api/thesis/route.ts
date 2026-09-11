import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';
import { formatMoney } from '@/lib/finance/format';
import { invalidate } from '@/server/cache';

const assumptionSchema = z.object({
  label: z.string().min(1).max(160),
  metric: z.string().min(1).max(60),
  comparator: z.enum(['GTE', 'LTE']),
  target: z.number(),
  unit: z.string().max(20).optional(),
});

const schema = z.object({
  companyId: z.string().min(1),
  recommendation: z.enum(['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL']),
  targetPrice: z.number().nullable(),
  timeHorizonMonths: z.number().int().min(1).max(120),
  conviction: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']),
  status: z.enum(['ACTIVE', 'UNDER_REVIEW', 'DETERIORATING', 'CLOSED']),
  coreThesis: z.string().min(10, 'The core thesis needs at least a sentence.').max(6000),
  bullCase: z.string().max(4000).nullable().optional(),
  baseCase: z.string().max(4000).nullable().optional(),
  bearCase: z.string().max(4000).nullable().optional(),
  growthDrivers: z.array(z.string().max(300)).max(10),
  moat: z.array(z.string().max(60)).max(8),
  assumptions: z.array(assumptionSchema).max(12),
  changeReason: z.string().max(400).optional(),
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  const company = await prisma.company.findUnique({ where: { id: body.companyId } });
  if (!company) {
    const err = new Error('Company not found.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const existing = await prisma.investmentThesis.findFirst({
    where: { workspaceId: ctx.workspaceId, companyId: body.companyId },
  });

  const data = {
    recommendation: body.recommendation,
    targetPrice: body.targetPrice,
    timeHorizonMonths: body.timeHorizonMonths,
    conviction: body.conviction,
    status: body.status,
    coreThesis: body.coreThesis,
    bullCase: body.bullCase ?? null,
    baseCase: body.baseCase ?? null,
    bearCase: body.bearCase ?? null,
    growthDrivers: JSON.stringify(body.growthDrivers),
    moat: JSON.stringify(body.moat),
    assumptions: JSON.stringify(body.assumptions),
    authorName: ctx.name,
  };

  const thesis = existing
    ? await prisma.investmentThesis.update({ where: { id: existing.id }, data })
    : await prisma.investmentThesis.create({
        data: { ...data, workspaceId: ctx.workspaceId, companyId: body.companyId },
      });

  const currency = company.currency as 'BRL' | 'USD' | 'EUR' | 'GBP';
  const targetChanged = existing ? existing.targetPrice !== body.targetPrice : body.targetPrice !== null;
  const recChanged = existing ? existing.recommendation !== body.recommendation : true;

  if (targetChanged || recChanged) {
    if (body.targetPrice !== null) {
      await prisma.targetPriceRecord.create({
        data: {
          thesisId: thesis.id, companyId: body.companyId,
          targetPrice: body.targetPrice,
          previousTarget: existing?.targetPrice ?? null,
          recommendation: body.recommendation,
          previousRecommendation: existing?.recommendation ?? null,
          reason: body.changeReason?.trim() || (existing ? 'Target updated with the thesis.' : 'Coverage initiated.'),
          authorName: ctx.name,
        },
      });
    }
    if (existing && targetChanged) {
      await recordAudit({
        workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
        action: 'UPDATE', entityType: 'InvestmentThesis', entityId: thesis.id,
        entityLabel: `${company.ticker} thesis`, field: 'targetPrice',
        previousValue: existing.targetPrice === null ? null : String(existing.targetPrice),
        newValue: body.targetPrice === null ? null : String(body.targetPrice),
        summary: `Target price changed from ${formatMoney(existing.targetPrice, currency)} to ${formatMoney(body.targetPrice, currency)}${body.changeReason ? ` — ${body.changeReason}` : ''}.`,
      });
      await prisma.notification.create({
        data: {
          workspaceId: ctx.workspaceId, severity: 'IMPORTANT', category: 'THESIS',
          title: `${company.ticker} target price changed`,
          body: `${formatMoney(existing.targetPrice, currency)} → ${formatMoney(body.targetPrice, currency)}. ${body.changeReason ?? ''}`.trim(),
          ticker: company.ticker, href: `/companies/${company.ticker}/thesis`,
        },
      });
    }
    if (existing && recChanged) {
      await recordAudit({
        workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
        action: 'UPDATE', entityType: 'InvestmentThesis', entityId: thesis.id,
        entityLabel: `${company.ticker} thesis`, field: 'recommendation',
        previousValue: existing.recommendation, newValue: body.recommendation,
        summary: `Recommendation changed from ${existing.recommendation.replace('_', ' ').toLowerCase()} to ${body.recommendation.replace('_', ' ').toLowerCase()}${body.changeReason ? ` — ${body.changeReason}` : ''}.`,
      });
    }
  }

  if (existing && existing.status !== body.status) {
    await recordAudit({
      workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
      action: 'UPDATE', entityType: 'InvestmentThesis', entityId: thesis.id,
      entityLabel: `${company.ticker} thesis`, field: 'status',
      previousValue: existing.status, newValue: body.status,
      summary: `Thesis status changed from ${existing.status.replace('_', ' ').toLowerCase()} to ${body.status.replace('_', ' ').toLowerCase()}.`,
    });
  }

  if (!existing) {
    await recordAudit({
      workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
      action: 'CREATE', entityType: 'InvestmentThesis', entityId: thesis.id,
      entityLabel: `${company.ticker} thesis`,
      summary: `Thesis written for ${company.ticker}: ${body.recommendation.replace('_', ' ').toLowerCase()} with a target of ${formatMoney(body.targetPrice, currency)}.`,
    });
  }

  invalidate(`dossier:${company.ticker}`);
  return { thesis: { id: thesis.id } };
}, 'thesis:write');
