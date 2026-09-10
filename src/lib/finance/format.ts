import { isNum } from './core';
import type { Currency } from './types';

/* =====================  FINANCIAL FORMATTING  =====================
   One formatting layer for the whole product so that a value never
   appears in two different shapes on two different screens.
   ================================================================ */

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  BRL: 'R$',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

/** en-US style: $1.25B ; pt-BR style: R$ 1,25 bi */
const BR_SCALES: [number, string][] = [
  [1e12, ' tri'],
  [1e9, ' bi'],
  [1e6, ' mi'],
  [1e3, ' mil'],
];
const EN_SCALES: [number, string][] = [
  [1e12, 'T'],
  [1e9, 'B'],
  [1e6, 'M'],
  [1e3, 'K'],
];

export const DASH = '—';

function localeFor(currency: Currency): 'pt-BR' | 'en-US' {
  return currency === 'BRL' ? 'pt-BR' : 'en-US';
}

function fixed(value: number, dp: number, locale: string): string {
  return value.toLocaleString(locale, { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

export interface CompactOptions {
  currency?: Currency;
  decimals?: number;
  showCurrency?: boolean;
  /** Wrap negatives in parentheses (accounting convention). */
  accounting?: boolean;
  /** Multiply before formatting, e.g. statements reported in thousands. */
  scale?: number;
}

/** R$ 1,25 bi | $1.25B — the platform's canonical large-number format. */
export function formatCompact(value: number | null | undefined, opts: CompactOptions = {}): string {
  if (!isNum(value)) return DASH;
  const currency = opts.currency ?? 'BRL';
  const locale = localeFor(currency);
  const scales = locale === 'pt-BR' ? BR_SCALES : EN_SCALES;
  const dp = opts.decimals ?? 2;
  const raw = (value as number) * (opts.scale ?? 1);
  const negative = raw < 0;
  const abs = Math.abs(raw);

  let body: string;
  const hit = scales.find(([threshold]) => abs >= threshold);
  if (hit) {
    body = fixed(abs / hit[0], dp, locale) + hit[1];
  } else {
    body = fixed(abs, abs < 1 ? Math.max(dp, 2) : dp, locale);
  }

  const prefix = opts.showCurrency === false ? '' : `${CURRENCY_SYMBOL[currency]}${locale === 'pt-BR' ? ' ' : ''}`;
  const withPrefix = prefix + body;
  if (!negative) return withPrefix;
  return opts.accounting ? `(${withPrefix})` : `-${withPrefix}`;
}

/** Full-precision money, e.g. R$ 1.234,56 */
export function formatMoney(
  value: number | null | undefined,
  currency: Currency = 'BRL',
  decimals = 2,
  accounting = false,
): string {
  if (!isNum(value)) return DASH;
  const locale = localeFor(currency);
  const negative = (value as number) < 0;
  const body = `${CURRENCY_SYMBOL[currency]}${locale === 'pt-BR' ? ' ' : ''}${fixed(Math.abs(value as number), decimals, locale)}`;
  if (!negative) return body;
  return accounting ? `(${body})` : `-${body}`;
}

/** 12.4% — input is a ratio (0.124). */
export function formatPercent(
  value: number | null | undefined,
  decimals = 1,
  opts: { signed?: boolean; alreadyPercent?: boolean } = {},
): string {
  if (!isNum(value)) return DASH;
  const pct = opts.alreadyPercent ? (value as number) : (value as number) * 100;
  const sign = opts.signed && pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(decimals)}%`;
}

/** 220 bps — input is a ratio delta (0.022). */
export function formatBps(value: number | null | undefined, decimals = 0): string {
  if (!isNum(value)) return DASH;
  const bps = (value as number) * 10000;
  const sign = bps > 0 ? '+' : '';
  return `${sign}${bps.toFixed(decimals)} bps`;
}

/** 8.4x */
export function formatMultiple(value: number | null | undefined, decimals = 1): string {
  if (!isNum(value)) return DASH;
  return `${(value as number).toFixed(decimals)}x`;
}

/** Plain number with thousands separators, accounting negatives: (120) */
export function formatNumber(
  value: number | null | undefined,
  decimals = 0,
  opts: { accounting?: boolean; currency?: Currency; scale?: number } = {},
): string {
  if (!isNum(value)) return DASH;
  const locale = localeFor(opts.currency ?? 'BRL');
  const raw = (value as number) * (opts.scale ?? 1);
  const body = fixed(Math.abs(raw), decimals, locale);
  if (raw >= 0) return body;
  return opts.accounting === false ? `-${body}` : `(${body})`;
}

export function formatDays(value: number | null | undefined, decimals = 0): string {
  if (!isNum(value)) return DASH;
  return `${(value as number).toFixed(decimals)}d`;
}

export function formatShares(value: number | null | undefined): string {
  if (!isNum(value)) return DASH;
  return formatCompact(value, { showCurrency: false, decimals: 2 });
}

export function formatDate(value: string | Date | null | undefined, locale = 'pt-BR'): string {
  if (!value) return DASH;
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return DASH;
  return d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value: string | Date | null | undefined, locale = 'pt-BR'): string {
  if (!value) return DASH;
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return DASH;
  return d.toLocaleString(locale, {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export type MetricFormat =
  | 'currency' | 'currencyCompact' | 'percent' | 'percentSigned'
  | 'multiple' | 'number' | 'days' | 'bps' | 'shares' | 'ratio' | 'text';

export function formatMetric(
  value: number | null | undefined,
  format: MetricFormat,
  opts: { currency?: Currency; decimals?: number; scale?: number } = {},
): string {
  switch (format) {
    case 'currency': return formatMoney(value, opts.currency ?? 'BRL', opts.decimals ?? 2);
    case 'currencyCompact': return formatCompact(value, { currency: opts.currency, decimals: opts.decimals, scale: opts.scale });
    case 'percent': return formatPercent(value, opts.decimals ?? 1);
    case 'percentSigned': return formatPercent(value, opts.decimals ?? 1, { signed: true });
    case 'multiple': return formatMultiple(value, opts.decimals ?? 1);
    case 'number': return formatNumber(value, opts.decimals ?? 0, { currency: opts.currency, scale: opts.scale });
    case 'days': return formatDays(value, opts.decimals ?? 0);
    case 'bps': return formatBps(value, opts.decimals ?? 0);
    case 'shares': return formatShares(value);
    case 'ratio': return isNum(value) ? (value as number).toFixed(opts.decimals ?? 2) : DASH;
    default: return value === null || value === undefined ? DASH : String(value);
  }
}

/** Sign class for colouring deltas: 'pos' | 'neg' | 'flat'. */
export function signClass(value: number | null | undefined, invert = false): 'pos' | 'neg' | 'flat' {
  if (!isNum(value) || value === 0) return 'flat';
  const positive = (value as number) > 0;
  return (invert ? !positive : positive) ? 'pos' : 'neg';
}
