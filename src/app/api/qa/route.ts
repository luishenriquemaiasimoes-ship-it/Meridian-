import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route, searchParams } from '@/server/http';
import { generateQuestions, getQaPrep } from '@/server/services/qa';
import { recordAudit } from '@/server/services/audit';

export const GET = route(async (ctx, req) => {
  const ticker = searchParams(req).get('ticker');
  if (!ticker) {
    const err = new Error('A ticker is required.') as Error & { status?: number };
    err.status = 400;
    throw err;
  }
  const prep = await getQaPrep(ctx.workspaceId, ticker);
  if (!prep) {
    const err = new Error('Company not found.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  return prep;
});

const generateSchema = z.object({
  ticker: z.string().min(1).max(12),
  /** Replace the stored set rather than adding to it. */
  replace: z.boolean().optional(),
});

/** Runs the generator and stores what it produced against the company. */
export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, generateSchema);
  const company = await prisma.company.findUnique({ where: { ticker: body.ticker.toUpperCase() } });
  if (!company) {
    const err = new Error(`No company with ticker ${body.ticker.toUpperCase()}.`) as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const generated = await generateQuestions(ctx.workspaceId, company.ticker);

  if (body.replace) {
    // Only the untouched ones: a question the analyst has worked on is theirs.
    await prisma.qaItem.deleteMany({
      where: { workspaceId: ctx.workspaceId, companyId: company.id, status: 'PENDING' },
    });
  }

  const existing = await prisma.qaItem.findMany({
    where: { workspaceId: ctx.workspaceId, companyId: company.id },
    select: { question: true },
  });
  const seen = new Set(existing.map((q) => q.question));

  const fresh = generated.filter((q) => !seen.has(q.question));
  if (fresh.length) {
    await prisma.qaItem.createMany({
      data: fresh.map((q) => ({
        workspaceId: ctx.workspaceId,
        companyId: company.id,
        theme: q.theme,
        question: q.question,
        draftAnswer: q.draftAnswer,
        citations: JSON.stringify(q.citations),
        hasGap: q.hasGap,
        notes: q.gap ?? null,
        createdBy: ctx.name,
      })),
    });
  }

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'CREATE', entityType: 'QaItem', entityId: null, entityLabel: company.ticker,
    summary: `Generated ${fresh.length} committee questions for ${company.ticker}; ${generated.filter((q) => q.hasGap).length} could not be answered from the workspace.`,
  });

  return { added: fresh.length, generated: generated.length, gaps: generated.filter((q) => q.hasGap).length };
}, 'research:write');

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['PENDING', 'PREPARED', 'NEEDS_WORK']).optional(),
  draftAnswer: z.string().max(8000).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export const PATCH = route(async (ctx, req) => {
  const body = await parseBody(req, patchSchema);
  const item = await prisma.qaItem.findFirst({ where: { id: body.id, workspaceId: ctx.workspaceId } });
  if (!item) {
    const err = new Error('Question not found in this workspace.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  const updated = await prisma.qaItem.update({
    where: { id: item.id },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.draftAnswer !== undefined ? { draftAnswer: body.draftAnswer } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
    },
  });
  return { item: { id: updated.id, status: updated.status } };
}, 'research:write');

export const DELETE = route(async (ctx, req) => {
  const id = searchParams(req).get('id');
  if (!id) {
    const err = new Error('An id is required.') as Error & { status?: number };
    err.status = 400;
    throw err;
  }
  const item = await prisma.qaItem.findFirst({ where: { id, workspaceId: ctx.workspaceId } });
  if (!item) {
    const err = new Error('Question not found in this workspace.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  await prisma.qaItem.delete({ where: { id: item.id } });
  return { deleted: true };
}, 'research:write');
