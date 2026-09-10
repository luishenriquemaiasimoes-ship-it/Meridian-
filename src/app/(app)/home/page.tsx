import type { Metadata } from 'next';
import Link from 'next/link';
import { requireContext } from '@/server/context';
import { getDashboard } from '@/server/services/dashboard';
import { Badge, Button, EmptyState, Grid, PageHeader, Panel, PanelHeader } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { Delta, MetricCard, Num, RecommendationBadge, SimulatedBadge, StatRow, ThesisVerdictBadge } from '@/components/ui/values';
import { DASH, formatDate, formatPercent } from '@/lib/finance/format';
import { LineSeriesChart } from '@/components/charts';
import type { Currency } from '@/lib/finance/types';
import { MarketStrip } from './market-strip';
import { WatchlistTable } from './watchlist-table';

export const metadata: Metadata = { title: 'Home' };
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const ctx = await requireContext();
  const data = await getDashboard(ctx.workspaceId);
  const currency = ctx.baseCurrency as Currency;

  const portfolio = data.portfolio;
  const navSeries = (portfolio?.navSeries ?? []).filter((_, i, arr) => i % Math.max(1, Math.floor(arr.length / 120)) === 0);
  const indexed = navSeries.length
    ? navSeries.map((p) => ({
        date: p.date,
        portfolio: (p.value / navSeries[0].value) * 100,
        benchmark: (p.benchmark / navSeries[0].benchmark) * 100,
      }))
    : [];

  const critical = data.insights.filter((i) => i.severity === 'CRITICAL');

  return (
    <>
      <PageHeader
        title={`Good day, ${ctx.name.split(' ')[0]}`}
        subtitle="What needs your attention across research, the book and the theses you are tracking."
        actions={
          <>
            {data.isDemo ? <SimulatedBadge /> : null}
            <Link
              href="/ai"
              className="inline-flex h-7 items-center gap-1.5 rounded border border-line bg-raised px-2.5 text-xs font-medium text-ink transition hover:border-line-strong"
            >
              <Icon.Ai size={13} className="text-brass" />
              Ask the analyst
            </Link>
          </>
        }
      />

      <MarketStrip indicators={data.indicators} />

      {critical.length ? (
        <div className="mt-4 rounded border border-neg/35 bg-neg/[0.06] p-3">
          <div className="flex items-center gap-2">
            <Icon.Warning size={14} className="text-neg" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neg">Needs a decision</span>
          </div>
          <ul className="mt-2 space-y-1.5">
            {critical.map((i) => (
              <li key={i.id}>
                <Link href={i.href} className="flex items-start gap-2 text-base text-ink-2 hover:text-ink">
                  <Icon.ArrowRight size={12} className="mt-1 shrink-0 text-neg" />
                  <span>{i.text} <span className="text-2xs text-ink-4">· {i.basis}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {/* Portfolio */}
          <Panel padded={false}>
            <div className="p-4">
              <PanelHeader
                title={portfolio ? portfolio.portfolio.name : 'Portfolio'}
                subtitle={portfolio ? `${portfolio.summary.positionCount} positions · benchmark ${portfolio.portfolio.benchmarkCode}` : undefined}
                actions={<Link href="/portfolio" className="text-xs text-accent hover:underline">Open portfolio</Link>}
              />
              {portfolio ? (
                <>
                  <Grid cols={4} gap={2}>
                    <MetricCard label="Net asset value" value={portfolio.summary.totalMarketValue} format="currencyCompact" currency={currency} />
                    <MetricCard
                      label="Unrealised P&L" value={portfolio.summary.unrealizedPnl} format="currencyCompact" currency={currency}
                      delta={portfolio.summary.unrealizedPnlPct}
                    />
                    <MetricCard label="Day" value={portfolio.summary.dailyPnl} format="currencyCompact" currency={currency} delta={portfolio.summary.dailyPnlPct} />
                    <MetricCard label="Cash" value={portfolio.summary.cash} format="currencyCompact" currency={currency}
                      sublabel={portfolio.summary.totalMarketValue ? `${formatPercent((portfolio.summary.cash) / (portfolio.summary.totalMarketValue || 1))} of NAV` : undefined} />
                  </Grid>

                  {indexed.length > 1 ? (
                    <div className="mt-3">
                      <LineSeriesChart
                        data={indexed}
                        xKey="date"
                        height={190}
                        series={[
                          { key: 'portfolio', label: portfolio.portfolio.name, format: 'ratio', decimals: 1 },
                          { key: 'benchmark', label: portfolio.portfolio.benchmarkCode, format: 'ratio', decimals: 1 },
                        ]}
                        title="Performance since inception"
                        subtitle="Indexed to 100 at inception"
                        footnote="Portfolio net asset value against the benchmark, rebased to a common start."
                      />
                    </div>
                  ) : null}

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="panel p-3">
                      <p className="label mb-1.5">Period returns</p>
                      {portfolio.periodReturns.map((p) => (
                        <StatRow
                          key={p.label}
                          label={p.label}
                          value={
                            <span className="flex items-baseline justify-end gap-3">
                              <Delta value={p.portfolio} className="w-16 text-right" />
                              <Num value={p.benchmark} format="percentSigned" className="w-16 text-right text-ink-3" />
                              <Delta value={p.active} className="w-16 text-right" />
                            </span>
                          }
                        />
                      ))}
                      <p className="mt-1.5 border-t border-line pt-1.5 text-2xs text-ink-4">Portfolio · benchmark · active</p>
                    </div>
                    <div className="panel p-3">
                      <p className="label mb-1.5">Top contributors</p>
                      {portfolio.contributions.slice(0, 3).map((c) => (
                        <StatRow key={c.key} label={<Link href={`/companies/${c.key}`} className="hover:text-ink">{c.key}</Link>} value={<Delta value={c.contribution} decimals={2} />} />
                      ))}
                      <p className="label mb-1.5 mt-2">Top detractors</p>
                      {portfolio.contributions.slice(-3).reverse().map((c) => (
                        <StatRow key={c.key} label={<Link href={`/companies/${c.key}`} className="hover:text-ink">{c.key}</Link>} value={<Delta value={c.contribution} decimals={2} />} />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="No portfolio in this workspace"
                  description="Create a portfolio to see performance, attribution, exposure and look-through valuation."
                  action={<Link href="/portfolio"><Button variant="primary">Create a portfolio</Button></Link>}
                />
              )}
            </div>
          </Panel>

          {/* Watchlist */}
          <Panel padded={false}>
            <div className="p-4 pb-2">
              <PanelHeader
                title={data.watchlistName ?? 'Watchlist'}
                subtitle="Price, rating, valuation and the state of the thesis in one row."
                actions={<Link href="/watchlists" className="text-xs text-accent hover:underline">All watchlists</Link>}
              />
            </div>
            {data.watchRows.length ? (
              <WatchlistTable rows={data.watchRows} />
            ) : (
              <EmptyState
                title="No watchlist yet"
                description="Create a watchlist to track price, valuation and thesis status for the names you cover."
                action={<Link href="/watchlists"><Button variant="primary">Create a watchlist</Button></Link>}
              />
            )}
          </Panel>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <Panel>
            <PanelHeader
              title="Insights"
              subtitle="Derived from this workspace — each one links to where it can be checked."
              dense
            />
            {data.insights.length === 0 ? (
              <p className="py-6 text-center text-xs text-ink-3">Nothing stands out right now.</p>
            ) : (
              <ul className="space-y-2">
                {data.insights.slice(0, 6).map((i) => (
                  <li key={i.id}>
                    <Link href={i.href} className="block rounded border border-line p-2.5 transition hover:border-line-strong hover:bg-raised">
                      <div className="flex items-center gap-1.5">
                        <Badge tone={i.severity === 'CRITICAL' ? 'neg' : i.severity === 'IMPORTANT' ? 'warn' : 'neutral'}>
                          {i.kind}
                        </Badge>
                        {i.ticker ? <span className="num text-2xs text-ink-3">{i.ticker}</span> : null}
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-ink-2">{i.text}</p>
                      <p className="mt-1 text-2xs text-ink-4">{i.basis}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Thesis health" dense actions={<Link href="/monitoring" className="text-xs text-accent hover:underline">Monitor</Link>} />
            {data.thesisHealth.length === 0 ? (
              <p className="py-4 text-center text-xs text-ink-3">No theses written yet.</p>
            ) : (
              <div className="space-y-1.5">
                {data.thesisHealth.map((h) => (
                  <Link key={h.thesisId} href={`/companies/${h.ticker}/thesis`} className="flex items-center justify-between gap-2 rounded px-1.5 py-1 transition hover:bg-raised">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="num text-xs text-ink">{h.ticker}</span>
                      <RecommendationBadge value={h.recommendation} />
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <Delta value={h.upside} className="text-2xs" />
                      <ThesisVerdictBadge verdict={h.verdict} />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Upcoming catalysts" dense />
            {data.upcomingCatalysts.length === 0 ? (
              <p className="py-4 text-center text-xs text-ink-3">Nothing dated in the next window.</p>
            ) : (
              <ul className="space-y-2">
                {data.upcomingCatalysts.slice(0, 5).map((c, i) => (
                  <li key={`${c.ticker}-${i}`} className="flex items-start gap-2">
                    <span className="mt-0.5 num text-2xs text-ink-4 w-[62px] shrink-0">{c.date ? formatDate(c.date) : DASH}</span>
                    <span className="min-w-0">
                      <Link href={`/companies/${c.ticker}/thesis`} className="text-xs text-ink hover:underline">{c.ticker}</Link>
                      <span className="block text-2xs text-ink-3">{c.title}</span>
                      <span className="block text-2xs text-ink-4">
                        {c.impact.toLowerCase()} impact · {formatPercent(c.probability, 0)} probability
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <PanelHeader title="Recent research" dense actions={<Link href="/research" className="text-xs text-accent hover:underline">Library</Link>} />
            {data.recentNotes.length === 0 ? (
              <p className="py-4 text-center text-xs text-ink-3">No notes yet.</p>
            ) : (
              <ul className="space-y-2">
                {data.recentNotes.slice(0, 5).map((n) => (
                  <li key={n.id}>
                    <Link href={`/research/notes/${n.id}`} className="block rounded px-1 py-0.5 hover:bg-raised">
                      <span className="block truncate text-xs text-ink">{n.title}</span>
                      <span className="block text-2xs text-ink-4">
                        {n.ticker ? `${n.ticker} · ` : ''}{n.author} · {formatDate(n.updatedAt)} · {n.status.toLowerCase()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {data.recentTargetChanges.length ? (
            <Panel>
              <PanelHeader title="Target price changes" dense />
              <ul className="space-y-2">
                {data.recentTargetChanges.slice(0, 4).map((t, i) => (
                  <li key={`${t.ticker}-${i}`} className="text-xs">
                    <Link href={`/companies/${t.ticker}/thesis`} className="num text-ink hover:underline">{t.ticker}</Link>
                    <span className="text-ink-3">
                      {' '}<Num value={t.from} format="currency" currency={currency} className="text-2xs" />
                      {' → '}<Num value={t.to} format="currency" currency={currency} className="text-2xs" />
                    </span>
                    <span className="block text-2xs text-ink-4">{t.reason}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          {data.recentEarnings.length ? (
            <Panel>
              <PanelHeader title="Recent results" dense actions={<Link href="/earnings" className="text-xs text-accent hover:underline">Earnings</Link>} />
              <ul className="space-y-1.5">
                {data.recentEarnings.map((e) => (
                  <li key={`${e.ticker}-${e.label}`} className="flex items-center justify-between gap-2 text-xs">
                    <Link href={`/companies/${e.ticker}/earnings`} className="num text-ink hover:underline">{e.ticker} {e.label}</Link>
                    <span className="flex items-center gap-2 text-2xs">
                      <span className="text-ink-4">rev</span><Delta value={e.revenueSurprise} decimals={1} />
                      <span className="text-ink-4">ebitda</span><Delta value={e.ebitdaSurprise} decimals={1} />
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </div>
      </div>
    </>
  );
}
