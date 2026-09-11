'use client';

import type { ReactNode } from 'react';
import {
  DASH, formatBps, formatCompact, formatDate, formatMetric, formatMoney,
  formatMultiple, formatNumber, formatPercent, type MetricFormat,
} from '@/lib/finance/format';
import type { Currency, ValueOrigin } from '@/lib/finance/types';
import { isNum } from '@/lib/finance/core';
import { Badge, cx, Tooltip } from './primitives';
import { Icon } from './icons';

/* =====================  Numeric display  ===================== */

export function Num({
  value, format = 'number', currency = 'BRL', decimals, scale, className, muted,
}: {
  value: number | null | undefined; format?: MetricFormat; currency?: Currency;
  decimals?: number; scale?: number; className?: string; muted?: boolean;
}) {
  const text = formatMetric(value, format, { currency, decimals, scale });
  return (
    <span className={cx('num', !isNum(value) || muted ? 'text-ink-4' : 'text-ink', className)}>{text}</span>
  );
}

/** A signed value coloured by direction; `invert` flips the colour meaning. */
export function Delta({
  value, format = 'percentSigned', currency = 'BRL', decimals, invert = false,
  showIcon = false, className, neutralThreshold = 0,
}: {
  value: number | null | undefined; format?: MetricFormat; currency?: Currency;
  decimals?: number; invert?: boolean; showIcon?: boolean; className?: string; neutralThreshold?: number;
}) {
  if (!isNum(value)) return <span className={cx('num text-ink-4', className)}>{DASH}</span>;
  const v = value as number;
  const positive = v > neutralThreshold;
  const negative = v < -neutralThreshold;
  const good = invert ? negative : positive;
  const bad = invert ? positive : negative;
  const tone = good ? 'text-pos' : bad ? 'text-neg' : 'text-ink-3';
  return (
    <span className={cx('num inline-flex items-center gap-0.5', tone, className)}>
      {showIcon && (positive || negative) ? (positive ? <Icon.ArrowUp size={10} strokeWidth={2.2} /> : <Icon.ArrowDown size={10} strokeWidth={2.2} />) : null}
      {formatMetric(v, format, { currency, decimals })}
    </span>
  );
}

export function Bps({ value, className }: { value: number | null | undefined; className?: string }) {
  if (!isNum(value)) return <span className={cx('num text-ink-4', className)}>{DASH}</span>;
  const v = value as number;
  return <span className={cx('num', v > 0 ? 'text-pos' : v < 0 ? 'text-neg' : 'text-ink-3', className)}>{formatBps(v)}</span>;
}

/** Explicit "not available" rendering — the platform never shows a blank cell. */
export function Unavailable({ reason }: { reason?: string }) {
  return (
    <Tooltip content={reason ?? 'The workspace does not hold this value.'}>
      <span className="num text-ink-4 cursor-help">{DASH}</span>
    </Tooltip>
  );
}

/* =====================  Provenance  ===================== */

const ORIGIN_META: Record<ValueOrigin, { label: string; tone: 'neutral' | 'accent' | 'warn' | 'brass' | 'outline'; description: string }> = {
  OBSERVED: { label: 'Observed', tone: 'neutral', description: 'Reported by the source and stored as-is.' },
  CALCULATED: { label: 'Calculated', tone: 'accent', description: 'Derived by the financial engine from reported figures.' },
  ESTIMATED: { label: 'Estimated', tone: 'warn', description: 'A consensus or model estimate, not a reported figure.' },
  ASSUMPTION: { label: 'Assumption', tone: 'brass', description: 'An input chosen by the analyst.' },
  AI_INTERPRETATION: { label: 'AI reading', tone: 'outline', description: 'An interpretation produced by the AI layer.' },
};

export function Provenance({ origin, source, asOf, className }: { origin: ValueOrigin; source?: string; asOf?: string; className?: string }) {
  const meta = ORIGIN_META[origin];
  return (
    <Tooltip content={
      <span>
        <strong className="text-ink">{meta.label}.</strong> {meta.description}
        {source ? <><br />Source: {source}</> : null}
        {asOf ? <><br />As of {formatDate(asOf)}</> : null}
      </span>
    }>
      <Badge tone={meta.tone} className={className}>{meta.label}</Badge>
    </Tooltip>
  );
}

export function SimulatedBadge({ source }: { source?: string }) {
  return (
    <Tooltip content={
      <span>
        This workspace is running on simulated data from {source ?? 'MockMarketDataProvider'}. Prices,
        consensus and news are generated, not observed from a market. Connect a market-data provider to
        replace them; every calculation stays the same.
      </span>
    }>
      <Badge tone="warn">Simulated data</Badge>
    </Tooltip>
  );
}

/* =====================  Metric cards  ===================== */

export function MetricCard({
  label, value, format = 'number', currency = 'BRL', decimals, delta, deltaFormat = 'percentSigned',
  deltaInvert, sublabel, tooltip, accent, footer, className,
}: {
  label: ReactNode; value: number | null | undefined; format?: MetricFormat; currency?: Currency;
  decimals?: number; delta?: number | null; deltaFormat?: MetricFormat; deltaInvert?: boolean;
  sublabel?: ReactNode; tooltip?: ReactNode; accent?: boolean; footer?: ReactNode; className?: string;
}) {
  const body = (
    <div className={cx('panel px-3 py-2.5', accent && 'border-accent/35', className)}>
      <div className="flex items-center gap-1">
        <span className="label">{label}</span>
        {tooltip ? <Tooltip content={tooltip}><Icon.Info size={11} className="text-ink-4" /></Tooltip> : null}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className={cx('num whitespace-nowrap text-lg font-semibold', isNum(value) ? 'text-ink' : 'text-ink-4')}>
          {formatMetric(value, format, { currency, decimals })}
        </span>
        {delta !== undefined ? <Delta value={delta} format={deltaFormat} invert={deltaInvert} className="text-xs" /> : null}
      </div>
      {sublabel ? <div className="mt-0.5 text-2xs text-ink-3">{sublabel}</div> : null}
      {footer ? <div className="mt-2 border-t border-line pt-2">{footer}</div> : null}
    </div>
  );
  return body;
}

export function StatRow({
  label, value, hint, className,
}: { label: ReactNode; value: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <div className={cx('flex items-baseline justify-between gap-3 py-[5px]', className)}>
      <span className="text-xs text-ink-3 flex items-center gap-1">
        {label}
        {hint ? <Tooltip content={hint}><Icon.Info size={10} className="text-ink-4" /></Tooltip> : null}
      </span>
      <span className="text-right">{value}</span>
    </div>
  );
}

/* =====================  Status chips  ===================== */

export const RECOMMENDATION_META: Record<string, { label: string; tone: 'pos' | 'neg' | 'neutral' | 'warn' }> = {
  STRONG_BUY: { label: 'Strong buy', tone: 'pos' },
  BUY: { label: 'Buy', tone: 'pos' },
  HOLD: { label: 'Hold', tone: 'neutral' },
  SELL: { label: 'Sell', tone: 'neg' },
  STRONG_SELL: { label: 'Strong sell', tone: 'neg' },
};

export function RecommendationBadge({ value }: { value: string | null | undefined }) {
  if (!value) return <Badge tone="outline">No view</Badge>;
  const meta = RECOMMENDATION_META[value] ?? { label: value, tone: 'neutral' as const };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export const CONVICTION_META: Record<string, string> = {
  LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', VERY_HIGH: 'Very high',
};

export function ConvictionBadge({ value }: { value: string | null | undefined }) {
  if (!value) return null;
  const filled = { LOW: 1, MEDIUM: 2, HIGH: 3, VERY_HIGH: 4 }[value] ?? 0;
  return (
    <Tooltip content={`${CONVICTION_META[value] ?? value} conviction`}>
      <span className="inline-flex items-center gap-1">
        <span className="flex gap-[2px]">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={cx('h-[10px] w-[3px] rounded-full', i < filled ? 'bg-brass' : 'bg-line-strong')} />
          ))}
        </span>
        <span className="text-2xs uppercase tracking-wider text-ink-3 font-semibold">{CONVICTION_META[value] ?? value}</span>
      </span>
    </Tooltip>
  );
}

export const THESIS_STATUS_META: Record<string, { label: string; tone: 'pos' | 'neg' | 'warn' | 'neutral' }> = {
  ACTIVE: { label: 'Active', tone: 'pos' },
  UNDER_REVIEW: { label: 'Under review', tone: 'warn' },
  DETERIORATING: { label: 'Deteriorating', tone: 'neg' },
  CLOSED: { label: 'Closed', tone: 'neutral' },
};

export const THESIS_VERDICT_META: Record<string, { label: string; tone: 'pos' | 'neg' | 'warn' | 'neutral' }> = {
  INTACT: { label: 'Intact', tone: 'pos' },
  WEAKENING: { label: 'Weakening', tone: 'warn' },
  BROKEN: { label: 'Broken', tone: 'neg' },
  INSUFFICIENT_DATA: { label: 'Not measurable', tone: 'neutral' },
};

export function ThesisVerdictBadge({ verdict }: { verdict: string }) {
  const meta = THESIS_VERDICT_META[verdict] ?? THESIS_VERDICT_META.INSUFFICIENT_DATA;
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

export const SEVERITY_META: Record<string, { label: string; tone: 'neg' | 'warn' | 'neutral' }> = {
  CRITICAL: { label: 'Critical', tone: 'neg' },
  IMPORTANT: { label: 'Important', tone: 'warn' },
  INFORMATIONAL: { label: 'Informational', tone: 'neutral' },
  HIGH: { label: 'High', tone: 'neg' },
  MEDIUM: { label: 'Medium', tone: 'warn' },
  LOW: { label: 'Low', tone: 'neutral' },
};

export function SeverityBadge({ value }: { value: string }) {
  const meta = SEVERITY_META[value] ?? { label: value, tone: 'neutral' as const };
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

/** A compact horizontal bar used inside dense tables. */
export function BarCell({
  value, max, tone = 'accent', showValue = true, format = 'percent', currency = 'BRL',
}: {
  value: number | null; max: number; tone?: 'accent' | 'pos' | 'neg' | 'brass';
  showValue?: boolean; format?: MetricFormat; currency?: Currency;
}) {
  const pct = isNum(value) && max > 0 ? Math.min(100, Math.abs((value as number) / max) * 100) : 0;
  const colors = { accent: 'bg-accent', pos: 'bg-pos', neg: 'bg-neg', brass: 'bg-brass' };
  return (
    <div className="flex items-center gap-2">
      <div className="h-[5px] flex-1 min-w-[40px] rounded-full bg-sunken overflow-hidden">
        <div className={cx('h-full rounded-full', colors[tone])} style={{ width: `${pct}%` }} />
      </div>
      {showValue ? <Num value={value} format={format} currency={currency} className="w-14 text-right text-2xs" /> : null}
    </div>
  );
}

export { formatCompact, formatMoney, formatMultiple, formatNumber, formatPercent, formatDate, DASH };
