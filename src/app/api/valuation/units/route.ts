import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route, searchParams } from '@/server/http';
import { getUnitModelContext, runUnitModel, type UnitModelState } from '@/server/services/units';
import { recordAudit } from '@/server/services/audit';
import { normalizeAssumptions, type DcfAssumptions } from '@/lib/finance/dcf';

const segmentSchema = z.object({
  name: z.string().min(1).max(120),
  revenueShare: z.number().min(0).max(2),
  ebitdaMargin: z.number().min(-5).max(5).nullable().optional(),
  revenueGrowth: z.number().min(-1).max(5).nullable().optional(),
  capexPctRevenue: z.number().min(-1).max(5).nullable().optional(),
  endYear: z.number().int().min(1900).max(2200).nullable().optional(),
  ownership: z.number().min(0).max(1).nullable().optional(),
  netDebt: z.number().nullable().optional(),
  wacc: z.number().min(0).max(1).nullable().optional(),
  source: z.string().max(200).nullable().optional(),
});

const stateSchema = z.object({
  method: z.enum(['CONSOLIDATED', 'SOTP']),
  segments: z.array(segmentSchema).max(40),
});

export const GET = route(async (ctx, req) => {
  const params = searchParams(req);
  const ticker = params.get('ticker');
  if (!ticker) {
    const err = new Error('A ticker is required.') as Error & { status?: number };
    err.status = 400;
    throw err;
  }
  const context = await getUnitModelContext(ctx.workspaceId, ticker, params.get('modelId'));
  if (!context) {
    const err = new Error('No company or model to build units from.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  const state = context.saved ?? context.suggested;
  return { context, run: runUnitModel(context.assumptions, state, context) };
});

const bodySchema = z.object({
  ticker: z.string().min(1).max(12),
  modelId: z.string().max(60).nullable().optional(),
  state: stateSchema,
  /** Unsaved edits to the underlying DCF, so the preview follows the model. */
  assumptions: z.record(z.string(), z.unknown()).optional(),
  save: z.boolean().optional(),
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, bodySchema);
  const context = await getUnitModelContext(ctx.workspaceId, body.ticker, body.modelId ?? null);
  if (!context) {
    const err = new Error('No company or model to build units from.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const assumptions = body.assumptions
    ? normalizeAssumptions(body.assumptions as Partial<DcfAssumptions>)
    : context.assumptions;
  const state = body.state as UnitModelState;
  const run = runUnitModel(assumptions, state, {
    netDebt: assumptions.netDebt,
    minorityInterest: assumptions.minorityInterest ?? 0,
    sharesOutstanding: assumptions.sharesOutstanding,
    currentPrice: context.currentPrice,
  });

  if (body.save) {
    if (!context.modelId) {
      const err = new Error('Save the DCF first — the unit split is stored against it.') as Error & { status?: number };
      err.status = 409;
      throw err;
    }
    await prisma.valuationModel.update({
      where: { id: context.modelId },
      data: { unitModel: JSON.stringify(state) },
    });
    await recordAudit({
      workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
      action: 'UPDATE', entityType: 'ValuationModel', entityId: context.modelId, entityLabel: context.ticker,
      summary: `Unit model for ${context.ticker}: ${state.segments.length} units aggregated ${state.method === 'SOTP' ? 'as a sum of the parts' : 'on a consolidated basis'}${run.aggregated.fairValuePerShare !== null ? `, ${run.aggregated.fairValuePerShare.toFixed(2)} per share` : ''}.`,
    });
  }

  return { run, saved: !!body.save };
}, 'valuation:write');
