'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, cx, EmptyState, Field, InlineNote, Input, Modal, Panel, PanelHeader,
  SectionLabel, Select, Textarea, Tooltip, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { Num } from '@/components/ui/values';
import { DASH, formatMetric } from '@/lib/finance/format';
import type { PeerComparisonRow, SectorSection } from '@/lib/research/types';
import type { ComparisonRowResult } from '@/lib/research/comparison';
import type { SectorAnalysisRecord, SectorWorkbenchData } from '@/server/services/sector';

/* ==================================================================
   Sector analysis.

   The comparison table is the point. It is empty until someone builds
   it, because the product has no opinion about which measures matter
   in an industry — and a table that arrives pre-filled teaches the
   analyst to accept rows they did not choose.
   ================================================================== */

type Universe = SectorWorkbenchData['universe'][number];
type MetricDef = SectorWorkbenchData['metrics'][number];
type Template = SectorWorkbenchData['templates'][number];

const STATUS_TONE: Record<string, 'neutral' | 'pos' | 'warn'> = {
  DRAFT: 'neutral', PUBLISHED: 'pos', ARCHIVED: 'warn',
};

/** The written sections every analysis starts with. All of them are optional. */
const SECTION_SUGGESTIONS = [
  { key: 'structure', title: 'Industry structure' },
  { key: 'demand', title: 'Demand drivers' },
  { key: 'supply', title: 'Supply and capacity' },
  { key: 'regulation', title: 'Regulation' },
  { key: 'cycle', title: 'Where we are in the cycle' },
  { key: 'conclusion', title: 'What this means for coverage' },
];

function blankAnalysis(sector: string): SectorAnalysisRecord {
  return {
    id: '', sector, title: sector ? `${sector} — sector analysis` : '',
    status: 'DRAFT', sections: [], tickers: [], rows: [],
    authorName: '', createdAt: '', updatedAt: '',
  };
}

export function SectorAnalysisWorkbench(props: {
  data: SectorWorkbenchData;
  canEdit: boolean;
  defaultSector: string | null;
}) {
  const router = useRouter();
  const toast = useToast();

  const [analyses, setAnalyses] = useState<SectorAnalysisRecord[]>(props.data.analyses);
  const [templates, setTemplates] = useState<Template[]>(props.data.templates);
  const [selectedId, setSelectedId] = useState<string>(props.data.analyses[0]?.id ?? '');
  const [draft, setDraft] = useState<SectorAnalysisRecord>(
    props.data.analyses[0] ?? blankAnalysis(props.defaultSector ?? ''),
  );
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [comparison, setComparison] = useState<ComparisonRowResult[]>([]);
  const [resolving, setResolving] = useState(false);
  const [metricPicker, setMetricPicker] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [companyQuery, setCompanyQuery] = useState('');

  const touch = () => setDirty(true);

  const select = (a: SectorAnalysisRecord | null) => {
    setSelectedId(a?.id ?? '');
    setDraft(a ?? blankAnalysis(props.defaultSector ?? ''));
    setDirty(false);
  };

  /* ---------------- comparison resolution ---------------- */

  const rowsKey = JSON.stringify(draft.rows);
  const tickersKey = JSON.stringify(draft.tickers);

  const resolve = useCallback(async (rows: PeerComparisonRow[], tickers: string[]) => {
    if (!rows.length || !tickers.length) { setComparison([]); return; }
    setResolving(true);
    try {
      const res = await fetch('/api/sector?preview=1', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows, tickers }),
      });
      const d = await res.json();
      if (res.ok) setComparison(d.comparison as ComparisonRowResult[]);
    } finally { setResolving(false); }
  }, []);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { void resolve(draft.rows, draft.tickers); }, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // Serialised keys: the arrays are rebuilt on every edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowsKey, tickersKey, resolve]);

  /* ---------------- mutations ---------------- */

  const toggleTicker = (ticker: string) => {
    setDraft((d) => ({
      ...d,
      tickers: d.tickers.includes(ticker) ? d.tickers.filter((t) => t !== ticker) : [...d.tickers, ticker],
    }));
    touch();
  };

  const addMetricRow = (m: MetricDef) => {
    setDraft((d) => {
      if (d.rows.some((r) => r.kind === 'METRIC' && r.metric === m.key)) return d;
      const row: PeerComparisonRow = {
        key: m.key, label: m.label, kind: 'METRIC', metric: m.key,
        format: m.format, inverse: m.inverse ?? false,
      };
      return { ...d, rows: [...d.rows, row] };
    });
    touch();
  };

  const addManualRow = () => {
    setDraft((d) => ({
      ...d,
      rows: [...d.rows, {
        key: `manual-${Date.now()}`, label: '', kind: 'MANUAL',
        format: 'text', values: {},
      }],
    }));
    touch();
  };

  const updateRow = (key: string, patch: Partial<PeerComparisonRow>) => {
    setDraft((d) => ({ ...d, rows: d.rows.map((r) => (r.key === key ? { ...r, ...patch } : r)) }));
    touch();
  };

  const moveRow = (key: string, dir: -1 | 1) => {
    setDraft((d) => {
      const i = d.rows.findIndex((r) => r.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= d.rows.length) return d;
      const rows = d.rows.slice();
      [rows[i], rows[j]] = [rows[j], rows[i]];
      return { ...d, rows };
    });
    touch();
  };

  const removeRow = (key: string) => {
    setDraft((d) => ({ ...d, rows: d.rows.filter((r) => r.key !== key) }));
    touch();
  };

  const setManualValue = (key: string, ticker: string, value: string) => {
    setDraft((d) => ({
      ...d,
      rows: d.rows.map((r) => (
        r.key === key ? { ...r, values: { ...(r.values ?? {}), [ticker]: value || null } } : r
      )),
    }));
    touch();
  };

  const addSection = (key: string, title: string) => {
    setDraft((d) => (
      d.sections.some((s) => s.key === key)
        ? d
        : { ...d, sections: [...d.sections, { key, title, body: '' }] }
    ));
    touch();
  };

  const updateSection = (key: string, patch: Partial<SectorSection>) => {
    setDraft((d) => ({ ...d, sections: d.sections.map((s) => (s.key === key ? { ...s, ...patch } : s)) }));
    touch();
  };

  const removeSection = (key: string) => {
    setDraft((d) => ({ ...d, sections: d.sections.filter((s) => s.key !== key) }));
    touch();
  };

  /* ---------------- persistence ---------------- */

  const save = async (status?: string) => {
    if (!draft.sector.trim() || !draft.title.trim()) {
      toast.push({ tone: 'neg', title: 'Name it first', description: 'A sector and a title are needed before saving.' });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/sector', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draft.id || undefined,
          sector: draft.sector, title: draft.title, status: status ?? draft.status,
          sections: draft.sections, tickers: draft.tickers, rows: draft.rows,
        }),
      });
      const d = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Not saved', description: d.error }); return; }
      const saved = d.analysis as SectorAnalysisRecord;
      setAnalyses((list) => {
        const rest = list.filter((a) => a.id !== saved.id);
        return [saved, ...rest];
      });
      setDraft(saved);
      setSelectedId(saved.id);
      setDirty(false);
      toast.push({ tone: 'pos', title: status === 'PUBLISHED' ? 'Analysis published' : 'Analysis saved' });
      router.refresh();
    } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!draft.id) { select(null); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/sector?id=${encodeURIComponent(draft.id)}`, { method: 'DELETE' });
      const d = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Not deleted', description: d.error }); return; }
      const rest = analyses.filter((a) => a.id !== draft.id);
      setAnalyses(rest);
      select(rest[0] ?? null);
      toast.push({ tone: 'pos', title: 'Analysis deleted' });
      router.refresh();
    } finally { setBusy(false); }
  };

  const persistTemplate = async () => {
    if (!templateName.trim() || !draft.rows.length) return;
    setBusy(true);
    try {
      const res = await fetch('/api/sector/template', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName.trim(),
          sector: draft.sector || null,
          rows: draft.rows.map((r) => ({
            key: r.key, label: r.label, kind: r.kind, metric: r.metric ?? null,
            format: r.format, inverse: r.inverse ?? false, note: r.note ?? null,
          })),
        }),
      });
      const d = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Not saved', description: d.error }); return; }
      const t = d.template as Template;
      setTemplates((list) => [t, ...list.filter((x) => x.id !== t.id)]);
      setSaveTemplate(false);
      setTemplateName('');
      toast.push({ tone: 'pos', title: 'Template saved', description: `"${t.name}" is reusable on any sector.` });
    } finally { setBusy(false); }
  };

  const applyTemplate = (t: Template) => {
    setDraft((d) => ({ ...d, rows: t.rows.map((r) => ({ ...r, values: {} })) }));
    touch();
    toast.push({ tone: 'info', title: `Loaded "${t.name}"`, description: 'Rows are editable — a template is a starting point.' });
  };

  const deleteTemplate = async (t: Template) => {
    const res = await fetch(`/api/sector/template?id=${encodeURIComponent(t.id)}`, { method: 'DELETE' });
    if (res.ok) setTemplates((list) => list.filter((x) => x.id !== t.id));
  };

  /* ---------------- derived ---------------- */

  const universeById = useMemo(
    () => new Map(props.data.universe.map((u) => [u.ticker, u])),
    [props.data.universe],
  );

  const candidates = useMemo(() => {
    const q = companyQuery.trim().toLowerCase();
    return props.data.universe
      .filter((u) => !q || u.ticker.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || u.sector.toLowerCase().includes(q))
      .slice(0, 60);
  }, [props.data.universe, companyQuery]);

  const grouped = useMemo(() => {
    const out = new Map<string, MetricDef[]>();
    for (const m of props.data.metrics) {
      const list = out.get(m.group) ?? [];
      list.push(m);
      out.set(m.group, list);
    }
    return Array.from(out.entries());
  }, [props.data.metrics]);

  const chosen = new Set(draft.rows.filter((r) => r.kind === 'METRIC').map((r) => r.metric));
  const missingSections = SECTION_SUGGESTIONS.filter((s) => !draft.sections.some((x) => x.key === s.key));

  return (
    <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
      {/* ------------------------- index ------------------------- */}
      <div className="space-y-3">
        <Panel>
          <PanelHeader
            title="Analyses"
            actions={props.canEdit ? (
              <Button size="xs" variant="ghost" onClick={() => select(null)} icon={<Icon.Plus size={12} />}>New</Button>
            ) : null}
          />
          <div className="p-1.5 space-y-0.5 max-h-[340px] overflow-y-auto">
            {analyses.length === 0 ? (
              <p className="px-2 py-3 text-2xs text-ink-3">
                Nothing covered yet. An analysis is one sector, the names in it, and the rows you decided matter.
              </p>
            ) : analyses.map((a) => (
              <button
                key={a.id} type="button"
                onClick={() => select(a)}
                className={cx(
                  'w-full text-left px-2 py-1.5 rounded text-xs transition focus-ring',
                  a.id === selectedId ? 'bg-sunken text-ink' : 'text-ink-2 hover:bg-sunken/60',
                )}
              >
                <span className="block truncate font-medium">{a.title}</span>
                <span className="block text-2xs text-ink-4">
                  {a.sector} · {a.tickers.length} names · {a.rows.length} rows
                </span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Row templates"
            subtitle="Saved by analysts, not shipped."
          />
          <div className="p-1.5 space-y-0.5">
            {templates.length === 0 ? (
              <p className="px-2 py-3 text-2xs text-ink-3">
                No templates. Build a comparison you would use again and save the row set.
              </p>
            ) : templates.map((t) => (
              <div key={t.id} className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-sunken/60 group">
                <button
                  type="button"
                  onClick={() => props.canEdit && applyTemplate(t)}
                  disabled={!props.canEdit}
                  className="flex-1 text-left focus-ring rounded disabled:cursor-default"
                >
                  <span className="block text-xs text-ink-2 truncate">{t.name}</span>
                  <span className="block text-2xs text-ink-4">
                    {t.rows.length} rows{t.sector ? ` · ${t.sector}` : ' · any sector'}
                  </span>
                </button>
                {props.canEdit ? (
                  <button
                    type="button"
                    onClick={() => void deleteTemplate(t)}
                    aria-label={`Delete template ${t.name}`}
                    className="opacity-0 group-hover:opacity-100 text-ink-4 hover:text-neg focus-ring rounded transition"
                  >
                    <Icon.Trash size={12} />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* ------------------------- editor ------------------------- */}
      <div className="space-y-3 min-w-0">
        <Panel>
          <PanelHeader
            title={draft.id ? draft.title || 'Untitled analysis' : 'New sector analysis'}
            subtitle={draft.id ? `${draft.authorName} · last saved ${new Date(draft.updatedAt).toLocaleString('pt-BR')}` : 'Nothing is saved until you save it.'}
            actions={
              <div className="flex items-center gap-1.5">
                <Badge tone={STATUS_TONE[draft.status] ?? 'neutral'}>{draft.status}</Badge>
                {props.canEdit ? (
                  <>
                    {draft.id ? (
                      <Button size="xs" variant="ghost" onClick={() => void remove()} disabled={busy}>Delete</Button>
                    ) : null}
                    <Button size="xs" variant="secondary" onClick={() => void save()} disabled={busy || !dirty}>
                      Save
                    </Button>
                    <Button size="xs" onClick={() => void save('PUBLISHED')} disabled={busy}>Publish</Button>
                  </>
                ) : null}
              </div>
            }
          />
          <div className="p-3 grid gap-3 sm:grid-cols-2">
            <Field label="Sector" hint="Whatever the desk covers as one. It does not have to match a classification standard.">
              <Input
                value={draft.sector}
                list="meridian-sector-list"
                onChange={(e) => { setDraft((d) => ({ ...d, sector: e.target.value })); touch(); }}
                placeholder="Mining, Payments, Regional banks…"
                disabled={!props.canEdit}
              />
              <datalist id="meridian-sector-list">
                {props.data.sectors.map((s) => <option key={s} value={s} />)}
              </datalist>
            </Field>
            <Field label="Title">
              <Input
                value={draft.title}
                onChange={(e) => { setDraft((d) => ({ ...d, title: e.target.value })); touch(); }}
                placeholder="What this analysis is about"
                disabled={!props.canEdit}
              />
            </Field>
          </div>
        </Panel>

        {/* companies */}
        <Panel>
          <PanelHeader
            title="Companies in the comparison"
            subtitle={`${draft.tickers.length} selected. Peers do not have to share a sector label — comparability is your call.`}
          />
          <div className="p-3 space-y-2">
            {draft.tickers.length ? (
              <div className="flex flex-wrap gap-1.5">
                {draft.tickers.map((t) => {
                  const u = universeById.get(t);
                  return (
                    <button
                      key={t} type="button"
                      onClick={() => props.canEdit && toggleTicker(t)}
                      disabled={!props.canEdit}
                      className="inline-flex items-center gap-1.5 px-2 h-6 rounded border border-line bg-sunken text-2xs text-ink-2 hover:border-neg/50 focus-ring disabled:cursor-default"
                    >
                      <span className="num font-medium text-ink">{t}</span>
                      <span className="text-ink-4 truncate max-w-[140px]">{u?.name ?? 'not in coverage'}</span>
                      {u?.bankLike ? <Badge tone="outline">bank</Badge> : null}
                      {props.canEdit ? <Icon.Close size={10} /> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {props.canEdit ? (
              <>
                <Input
                  value={companyQuery}
                  onChange={(e) => setCompanyQuery(e.target.value)}
                  placeholder="Search coverage by ticker, name or sector"
                />
                <div className="flex flex-wrap gap-1 max-h-[132px] overflow-y-auto">
                  {candidates.map((u) => (
                    <button
                      key={u.ticker} type="button"
                      onClick={() => toggleTicker(u.ticker)}
                      className={cx(
                        'px-2 h-6 rounded border text-2xs transition focus-ring',
                        draft.tickers.includes(u.ticker)
                          ? 'border-accent/60 bg-accent/10 text-accent'
                          : 'border-line text-ink-3 hover:text-ink-2 hover:border-line-strong',
                      )}
                    >
                      <span className="num">{u.ticker}</span>
                      <span className="ml-1.5 text-ink-4">{u.sector}</span>
                    </button>
                  ))}
                  {candidates.length === 0 ? <p className="text-2xs text-ink-4 px-1 py-2">Nothing matches.</p> : null}
                </div>
              </>
            ) : null}
          </div>
        </Panel>

        {/* comparison */}
        <Panel>
          <PanelHeader
            title="Peer comparison"
            subtitle="Every row is here because you put it here."
            actions={props.canEdit ? (
              <div className="flex items-center gap-1.5">
                {resolving ? <span className="text-2xs text-ink-4">resolving…</span> : null}
                <Button size="xs" variant="ghost" onClick={addManualRow} icon={<Icon.Plus size={12} />}>Free row</Button>
                <Button size="xs" variant="ghost" onClick={() => setMetricPicker(true)} icon={<Icon.Grid size={12} />}>Metrics</Button>
                <Button
                  size="xs" variant="ghost"
                  onClick={() => setSaveTemplate(true)}
                  disabled={!draft.rows.length}
                  icon={<Icon.Save size={12} />}
                >
                  Save rows
                </Button>
              </div>
            ) : null}
          />

          {draft.rows.length === 0 || draft.tickers.length === 0 ? (
            <EmptyState
              title="Nothing to compare yet"
              description="Pick the companies, then choose the rows. The product deliberately ships no template: which measures matter in an industry is the analyst's judgement, not a default."
            />
          ) : (
            <ComparisonTable
              rows={comparison.length ? comparison : draft.rows.map((r) => ({ ...r, cells: [], median: null, excluded: [] }))}
              tickers={draft.tickers}
              universe={universeById}
              canEdit={props.canEdit}
              onMove={moveRow}
              onRemove={removeRow}
              onLabel={(key, label) => updateRow(key, { label })}
              onManual={setManualValue}
              onInverse={(key, inverse) => updateRow(key, { inverse })}
            />
          )}
        </Panel>

        {/* written sections */}
        <Panel>
          <PanelHeader
            title="Written analysis"
            subtitle="Structure, regulation, dynamics — as much or as little as the sector needs."
          />
          <div className="p-3 space-y-3">
            {draft.sections.map((s) => (
              <div key={s.key} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Input
                    value={s.title}
                    onChange={(e) => updateSection(s.key, { title: e.target.value })}
                    className="max-w-sm font-medium"
                    disabled={!props.canEdit}
                  />
                  {props.canEdit ? (
                    <button
                      type="button" onClick={() => removeSection(s.key)}
                      aria-label={`Remove section ${s.title}`}
                      className="text-ink-4 hover:text-neg focus-ring rounded"
                    >
                      <Icon.Trash size={12} />
                    </button>
                  ) : null}
                </div>
                <Textarea
                  rows={4}
                  value={s.body}
                  onChange={(e) => updateSection(s.key, { body: e.target.value })}
                  placeholder="Write what a reader needs to know, and cite where each figure came from."
                  disabled={!props.canEdit}
                />
              </div>
            ))}

            {props.canEdit ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {missingSections.map((s) => (
                  <Button key={s.key} size="xs" variant="ghost" onClick={() => addSection(s.key, s.title)} icon={<Icon.Plus size={12} />}>
                    {s.title}
                  </Button>
                ))}
                <Button
                  size="xs" variant="ghost"
                  onClick={() => addSection(`section-${Date.now()}`, 'New section')}
                  icon={<Icon.Plus size={12} />}
                >
                  Own section
                </Button>
              </div>
            ) : null}

            {draft.sections.length === 0 && !props.canEdit ? (
              <p className="text-2xs text-ink-3">No written sections.</p>
            ) : null}
          </div>
        </Panel>

        {dirty ? (
          <InlineNote tone="warn">
            Unsaved changes. Rows, companies and text live in this draft until you save.
          </InlineNote>
        ) : null}
      </div>

      {/* metric picker */}
      <Modal open={metricPicker} onClose={() => setMetricPicker(false)} title="Add comparison rows" width="lg">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <InlineNote tone="info">
            Every measure the platform computes is here, grouped only for finding things. Nothing is
            recommended for a sector: that is the part only you can do.
          </InlineNote>
          {grouped.map(([group, metrics]) => (
            <div key={group} className="space-y-1.5">
              <SectionLabel>{group}</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {metrics.map((m) => (
                  <button
                    key={m.key} type="button"
                    onClick={() => addMetricRow(m)}
                    disabled={chosen.has(m.key)}
                    className={cx(
                      'px-2 h-7 rounded border text-2xs transition focus-ring',
                      chosen.has(m.key)
                        ? 'border-accent/50 bg-accent/10 text-accent cursor-default'
                        : 'border-line text-ink-2 hover:border-line-strong hover:text-ink',
                    )}
                  >
                    {m.label}
                    {chosen.has(m.key) ? <Icon.Check size={10} className="ml-1.5 inline" /> : null}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-3">
          <Button size="sm" onClick={() => setMetricPicker(false)}>Done</Button>
        </div>
      </Modal>

      {/* template save */}
      <Modal open={saveTemplate} onClose={() => setSaveTemplate(false)} title="Save this row set" width="sm">
        <div className="space-y-3">
          <p className="text-2xs text-ink-3">
            Saves the {draft.rows.length} rows, not the companies or the numbers in them. It stays editable
            everywhere it is used.
          </p>
          <Field label="Template name">
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder={draft.sector ? `${draft.sector} comparison` : 'Comparison rows'}
            />
          </Field>
          <div className="flex justify-end gap-1.5">
            <Button size="sm" variant="ghost" onClick={() => setSaveTemplate(false)}>Cancel</Button>
            <Button size="sm" onClick={() => void persistTemplate()} disabled={busy || !templateName.trim()}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* ==================================================================
   The table itself.
   ================================================================== */

function ComparisonTable(props: {
  rows: ComparisonRowResult[];
  tickers: string[];
  universe: Map<string, Universe>;
  canEdit: boolean;
  onMove: (key: string, dir: -1 | 1) => void;
  onRemove: (key: string) => void;
  onLabel: (key: string, label: string) => void;
  onManual: (key: string, ticker: string, value: string) => void;
  onInverse: (key: string, inverse: boolean) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-line">
            <th className="sticky left-0 z-10 bg-panel text-left font-medium text-ink-3 px-3 py-2 min-w-[200px]">
              Measure
            </th>
            {props.tickers.map((t) => {
              const u = props.universe.get(t);
              return (
                <th key={t} className="px-3 py-2 text-right font-medium text-ink min-w-[110px]">
                  <span className="flex flex-col items-end">
                    <span className="num">{t}</span>
                    <span className="max-w-[110px] truncate text-2xs font-normal text-ink-4">
                      {u?.name ?? 'not in coverage'}
                    </span>
                  </span>
                </th>
              );
            })}
            <th className="px-3 py-2 text-right font-medium text-ink-3 min-w-[80px]">Median</th>
            {props.canEdit ? <th className="w-16" /> : null}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr key={row.key} className="border-b border-line/60 hover:bg-sunken/40 group">
              <td className="sticky left-0 z-10 bg-panel px-3 py-1.5 align-middle">
                {row.kind === 'MANUAL' && props.canEdit ? (
                  <Input
                    value={row.label}
                    onChange={(e) => props.onLabel(row.key, e.target.value)}
                    placeholder="What this row measures"
                    className="h-6 text-2xs"
                  />
                ) : (
                  <span className="text-ink-2">
                    {row.label}
                    {row.kind === 'MANUAL' ? <Badge tone="outline" className="ml-1.5">manual</Badge> : null}
                    {row.inverse ? (
                      <Tooltip content="Ranked so that lower is better.">
                        <span className="ml-1.5 text-2xs text-ink-4">↓ better</span>
                      </Tooltip>
                    ) : null}
                  </span>
                )}
                {row.excluded.length ? (
                  <span className="block text-2xs text-ink-4">
                    Not meaningful for {row.excluded.join(', ')} — left empty rather than filled.
                  </span>
                ) : null}
              </td>

              {props.tickers.map((ticker) => {
                const cell = row.cells.find((c) => c.ticker === ticker);
                const best = cell?.rank === 1 && row.cells.filter((c) => c.rank !== null).length > 1;
                if (row.kind === 'MANUAL') {
                  return (
                    <td key={ticker} className="px-2 py-1.5 text-right">
                      {props.canEdit ? (
                        <Input
                          value={String(row.values?.[ticker] ?? '')}
                          onChange={(e) => props.onManual(row.key, ticker, e.target.value)}
                          className="h-6 text-2xs text-right"
                          placeholder={DASH}
                        />
                      ) : (
                        <span className="text-ink-2">{String(row.values?.[ticker] ?? DASH)}</span>
                      )}
                    </td>
                  );
                }
                if (cell?.notMeaningful) {
                  return (
                    <td key={ticker} className="px-3 py-1.5 text-right">
                      <Tooltip content="This measure does not describe a balance-sheet-driven business. An empty cell is the honest answer.">
                        <span className="text-ink-4 text-2xs">n.m.</span>
                      </Tooltip>
                    </td>
                  );
                }
                return (
                  <td key={ticker} className="px-3 py-1.5 text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      <Num
                        value={typeof cell?.value === 'number' ? cell.value : null}
                        format={row.format === 'text' ? 'number' : row.format}
                        className={cx('num', best ? 'text-pos font-medium' : 'text-ink-2')}
                      />
                      {typeof cell?.position === 'number' ? (
                        <span className="block h-[3px] w-full max-w-[70px] rounded-full bg-sunken overflow-hidden">
                          <span
                            className={cx('block h-full rounded-full', best ? 'bg-pos' : 'bg-accent/70')}
                            style={{ width: `${Math.max(4, Math.round(cell.position * 100))}%` }}
                          />
                        </span>
                      ) : null}
                    </div>
                  </td>
                );
              })}

              <td className="px-3 py-1.5 text-right text-ink-3 num">
                {row.kind === 'MANUAL' || row.median === null
                  ? DASH
                  : formatMetric(row.median, row.format === 'text' ? 'number' : row.format)}
              </td>

              {props.canEdit ? (
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                    <button type="button" onClick={() => props.onMove(row.key, -1)} aria-label="Move up" className="text-ink-4 hover:text-ink-2 focus-ring rounded">
                      <Icon.ArrowUp size={11} />
                    </button>
                    <button type="button" onClick={() => props.onMove(row.key, 1)} aria-label="Move down" className="text-ink-4 hover:text-ink-2 focus-ring rounded">
                      <Icon.ArrowDown size={11} />
                    </button>
                    {row.kind === 'METRIC' ? (
                      <button
                        type="button"
                        onClick={() => props.onInverse(row.key, !row.inverse)}
                        aria-label="Flip which direction is better"
                        className="text-ink-4 hover:text-ink-2 focus-ring rounded"
                      >
                        <Icon.Refresh size={11} />
                      </button>
                    ) : null}
                    <button type="button" onClick={() => props.onRemove(row.key)} aria-label="Remove row" className="text-ink-4 hover:text-neg focus-ring rounded">
                      <Icon.Trash size={11} />
                    </button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
