import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route, searchParams } from '@/server/http';
import { getWaccBuildContext, runWaccBuild } from '@/server/services/wacc';
import { recordAudit } from '@/server/services/audit';
import type { WaccBuildInput } from '@/lib/finance/waccBuilder';

const sourced = z.object({
  value: z.number(),
  source: z.string().max(200),
  asOf: z.string().max(30).nullable(),
});

const schema = z.object({
  ticker: z.string().min(1).max(12),
  modelId: z.string().max(40).nullable().optional(),
  /** Persist the build onto the model, rather than just previewing it. */
  save: z.boolean().optional(),
  build: z.object({
    currency: z.string().max(5),
    erpIsDevelopedMarket: z.boolean().optional(),
    riskFree: sourced.extend({
      basis: z.enum(['NOMINAL', 'REAL']),
      inflation: z.number().nullable().optional(),
      instrument: z.string().max(120).nullable().optional(),
    }),
    equityRiskPremium: sourced,
    countryRiskPremium: sourced.nullable().optional(),
    sizePremium: sourced.nullable().optional(),
    betaMethod: z.enum(['OBSERVED', 'BOTTOM_UP']),
    observedBeta: sourced.extend({
      window: z.string().max(40).nullable().optional(),
      benchmark: z.string().max(40).nullable().optional(),
    }).nullable().optional(),
    peerBetas: z.array(z.object({
      ticker: z.string().max(12),
      leveredBeta: z.number(),
      debtToEquity: z.number(),
      taxRate: z.number(),
    })).max(40).optional(),
    targetDebtToEquity: z.number().nullable().optional(),
    costOfDebt: sourced.extend({ basis: z.enum(['REPORTED', 'SPREAD', 'YTM']).nullable().optional() }),
    taxRate: sourced,
    marketValueEquity: sourced,
    debt: sourced.extend({ basis: z.enum(['NET_DEBT', 'GROSS_DEBT']) }),
    cash: z.number().nullable().optional(),
    targetEquityWeight: z.number().nullable().optional(),
    rationale: z.string().max(2000).nullable().optional(),
  }),
});

/** The starting build for a company, with every default already sourced. */
export const GET = route(async (ctx, req) => {
  const ticker = searchParams(req).get('ticker');
  const modelId = searchParams(req).get('modelId');
  if (!ticker) {
    const err = new Error('A ticker is required.') as Error & { status?: number };
    err.status = 400;
    throw err;
  }
  const context = await getWaccBuildContext(ctx.workspaceId, ticker, modelId);
  if (!context) {
    const err = new Error('Company not found.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  const { result } = runWaccBuild(context.saved ?? context.suggested, null);
  return { context, result };
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  const context = await getWaccBuildContext(ctx.workspaceId, body.ticker, body.modelId);
  if (!context) {
    const err = new Error('Company not found.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const input = body.build as unknown as WaccBuildInput;
  const { result, diff } = runWaccBuild(input, context.saved);

  if (body.save) {
    if (!ctx.can('valuation:write')) {
      const err = new Error('Your role does not allow saving a valuation model.') as Error & { status?: number };
      err.status = 403;
      throw err;
    }
    if (!body.modelId) {
      const err = new Error('Saving a WACC build needs a model to save it onto.') as Error & { status?: number };
      err.status = 400;
      throw err;
    }
    const model = await prisma.valuationModel.findFirst({
      where: { id: body.modelId, workspaceId: ctx.workspaceId },
      include: { company: true },
    });
    if (!model) {
      const err = new Error('Model not found in this workspace.') as Error & { status?: number };
      err.status = 404;
      throw err;
    }

    await prisma.valuationModel.update({
      where: { id: model.id },
      data: { waccBuild: JSON.stringify(input) },
    });

    // Each component of the build is a sourced input in its own right.
    const rows: { path: string; label: string; reference: string; asOf: string | null; value: number | null }[] = [
      { path: 'wacc.riskFree', label: 'Risk-free rate', reference: input.riskFree.source, asOf: input.riskFree.asOf, value: input.riskFree.value },
      { path: 'wacc.equityRiskPremium', label: 'Equity risk premium', reference: input.equityRiskPremium.source, asOf: input.equityRiskPremium.asOf, value: input.equityRiskPremium.value },
      ...(input.countryRiskPremium ? [{ path: 'wacc.countryRiskPremium', label: 'Country risk premium', reference: input.countryRiskPremium.source, asOf: input.countryRiskPremium.asOf, value: input.countryRiskPremium.value }] : []),
      { path: 'wacc.beta', label: 'Beta', reference: result.components.find((c) => c.key === 'beta')?.source ?? '', asOf: input.observedBeta?.asOf ?? null, value: result.beta.used },
      { path: 'wacc.costOfDebt', label: 'Cost of debt', reference: input.costOfDebt.source, asOf: input.costOfDebt.asOf, value: input.costOfDebt.value },
      { path: 'wacc.taxRate', label: 'Tax rate', reference: input.taxRate.source, asOf: input.taxRate.asOf, value: input.taxRate.value },
      { path: 'wacc.marketValueEquity', label: 'Market value of equity', reference: input.marketValueEquity.source, asOf: input.marketValueEquity.asOf, value: input.marketValueEquity.value },
      { path: 'wacc.debt', label: 'Debt', reference: input.debt.source, asOf: input.debt.asOf, value: input.debt.value },
    ];

    for (const r of rows) {
      if (!r.reference.trim()) continue;
      const kind = r.reference.toLowerCase().includes('mock')
        ? 'MOCK'
        : r.reference.toLowerCase().includes('market price')
          ? 'MARKET'
          : r.reference.toLowerCase().includes('implied') || r.reference.toLowerCase().includes('regression')
            ? 'DERIVED'
            : 'MANUAL';
      await prisma.inputSource.upsert({
        where: { modelId_path: { modelId: model.id, path: r.path } },
        create: {
          workspaceId: ctx.workspaceId, modelId: model.id, path: r.path, label: r.label,
          kind, reference: r.reference,
          asOf: r.asOf ? new Date(`${r.asOf}T00:00:00.000Z`) : null,
          value: r.value, verifiedBy: ctx.name, verifiedAt: new Date(),
        },
        update: {
          label: r.label, kind, reference: r.reference,
          asOf: r.asOf ? new Date(`${r.asOf}T00:00:00.000Z`) : null,
          value: r.value, verifiedBy: ctx.name, verifiedAt: new Date(),
        },
      });
    }

    const delta = diff.waccDelta;
    await recordAudit({
      workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
      action: 'UPDATE', entityType: 'ValuationModel', entityId: model.id, entityLabel: model.name,
      field: 'wacc',
      previousValue: diff.rows.find((r) => r.key === 'wacc')?.from?.toString() ?? null,
      newValue: result.wacc?.toString() ?? null,
      summary: delta === null
        ? `WACC build saved on "${model.name}" at ${((result.wacc ?? 0) * 100).toFixed(2)}%.`
        : `WACC on "${model.name}" moved to ${((result.wacc ?? 0) * 100).toFixed(2)}% (${delta >= 0 ? '+' : ''}${(delta * 10_000).toFixed(0)} bps)${input.rationale ? ` — ${input.rationale}` : ''}.`,
    });
  }

  return { result, diff, saved: !!body.save };
});
