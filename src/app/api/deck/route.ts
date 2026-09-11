import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';

const thesisSchema = z.object({
  id: z.string().max(60),
  order: z.number().int().min(1).max(20),
  title: z.string().max(200),
  weight: z.enum(['CORE', 'SUPPORTING', 'OPTIONAL']),
  rationale: z.string().max(8000),
  requires: z.array(z.string().max(400)).max(12),
  breaks: z.array(z.string().max(400)).max(12),
  drivers: z.array(z.object({
    label: z.string().max(160),
    metric: z.string().max(60).nullable().optional(),
    target: z.number().nullable().optional(),
    comparator: z.enum(['GTE', 'LTE']).nullable().optional(),
  })).max(12),
  conviction: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']),
  notes: z.string().max(2000).nullable().optional(),
});

const riskSchema = z.object({
  id: z.string().max(60),
  title: z.string().max(200),
  category: z.string().max(60),
  probability: z.number().min(0).max(1),
  impact: z.number().min(0).max(1),
  detail: z.string().max(2000).nullable().optional(),
  mitigation: z.string().max(2000).nullable().optional(),
  thesisId: z.string().max(60).nullable().optional(),
});

const stressSchema = z.object({
  id: z.string().max(60),
  kind: z.enum(['COMPETITIVE', 'FINANCING', 'OPERATIONAL', 'REGULATORY', 'OTHER']),
  title: z.string().max(200),
  trigger: z.string().max(2000),
  consequence: z.string().max(2000),
  effect: z.object({
    measure: z.string().max(120),
    delta: z.number().nullable(),
    format: z.enum(['percent', 'currency', 'multiple', 'number']),
  }).nullable().optional(),
  verdict: z.enum(['SURVIVES', 'WEAKENED', 'BROKEN', 'UNTESTED']),
  response: z.string().max(2000).nullable().optional(),
});

const schema = z.object({
  ticker: z.string().min(1).max(12),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  summary: z.string().max(4000).nullable().optional(),
  theses: z.array(thesisSchema).max(20),
  risks: z.array(riskSchema).max(40),
  stressTests: z.array(stressSchema).max(20),
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  const company = await prisma.company.findUnique({ where: { ticker: body.ticker.toUpperCase() } });
  if (!company) {
    const err = new Error(`No company with ticker ${body.ticker.toUpperCase()}.`) as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const data = {
    status: body.status ?? 'DRAFT',
    summary: body.summary ?? null,
    theses: JSON.stringify(body.theses),
    risks: JSON.stringify(body.risks),
    stressTests: JSON.stringify(body.stressTests),
    authorName: ctx.name,
  };

  const deck = await prisma.qualitativeDeck.upsert({
    where: { workspaceId_companyId: { workspaceId: ctx.workspaceId, companyId: company.id } },
    create: { workspaceId: ctx.workspaceId, companyId: company.id, ...data },
    update: data,
  });

  const core = body.theses.filter((t) => t.weight === 'CORE').length;
  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'UPDATE', entityType: 'QualitativeDeck', entityId: deck.id, entityLabel: company.ticker,
    summary: `Qualitative deck for ${company.ticker}: ${body.theses.length} theses (${core} core), ${body.risks.length} risks, ${body.stressTests.length} stress tests.`,
  });

  return { deck: { id: deck.id, status: deck.status, updatedAt: deck.updatedAt.toISOString() } };
}, 'thesis:write');
