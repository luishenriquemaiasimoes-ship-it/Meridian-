import { NextResponse } from 'next/server';
import { requireContext } from '@/server/context';
import { handleError, searchParams } from '@/server/http';
import { prisma } from '@/lib/db';
import { getPortfolioAnalytics } from '@/server/services/portfolio';
import { buildPortfolioWorkbook } from '@/server/services/export';
import { recordAudit } from '@/server/services/audit';
import { assertCan } from '@/lib/auth/rbac';
import type { Currency } from '@/lib/finance/types';

export async function GET(req: Request) {
  try {
    const ctx = await requireContext();
    assertCan(ctx.role, 'export:data');

    const id = searchParams(req).get('id') ?? undefined;
    const analytics = await getPortfolioAnalytics(ctx.workspaceId, id);
    if (!analytics) return NextResponse.json({ error: 'Portfolio not found.' }, { status: 404 });

    const transactions = await prisma.portfolioTransaction.findMany({
      where: { portfolioId: analytics.portfolio.id },
      orderBy: { tradeDate: 'desc' },
      take: 500,
      include: { company: { select: { ticker: true } } },
    });

    const exposures = (['sector', 'country', 'currency', 'marketCap'] as const).flatMap((dimension) =>
      analytics.exposures[dimension].map((e) => ({
        dimension: dimension === 'marketCap' ? 'Market cap' : dimension.charAt(0).toUpperCase() + dimension.slice(1),
        label: e.label,
        marketValue: e.marketValue,
        weight: e.weight,
        count: e.count,
      })),
    );

    const buffer = await buildPortfolioWorkbook({
      name: analytics.portfolio.name,
      currency: analytics.portfolio.baseCurrency as Currency,
      benchmarkCode: analytics.portfolio.benchmarkCode,
      inceptionDate: analytics.portfolio.inceptionDate,
      asOf: new Date().toISOString().slice(0, 10),
      summary: {
        totalMarketValue: analytics.summary.totalMarketValue,
        investedValue: analytics.summary.investedValue,
        cash: analytics.summary.cash,
        unrealizedPnl: analytics.summary.unrealizedPnl,
        unrealizedPnlPct: analytics.summary.unrealizedPnlPct,
        positionCount: analytics.summary.positionCount,
      },
      positions: analytics.summary.positions.map((p) => ({
        ticker: p.ticker,
        name: p.name,
        sector: p.sector ?? 'Unclassified',
        country: p.country ?? 'Unclassified',
        currency: p.currency,
        quantity: p.quantity,
        averagePrice: p.averagePrice,
        currentPrice: p.currentPrice,
        marketValue: p.marketValue,
        weight: p.weight,
        unrealizedPnl: p.unrealizedPnl,
        unrealizedPnlPct: p.unrealizedPnlPct,
        pe: p.pe ?? null,
        evEbitda: p.evEbitda ?? null,
        roic: p.roic ?? null,
        fcfYield: p.fcfYield ?? null,
        beta: p.beta ?? null,
      })),
      performance: analytics.periodReturns,
      exposures,
      contributions: analytics.contributions.map((c) => ({
        ticker: c.key,
        weight: c.weight,
        return: c.return,
        contribution: c.contribution,
      })),
      navSeries: analytics.navSeries,
      transactions: transactions.map((t) => ({
        tradeDate: t.tradeDate.toISOString().slice(0, 10),
        kind: t.kind,
        ticker: t.company?.ticker ?? null,
        quantity: t.quantity,
        price: t.price,
        amount: t.amount,
        note: t.note,
      })),
    });

    await recordAudit({
      workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
      action: 'EXPORT', entityType: 'Portfolio', entityId: analytics.portfolio.id,
      entityLabel: analytics.portfolio.name,
      summary: `${analytics.portfolio.name} exported to Excel (${analytics.summary.positionCount} positions).`,
    });

    const slug = analytics.portfolio.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${slug || 'portfolio'}.xlsx"`,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
