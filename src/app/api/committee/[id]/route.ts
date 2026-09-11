import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route } from '@/server/http';
import { recordAudit } from '@/server/services/audit';

const patchSchema = z.object({
  vote: z.enum(['APPROVE', 'REJECT', 'ABSTAIN']).optional(),
  rationale: z.string().max(2000).nullable().optional(),
  comment: z.string().min(1).max(4000).optional(),
  status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED']).optional(),
  meetingDate: z.string().max(10).nullable().optional(),
});

function idFrom(req: Request): string {
  const parts = new URL(req.url).pathname.split('/');
  return parts[parts.length - 1];
}

export const PATCH = route(async (ctx, req) => {
  const id = idFrom(req);
  const item = await prisma.committeeItem.findFirst({
    where: { id, workspaceId: ctx.workspaceId }, include: { company: true },
  });
  if (!item) {
    const err = new Error('Committee item not found in this workspace.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  const body = await parseBody(req, patchSchema);
  const done: string[] = [];

  if (body.vote) {
    if (!ctx.can('committee:vote')) {
      const err = new Error('Your role does not allow voting on committee items.') as Error & { status?: number };
      err.status = 403;
      throw err;
    }
    await prisma.committeeVote.upsert({
      where: { itemId_userId: { itemId: item.id, userId: ctx.userId } },
      create: { itemId: item.id, userId: ctx.userId, vote: body.vote, rationale: body.rationale ?? null },
      update: { vote: body.vote, rationale: body.rationale ?? null },
    });
    done.push(`voted ${body.vote.toLowerCase()}`);
  }

  if (body.comment) {
    await prisma.committeeComment.create({
      data: { itemId: item.id, userId: ctx.userId, body: body.comment },
    });
    done.push('left a comment');
  }

  if (body.status !== undefined || body.meetingDate !== undefined) {
    // Approving or rejecting is a portfolio-manager decision; scheduling is not.
    if ((body.status === 'APPROVED' || body.status === 'REJECTED') && !ctx.can('committee:decide')) {
      const err = new Error('Only a portfolio manager can close a committee item.') as Error & { status?: number };
      err.status = 403;
      throw err;
    }
    await prisma.committeeItem.update({
      where: { id: item.id },
      data: {
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.meetingDate !== undefined
          ? { meetingDate: body.meetingDate ? new Date(`${body.meetingDate}T00:00:00.000Z`) : null }
          : {}),
      },
    });
    if (body.status !== undefined) done.push(`moved to ${body.status.replace('_', ' ').toLowerCase()}`);
    if (body.meetingDate !== undefined) done.push('rescheduled');
  }

  if (!done.length) {
    const err = new Error('Nothing to do: send a vote, a comment or a status.') as Error & { status?: number };
    err.status = 400;
    throw err;
  }

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'UPDATE', entityType: 'CommitteeItem', entityId: item.id, entityLabel: item.title,
    field: body.status !== undefined ? 'status' : body.vote ? 'vote' : null,
    previousValue: body.status !== undefined ? item.status : null,
    newValue: body.status ?? body.vote ?? null,
    summary: `${ctx.name} ${done.join(' and ')} on "${item.title}".`,
  });

  const votes = await prisma.committeeVote.findMany({ where: { itemId: item.id } });
  return {
    ok: true,
    tally: {
      approve: votes.filter((v) => v.vote === 'APPROVE').length,
      reject: votes.filter((v) => v.vote === 'REJECT').length,
      abstain: votes.filter((v) => v.vote === 'ABSTAIN').length,
    },
  };
});
