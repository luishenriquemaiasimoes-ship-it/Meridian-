'use client';

import { useRouter } from 'next/navigation';
import { DataTable, type Column } from '@/components/ui/table';
import { Delta, Num, RecommendationBadge, ThesisVerdictBadge } from '@/components/ui/values';
import { formatDate } from '@/lib/finance/format';
import type { WatchRow } from '@/server/services/dashboard';
import type { Currency } from '@/lib/finance/types';

export function WatchlistTable({ rows }: { rows: WatchRow[] }) {
  const router = useRouter();

  const columns: Column<WatchRow>[] = [
    {
      key: 'ticker', header: 'Ticker', width: '110px', sticky: true,
      value: (r) => r.ticker,
      render: (r) => (
        <span className="block">
          <span className="num text-xs font-medium text-ink">{r.ticker}</span>
          <span className="block truncate text-2xs text-ink-4">{r.name}</span>
        </span>
      ),
    },
    { key: 'price', header: 'Price', align: 'right', value: (r) => r.price, render: (r) => <Num value={r.price} format="currency" currency={r.currency as Currency} /> },
    { key: 'day', header: 'Day', align: 'right', value: (r) => r.dailyChangePct, render: (r) => <Delta value={r.dailyChangePct} /> },
    { key: 'evEbitda', header: 'EV/EBITDA', align: 'right', value: (r) => r.evEbitda, format: 'multiple' },
    { key: 'pe', header: 'P/E', align: 'right', value: (r) => r.pe, format: 'multiple' },
    { key: 'roic', header: 'ROIC', align: 'right', value: (r) => r.roic, format: 'percent' },
    { key: 'target', header: 'Target', align: 'right', value: (r) => r.targetPrice, render: (r) => <Num value={r.targetPrice} format="currency" currency={r.currency as Currency} /> },
    { key: 'upside', header: 'Upside', align: 'right', value: (r) => r.upside, render: (r) => <Delta value={r.upside} /> },
    { key: 'rec', header: 'View', align: 'center', value: (r) => r.recommendation ?? '', render: (r) => <RecommendationBadge value={r.recommendation} /> },
    { key: 'thesis', header: 'Thesis', align: 'center', value: (r) => r.thesisVerdict ?? '', render: (r) => (r.thesisVerdict ? <ThesisVerdictBadge verdict={r.thesisVerdict} /> : <span className="text-ink-4">—</span>) },
    { key: 'earnings', header: 'Next print', align: 'right', value: (r) => r.nextEarnings ?? '', render: (r) => <span className="num text-2xs text-ink-3">{r.nextEarnings ? formatDate(r.nextEarnings) : '—'}</span> },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.ticker}
      onRowClick={(r) => router.push(`/companies/${r.ticker}`)}
      initialSort={{ key: 'upside', direction: 'desc' }}
      className="rounded-none border-0 border-t border-line"
      maxHeight="420px"
      dense
    />
  );
}
