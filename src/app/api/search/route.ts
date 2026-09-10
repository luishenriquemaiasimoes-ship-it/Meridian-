import { route, searchParams } from '@/server/http';
import { globalSearch } from '@/server/services/search';

export const GET = route(async (ctx, req) => {
  const q = searchParams(req).get('q') ?? '';
  const limit = Number(searchParams(req).get('limit') ?? 25);
  const hits = await globalSearch(ctx.workspaceId, q, Number.isFinite(limit) ? limit : 25);
  return { query: q, hits };
});
