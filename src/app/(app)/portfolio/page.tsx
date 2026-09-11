import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { getPortfolioAnalytics, getRebalancePlan, listPortfolios } from '@/server/services/portfolio';
import { evaluateThesisHealth } from '@/server/services/alerts';
import { prisma } from '@/lib/db';
import { EmptyState, PageHeader, Panel } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { PortfolioWorkbench } from './portfolio-workbench';
import type { Currency } from '@/lib/finance/types';

export const metadata: Metadata = { title: 'Portfolio' };
export const dynamic = 'force-dynamic';

export default async function PortfolioPage({
  searchParams,
}: { searchParams: Promise<{ id?: string; tab?: string }> }) {
  const ctx = await requireContext();
  const { id, tab } = await searchParams;

  const portfolios = await listPortfolios(ctx.workspaceId);
  if (!portfolios.length) {
    return (
      <>
        <PageHeader title="Portfolio" subtitle="What do I own and how is it doing?" />
        <Panel>
          <EmptyState
            icon={<Icon.Portfolio size={22} />}
            title="No portfolio in this workspace"
            description="Create one to see performance against a benchmark, attribution by name and sector, exposure, concentration, look-through valuation and a rebalancing plan."
          />
        </Panel>
      </>
    );
  }

  const selectedId = id && portfolios.some((p) => p.id === id) ? id : portfolios[0].id;
  const [analytics, rebalance, health, transactions] = await Promise.all([
    getPortfolioAnalytics(ctx.workspaceId, selectedId),
    getRebalancePlan(ctx.workspaceId, selectedId),
    evaluateThesisHealth(ctx.workspaceId),
    prisma.portfolioTransaction.findMany({
      where: { portfolioId: selectedId }, orderBy: { tradeDate: 'desc' }, take: 40,
      include: { company: true },
    }),
  ]);
  if (!analytics) {
    return <PageHeader title="Portfolio" subtitle="This portfolio could not be loaded." />;
  }

  const healthByTicker = new Map(health.map((h) => [h.ticker, h]));

  return (
    <>
      <PageHeader
        title={analytics.portfolio.name}
        subtitle={analytics.portfolio.description ?? `Benchmarked against ${analytics.portfolio.benchmarkCode}. Inception ${analytics.portfolio.inceptionDate}.`}
      />
      <PortfolioWorkbench
        portfolios={portfolios}
        selectedId={selectedId}
        initialTab={tab ?? 'positions'}
        currency={analytics.portfolio.baseCurrency as Currency}
        canWrite={ctx.can('portfolio:write')}
        canRebalance={ctx.can('portfolio:rebalance')}
        summary={{
          totalMarketValue: analytics.summary.totalMarketValue,
          investedValue: analytics.summary.investedValue,
          cash: analytics.summary.cash,
          unrealizedPnl: analytics.summary.unrealizedPnl,
          unrealizedPnlPct: analytics.summary.unrealizedPnlPct,
          dailyPnl: analytics.summary.dailyPnl,
          dailyPnlPct: analytics.summary.dailyPnlPct,
          positionCount: analytics.summary.positionCount,
        }}
        positions={analytics.summary.positions.map((p) => {
          const h = healthByTicker.get(p.ticker);
          return {
            id: p.id, ticker: p.ticker, name: p.name, sector: p.sector ?? 'Unclassified',
            country: p.country ?? 'Unclassified', currency: p.currency,
            quantity: p.quantity, averagePrice: p.averagePrice, currentPrice: p.currentPrice,
            marketValue: p.marketValue, weight: p.weight, unrealizedPnl: p.unrealizedPnl,
            unrealizedPnlPct: p.unrealizedPnlPct, dailyChangePct: p.dailyChangePct,
            targetPrice: p.targetPrice ?? null, upsideToTarget: p.upsideToTarget,
            pe: p.pe ?? null, evEbitda: p.evEbitda ?? null, roic: p.roic ?? null,
            fcfYield: p.fcfYield ?? null, beta: p.beta ?? null,
            thesisVerdict: h?.verdict ?? null, recommendation: h?.recommendation ?? null,
          };
        })}
        contributions={analytics.contributions.map((c) => ({
          key: c.key, label: c.label, weight: c.weight, return: c.return, contribution: c.contribution, pnl: c.pnl,
        }))}
        sectorContribution={analytics.sectorContribution.map((c) => ({
          key: c.key, weight: c.weight, return: c.return, contribution: c.contribution,
        }))}
        countryContribution={analytics.countryContribution.map((c) => ({
          key: c.key, weight: c.weight, return: c.return, contribution: c.contribution,
        }))}
        exposures={analytics.exposures}
        concentration={analytics.concentration}
        lookThrough={analytics.lookThrough}
        navSeries={analytics.navSeries}
        periodReturns={analytics.periodReturns}
        performance={{
          totalReturn: analytics.performance.totalReturn,
          annualizedReturn: analytics.performance.annualizedReturn,
          volatility: analytics.performance.volatility,
          sharpe: analytics.performance.sharpe,
          maxDrawdown: analytics.performance.maxDrawdown,
        }}
        benchmarkPerformance={{
          totalReturn: analytics.benchmarkPerformance.totalReturn,
          annualizedReturn: analytics.benchmarkPerformance.annualizedReturn,
        }}
        benchmarkCode={analytics.portfolio.benchmarkCode}
        rebalanceRows={(rebalance?.rows ?? []).map((r) => ({
          ticker: r.ticker, name: r.name, currentWeight: r.currentWeight, targetWeight: r.targetWeight,
          difference: r.difference, action: r.action, notionalDelta: r.notionalDelta, shareDelta: r.shareDelta,
        }))}
        targetsDefined={rebalance?.targetsDefined ?? false}
        transactions={transactions.map((t) => ({
          id: t.id, ticker: t.company?.ticker ?? null, kind: t.kind, quantity: t.quantity,
          price: t.price, amount: t.amount, tradeDate: t.tradeDate.toISOString().slice(0, 10),
          note: t.note, createdBy: t.createdBy,
        }))}
      />
    </>
  );
}
