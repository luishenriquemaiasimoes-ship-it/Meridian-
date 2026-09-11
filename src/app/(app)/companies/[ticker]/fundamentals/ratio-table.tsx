'use client';

import { DataTable, type Column } from '@/components/ui/table';
import { Num } from '@/components/ui/values';
import { Panel, PanelHeader, Tooltip } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import type { Currency } from '@/lib/finance/types';

export interface RatioRow {
  key: string;
  label: string;
  format: 'percent' | 'multiple' | 'days' | 'ratio' | 'currencyMillions';
  values: Record<string, number | null>;
  formula?: string;
  peer?: number | null;
  sector?: number | null;
}

/**
 * A ratio block: measures down, periods across, with the peer and sector
 * medians pinned to the right so a figure is never read without its context.
 */
export function RatioSection({
  title, subtitle, rows, labels, currency,
}: { title: string; subtitle: string; rows: RatioRow[]; labels: string[]; currency: Currency }) {
  const decimalsFor = (format: RatioRow['format']) =>
    format === 'multiple' || format === 'ratio' ? 2 : undefined;

  const columns: Column<RatioRow>[] = [
    {
      key: 'label', header: 'Measure', sticky: true, width: '215px', sortable: false,
      value: (r) => r.label,
      render: (r) => (
        <span className="flex items-center gap-1">
          <span className="text-xs text-ink-2">{r.label}</span>
          {r.formula ? (
            <Tooltip content={<span className="num">{r.formula}</span>}>
              <Icon.Info size={10} className="text-ink-4" />
            </Tooltip>
          ) : null}
        </span>
      ),
    },
    ...labels.map((l): Column<RatioRow> => ({
      key: l, header: l, align: 'right', sortable: false,
      value: (r) => r.values[l],
      render: (r) => <Num value={r.values[l]} format={r.format} currency={currency} decimals={decimalsFor(r.format)} />,
    })),
    {
      key: 'peer', header: 'Peer median', align: 'right', sortable: false,
      value: (r) => r.peer ?? null,
      render: (r) => <Num value={r.peer ?? null} format={r.format} currency={currency} decimals={decimalsFor(r.format)} muted />,
      headerClassName: 'border-l border-line',
      className: 'border-l border-line',
    },
    {
      key: 'sector', header: 'Sector median', align: 'right', sortable: false,
      value: (r) => r.sector ?? null,
      render: (r) => <Num value={r.sector ?? null} format={r.format} currency={currency} decimals={decimalsFor(r.format)} muted />,
    },
  ];

  return (
    <Panel padded={false}>
      <div className="p-3 pb-2">
        <PanelHeader title={title} subtitle={subtitle} dense />
      </div>
      <DataTable
        columns={columns} rows={rows} rowKey={(r) => r.key}
        className="rounded-none border-0 border-t border-line" dense stickyHeader={false}
      />
    </Panel>
  );
}
