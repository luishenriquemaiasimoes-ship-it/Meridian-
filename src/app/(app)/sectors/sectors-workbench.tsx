'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Badge, cx, InlineNote, Panel, PanelHeader, Segmented, Tabs, Tooltip,
} from '@/components/ui/primitives';
import { DataTable, type Column } from '@/components/ui/table';
import { BarCell, MetricCard, Num } from '@/components/ui/values';
import { BarSeriesChart, ScatterPlot } from '@/components/charts';
import { DASH, formatPercent } from '@/lib/finance/format';
import { isNum } from '@/lib/finance/core';
import type { Currency } from '@/lib/finance/types';

interface Aggregate {
  sector: string; companies: number;
  medianRevenueGrowth: number | null; medianEbitdaMargin: number | null;
  medianRoic: number | null; medianRoe: number | null;
  medianNetDebtToEbitda: number | null; medianEvEbitda: number | null;
  medianPe: number | null; totalMarketCap: number | null; median12mReturn: number | null;
}

interface CompanyRow {
  ticker: string; name: string; sector: string; industry: string; country: string;
  currency: string; themes: string[]; bankLike: boolean;
  marketCap: number | null; revenueGrowth: number | null; ebitdaMargin: number | null;
  roic: number | null; roe: number | null; roicSpread: number | null;
  netDebtToEbitda: number | null; evEbitda: number | null; pe: number | null;
  fcfYield: number | null; return12m: number | null;
}

type Tab = 'sectors' | 'themes' | 'map';

export function SectorsWorkbench(props: {
  aggregates: Aggregate[];
  companies: CompanyRow[];
  themes: { slug: string; label: string; description: string; count: number }[];
  initialSector: string | null;
  initialTheme: string | null;
}) {
  const [tab, setTab] = useState<Tab>(props.initialTheme ? 'themes' : 'sectors');
  const [sector, setSector] = useState<string | null>(props.initialSector);
  const [theme, setTheme] = useState<string | null>(props.initialTheme ?? props.themes[0]?.slug ?? null);
  const [mapAxis, setMapAxis] = useState<'roic' | 'growth'>('roic');

  const totalCap = props.aggregates.reduce((s, a) => s + (a.totalMarketCap ?? 0), 0);

  const sectorCompanies = useMemo(
    () => (sector ? props.companies.filter((c) => c.sector === sector) : []),
    [props.companies, sector],
  );
  const themeCompanies = useMemo(
    () => (theme ? props.companies.filter((c) => c.themes.includes(theme)) : []),
    [props.companies, theme],
  );

  const aggregateColumns: Column<Aggregate>[] = [
    {
      key: 'sector', header: 'Sector', sticky: true, width: '190px', sortable: true, value: (a) => a.sector,
      render: (a) => (
        <button
          type="button"
          onClick={() => setSector(a.sector === sector ? null : a.sector)}
          className={cx('text-left font-medium focus-ring rounded', a.sector === sector ? 'text-accent' : 'text-ink hover:text-accent')}
        >
          {a.sector}
        </button>
      ),
    },
    { key: 'companies', header: 'Names', value: (a) => a.companies, format: 'number', align: 'right', sortable: true },
    {
      key: 'cap', header: 'Market cap', value: (a) => a.totalMarketCap, format: 'currencyMillions',
      align: 'right', sortable: true, tooltip: 'Sum of the covered companies in the sector, converted to nothing — each company is in its own currency, so read this as a size ordering rather than a total.',
    },
    {
      key: 'share', header: 'Share of coverage', align: 'right', sortable: true,
      value: (a) => (totalCap > 0 ? (a.totalMarketCap ?? 0) / totalCap : null),
      render: (a) => <BarCell value={totalCap > 0 ? (a.totalMarketCap ?? 0) / totalCap : null} max={0.4} format="percent" />,
    },
    { key: 'growth', header: 'Revenue growth', value: (a) => a.medianRevenueGrowth, format: 'percent', align: 'right', sortable: true },
    { key: 'margin', header: 'EBITDA margin', value: (a) => a.medianEbitdaMargin, format: 'percent', align: 'right', sortable: true },
    { key: 'roic', header: 'ROIC', value: (a) => a.medianRoic, format: 'percent', align: 'right', sortable: true },
    { key: 'roe', header: 'ROE', value: (a) => a.medianRoe, format: 'percent', align: 'right', sortable: true },
    { key: 'lev', header: 'Net debt / EBITDA', value: (a) => a.medianNetDebtToEbitda, format: 'multiple', align: 'right', sortable: true },
    { key: 'ev', header: 'EV / EBITDA', value: (a) => a.medianEvEbitda, format: 'multiple', align: 'right', sortable: true },
    { key: 'pe', header: 'P / E', value: (a) => a.medianPe, format: 'multiple', align: 'right', sortable: true },
    { key: 'ret', header: '12M return', value: (a) => a.median12mReturn, format: 'percentSigned', align: 'right', sortable: true },
  ];

  const companyColumns: Column<CompanyRow>[] = [
    {
      key: 'ticker', header: 'Ticker', sticky: true, width: '96px', sortable: true, value: (c) => c.ticker,
      render: (c) => <Link href={`/companies/${c.ticker}`} className="font-semibold text-ink hover:text-accent">{c.ticker}</Link>,
    },
    { key: 'name', header: 'Company', value: (c) => c.name, sortable: true, className: 'text-ink-2' },
    { key: 'industry', header: 'Industry', value: (c) => c.industry, sortable: true, className: 'text-2xs text-ink-3' },
    { key: 'cap', header: 'Market cap', value: (c) => c.marketCap, format: 'currencyMillions', currency: (c) => c.currency as Currency, align: 'right', sortable: true },
    { key: 'growth', header: 'Revenue growth', value: (c) => c.revenueGrowth, format: 'percent', align: 'right', sortable: true },
    { key: 'margin', header: 'EBITDA margin', value: (c) => c.ebitdaMargin, format: 'percent', align: 'right', sortable: true },
    {
      key: 'roic', header: 'ROIC', value: (c) => c.roic, align: 'right', sortable: true,
      render: (c) => c.bankLike
        ? <Tooltip content="Invested capital is not a meaningful denominator for a bank. Use ROE."><span className="text-2xs text-ink-4">n/m</span></Tooltip>
        : <Num value={c.roic} format="percent" />,
    },
    { key: 'roe', header: 'ROE', value: (c) => c.roe, format: 'percent', align: 'right', sortable: true },
    {
      key: 'ev', header: 'EV / EBITDA', value: (c) => c.evEbitda, align: 'right', sortable: true,
      render: (c) => c.bankLike
        ? <Tooltip content="Enterprise value is not meaningful for a bank: deposits and debt are operating funding."><span className="text-2xs text-ink-4">n/m</span></Tooltip>
        : <Num value={c.evEbitda} format="multiple" />,
    },
    { key: 'pe', header: 'P / E', value: (c) => c.pe, format: 'multiple', align: 'right', sortable: true },
    { key: 'fcf', header: 'FCF yield', value: (c) => c.fcfYield, format: 'percent', align: 'right', sortable: true },
    { key: 'ret', header: '12M return', value: (c) => c.return12m, format: 'percentSigned', align: 'right', sortable: true },
  ];

  const selectedTheme = props.themes.find((t) => t.slug === theme) ?? null;
  const bestRoic = props.aggregates.filter((a) => isNum(a.medianRoic)).sort((a, b) => (b.medianRoic ?? 0) - (a.medianRoic ?? 0))[0];
  const cheapest = props.aggregates.filter((a) => isNum(a.medianEvEbitda)).sort((a, b) => (a.medianEvEbitda ?? 0) - (b.medianEvEbitda ?? 0))[0];
  const fastest = props.aggregates.filter((a) => isNum(a.medianRevenueGrowth)).sort((a, b) => (b.medianRevenueGrowth ?? 0) - (a.medianRevenueGrowth ?? 0))[0];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Sectors covered" value={props.aggregates.length} format="number" decimals={0} />
        <MetricCard
          label="Highest median ROIC" value={bestRoic?.medianRoic ?? null} format="percent"
          sublabel={bestRoic?.sector}
        />
        <MetricCard
          label="Lowest median EV/EBITDA" value={cheapest?.medianEvEbitda ?? null} format="multiple"
          sublabel={cheapest?.sector}
        />
        <MetricCard
          label="Fastest median growth" value={fastest?.medianRevenueGrowth ?? null} format="percent"
          sublabel={fastest?.sector}
        />
      </div>

      <Tabs
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        tabs={[
          { value: 'sectors', label: 'Sectors', count: props.aggregates.length },
          { value: 'themes', label: 'Themes', count: props.themes.length },
          { value: 'map', label: 'Quality map' },
        ]}
      />

      {tab === 'sectors' ? (
        <div className="space-y-4">
          <Panel>
            <PanelHeader
              title="Sector medians"
              subtitle="Click a sector to see the names inside it. Banks are excluded from the ROIC and EV/EBITDA medians where those measures are not meaningful."
            />
            <DataTable
              columns={aggregateColumns}
              rows={props.aggregates}
              rowKey={(a) => a.sector}
              initialSort={{ key: 'cap', direction: 'desc' }}
              dense
              highlightRow={(a) => a.sector === sector}
              emptyTitle="No sectors"
            />
          </Panel>

          <BarSeriesChart
            title="Median ROIC by sector"
            subtitle="Where capital earns its cost and where it does not"
            data={props.aggregates
              .filter((a) => isNum(a.medianRoic))
              .slice()
              .sort((a, b) => (b.medianRoic ?? 0) - (a.medianRoic ?? 0))
              .map((a) => ({ sector: a.sector, roic: a.medianRoic }))}
            xKey="sector"
            series={[{ key: 'roic', label: 'Median ROIC', format: 'percent' }]}
            yFormat="percent"
            height={280}
            footnote="Banks are reported at ROE instead; invested capital is not a meaningful denominator for them."
          />

          {sector ? (
            <Panel>
              <PanelHeader
                title={sector}
                subtitle={`${sectorCompanies.length} covered ${sectorCompanies.length === 1 ? 'company' : 'companies'}`}
                actions={
                  <button type="button" onClick={() => setSector(null)} className="text-2xs text-ink-3 hover:text-accent focus-ring rounded">
                    Clear
                  </button>
                }
              />
              <DataTable
                columns={companyColumns}
                rows={sectorCompanies}
                rowKey={(c) => c.ticker}
                initialSort={{ key: 'cap', direction: 'desc' }}
                dense
                emptyTitle="No companies in this sector"
              />
            </Panel>
          ) : (
            <InlineNote tone="info">Click a sector above to list the companies inside it.</InlineNote>
          )}
        </div>
      ) : null}

      {tab === 'themes' ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {props.themes.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => setTheme(t.slug)}
                className={cx(
                  'panel px-3 py-2.5 text-left transition focus-ring',
                  t.slug === theme ? 'border-accent/50' : 'hover:border-line-strong',
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-ink">{t.label}</span>
                  <span className="num text-sm text-ink-3">{t.count}</span>
                </div>
                <p className="mt-0.5 text-2xs leading-relaxed text-ink-3">{t.description}</p>
              </button>
            ))}
          </div>

          {selectedTheme ? (
            <Panel>
              <PanelHeader
                title={selectedTheme.label}
                subtitle={`${selectedTheme.description} ${themeCompanies.length} covered ${themeCompanies.length === 1 ? 'company' : 'companies'} carry this tag.`}
              />
              <DataTable
                columns={companyColumns}
                rows={themeCompanies}
                rowKey={(c) => c.ticker}
                initialSort={{ key: 'cap', direction: 'desc' }}
                dense
                searchable
                searchValue={(c) => `${c.ticker} ${c.name} ${c.industry}`}
                emptyTitle="No companies carry this theme"
              />
            </Panel>
          ) : null}

          <InlineNote tone="info">
            A theme is a tag on the company record, not a computed classification. It says where the desk has decided a
            name belongs, and a company can carry more than one.
          </InlineNote>
        </div>
      ) : null}

      {tab === 'map' ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="label">Quality measured by</span>
            <Segmented
              value={mapAxis}
              onChange={setMapAxis}
              options={[
                { value: 'roic', label: 'ROIC' },
                { value: 'growth', label: 'Revenue growth' },
              ]}
            />
          </div>
          <ScatterPlot
            title={mapAxis === 'roic' ? 'Return on capital against valuation' : 'Growth against valuation'}
            subtitle="Each point is a covered company. Banks are omitted — neither axis is meaningful for them."
            points={props.companies
              .filter((c) => !c.bankLike)
              .map((c) => ({
                key: c.ticker,
                label: c.ticker,
                x: mapAxis === 'roic' ? c.roic : c.revenueGrowth,
                y: c.evEbitda,
                group: c.sector,
              }))}
            xLabel={mapAxis === 'roic' ? 'ROIC' : 'Revenue growth'}
            yLabel="EV / EBITDA"
            xFormat="percent"
            yFormat="multiple"
            height={420}
            footnote="A company without one of the two measures is omitted rather than plotted at zero."
          />
          <div className="grid gap-3 lg:grid-cols-2">
            <Panel>
              <PanelHeader title="Highest quality, cheapest" subtitle="Above-median ROIC and below-median EV/EBITDA" />
              <QuadrantList companies={props.companies} quadrant="cheap-quality" />
            </Panel>
            <Panel>
              <PanelHeader title="Expensive for what it earns" subtitle="Below-median ROIC and above-median EV/EBITDA" />
              <QuadrantList companies={props.companies} quadrant="expensive-poor" />
            </Panel>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function QuadrantList({ companies, quadrant }: { companies: CompanyRow[]; quadrant: 'cheap-quality' | 'expensive-poor' }) {
  const usable = companies.filter((c) => !c.bankLike && isNum(c.roic) && isNum(c.evEbitda));
  if (usable.length < 4) {
    return <p className="px-3 pb-3 text-xs text-ink-4">Not enough companies with both measures to split the universe.</p>;
  }
  const median = (xs: number[]) => {
    const s = xs.slice().sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  };
  const roicMedian = median(usable.map((c) => c.roic as number));
  const evMedian = median(usable.map((c) => c.evEbitda as number));
  const rows = usable
    .filter((c) =>
      quadrant === 'cheap-quality'
        ? (c.roic as number) > roicMedian && (c.evEbitda as number) < evMedian
        : (c.roic as number) < roicMedian && (c.evEbitda as number) > evMedian,
    )
    .sort((a, b) =>
      quadrant === 'cheap-quality'
        ? (b.roic as number) - (a.roic as number)
        : (a.roic as number) - (b.roic as number),
    );

  if (!rows.length) {
    return <p className="px-3 pb-3 text-xs text-ink-4">No company sits in this quadrant.</p>;
  }
  return (
    <div className="px-3 pb-3 divide-y divide-line">
      {rows.map((c) => (
        <div key={c.ticker} className="flex items-baseline justify-between gap-3 py-1.5">
          <div className="min-w-0">
            <Link href={`/companies/${c.ticker}`} className="text-xs font-semibold text-ink hover:text-accent">{c.ticker}</Link>
            <span className="ml-2 text-2xs text-ink-4">{c.sector}</span>
          </div>
          <div className="flex shrink-0 items-baseline gap-3 text-2xs">
            <span className="num text-ink-2">{formatPercent(c.roic)} ROIC</span>
            <span className="num text-ink-3">{isNum(c.evEbitda) ? `${(c.evEbitda as number).toFixed(1)}x` : DASH}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export { Badge };
