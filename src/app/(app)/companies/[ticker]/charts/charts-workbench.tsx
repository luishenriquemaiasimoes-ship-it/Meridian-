'use client';

import { useMemo, useState } from 'react';
import { Button, Panel, PanelHeader, Segmented } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { AreaSeriesChart, BarSeriesChart, LineSeriesChart } from '@/components/charts';
import { MetricCard } from '@/components/ui/values';
import { maxDrawdown, volatility } from '@/lib/finance/risk';
import { formatMultiple, formatPercent } from '@/lib/finance/format';
import { downloadText, toCsv } from '@/lib/import/csv';
import type { Currency } from '@/lib/finance/types';

type Range = '3M' | '6M' | '1Y' | '3Y' | 'ALL';
const RANGE_DAYS: Record<Range, number | null> = { '3M': 91, '6M': 182, '1Y': 365, '3Y': 1095, ALL: null };

export function ChartsWorkbench({
  ticker, currency, benchmarkCode, prices, benchmarkSeries, returns, targetHistory, multiples, week52High, week52Low,
}: {
  ticker: string;
  currency: Currency;
  benchmarkCode: string;
  prices: { date: string; close: number; high: number; low: number; volume: number }[];
  benchmarkSeries: { date: string; value: number }[];
  returns: number[];
  targetHistory: { date: string; targetPrice: number; recommendation: string; reason: string }[];
  multiples: { metric: string; label: string; points: { date: string; value: number | null }[]; median5y: number | null }[];
  week52High: number | null;
  week52Low: number | null;
}) {
  const [range, setRange] = useState<Range>('1Y');
  const [multipleMetric, setMultipleMetric] = useState(multiples[0]?.metric ?? 'evEbitda');

  const filtered = useMemo(() => {
    const days = RANGE_DAYS[range];
    if (!days || !prices.length) return prices;
    const cutoff = new Date(new Date(prices[prices.length - 1].date).getTime() - days * 86400000)
      .toISOString().slice(0, 10);
    return prices.filter((p) => p.date >= cutoff);
  }, [prices, range]);

  const benchmarkByDate = useMemo(() => new Map(benchmarkSeries.map((b) => [b.date, b.value])), [benchmarkSeries]);

  const relative = useMemo(() => {
    const withBench = filtered.filter((p) => benchmarkByDate.has(p.date));
    if (!withBench.length) return [];
    const base = withBench[0];
    const baseBench = benchmarkByDate.get(base.date)!;
    return withBench.map((p) => ({
      date: p.date,
      price: (p.close / base.close) * 100,
      benchmark: ((benchmarkByDate.get(p.date) as number) / baseBench) * 100,
    }));
  }, [filtered, benchmarkByDate]);

  const targetByDate = useMemo(() => {
    if (!targetHistory.length) return [];
    return filtered.map((p) => {
      const applicable = targetHistory.filter((t) => t.date <= p.date);
      return {
        date: p.date,
        price: p.close,
        target: applicable.length ? applicable[applicable.length - 1].targetPrice : null,
      };
    });
  }, [filtered, targetHistory]);

  const drawdown = useMemo(() => {
    const dd = maxDrawdown(filtered.map((p) => p.close));
    return filtered.map((p, i) => ({ date: p.date, drawdown: dd.series[i] ?? null }));
  }, [filtered]);

  const stats = useMemo(() => {
    const closes = filtered.map((p) => p.close);
    const rets = returns.slice(-closes.length);
    return {
      periodReturn: closes.length > 1 ? closes[closes.length - 1] / closes[0] - 1 : null,
      volatility: volatility(rets, 252),
      maxDrawdown: maxDrawdown(closes).maxDrawdown,
      high: closes.length ? Math.max(...closes) : null,
      low: closes.length ? Math.min(...closes) : null,
    };
  }, [filtered, returns]);

  const selectedMultiple = multiples.find((m) => m.metric === multipleMetric);

  const exportPrices = () => {
    downloadText(
      `${ticker}-prices-${range}.csv`,
      toCsv(['Date', 'Close', 'High', 'Low', 'Volume'], filtered.map((p) => [p.date, p.close, p.high, p.low, p.volume])),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          value={range} onChange={(v) => setRange(v as Range)}
          options={(Object.keys(RANGE_DAYS) as Range[]).map((r) => ({ value: r, label: r }))}
        />
        <span className="num text-2xs text-ink-4">{filtered.length} sessions</span>
        <Button className="ml-auto" size="sm" icon={<Icon.Download size={12} />} onClick={exportPrices}>Export prices</Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard label={`${range} return`} value={stats.periodReturn} format="percentSigned" />
        <MetricCard label="Volatility (annualised)" value={stats.volatility} format="percent" />
        <MetricCard label="Max drawdown" value={stats.maxDrawdown} format="percent" />
        <MetricCard label="52-week high" value={week52High} format="currency" currency={currency} decimals={2} />
        <MetricCard label="52-week low" value={week52Low} format="currency" currency={currency} decimals={2} />
      </div>

      <LineSeriesChart
        data={filtered.map((p) => ({ date: p.date, close: p.close }))}
        xKey="date" height={300}
        series={[{ key: 'close', label: `${ticker} close`, format: 'currency', currency, decimals: 2 }]}
        yFormat="currency" currency={currency}
        title={`${ticker} price`}
        subtitle="Daily closing price from the workspace price series"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {relative.length ? (
          <LineSeriesChart
            data={relative} xKey="date" height={260}
            series={[
              { key: 'price', label: ticker, format: 'ratio', decimals: 1 },
              { key: 'benchmark', label: benchmarkCode, format: 'ratio', decimals: 1 },
            ]}
            title="Relative performance"
            subtitle={`Indexed to 100 at the start of the ${range} window`}
            yFormat="ratio"
          />
        ) : null}

        <AreaSeriesChart
          data={drawdown} xKey="date" height={260}
          series={[{ key: 'drawdown', label: 'Drawdown from peak', format: 'percent' }]}
          yFormat="percent"
          title="Drawdown"
          subtitle="Distance below the running maximum"
        />
      </div>

      {targetByDate.length && targetHistory.length ? (
        <LineSeriesChart
          data={targetByDate} xKey="date" height={280}
          series={[
            { key: 'price', label: 'Share price', format: 'currency', currency, decimals: 2 },
            { key: 'target', label: 'Target price', format: 'currency', currency, decimals: 2, dashed: true },
          ]}
          yFormat="currency" currency={currency}
          title="Target price against the share price"
          subtitle="The target steps at each recorded change, so the chart shows what was published at the time"
          footnote={`${targetHistory.length} target changes recorded in this workspace.`}
        />
      ) : null}

      <BarSeriesChart
        data={filtered.filter((_, i) => i % Math.max(1, Math.floor(filtered.length / 90)) === 0).map((p) => ({ date: p.date, volume: p.volume }))}
        xKey="date" height={180}
        series={[{ key: 'volume', label: 'Volume', format: 'number' }]}
        title="Traded volume"
        subtitle="Sampled to keep the axis readable"
        yFormat="number"
      />

      {multiples.length ? (
        <div className="space-y-3">
          <Segmented
            value={multipleMetric} onChange={setMultipleMetric}
            options={multiples.map((m) => ({ value: m.metric, label: m.label }))}
          />
          {selectedMultiple ? (
            <LineSeriesChart
              data={selectedMultiple.points.map((p) => ({ date: p.date, value: p.value }))}
              xKey="date" height={260}
              series={[{ key: 'value', label: selectedMultiple.label, format: selectedMultiple.metric === 'fcfYield' ? 'percent' : 'multiple' }]}
              yFormat={selectedMultiple.metric === 'fcfYield' ? 'percent' : 'multiple'}
              referenceValue={selectedMultiple.median5y}
              referenceLabel={`5Y median ${selectedMultiple.metric === 'fcfYield' ? formatPercent(selectedMultiple.median5y) : formatMultiple(selectedMultiple.median5y)}`}
              title={`${selectedMultiple.label} through time`}
              subtitle="Price paired with the fundamentals that were public at each date"
            />
          ) : null}
        </div>
      ) : (
        <Panel>
          <PanelHeader title="Valuation history" dense />
          <p className="text-xs text-ink-3">Not enough statement history to reconstruct a multiple series.</p>
        </Panel>
      )}
    </div>
  );
}
