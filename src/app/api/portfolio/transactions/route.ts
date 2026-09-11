import { z } from 'zod';
import { prisma } from '@/lib/db';
import { parseBody, route, searchParams } from '@/server/http';
import { recordAudit } from '@/server/services/audit';
import { invalidateAll } from '@/server/cache';

export const GET = route(async (ctx, req) => {
  const portfolioId = searchParams(req).get('portfolioId');
  const rows = await prisma.portfolioTransaction.findMany({
    where: { portfolio: { workspaceId: ctx.workspaceId }, ...(portfolioId ? { portfolioId } : {}) },
    orderBy: { tradeDate: 'desc' },
    include: { company: true, portfolio: true },
    take: 200,
  });
  return {
    transactions: rows.map((t) => ({
      id: t.id, portfolio: t.portfolio.name, ticker: t.company?.ticker ?? null,
      kind: t.kind, quantity: t.quantity, price: t.price, amount: t.amount, fees: t.fees,
      tradeDate: t.tradeDate.toISOString().slice(0, 10), note: t.note, createdBy: t.createdBy,
    })),
  };
});

const schema = z.object({
  portfolioId: z.string().min(1),
  kind: z.enum(['DEPOSIT', 'WITHDRAWAL', 'DIVIDEND', 'FEE']),
  amount: z.number(),
  tradeDate: z.string().optional(),
  note: z.string().max(300).optional(),
  ticker: z.string().max(12).optional(),
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  const portfolio = await prisma.portfolio.findFirst({
    where: { id: body.portfolioId, workspaceId: ctx.workspaceId },
  });
  if (!portfolio) {
    const err = new Error('Portfolio not found.') as Error & { status?: number };
    err.status = 404; throw err;
  }
  const company = body.ticker
    ? await prisma.company.findUnique({ where: { ticker: body.ticker.toUpperCase() } })
    : null;

  // Cash movements change the cash balance directly.
  const cashDelta =
    body.kind === 'WITHDRAWAL' || body.kind === 'FEE' ? -Math.abs(body.amount) : Math.abs(body.amount);
  await prisma.portfolio.update({
    where: { id: portfolio.id },
    data: { cash: Math.max(0, portfolio.cash + cashDelta) },
  });

  await prisma.portfolioTransaction.create({
    data: {
      portfolioId: portfolio.id, companyId: company?.id ?? null, kind: body.kind,
      amount: cashDelta, tradeDate: body.tradeDate ? new Date(body.tradeDate) : new Date(),
      note: body.note ?? null, createdBy: ctx.name,
    },
  });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'CREATE', entityType: 'PortfolioTransaction', entityLabel: portfolio.name,
    summary: `${body.kind.toLowerCase()} of ${Math.abs(body.amount).toLocaleString('pt-BR')} recorded in ${portfolio.name}.`,
  });
  invalidateAll();
  return { ok: true, cash: Math.max(0, portfolio.cash + cashDelta) };
}, 'portfolio:write');
