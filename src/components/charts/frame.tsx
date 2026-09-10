'use client';

import { useState, type ReactNode } from 'react';
import { cx, IconButton, Tooltip } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { DASH } from '@/lib/finance/format';

export interface ChartSeriesMeta {
  key: string;
  label: string;
  color: string;
}

/**
 * The frame every chart sits in: title, legend, and a table view of the same
 * numbers. The table is not optional decoration — it is the accessibility
 * fallback the palette's contrast relief depends on, and analysts read it.
 */
export function ChartFrame({
  title, subtitle, series, actions, children, tableRows, tableColumns, height = 240, footnote, className,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  series?: ChartSeriesMeta[];
  actions?: ReactNode;
  children: ReactNode;
  tableColumns?: string[];
  tableRows?: (string | number | null)[][];
  height?: number;
  footnote?: ReactNode;
  className?: string;
}) {
  const [showTable, setShowTable] = useState(false);
  const hasTable = !!tableColumns?.length && !!tableRows?.length;

  return (
    <figure className={cx('panel p-3 m-0', className)}>
      {(title || series?.length || actions || hasTable) ? (
        <figcaption className="mb-2 flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            {title ? <div className="text-sm font-semibold text-ink">{title}</div> : null}
            {subtitle ? <div className="mt-0.5 text-2xs text-ink-3">{subtitle}</div> : null}
          </div>
          <div className="flex items-center gap-2">
            {series && series.length >= 2 ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {series.map((s) => (
                  <span key={s.key} className="inline-flex items-center gap-1.5 text-2xs text-ink-2">
                    <span className="h-[3px] w-[10px] rounded-full" style={{ background: s.color }} />
                    {s.label}
                  </span>
                ))}
              </div>
            ) : null}
            {actions}
            {hasTable ? (
              <Tooltip content={showTable ? 'Show the chart' : 'Show the underlying numbers'}>
                <IconButton
                  label={showTable ? 'Show chart' : 'Show table'}
                  size="xs"
                  onClick={() => setShowTable((v) => !v)}
                >
                  {showTable ? <Icon.Monitoring size={13} /> : <Icon.Grid size={13} />}
                </IconButton>
              </Tooltip>
            ) : null}
          </div>
        </figcaption>
      ) : null}

      {showTable && hasTable ? (
        <div className="overflow-auto" style={{ maxHeight: height }}>
          <table className="w-full border-collapse text-base">
            <thead>
              <tr>
                {tableColumns!.map((c, i) => (
                  <th key={c} className={cx('label border-b border-line px-2 py-1', i === 0 ? 'text-left' : 'text-right')}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows!.map((row, ri) => (
                <tr key={ri} className="border-b border-line/50">
                  {row.map((cell, ci) => (
                    <td key={ci} className={cx('px-2 py-1', ci === 0 ? 'text-left text-ink-2' : 'text-right num')}>
                      {cell === null || cell === undefined ? DASH : String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ height }} className="w-full">{children}</div>
      )}

      {footnote ? <div className="mt-2 text-2xs text-ink-4">{footnote}</div> : null}
    </figure>
  );
}

/** Shared tooltip surface so every chart's hover layer looks the same. */
export function ChartTooltip({
  label, rows, footer,
}: { label?: ReactNode; rows: { key: string; label: string; value: string; color?: string }[]; footer?: ReactNode }) {
  return (
    <div className="rounded border border-line-strong bg-panel px-2.5 py-2 shadow-pop min-w-[150px]">
      {label ? <div className="mb-1 text-2xs font-semibold uppercase tracking-wider text-ink-3">{label}</div> : null}
      <div className="space-y-0.5">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center justify-between gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-ink-2">
              {r.color ? <span className="h-[3px] w-[9px] rounded-full" style={{ background: r.color }} /> : null}
              {r.label}
            </span>
            <span className="num text-ink">{r.value}</span>
          </div>
        ))}
      </div>
      {footer ? <div className="mt-1.5 border-t border-line pt-1.5 text-2xs text-ink-3">{footer}</div> : null}
    </div>
  );
}
