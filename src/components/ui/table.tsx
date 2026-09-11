'use client';

import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { cx, EmptyState, IconButton, Input } from './primitives';
import { Icon } from './icons';
import { Num } from './values';
import type { MetricFormat } from '@/lib/finance/format';
import type { Currency } from '@/lib/finance/types';
import { isNum } from '@/lib/finance/core';

/* ==========================  DataTable  ========================== */

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Extracts the sortable / formattable value. */
  value?: (row: T) => number | string | null | undefined;
  render?: (row: T) => ReactNode;
  format?: MetricFormat;
  currency?: (row: T) => Currency;
  decimals?: number;
  align?: 'left' | 'right' | 'center';
  width?: string;
  sticky?: boolean;
  sortable?: boolean;
  tooltip?: string;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  initialSort?: { key: string; direction: 'asc' | 'desc' };
  emptyTitle?: string;
  emptyDescription?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: (row: T) => string;
  maxHeight?: string;
  dense?: boolean;
  footer?: ReactNode;
  className?: string;
  highlightRow?: (row: T) => boolean;
  stickyHeader?: boolean;
}

export function DataTable<T>({
  columns, rows, rowKey, onRowClick, initialSort, emptyTitle = 'Nothing to show',
  emptyDescription, searchable = false, searchPlaceholder = 'Filter…', searchValue,
  maxHeight, dense = false, footer, className, highlightRow, stickyHeader = true,
}: DataTableProps<T>) {
  const [sort, setSort] = useState(initialSort ?? null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim() || !searchValue) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter((r) => searchValue(r).toLowerCase().includes(q));
  }, [rows, query, searchValue]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.value) return filtered;
    const dir = sort.direction === 'asc' ? 1 : -1;
    return filtered.slice().sort((a, b) => {
      const av = col.value!(a);
      const bv = col.value!(b);
      if (typeof av === 'string' || typeof bv === 'string') {
        return String(av ?? '').localeCompare(String(bv ?? '')) * dir;
      }
      // Missing values always sort last, whichever direction is active.
      if (!isNum(av) && !isNum(bv)) return 0;
      if (!isNum(av)) return 1;
      if (!isNum(bv)) return -1;
      return ((av as number) - (bv as number)) * dir;
    });
  }, [filtered, sort, columns]);

  const toggleSort = (key: string) => {
    setSort((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'desc' },
    );
  };

  const pad = dense ? 'px-2 py-[3px]' : 'px-2.5 py-[6px]';

  return (
    <div className={cx('panel overflow-hidden', className)} data-table>
      {searchable ? (
        <div className="flex items-center gap-2 border-b border-line px-2.5 py-2">
          <Icon.Search size={13} className="text-ink-4 shrink-0" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)} placeholder={searchPlaceholder}
            className="h-6 w-full bg-transparent text-base text-ink placeholder:text-ink-4 focus:outline-none"
          />
          {query ? <IconButton label="Clear" size="xs" onClick={() => setQuery('')}><Icon.Close size={11} /></IconButton> : null}
          <span className="num text-2xs text-ink-4 shrink-0">{sorted.length}</span>
        </div>
      ) : null}

      <div className="overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
        {sorted.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <table className="w-full border-collapse text-base">
            <thead className={cx(stickyHeader && 'sticky top-0 z-10')}>
              <tr className="bg-raised">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    title={c.tooltip}
                    style={c.width ? { width: c.width, minWidth: c.width } : undefined}
                    className={cx(
                      'label border-b border-line bg-raised font-semibold whitespace-nowrap', pad,
                      c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left',
                      c.sticky && 'sticky left-0 z-20',
                      c.sortable !== false && c.value && 'cursor-pointer hover:text-ink',
                      c.headerClassName,
                    )}
                    onClick={() => c.sortable !== false && c.value && toggleSort(c.key)}
                  >
                    <span className={cx('inline-flex items-center gap-1', c.align === 'right' && 'flex-row-reverse')}>
                      {c.header}
                      {sort?.key === c.key ? (
                        sort.direction === 'asc' ? <Icon.ArrowUp size={9} strokeWidth={2.5} /> : <Icon.ArrowDown size={9} strokeWidth={2.5} />
                      ) : null}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cx(
                    'border-b border-line/60 last:border-0 transition-colors',
                    onRowClick && 'cursor-pointer',
                    highlightRow?.(row) ? 'bg-accent/[0.05] hover:bg-accent/[0.09]' : 'hover:bg-raised',
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cx(
                        pad, 'align-middle',
                        c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left',
                        c.sticky && 'sticky left-0 bg-panel',
                        c.className,
                      )}
                    >
                      {c.render
                        ? c.render(row)
                        : c.format
                          ? <Num value={c.value?.(row) as number | null} format={c.format} currency={c.currency?.(row)} decimals={c.decimals} />
                          : String(c.value?.(row) ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {footer ? <tfoot className="bg-raised">{footer}</tfoot> : null}
          </table>
        )}
      </div>
    </div>
  );
}

/* =======================  FinancialTable  ======================= */

export interface FinancialRow {
  key: string;
  label: string;
  /** Values keyed by period label. */
  values: Record<string, number | null>;
  format?: MetricFormat;
  indent?: 0 | 1 | 2;
  emphasis?: 'total' | 'subtotal' | 'normal';
  formula?: string;
  /** Renders as a section divider with no values. */
  divider?: boolean;
  invertColor?: boolean;
}

export interface FinancialTableProps {
  periods: { label: string; sublabel?: string }[];
  rows: FinancialRow[];
  currency?: Currency;
  unitNote?: string;
  showGrowth?: boolean;
  growthRowKeys?: string[];
  className?: string;
  maxHeight?: string;
  onCellHover?: (row: string, period: string) => void;
}

/**
 * A period-by-period statement table: line items down, periods across, sticky
 * first column and header, accounting formatting and optional growth rows.
 */
export function FinancialTable({
  periods, rows, currency = 'BRL', unitNote, showGrowth = false,
  growthRowKeys, className, maxHeight,
}: FinancialTableProps) {
  const growthSet = useMemo(
    () => new Set(growthRowKeys ?? ['revenue', 'ebitda', 'netIncome']),
    [growthRowKeys],
  );

  return (
    <div className={cx('panel overflow-hidden', className)}>
      {unitNote ? (
        <div className="border-b border-line px-3 py-1.5 text-2xs text-ink-3">{unitNote}</div>
      ) : null}
      <div className="overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
        <table className="w-full border-collapse text-base grid-dense-table">
          <thead className="sticky top-0 z-10">
            <tr className="bg-raised">
              <th className="label sticky left-0 z-20 bg-raised border-b border-line text-left min-w-[210px]">
                Line item
              </th>
              {periods.map((p) => (
                <th key={p.label} className="label border-b border-line bg-raised text-right whitespace-nowrap min-w-[92px]">
                  <div>{p.label}</div>
                  {p.sublabel ? <div className="font-normal normal-case tracking-normal text-ink-4">{p.sublabel}</div> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              if (row.divider) {
                return (
                  <tr key={row.key} className="bg-sunken">
                    <td colSpan={periods.length + 1} className="label sticky left-0 bg-sunken">
                      {row.label}
                    </td>
                  </tr>
                );
              }
              const emphasis =
                row.emphasis === 'total' ? 'font-semibold text-ink border-t border-line-strong'
                  : row.emphasis === 'subtotal' ? 'font-medium text-ink'
                  : 'text-ink-2';
              return (
                // The fragment is the element the list renders, so the key
                // belongs here rather than on the row inside it.
                <Fragment key={row.key}>
                  <tr className="border-b border-line/50 hover:bg-raised transition-colors">
                    <td
                      className={cx('sticky left-0 bg-panel whitespace-nowrap', emphasis)}
                      style={{ paddingLeft: `${10 + (row.indent ?? 0) * 14}px` }}
                      title={row.formula}
                    >
                      <span className={row.formula ? 'border-b border-dotted border-ink-4 cursor-help' : undefined}>
                        {row.label}
                      </span>
                    </td>
                    {periods.map((p) => (
                      <td key={p.label} className={cx('text-right', emphasis)}>
                        <Num
                          value={row.values[p.label] ?? null}
                          format={row.format ?? 'number'}
                          currency={currency}
                          className={row.emphasis === 'total' ? 'font-semibold' : undefined}
                        />
                      </td>
                    ))}
                  </tr>
                  {showGrowth && growthSet.has(row.key) ? (
                    <tr className="border-b border-line/50 bg-sunken/40">
                      <td className="sticky left-0 bg-sunken/40 text-2xs text-ink-4" style={{ paddingLeft: `${24 + (row.indent ?? 0) * 14}px` }}>
                        growth
                      </td>
                      {periods.map((p, i) => {
                        const current = row.values[p.label];
                        const prev = i > 0 ? row.values[periods[i - 1].label] : null;
                        const g = isNum(current) && isNum(prev) && (prev as number) !== 0
                          ? ((current as number) - (prev as number)) / Math.abs(prev as number)
                          : null;
                        return (
                          <td key={p.label} className="text-right">
                            <span className={cx('num text-2xs', !isNum(g) ? 'text-ink-4' : (g as number) > 0 ? 'text-pos' : (g as number) < 0 ? 'text-neg' : 'text-ink-3')}>
                              {isNum(g) ? `${(g as number) > 0 ? '+' : ''}${((g as number) * 100).toFixed(1)}%` : '—'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ==========================  Heatmap  ========================== */

export function HeatmapTable({
  rowLabels, colLabels, cells, rowTitle, colTitle, formatCell, centerValue, className,
}: {
  rowLabels: string[]; colLabels: string[];
  cells: (number | null)[][];
  rowTitle?: string; colTitle?: string;
  formatCell: (v: number | null) => string;
  centerValue?: number | null;
  className?: string;
}) {
  const flat = cells.flat().filter(isNum) as number[];
  const min = flat.length ? Math.min(...flat) : 0;
  const max = flat.length ? Math.max(...flat) : 1;
  const mid = isNum(centerValue) ? (centerValue as number) : (min + max) / 2;

  const colorFor = (v: number | null): string => {
    if (!isNum(v)) return 'transparent';
    const value = v as number;
    if (value >= mid) {
      const t = max === mid ? 0 : (value - mid) / (max - mid);
      return `rgb(var(--m-pos) / ${(0.08 + t * 0.30).toFixed(3)})`;
    }
    const t = mid === min ? 0 : (mid - value) / (mid - min);
    return `rgb(var(--m-neg) / ${(0.08 + t * 0.30).toFixed(3)})`;
  };

  return (
    <div className={cx('panel overflow-auto', className)}>
      <table className="w-full border-collapse text-base">
        <thead>
          <tr>
            <th className="label sticky left-0 bg-raised border-b border-r border-line px-2 py-1.5 text-left whitespace-nowrap">
              {rowTitle ? <span className="text-ink-3">{rowTitle}</span> : null}
              {colTitle ? <span className="text-ink-4"> \ {colTitle}</span> : null}
            </th>
            {colLabels.map((c) => (
              <th key={c} className="label border-b border-line bg-raised px-2 py-1.5 text-right whitespace-nowrap">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowLabels.map((r, ri) => (
            <tr key={r}>
              <th className="label sticky left-0 bg-raised border-r border-line px-2 py-1.5 text-left whitespace-nowrap">{r}</th>
              {colLabels.map((c, ci) => (
                <td
                  key={c}
                  className="px-2 py-1.5 text-right num border-b border-line/40"
                  style={{ backgroundColor: colorFor(cells[ri]?.[ci] ?? null) }}
                >
                  {formatCell(cells[ri]?.[ci] ?? null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { Input };
