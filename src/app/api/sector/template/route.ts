import { z } from 'zod';
import { prisma, parseJson } from '@/lib/db';
import { parseBody, route, searchParams } from '@/server/http';
import { recordAudit } from '@/server/services/audit';

/* A template is a row set someone found worth keeping. The product never
   writes one: it only stores what an analyst assembled while covering a
   sector, which is why nothing ships pre-loaded. */

const rowSchema = z.object({
  key: z.string().min(1).max(60),
  label: z.string().max(120),
  kind: z.enum(['METRIC', 'MANUAL']),
  metric: z.string().max(60).nullable().optional(),
  format: z.enum(['percent', 'multiple', 'currency', 'currencyMillions', 'number', 'text']),
  inverse: z.boolean().optional(),
  note: z.string().max(500).nullable().optional(),
});

const schema = z.object({
  name: z.string().min(1).max(80),
  sector: z.string().max(80).nullable().optional(),
  rows: z.array(rowSchema).min(1).max(60),
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  // Per-ticker values belong to the analysis, not to the template: a saved
  // row set is a question, not an answer about particular companies.
  const rows = body.rows.map((r) => ({ ...r, values: undefined }));

  const data = {
    sector: body.sector ?? null,
    rows: JSON.stringify(rows),
    authorName: ctx.name,
  };

  const saved = await prisma.peerComparisonTemplate.upsert({
    where: { workspaceId_name: { workspaceId: ctx.workspaceId, name: body.name } },
    create: { workspaceId: ctx.workspaceId, name: body.name, ...data },
    update: data,
  });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'UPDATE', entityType: 'PeerComparisonTemplate', entityId: saved.id, entityLabel: saved.name,
    summary: `Saved the peer comparison template "${saved.name}" with ${rows.length} rows${saved.sector ? ` for ${saved.sector}` : ''}.`,
  });

  return {
    template: {
      id: saved.id,
      name: saved.name,
      sector: saved.sector,
      rows: parseJson(saved.rows, []),
      authorName: saved.authorName,
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
  const existing = await prisma.peerComparisonTemplate.findFirst({ where: { id, workspaceId: ctx.workspaceId } });
  if (!existing) {
    const err = new Error('That template is not in this workspace.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  await prisma.peerComparisonTemplate.delete({ where: { id: existing.id } });
  return { deleted: true };
}, 'research:write');
