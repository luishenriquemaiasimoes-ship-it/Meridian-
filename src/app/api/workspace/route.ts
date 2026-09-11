import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';
import { invalidateAll } from '@/server/cache';

const createSchema = z.object({
  name: z.string().min(2, 'Give the workspace a name.').max(80),
  kind: z.enum(['PERSONAL', 'RESEARCH', 'PORTFOLIO', 'TEAM']),
  market: z.enum(['BRAZIL', 'US', 'GLOBAL']),
  baseCurrency: z.enum(['BRL', 'USD', 'EUR', 'GBP']),
});

const updateSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(2).max(80).optional(),
  kind: z.enum(['PERSONAL', 'RESEARCH', 'PORTFOLIO', 'TEAM']).optional(),
  market: z.enum(['BRAZIL', 'US', 'GLOBAL']).optional(),
  baseCurrency: z.enum(['BRL', 'USD', 'EUR', 'GBP']).optional(),
  riskFreeRate: z.number().min(0).max(0.5).optional(),
  equityRiskPremium: z.number().min(0).max(0.3).optional(),
  statutoryTaxRate: z.number().min(0).max(0.7).optional(),
  benchmarkCode: z.string().max(12).nullable().optional(),
});

function slugify(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'workspace';
}

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, createSchema);
  let slug = slugify(body.name);
  const taken = await prisma.workspace.findMany({
    where: { organizationId: ctx.organizationId, slug: { startsWith: slug } }, select: { slug: true },
  });
  if (taken.some((w) => w.slug === slug)) slug = `${slug}-${taken.length + 1}`;

  const workspace = await prisma.workspace.create({
    data: {
      organizationId: ctx.organizationId,
      name: body.name,
      slug,
      kind: body.kind,
      market: body.market,
      baseCurrency: body.baseCurrency,
    },
  });

  await recordAudit({
    workspaceId: workspace.id, userId: ctx.userId, actorName: ctx.name,
    action: 'CREATE', entityType: 'Workspace', entityId: workspace.id, entityLabel: workspace.name,
    summary: `Created workspace "${workspace.name}" (${body.kind.toLowerCase()}, ${body.baseCurrency}).`,
  });

  invalidateAll();
  return { workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug } };
}, 'workspace:manage');

export const PATCH = route(async (ctx, req) => {
  const body = await parseBody(req, updateSchema);
  const existing = await prisma.workspace.findFirst({
    where: { id: body.workspaceId, organizationId: ctx.organizationId },
  });
  if (!existing) {
    const err = new Error('Workspace not found in this organisation.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  let benchmarkId: string | null | undefined;
  if (body.benchmarkCode !== undefined) {
    if (body.benchmarkCode) {
      const bench = await prisma.benchmark.findUnique({ where: { code: body.benchmarkCode } });
      if (!bench) {
        const err = new Error(`No benchmark with code ${body.benchmarkCode}.`) as Error & { status?: number };
        err.status = 404;
        throw err;
      }
      benchmarkId = bench.id;
    } else {
      benchmarkId = null;
    }
  }

  const workspace = await prisma.workspace.update({
    where: { id: existing.id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.kind !== undefined ? { kind: body.kind } : {}),
      ...(body.market !== undefined ? { market: body.market } : {}),
      ...(body.baseCurrency !== undefined ? { baseCurrency: body.baseCurrency } : {}),
      ...(body.riskFreeRate !== undefined ? { riskFreeRate: body.riskFreeRate } : {}),
      ...(body.equityRiskPremium !== undefined ? { equityRiskPremium: body.equityRiskPremium } : {}),
      ...(body.statutoryTaxRate !== undefined ? { statutoryTaxRate: body.statutoryTaxRate } : {}),
      ...(benchmarkId !== undefined ? { benchmarkId } : {}),
    },
  });

  // The cost of capital and the tax rate feed every model in the workspace, so
  // the cached metric set has to be dropped when they change.
  invalidateAll();

  await recordAudit({
    workspaceId: workspace.id, userId: ctx.userId, actorName: ctx.name,
    action: 'UPDATE', entityType: 'Workspace', entityId: workspace.id, entityLabel: workspace.name,
    summary: `Updated workspace settings (${Object.keys(body).filter((k) => k !== 'workspaceId').join(', ')}).`,
  });

  return { workspace: { id: workspace.id, name: workspace.name } };
}, 'workspace:manage');
