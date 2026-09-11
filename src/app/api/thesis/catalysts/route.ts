import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route, searchParams } from '@/server/http';
import { recordAudit } from '@/server/services/audit';
import { NextResponse } from 'next/server';
import { requireContext } from '@/server/context';
import { assertCan } from '@/lib/auth/rbac';
import { handleError } from '@/server/http';

const schema = z.object({
  companyId: z.string().min(1),
  thesisId: z.string().nullable().optional(),
  title: z.string().min(3).max(200),
  kind: z.enum(['EARNINGS', 'INVESTOR_DAY', 'DIVIDEND', 'M_AND_A', 'REGULATORY', 'CONTRACT', 'PRODUCT', 'MACRO', 'CAPITAL_ALLOCATION']),
  expectedDate: z.string().nullable().optional(),
  expectedImpact: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  direction: z.enum(['POSITIVE', 'NEGATIVE', 'UNCERTAIN']),
  probability: z.number().min(0).max(1),
  status: z.enum(['PENDING', 'CONFIRMED', 'OCCURRED', 'CANCELLED']).default('PENDING'),
  notes: z.string().max(1000).nullable().optional(),
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  const company = await prisma.company.findUnique({ where: { id: body.companyId } });
  if (!company) {
    const err = new Error('Company not found.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  const created = await prisma.catalyst.create({
    data: {
      companyId: body.companyId,
      thesisId: body.thesisId ?? null,
      title: body.title, kind: body.kind,
      expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
      expectedImpact: body.expectedImpact, direction: body.direction,
      probability: body.probability, status: body.status, notes: body.notes ?? null,
    },
  });
  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'CREATE', entityType: 'Catalyst', entityId: created.id,
    entityLabel: `${company.ticker} — ${body.title}`,
    summary: `Catalyst added for ${company.ticker}: ${body.title} (${body.expectedImpact.toLowerCase()} impact, ${Math.round(body.probability * 100)}% probability).`,
  });
  return { catalyst: { id: created.id } };
}, 'thesis:write');

export async function DELETE(req: Request) {
  try {
    const ctx = await requireContext();
    assertCan(ctx.role, 'thesis:write');
    const id = searchParams(req).get('id');
    if (!id) return NextResponse.json({ error: 'An id is required.' }, { status: 400 });
    const existing = await prisma.catalyst.findFirst({
      where: { id, thesis: { workspaceId: ctx.workspaceId } },
      include: { company: true },
    });
    if (!existing) return NextResponse.json({ error: 'Catalyst not found in this workspace.' }, { status: 404 });
    await prisma.catalyst.delete({ where: { id } });
    await recordAudit({
      workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
      action: 'DELETE', entityType: 'Catalyst', entityId: id,
      entityLabel: `${existing.company.ticker} — ${existing.title}`,
      summary: `Catalyst removed from ${existing.company.ticker}: ${existing.title}.`,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
