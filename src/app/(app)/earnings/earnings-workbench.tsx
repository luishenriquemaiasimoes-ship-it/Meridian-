'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Badge, cx, EmptyState, InlineNote, Panel, PanelHeader, Segmented, Tabs,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { DataTable, type Column } from '@/components/ui/table';
import { MetricCard, Num } from '@/components/ui/values';
import { BarSeriesChart } from '@/components/charts';
import { DASH, formatDate } from '@/lib/finance/format';
import { isNum } from '@/lib/finance/core';
import type { Currency } from '@/lib/finance/types';

interface EventRow {
  id: string; ticker: string; companyName: string; currency: Currency;
  label: string; reportDate: string; status: string;
  revenue: number | null; ebitda: number | null; eps: number | null;
  revenueSurprise: number | null; ebitdaSurprise: number | null; epsSurprise: number | null;
  hasReview: boolean; held: boolean; watched: boolean;
}

type Tab = 'upcoming' | 'reported' | 'surprises';

export function EarningsWorkbench(props: { today: string; events: EventRow[] }) {
  const [tab, setTab] = useState<Tab>('upcoming');
  const [scope, setScope] = useState<'all' | 'held' | 'watched'>('all');

  const inScope = useMemo(() => {
    if (scope === 'held') return props.events.filter((e) => e.held);
    if (scope === 'watched') return props.events.filter((e) => e.watched || e.held);
    return props.events;
  }, [props.events, scope]);

  const upcoming = useMemo(
    () => inScope.filter((e) => e.reportDate >= props.today || e.status === 'SCHEDULED')
      .slice().sort((a, b) => a.reportDate.localeCompare(b.reportDate)),
    [inScope, props.today],
  );
  const reported = useMemo(
    () => inScope.filter((e) => e.status === 'REPORTED' && e.reportDate < props.today)
      .slice().sort((a, b) => b.reportDate.localeCompare(a.reportDate)),
    [inScope, props.today],
  );

  const withSurprise = reported.filter((e) => isNum(e.ebitdaSurprise) || isNum(e.epsSurprise));
  const beats = withSurprise.filter((e) => (e.ebitdaSurprise ?? e.epsSurprise ?? 0) > 0.02).length;
  const misses = withSurprise.filter((e) => (e.ebitdaSurprise ?? e.epsSurprise ?? 0) < -0.02).length;
  const unreviewed = reported.filter((e) => !e.hasReview && (e.held || e.watched)).length;

  const baseColumns: Column<EventRow>[] = [
    {
      key: 'ticker', header: 'Ticker', sticky: true, width: '110px', sortable: true, value: (e) => e.ticker,
      render: (e) => (
        <div className="flex items-center gap-1.5">
          <Link href={`/companies/${e.ticker}/earnings`} className="font-semibold text-ink hover:text-accent">{e.ticker}</Link>
          {e.held ? <span title="Held in a portfolio" className="h-1.5 w-1.5 rounded-full bg-accent" /> : null}
        </div>
      ),
    },
    { key: 'name', header: 'Company', value: (e) => e.companyName, sortable: true, className: 'text-ink-2' },
    { key: 'period', header: 'Period', value: (e) => e.label, sortable: true, className: 'text-2xs text-ink-3' },
    {
      key: 'date', header: 'Report date', value: (e) => e.reportDate, sortable: true, align: 'right',
      render: (e) => (
        <span className={cx('text-2xs', e.reportDate >= props.today ? 'text-ink' : 'text-ink-3')}>
          {formatDate(e.reportDate)}
        </span>
      ),
    },
  ];

  const upcomingColumns: Column<EventRow>[] = [
    ...baseColumns,
    {
      key: 'days', header: 'In', align: 'right', sortable: true,
      value: (e) => daysUntil(props.today, e.reportDate),
      render: (e) => {
        const d = daysUntil(props.today, e.reportDate);
        return <span className="num text-2xs text-ink-2">{d === null ? DASH : d === 0 ? 'today' : `${d}d`}</span>;
      },
    },
    {
      key: 'scope', header: 'Relevance', value: (e) => (e.held ? 2 : e.watched ? 1 : 0), sortable: true, align: 'right',
      render: (e) => e.held
        ? <Badge tone="pos">held</Badge>
        : e.watched
          ? <Badge tone="neutral">watched</Badge>
          : <span className="text-2xs text-ink-4">coverage</span>,
    },
  ];

  const reportedColumns: Column<EventRow>[] = [
    ...baseColumns,
    { key: 'revenue', header: 'Revenue', value: (e) => e.revenue, format: 'currencyMillions', currency: (e) => e.currency, align: 'right', sortable: true },
    {
      key: 'revSurprise', header: 'vs consensus', value: (e) => e.revenueSurprise, align: 'right', sortable: true,
      tooltip: 'Against the consensus recorded in this workspace. A blank means no consensus was recorded for that line.',
      render: (e) => isNum(e.revenueSurprise)
        ? <Num value={e.revenueSurprise} format="percentSigned" />
        : <span className="text-2xs text-ink-4">no consensus</span>,
    },
    { key: 'ebitda', header: 'EBITDA', value: (e) => e.ebitda, format: 'currencyMillions', currency: (e) => e.currency, align: 'right', sortable: true },
    {
      key: 'ebitdaSurprise', header: 'vs consensus', value: (e) => e.ebitdaSurprise, align: 'right', sortable: true,
      render: (e) => isNum(e.ebitdaSurprise)
        ? <Num value={e.ebitdaSurprise} format="percentSigned" />
        : <span className="text-2xs text-ink-4">no consensus</span>,
    },
    { key: 'eps', header: 'EPS', value: (e) => e.eps, format: 'currency', currency: (e) => e.currency, decimals: 2, align: 'right', sortable: true },
    {
      key: 'epsSurprise', header: 'vs consensus', value: (e) => e.epsSurprise, align: 'right', sortable: true,
      render: (e) => isNum(e.epsSurprise)
        ? <Num value={e.epsSurprise} format="percentSigned" />
        : <span className="text-2xs text-ink-4">no consensus</span>,
    },
    {
      key: 'review', header: 'Write-up', value: (e) => (e.hasReview ? 1 : 0), sortable: true, align: 'right',
      render: (e) => e.hasReview
        ? <Badge tone="pos">written</Badge>
        : <Link href={`/companies/${e.ticker}/earnings`} className="text-2xs text-accent hover:underline">write one</Link>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Scheduled ahead" value={upcoming.length} format="number" decimals={0} sublabel={scope === 'all' ? 'Across coverage' : 'In scope'} />
        <MetricCard label="Beats" value={beats} format="number" decimals={0} sublabel="EBITDA or EPS more than 2% above consensus" />
        <MetricCard label="Misses" value={misses} format="number" decimals={0} sublabel="More than 2% below consensus" />
        <MetricCard
          label="Prints not written up" value={unreviewed} format="number" decimals={0}
          accent={unreviewed > 0} sublabel="Held or watched names"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          tabs={[
            { value: 'upcoming', label: 'Calendar', count: upcoming.length },
            { value: 'reported', label: 'Reported', count: reported.length },
            { value: 'surprises', label: 'Surprises', count: withSurprise.length },
          ]}
          className="flex-1"
        />
        <Segmented
          value={scope}
          onChange={setScope}
          options={[
            { value: 'all', label: 'All coverage' },
            { value: 'watched', label: 'Held or watched' },
            { value: 'held', label: 'Held only' },
          ]}
        />
      </div>

      {tab === 'upcoming' ? (
        upcoming.length ? (
          <>
            <Panel>
              <PanelHeader title="Reporting calendar" subtitle="Nearest date first" />
              <DataTable
                columns={upcomingColumns}
                rows={upcoming}
                rowKey={(e) => e.id}
                initialSort={{ key: 'date', direction: 'asc' }}
                dense
                searchable
                searchValue={(e) => `${e.ticker} ${e.companyName} ${e.label}`}
                emptyTitle="Nothing scheduled"
              />
            </Panel>
            <InlineNote tone="info">
              Dates come from the company record in this workspace. A date that has not been confirmed by the company is
              still shown, because a research desk plans around the expected date — but it is not a company announcement.
            </InlineNote>
          </>
        ) : (
          <Panel>
            <EmptyState
              icon={<Icon.Calendar size={22} />}
              title="Nothing scheduled ahead"
              description={scope === 'all' ? 'No future reporting dates are recorded for the covered companies.' : 'Nothing in scope has a future reporting date. Widen the scope to see the rest of coverage.'}
            />
          </Panel>
        )
      ) : null}

      {tab === 'reported' ? (
        <Panel>
          <PanelHeader title="Reported results" subtitle="Most recent first, against the consensus recorded here" />
          <DataTable
            columns={reportedColumns}
            rows={reported}
            rowKey={(e) => e.id}
            initialSort={{ key: 'date', direction: 'desc' }}
            dense
            searchable
            searchValue={(e) => `${e.ticker} ${e.companyName} ${e.label}`}
            emptyTitle="Nothing reported"
          />
        </Panel>
      ) : null}

      {tab === 'surprises' ? (
        withSurprise.length ? (
          <div className="space-y-4">
            <BarSeriesChart
              title="EBITDA against consensus"
              subtitle="Reported results where a consensus was recorded"
              data={withSurprise
                .slice(0, 24)
                .map((e) => ({ label: `${e.ticker} ${e.label}`, surprise: e.ebitdaSurprise ?? e.epsSurprise }))}
              xKey="label"
              series={[{ key: 'surprise', label: 'Surprise', format: 'percentSigned' }]}
              yFormat="percent"
              colorBySign
              referenceValue={0}
              height={300}
              footnote="Where EBITDA had no consensus, the EPS surprise is shown instead. A print with neither is omitted."
            />
            <Panel>
              <PanelHeader title="Largest surprises" subtitle="Sorted by absolute distance from consensus" />
              <DataTable
                columns={reportedColumns}
                rows={withSurprise
                  .slice()
                  .sort((a, b) => Math.abs(b.ebitdaSurprise ?? b.epsSurprise ?? 0) - Math.abs(a.ebitdaSurprise ?? a.epsSurprise ?? 0))}
                rowKey={(e) => e.id}
                dense
                emptyTitle="No surprises recorded"
              />
            </Panel>
          </div>
        ) : (
          <Panel>
            <EmptyState
              icon={<Icon.Earnings size={22} />}
              title="No consensus on record"
              description="A surprise can only be computed where a consensus figure was recorded before the print. Without one, the result is reported on its own terms rather than compared to an invented expectation."
            />
          </Panel>
        )
      ) : null}
    </div>
  );
}

function daysUntil(today: string, date: string): number | null {
  const a = new Date(`${today}T00:00:00Z`).getTime();
  const b = new Date(`${date}T00:00:00Z`).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.round((b - a) / 86400000);
}
