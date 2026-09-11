import { z } from 'zod';
import { NextResponse } from 'next/server';
import { prisma, parseJson } from '@/lib/db';
import { handleError, parseBody, route, searchParams } from '@/server/http';
import { requireContext } from '@/server/context';
import { assertCan } from '@/lib/auth/rbac';
import { recordAudit } from '@/server/services/audit';

export const GET = route(async (ctx) => {
  const rows = await prisma.savedScreen.findMany({
    where: { workspaceId: ctx.workspaceId }, orderBy: { updatedAt: 'desc' },
  });
  return {
    screens: rows.map((s) => ({
      id: s.id, name: s.name,
      filters: parseJson<unknown[]>(s.filters, []),
      sortBy: s.sortBy, createdBy: s.createdBy,
      updatedAt: s.updatedAt.toISOString(),
    })),
  };
});

const schema = z.object({
  id: z.string().nullable().optional(),
  name: z.string().min(1).max(80),
  filters: z.array(z.record(z.string(), z.unknown())).max(15),
  sortBy: z.string().nullable().optional(),
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  const data = {
    workspaceId: ctx.workspaceId, name: body.name,
    filters: JSON.stringify(body.filters), sortBy: body.sortBy ?? null,
    createdBy: ctx.name,
  };
  const saved = body.id
    ? await prisma.savedScreen.update({ where: { id: body.id }, data })
    : await prisma.savedScreen.create({ data });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: body.id ? 'UPDATE' : 'CREATE', entityType: 'SavedScreen',
    entityId: saved.id, entityLabel: body.name,
    summary: `Screen "${body.name}" saved with ${body.filters.length} filter${body.filters.length === 1 ? '' : 's'}.`,
  });
  return { screen: { id: saved.id } };
}, 'screen:write');

export async function DELETE(req: Request) {
  try {
    const ctx = await requireContext();
    assertCan(ctx.role, 'screen:write');
    const id = searchParams(req).get('id');
    if (!id) return NextResponse.json({ error: 'An id is required.' }, { status: 400 });
    const existing = await prisma.savedScreen.findFirst({ where: { id, workspaceId: ctx.workspaceId } });
    if (!existing) return NextResponse.json({ error: 'Screen not found.' }, { status: 404 });
    await prisma.savedScreen.delete({ where: { id } });
    await recordAudit({
      workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
      action: 'DELETE', entityType: 'SavedScreen', entityId: id, entityLabel: existing.name,
      summary: `Screen "${existing.name}" deleted.`,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
