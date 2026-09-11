import { z } from 'zod';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleError, parseBody, route, searchParams } from '@/server/http';
import { requireContext } from '@/server/context';
import { assertCan } from '@/lib/auth/rbac';
import { recordAudit } from '@/server/services/audit';
import { invalidateAll } from '@/server/cache';

const schema = z.object({
  portfolioId: z.string().min(1),
  ticker: z.string().min(1).max(12),
  quantity: z.number().refine((v) => v !== 0, 'Quantity cannot be zero.'),
  averagePrice: z.number().min(0),
  tradeDate: z.string().optional(),
  note: z.string().max(300).optional(),
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  const [portfolio, company] = await Promise.all([
    prisma.portfolio.findFirst({ where: { id: body.portfolioId, workspaceId: ctx.workspaceId } }),
    prisma.company.findUnique({ where: { ticker: body.ticker.toUpperCase() } }),
  ]);
  if (!portfolio) {
    const err = new Error('Portfolio not found in this workspace.') as Error & { status?: number };
    err.status = 404; throw err;
  }
  if (!company) {
    const err = new Error(`${body.ticker.toUpperCase()} is not in the company universe.`) as Error & { status?: number };
    err.status = 404; throw err;
  }

  const existing = await prisma.portfolioPosition.findUnique({
    where: { portfolioId_companyId: { portfolioId: portfolio.id, companyId: company.id } },
  });

  // Adding to a position blends the average price; reducing keeps it.
  const newQuantity = (existing?.quantity ?? 0) + body.quantity;
  if (newQuantity < 0) {
    const err = new Error('That trade would leave a negative position. MERIDIAN does not model short positions.') as Error & { status?: number };
    err.status = 422; throw err;
  }

  const blendedAverage = existing && body.quantity > 0 && newQuantity > 0
    ? (existing.quantity * existing.averagePrice + body.quantity * body.averagePrice) / newQuantity
    : existing && body.quantity < 0
      ? existing.averagePrice
      : body.averagePrice;

  if (newQuantity === 0) {
    await prisma.portfolioPosition.delete({ where: { id: existing!.id } });
  } else {
    await prisma.portfolioPosition.upsert({
      where: { portfolioId_companyId: { portfolioId: portfolio.id, companyId: company.id } },
      update: { quantity: newQuantity, averagePrice: blendedAverage },
      create: { portfolioId: portfolio.id, companyId: company.id, quantity: newQuantity, averagePrice: blendedAverage },
    });
  }

  await prisma.portfolioTransaction.create({
    data: {
      portfolioId: portfolio.id, companyId: company.id,
      kind: body.quantity > 0 ? 'BUY' : 'SELL',
      quantity: Math.abs(body.quantity), price: body.averagePrice,
      amount: -(body.quantity * body.averagePrice),
      tradeDate: body.tradeDate ? new Date(body.tradeDate) : new Date(),
      note: body.note ?? null, createdBy: ctx.name,
    },
  });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: existing ? 'UPDATE' : 'CREATE', entityType: 'PortfolioPosition',
    entityLabel: `${portfolio.name} — ${company.ticker}`,
    previousValue: existing ? String(existing.quantity) : null,
    newValue: String(newQuantity),
    summary: `${body.quantity > 0 ? 'Bought' : 'Sold'} ${Math.abs(body.quantity).toLocaleString('pt-BR')} ${company.ticker} at ${body.averagePrice} in ${portfolio.name}.`,
  });
  invalidateAll();
  return { position: { ticker: company.ticker, quantity: newQuantity, averagePrice: blendedAverage } };
}, 'portfolio:write');

export async function DELETE(req: Request) {
  try {
    const ctx = await requireContext();
    assertCan(ctx.role, 'portfolio:write');
    const id = searchParams(req).get('id');
    if (!id) return NextResponse.json({ error: 'An id is required.' }, { status: 400 });
    const existing = await prisma.portfolioPosition.findFirst({
      where: { id, portfolio: { workspaceId: ctx.workspaceId } },
      include: { company: true, portfolio: true },
    });
    if (!existing) return NextResponse.json({ error: 'Position not found.' }, { status: 404 });
    await prisma.portfolioPosition.delete({ where: { id } });
    await prisma.portfolioTransaction.create({
      data: {
        portfolioId: existing.portfolioId, companyId: existing.companyId, kind: 'SELL',
        quantity: existing.quantity, price: existing.averagePrice,
        amount: existing.quantity * existing.averagePrice, tradeDate: new Date(),
        note: 'Position closed.', createdBy: ctx.name,
      },
    });
    await recordAudit({
      workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
      action: 'DELETE', entityType: 'PortfolioPosition', entityId: id,
      entityLabel: `${existing.portfolio.name} — ${existing.company.ticker}`,
      summary: `Position in ${existing.company.ticker} closed in ${existing.portfolio.name}.`,
    });
    invalidateAll();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
