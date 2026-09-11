'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, Checkbox, cx, EmptyState, Field, InlineNote, Input, Modal, Panel,
  PanelHeader, Segmented, Select, Tooltip, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { DataTable, type Column } from '@/components/ui/table';
import { MetricCard, Num } from '@/components/ui/values';
import { ScatterPlot } from '@/components/charts';
import { DASH, formatMetric, ordinal } from '@/lib/finance/format';
import { downloadText, toCsv } from '@/lib/import/csv';
import { isNum } from '@/lib/finance/core';
import type { Currency } from '@/lib/finance/types';

interface CompanyRow {
  ticker: string; name: string; sector: string; industry: string; country: string;
  currency: Currency; bankLike: boolean; basisLabel: string;
  marketCap: number | null; enterpriseValue: number | null;
  evRevenue: number | null; evEbitda: number | null; evEbit: number | null;
  pe: number | null; pb: number | null; ps: number | null;
  fcfYield: number | null; dividendYield: number | null;
  revenueGrowth: number | null; ebitdaGrowth: number | null; ebitdaMargin: number | null;
  roic: number | null; roe: number | null; netDebtToEbitda: number | null;
}

const VALUATION_KEYS = ['evRevenue', 'evEbitda', 'evEbit', 'pe', 'pb', 'ps', 'fcfYield', 'dividendYield'] as const;
const OPERATING_KEYS = ['revenueGrowth', 'ebitdaGrowth', 'ebitdaMargin', 'roic', 'roe', 'netDebtToEbitda'] as const;
const EV_KEYS = new Set(['evRevenue', 'evEbitda', 'evEbit']);

export function ComparablesWorkbench(props: {
  canWrite: boolean;
  companies: CompanyRow[];
  groups: { id: string; name: string; anchorTicker: string | null; tickers: string[] }[];
  initialGroupId: string | null;
  initialTickers: string[];
  initialAnchor: string | null;
  labels: Record<string, string>;
  formats: Record<string, 'multiple' | 'percent'>;
}) {
  const router = useRouter();
  const toast = useToast();
  const [selected, setSelected] = useState<string[]>(props.initialTickers);
  const [anchor, setAnchor] = useState<string | null>(props.initialAnchor);
  const [view, setView] = useState<'valuation' | 'operating'>('valuation');
  const [pickerOpen, setPickerOpen] = useState(props.initialTickers.length === 0);
  const [saveOpen, setSaveOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [busy, setBusy] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');

  const rows = useMemo(
    () => selected.map((t) => props.companies.find((c) => c.ticker === t)).filter((c): c is CompanyRow => !!c),
    [selected, props.companies],
  );

  const anchorRow = rows.find((r) => r.ticker === anchor) ?? rows[0] ?? null;
  const anyBank = rows.some((r) => r.bankLike);
  const allBanks = rows.length > 0 && rows.every((r) => r.bankLike);
  const keys = view === 'valuation' ? VALUATION_KEYS : OPERATING_KEYS;

  /** Median, quartiles and the anchor's rank for one measure across the set. */
  const stats = useMemo(() => {
    const out: Record<string, { median: number | null; p25: number | null; p75: number | null; min: number | null; max: number | null; count: number; anchorPercentile: number | null }> = {};
    for (const key of [...VALUATION_KEYS, ...OPERATING_KEYS]) {
      const values = rows
        .filter((r) => !(EV_KEYS.has(key) && r.bankLike))
        .map((r) => (r as unknown as Record<string, number | null>)[key])
        .filter((v): v is number => isNum(v));
      const sorted = values.slice().sort((a, b) => a - b);
      const at = (q: number) => {
        if (!sorted.length) return null;
        const idx = (sorted.length - 1) * q;
        const lo = Math.floor(idx);
        const hi = Math.ceil(idx);
        return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
      };
      const anchorValue = anchorRow
        ? (anchorRow as unknown as Record<string, number | null>)[key] ?? null
        : null;
      out[key] = {
        median: at(0.5),
        p25: at(0.25),
        p75: at(0.75),
        min: sorted[0] ?? null,
        max: sorted[sorted.length - 1] ?? null,
        count: sorted.length,
        anchorPercentile: isNum(anchorValue) && sorted.length
          ? (sorted.filter((v) => v < (anchorValue as number)).length + sorted.filter((v) => v === anchorValue).length / 2) / sorted.length
          : null,
      };
    }
    return out;
  }, [rows, anchorRow]);

  const columns: Column<CompanyRow>[] = [
    {
      key: 'ticker', header: 'Ticker', sticky: true, width: '96px', sortable: true, value: (c) => c.ticker,
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <Link href={`/companies/${c.ticker}`} className={cx('font-semibold hover:text-accent', c.ticker === anchor ? 'text-accent' : 'text-ink')}>
            {c.ticker}
          </Link>
          {c.ticker === anchor ? <span className="text-2xs text-ink-4">anchor</span> : null}
        </div>
      ),
    },
    { key: 'name', header: 'Company', value: (c) => c.name, sortable: true, className: 'text-ink-2' },
    { key: 'country', header: 'Country', value: (c) => c.country, sortable: true, className: 'text-2xs text-ink-3' },
    {
      key: 'cap', header: 'Market cap', value: (c) => c.marketCap, format: 'currencyMillions',
      currency: (c) => c.currency, align: 'right', sortable: true,
    },
    ...keys.map((key): Column<CompanyRow> => ({
      key,
      header: props.labels[key] ?? key,
      align: 'right',
      sortable: true,
      value: (c) => (c as unknown as Record<string, number | null>)[key] ?? null,
      render: (c) => {
        if (EV_KEYS.has(key) && c.bankLike) {
          return (
            <Tooltip content="Enterprise value is not meaningful for a bank: deposits and debt are operating funding, not financing.">
              <span className="text-2xs text-ink-4">n/m</span>
            </Tooltip>
          );
        }
        if (key === 'roic' && c.bankLike) {
          return (
            <Tooltip content="Invested capital is not a meaningful denominator for a bank. Compare on ROE instead.">
              <span className="text-2xs text-ink-4">n/m</span>
            </Tooltip>
          );
        }
        return (
          <Num
            value={(c as unknown as Record<string, number | null>)[key] ?? null}
            format={props.formats[key] ?? 'multiple'}
          />
        );
      },
    })),
  ];

  const toggle = (ticker: string) => {
    setSelected((s) => {
      const next = s.includes(ticker) ? s.filter((t) => t !== ticker) : [...s, ticker];
      if (!next.includes(anchor ?? '')) setAnchor(next[0] ?? null);
      return next;
    });
  };

  const loadGroup = (id: string) => {
    const g = props.groups.find((x) => x.id === id);
    if (!g) return;
    setSelected(g.tickers);
    setAnchor(g.anchorTicker ?? g.tickers[0] ?? null);
    router.push(`/comparables?group=${id}`);
  };

  const saveGroup = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/peer-groups', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName, anchorTicker: anchor, tickers: selected }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Not saved', description: data.error }); return; }
      toast.push({ tone: 'pos', title: 'Peer group saved', description: groupName });
      setSaveOpen(false);
      setGroupName('');
      router.refresh();
    } finally { setBusy(false); }
  };

  const deleteGroup = async (id: string, name: string) => {
    const res = await fetch(`/api/peer-groups/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      toast.push({ tone: 'neg', title: 'Not deleted', description: data.error });
      return;
    }
    toast.push({ tone: 'pos', title: 'Peer group deleted', description: name });
    router.push('/comparables');
    router.refresh();
  };

  const exportCsv = () => {
    downloadText(
      'meridian-comparables.csv',
      toCsv(
        ['Ticker', 'Company', 'Country', 'Market cap', ...[...VALUATION_KEYS, ...OPERATING_KEYS].map((k) => props.labels[k] ?? k)],
        rows.map((c) => [
          c.ticker, c.name, c.country, c.marketCap,
          ...[...VALUATION_KEYS, ...OPERATING_KEYS].map((k) =>
            EV_KEYS.has(k) && c.bankLike ? 'n/m' : (c as unknown as Record<string, number | null>)[k] ?? null,
          ),
        ]),
      ),
    );
  };

  const pickerCompanies = props.companies.filter((c) =>
    !pickerQuery.trim() ||
    `${c.ticker} ${c.name} ${c.sector} ${c.industry}`.toLowerCase().includes(pickerQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Saved peer group" className="min-w-[200px]">
          <Select
            value={props.initialGroupId ?? ''}
            onChange={(e) => (e.target.value ? loadGroup(e.target.value) : router.push('/comparables'))}
          >
            <option value="">Ad-hoc selection</option>
            {props.groups.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.tickers.length})</option>)}
          </Select>
        </Field>
        <Field label="Anchor" className="min-w-[150px]" hint="The company the set is read against.">
          <Select value={anchor ?? ''} onChange={(e) => setAnchor(e.target.value || null)}>
            {rows.map((r) => <option key={r.ticker} value={r.ticker}>{r.ticker}</option>)}
            {rows.length === 0 ? <option value="">—</option> : null}
          </Select>
        </Field>
        <Button icon={<Icon.Plus size={13} />} onClick={() => setPickerOpen(true)}>
          {selected.length ? `Change set (${selected.length})` : 'Pick companies'}
        </Button>
        <Button icon={<Icon.Download size={13} />} onClick={exportCsv} disabled={!rows.length}>CSV</Button>
        {props.canWrite && selected.length >= 2 ? (
          <Button icon={<Icon.Save size={13} />} onClick={() => setSaveOpen(true)}>Save as peer group</Button>
        ) : null}
        {props.canWrite && props.initialGroupId ? (
          <Button
            icon={<Icon.Trash size={13} />}
            onClick={() => {
              const g = props.groups.find((x) => x.id === props.initialGroupId);
              if (g) deleteGroup(g.id, g.name);
            }}
            title="Delete this peer group"
          />
        ) : null}
      </div>

      {rows.length < 2 ? (
        <Panel>
          <EmptyState
            icon={<Icon.Comps size={22} />}
            title="Pick at least two companies"
            description="A comparables table is only as good as the set. Choose the companies you would actually put beside this one, not everything in the sector."
            action={<Button variant="primary" icon={<Icon.Plus size={13} />} onClick={() => setPickerOpen(true)}>Pick companies</Button>}
          />
        </Panel>
      ) : (
        <>
          {anyBank && !allBanks ? (
            <InlineNote tone="warn">
              The set mixes banks with non-banks. Enterprise-value multiples and ROIC are suppressed for the banks rather
              than shown wrong — for a bank, deposits and debt are operating funding and invested capital is not a
              meaningful denominator. Compare those names on P/E, P/B and ROE.
            </InlineNote>
          ) : null}

          {anchorRow ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label={`${anchorRow.ticker} EV / EBITDA`}
                value={anchorRow.bankLike ? null : anchorRow.evEbitda}
                format="multiple"
                sublabel={anchorRow.bankLike ? 'Not meaningful for a bank' : `Set median ${formatMetric(stats.evEbitda?.median ?? null, 'multiple')}`}
              />
              <MetricCard
                label={`${anchorRow.ticker} P / E`}
                value={anchorRow.pe}
                format="multiple"
                sublabel={`Set median ${formatMetric(stats.pe?.median ?? null, 'multiple')}`}
              />
              <MetricCard
                label={`${anchorRow.ticker} ROE`}
                value={anchorRow.roe}
                format="percent"
                sublabel={`Set median ${formatMetric(stats.roe?.median ?? null, 'percent')}`}
              />
              <MetricCard
                label="Companies compared"
                value={rows.length}
                format="number"
                decimals={0}
                sublabel={`Basis ${anchorRow.basisLabel}`}
              />
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <span className="label">Compare on</span>
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { value: 'valuation', label: 'Valuation' },
                { value: 'operating', label: 'Operating' },
              ]}
            />
          </div>

          <Panel>
            <DataTable
              columns={columns}
              rows={rows}
              rowKey={(c) => c.ticker}
              initialSort={{ key: 'cap', direction: 'desc' }}
              dense
              highlightRow={(c) => c.ticker === anchor}
              emptyTitle="No companies selected"
            />
          </Panel>

          <Panel>
            <PanelHeader
              title="Distribution across the set"
              subtitle={anchorRow ? `Where ${anchorRow.ticker} sits in each measure` : undefined}
            />
            <div className="overflow-x-auto px-3 pb-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-2xs uppercase tracking-wide text-ink-4">
                    <th className="py-1 text-left font-semibold">Measure</th>
                    <th className="py-1 text-right font-semibold">Min</th>
                    <th className="py-1 text-right font-semibold">25th</th>
                    <th className="py-1 text-right font-semibold">Median</th>
                    <th className="py-1 text-right font-semibold">75th</th>
                    <th className="py-1 text-right font-semibold">Max</th>
                    <th className="py-1 text-right font-semibold">{anchorRow?.ticker ?? 'Anchor'}</th>
                    <th className="py-1 text-right font-semibold">Rank</th>
                    <th className="py-1 text-right font-semibold">Names</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {keys.map((key) => {
                    const s = stats[key];
                    const fmt = props.formats[key] ?? 'multiple';
                    const anchorValue = anchorRow
                      ? EV_KEYS.has(key) && anchorRow.bankLike
                        ? null
                        : (anchorRow as unknown as Record<string, number | null>)[key] ?? null
                      : null;
                    return (
                      <tr key={key}>
                        <td className="py-1.5 text-ink-2">{props.labels[key] ?? key}</td>
                        <td className="py-1.5 text-right num text-ink-3">{formatMetric(s?.min ?? null, fmt)}</td>
                        <td className="py-1.5 text-right num text-ink-3">{formatMetric(s?.p25 ?? null, fmt)}</td>
                        <td className="py-1.5 text-right num text-ink">{formatMetric(s?.median ?? null, fmt)}</td>
                        <td className="py-1.5 text-right num text-ink-3">{formatMetric(s?.p75 ?? null, fmt)}</td>
                        <td className="py-1.5 text-right num text-ink-3">{formatMetric(s?.max ?? null, fmt)}</td>
                        <td className="py-1.5 text-right num font-semibold text-ink">{formatMetric(anchorValue, fmt)}</td>
                        <td className="py-1.5 text-right num text-ink-3">
                          {isNum(s?.anchorPercentile) ? ordinal(Math.round((s!.anchorPercentile as number) * 100)) : DASH}
                        </td>
                        <td className="py-1.5 text-right num text-ink-4">{s?.count ?? 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="px-3 pb-3 text-2xs text-ink-4">
              Statistics are computed only over the companies that actually report the measure. The &ldquo;Names&rdquo;
              column says how many that was, so a median resting on two observations is visible as such.
            </p>
          </Panel>

          <ScatterPlot
            title={allBanks ? 'ROE against P / Book' : 'ROIC against EV / EBITDA'}
            subtitle="Where the set rates quality"
            points={rows
              .filter((r) => (allBanks ? true : !r.bankLike))
              .map((r) => ({
                key: r.ticker,
                label: r.ticker,
                x: allBanks ? r.roe : r.roic,
                y: allBanks ? r.pb : r.evEbitda,
              }))}
            xLabel={allBanks ? 'ROE' : 'ROIC'}
            yLabel={allBanks ? 'P / Book' : 'EV / EBITDA'}
            xFormat="percent"
            yFormat="multiple"
            highlightKey={anchor ?? undefined}
            height={320}
            footnote="A company missing either measure is omitted rather than plotted at zero."
          />
        </>
      )}

      <Modal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Choose the comparable set"
        subtitle={`${selected.length} selected. A peer group is a judgement — pick the companies a buyer would actually weigh against each other.`}
        width="lg"
        footer={
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={() => setSelected([])} className="text-2xs text-ink-3 hover:text-accent focus-ring rounded">
              Clear selection
            </button>
            <Button variant="primary" onClick={() => setPickerOpen(false)}>Done</Button>
          </div>
        }
      >
        <div className="p-4">
          <Input
            value={pickerQuery}
            onChange={(e) => setPickerQuery(e.target.value)}
            placeholder="Filter by ticker, name, sector or industry"
          />
          <div className="mt-3 max-h-[45vh] space-y-1 overflow-auto">
            {pickerCompanies.map((c) => (
              <label
                key={c.ticker}
                className={cx(
                  'flex cursor-pointer items-center gap-2 rounded border px-2 py-1.5 transition',
                  selected.includes(c.ticker) ? 'border-accent/40 bg-accent/[0.05]' : 'border-line hover:border-line-strong',
                )}
              >
                <Checkbox checked={selected.includes(c.ticker)} onChange={() => toggle(c.ticker)} />
                <span className="w-16 shrink-0 text-xs font-semibold text-ink">{c.ticker}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-ink-2">{c.name}</span>
                <span className="shrink-0 text-2xs text-ink-4">{c.industry}</span>
                {c.bankLike ? <Badge tone="warn">bank</Badge> : null}
              </label>
            ))}
            {pickerCompanies.length === 0 ? (
              <p className="py-6 text-center text-xs text-ink-4">Nothing matches that filter.</p>
            ) : null}
          </div>
        </div>
      </Modal>

      <Modal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        title="Save this peer group"
        width="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setSaveOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveGroup} loading={busy} disabled={groupName.trim().length < 2}>Save</Button>
          </div>
        }
      >
        <div className="space-y-3 p-4">
          <Field label="Name" required>
            <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Global diversified miners" />
          </Field>
          <p className="text-2xs text-ink-4">
            {selected.join(', ')} — anchored on {anchor ?? '—'}.
          </p>
        </div>
      </Modal>
    </div>
  );
}
