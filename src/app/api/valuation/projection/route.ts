import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route, searchParams } from '@/server/http';
import { buildProjectionContext, runProjection } from '@/server/services/projection';
import { recordAudit } from '@/server/services/audit';
import type { ProjectionInput } from '@/lib/finance/projection/types';

export const GET = route(async (ctx, req) => {
  const params = searchParams(req);
  const ticker = params.get('ticker');
  if (!ticker) {
    const err = new Error('A ticker is required.') as Error & { status?: number };
    err.status = 400;
    throw err;
  }
  const context = await buildProjectionContext(ctx.workspaceId, ticker, params.get('modelId'));
  if (!context) {
    const err = new Error('No reported history to build a model from.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  return { context, run: runProjection(context.saved ?? context.suggested) };
});

/* The input is deep and every field is the analyst's, so it is validated as a
   shape rather than enumerated: a driver the engine does not know is dropped
   by the engine, not silently accepted here. */
const numbers = z.array(z.number()).max(60);

const schema = z.object({
  ticker: z.string().min(1).max(12),
  modelId: z.string().max(60).nullable().optional(),
  save: z.boolean().optional(),
  input: z.object({
    baseYear: z.number().int().min(1990).max(2100),
    years: z.number().int().min(1).max(40),
    opening: z.record(z.string(), z.number()),
    revenue: z.array(z.object({
      key: z.string().max(60), label: z.string().max(120),
      kind: z.enum(['VOLUME_PRICE', 'GROWTH', 'PCT_OF', 'CONSTRUCTION']),
      baseVolume: z.number().nullable().optional(), volumeGrowth: numbers.optional(),
      basePrice: z.number().nullable().optional(), priceGrowth: numbers.optional(),
      priceIndex: z.string().max(40).nullable().optional(),
      baseRevenue: z.number().nullable().optional(), revenueGrowth: numbers.optional(),
      ofKey: z.string().max(60).nullable().optional(), pctOf: numbers.optional(),
      pctOfCapex: numbers.optional(), source: z.string().max(200).nullable().optional(),
    })).max(30),
    revenueDeductions: numbers.optional(),
    costs: z.array(z.object({
      key: z.string().max(60), label: z.string().max(120),
      block: z.enum(['COGS', 'SGA']),
      kind: z.enum(['PCT_REVENUE', 'PCT_REVENUE_LINE', 'PER_UNIT', 'FIXED', 'CONSTRUCTION']),
      pct: numbers.optional(),
      base: z.enum(['NET_REVENUE', 'NET_REVENUE_EX_CONSTRUCTION']).optional(),
      ofKey: z.string().max(60).nullable().optional(),
      basePerUnit: z.number().nullable().optional(), perUnitGrowth: numbers.optional(),
      volumeKey: z.string().max(60).nullable().optional(),
      baseAmount: z.number().nullable().optional(), amountGrowth: numbers.optional(),
      discount: z.number().min(-1).max(1).nullable().optional(),
      source: z.string().max(200).nullable().optional(),
    })).max(30),
    capex: z.array(z.object({
      key: z.string().max(60), label: z.string().max(120),
      amounts: numbers.optional(), pctRevenue: numbers.optional(),
      tangibleShare: z.number().min(0).max(1), usefulLife: z.number().min(1).max(60),
      amortiseToYear: z.number().int().min(1990).max(2200).nullable().optional(),
      contractedRemaining: z.number().nullable().optional(),
      source: z.string().max(200).nullable().optional(),
    })).max(20),
    workingCapital: z.object({
      receivableDays: z.number().min(0).max(720),
      payableDays: z.number().min(0).max(720),
      inventoryDays: z.number().min(0).max(720),
      otherAssetDays: z.number().min(0).max(720).optional(),
      otherLiabilityDays: z.number().min(0).max(720).optional(),
      provisionDays: z.array(z.object({
        key: z.string().max(60), label: z.string().max(120),
        days: z.number().min(0).max(720), onCost: z.boolean().optional(),
      })).max(10).optional(),
    }),
    debt: z.object({
      openingBalance: z.number(), costOfDebt: z.number().min(0).max(1),
      amortisationYears: z.number().min(1).max(40),
      capexFundedByDebt: z.number().min(0).max(1),
      newDebtTenor: z.number().min(1).max(40),
      rollMaturities: z.boolean().optional(),
      draws: numbers.optional(), amortisations: numbers.optional(),
      cashYield: z.number().min(0).max(1).optional(),
      source: z.string().max(200).nullable().optional(),
    }),
    distribution: z.object({
      payout: numbers,
      liquidationDividendYear: z.number().int().nullable().optional(),
    }),
    taxRate: numbers,
    baseNetRevenue: z.number().nullable().optional(),
    wacc: z.number().min(0).max(1).nullable().optional(),
    costOfEquity: z.number().min(0).max(1).nullable().optional(),
    sharesOutstanding: z.number().nullable().optional(),
    currentPrice: z.number().nullable().optional(),
    ownership: z.number().min(0).max(1).optional(),
    covenants: z.array(z.object({
      key: z.string().max(60), label: z.string().max(120),
      measure: z.enum(['DSCR', 'NET_DEBT_EBITDA', 'INTEREST_COVERAGE', 'EBITDA_INTEREST']),
      threshold: z.number(), comparator: z.enum(['GTE', 'LTE']),
    })).max(12).optional(),
  }),
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  const input = body.input as unknown as ProjectionInput;
  const run = runProjection(input);

  if (body.save) {
    const model = body.modelId
      ? await prisma.valuationModel.findFirst({ where: { id: body.modelId, workspaceId: ctx.workspaceId } })
      : await prisma.valuationModel.findFirst({
          where: { workspaceId: ctx.workspaceId, company: { ticker: body.ticker.toUpperCase() }, kind: 'DCF' },
          orderBy: { updatedAt: 'desc' },
        });
    if (!model) {
      const err = new Error('Save the DCF first — the full model is stored against it.') as Error & { status?: number };
      err.status = 409;
      throw err;
    }
    await prisma.valuationModel.update({
      where: { id: model.id },
      data: { projection: JSON.stringify(input) },
    });
    const closes = run.projected.balance.every((b) => b.balances);
    await recordAudit({
      workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
      action: 'UPDATE', entityType: 'ValuationModel', entityId: model.id,
      entityLabel: body.ticker.toUpperCase(),
      summary: `Full model for ${body.ticker.toUpperCase()}: ${input.years} projected years, ${input.revenue.length} revenue lines, balance sheet ${closes ? 'closes in every year' : 'does not close'}${run.valuation.valuePerShare !== null ? `, ${run.valuation.valuePerShare.toFixed(2)} per share` : ''}.`,
    });
  }

  return { run, saved: !!body.save };
}, 'valuation:write');
