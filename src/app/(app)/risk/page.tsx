import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { listPortfolios } from '@/server/services/portfolio';
import { getPortfolioRiskProfile } from '@/server/services/risk';
import { EmptyState, PageHeader, Panel } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { RiskWorkbench } from './risk-workbench';
import type { Currency } from '@/lib/finance/types';

export const metadata: Metadata = { title: 'Risk' };
export const dynamic = 'force-dynamic';

export default async function RiskPage({
  searchParams,
}: { searchParams: Promise<{ id?: string; tab?: string }> }) {
  const ctx = await requireContext();
  const { id, tab } = await searchParams;

  const portfolios = await listPortfolios(ctx.workspaceId);
  if (!portfolios.length) {
    return (
      <>
        <PageHeader title="Risk" subtitle="What could go wrong and how much would it cost?" />
        <Panel>
          <EmptyState
            icon={<Icon.Risk size={22} />}
            title="No portfolio in this workspace"
            description="Risk analytics are measured on a book. Create a portfolio and record positions to see volatility, drawdown, value at risk, risk contribution, correlation, factor exposure and scenario stress."
          />
        </Panel>
      </>
    );
  }

  const selectedId = id && portfolios.some((p) => p.id === id) ? id : portfolios[0].id;
  const profile = await getPortfolioRiskProfile(ctx.workspaceId, selectedId);
  if (!profile) {
    return <PageHeader title="Risk" subtitle="This portfolio could not be loaded." />;
  }

  const { analytics } = profile;
  const weightByTicker = new Map(
    analytics.summary.positions.map((p) => [p.ticker, p.weight ?? null] as const),
  );
  const nameByTicker = new Map(analytics.summary.positions.map((p) => [p.ticker, p.name] as const));

  return (
    <>
      <PageHeader
        title="Risk"
        subtitle={`${analytics.portfolio.name} — measured on ${analytics.performance.observations} daily observations against ${analytics.portfolio.benchmarkCode}.`}
      />
      <RiskWorkbench
        portfolios={portfolios.map((p) => ({ id: p.id, name: p.name }))}
        selectedId={selectedId}
        initialTab={tab ?? 'overview'}
        currency={analytics.portfolio.baseCurrency as Currency}
        benchmarkCode={analytics.portfolio.benchmarkCode}
        totalMarketValue={analytics.summary.totalMarketValue}
        performance={analytics.performance}
        benchmarkPerformance={analytics.benchmarkPerformance}
        tracking={analytics.tracking}
        concentration={analytics.concentration}
        exposures={analytics.exposures}
        riskContribution={{
          portfolioVolatility: analytics.riskContribution.portfolioVolatility,
          rows: analytics.riskContribution.rows.map((r) => ({
            ticker: r.key,
            name: nameByTicker.get(r.key) ?? r.key,
            weight: r.weight,
            volatility: r.volatility,
            marginalContribution: r.marginalContribution,
            contribution: r.contribution,
            contributionPct: r.contributionPct,
          })),
        }}
        correlation={analytics.correlation}
        drawdown={profile.drawdown}
        valueAtRisk={profile.valueAtRisk}
        factorExposure={profile.factorExposure.map((f) => ({
          ...f,
          leaders: f.leaders.map((l) => ({ ...l, name: nameByTicker.get(l.ticker) ?? l.ticker })),
          laggards: f.laggards.map((l) => ({ ...l, name: nameByTicker.get(l.ticker) ?? l.ticker })),
        }))}
        scenarios={profile.scenarios.map((s) => ({
          id: s.scenario.id,
          name: s.scenario.name,
          description: s.scenario.description,
          marketMove: s.scenario.marketMove ?? 0,
          portfolioImpact: s.portfolioImpact,
          valueImpact:
            typeof analytics.summary.totalMarketValue === 'number'
              ? analytics.summary.totalMarketValue * s.portfolioImpact
              : null,
          rows: s.rows.map((r) => ({
            ticker: r.ticker, name: r.name, sector: r.sector,
            weight: r.weight, impact: r.impact, contribution: r.contribution,
          })),
          worst: s.worst ? { ticker: s.worst.ticker, impact: s.worst.impact } : null,
          best: s.best ? { ticker: s.best.ticker, impact: s.best.impact } : null,
        }))}
        stressByPosition={profile.stressByPosition}
        betaByTicker={analytics.summary.positions.map((p) => ({
          ticker: p.ticker,
          name: p.name,
          beta: p.beta ?? null,
          weight: weightByTicker.get(p.ticker) ?? null,
        }))}
      />
    </>
  );
}
