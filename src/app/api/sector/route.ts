import { z } from 'zod';
import { prisma, parseJson } from '@/lib/db';
import { parseBody, route, searchParams } from '@/server/http';
import { resolveComparison } from '@/server/services/sector';
import type { PeerComparisonRow } from '@/lib/research/types';
import { recordAudit } from '@/server/services/audit';

const rowSchema = z.object({
  key: z.string().min(1).max(60),
  label: z.string().max(120),
  kind: z.enum(['METRIC', 'MANUAL']),
  metric: z.string().max(60).nullable().optional(),
  format: z.enum(['percent', 'multiple', 'currency', 'currencyMillions', 'number', 'text']),
  inverse: z.boolean().optional(),
  values: z.record(z.string(), z.union([z.string().max(200), z.number(), z.null()])).optional(),
  note: z.string().max(500).nullable().optional(),
});

const sectionSchema = z.object({
  key: z.string().min(1).max(60),
  title: z.string().min(1).max(160),
  body: z.string().max(20000),
});

const analysisSchema = z.object({
  id: z.string().min(1).optional(),
  sector: z.string().min(1).max(80),
  title: z.string().min(1).max(200),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  sections: z.array(sectionSchema).max(24),
  tickers: z.array(z.string().min(1).max(12)).max(20),
  rows: z.array(rowSchema).max(60),
});

/** Resolves a comparison without saving it, so the table moves as rows are picked. */
export const POST = route(async (ctx, req) => {
  const url = searchParams(req);

  if (url.get('preview') === '1') {
    const body = await parseBody(req, z.object({
      rows: z.array(rowSchema).max(60),
      tickers: z.array(z.string().min(1).max(12)).max(20),
    }));
    const comparison = await resolveComparison(
      body.rows as PeerComparisonRow[],
      body.tickers.map((t) => t.toUpperCase()),
    );
    return { comparison };
  }

  const body = await parseBody(req, analysisSchema);
  const tickers = body.tickers.map((t) => t.toUpperCase());

  const data = {
    sector: body.sector,
    title: body.title,
    status: body.status ?? 'DRAFT',
    sections: JSON.stringify(body.sections),
    tickers: JSON.stringify(tickers),
    rows: JSON.stringify(body.rows),
    authorName: ctx.name,
  };

  const existing = body.id
    ? await prisma.sectorAnalysis.findFirst({ where: { id: body.id, workspaceId: ctx.workspaceId } })
    : null;

  if (body.id && !existing) {
    const err = new Error('That sector analysis is not in this workspace.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const saved = existing
    ? await prisma.sectorAnalysis.update({ where: { id: existing.id }, data })
    : await prisma.sectorAnalysis.create({ data: { workspaceId: ctx.workspaceId, ...data } });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: existing ? 'UPDATE' : 'CREATE',
    entityType: 'SectorAnalysis', entityId: saved.id, entityLabel: saved.title,
    summary: `${existing ? 'Updated' : 'Created'} the ${saved.sector} sector analysis: ${tickers.length} companies compared on ${body.rows.length} rows, ${body.sections.length} written sections.`,
  });

  return {
    analysis: {
      id: saved.id,
      sector: saved.sector,
      title: saved.title,
      status: saved.status,
      sections: parseJson(saved.sections, []),
      tickers: parseJson(saved.tickers, []),
      rows: parseJson(saved.rows, []),
      authorName: saved.authorName,
      createdAt: saved.createdAt.toISOString(),
      updatedAt: saved.updatedAt.toISOString(),
    },
  };
}, 'research:write');

export const DELETE = route(async (ctx, req) => {
  const id = searchParams(req).get('id');
  if (!id) {
    const err = new Error('An id is required.') as Error & { status?: number };
    err.status = 400;
    throw err;
  }
  const existing = await prisma.sectorAnalysis.findFirst({ where: { id, workspaceId: ctx.workspaceId } });
  if (!existing) {
    const err = new Error('That sector analysis is not in this workspace.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  await prisma.sectorAnalysis.delete({ where: { id: existing.id } });
  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'DELETE', entityType: 'SectorAnalysis', entityId: null, entityLabel: existing.title,
    summary: `Deleted the ${existing.sector} sector analysis "${existing.title}".`,
  });
  return { deleted: true };
}, 'research:write');
