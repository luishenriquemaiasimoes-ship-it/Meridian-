import { z } from 'zod';
import { parseBody, route } from '@/server/http';
import { completeOnboarding } from '@/server/services/onboarding';
import { invalidateAll } from '@/server/cache';

const schema = z.object({
  workspaceType: z.enum(['ASSET_MANAGEMENT', 'EQUITY_RESEARCH', 'FAMILY_OFFICE', 'INDEPENDENT']),
  market: z.enum(['BRAZIL', 'US', 'GLOBAL']),
  start: z.enum(['DEMO', 'EMPTY', 'IMPORT']),
  portfolioName: z.string().max(80).optional(),
  positions: z.array(z.object({
    ticker: z.string().min(1).max(12),
    quantity: z.number(),
    averagePrice: z.number(),
  })).max(500).optional(),
});

export const POST = route(async (ctx, req) => {
  const input = await parseBody(req, schema);
  const result = await completeOnboarding({
    userId: ctx.userId, userName: ctx.name,
    organizationId: ctx.organizationId, workspaceId: ctx.workspaceId,
    input,
  });
  invalidateAll();
  return { ...result, redirect: '/home' };
});
