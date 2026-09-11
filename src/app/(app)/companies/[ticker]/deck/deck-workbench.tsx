'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, cx, EmptyState, Field, InlineNote, Input, Panel, PanelHeader,
  PercentInput, Segmented, Select, Tabs, Textarea, Tooltip, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { MetricCard } from '@/components/ui/values';
import { formatDateTime, formatPercent } from '@/lib/finance/format';
import {
  blankThesis, riskQuadrant, QA_THEME_LABEL, THESIS_WEIGHT_LABEL,
  type DeckRisk, type DeckThesis, type QaTheme, type StressTest,
} from '@/lib/research/types';
import type { QaPrep } from '@/server/services/qa';

type Tab = 'theses' | 'risks' | 'stress' | 'qa';

const STRESS_KIND_LABEL: Record<StressTest['kind'], string> = {
  COMPETITIVE: 'Competitive', FINANCING: 'Financing and refinancing',
  OPERATIONAL: 'Operational', REGULATORY: 'Regulatory', OTHER: 'Other',
};

const VERDICT_TONE: Record<StressTest['verdict'], 'pos' | 'warn' | 'neg' | 'neutral'> = {
  SURVIVES: 'pos', WEAKENED: 'warn', BROKEN: 'neg', UNTESTED: 'neutral',
};

const QA_STATUS_TONE: Record<string, 'pos' | 'warn' | 'neutral'> = {
  PREPARED: 'pos', NEEDS_WORK: 'warn', PENDING: 'neutral',
};

/**
 * The qualitative case, held as it actually is: several theses of unequal
 * weight, risks placed by probability and impact, and tests of what happens
 * when something outside the model moves.
 */
export function DeckWorkbench(props: {
  ticker: string;
  companyName: string;
  canEdit: boolean;
  canGenerate: boolean;
  status: string;
  summary: string;
  authorName: string | null;
  updatedAt: string | null;
  theses: DeckThesis[];
  risks: DeckRisk[];
  stressTests: StressTest[];
  qa: QaPrep | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('theses');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [summary, setSummary] = useState(props.summary);
  const [theses, setTheses] = useState<DeckThesis[]>(props.theses);
  const [risks, setRisks] = useState<DeckRisk[]>(props.risks);
  const [stress, setStress] = useState<StressTest[]>(props.stressTests);

  const touch = () => setDirty(true);

  const save = async (status?: string) => {
    setBusy(true);
    try {
      const res = await fetch('/api/deck', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: props.ticker, status: status ?? props.status,
          summary: summary || null, theses, risks, stressTests: stress,
        }),
      });
      const d = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Not saved', description: d.error }); return; }
      toast.push({ tone: 'pos', title: status === 'PUBLISHED' ? 'Deck published' : 'Deck saved' });
      setDirty(false);
      router.refresh();
    } finally { setBusy(false); }
  };

  const generate = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/qa', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: props.ticker, replace: true }),
      });
      const d = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Could not generate', description: d.error }); return; }
      toast.push({
        tone: 'pos',
        title: `${d.added} question${d.added === 1 ? '' : 's'} added`,
        description: d.gaps
          ? `${d.gaps} could not be answered from the workspace and are marked as gaps rather than guessed.`
          : 'Every draft answer is built from figures the workspace holds.',
      });
      router.refresh();
    } finally { setBusy(false); }
  };

  const setQaStatus = async (id: string, status: string) => {
    const res = await fetch('/api/qa', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) {
      const d = await res.json();
      toast.push({ tone: 'neg', title: 'Not updated', description: d.error });
      return;
    }
    router.refresh();
  };

  /* ------------------------------- Theses -------------------------------- */
  const patchThesis = (id: string, over: Partial<DeckThesis>) => {
    setTheses((t) => t.map((x) => (x.id === id ? { ...x, ...over } : x)));
    touch();
  };
  const addThesis = () => { setTheses((t) => [...t, blankThesis(t.length + 1)]); touch(); };
  const removeThesis = (id: string) => {
    setTheses((t) => t.filter((x) => x.id !== id).map((x, i) => ({ ...x, order: i + 1 })));
    touch();
  };
  const moveThesis = (id: string, dir: -1 | 1) => {
    setTheses((t) => {
      const i = t.findIndex((x) => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= t.length) return t;
      const next = t.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next.map((x, k) => ({ ...x, order: k + 1 }));
    });
    touch();
  };

  /* -------------------------------- Risks -------------------------------- */
  const addRisk = () => {
    setRisks((r) => [...r, {
      id: `risk-${Date.now()}`, title: '', category: 'OPERATIONAL',
      probability: 0.3, impact: 0.3,
    }]);
    touch();
  };
  const patchRisk = (id: string, over: Partial<DeckRisk>) => {
    setRisks((r) => r.map((x) => (x.id === id ? { ...x, ...over } : x)));
    touch();
  };

  /* ---------------------------- Stress tests ------------------------------ */
  const addStress = (kind: StressTest['kind']) => {
    setStress((s) => [...s, {
      id: `stress-${Date.now()}`, kind, title: '', trigger: '', consequence: '',
      verdict: 'UNTESTED', effect: null,
    }]);
    touch();
  };
  const patchStress = (id: string, over: Partial<StressTest>) => {
    setStress((s) => s.map((x) => (x.id === id ? { ...x, ...over } : x)));
    touch();
  };

  const core = theses.filter((t) => t.weight === 'CORE').length;
  const manageRisks = risks.filter((r) => riskQuadrant(r.probability, r.impact).key === 'MANAGE').length;
  const untested = stress.filter((s) => s.verdict === 'UNTESTED').length;

  const qaByTheme = useMemo(() => {
    const map = new Map<string, QaPrep['saved']>();
    for (const q of props.qa?.saved ?? []) {
      map.set(q.theme, [...(map.get(q.theme) ?? []), q]);
    }
    return Array.from(map.entries());
  }, [props.qa]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Theses" value={theses.length} format="number" decimals={0} sublabel={`${core} core`} />
        <MetricCard label="Risks to manage" value={manageRisks} format="number" decimals={0} accent={manageRisks > 0} sublabel={`${risks.length} recorded`} />
        <MetricCard label="Stress tests untested" value={untested} format="number" decimals={0} sublabel={`${stress.length} defined`} />
        <MetricCard
          label="Committee questions prepared"
          value={props.qa?.counts.prepared ?? 0}
          format="number" decimals={0}
          sublabel={`${props.qa?.counts.total ?? 0} on the list, ${props.qa?.counts.gaps ?? 0} with gaps`}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          tabs={[
            { value: 'theses', label: 'Theses', count: theses.length },
            { value: 'risks', label: 'Risk quadrant', count: risks.length },
            { value: 'stress', label: 'Stress tests', count: stress.length },
            { value: 'qa', label: 'Committee Q&A', count: props.qa?.counts.total ?? 0 },
          ]}
          className="flex-1"
        />
        <div className="flex items-center gap-2">
          {dirty ? <Badge tone="accent">Unsaved changes</Badge> : null}
          <Badge tone={props.status === 'PUBLISHED' ? 'pos' : 'neutral'}>{props.status.toLowerCase()}</Badge>
          {props.canEdit ? (
            <>
              <Button size="sm" onClick={() => save()} loading={busy} disabled={!dirty}>Save</Button>
              {props.status !== 'PUBLISHED' ? (
                <Button size="sm" variant="primary" icon={<Icon.Check size={12} />} onClick={() => save('PUBLISHED')} loading={busy}>
                  Publish
                </Button>
              ) : null}
            </>
          ) : <Badge tone="outline">Read-only role</Badge>}
        </div>
      </div>

      {props.updatedAt ? (
        <p className="text-2xs text-ink-4">Last saved by {props.authorName} on {formatDateTime(props.updatedAt)}.</p>
      ) : null}

      {/* ------------------------------- Theses ------------------------------ */}
      {tab === 'theses' ? (
        <div className="space-y-3">
          <Panel>
            <PanelHeader title="The case in one paragraph" subtitle="What a reader gets if they read nothing else" dense />
            <div className="p-3 pt-0">
              <Textarea
                rows={3}
                value={summary}
                disabled={!props.canEdit}
                onChange={(e) => { setSummary(e.target.value); touch(); }}
                placeholder="The capex cycle rolls over in 2027, the ROIC spread stays positive through it, and the market is pricing a permanent reinvestment burden."
              />
            </div>
          </Panel>

          {theses.length === 0 ? (
            <Panel>
              <EmptyState
                icon={<Icon.Target size={22} />}
                title="No theses recorded"
                description="A company rarely has one thesis. Record them as they are — a core one that carries the recommendation, and the supporting ones that do not — rather than flattening them into a single narrative."
                action={props.canEdit ? <Button variant="primary" icon={<Icon.Plus size={13} />} onClick={addThesis}>Add the first thesis</Button> : undefined}
              />
            </Panel>
          ) : (
            theses.map((t, i) => (
              <Panel key={t.id}>
                <PanelHeader
                  title={
                    <span className="flex items-center gap-2">
                      <span className="num text-ink-4">{t.order}</span>
                      <Input
                        value={t.title}
                        disabled={!props.canEdit}
                        onChange={(e) => patchThesis(t.id, { title: e.target.value })}
                        placeholder="Name the thesis in a sentence"
                        className="min-w-[280px] font-medium"
                      />
                    </span>
                  }
                  actions={
                    <div className="flex items-center gap-2">
                      <Select
                        value={t.weight}
                        disabled={!props.canEdit}
                        onChange={(e) => patchThesis(t.id, { weight: e.target.value as DeckThesis['weight'] })}
                        className="w-[130px]"
                      >
                        {Object.entries(THESIS_WEIGHT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </Select>
                      <Select
                        value={t.conviction}
                        disabled={!props.canEdit}
                        onChange={(e) => patchThesis(t.id, { conviction: e.target.value as DeckThesis['conviction'] })}
                        className="w-[120px]"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="VERY_HIGH">Very high</option>
                      </Select>
                      {props.canEdit ? (
                        <>
                          <button type="button" title="Move up" disabled={i === 0} onClick={() => moveThesis(t.id, -1)} className="rounded p-1 text-ink-4 hover:text-ink-2 disabled:opacity-30 focus-ring"><Icon.ArrowUp size={13} /></button>
                          <button type="button" title="Move down" disabled={i === theses.length - 1} onClick={() => moveThesis(t.id, 1)} className="rounded p-1 text-ink-4 hover:text-ink-2 disabled:opacity-30 focus-ring"><Icon.ArrowDown size={13} /></button>
                          <button type="button" title="Remove" onClick={() => removeThesis(t.id)} className="rounded p-1 text-ink-4 hover:text-neg focus-ring"><Icon.Trash size={13} /></button>
                        </>
                      ) : null}
                    </div>
                  }
                />
                <div className="space-y-3 p-3 pt-0">
                  <Field label="Rationale" hint={t.weight === 'CORE' ? 'This one carries the recommendation, so it earns the space.' : 'A supporting thesis can be a paragraph.'}>
                    <Textarea
                      rows={t.weight === 'CORE' ? 6 : 3}
                      value={t.rationale}
                      disabled={!props.canEdit}
                      onChange={(e) => patchThesis(t.id, { rationale: e.target.value })}
                    />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ListField
                      label="What has to be true"
                      hint="Each one is something a reader can check."
                      values={t.requires}
                      disabled={!props.canEdit}
                      onChange={(v) => patchThesis(t.id, { requires: v })}
                      placeholder="Capex falls below 10% of revenue by 2027"
                    />
                    <ListField
                      label="What would break it"
                      hint="If nothing here would change your mind, it is not a thesis."
                      values={t.breaks}
                      disabled={!props.canEdit}
                      onChange={(v) => patchThesis(t.id, { breaks: v })}
                      placeholder="ROIC spread turns negative for two consecutive years"
                    />
                  </div>
                </div>
              </Panel>
            ))
          )}

          {props.canEdit && theses.length ? (
            <Button icon={<Icon.Plus size={13} />} onClick={addThesis}>Add another thesis</Button>
          ) : null}
        </div>
      ) : null}

      {/* ------------------------------- Risks ------------------------------- */}
      {tab === 'risks' ? (
        <div className="space-y-3">
          <Panel>
            <PanelHeader
              title="Risk quadrant"
              subtitle="Probability against impact. Where a risk sits decides what you do about it, not how loudly it is written."
              actions={props.canEdit ? <Button size="sm" icon={<Icon.Plus size={12} />} onClick={addRisk}>Add risk</Button> : undefined}
            />
            <div className="p-3 pt-0">
              <RiskQuadrantGrid risks={risks} />
            </div>
          </Panel>

          {risks.length ? (
            <Panel>
              <PanelHeader title="The risks themselves" dense />
              <div className="divide-y divide-line">
                {risks.map((r) => {
                  const q = riskQuadrant(r.probability, r.impact);
                  return (
                    <div key={r.id} className="grid gap-3 p-3 lg:grid-cols-[1fr_260px]">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            value={r.title}
                            disabled={!props.canEdit}
                            onChange={(e) => patchRisk(r.id, { title: e.target.value })}
                            placeholder="Name the risk"
                            className="flex-1 font-medium"
                          />
                          <Badge tone={q.tone}>{q.label}</Badge>
                          {props.canEdit ? (
                            <button type="button" title="Remove" onClick={() => { setRisks((x) => x.filter((y) => y.id !== r.id)); touch(); }} className="rounded p-1 text-ink-4 hover:text-neg focus-ring"><Icon.Trash size={13} /></button>
                          ) : null}
                        </div>
                        <Textarea
                          rows={2}
                          value={r.mitigation ?? ''}
                          disabled={!props.canEdit}
                          onChange={(e) => patchRisk(r.id, { mitigation: e.target.value })}
                          placeholder="What you would do about it, or why you accept it"
                        />
                      </div>
                      <div className="space-y-2">
                        <Field label="Category">
                          <Select
                            value={r.category}
                            disabled={!props.canEdit}
                            onChange={(e) => patchRisk(r.id, { category: e.target.value })}
                          >
                            {['OPERATIONAL', 'FINANCIAL', 'REGULATORY', 'MACRO', 'COMPETITIVE', 'VALUATION', 'GOVERNANCE'].map((c) => (
                              <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                            ))}
                          </Select>
                        </Field>
                        <div className="grid grid-cols-2 gap-2">
                          <Field label="Probability">
                            <PercentInput value={r.probability} decimals={0} step={5} disabled={!props.canEdit} onValueChange={(v) => patchRisk(r.id, { probability: Math.max(0, Math.min(1, v)) })} />
                          </Field>
                          <Field label="Impact" hint="Share of the thesis it destroys.">
                            <PercentInput value={r.impact} decimals={0} step={5} disabled={!props.canEdit} onValueChange={(v) => patchRisk(r.id, { impact: Math.max(0, Math.min(1, v)) })} />
                          </Field>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          ) : null}
        </div>
      ) : null}

      {/* ---------------------------- Stress tests --------------------------- */}
      {tab === 'stress' ? (
        <div className="space-y-3">
          <InlineNote tone="info">
            A stress test asks what happens to the thesis when something outside the model moves. The trigger is whatever
            matters for this company — a competitor&apos;s move, an auction, a product launch, a refinancing window, a
            price change. The product does not decide which; it records the test and the verdict.
          </InlineNote>

          {props.canEdit ? (
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STRESS_KIND_LABEL) as StressTest['kind'][]).map((k) => (
                <Button key={k} size="sm" icon={<Icon.Plus size={12} />} onClick={() => addStress(k)}>
                  {STRESS_KIND_LABEL[k]}
                </Button>
              ))}
            </div>
          ) : null}

          {stress.length === 0 ? (
            <Panel>
              <EmptyState
                icon={<Icon.Scale size={22} />}
                title="No stress tests defined"
                description="Two are worth having on almost any name: what the main competitor doing something aggressive would cost, and what a 300 basis point rise in the cost of debt would do to the balance sheet."
              />
            </Panel>
          ) : (
            stress.map((s) => (
              <Panel key={s.id}>
                <PanelHeader
                  title={
                    <Input
                      value={s.title}
                      disabled={!props.canEdit}
                      onChange={(e) => patchStress(s.id, { title: e.target.value })}
                      placeholder="Name the test"
                      className="min-w-[280px] font-medium"
                    />
                  }
                  actions={
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral">{STRESS_KIND_LABEL[s.kind]}</Badge>
                      <Select
                        value={s.verdict}
                        disabled={!props.canEdit}
                        onChange={(e) => patchStress(s.id, { verdict: e.target.value as StressTest['verdict'] })}
                        className="w-[140px]"
                      >
                        <option value="UNTESTED">Untested</option>
                        <option value="SURVIVES">Thesis survives</option>
                        <option value="WEAKENED">Thesis weakened</option>
                        <option value="BROKEN">Thesis broken</option>
                      </Select>
                      <Badge tone={VERDICT_TONE[s.verdict]}>{s.verdict.toLowerCase()}</Badge>
                      {props.canEdit ? (
                        <button type="button" title="Remove" onClick={() => { setStress((x) => x.filter((y) => y.id !== s.id)); touch(); }} className="rounded p-1 text-ink-4 hover:text-neg focus-ring"><Icon.Trash size={13} /></button>
                      ) : null}
                    </div>
                  }
                />
                <div className="grid gap-3 p-3 pt-0 lg:grid-cols-3">
                  <Field label="What happens">
                    <Textarea rows={3} value={s.trigger} disabled={!props.canEdit} onChange={(e) => patchStress(s.id, { trigger: e.target.value })} placeholder="The main competitor prices 15% below us in the core market for two years." />
                  </Field>
                  <Field label="What it does to the business">
                    <Textarea rows={3} value={s.consequence} disabled={!props.canEdit} onChange={(e) => patchStress(s.id, { consequence: e.target.value })} />
                  </Field>
                  <Field label="Your response" hint="What you would do, or why the thesis holds anyway.">
                    <Textarea rows={3} value={s.response ?? ''} disabled={!props.canEdit} onChange={(e) => patchStress(s.id, { response: e.target.value })} />
                  </Field>
                </div>
              </Panel>
            ))
          )}
        </div>
      ) : null}

      {/* ------------------------------ Q&A prep ----------------------------- */}
      {tab === 'qa' ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-[70ch] text-xs leading-relaxed text-ink-3">
              The questions a committee asks are the places the case is thinnest. Each draft answer is assembled from
              figures this workspace holds, with the screen they came from named. Where the data cannot support an
              answer, the question is marked as a gap rather than filled with a plausible sentence.
            </p>
            {props.canGenerate ? (
              <Button variant="primary" icon={<Icon.Sparkle size={13} />} onClick={generate} loading={busy}>
                Generate questions
              </Button>
            ) : null}
          </div>

          {!props.qa?.saved.length ? (
            <Panel>
              <EmptyState
                icon={<Icon.Vote size={22} />}
                title="No questions prepared"
                description="Generate the list from what the workspace holds about this company: the model, the deck, the portfolio, the ownership record and the monitoring engine."
                action={props.canGenerate ? <Button variant="primary" onClick={generate} loading={busy}>Generate questions</Button> : undefined}
              />
            </Panel>
          ) : (
            qaByTheme.map(([theme, items]) => (
              <Panel key={theme}>
                <PanelHeader
                  title={QA_THEME_LABEL[theme as QaTheme] ?? theme}
                  subtitle={`${items.length} question${items.length === 1 ? '' : 's'}`}
                  dense
                />
                <div className="divide-y divide-line">
                  {items.map((q) => (
                    <div key={q.id} className="px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-ink">{q.question}</p>
                        <div className="flex shrink-0 items-center gap-2">
                          {q.hasGap ? (
                            <Tooltip content={q.notes ?? 'The workspace cannot support a complete answer.'}>
                              <Badge tone="warn">gap</Badge>
                            </Tooltip>
                          ) : null}
                          <Badge tone={QA_STATUS_TONE[q.status] ?? 'neutral'}>
                            {q.status === 'NEEDS_WORK' ? 'needs work' : q.status.toLowerCase()}
                          </Badge>
                        </div>
                      </div>

                      {q.draftAnswer ? (
                        <p className="mt-1.5 text-xs leading-relaxed text-ink-2">{q.draftAnswer}</p>
                      ) : (
                        <p className="mt-1.5 text-xs italic text-ink-4">
                          No draft: the workspace does not hold what this question needs.
                        </p>
                      )}

                      {q.notes && q.hasGap ? (
                        <p className="mt-1 text-2xs text-warn">{q.notes}</p>
                      ) : null}

                      {q.citations.length ? (
                        <ul className="mt-2 space-y-0.5">
                          {q.citations.map((c, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-2xs text-ink-4">
                              <Icon.Check size={10} className="mt-0.5 shrink-0 text-pos" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {props.canGenerate ? (
                        <div className="mt-2">
                          <Segmented
                            value={q.status}
                            size="xs"
                            onChange={(v) => setQaStatus(q.id, v)}
                            options={[
                              { value: 'PENDING', label: 'Pending' },
                              { value: 'NEEDS_WORK', label: 'Needs work' },
                              { value: 'PREPARED', label: 'Prepared' },
                            ]}
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Panel>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

/** A list of short lines the analyst adds to and removes from. */
function ListField(props: {
  label: string;
  hint?: string;
  values: string[];
  disabled: boolean;
  placeholder?: string;
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  return (
    <Field label={props.label} hint={props.hint}>
      <div className="space-y-1.5">
        {props.values.map((v, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Input
              value={v}
              disabled={props.disabled}
              onChange={(e) => props.onChange(props.values.map((x, k) => (k === i ? e.target.value : x)))}
              className="flex-1"
            />
            {!props.disabled ? (
              <button
                type="button" title="Remove"
                onClick={() => props.onChange(props.values.filter((_, k) => k !== i))}
                className="rounded p-1 text-ink-4 hover:text-neg focus-ring"
              >
                <Icon.Close size={12} />
              </button>
            ) : null}
          </div>
        ))}
        {!props.disabled ? (
          <div className="flex items-center gap-1.5">
            <Input
              value={draft}
              placeholder={props.placeholder}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && draft.trim()) {
                  e.preventDefault();
                  props.onChange([...props.values, draft.trim()]);
                  setDraft('');
                }
              }}
              className="flex-1"
            />
            <Button
              size="xs"
              disabled={!draft.trim()}
              onClick={() => { props.onChange([...props.values, draft.trim()]); setDraft(''); }}
            >
              Add
            </Button>
          </div>
        ) : null}
      </div>
    </Field>
  );
}

/** Risks placed on the probability-by-impact grid. */
function RiskQuadrantGrid({ risks }: { risks: DeckRisk[] }) {
  const quadrants = [
    { key: 'CONTINGENCY', label: 'Plan for', hint: 'Unlikely, but it would hurt', x: 0, y: 0 },
    { key: 'MANAGE', label: 'Manage', hint: 'Likely and it would hurt', x: 1, y: 0 },
    { key: 'ACCEPT', label: 'Accept', hint: 'Unlikely and it would not hurt much', x: 0, y: 1 },
    { key: 'MONITOR', label: 'Monitor', hint: 'Likely but survivable', x: 1, y: 1 },
  ] as const;

  return (
    <div className="flex gap-3">
      <div className="flex w-5 shrink-0 items-center justify-center">
        <span className="label -rotate-90 whitespace-nowrap">Impact</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line">
          {quadrants.map((q) => {
            const inQuadrant = risks.filter((r) => riskQuadrant(r.probability, r.impact).key === q.key);
            const tone = q.key === 'MANAGE' ? 'border-neg/40' : q.key === 'ACCEPT' ? 'border-transparent' : 'border-warn/30';
            return (
              <div key={q.key} className={cx('min-h-[140px] bg-panel p-2.5', q.key === 'MANAGE' && 'bg-neg/[0.04]')}>
                <div className="flex items-baseline justify-between">
                  <span className="label">{q.label}</span>
                  <span className="num text-2xs text-ink-4">{inQuadrant.length}</span>
                </div>
                <p className="mt-0.5 text-2xs text-ink-4">{q.hint}</p>
                <ul className="mt-2 space-y-1">
                  {inQuadrant.map((r) => (
                    <li key={r.id} className={cx('rounded border px-1.5 py-1 text-2xs text-ink-2', tone || 'border-line')}>
                      <span className="block truncate">{r.title || 'Untitled risk'}</span>
                      <span className="text-ink-4">
                        {formatPercent(r.probability, 0)} likely · {formatPercent(r.impact, 0)} of the thesis
                      </span>
                    </li>
                  ))}
                  {inQuadrant.length === 0 ? <li className="text-2xs text-ink-4">—</li> : null}
                </ul>
              </div>
            );
          })}
        </div>
        <div className="mt-1 text-center">
          <span className="label">Probability</span>
        </div>
      </div>
    </div>
  );
}
