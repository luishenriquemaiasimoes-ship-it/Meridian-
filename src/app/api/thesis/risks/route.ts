import { z } from 'zod';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleError, parseBody, route, searchParams } from '@/server/http';
import { requireContext } from '@/server/context';
import { assertCan } from '@/lib/auth/rbac';
import { recordAudit } from '@/server/services/audit';

const schema = z.object({
  companyId: z.string().min(1),
  thesisId: z.string().nullable().optional(),
  title: z.string().min(3).max(200),
  category: z.enum(['OPERATIONAL', 'FINANCIAL', 'REGULATORY', 'MACRO', 'COMPETITIVE', 'VALUATION', 'GOVERNANCE']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  probability: z.number().min(0).max(1),
  mitigation: z.string().max(1000).nullable().optional(),
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  const company = await prisma.company.findUnique({ where: { id: body.companyId } });
  if (!company) {
    const err = new Error('Company not found.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  const created = await prisma.riskItem.create({
    data: {
      companyId: body.companyId, thesisId: body.thesisId ?? null,
      title: body.title, category: body.category, severity: body.severity,
      probability: body.probability, mitigation: body.mitigation ?? null,
    },
  });
  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'CREATE', entityType: 'RiskItem', entityId: created.id,
    entityLabel: `${company.ticker} — ${body.title}`,
    summary: `Risk recorded against ${company.ticker}: ${body.title} (${body.severity.toLowerCase()} severity).`,
  });
  return { risk: { id: created.id } };
}, 'thesis:write');

export async function DELETE(req: Request) {
  try {
    const ctx = await requireContext();
    assertCan(ctx.role, 'thesis:write');
    const id = searchParams(req).get('id');
    if (!id) return NextResponse.json({ error: 'An id is required.' }, { status: 400 });
    const existing = await prisma.riskItem.findFirst({
      where: { id, thesis: { workspaceId: ctx.workspaceId } },
      include: { company: true },
    });
    if (!existing) return NextResponse.json({ error: 'Risk not found in this workspace.' }, { status: 404 });
    await prisma.riskItem.delete({ where: { id } });
    await recordAudit({
      workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
      action: 'DELETE', entityType: 'RiskItem', entityId: id,
      entityLabel: `${existing.company.ticker} — ${existing.title}`,
      summary: `Risk removed from ${existing.company.ticker}: ${existing.title}.`,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
