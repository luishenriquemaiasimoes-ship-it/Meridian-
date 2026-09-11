'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, cx, EmptyState, Field, InlineNote, Modal, NumberInput,
  Panel, PanelHeader, Segmented, Select, Input, Spinner, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { DataTable, type Column } from '@/components/ui/table';
import { Num, Unavailable } from '@/components/ui/values';
import { ScatterPlot } from '@/components/charts';
import { downloadText, toCsv } from '@/lib/import/csv';
import type { MetricFormat } from '@/lib/finance/format';
import type { Currency } from '@/lib/finance/types';

interface MetricDef { key: string; label: string; format: string; group: string }
interface Filter { metric: string; comparator: 'GT' | 'GTE' | 'LT' | 'LTE' | 'BETWEEN'; value: number; value2?: number }

interface ResultRow {
  ticker: string; name: string; sector: string; country: string; currency: string; bankLike: boolean;
  investmentScore: number | null;
  factors: { factor: string; label: string; score: number | null; coverage: number }[];
  metrics: Record<string, number | null>;
}

const COMPARATORS: { value: Filter['comparator']; label: string }[] = [
  { value: 'GTE', label: 'at least' },
  { value: 'GT', label: 'above' },
  { value: 'LTE', label: 'at most' },
  { value: 'LT', label: 'below' },
  { value: 'BETWEEN', label: 'between' },
];

const DEFAULT_COLUMNS = ['marketCap', 'evEbitda', 'pe', 'fcfYield', 'revenueGrowth', 'ebitdaMargin', 'roic', 'netDebtToEbitda'];

const PRESETS: { name: string; description: string; filters: Filter[] }[] = [
  {
    name: 'Quality at a reasonable price',
    description: 'High returns on capital that are not yet priced as such.',
    filters: [
      { metric: 'roic', comparator: 'GTE', value: 0.15 },
      { metric: 'evEbitda', comparator: 'LTE', value: 12 },
      { metric: 'revenueGrowth', comparator: 'GTE', value: 0.05 },
    ],
  },
  {
    name: 'Cash generative, lowly levered',
    description: 'Free cash flow yield with a balance sheet that can carry a downturn.',
    filters: [
      { metric: 'fcfYield', comparator: 'GTE', value: 0.08 },
      { metric: 'netDebtToEbitda', comparator: 'LTE', value: 1.5 },
    ],
  },
  {
    name: 'Value creators',
    description: 'Return on capital above the cost of capital, growing.',
    filters: [
      { metric: 'roicSpread', comparator: 'GTE', value: 0.03 },
      { metric: 'revenueGrowth', comparator: 'GTE', value: 0.08 },
    ],
  },
  {
    name: 'Deep value',
    description: 'Cheap on earnings and on cash, whatever the reason.',
    filters: [
      { metric: 'pe', comparator: 'LTE', value: 10 },
      { metric: 'fcfYield', comparator: 'GTE', value: 0.1 },
    ],
  },
];

export function ScreenerWorkbench({
  metricDefinitions, sectors, countries, themes, universeSize, savedScreens, initialScreenId, canSave,
}: {
  metricDefinitions: MetricDef[];
  sectors: string[];
  countries: string[];
  themes: { slug: string; label: string; description: string }[];
  universeSize: number;
  savedScreens: { id: string; name: string; sortBy: string | null; filters: { metric: string; comparator: string; value: number }[] }[];
  initialScreenId: string | null;
  canSave: boolean;
}) {
  const router = useRouter();
  const toast = useToast();

  const initial = savedScreens.find((s) => s.id === initialScreenId);
  const [filters, setFilters] = useState<Filter[]>(
    (initial?.filters as Filter[]) ?? PRESETS[0].filters,
  );
  const [sectorFilter, setSectorFilter] = useState<string[]>([]);
  const [countryFilter, setCountryFilter] = useState<string[]>([]);
  const [themeFilter, setThemeFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>(initial?.sortBy ?? 'investmentScore');
  const [view, setView] = useState<'table' | 'factors' | 'map'>('table');
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [meta, setMeta] = useState({ matched: 0, excludedForMissingData: 0 });
  const [loading, setLoading] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [screenName, setScreenName] = useState(initial?.name ?? '');

  const metricByKey = useMemo(() => new Map(metricDefinitions.map((m) => [m.key, m])), [metricDefinitions]);
  const grouped = useMemo(() => {
    const map = new Map<string, MetricDef[]>();
    for (const m of metricDefinitions) {
      const list = map.get(m.group) ?? [];
      list.push(m);
      map.set(m.group, list);
    }
    return Array.from(map.entries());
  }, [metricDefinitions]);

  const run = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/screener/run', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters, sectors: sectorFilter, countries: countryFilter, themes: themeFilter,
          sortBy, sortDirection: 'desc', limit: 300,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Screen failed', description: data.error }); return; }
      setRows(data.rows);
      setMeta({ matched: data.matched, excludedForMissingData: data.excludedForMissingData });
    } finally {
      setLoading(false);
    }
  }, [filters, sectorFilter, countryFilter, themeFilter, sortBy, toast]);

  useEffect(() => { void run(); }, [run]);

  const addFilter = () => setFilters((f) => [...f, { metric: 'roic', comparator: 'GTE', value: 0.15 }]);
  const updateFilter = (i: number, patch: Partial<Filter>) =>
    setFilters((f) => f.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const removeFilter = (i: number) => setFilters((f) => f.filter((_, j) => j !== i));

  const toggle = (list: string[], value: string, set: (v: string[]) => void) =>
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  const saveScreen = async () => {
    const res = await fetch('/api/screener/screens', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: screenName, filters, sortBy }),
    });
    const data = await res.json();
    if (!res.ok) { toast.push({ tone: 'neg', title: 'Could not save', description: data.error }); return; }
    toast.push({ tone: 'pos', title: 'Screen saved', description: `"${screenName}" is available from the saved list.` });
    setSaveModal(false);
    router.refresh();
  };

  const deleteScreen = async (id: string, name: string) => {
    const res = await fetch(`/api/screener/screens?id=${id}`, { method: 'DELETE' });
    if (res.ok) { toast.push({ tone: 'pos', title: `"${name}" deleted` }); router.refresh(); }
  };

  const columns: Column<ResultRow>[] = [
    {
      key: 'ticker', header: 'Company', sticky: true, width: '180px',
      value: (r) => r.ticker,
      render: (r) => (
        <span className="block">
          <span className="num text-xs font-medium text-ink">{r.ticker}</span>
          <span className="block truncate text-2xs text-ink-4">{r.name}</span>
        </span>
      ),
    },
    { key: 'sector', header: 'Sector', width: '140px', value: (r) => r.sector, render: (r) => <span className="truncate text-xs text-ink-3">{r.sector}</span> },
    {
      key: 'investmentScore', header: 'Score', align: 'right', width: '70px',
      value: (r) => r.investmentScore,
      render: (r) => (
        <span className={cx('num text-xs font-medium', (r.investmentScore ?? 0) >= 70 ? 'text-pos' : (r.investmentScore ?? 0) >= 45 ? 'text-ink' : 'text-ink-3')}>
          {r.investmentScore === null ? '—' : r.investmentScore.toFixed(0)}
        </span>
      ),
    },
    ...DEFAULT_COLUMNS.map((key): Column<ResultRow> => {
      const def = metricByKey.get(key);
      return {
        key, header: def?.label ?? key, align: 'right',
        value: (r) => r.metrics[key],
        render: (r) =>
          r.bankLike && (key === 'evEbitda' || key === 'roic')
            ? <Unavailable reason="Not a comparable measure for a deposit-funded institution." />
            : <Num value={r.metrics[key]} format={(def?.format ?? 'number') as MetricFormat} currency={r.currency as Currency} />,
      };
    }),
  ];

  const exportCsv = () => {
    downloadText(
      `meridian-screen-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(
        ['Ticker', 'Name', 'Sector', 'Country', 'Score', ...DEFAULT_COLUMNS.map((k) => metricByKey.get(k)?.label ?? k)],
        rows.map((r) => [r.ticker, r.name, r.sector, r.country, r.investmentScore, ...DEFAULT_COLUMNS.map((k) => r.metrics[k])]),
      ),
    );
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
      <div className="space-y-4">
        <Panel>
          <PanelHeader title="Filters" subtitle="All conditions must hold." dense
            actions={<Button size="xs" icon={<Icon.Plus size={11} />} onClick={addFilter}>Add</Button>} />
          {filters.length === 0 ? (
            <p className="py-3 text-center text-xs text-ink-3">No filters — the full universe is shown.</p>
          ) : (
            <div className="space-y-2">
              {filters.map((f, i) => (
                <div key={i} className="rounded border border-line p-2">
                  <div className="flex items-center gap-1.5">
                    <Select
                      value={f.metric} className="flex-1"
                      onChange={(e) => updateFilter(i, { metric: e.target.value })}
                    >
                      {grouped.map(([group, items]) => (
                        <optgroup key={group} label={group}>
                          {items.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                        </optgroup>
                      ))}
                    </Select>
                    <button type="button" onClick={() => removeFilter(i)} className="shrink-0 text-ink-4 hover:text-neg">
                      <Icon.Close size={13} />
                    </button>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Select
                      value={f.comparator} className="w-[110px]"
                      onChange={(e) => updateFilter(i, { comparator: e.target.value as Filter['comparator'] })}
                    >
                      {COMPARATORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </Select>
                    <NumberInput value={f.value} step="0.01" onValueChange={(v) => updateFilter(i, { value: v })} />
                    {f.comparator === 'BETWEEN' ? (
                      <NumberInput value={f.value2 ?? 0} step="0.01" onValueChange={(v) => updateFilter(i, { value2: v })} />
                    ) : null}
                  </div>
                  <p className="mt-1 text-2xs text-ink-4">
                    {metricByKey.get(f.metric)?.format === 'percent' ? 'Percentages as decimals: 0.15 means 15%.' : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex gap-2 border-t border-line pt-3">
            <Button variant="primary" size="sm" className="flex-1" onClick={run} loading={loading}>Run screen</Button>
            {canSave ? <Button size="sm" icon={<Icon.Save size={12} />} onClick={() => setSaveModal(true)}>Save</Button> : null}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Universe" dense />
          <p className="label mb-1.5">Sector</p>
          <div className="mb-3 flex flex-wrap gap-1">
            {sectors.map((s) => (
              <button
                key={s} type="button" onClick={() => toggle(sectorFilter, s, setSectorFilter)}
                className={cx(
                  'rounded border px-1.5 py-0.5 text-2xs transition',
                  sectorFilter.includes(s) ? 'border-accent bg-accent/10 text-accent' : 'border-line text-ink-3 hover:border-line-strong',
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="label mb-1.5">Country</p>
          <div className="mb-3 flex flex-wrap gap-1">
            {countries.map((c) => (
              <button
                key={c} type="button" onClick={() => toggle(countryFilter, c, setCountryFilter)}
                className={cx(
                  'rounded border px-1.5 py-0.5 text-2xs transition',
                  countryFilter.includes(c) ? 'border-accent bg-accent/10 text-accent' : 'border-line text-ink-3 hover:border-line-strong',
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="label mb-1.5">Theme</p>
          <div className="flex flex-wrap gap-1">
            {themes.map((t) => (
              <button
                key={t.slug} type="button" title={t.description}
                onClick={() => toggle(themeFilter, t.slug, setThemeFilter)}
                className={cx(
                  'rounded border px-1.5 py-0.5 text-2xs transition',
                  themeFilter.includes(t.slug) ? 'border-brass bg-brass/10 text-brass' : 'border-line text-ink-3 hover:border-line-strong',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Presets" dense />
          {PRESETS.map((p) => (
            <button
              key={p.name} type="button" onClick={() => setFilters(p.filters)}
              className="mb-1.5 block w-full rounded border border-line px-2.5 py-1.5 text-left transition hover:border-line-strong hover:bg-raised"
            >
              <span className="block text-xs text-ink">{p.name}</span>
              <span className="block text-2xs text-ink-4">{p.description}</span>
            </button>
          ))}
        </Panel>

        {savedScreens.length ? (
          <Panel>
            <PanelHeader title="Saved screens" dense />
            {savedScreens.map((s) => (
              <div key={s.id} className="mb-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setFilters(s.filters as Filter[]); setSortBy(s.sortBy ?? 'investmentScore'); setScreenName(s.name); }}
                  className="flex-1 rounded border border-line px-2.5 py-1.5 text-left transition hover:border-line-strong hover:bg-raised"
                >
                  <span className="block text-xs text-ink">{s.name}</span>
                  <span className="block text-2xs text-ink-4">{s.filters.length} filters</span>
                </button>
                {canSave ? (
                  <button type="button" onClick={() => deleteScreen(s.id, s.name)} className="shrink-0 text-ink-4 hover:text-neg">
                    <Icon.Trash size={12} />
                  </button>
                ) : null}
              </div>
            ))}
          </Panel>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            value={view} onChange={(v) => setView(v as typeof view)}
            options={[
              { value: 'table', label: 'Results' },
              { value: 'factors', label: 'Factor scores' },
              { value: 'map', label: 'Map' },
            ]}
          />
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-[180px]">
            <option value="investmentScore">Sort: investment score</option>
            {metricDefinitions.map((m) => <option key={m.key} value={m.key}>Sort: {m.label}</option>)}
          </Select>
          <span className="num text-2xs text-ink-4">
            {loading ? <Spinner size={11} /> : `${meta.matched} of ${universeSize}`}
          </span>
          <Button className="ml-auto" size="sm" icon={<Icon.Download size={12} />} onClick={exportCsv} disabled={!rows.length}>
            Export CSV
          </Button>
        </div>

        {meta.excludedForMissingData > 0 ? (
          <InlineNote tone="info">
            {meta.excludedForMissingData} compan{meta.excludedForMissingData === 1 ? 'y was' : 'ies were'} excluded
            only because the workspace does not hold the datum a filter tests. A missing value never passes a
            filter silently.
          </InlineNote>
        ) : null}

        {rows.length === 0 && !loading ? (
          <Panel>
            <EmptyState
              icon={<Icon.Screener size={22} />}
              title="Nothing matches these conditions"
              description="Relax a filter, or check whether the universe filters above are too narrow."
            />
          </Panel>
        ) : null}

        {view === 'table' && rows.length ? (
          <DataTable
            columns={columns} rows={rows} rowKey={(r) => r.ticker}
            onRowClick={(r) => router.push(`/companies/${r.ticker}`)}
            searchable searchPlaceholder="Filter results…"
            searchValue={(r) => `${r.ticker} ${r.name} ${r.sector}`}
            initialSort={{ key: 'investmentScore', direction: 'desc' }}
            maxHeight="calc(100vh - 300px)" dense
          />
        ) : null}

        {view === 'factors' && rows.length ? (
          <Panel padded={false}>
            <div className="p-3 pb-2">
              <PanelHeader
                title="Factor scores"
                subtitle="Each factor is a cross-sectional percentile against the universe, scored 0–10. Coverage says how much of the factor could be measured."
                dense
              />
            </div>
            <div className="overflow-auto">
              <table className="w-full border-collapse text-base">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-raised">
                    <th className="label sticky left-0 z-20 border-b border-line bg-raised px-2.5 py-1.5 text-left">Company</th>
                    {rows[0].factors.map((f) => (
                      <th key={f.factor} className="label border-b border-line bg-raised px-2.5 py-1.5 text-right">{f.label}</th>
                    ))}
                    <th className="label border-b border-line bg-raised px-2.5 py-1.5 text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.ticker} className="border-b border-line/50 hover:bg-raised">
                      <td className="sticky left-0 bg-panel px-2.5 py-1">
                        <span className="num text-xs text-ink">{r.ticker}</span>
                      </td>
                      {r.factors.map((f) => (
                        <td key={f.factor} className="px-2.5 py-1 text-right">
                          <span
                            className={cx('num text-xs', (f.score ?? 0) >= 7 ? 'text-pos' : (f.score ?? 0) >= 4 ? 'text-ink-2' : 'text-ink-3')}
                            title={`Coverage ${(f.coverage * 100).toFixed(0)}%`}
                          >
                            {f.score === null ? '—' : f.score.toFixed(1)}
                          </span>
                        </td>
                      ))}
                      <td className="px-2.5 py-1 text-right">
                        <span className="num text-xs font-medium text-ink">{r.investmentScore?.toFixed(0) ?? '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        ) : null}

        {view === 'map' && rows.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <ScatterPlot
              points={rows.map((r) => ({ key: r.ticker, label: r.ticker, x: r.metrics.roic, y: r.metrics.evEbitda, size: r.metrics.marketCap ?? undefined }))}
              xLabel="ROIC" yLabel="EV / EBITDA" xFormat="percent" yFormat="multiple"
              title="Returns against rating" subtitle="Bubble size is market capitalisation" height={340}
            />
            <ScatterPlot
              points={rows.map((r) => ({ key: r.ticker, label: r.ticker, x: r.metrics.revenueGrowth, y: r.metrics.fcfYield, size: r.metrics.marketCap ?? undefined }))}
              xLabel="Revenue growth" yLabel="FCF yield" xFormat="percent" yFormat="percent"
              title="Growth against cash yield" subtitle="The trade-off the screen is usually making" height={340}
            />
          </div>
        ) : null}
      </div>

      <Modal
        open={saveModal} onClose={() => setSaveModal(false)}
        title="Save this screen"
        subtitle="Saved screens are shared with everyone in the workspace."
        footer={<><Button variant="ghost" onClick={() => setSaveModal(false)}>Cancel</Button><Button variant="primary" onClick={saveScreen} disabled={!screenName.trim()}>Save</Button></>}
      >
        <Field label="Name" required>
          <Input value={screenName} onChange={(e) => setScreenName(e.target.value)} placeholder="Quality at a reasonable price" />
        </Field>
        <div className="mt-3">
          <p className="label mb-1.5">Conditions</p>
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f, i) => (
              <Badge key={i} tone="outline">
                {metricByKey.get(f.metric)?.label} {COMPARATORS.find((c) => c.value === f.comparator)?.label} {f.value}
              </Badge>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
