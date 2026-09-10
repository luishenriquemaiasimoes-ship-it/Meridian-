'use client';

import { useMemo } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, LineChart,
  ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip as RTooltip,
  XAxis, YAxis, ZAxis,
} from 'recharts';
import { ChartFrame, ChartTooltip, type ChartSeriesMeta } from './frame';
import { ACCENT, ALL_PAIRS_SERIES, AXIS_PROPS, BAR_RADIUS, CHROME, DIVERGING, GRID_PROPS, LINE_WIDTH, NEGATIVE, POSITIVE, SEQUENTIAL, seriesColor } from './theme';
import { formatMetric, type MetricFormat, DASH } from '@/lib/finance/format';
import type { Currency } from '@/lib/finance/types';
import { isNum } from '@/lib/finance/core';
import { cx } from '@/components/ui/primitives';

/* ------------------------------ helpers ------------------------------ */

interface SeriesSpec {
  key: string;
  label: string;
  format?: MetricFormat;
  currency?: Currency;
  decimals?: number;
  /** Overrides the fixed slot colour (used for pos/neg semantics). */
  color?: string;
  dashed?: boolean;
}

type Row = Record<string, string | number | null>;

function fmt(v: unknown, s: SeriesSpec): string {
  if (!isNum(v as number)) return DASH;
  return formatMetric(v as number, s.format ?? 'number', { currency: s.currency, decimals: s.decimals });
}

function tickFormatter(format: MetricFormat | undefined, currency?: Currency) {
  return (v: number) => {
    if (!isNum(v)) return '';
    if (format === 'percent' || format === 'percentSigned') return `${(v * 100).toFixed(0)}%`;
    if (format === 'multiple') return `${v.toFixed(1)}x`;
    if (format === 'currencyCompact') return formatMetric(v, 'currencyCompact', { currency, decimals: 0 });
    if (Math.abs(v) >= 1000) return formatMetric(v, 'currencyCompact', { currency, decimals: 0 });
    return String(Math.round(v * 100) / 100);
  };
}

function buildMeta(series: SeriesSpec[]): ChartSeriesMeta[] {
  return series.map((s, i) => ({ key: s.key, label: s.label, color: s.color ?? seriesColor(i) }));
}

function buildTable(rows: Row[], xKey: string, series: SeriesSpec[]) {
  return {
    tableColumns: ['Period', ...series.map((s) => s.label)],
    tableRows: rows.map((r) => [String(r[xKey] ?? ''), ...series.map((s) => fmt(r[s.key], s))]),
  };
}

/* ------------------------------ Line chart ------------------------------ */

export function LineSeriesChart({
  data, xKey, series, title, subtitle, height = 240, yFormat, currency,
  referenceValue, referenceLabel, footnote, className, showDots = false,
}: {
  data: Row[]; xKey: string; series: SeriesSpec[]; title?: string; subtitle?: string;
  height?: number; yFormat?: MetricFormat; currency?: Currency;
  referenceValue?: number | null; referenceLabel?: string; footnote?: string;
  className?: string; showDots?: boolean;
}) {
  const meta = buildMeta(series);
  const table = buildTable(data, xKey, series);
  return (
    <ChartFrame title={title} subtitle={subtitle} series={meta} height={height} footnote={footnote} className={className} {...table}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 10, bottom: 2, left: 2 }}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey={xKey} {...AXIS_PROPS} minTickGap={24} />
          <YAxis {...AXIS_PROPS} width={54} tickFormatter={tickFormatter(yFormat ?? series[0]?.format, currency)} />
          {isNum(referenceValue) ? (
            <ReferenceLine
              y={referenceValue as number} stroke={CHROME.muted} strokeDasharray="3 3"
              label={referenceLabel ? { value: referenceLabel, position: 'insideTopRight', fill: CHROME.muted, fontSize: 10 } : undefined}
            />
          ) : null}
          <RTooltip
            cursor={{ stroke: CHROME.axis, strokeWidth: 1 }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltip
                  label={String(label)}
                  rows={series.map((s, i) => ({
                    key: s.key, label: s.label,
                    value: fmt(payload.find((p) => p.dataKey === s.key)?.value, s),
                    color: s.color ?? seriesColor(i),
                  }))}
                />
              ) : null
            }
          />
          {series.map((s, i) => (
            <Line
              key={s.key} type="monotone" dataKey={s.key} name={s.label}
              stroke={s.color ?? seriesColor(i)} strokeWidth={LINE_WIDTH}
              strokeDasharray={s.dashed ? '4 3' : undefined}
              dot={showDots ? { r: 3, strokeWidth: 0, fill: s.color ?? seriesColor(i) } : false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: CHROME.surface }}
              connectNulls={false} isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* ------------------------------ Area chart ------------------------------ */

export function AreaSeriesChart({
  data, xKey, series, title, subtitle, height = 240, yFormat, currency, stacked = false, footnote, className,
}: {
  data: Row[]; xKey: string; series: SeriesSpec[]; title?: string; subtitle?: string;
  height?: number; yFormat?: MetricFormat; currency?: Currency; stacked?: boolean;
  footnote?: string; className?: string;
}) {
  const meta = buildMeta(series);
  const table = buildTable(data, xKey, series);
  return (
    <ChartFrame title={title} subtitle={subtitle} series={meta} height={height} footnote={footnote} className={className} {...table}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 10, bottom: 2, left: 2 }}>
          <defs>
            {series.map((s, i) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color ?? seriesColor(i)} stopOpacity={stacked ? 0.55 : 0.28} />
                <stop offset="100%" stopColor={s.color ?? seriesColor(i)} stopOpacity={stacked ? 0.35 : 0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey={xKey} {...AXIS_PROPS} minTickGap={24} />
          <YAxis {...AXIS_PROPS} width={54} tickFormatter={tickFormatter(yFormat ?? series[0]?.format, currency)} />
          <RTooltip
            cursor={{ stroke: CHROME.axis, strokeWidth: 1 }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltip
                  label={String(label)}
                  rows={series.map((s, i) => ({
                    key: s.key, label: s.label,
                    value: fmt(payload.find((p) => p.dataKey === s.key)?.value, s),
                    color: s.color ?? seriesColor(i),
                  }))}
                />
              ) : null
            }
          />
          {series.map((s, i) => (
            <Area
              key={s.key} type="monotone" dataKey={s.key} name={s.label}
              stackId={stacked ? 'a' : undefined}
              stroke={s.color ?? seriesColor(i)} strokeWidth={LINE_WIDTH}
              fill={`url(#grad-${s.key})`} isAnimationActive={false} connectNulls={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* ------------------------------ Bar chart ------------------------------ */

export function BarSeriesChart({
  data, xKey, series, title, subtitle, height = 240, yFormat, currency,
  stacked = false, horizontal = false, colorBySign = false, footnote, className, referenceValue,
}: {
  data: Row[]; xKey: string; series: SeriesSpec[]; title?: string; subtitle?: string;
  height?: number; yFormat?: MetricFormat; currency?: Currency; stacked?: boolean;
  horizontal?: boolean; colorBySign?: boolean; footnote?: string; className?: string;
  referenceValue?: number | null;
}) {
  const meta = buildMeta(series);
  const table = buildTable(data, xKey, series);
  const single = series.length === 1;
  return (
    <ChartFrame title={title} subtitle={subtitle} series={meta} height={height} footnote={footnote} className={className} {...table}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 6, right: 12, bottom: 2, left: horizontal ? 8 : 2 }}
          barCategoryGap={horizontal ? '22%' : '28%'}
        >
          <CartesianGrid {...GRID_PROPS} vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" {...AXIS_PROPS} tickFormatter={tickFormatter(yFormat ?? series[0]?.format, currency)} />
              <YAxis type="category" dataKey={xKey} {...AXIS_PROPS} width={92} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} {...AXIS_PROPS} minTickGap={8} />
              <YAxis {...AXIS_PROPS} width={54} tickFormatter={tickFormatter(yFormat ?? series[0]?.format, currency)} />
            </>
          )}
          {isNum(referenceValue) ? <ReferenceLine {...(horizontal ? { x: referenceValue as number } : { y: referenceValue as number })} stroke={CHROME.muted} strokeDasharray="3 3" /> : null}
          <RTooltip
            cursor={{ fill: 'rgb(var(--m-ink) / 0.05)' }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltip
                  label={String(label)}
                  rows={series.map((s, i) => ({
                    key: s.key, label: s.label,
                    value: fmt(payload.find((p) => p.dataKey === s.key)?.value, s),
                    color: colorBySign ? undefined : s.color ?? seriesColor(i),
                  }))}
                />
              ) : null
            }
          />
          {series.map((s, i) => (
            <Bar
              key={s.key} dataKey={s.key} name={s.label}
              stackId={stacked ? 'a' : undefined}
              fill={s.color ?? seriesColor(i)}
              radius={horizontal ? [0, 4, 4, 0] : BAR_RADIUS}
              isAnimationActive={false}
              // A 2px surface gap keeps stacked segments from fusing.
              stroke={stacked ? CHROME.surface : undefined}
              strokeWidth={stacked ? 2 : 0}
            >
              {colorBySign && single
                ? data.map((row, ri) => (
                    <Cell key={ri} fill={(row[s.key] as number) >= 0 ? POSITIVE : NEGATIVE} />
                  ))
                : null}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* ----------------------------- Waterfall ----------------------------- */

export interface WaterfallStep {
  label: string;
  value: number;
  kind?: 'delta' | 'total';
}

/**
 * A bridge chart. Each delta bar is drawn as an invisible base plus a visible
 * segment, so the steps connect the way a valuation bridge should read.
 */
export function WaterfallChart({
  steps, title, subtitle, height = 260, format = 'currencyCompact', currency, footnote, className,
}: {
  steps: WaterfallStep[]; title?: string; subtitle?: string; height?: number;
  format?: MetricFormat; currency?: Currency; footnote?: string; className?: string;
}) {
  const data = useMemo(() => {
    let running = 0;
    return steps.map((s) => {
      if (s.kind === 'total') {
        const row = { label: s.label, base: 0, up: s.value >= 0 ? s.value : 0, down: s.value < 0 ? -s.value : 0, total: s.value, isTotal: true };
        running = s.value;
        return row;
      }
      const start = running;
      const end = running + s.value;
      running = end;
      return {
        label: s.label,
        base: Math.min(start, end),
        up: s.value >= 0 ? s.value : 0,
        down: s.value < 0 ? -s.value : 0,
        total: end,
        isTotal: false,
      };
    });
  }, [steps]);

  return (
    <ChartFrame
      title={title} subtitle={subtitle} height={height} footnote={footnote} className={className}
      tableColumns={['Step', 'Change', 'Running total']}
      tableRows={steps.map((s, i) => [
        s.label,
        s.kind === 'total' ? '—' : formatMetric(s.value, format, { currency }),
        formatMetric(data[i].total, format, { currency }),
      ])}
      series={[
        { key: 'up', label: 'Increase', color: POSITIVE },
        { key: 'down', label: 'Decrease', color: NEGATIVE },
        { key: 'total', label: 'Total', color: ACCENT },
      ]}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 10, bottom: 2, left: 2 }} barCategoryGap="26%">
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="label" {...AXIS_PROPS} interval={0} angle={-18} textAnchor="end" height={46} />
          <YAxis {...AXIS_PROPS} width={58} tickFormatter={tickFormatter(format, currency)} />
          <RTooltip
            cursor={{ fill: 'rgb(var(--m-ink) / 0.05)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as typeof data[number];
              const step = steps[data.indexOf(row)];
              return (
                <ChartTooltip
                  label={row.label}
                  rows={[
                    ...(row.isTotal ? [] : [{ key: 'change', label: 'Change', value: formatMetric(step?.value ?? null, format, { currency }) }]),
                    { key: 'total', label: row.isTotal ? 'Value' : 'Running total', value: formatMetric(row.total, format, { currency }) },
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="up" stackId="w" radius={BAR_RADIUS} isAnimationActive={false}>
            {data.map((d, i) => <Cell key={i} fill={d.isTotal ? ACCENT : POSITIVE} />)}
          </Bar>
          <Bar dataKey="down" stackId="w" radius={BAR_RADIUS} isAnimationActive={false}>
            {data.map((d, i) => <Cell key={i} fill={d.isTotal ? ACCENT : NEGATIVE} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* ------------------------------ Scatter ------------------------------ */

export function ScatterPlot({
  points, xLabel, yLabel, xFormat = 'percent', yFormat = 'multiple', title, subtitle,
  height = 300, currency, highlightKey, footnote, className, xReference, yReference,
}: {
  points: { key: string; label: string; x: number | null; y: number | null; size?: number; group?: string }[];
  xLabel: string; yLabel: string; xFormat?: MetricFormat; yFormat?: MetricFormat;
  title?: string; subtitle?: string; height?: number; currency?: Currency;
  highlightKey?: string; footnote?: string; className?: string;
  xReference?: number | null; yReference?: number | null;
}) {
  const usable = points.filter((p) => isNum(p.x) && isNum(p.y));
  // Scatter compares every pair at once, so the palette caps at three groups.
  const groups = Array.from(new Set(usable.map((p) => p.group ?? 'All'))).slice(0, 3);

  return (
    <ChartFrame
      title={title} subtitle={subtitle} height={height} footnote={footnote} className={className}
      series={groups.length > 1 ? groups.map((g, i) => ({ key: g, label: g, color: ALL_PAIRS_SERIES[i] })) : undefined}
      tableColumns={['Name', xLabel, yLabel]}
      tableRows={usable.map((p) => [p.label, formatMetric(p.x, xFormat, { currency }), formatMetric(p.y, yFormat, { currency })])}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 16, bottom: 22, left: 2 }}>
          <CartesianGrid {...GRID_PROPS} vertical />
          <XAxis
            type="number" dataKey="x" name={xLabel} {...AXIS_PROPS}
            tickFormatter={tickFormatter(xFormat, currency)}
            label={{ value: xLabel, position: 'insideBottom', offset: -12, fill: CHROME.muted, fontSize: 10 }}
          />
          <YAxis
            type="number" dataKey="y" name={yLabel} {...AXIS_PROPS} width={58}
            tickFormatter={tickFormatter(yFormat, currency)}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: CHROME.muted, fontSize: 10 }}
          />
          <ZAxis type="number" dataKey="size" range={[60, 320]} />
          {isNum(xReference) ? <ReferenceLine x={xReference as number} stroke={CHROME.muted} strokeDasharray="3 3" /> : null}
          {isNum(yReference) ? <ReferenceLine y={yReference as number} stroke={CHROME.muted} strokeDasharray="3 3" /> : null}
          <RTooltip
            cursor={{ strokeDasharray: '3 3', stroke: CHROME.axis }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as typeof usable[number];
              return (
                <ChartTooltip
                  label={p.label}
                  rows={[
                    { key: 'x', label: xLabel, value: formatMetric(p.x, xFormat, { currency }) },
                    { key: 'y', label: yLabel, value: formatMetric(p.y, yFormat, { currency }) },
                  ]}
                />
              );
            }}
          />
          {groups.map((g, gi) => (
            <Scatter
              key={g} name={g}
              data={usable.filter((p) => (p.group ?? 'All') === g)}
              fill={ALL_PAIRS_SERIES[gi]}
              isAnimationActive={false}
            >
              {usable.filter((p) => (p.group ?? 'All') === g).map((p) => (
                <Cell
                  key={p.key}
                  fill={p.key === highlightKey ? 'rgb(var(--m-brass))' : ALL_PAIRS_SERIES[gi]}
                  stroke={CHROME.surface} strokeWidth={2}
                />
              ))}
            </Scatter>
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* --------------------- Combined bar + line (one axis) --------------------- */

/**
 * Bars and a line on a single shared axis. There is deliberately no second
 * y-axis: two measures of different scale belong in two charts.
 */
export function BarLineChart({
  data, xKey, bars, lines, title, subtitle, height = 260, yFormat, currency, footnote, className,
}: {
  data: Row[]; xKey: string; bars: SeriesSpec[]; lines: SeriesSpec[];
  title?: string; subtitle?: string; height?: number; yFormat?: MetricFormat;
  currency?: Currency; footnote?: string; className?: string;
}) {
  const all = [...bars, ...lines];
  const meta = all.map((s, i) => ({ key: s.key, label: s.label, color: s.color ?? seriesColor(i) }));
  const table = buildTable(data, xKey, all);
  return (
    <ChartFrame title={title} subtitle={subtitle} series={meta} height={height} footnote={footnote} className={className} {...table}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 6, right: 10, bottom: 2, left: 2 }} barCategoryGap="30%">
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey={xKey} {...AXIS_PROPS} minTickGap={8} />
          <YAxis {...AXIS_PROPS} width={56} tickFormatter={tickFormatter(yFormat ?? all[0]?.format, currency)} />
          <RTooltip
            cursor={{ fill: 'rgb(var(--m-ink) / 0.05)' }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <ChartTooltip
                  label={String(label)}
                  rows={all.map((s, i) => ({
                    key: s.key, label: s.label,
                    value: fmt(payload.find((p) => p.dataKey === s.key)?.value, s),
                    color: s.color ?? seriesColor(i),
                  }))}
                />
              ) : null
            }
          />
          {bars.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color ?? seriesColor(i)} radius={BAR_RADIUS} isAnimationActive={false} />
          ))}
          {lines.map((s, i) => (
            <Line
              key={s.key} type="monotone" dataKey={s.key} name={s.label}
              stroke={s.color ?? seriesColor(bars.length + i)} strokeWidth={LINE_WIDTH}
              dot={{ r: 3, strokeWidth: 0 }} isAnimationActive={false} connectNulls={false}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* ------------------------------ Sparkline ------------------------------ */

export function Sparkline({
  values, width = 72, height = 22, positive, className,
}: { values: (number | null)[]; width?: number; height?: number; positive?: boolean; className?: string }) {
  const points = values.filter(isNum) as number[];
  if (points.length < 2) return <span className={cx('text-ink-4 num text-2xs', className)}>{DASH}</span>;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);
  const d = points
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(height - ((v - min) / range) * height).toFixed(1)}`)
    .join(' ');
  const up = positive ?? points[points.length - 1] >= points[0];
  return (
    <svg width={width} height={height} className={className} aria-hidden="true">
      <path d={d} fill="none" stroke={up ? POSITIVE : NEGATIVE} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* --------------------------- Correlation matrix --------------------------- */

export function CorrelationMatrix({
  labels, values, title, subtitle, className,
}: { labels: string[]; values: (number | null)[][]; title?: string; subtitle?: string; className?: string }) {
  const colorFor = (v: number | null): string => {
    if (!isNum(v)) return 'transparent';
    const t = Math.min(1, Math.abs(v as number));
    // Diverging: one hue per sign with a neutral midpoint at zero.
    return (v as number) >= 0
      ? `color-mix(in oklab, ${DIVERGING.positive} ${(t * 78).toFixed(0)}%, ${DIVERGING.mid})`
      : `color-mix(in oklab, ${DIVERGING.negative} ${(t * 78).toFixed(0)}%, ${DIVERGING.mid})`;
  };

  return (
    <div className={cx('panel overflow-auto p-3', className)}>
      {title ? <div className="mb-2 text-sm font-semibold text-ink">{title}</div> : null}
      {subtitle ? <div className="mb-2 -mt-1 text-2xs text-ink-3">{subtitle}</div> : null}
      <table className="border-collapse text-2xs">
        <thead>
          <tr>
            <th className="sticky left-0 bg-panel px-1.5 py-1" />
            {labels.map((l) => (
              <th key={l} className="px-1.5 py-1 text-ink-3 font-semibold whitespace-nowrap">{l}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((rowLabel, ri) => (
            <tr key={rowLabel}>
              <th className="sticky left-0 bg-panel px-1.5 py-1 text-left text-ink-3 font-semibold whitespace-nowrap">{rowLabel}</th>
              {labels.map((colLabel, ci) => {
                const v = values[ri]?.[ci] ?? null;
                return (
                  <td
                    key={colLabel}
                    className="border border-panel px-1.5 py-1 text-center num"
                    style={{ backgroundColor: colorFor(v), color: 'rgb(var(--m-ink))' }}
                    title={`${rowLabel} / ${colLabel}: ${isNum(v) ? (v as number).toFixed(2) : 'unavailable'}`}
                  >
                    {isNum(v) ? (v as number).toFixed(2) : DASH}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex items-center gap-2 text-2xs text-ink-4">
        <span>−1</span>
        <span className="h-[6px] w-24 rounded-full" style={{ background: `linear-gradient(90deg, ${DIVERGING.negative}, ${DIVERGING.mid}, ${DIVERGING.positive})` }} />
        <span>+1</span>
        <span className="ml-1">Correlation of daily returns over the last 12 months.</span>
      </div>
    </div>
  );
}

export { SEQUENTIAL, seriesColor, POSITIVE, NEGATIVE, ACCENT };
export { ChartFrame, ChartTooltip } from './frame';
