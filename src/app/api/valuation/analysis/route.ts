import { route, searchParams } from '@/server/http';
import {
  buildProjectionContext, projectionReverse, projectionScenarios, projectionSensitivity,
} from '@/server/services/projection';

/**
 * Sensitivity, scenarios and the reverse solve — all three computed on the
 * same projection that produces the published value.
 *
 * They live behind one route because they answer one question between them:
 * how much of the published number is the model and how much is the
 * assumptions. Splitting them across three endpoints would mean three
 * projections built from three requests for one screen.
 */
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

  const input = context.saved ?? context.suggested;
  const wacc = input.wacc ?? 0.12;
  const price = input.currentPrice ?? null;

  // Steps either side of the build, not a fixed ladder: a 50 bp step means
  // something different at a 6% cost of capital than at 15%.
  const step = Math.max(0.0025, wacc * 0.06);
  const waccAxis = [-2, -1, 0, 1, 2].map((k) => wacc + k * step);
  const growthAxis = [-0.01, -0.005, 0, 0.005, 0.01].map((k) => 0.03 + k);

  return {
    ticker: context.ticker,
    currency: context.currency,
    currentPrice: price,
    sensitivity: projectionSensitivity(input, waccAxis, growthAxis),
    scenarios: projectionScenarios(input),
    reverse: price != null ? projectionReverse(input, price) : null,
  };
});
