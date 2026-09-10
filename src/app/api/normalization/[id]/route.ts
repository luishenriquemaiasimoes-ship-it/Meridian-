import { prisma } from '@/lib/db';
import { fail, handleError } from '@/server/http';
import { requireContext } from '@/server/context';
import { assertCan } from '@/lib/auth/rbac';
import { recordAudit } from '@/server/services/audit';
import { NextResponse } from 'next/server';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await requireContext();
    assertCan(ctx.role, 'valuation:write');
    const { id } = await params;

    const existing = await prisma.normalizationAdjustment.findFirst({
      where: { id, workspaceId: ctx.workspaceId },
      include: { company: true },
    });
    if (!existing) return fail(404, 'Adjustment not found in this workspace.');

    await prisma.normalizationAdjustment.delete({ where: { id } });
    await recordAudit({
      workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
      action: 'DELETE', entityType: 'NormalizationAdjustment', entityId: id,
      entityLabel: `${existing.company.ticker} ${existing.periodLabel} ${existing.lineItem}`,
      previousValue: String(existing.amount), newValue: null,
      summary: `Normalization adjustment of ${existing.amount} removed from ${existing.company.ticker} ${existing.periodLabel}.`,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
