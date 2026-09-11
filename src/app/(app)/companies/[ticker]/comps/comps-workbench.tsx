'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, InlineNote, Panel, PanelHeader, Segmented, Select, Field, NumberInput, cx } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { DataTable, type Column } from '@/components/ui/table';
import { MetricCard, Num, StatRow } from '@/components/ui/values';
import { LineSeriesChart, ScatterPlot } from '@/components/charts';
import { impliedValuation, type CompanyMultiples, type ImpliedBasis, type MultipleKey, type StatSummary } from '@/lib/finance/comps';
import { formatMultiple, formatPercent, ordinal, DASH } from '@/lib/finance/format';
import { downloadText, toCsv } from '@/lib/import/csv';
import type { Currency } from '@/lib/finance/types';
import { isNum } from '@/lib/finance/core';

const LABELS: Record<string, string> = {
  evRevenue: 'EV / Revenue', evEbitda: 'EV / EBITDA', evEbit: 'EV / EBIT',
  pe: 'P / E', pb: 'P / Book', ps: 'P / Sales', fcfYield: 'FCF yield', dividendYield: 'Dividend yield',
  revenueGrowth: 'Revenue growth', ebitdaGrowth: 'EBITDA growth', ebitdaMargin: 'EBITDA margin',
  roic: 'ROIC', roe: 'ROE', netDebtToEbitda: 'Net debt / EBITDA',
};

const FORMATS: Record<string, 'multiple' | 'percent'> = {
  evRevenue: 'multiple', evEbitda: 'multiple', evEbit: 'multiple', pe: 'multiple', pb: 'multiple', ps: 'multiple',
  fcfYield: 'percent', dividendYield: 'percent', revenueGrowth: 'percent', ebitdaGrowth: 'percent',
  ebitdaMargin: 'percent', roic: 'percent', roe: 'percent', netDebtToEbitda: 'multiple',
};

const BASIS_OPTIONS: { value: ImpliedBasis; label: string; metricKey: keyof AnchorMetrics; statKey: MultipleKey }[] = [
  { value: 'EV_EBITDA', label: 'EV / EBITDA', metricKey: 'ebitda', statKey: 'evEbitda' },
  { value: 'EV_EBIT', label: 'EV / EBIT', metricKey: 'ebit', statKey: 'evEbit' },
  { value: 'EV_REVENUE', label: 'EV / Revenue', metricKey: 'revenue', statKey: 'evRevenue' },
  { value: 'PE', label: 'P / E', metricKey: 'netIncome', statKey: 'pe' },
  { value: 'PB', label: 'P / Book', metricKey: 'equityBookValue', statKey: 'pb' },
  { value: 'PS', label: 'P / Sales', metricKey: 'revenue', statKey: 'ps' },
];

interface AnchorMetrics {
  revenue: number | null; ebitda: number | null; ebit: number | null; netIncome: number | null;
  equityBookValue: number | null; netDebt: number | null; sharesOutstanding: number | null;
  price: number | null; basisLabel: string;
}

type Row = CompanyMultiples & { isAnchor: boolean };

export function CompsWorkbench(props: {
  ticker: string;
  currency: Currency;
  bankLike: boolean;
  note: string | null;
  anchor: CompanyMultiples;
  peers: CompanyMultiples[];
  stats: Record<string, StatSummary>;
  multipleKeys: MultipleKey[];
  operatingKeys: MultipleKey[];
  anchorPercentiles: Record<string, number | null>;
  anchorMetrics: AnchorMetrics;
  historical: { metric: string; label: string; points: { date: string; value: number | null }[]; stats: ReturnType<typeof import('@/lib/finance/comps').historicalMultipleStats> }[];
  peerGroups: { id: string; name: string; anchorTicker: string | null; tickers: string[] }[];
}) {
  const [tab, setTab] = useState<'table' | 'implied' | 'historical' | 'map'>('table');
  const [basis, setBasis] = useState<ImpliedBasis>(props.bankLike ? 'PE' : 'EV_EBITDA');
  const [statChoice, setStatChoice] = useState<'median' | 'mean' | 'p25' | 'p75' | 'custom'>('median');
  const [customMultiple, setCustomMultiple] = useState<number>(8);
  const [historicalMetric, setHistoricalMetric] = useState<string>(props.historical[0]?.metric ?? 'evEbitda');

  const rows: Row[] = useMemo(
    () => [{ ...props.anchor, isAnchor: true }, ...props.peers.map((p) => ({ ...p, isAnchor: false }))],
    [props.anchor, props.peers],
  );

  const allKeys = [...props.multipleKeys, ...props.operatingKeys];

  const columns: Column<Row>[] = [
    {
      key: 'ticker', header: 'Company', sticky: true, width: '160px',
      value: (r) => r.ticker,
      render: (r) => (
        <Link href={`/companies/${r.ticker}`} className={cx('block', r.isAnchor && 'font-semibold')}>
          <span className="num text-xs text-ink">{r.ticker}</span>
          <span className="block truncate text-2xs text-ink-4">{r.name}</span>
        </Link>
      ),
    },
    { key: 'marketCap', header: 'Market cap', align: 'right', value: (r) => r.marketCap, render: (r) => <Num value={r.marketCap} format="currencyMillions" currency={props.currency} /> },
    { key: 'ev', header: 'EV', align: 'right', value: (r) => r.enterpriseValue, render: (r) => <Num value={r.enterpriseValue} format="currencyMillions" currency={props.currency} /> },
    ...allKeys.map((k): Column<Row> => ({
      key: k, header: LABELS[k] ?? k, align: 'right',
      value: (r) => r[k] as number | null,
      render: (r) => <Num value={r[k] as number | null} format={FORMATS[k] ?? 'multiple'} />,
      headerClassName: k === props.operatingKeys[0] ? 'border-l border-line' : undefined,
      className: k === props.operatingKeys[0] ? 'border-l border-line' : undefined,
    })),
  ];

  const statRows: { label: string; pick: (s: StatSummary) => number | null }[] = [
    { label: 'Mean', pick: (s) => s.mean },
    { label: 'Median', pick: (s) => s.median },
    { label: '25th percentile', pick: (s) => s.p25 },
    { label: '75th percentile', pick: (s) => s.p75 },
    { label: 'Min', pick: (s) => s.min },
    { label: 'Max', pick: (s) => s.max },
  ];

  const basisDef = BASIS_OPTIONS.find((b) => b.value === basis)!;
  const stat = props.stats[basisDef.statKey];
  const multiple = statChoice === 'custom' ? customMultiple : (stat?.[statChoice] ?? null);
  const implied = multiple === null ? null : impliedValuation({
    basis,
    multiple,
    metric: props.anchorMetrics[basisDef.metricKey] as number | null,
    netDebt: props.anchorMetrics.netDebt,
    sharesOutstanding: props.anchorMetrics.sharesOutstanding,
    currentPrice: props.anchorMetrics.price,
  });

  const historicalSeries = props.historical.find((h) => h.metric === historicalMetric);

  const exportCsv = () => {
    downloadText(
      `${props.ticker}-comps-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(
        ['Ticker', 'Name', 'Market cap', 'Enterprise value', ...allKeys.map((k) => LABELS[k] ?? k)],
        rows.map((r) => [r.ticker, r.name, r.marketCap, r.enterpriseValue, ...allKeys.map((k) => r[k] as number | null)]),
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          value={tab} onChange={(v) => setTab(v as typeof tab)}
          options={[
            { value: 'table', label: 'Peer table' },
            { value: 'implied', label: 'Implied valuation' },
            { value: 'historical', label: 'Historical range' },
            { value: 'map', label: 'Value map' },
          ]}
        />
        <span className="num text-2xs text-ink-4">
          {props.peers.length} peers · basis {props.anchorMetrics.basisLabel}
        </span>
        <Button className="ml-auto" size="sm" icon={<Icon.Download size={12} />} onClick={exportCsv}>Export CSV</Button>
      </div>

      {props.note ? <InlineNote tone="info">{props.note}</InlineNote> : null}

      {tab === 'table' ? (
        <>
          <DataTable
            columns={columns} rows={rows} rowKey={(r) => r.ticker}
            initialSort={{ key: props.bankLike ? 'pe' : 'evEbitda', direction: 'asc' }}
            highlightRow={(r) => r.isAnchor}
            dense
          />
          <Panel padded={false}>
            <div className="p-3 pb-2">
              <PanelHeader title="Peer statistics" subtitle={`Computed across ${props.peers.length} peers, excluding values that are not meaningful.`} dense />
            </div>
            <div className="overflow-auto">
              <table className="w-full border-collapse text-base">
                <thead>
                  <tr className="bg-raised">
                    <th className="label sticky left-0 border-b border-line bg-raised px-2.5 py-1.5 text-left min-w-[130px]">Statistic</th>
                    {allKeys.map((k) => (
                      <th key={k} className="label border-b border-line bg-raised px-2.5 py-1.5 text-right whitespace-nowrap">{LABELS[k] ?? k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {statRows.map((sr) => (
                    <tr key={sr.label} className="border-b border-line/50">
                      <td className="sticky left-0 bg-panel px-2.5 py-1 text-ink-2">{sr.label}</td>
                      {allKeys.map((k) => (
                        <td key={k} className="px-2.5 py-1 text-right">
                          <Num value={props.stats[k] ? sr.pick(props.stats[k]) : null} format={FORMATS[k] ?? 'multiple'} />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-t border-line-strong bg-accent/[0.05] font-medium">
                    <td className="sticky left-0 bg-accent/[0.05] px-2.5 py-1 text-ink">{props.ticker}</td>
                    {allKeys.map((k) => (
                      <td key={k} className="px-2.5 py-1 text-right">
                        <Num value={props.anchor[k] as number | null} format={FORMATS[k] ?? 'multiple'} />
                      </td>
                    ))}
                  </tr>
                  <tr className="text-ink-3">
                    <td className="sticky left-0 bg-panel px-2.5 py-1 text-2xs">Percentile in the peer set</td>
                    {allKeys.map((k) => (
                      <td key={k} className="px-2.5 py-1 text-right text-2xs num">
                        {isNum(props.anchorPercentiles[k]) ? ordinal((props.anchorPercentiles[k] as number) * 100) : DASH}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      ) : null}

      {tab === 'implied' ? (
        <div className="grid gap-4 lg:grid-cols-[330px_minmax(0,1fr)]">
          <Panel>
            <PanelHeader title="Implied valuation" subtitle="Apply a peer multiple to this company's own metric." dense />
            <Field label="Multiple basis" className="mb-3">
              <Select value={basis} onChange={(e) => setBasis(e.target.value as ImpliedBasis)}>
                {BASIS_OPTIONS
                  .filter((b) => !props.bankLike || b.value === 'PE' || b.value === 'PB' || b.value === 'PS')
                  .map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </Select>
            </Field>
            <Field label="Multiple to apply" className="mb-3">
              <Select value={statChoice} onChange={(e) => setStatChoice(e.target.value as typeof statChoice)}>
                <option value="median">Peer median</option>
                <option value="mean">Peer mean</option>
                <option value="p25">Peer 25th percentile</option>
                <option value="p75">Peer 75th percentile</option>
                <option value="custom">Custom</option>
              </Select>
            </Field>
            {statChoice === 'custom' ? (
              <Field label="Custom multiple" className="mb-3">
                <NumberInput value={customMultiple} onValueChange={setCustomMultiple} step="0.25" suffix="x" />
              </Field>
            ) : null}

            <div className="mt-3 border-t border-line pt-3">
              <StatRow label="Multiple used" value={<Num value={multiple} format="multiple" className="font-medium" />} />
              <StatRow label={`${props.ticker} metric`} value={<Num value={props.anchorMetrics[basisDef.metricKey] as number | null} format="currencyMillions" currency={props.currency} />} />
              {implied?.equityBased ? null : (
                <StatRow label="Implied enterprise value" value={<Num value={implied?.impliedEnterpriseValue ?? null} format="currencyMillions" currency={props.currency} />} />
              )}
              {implied?.equityBased ? null : (
                <StatRow label="Less net debt" value={<Num value={props.anchorMetrics.netDebt === null ? null : -props.anchorMetrics.netDebt} format="currencyMillions" currency={props.currency} />} />
              )}
              <StatRow label="Implied equity value" value={<Num value={implied?.impliedEquityValue ?? null} format="currencyMillions" currency={props.currency} />} />
              <StatRow label="÷ shares" value={<Num value={props.anchorMetrics.sharesOutstanding} format="shares" />} />
            </div>
          </Panel>

          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <MetricCard label="Implied share price" value={implied?.impliedSharePrice ?? null} format="currency" currency={props.currency} decimals={2} accent />
              <MetricCard label="Current price" value={props.anchorMetrics.price} format="currency" currency={props.currency} decimals={2} />
              <MetricCard label="Upside" value={implied?.upside ?? null} format="percentSigned" />
            </div>
            <Panel padded={false}>
              <div className="p-3 pb-2"><PanelHeader title="Implied price across every peer statistic" dense /></div>
              <table className="w-full border-collapse text-base">
                <thead>
                  <tr className="bg-raised">
                    <th className="label border-b border-line px-2.5 py-1.5 text-left">Statistic</th>
                    <th className="label border-b border-line px-2.5 py-1.5 text-right">Multiple</th>
                    <th className="label border-b border-line px-2.5 py-1.5 text-right">Implied price</th>
                    <th className="label border-b border-line px-2.5 py-1.5 text-right">Upside</th>
                  </tr>
                </thead>
                <tbody>
                  {(['p25', 'median', 'mean', 'p75'] as const).map((k) => {
                    const mult = stat?.[k] ?? null;
                    const r = mult === null ? null : impliedValuation({
                      basis, multiple: mult,
                      metric: props.anchorMetrics[basisDef.metricKey] as number | null,
                      netDebt: props.anchorMetrics.netDebt,
                      sharesOutstanding: props.anchorMetrics.sharesOutstanding,
                      currentPrice: props.anchorMetrics.price,
                    });
                    return (
                      <tr key={k} className="border-b border-line/50">
                        <td className="px-2.5 py-1 text-ink-2">
                          {k === 'p25' ? '25th percentile' : k === 'p75' ? '75th percentile' : k === 'median' ? 'Median' : 'Mean'}
                        </td>
                        <td className="px-2.5 py-1 text-right"><Num value={mult} format="multiple" /></td>
                        <td className="px-2.5 py-1 text-right"><Num value={r?.impliedSharePrice ?? null} format="currency" currency={props.currency} decimals={2} /></td>
                        <td className="px-2.5 py-1 text-right"><Num value={r?.upside ?? null} format="percentSigned" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Panel>
          </div>
        </div>
      ) : null}

      {tab === 'historical' ? (
        <div className="space-y-4">
          <Segmented
            value={historicalMetric} onChange={setHistoricalMetric}
            options={props.historical.map((h) => ({ value: h.metric, label: h.label }))}
          />
          {historicalSeries ? (
            <>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                <MetricCard label="Current" value={historicalSeries.stats.current} format={historicalSeries.metric === 'fcfYield' ? 'percent' : 'multiple'} accent />
                <MetricCard label="5Y median" value={historicalSeries.stats.median5y} format={historicalSeries.metric === 'fcfYield' ? 'percent' : 'multiple'} />
                <MetricCard label="5Y average" value={historicalSeries.stats.avg5y} format={historicalSeries.metric === 'fcfYield' ? 'percent' : 'multiple'} />
                <MetricCard label="5Y minimum" value={historicalSeries.stats.min5y} format={historicalSeries.metric === 'fcfYield' ? 'percent' : 'multiple'} />
                <MetricCard label="5Y maximum" value={historicalSeries.stats.max5y} format={historicalSeries.metric === 'fcfYield' ? 'percent' : 'multiple'} />
                <MetricCard
                  label="Percentile in range"
                  value={historicalSeries.stats.percentileIn5y} format="percent"
                  sublabel={isNum(historicalSeries.stats.discountToMedian5y)
                    ? `${formatPercent(Math.abs(historicalSeries.stats.discountToMedian5y as number))} ${(historicalSeries.stats.discountToMedian5y as number) < 0 ? 'below' : 'above'} median`
                    : undefined}
                />
              </div>

              <LineSeriesChart
                data={historicalSeries.points.map((p) => ({ date: p.date, value: p.value }))}
                xKey="date" height={280}
                series={[{ key: 'value', label: historicalSeries.label, format: historicalSeries.metric === 'fcfYield' ? 'percent' : 'multiple' }]}
                yFormat={historicalSeries.metric === 'fcfYield' ? 'percent' : 'multiple'}
                referenceValue={historicalSeries.stats.median5y}
                referenceLabel={`5Y median ${historicalSeries.metric === 'fcfYield' ? formatPercent(historicalSeries.stats.median5y) : formatMultiple(historicalSeries.stats.median5y)}`}
                title={`${historicalSeries.label} — own history`}
                subtitle="Each point pairs the price on that date with the fundamentals that were public at the time"
                footnote="Trailing-twelve-month fundamentals are assumed to become public forty days after the quarter end, so the series never uses figures the market had not seen."
              />

              {isNum(historicalSeries.stats.percentileIn5y) ? (
                <InlineNote tone={(historicalSeries.stats.percentileIn5y as number) < 0.3 ? 'pos' : (historicalSeries.stats.percentileIn5y as number) > 0.7 ? 'warn' : 'info'}>
                  {props.ticker} trades at the {ordinal((historicalSeries.stats.percentileIn5y as number) * 100)} percentile of its own five-year {historicalSeries.label} range.
                  {' '}A low percentile is cheap relative to its own history — it is not, by itself, a reason to own the shares:
                  the question is whether the earnings the multiple is applied to are themselves durable.
                </InlineNote>
              ) : null}
            </>
          ) : (
            <InlineNote tone="info">Not enough price and statement history to reconstruct this multiple.</InlineNote>
          )}
        </div>
      ) : null}

      {tab === 'map' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <ScatterPlot
            points={rows.map((r) => ({
              key: r.ticker, label: r.ticker,
              x: r.roic ?? r.roe, y: props.bankLike ? r.pe : r.evEbitda,
              size: r.marketCap ?? undefined,
            }))}
            xLabel={props.bankLike ? 'ROE' : 'ROIC'}
            yLabel={props.bankLike ? 'P / E' : 'EV / EBITDA'}
            xFormat="percent" yFormat="multiple"
            highlightKey={props.ticker}
            title="Returns against rating"
            subtitle="Bubble size is market capitalisation; the highlighted point is this company"
            height={320}
            footnote="A company above the diagonal is paying more per unit of return than its peers."
          />
          <ScatterPlot
            points={rows.map((r) => ({
              key: r.ticker, label: r.ticker,
              x: r.revenueGrowth, y: props.bankLike ? r.pe : r.evEbitda,
              size: r.marketCap ?? undefined,
            }))}
            xLabel="Revenue growth"
            yLabel={props.bankLike ? 'P / E' : 'EV / EBITDA'}
            xFormat="percent" yFormat="multiple"
            highlightKey={props.ticker}
            title="Growth against rating"
            subtitle="What the market pays for each point of growth"
            height={320}
          />
        </div>
      ) : null}

      {props.peerGroups.length ? (
        <Panel>
          <PanelHeader title="Peer groups in this workspace" subtitle="Defined sets used across the comparables module." dense />
          <div className="flex flex-wrap gap-2">
            {props.peerGroups.map((g) => (
              <Badge key={g.id} tone={g.tickers.includes(props.ticker) ? 'accent' : 'outline'}>
                {g.name} · {g.tickers.length}
              </Badge>
            ))}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
