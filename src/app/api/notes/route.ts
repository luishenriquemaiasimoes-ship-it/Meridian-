import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';

const sectionSchema = z.object({
  key: z.string().min(1).max(60),
  title: z.string().min(1).max(160),
  body: z.string().max(20000),
});

const createSchema = z.object({
  title: z.string().min(3, 'Give the note a title.').max(200),
  ticker: z.string().max(12).nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  recommendation: z.enum(['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL']).nullable().optional(),
  targetPrice: z.number().nullable().optional(),
  conviction: z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']).nullable().optional(),
  sections: z.array(sectionSchema).min(1, 'A note needs at least one section.').max(20),
  tags: z.array(z.string().max(40)).max(12).optional(),
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, createSchema);

  let companyId: string | null = null;
  if (body.ticker) {
    const company = await prisma.company.findUnique({ where: { ticker: body.ticker.toUpperCase() } });
    if (!company) {
      const err = new Error(`No company with ticker ${body.ticker.toUpperCase()}.`) as Error & { status?: number };
      err.status = 404;
      throw err;
    }
    companyId = company.id;
  }

  const note = await prisma.researchNote.create({
    data: {
      workspaceId: ctx.workspaceId,
      companyId,
      authorId: ctx.userId,
      title: body.title,
      status: body.status ?? 'DRAFT',
      recommendation: body.recommendation ?? null,
      targetPrice: body.targetPrice ?? null,
      conviction: body.conviction ?? null,
      sections: JSON.stringify(body.sections),
      tags: JSON.stringify(body.tags ?? []),
    },
  });

  await prisma.researchNoteVersion.create({
    data: {
      noteId: note.id, version: 1, sections: note.sections,
      title: note.title, authorName: ctx.name,
    },
  });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'CREATE', entityType: 'ResearchNote', entityId: note.id, entityLabel: note.title,
    summary: `Created research note "${note.title}".`,
  });

  return { note: { id: note.id, title: note.title, status: note.status } };
}, 'note:write');
