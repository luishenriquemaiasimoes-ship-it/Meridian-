'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, cx, Field, InlineNote, Modal, NumberInput, Panel, PanelHeader,
  Segmented, Select, Input, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { DataTable, type Column } from '@/components/ui/table';
import { BarCell, Delta, MetricCard, Num, RecommendationBadge, StatRow, ThesisVerdictBadge } from '@/components/ui/values';
import { BarSeriesChart, LineSeriesChart } from '@/components/charts';
import { formatDate, formatPercent } from '@/lib/finance/format';
import { downloadText, toCsv } from '@/lib/import/csv';
import type { Currency } from '@/lib/finance/types';
import { isNum } from '@/lib/finance/core';

type Tab = 'positions' | 'performance' | 'attribution' | 'exposure' | 'valuation' | 'rebalance' | 'transactions';

interface PositionRow {
  id: string; ticker: string; name: string; sector: string; country: string; currency: string;
  quantity: number; averagePrice: number; currentPrice: number | null; marketValue: number | null;
  weight: number | null; unrealizedPnl: number | null; unrealizedPnlPct: number | null;
  dailyChangePct: number | null; targetPrice: number | null; upsideToTarget: number | null;
  pe: number | null; evEbitda: number | null; roic: number | null; fcfYield: number | null; beta: number | null;
  thesisVerdict: string | null; recommendation: string | null;
}

interface ContributionRow { key: string; label?: string; weight: number | null; return: number | null; contribution: number | null; pnl?: number | null }
interface ExposureRow { key: string; label: string; marketValue: number; weight: number; count: number }

export function PortfolioWorkbench(props: {
  portfolios: { id: string; name: string; isModel: boolean }[];
  selectedId: string;
  initialTab: string;
  currency: Currency;
  canWrite: boolean;
  canRebalance: boolean;
  summary: {
    totalMarketValue: number | null; investedValue: number | null; cash: number;
    unrealizedPnl: number | null; unrealizedPnlPct: number | null;
    dailyPnl: number | null; dailyPnlPct: number | null; positionCount: number;
  };
  positions: PositionRow[];
  contributions: ContributionRow[];
  sectorContribution: ContributionRow[];
  countryContribution: ContributionRow[];
  exposures: { sector: ExposureRow[]; country: ExposureRow[]; currency: ExposureRow[]; marketCap: ExposureRow[] };
  concentration: { top1: number | null; top5: number | null; top10: number | null; hhi: number | null; effectiveNumberOfPositions: number | null; positionCount: number };
  lookThrough: { key: string; label: string; value: number | null; coverage: number; format: string; benchmark: number | null }[];
  navSeries: { date: string; value: number; unitValue: number; benchmark: number }[];
  periodReturns: { label: string; portfolio: number | null; benchmark: number | null; active: number | null }[];
  performance: { totalReturn: number | null; annualizedReturn: number | null; volatility: number | null; sharpe: number | null; maxDrawdown: number | null };
  benchmarkPerformance: { totalReturn: number | null; annualizedReturn: number | null };
  benchmarkCode: string;
  rebalanceRows: { ticker: string; name: string; currentWeight: number | null; targetWeight: number; difference: number | null; action: string; notionalDelta: number | null; shareDelta: number | null }[];
  targetsDefined: boolean;
  transactions: { id: string; ticker: string | null; kind: string; quantity: number; price: number; amount: number; tradeDate: string; note: string | null; createdBy: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>((props.initialTab as Tab) ?? 'positions');
  const [tradeModal, setTradeModal] = useState(false);
  const [cashModal, setCashModal] = useState(false);
  const [targets, setTargets] = useState<Record<string, number>>(
    () => Object.fromEntries(props.rebalanceRows.map((r) => [r.ticker, r.targetWeight])),
  );
  const [trade, setTrade] = useState({ ticker: '', quantity: 0, averagePrice: 0, note: '' });
  const [cashForm, setCashForm] = useState({ kind: 'DEPOSIT', amount: 0, note: '' });
  const [saving, setSaving] = useState(false);

  const { currency } = props;

  const navIndexed = useMemo(() => {
    if (props.navSeries.length < 2) return [];
    const step = Math.max(1, Math.floor(props.navSeries.length / 200));
    const sampled = props.navSeries.filter((_, i) => i % step === 0 || i === props.navSeries.length - 1);
    const base = sampled[0];
    // Indexed on the unit value, not the NAV: subscriptions into the fund must
    // not read as performance.
    return sampled.map((p) => ({
      date: p.date,
      portfolio: (p.unitValue / base.unitValue) * 100,
      benchmark: (p.benchmark / base.benchmark) * 100,
    }));
  }, [props.navSeries]);

  const submitTrade = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/portfolio/positions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioId: props.selectedId, ...trade, ticker: trade.ticker.toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Trade not recorded', description: data.error }); return; }
      toast.push({ tone: 'pos', title: 'Position updated', description: `${trade.ticker.toUpperCase()} now at ${data.position.quantity.toLocaleString('pt-BR')} shares.` });
      setTradeModal(false);
      setTrade({ ticker: '', quantity: 0, averagePrice: 0, note: '' });
      router.refresh();
    } finally { setSaving(false); }
  };

  const submitCash = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/portfolio/transactions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioId: props.selectedId, ...cashForm }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Not recorded', description: data.error }); return; }
      toast.push({ tone: 'pos', title: 'Cash movement recorded' });
      setCashModal(false);
      setCashForm({ kind: 'DEPOSIT', amount: 0, note: '' });
      router.refresh();
    } finally { setSaving(false); }
  };

  const saveTargets = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/portfolio/targets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId: props.selectedId,
          targets: Object.entries(targets).map(([ticker, targetWeight]) => ({ ticker, targetWeight })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Could not save targets', description: data.error }); return; }
      toast.push({
        tone: data.totalWeight > 1.001 ? 'warn' : 'pos',
        title: 'Targets saved',
        description: `Weights sum to ${formatPercent(data.totalWeight, 1)}${data.totalWeight > 1.001 ? ' — above 100%.' : '.'}`,
      });
      router.refresh();
    } finally { setSaving(false); }
  };

  const positionColumns: Column<PositionRow>[] = [
    {
      key: 'ticker', header: 'Position', sticky: true, width: '170px', value: (r) => r.ticker,
      render: (r) => (
        <Link href={`/companies/${r.ticker}`} className="block">
          <span className="num text-xs font-medium text-ink">{r.ticker}</span>
          <span className="block truncate text-2xs text-ink-4">{r.name}</span>
        </Link>
      ),
    },
    { key: 'quantity', header: 'Shares', align: 'right', value: (r) => r.quantity, format: 'number' },
    { key: 'averagePrice', header: 'Average', align: 'right', value: (r) => r.averagePrice, render: (r) => <Num value={r.averagePrice} format="currency" currency={r.currency as Currency} decimals={2} /> },
    { key: 'currentPrice', header: 'Price', align: 'right', value: (r) => r.currentPrice, render: (r) => <Num value={r.currentPrice} format="currency" currency={r.currency as Currency} decimals={2} /> },
    { key: 'dailyChangePct', header: 'Day', align: 'right', value: (r) => r.dailyChangePct, render: (r) => <Delta value={r.dailyChangePct} /> },
    { key: 'marketValue', header: 'Market value', align: 'right', value: (r) => r.marketValue, render: (r) => <Num value={r.marketValue} format="currencyCompact" currency={currency} /> },
    {
      key: 'weight', header: 'Weight', align: 'right', width: '130px', value: (r) => r.weight,
      render: (r) => <BarCell value={r.weight} max={Math.max(...props.positions.map((p) => p.weight ?? 0), 0.01)} />,
    },
    { key: 'unrealizedPnl', header: 'P&L', align: 'right', value: (r) => r.unrealizedPnl, render: (r) => <Delta value={r.unrealizedPnl} format="currencyCompact" currency={currency} /> },
    { key: 'unrealizedPnlPct', header: 'P&L %', align: 'right', value: (r) => r.unrealizedPnlPct, render: (r) => <Delta value={r.unrealizedPnlPct} /> },
    { key: 'upsideToTarget', header: 'To target', align: 'right', value: (r) => r.upsideToTarget, render: (r) => <Delta value={r.upsideToTarget} /> },
    { key: 'recommendation', header: 'View', align: 'center', value: (r) => r.recommendation ?? '', render: (r) => <RecommendationBadge value={r.recommendation} /> },
    { key: 'thesisVerdict', header: 'Thesis', align: 'center', value: (r) => r.thesisVerdict ?? '', render: (r) => (r.thesisVerdict ? <ThesisVerdictBadge verdict={r.thesisVerdict} /> : <span className="text-ink-4">—</span>) },
  ];

  const exportPositions = () => {
    downloadText(
      `portfolio-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(
        ['Ticker', 'Name', 'Sector', 'Shares', 'Average price', 'Price', 'Market value', 'Weight', 'P&L', 'P&L %', 'Target price', 'Upside'],
        props.positions.map((p) => [
          p.ticker, p.name, p.sector, p.quantity, p.averagePrice, p.currentPrice, p.marketValue,
          p.weight, p.unrealizedPnl, p.unrealizedPnlPct, p.targetPrice, p.upsideToTarget,
        ]),
      ),
    );
  };

  const tabs: { value: Tab; label: string }[] = [
    { value: 'positions', label: 'Positions' },
    { value: 'performance', label: 'Performance' },
    { value: 'attribution', label: 'Attribution' },
    { value: 'exposure', label: 'Exposure' },
    { value: 'valuation', label: 'Look-through' },
    { value: 'rebalance', label: 'Rebalancing' },
    { value: 'transactions', label: 'Transactions' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Net asset value" value={props.summary.totalMarketValue} format="currencyCompact" currency={currency} accent />
        <MetricCard label="Positions" value={props.summary.investedValue} format="currencyCompact" currency={currency}
          tooltip="Market value of the holdings, excluding cash."
          sublabel={`${props.summary.positionCount} positions`} />
        <MetricCard label="Cash" value={props.summary.cash} format="currencyCompact" currency={currency}
          sublabel={isNum(props.summary.totalMarketValue) ? `${formatPercent(props.summary.cash / (props.summary.totalMarketValue as number))} of NAV` : undefined} />
        <MetricCard label="Unrealised P&L" value={props.summary.unrealizedPnl} format="currencyCompact" currency={currency} delta={props.summary.unrealizedPnlPct} />
        <MetricCard label="Day" value={props.summary.dailyPnl} format="currencyCompact" currency={currency} delta={props.summary.dailyPnlPct} />
        <MetricCard label="Since inception" value={props.performance.totalReturn} format="percentSigned"
          sublabel={`${props.benchmarkCode} ${formatPercent(props.benchmarkPerformance.totalReturn, 1, { signed: true })}`} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Segmented value={tab} onChange={(v) => setTab(v as Tab)} options={tabs} />
        {props.portfolios.length > 1 ? (
          <Select
            value={props.selectedId}
            onChange={(e) => router.push(`/portfolio?id=${e.target.value}&tab=${tab}`)}
            className="w-[200px]"
          >
            {props.portfolios.map((p) => <option key={p.id} value={p.id}>{p.name}{p.isModel ? ' (model)' : ''}</option>)}
          </Select>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" icon={<Icon.Download size={12} />} onClick={exportPositions}>CSV</Button>
          <Button size="sm" icon={<Icon.Download size={12} />} onClick={() => window.open(`/api/export/portfolio?id=${props.selectedId}`, '_blank')}>Excel</Button>
          {props.canWrite ? (
            <>
              <Button size="sm" icon={<Icon.Plus size={12} />} onClick={() => setCashModal(true)}>Cash</Button>
              <Button size="sm" variant="primary" icon={<Icon.Plus size={12} />} onClick={() => setTradeModal(true)}>Record trade</Button>
            </>
          ) : <Badge tone="outline">Read-only role</Badge>}
        </div>
      </div>

      {tab === 'positions' ? (
        <DataTable
          columns={positionColumns} rows={props.positions} rowKey={(r) => r.id}
          onRowClick={(r) => router.push(`/companies/${r.ticker}`)}
          initialSort={{ key: 'weight', direction: 'desc' }}
          searchable searchPlaceholder="Filter positions…" searchValue={(r) => `${r.ticker} ${r.name} ${r.sector}`}
          maxHeight="calc(100vh - 340px)" dense
        />
      ) : null}

      {tab === 'performance' ? (
        <div className="space-y-4">
          {navIndexed.length ? (
            <LineSeriesChart
              data={navIndexed} xKey="date" height={320}
              series={[
                { key: 'portfolio', label: 'Portfolio', format: 'ratio', decimals: 1 },
                { key: 'benchmark', label: props.benchmarkCode, format: 'ratio', decimals: 1 },
              ]}
              yFormat="ratio"
              title="Performance against the benchmark"
              subtitle="Unit value and index, both rebased to 100 at inception"
              footnote="Measured on the fund's time-weighted unit value, so a subscription or a redemption never reads as a return."
            />
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Panel padded={false}>
              <div className="p-3 pb-2"><PanelHeader title="Period returns" dense /></div>
              <table className="w-full border-collapse text-base">
                <thead>
                  <tr className="bg-raised">
                    <th className="label border-b border-line px-2.5 py-1.5 text-left">Period</th>
                    <th className="label border-b border-line px-2.5 py-1.5 text-right">Portfolio</th>
                    <th className="label border-b border-line px-2.5 py-1.5 text-right">{props.benchmarkCode}</th>
                    <th className="label border-b border-line px-2.5 py-1.5 text-right">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {props.periodReturns.map((p) => (
                    <tr key={p.label} className="border-b border-line/50">
                      <td className="px-2.5 py-1.5 text-ink-2">{p.label}</td>
                      <td className="px-2.5 py-1.5 text-right"><Delta value={p.portfolio} /></td>
                      <td className="px-2.5 py-1.5 text-right"><Num value={p.benchmark} format="percentSigned" muted /></td>
                      <td className="px-2.5 py-1.5 text-right"><Delta value={p.active} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>

            <Panel>
              <PanelHeader title="Risk-adjusted" subtitle="Computed on the daily NAV series." dense />
              <StatRow label="Annualised return" value={<Num value={props.performance.annualizedReturn} format="percentSigned" />} />
              <StatRow label="Annualised volatility" value={<Num value={props.performance.volatility} format="percent" />} />
              <StatRow label="Sharpe ratio" hint="Excess return over the workspace risk-free rate, per unit of volatility." value={<Num value={props.performance.sharpe} format="ratio" decimals={2} />} />
              <StatRow label="Maximum drawdown" value={<Num value={props.performance.maxDrawdown} format="percent" />} />
              <div className="mt-2 border-t border-line pt-2">
                <Link href="/risk" className="text-xs text-accent hover:underline">Full risk analysis</Link>
              </div>
            </Panel>
          </div>
        </div>
      ) : null}

      {tab === 'attribution' ? (
        <div className="space-y-4">
          <InlineNote tone="info">
            Contribution is the beginning-of-period weight multiplied by the position return, so the rows sum to the
            return on invested capital. It answers which decisions produced the result, not which names went up.
          </InlineNote>
          <div className="grid gap-4 lg:grid-cols-2">
            <BarSeriesChart
              data={props.contributions.slice(0, 8).map((c) => ({ label: c.key, contribution: c.contribution }))}
              xKey="label" horizontal colorBySign height={260}
              series={[{ key: 'contribution', label: 'Contribution', format: 'percent' }]}
              title="Top contributors" subtitle="Weight × return, by position" yFormat="percent"
            />
            <BarSeriesChart
              data={props.contributions.slice(-8).reverse().map((c) => ({ label: c.key, contribution: c.contribution }))}
              xKey="label" horizontal colorBySign height={260}
              series={[{ key: 'contribution', label: 'Contribution', format: 'percent' }]}
              title="Largest detractors" subtitle="The same measure, from the bottom" yFormat="percent"
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <AttributionTable title="By sector" rows={props.sectorContribution} />
            <AttributionTable title="By country" rows={props.countryContribution} />
          </div>
        </div>
      ) : null}

      {tab === 'exposure' ? (
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard label="Largest position" value={props.concentration.top1} format="percent" />
            <MetricCard label="Top 5" value={props.concentration.top5} format="percent" />
            <MetricCard label="Top 10" value={props.concentration.top10} format="percent" />
            <MetricCard label="HHI" value={props.concentration.hhi} format="ratio" decimals={3}
              tooltip="Herfindahl-Hirschman index over position weights. Higher means more concentrated." />
            <MetricCard label="Effective positions" value={props.concentration.effectiveNumberOfPositions} format="ratio" decimals={1}
              tooltip="1 ÷ HHI — the number of equally weighted positions that would carry the same concentration." />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ExposurePanel title="Sector" rows={props.exposures.sector} currency={currency} />
            <ExposurePanel title="Country" rows={props.exposures.country} currency={currency} />
            <ExposurePanel title="Currency" rows={props.exposures.currency} currency={currency} />
            <ExposurePanel title="Market capitalisation" rows={props.exposures.marketCap} currency={currency} />
          </div>
        </div>
      ) : null}

      {tab === 'valuation' ? (
        <div className="space-y-4">
          <InlineNote tone="info">
            Each figure is a weighted average across the positions that carry it. Coverage states how much of the
            book could be measured — a metric is never extrapolated across positions that lack it.
          </InlineNote>
          <Panel padded={false}>
            <div className="p-3 pb-2">
              <PanelHeader title="Look-through valuation" subtitle={`Portfolio against the ${props.benchmarkCode} universe median`} dense />
            </div>
            <table className="w-full border-collapse text-base">
              <thead>
                <tr className="bg-raised">
                  <th className="label border-b border-line px-2.5 py-1.5 text-left">Measure</th>
                  <th className="label border-b border-line px-2.5 py-1.5 text-right">Portfolio</th>
                  <th className="label border-b border-line px-2.5 py-1.5 text-right">Benchmark median</th>
                  <th className="label border-b border-line px-2.5 py-1.5 text-right">Difference</th>
                  <th className="label border-b border-line px-2.5 py-1.5 text-right">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {props.lookThrough.map((l) => (
                  <tr key={l.key} className="border-b border-line/50">
                    <td className="px-2.5 py-1.5 text-ink-2">{l.label}</td>
                    <td className="px-2.5 py-1.5 text-right"><Num value={l.value} format={l.format as 'percent'} currency={currency} decimals={l.format === 'multiple' || l.format === 'ratio' ? 2 : undefined} /></td>
                    <td className="px-2.5 py-1.5 text-right"><Num value={l.benchmark} format={l.format as 'percent'} currency={currency} decimals={l.format === 'multiple' || l.format === 'ratio' ? 2 : undefined} muted /></td>
                    <td className="px-2.5 py-1.5 text-right">
                      <Delta
                        value={isNum(l.value) && isNum(l.benchmark) ? (l.value as number) - (l.benchmark as number) : null}
                        format={l.format === 'percent' ? 'percentSigned' : 'ratio'}
                        decimals={l.format === 'percent' ? 1 : 2}
                        invert={l.key === 'pe' || l.key === 'evEbitda' || l.key === 'netDebtToEbitda'}
                      />
                    </td>
                    <td className="px-2.5 py-1.5 text-right"><Num value={l.coverage} format="percent" decimals={0} muted /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      ) : null}

      {tab === 'rebalance' ? (
        <div className="space-y-4">
          <InlineNote tone="warn">
            MERIDIAN produces recommendations only. It does not route, place or execute orders, and nothing here
            changes a position until you record the trade yourself.
          </InlineNote>
          <Panel padded={false}>
            <div className="flex items-center justify-between gap-2 p-3 pb-2">
              <PanelHeader
                title="Rebalancing plan"
                subtitle={props.targetsDefined ? 'Current weights against the targets recorded for this portfolio.' : 'No targets recorded yet — set one per position below.'}
                dense
              />
              {props.canRebalance ? (
                <Button size="sm" variant="primary" icon={<Icon.Save size={12} />} onClick={saveTargets} loading={saving}>
                  Save targets
                </Button>
              ) : null}
            </div>
            <div className="overflow-auto">
              <table className="w-full border-collapse text-base">
                <thead>
                  <tr className="bg-raised">
                    <th className="label border-b border-line px-2.5 py-1.5 text-left">Position</th>
                    <th className="label border-b border-line px-2.5 py-1.5 text-right">Current</th>
                    <th className="label border-b border-line px-2.5 py-1.5 text-right">Target</th>
                    <th className="label border-b border-line px-2.5 py-1.5 text-right">Difference</th>
                    <th className="label border-b border-line px-2.5 py-1.5 text-center">Action</th>
                    <th className="label border-b border-line px-2.5 py-1.5 text-right">Notional</th>
                    <th className="label border-b border-line px-2.5 py-1.5 text-right">Shares</th>
                  </tr>
                </thead>
                <tbody>
                  {props.rebalanceRows.map((r) => (
                    <tr key={r.ticker} className="border-b border-line/50">
                      <td className="px-2.5 py-1.5">
                        <Link href={`/companies/${r.ticker}`} className="num text-xs text-ink hover:underline">{r.ticker}</Link>
                        <span className="block truncate text-2xs text-ink-4">{r.name}</span>
                      </td>
                      <td className="px-2.5 py-1.5 text-right"><Num value={r.currentWeight} format="percent" /></td>
                      <td className="px-2.5 py-1.5 text-right">
                        {props.canRebalance ? (
                          <input
                            type="number" step="0.005" min="0" max="1"
                            value={targets[r.ticker] ?? r.targetWeight}
                            onChange={(e) => setTargets((t) => ({ ...t, [r.ticker]: Number(e.target.value) }))}
                            className="num w-20 rounded border border-transparent bg-transparent px-1 py-0.5 text-right hover:border-line focus:border-accent focus:bg-panel focus:outline-none"
                          />
                        ) : <Num value={r.targetWeight} format="percent" />}
                      </td>
                      <td className="px-2.5 py-1.5 text-right"><Delta value={r.difference} /></td>
                      <td className="px-2.5 py-1.5 text-center">
                        <Badge tone={r.action === 'BUY' ? 'pos' : r.action === 'SELL' ? 'neg' : 'neutral'}>{r.action.toLowerCase()}</Badge>
                      </td>
                      <td className="px-2.5 py-1.5 text-right"><Num value={r.notionalDelta} format="currencyCompact" currency={currency} /></td>
                      <td className="px-2.5 py-1.5 text-right"><Num value={r.shareDelta} format="number" decimals={0} /></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-raised font-medium">
                    <td className="px-2.5 py-1.5 text-ink">Total</td>
                    <td className="px-2.5 py-1.5 text-right"><Num value={props.rebalanceRows.reduce((s, r) => s + (r.currentWeight ?? 0), 0)} format="percent" /></td>
                    <td className="px-2.5 py-1.5 text-right"><Num value={Object.values(targets).reduce((s, v) => s + v, 0)} format="percent" /></td>
                    <td colSpan={4} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </Panel>
        </div>
      ) : null}

      {tab === 'transactions' ? (
        <Panel padded={false}>
          <div className="p-3 pb-2"><PanelHeader title="Transaction history" subtitle="Every recorded trade and cash movement." dense /></div>
          <div className="overflow-auto">
            <table className="w-full border-collapse text-base">
              <thead>
                <tr className="bg-raised">
                  <th className="label border-b border-line px-2.5 py-1.5 text-left">Date</th>
                  <th className="label border-b border-line px-2.5 py-1.5 text-left">Type</th>
                  <th className="label border-b border-line px-2.5 py-1.5 text-left">Security</th>
                  <th className="label border-b border-line px-2.5 py-1.5 text-right">Quantity</th>
                  <th className="label border-b border-line px-2.5 py-1.5 text-right">Price</th>
                  <th className="label border-b border-line px-2.5 py-1.5 text-right">Amount</th>
                  <th className="label border-b border-line px-2.5 py-1.5 text-left">Note</th>
                  <th className="label border-b border-line px-2.5 py-1.5 text-left">By</th>
                </tr>
              </thead>
              <tbody>
                {props.transactions.map((t) => (
                  <tr key={t.id} className="border-b border-line/50">
                    <td className="px-2.5 py-1.5 num text-2xs text-ink-3">{formatDate(t.tradeDate)}</td>
                    <td className="px-2.5 py-1.5"><Badge tone={t.kind === 'BUY' ? 'pos' : t.kind === 'SELL' ? 'neg' : 'outline'}>{t.kind.toLowerCase()}</Badge></td>
                    <td className="px-2.5 py-1.5 num text-xs text-ink">{t.ticker ?? '—'}</td>
                    <td className="px-2.5 py-1.5 text-right"><Num value={t.quantity || null} format="number" /></td>
                    <td className="px-2.5 py-1.5 text-right"><Num value={t.price || null} format="currency" currency={currency} decimals={2} /></td>
                    <td className="px-2.5 py-1.5 text-right"><Delta value={t.amount} format="currencyCompact" currency={currency} /></td>
                    <td className="px-2.5 py-1.5 text-2xs text-ink-3">{t.note ?? '—'}</td>
                    <td className="px-2.5 py-1.5 text-2xs text-ink-4">{t.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      <Modal
        open={tradeModal} onClose={() => setTradeModal(false)}
        title="Record a trade"
        subtitle="A positive quantity buys; a negative quantity sells. The average price blends on additions."
        footer={<><Button variant="ghost" onClick={() => setTradeModal(false)}>Cancel</Button><Button variant="primary" onClick={submitTrade} loading={saving} disabled={!trade.ticker || !trade.quantity}>Record</Button></>}
      >
        <div className="space-y-3">
          <Field label="Ticker" required hint="Must exist in the company universe.">
            <Input value={trade.ticker} onChange={(e) => setTrade((t) => ({ ...t, ticker: e.target.value.toUpperCase() }))} placeholder="VALE3" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Quantity" required hint="Negative to sell.">
              <NumberInput value={trade.quantity} step="1" onValueChange={(v) => setTrade((t) => ({ ...t, quantity: v }))} />
            </Field>
            <Field label={`Price (${currency})`} required>
              <NumberInput value={trade.averagePrice} step="0.01" onValueChange={(v) => setTrade((t) => ({ ...t, averagePrice: v }))} />
            </Field>
          </div>
          <Field label="Note"><Input value={trade.note} onChange={(e) => setTrade((t) => ({ ...t, note: e.target.value }))} placeholder="Committee approval 12 Sep" /></Field>
        </div>
      </Modal>

      <Modal
        open={cashModal} onClose={() => setCashModal(false)}
        title="Record a cash movement"
        footer={<><Button variant="ghost" onClick={() => setCashModal(false)}>Cancel</Button><Button variant="primary" onClick={submitCash} loading={saving} disabled={!cashForm.amount}>Record</Button></>}
      >
        <div className="space-y-3">
          <Field label="Type">
            <Select value={cashForm.kind} onChange={(e) => setCashForm((f) => ({ ...f, kind: e.target.value }))}>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="DIVIDEND">Dividend received</option>
              <option value="FEE">Fee</option>
            </Select>
          </Field>
          <Field label={`Amount (${currency})`} required>
            <NumberInput value={cashForm.amount} step="0.01" onValueChange={(v) => setCashForm((f) => ({ ...f, amount: v }))} />
          </Field>
          <Field label="Note"><Input value={cashForm.note} onChange={(e) => setCashForm((f) => ({ ...f, note: e.target.value }))} /></Field>
        </div>
      </Modal>
    </div>
  );
}

function AttributionTable({ title, rows }: { title: string; rows: ContributionRow[] }) {
  return (
    <Panel padded={false}>
      <div className="p-3 pb-2"><PanelHeader title={title} dense /></div>
      <table className="w-full border-collapse text-base">
        <thead>
          <tr className="bg-raised">
            <th className="label border-b border-line px-2.5 py-1.5 text-left">Group</th>
            <th className="label border-b border-line px-2.5 py-1.5 text-right">Weight</th>
            <th className="label border-b border-line px-2.5 py-1.5 text-right">Return</th>
            <th className="label border-b border-line px-2.5 py-1.5 text-right">Contribution</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b border-line/50">
              <td className="px-2.5 py-1.5 text-ink-2">{r.key}</td>
              <td className="px-2.5 py-1.5 text-right"><Num value={r.weight} format="percent" /></td>
              <td className="px-2.5 py-1.5 text-right"><Delta value={r.return} /></td>
              <td className="px-2.5 py-1.5 text-right"><Delta value={r.contribution} decimals={2} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

function ExposurePanel({ title, rows, currency }: { title: string; rows: ExposureRow[]; currency: Currency }) {
  const max = Math.max(...rows.map((r) => r.weight), 0.01);
  return (
    <Panel>
      <PanelHeader title={title} dense />
      {rows.map((r) => (
        <div key={r.key} className="mb-2">
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="min-w-0 truncate text-ink-2">{r.label}</span>
            <span className="flex shrink-0 items-baseline gap-3">
              <Num value={r.marketValue} format="currencyCompact" currency={currency} className="text-2xs" />
              <span className="num w-11 text-right text-2xs text-ink-3">{formatPercent(r.weight)}</span>
            </span>
          </div>
          <div className="mt-1 h-[5px] rounded-full bg-sunken">
            <div className="h-full rounded-full bg-accent" style={{ width: `${(r.weight / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </Panel>
  );
}
