import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';

const schema = z.object({
  companyId: z.string().min(1),
  earningsId: z.string().min(1),
  headline: z.string().min(1).max(400),
  analysis: z.record(z.string(), z.unknown()),
  thesisImpact: z.enum(['SUPPORTS', 'NEUTRAL', 'WEAKENS']),
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  const company = await prisma.company.findUnique({ where: { id: body.companyId } });
  const event = await prisma.earningsEvent.findUnique({ where: { id: body.earningsId } });
  if (!company || !event) {
    const err = new Error('Company or earnings period not found.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const saved = await prisma.earningsReview.upsert({
    where: { workspaceId_earningsId: { workspaceId: ctx.workspaceId, earningsId: body.earningsId } },
    update: {
      headline: body.headline, analysis: JSON.stringify(body.analysis),
      thesisImpact: body.thesisImpact, authorName: ctx.name,
    },
    create: {
      workspaceId: ctx.workspaceId, companyId: body.companyId, earningsId: body.earningsId,
      headline: body.headline, analysis: JSON.stringify(body.analysis),
      thesisImpact: body.thesisImpact, authorName: ctx.name,
    },
  });

  if (body.thesisImpact === 'WEAKENS') {
    await prisma.notification.create({
      data: {
        workspaceId: ctx.workspaceId, severity: 'IMPORTANT', category: 'EARNINGS',
        title: `${company.ticker} ${event.label} weakens the thesis`,
        body: body.headline, ticker: company.ticker,
        href: `/companies/${company.ticker}/thesis`,
      },
    });
  }

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'CREATE', entityType: 'EarningsReview', entityId: saved.id,
    entityLabel: `${company.ticker} ${event.label}`,
    summary: `Earnings review recorded for ${company.ticker} ${event.label}: ${body.thesisImpact.toLowerCase()} the thesis.`,
  });

  return { review: { id: saved.id } };
}, 'research:write');
