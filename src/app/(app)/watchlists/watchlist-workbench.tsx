'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, cx, EmptyState, Field, InlineNote, Input, Modal, Panel, PanelHeader,
  Segmented, Textarea, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { DataTable, type Column } from '@/components/ui/table';
import { MetricCard, Num, RecommendationBadge, ThesisVerdictBadge } from '@/components/ui/values';
import { DASH, formatDate, formatPercent } from '@/lib/finance/format';
import { downloadText, toCsv } from '@/lib/import/csv';
import { isNum } from '@/lib/finance/core';
import type { Currency } from '@/lib/finance/types';

interface ItemRow {
  id: string; ticker: string; name: string; sector: string; country: string; currency: string;
  note: string | null; addedAt: string;
  price: number | null; dailyChangePct: number | null; return1m: number | null; return12m: number | null;
  week52High: number | null; week52Low: number | null; rangePosition: number | null;
  marketCap: number | null; pe: number | null; evEbitda: number | null; fcfYield: number | null;
  roic: number | null; revenueGrowth: number | null; netDebtToEbitda: number | null; bankLike: boolean;
  targetPrice: number | null; upside: number | null; recommendation: string | null; thesisVerdict: string | null;
}

interface WatchlistRow {
  id: string; name: string; description: string | null;
  createdAt: string; updatedAt: string; items: ItemRow[];
}

type View = 'performance' | 'valuation' | 'quality';

export function WatchlistWorkbench(props: {
  watchlists: WatchlistRow[];
  selectedId: string | null;
  canWrite: boolean;
  companies: { ticker: string; name: string; sector: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [view, setView] = useState<View>('performance');
  const [createModal, setCreateModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [newList, setNewList] = useState({ name: '', description: '' });
  const [addTicker, setAddTicker] = useState('');
  const [addNote, setAddNote] = useState('');

  const selected = props.watchlists.find((w) => w.id === props.selectedId) ?? null;
  const onList = useMemo(() => new Set(selected?.items.map((i) => i.ticker) ?? []), [selected]);
  const candidates = props.companies.filter((c) => !onList.has(c.ticker));

  const movers = useMemo(() => {
    const items = (selected?.items ?? []).filter((i) => isNum(i.dailyChangePct));
    const sorted = items.slice().sort((a, b) => (b.dailyChangePct ?? 0) - (a.dailyChangePct ?? 0));
    return { up: sorted.slice(0, 3), down: sorted.slice(-3).reverse() };
  }, [selected]);

  const summary = useMemo(() => {
    const items = selected?.items ?? [];
    const avg = (get: (i: ItemRow) => number | null) => {
      const xs = items.map(get).filter((v): v is number => isNum(v));
      return xs.length ? xs.reduce((s, v) => s + v, 0) / xs.length : null;
    };
    const nearHigh = items.filter((i) => isNum(i.rangePosition) && (i.rangePosition as number) > 0.9).length;
    const nearLow = items.filter((i) => isNum(i.rangePosition) && (i.rangePosition as number) < 0.1).length;
    return { avgDaily: avg((i) => i.dailyChangePct), avg12m: avg((i) => i.return12m), nearHigh, nearLow };
  }, [selected]);

  const createList = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/watchlists', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newList.name, description: newList.description || null }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Not created', description: data.error }); return; }
      toast.push({ tone: 'pos', title: 'Watchlist created', description: newList.name });
      setCreateModal(false);
      setNewList({ name: '', description: '' });
      router.push(`/watchlists?id=${data.watchlist.id}`);
      router.refresh();
    } finally { setBusy(false); }
  };

  const mutate = async (body: Record<string, unknown>, successTitle: string) => {
    if (!selected) return;
    const res = await fetch(`/api/watchlists/${selected.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { toast.push({ tone: 'neg', title: 'Not updated', description: data.error }); return false; }
    toast.push({ tone: 'pos', title: successTitle, description: data.summary });
    router.refresh();
    return true;
  };

  const addName = async () => {
    setBusy(true);
    try {
      const done = await mutate({ addTicker: addTicker.toUpperCase(), note: addNote || null }, 'Added to watchlist');
      if (done) { setAddModal(false); setAddTicker(''); setAddNote(''); }
    } finally { setBusy(false); }
  };

  const removeName = async (ticker: string) => {
    await mutate({ removeTicker: ticker }, 'Removed from watchlist');
  };

  const deleteList = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/watchlists/${selected.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        toast.push({ tone: 'neg', title: 'Not deleted', description: data.error });
        return;
      }
      toast.push({ tone: 'pos', title: 'Watchlist deleted', description: selected.name });
      router.push('/watchlists');
      router.refresh();
    } finally { setBusy(false); }
  };

  const exportCsv = () => {
    if (!selected) return;
    downloadText(
      `meridian-watchlist-${selected.name.toLowerCase().replace(/\s+/g, '-')}.csv`,
      toCsv(
        ['Ticker', 'Company', 'Sector', 'Price', 'Daily %', '1M %', '12M %', 'P/E', 'EV/EBITDA', 'FCF yield', 'ROIC', 'Target', 'Upside', 'Note'],
        selected.items.map((i) => [
          i.ticker, i.name, i.sector, i.price, i.dailyChangePct, i.return1m, i.return12m,
          i.pe, i.evEbitda, i.fcfYield, i.roic, i.targetPrice, i.upside, i.note ?? '',
        ]),
      ),
    );
  };

  const baseColumns: Column<ItemRow>[] = [
    {
      key: 'ticker', header: 'Ticker', sticky: true, width: '96px', sortable: true, value: (r) => r.ticker,
      render: (r) => <Link href={`/companies/${r.ticker}`} className="font-semibold text-ink hover:text-accent">{r.ticker}</Link>,
    },
    { key: 'name', header: 'Company', value: (r) => r.name, sortable: true, className: 'text-ink-2' },
    { key: 'sector', header: 'Sector', value: (r) => r.sector, sortable: true, className: 'text-ink-3 text-2xs' },
  ];

  const viewColumns: Record<View, Column<ItemRow>[]> = {
    performance: [
      { key: 'price', header: 'Price', value: (r) => r.price, format: 'currency', currency: (r) => r.currency as Currency, align: 'right', sortable: true },
      { key: 'daily', header: 'Day', value: (r) => r.dailyChangePct, format: 'percentSigned', align: 'right', sortable: true },
      { key: 'r1m', header: '1M', value: (r) => r.return1m, format: 'percentSigned', align: 'right', sortable: true },
      { key: 'r12m', header: '12M', value: (r) => r.return12m, format: 'percentSigned', align: 'right', sortable: true },
      {
        key: 'range', header: '52-week range', align: 'right', sortable: true, value: (r) => r.rangePosition,
        tooltip: 'Where the price sits between its 52-week low and high.',
        render: (r) => <RangeBar row={r} />,
      },
      { key: 'target', header: 'Target', value: (r) => r.targetPrice, format: 'currency', currency: (r) => r.currency as Currency, align: 'right', sortable: true },
      { key: 'upside', header: 'Upside', value: (r) => r.upside, format: 'percentSigned', align: 'right', sortable: true },
    ],
    valuation: [
      { key: 'mcap', header: 'Market cap', value: (r) => r.marketCap, format: 'currencyMillions', currency: (r) => r.currency as Currency, align: 'right', sortable: true },
      { key: 'pe', header: 'P / E', value: (r) => r.pe, format: 'multiple', align: 'right', sortable: true },
      {
        key: 'ev', header: 'EV / EBITDA', align: 'right', sortable: true, value: (r) => r.evEbitda,
        render: (r) => r.bankLike
          ? <span className="text-2xs text-ink-4" title="Enterprise value is not meaningful for a bank: deposits and debt are operating funding.">n/m</span>
          : <Num value={r.evEbitda} format="multiple" />,
      },
      { key: 'fcf', header: 'FCF yield', value: (r) => r.fcfYield, format: 'percent', align: 'right', sortable: true },
      { key: 'rec', header: 'Call', value: (r) => r.recommendation ?? '', sortable: true, render: (r) => r.recommendation ? <RecommendationBadge value={r.recommendation} /> : <span className="text-ink-4">{DASH}</span> },
      { key: 'verdict', header: 'Thesis', value: (r) => r.thesisVerdict ?? '', sortable: true, render: (r) => r.thesisVerdict ? <ThesisVerdictBadge verdict={r.thesisVerdict} /> : <span className="text-ink-4">{DASH}</span> },
    ],
    quality: [
      {
        key: 'roic', header: 'ROIC', align: 'right', sortable: true, value: (r) => r.roic,
        render: (r) => r.bankLike
          ? <span className="text-2xs text-ink-4" title="Invested capital is not a meaningful denominator for a bank. Use ROE.">n/m</span>
          : <Num value={r.roic} format="percent" />,
      },
      { key: 'growth', header: 'Revenue growth', value: (r) => r.revenueGrowth, format: 'percent', align: 'right', sortable: true },
      { key: 'leverage', header: 'Net debt / EBITDA', value: (r) => r.netDebtToEbitda, format: 'multiple', align: 'right', sortable: true },
      { key: 'added', header: 'Added', value: (r) => r.addedAt, sortable: true, align: 'right', render: (r) => <span className="text-2xs text-ink-3">{formatDate(r.addedAt)}</span> },
      { key: 'note', header: 'Note', value: (r) => r.note ?? '', render: (r) => <span className="text-2xs text-ink-3">{r.note ?? DASH}</span> },
    ],
  };

  const actionColumn: Column<ItemRow>[] = props.canWrite
    ? [{
        key: 'actions', header: '', width: '36px', align: 'right',
        render: (r) => (
          <button
            type="button" title={`Remove ${r.ticker}`}
            className="text-ink-4 hover:text-neg focus-ring rounded"
            onClick={() => removeName(r.ticker)}
          >
            <Icon.Close size={13} />
          </button>
        ),
      }]
    : [];

  const columns = [...baseColumns, ...viewColumns[view], ...actionColumn];

  if (!props.watchlists.length) {
    return (
      <>
        <Panel>
          <EmptyState
            icon={<Icon.Watchlist size={22} />}
            title="No watchlists yet"
            description="A watchlist is where a name sits between the screener and a full model. Create one and add the companies you want to keep an eye on."
            action={props.canWrite ? <Button variant="primary" icon={<Icon.Plus size={13} />} onClick={() => setCreateModal(true)}>New watchlist</Button> : undefined}
          />
        </Panel>
        <CreateModal
          open={createModal} onClose={() => setCreateModal(false)} value={newList}
          onChange={setNewList} onSubmit={createList} busy={busy}
        />
      </>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <aside className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="label">Lists</span>
          {props.canWrite ? (
            <button type="button" onClick={() => setCreateModal(true)} className="text-ink-3 hover:text-accent focus-ring rounded" title="New watchlist">
              <Icon.Plus size={14} />
            </button>
          ) : null}
        </div>
        <nav className="space-y-1">
          {props.watchlists.map((w) => (
            <Link
              key={w.id}
              href={`/watchlists?id=${w.id}`}
              className={cx(
                'block rounded border px-2.5 py-2 transition',
                w.id === props.selectedId ? 'border-accent/40 bg-accent/[0.05]' : 'border-line hover:border-line-strong',
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium text-ink truncate">{w.name}</span>
                <span className="num text-2xs text-ink-4">{w.items.length}</span>
              </div>
              {w.description ? <p className="mt-0.5 text-2xs text-ink-3 line-clamp-2">{w.description}</p> : null}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="space-y-4 min-w-0">
        {selected ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Names tracked" value={selected.items.length} format="number" decimals={0} />
              <MetricCard label="Average move today" value={summary.avgDaily} format="percentSigned" sublabel="Equal-weighted across the list" />
              <MetricCard label="Average 12-month return" value={summary.avg12m} format="percentSigned" />
              <MetricCard
                label="At the extremes" value={summary.nearHigh + summary.nearLow} format="number" decimals={0}
                sublabel={`${summary.nearHigh} near the 52-week high, ${summary.nearLow} near the low`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">{selected.name}</h2>
                {selected.description ? <p className="text-xs text-ink-3">{selected.description}</p> : null}
              </div>
              <div className="flex items-center gap-2">
                <Segmented
                  value={view}
                  onChange={setView}
                  options={[
                    { value: 'performance', label: 'Performance' },
                    { value: 'valuation', label: 'Valuation' },
                    { value: 'quality', label: 'Quality' },
                  ]}
                />
                <Button icon={<Icon.Download size={13} />} onClick={exportCsv} disabled={!selected.items.length}>CSV</Button>
                {props.canWrite ? (
                  <>
                    <Button variant="primary" icon={<Icon.Plus size={13} />} onClick={() => setAddModal(true)}>Add name</Button>
                    <Button icon={<Icon.Trash size={13} />} onClick={deleteList} loading={busy} title="Delete this watchlist" />
                  </>
                ) : null}
              </div>
            </div>

            {selected.items.length ? (
              <>
                <Panel>
                  <DataTable
                    columns={columns}
                    rows={selected.items}
                    rowKey={(r) => r.id}
                    dense
                    searchable
                    searchValue={(r) => `${r.ticker} ${r.name} ${r.sector}`}
                    emptyTitle="Nothing on this list"
                  />
                </Panel>

                <div className="grid gap-3 lg:grid-cols-2">
                  <Panel>
                    <PanelHeader title="Today's movers" subtitle="Largest moves on this list" />
                    <div className="px-3 pb-3">
                      <MoverList rows={movers.up} label="Up" />
                      <MoverList rows={movers.down} label="Down" />
                    </div>
                  </Panel>
                  <Panel>
                    <PanelHeader title="Notes" subtitle="Why each name is on the list" />
                    <div className="px-3 pb-3 divide-y divide-line">
                      {selected.items.filter((i) => i.note).map((i) => (
                        <div key={i.id} className="py-2">
                          <Link href={`/companies/${i.ticker}`} className="text-xs font-semibold text-ink hover:text-accent">{i.ticker}</Link>
                          <p className="mt-0.5 text-xs text-ink-2">{i.note}</p>
                        </div>
                      ))}
                      {selected.items.every((i) => !i.note) ? (
                        <p className="py-3 text-xs text-ink-4">No notes recorded. Add a note when you put a name on the list so the reason survives the week.</p>
                      ) : null}
                    </div>
                  </Panel>
                </div>
              </>
            ) : (
              <Panel>
                <EmptyState
                  icon={<Icon.Watchlist size={22} />}
                  title={`${selected.name} is empty`}
                  description="Add the companies you want to keep an eye on. Prices, multiples and thesis state come from the same computation the rest of the product uses."
                  action={props.canWrite ? <Button variant="primary" icon={<Icon.Plus size={13} />} onClick={() => setAddModal(true)}>Add name</Button> : undefined}
                />
              </Panel>
            )}
          </>
        ) : null}
      </div>

      <CreateModal
        open={createModal} onClose={() => setCreateModal(false)} value={newList}
        onChange={setNewList} onSubmit={createList} busy={busy}
      />

      <Modal
        open={addModal}
        onClose={() => setAddModal(false)}
        title={`Add to ${selected?.name ?? 'watchlist'}`}
        subtitle="Only companies covered in this workspace can be tracked."
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setAddModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={addName} loading={busy} disabled={!addTicker}>Add</Button>
          </div>
        }
      >
        <div className="space-y-3 p-4">
          <Field label="Company" required>
            <Input
              list="watchlist-candidates"
              value={addTicker}
              onChange={(e) => setAddTicker(e.target.value.toUpperCase())}
              placeholder="VALE3"
            />
            <datalist id="watchlist-candidates">
              {candidates.map((c) => <option key={c.ticker} value={c.ticker}>{c.name}</option>)}
            </datalist>
          </Field>
          <Field label="Note" hint="Why is this name worth watching? One line is enough.">
            <Textarea rows={3} value={addNote} onChange={(e) => setAddNote(e.target.value)} placeholder="Waiting for the capex cycle to roll over before the FCF yield is real." />
          </Field>
          {candidates.length === 0 ? (
            <InlineNote tone="info">Every covered company is already on this list.</InlineNote>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}

function CreateModal({
  open, onClose, value, onChange, onSubmit, busy,
}: {
  open: boolean; onClose: () => void;
  value: { name: string; description: string };
  onChange: (v: { name: string; description: string }) => void;
  onSubmit: () => void; busy: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New watchlist"
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onSubmit} loading={busy} disabled={value.name.trim().length < 2}>Create</Button>
        </div>
      }
    >
      <div className="space-y-3 p-4">
        <Field label="Name" required>
          <Input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} placeholder="Brazilian commodities" />
        </Field>
        <Field label="Description" hint="What belongs on this list, and what does not.">
          <Textarea rows={3} value={value.description} onChange={(e) => onChange({ ...value, description: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}

function RangeBar({ row }: { row: ItemRow }) {
  if (!isNum(row.rangePosition)) return <span className="text-ink-4">{DASH}</span>;
  const pct = Math.max(0, Math.min(1, row.rangePosition as number)) * 100;
  return (
    <div className="flex items-center justify-end gap-2" title={`Low ${row.week52Low ?? DASH} · High ${row.week52High ?? DASH}`}>
      <div className="relative h-[5px] w-16 rounded-full bg-sunken">
        <span
          className={cx('absolute top-1/2 h-[9px] w-[2px] -translate-y-1/2 rounded', pct > 90 ? 'bg-pos' : pct < 10 ? 'bg-neg' : 'bg-accent')}
          style={{ left: `${pct}%` }}
        />
      </div>
      <span className="num w-9 text-right text-2xs text-ink-3">{formatPercent(row.rangePosition, 0)}</span>
    </div>
  );
}

function MoverList({ rows, label }: { rows: ItemRow[]; label: string }) {
  if (!rows.length) return null;
  return (
    <div className="mt-2 first:mt-0">
      <div className="label mb-1">{label}</div>
      <div className="divide-y divide-line">
        {rows.map((r) => (
          <div key={r.id} className="flex items-baseline justify-between py-1.5">
            <Link href={`/companies/${r.ticker}`} className="text-xs font-medium text-ink hover:text-accent">{r.ticker}</Link>
            <div className="flex items-baseline gap-3">
              <Num value={r.price} format="currency" currency={r.currency as Currency} className="text-2xs text-ink-3" />
              <Num value={r.dailyChangePct} format="percentSigned" className="w-14 text-right text-xs" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
