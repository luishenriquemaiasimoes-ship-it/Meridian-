import { z } from 'zod';
import { prisma, parseJson } from '@/lib/db';
import { parseBody, route, searchParams } from '@/server/http';
import { recordAudit, recordFieldChanges } from '@/server/services/audit';
import { listValuationModels } from '@/server/services/valuation';
import { formatMultiple, formatPercent } from '@/lib/finance/format';
import type { DcfAssumptions } from '@/lib/finance/dcf';

export const GET = route(async (ctx, req) => {
  const ticker = searchParams(req).get('ticker') ?? undefined;
  return { models: await listValuationModels(ctx.workspaceId, ticker) };
});

const schema = z.object({
  id: z.string().nullable().optional(),
  companyId: z.string().min(1),
  name: z.string().min(1).max(120),
  kind: z.enum(['DCF', 'SOTP', 'COMPS', 'REVERSE_DCF']).default('DCF'),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  assumptions: z.record(z.string(), z.unknown()),
  scenarios: z.array(z.record(z.string(), z.unknown())).nullable().optional(),
  outputs: z.record(z.string(), z.unknown()).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

/** Describes an assumption change in the words an analyst would use. */
function describeAssumption(field: string, from: unknown, to: unknown): string {
  const pct = (v: unknown) => (typeof v === 'number' ? formatPercent(v, 2) : String(v ?? '—'));
  const mult = (v: unknown) => (typeof v === 'number' ? formatMultiple(v, 2) : String(v ?? '—'));
  switch (field) {
    case 'wacc': return `WACC changed from ${pct(from)} to ${pct(to)}.`;
    case 'terminalGrowth': return `Terminal growth changed from ${pct(from)} to ${pct(to)}.`;
    case 'taxRate': return `Tax rate changed from ${pct(from)} to ${pct(to)}.`;
    case 'exitMultiple': return `Exit multiple changed from ${mult(from)} to ${mult(to)}.`;
    case 'terminalMethod': return `Terminal value method changed from ${String(from)} to ${String(to)}.`;
    case 'revenueGrowth': return `Revenue growth assumptions changed from ${JSON.stringify(from)} to ${JSON.stringify(to)}.`;
    case 'ebitdaMargin': return `EBITDA margin assumptions changed from ${JSON.stringify(from)} to ${JSON.stringify(to)}.`;
    case 'netDebt': return `Net debt changed from ${String(from)} to ${String(to)}.`;
    case 'sharesOutstanding': return `Share count changed from ${String(from)} to ${String(to)}.`;
    default: return `${field} changed from ${JSON.stringify(from)} to ${JSON.stringify(to)}.`;
  }
}

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  const company = await prisma.company.findUnique({ where: { id: body.companyId } });
  if (!company) {
    const err = new Error('Company not found.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const existing = body.id
    ? await prisma.valuationModel.findFirst({ where: { id: body.id, workspaceId: ctx.workspaceId } })
    : null;

  const data = {
    workspaceId: ctx.workspaceId,
    companyId: body.companyId,
    name: body.name,
    kind: body.kind,
    status: body.status ?? existing?.status ?? 'ACTIVE',
    assumptions: JSON.stringify(body.assumptions),
    scenarios: body.scenarios ? JSON.stringify(body.scenarios) : existing?.scenarios ?? null,
    outputs: body.outputs ? JSON.stringify(body.outputs) : null,
    notes: body.notes ?? existing?.notes ?? null,
    authorName: ctx.name,
  };

  const saved = existing
    ? await prisma.valuationModel.update({ where: { id: existing.id }, data })
    : await prisma.valuationModel.create({ data });

  if (existing) {
    const before = parseJson<Record<string, unknown>>(existing.assumptions, {});
    const changes = await recordFieldChanges(
      {
        workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
        entityType: 'ValuationModel', entityId: saved.id, entityLabel: `${company.ticker} — ${body.name}`,
      },
      before,
      body.assumptions as Record<string, unknown>,
      describeAssumption,
    );
    if (changes === 0) {
      await recordAudit({
        workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
        action: 'UPDATE', entityType: 'ValuationModel', entityId: saved.id,
        entityLabel: `${company.ticker} — ${body.name}`,
        summary: `Model ${body.name} saved with no assumption change.`,
      });
    }
  } else {
    const a = body.assumptions as unknown as DcfAssumptions;
    await recordAudit({
      workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
      action: 'CREATE', entityType: 'ValuationModel', entityId: saved.id,
      entityLabel: `${company.ticker} — ${body.name}`,
      summary: `${body.kind} model created for ${company.ticker} at a WACC of ${formatPercent(a?.wacc ?? 0, 2)} and terminal growth of ${formatPercent(a?.terminalGrowth ?? 0, 2)}.`,
    });
  }

  return { model: { id: saved.id, updatedAt: saved.updatedAt.toISOString() } };
}, 'valuation:write');
