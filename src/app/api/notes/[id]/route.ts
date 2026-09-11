import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';

const sectionSchema = z.object({
  key: z.string().min(1).max(60),
  title: z.string().min(1).max(160),
  body: z.string().max(20000),
});

const patchSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  recommendation: z.enum(['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL']).nullable().optional(),
  targetPrice: z.number().nullable().optional(),
  conviction: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).nullable().optional(),
  sections: z.array(sectionSchema).min(1).max(20).optional(),
  tags: z.array(z.string().max(40)).max(12).optional(),
});

function idFrom(req: Request): string {
  const parts = new URL(req.url).pathname.split('/');
  return parts[parts.length - 1];
}

async function loadOwned(workspaceId: string, id: string) {
  const note = await prisma.researchNote.findFirst({ where: { id, workspaceId } });
  if (!note) {
    const err = new Error('Note not found in this workspace.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  return note;
}

export const PATCH = route(async (ctx, req) => {
  const existing = await loadOwned(ctx.workspaceId, idFrom(req));
  const body = await parseBody(req, patchSchema);

  const sectionsJson = body.sections ? JSON.stringify(body.sections) : existing.sections;
  const contentChanged = sectionsJson !== existing.sections || (body.title !== undefined && body.title !== existing.title);

  const note = await prisma.researchNote.update({
    where: { id: existing.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.recommendation !== undefined ? { recommendation: body.recommendation } : {}),
      ...(body.targetPrice !== undefined ? { targetPrice: body.targetPrice } : {}),
      ...(body.conviction !== undefined ? { conviction: body.conviction } : {}),
      ...(body.sections !== undefined ? { sections: sectionsJson } : {}),
      ...(body.tags !== undefined ? { tags: JSON.stringify(body.tags) } : {}),
    },
  });

  // A new version is written only when the text itself changed, so the history
  // records edits rather than status toggles.
  let version: number | null = null;
  if (contentChanged) {
    const last = await prisma.researchNoteVersion.findFirst({
      where: { noteId: note.id }, orderBy: { version: 'desc' },
    });
    version = (last?.version ?? 0) + 1;
    await prisma.researchNoteVersion.create({
      data: { noteId: note.id, version, sections: note.sections, title: note.title, authorName: ctx.name },
    });
  }

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'UPDATE', entityType: 'ResearchNote', entityId: note.id, entityLabel: note.title,
    summary: version
      ? `Edited research note "${note.title}" (version ${version}).`
      : `Updated research note "${note.title}" (${Object.keys(body).join(', ')}).`,
  });

  return { note: { id: note.id, title: note.title, status: note.status, updatedAt: note.updatedAt.toISOString() }, version };
}, 'note:write');

export const DELETE = route(async (ctx, req) => {
  const existing = await loadOwned(ctx.workspaceId, idFrom(req));
  await prisma.researchNote.delete({ where: { id: existing.id } });
  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'DELETE', entityType: 'ResearchNote', entityId: existing.id, entityLabel: existing.title,
    summary: `Deleted research note "${existing.title}".`,
  });
  return { deleted: true };
}, 'note:write');
