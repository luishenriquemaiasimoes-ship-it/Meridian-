'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, type Column } from '@/components/ui/table';
import { Delta, Num, Unavailable } from '@/components/ui/values';
import { Button, Segmented, Select, cx } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { downloadText, toCsv } from '@/lib/import/csv';
import type { Currency } from '@/lib/finance/types';

export interface UniverseRow {
  ticker: string; name: string; sector: string; industry: string; country: string;
  currency: string; exchange: string; price: number | null; dailyChangePct: number | null;
  marketCap: number | null; evEbitda: number | null; pe: number | null; fcfYield: number | null;
  revenueGrowth: number | null; ebitdaMargin: number | null; roic: number | null; roe: number | null;
  netDebtToEbitda: number | null; return12m: number | null; basisLabel: string; bankLike: boolean;
}

type View = 'valuation' | 'quality' | 'growth';

export function UniverseTable({ rows, sectors, countries }: { rows: UniverseRow[]; sectors: string[]; countries: string[] }) {
  const router = useRouter();
  const [view, setView] = useState<View>('valuation');
  const [sector, setSector] = useState('');
  const [country, setCountry] = useState('');

  const filtered = useMemo(
    () => rows.filter((r) => (!sector || r.sector === sector) && (!country || r.country === country)),
    [rows, sector, country],
  );

  const base: Column<UniverseRow>[] = [
    {
      key: 'ticker', header: 'Company', width: '190px', sticky: true, value: (r) => r.ticker,
      render: (r) => (
        <span className="block">
          <span className="num text-xs font-medium text-ink">{r.ticker}</span>
          <span className="block truncate text-2xs text-ink-4">{r.name} · {r.exchange}</span>
        </span>
      ),
    },
    { key: 'sector', header: 'Sector', width: '150px', value: (r) => r.sector, render: (r) => <span className="truncate text-xs text-ink-3">{r.sector}</span> },
    { key: 'price', header: 'Price', align: 'right', value: (r) => r.price, render: (r) => <Num value={r.price} format="currency" currency={r.currency as Currency} /> },
    { key: 'day', header: 'Day', align: 'right', value: (r) => r.dailyChangePct, render: (r) => <Delta value={r.dailyChangePct} /> },
    { key: 'mcap', header: 'Market cap', align: 'right', value: (r) => r.marketCap, render: (r) => <Num value={r.marketCap} format="currencyMillions" currency={r.currency as Currency} /> },
  ];

  const byView: Record<View, Column<UniverseRow>[]> = {
    valuation: [
      {
        key: 'evEbitda', header: 'EV/EBITDA', align: 'right', value: (r) => r.evEbitda,
        render: (r) => (r.bankLike ? <Unavailable reason="Enterprise-value multiples are not comparable for a deposit-funded institution." /> : <Num value={r.evEbitda} format="multiple" />),
      },
      { key: 'pe', header: 'P/E', align: 'right', value: (r) => r.pe, format: 'multiple' },
      { key: 'fcfYield', header: 'FCF yield', align: 'right', value: (r) => r.fcfYield, format: 'percent' },
      { key: 'return12m', header: '12M', align: 'right', value: (r) => r.return12m, render: (r) => <Delta value={r.return12m} /> },
    ],
    quality: [
      {
        key: 'roic', header: 'ROIC', align: 'right', value: (r) => r.roic,
        render: (r) => (r.bankLike ? <Unavailable reason="ROIC is not meaningful for a bank; return on equity is used instead." /> : <Num value={r.roic} format="percent" />),
      },
      { key: 'roe', header: 'ROE', align: 'right', value: (r) => r.roe, format: 'percent' },
      { key: 'ebitdaMargin', header: 'EBITDA margin', align: 'right', value: (r) => r.ebitdaMargin, format: 'percent' },
      { key: 'lev', header: 'Net debt/EBITDA', align: 'right', value: (r) => r.netDebtToEbitda, format: 'multiple' },
    ],
    growth: [
      { key: 'revenueGrowth', header: 'Revenue growth', align: 'right', value: (r) => r.revenueGrowth, render: (r) => <Delta value={r.revenueGrowth} /> },
      { key: 'ebitdaMargin', header: 'EBITDA margin', align: 'right', value: (r) => r.ebitdaMargin, format: 'percent' },
      { key: 'return12m', header: '12M return', align: 'right', value: (r) => r.return12m, render: (r) => <Delta value={r.return12m} /> },
      { key: 'basis', header: 'Basis', align: 'right', value: (r) => r.basisLabel, render: (r) => <span className="num text-2xs text-ink-4">{r.basisLabel}</span> },
    ],
  };

  const columns = [...base, ...byView[view]];

  const exportCsv = () => {
    downloadText(
      `meridian-companies-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(
        ['Ticker', 'Name', 'Sector', 'Country', 'Currency', 'Price', 'Market cap', 'EV/EBITDA', 'P/E', 'FCF yield', 'Revenue growth', 'EBITDA margin', 'ROIC', 'ROE', 'Net debt/EBITDA', '12M return', 'Basis'],
        filtered.map((r) => [
          r.ticker, r.name, r.sector, r.country, r.currency, r.price, r.marketCap, r.evEbitda, r.pe,
          r.fcfYield, r.revenueGrowth, r.ebitdaMargin, r.roic, r.roe, r.netDebtToEbitda, r.return12m, r.basisLabel,
        ]),
      ),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          value={view} onChange={setView}
          options={[
            { value: 'valuation', label: 'Valuation' },
            { value: 'quality', label: 'Quality' },
            { value: 'growth', label: 'Growth' },
          ]}
        />
        <Select value={sector} onChange={(e) => setSector(e.target.value)} className={cx('w-[170px]')}>
          <option value="">All sectors</option>
          {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={country} onChange={(e) => setCountry(e.target.value)} className="w-[150px]">
          <option value="">All countries</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <span className="num text-2xs text-ink-4">{filtered.length} of {rows.length}</span>
        <Button className="ml-auto" size="sm" icon={<Icon.Download size={12} />} onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.ticker}
        onRowClick={(r) => router.push(`/companies/${r.ticker}`)}
        initialSort={{ key: 'mcap', direction: 'desc' }}
        searchable
        searchPlaceholder="Filter by ticker or name…"
        searchValue={(r) => `${r.ticker} ${r.name} ${r.sector} ${r.industry}`}
        maxHeight="calc(100vh - 250px)"
        dense
      />
    </div>
  );
}
