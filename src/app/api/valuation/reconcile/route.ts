import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route, searchParams } from '@/server/http';
import { getModelReconciliation } from '@/server/services/reconciliation';
import { recordAudit } from '@/server/services/audit';

export const GET = route(async (ctx, req) => {
  const p = searchParams(req);
  const ticker = p.get('ticker');
  if (!ticker) {
    const err = new Error('A ticker is required.') as Error & { status?: number };
    err.status = 400;
    throw err;
  }
  const assumptionsParam = p.get('assumptions');
  let override = null;
  if (assumptionsParam) {
    try { override = JSON.parse(assumptionsParam); } catch { override = null; }
  }
  const data = await getModelReconciliation(ctx.workspaceId, ticker, p.get('modelId'), override);
  if (!data) {
    const err = new Error('Company not found.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  return data;
});

const noteSchema = z.object({
  modelId: z.string().min(1),
  rationale: z.string().min(10, 'Say why the model differs from the range.').max(2000),
});

/** Records why the model's target sits where it does against the sell-side range. */
export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, noteSchema);
  const model = await prisma.valuationModel.findFirst({
    where: { id: body.modelId, workspaceId: ctx.workspaceId },
  });
  if (!model) {
    const err = new Error('Model not found in this workspace.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const note = { rationale: body.rationale, recordedBy: ctx.name, recordedAt: new Date().toISOString() };
  await prisma.valuationModel.update({
    where: { id: model.id },
    data: { consensusNote: JSON.stringify(note) },
  });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'UPDATE', entityType: 'ValuationModel', entityId: model.id, entityLabel: model.name,
    field: 'consensusNote', previousValue: null, newValue: body.rationale.slice(0, 200),
    summary: `Recorded why "${model.name}" differs from the sell-side range.`,
  });

  return { note };
}, 'valuation:write');
