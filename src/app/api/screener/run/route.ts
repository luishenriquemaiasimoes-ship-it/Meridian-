import { z } from 'zod';
import { parseBody, route } from '@/server/http';
import { runScreen, SCREEN_METRICS, type ScreenMetric } from '@/server/services/screener';

const metricKeys = Object.keys(SCREEN_METRICS) as [ScreenMetric, ...ScreenMetric[]];

const schema = z.object({
  filters: z.array(z.object({
    metric: z.enum(metricKeys),
    comparator: z.enum(['GT', 'GTE', 'LT', 'LTE', 'EQ', 'BETWEEN']),
    value: z.number(),
    value2: z.number().optional(),
  })).max(15),
  sectors: z.array(z.string()).optional(),
  countries: z.array(z.string()).optional(),
  themes: z.array(z.string()).optional(),
  search: z.string().max(80).optional(),
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  limit: z.number().int().min(1).max(500).optional(),
});

export const POST = route(async (_ctx, req) => {
  const body = await parseBody(req, schema);
  const result = await runScreen({
    ...body,
    sortBy: body.sortBy as ScreenMetric | 'ticker' | 'name' | 'investmentScore' | undefined,
  });
  return {
    universeSize: result.universeSize,
    matched: result.matched,
    excludedForMissingData: result.excludedForMissingData,
    rows: result.rows.map((r) => ({
      ticker: r.metrics.ticker, name: r.metrics.name, sector: r.metrics.sector,
      country: r.metrics.country, currency: r.metrics.currency, bankLike: r.metrics.bankLike,
      investmentScore: r.investmentScore,
      factors: r.factorScores.map((f) => ({ factor: f.factor, label: f.label, score: f.score, coverage: f.coverage })),
      metrics: Object.fromEntries(
        (Object.keys(SCREEN_METRICS) as ScreenMetric[]).map((k) => [k, (r.metrics as unknown as Record<string, number | null>)[k] ?? null]),
      ),
    })),
  };
});
