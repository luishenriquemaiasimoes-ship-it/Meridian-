'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, cx, Field, InlineNote, Input, Modal, NumberInput, Panel, PanelHeader,
  Segmented, Select, Textarea, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { Num, RecommendationBadge, StatRow } from '@/components/ui/values';
import { DASH, formatDateTime } from '@/lib/finance/format';
import { downloadText } from '@/lib/import/csv';
import type { Currency } from '@/lib/finance/types';

export interface NoteSection { key: string; title: string; body: string }

interface VersionRow {
  id: string; version: number; title: string; authorName: string;
  createdAt: string; sections: NoteSection[];
}

type Mode = 'read' | 'edit' | 'history';

export function NoteEditor(props: {
  id: string;
  title: string;
  status: string;
  recommendation: string | null;
  targetPrice: number | null;
  conviction: string | null;
  sections: NoteSection[];
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  canWrite: boolean;
  company: {
    ticker: string; name: string; currency: Currency; price: number | null;
    pe: number | null; evEbitda: number | null; roic: number | null; bankLike: boolean;
  } | null;
  versions: VersionRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>(props.canWrite && props.sections.every((s) => !s.body.trim()) ? 'edit' : 'read');
  const [busy, setBusy] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [compareTo, setCompareTo] = useState<number | null>(props.versions[1]?.version ?? null);

  const [draft, setDraft] = useState({
    title: props.title,
    status: props.status,
    recommendation: props.recommendation ?? '',
    targetPrice: props.targetPrice,
    conviction: props.conviction ?? 'MEDIUM',
    sections: props.sections.length ? props.sections : [{ key: 'body', title: 'Note', body: '' }],
    tags: props.tags.join(', '),
  });
  const [dirty, setDirty] = useState(false);

  const update = useCallback(<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setDirty(true);
  }, []);

  const setSection = (index: number, patch: Partial<NoteSection>) => {
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
    setDirty(true);
  };

  const addSection = () => {
    setDraft((d) => ({
      ...d,
      sections: [...d.sections, { key: `section-${d.sections.length + 1}`, title: `Section ${d.sections.length + 1}`, body: '' }],
    }));
    setDirty(true);
  };

  const removeSection = (index: number) => {
    setDraft((d) => ({ ...d, sections: d.sections.filter((_, i) => i !== index) }));
    setDirty(true);
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= draft.sections.length) return;
    setDraft((d) => {
      const next = d.sections.slice();
      [next[index], next[target]] = [next[target], next[index]];
      return { ...d, sections: next };
    });
    setDirty(true);
  };

  const save = async (statusOverride?: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/notes/${props.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title,
          status: statusOverride ?? draft.status,
          recommendation: draft.recommendation || null,
          targetPrice: draft.targetPrice,
          conviction: draft.conviction || null,
          sections: draft.sections,
          tags: draft.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.push({ tone: 'neg', title: 'Not saved', description: data.error ?? 'Check the note and try again.' });
        return;
      }
      toast.push({
        tone: 'pos',
        title: statusOverride === 'PUBLISHED' ? 'Note published' : 'Note saved',
        description: data.version ? `Saved as version ${data.version}.` : 'No text changed, so no new version was written.',
      });
      setDirty(false);
      if (statusOverride) update('status', statusOverride);
      setMode('read');
      router.refresh();
    } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/notes/${props.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        toast.push({ tone: 'neg', title: 'Not deleted', description: data.error });
        return;
      }
      toast.push({ tone: 'pos', title: 'Note deleted' });
      router.push('/research');
    } finally { setBusy(false); }
  };

  const exportMarkdown = () => {
    const lines = [
      `# ${props.title}`,
      '',
      props.company ? `**Company:** ${props.company.ticker} — ${props.company.name}` : '**Scope:** thematic',
      `**Author:** ${props.author}`,
      `**Status:** ${props.status}`,
      props.recommendation ? `**Recommendation:** ${props.recommendation.replace('_', ' ')}` : '',
      props.targetPrice !== null ? `**Target price:** ${props.targetPrice}` : '',
      `**Last updated:** ${props.updatedAt.slice(0, 10)}`,
      '',
      ...props.sections.flatMap((s) => [`## ${s.title}`, '', s.body || '_Not written yet._', '']),
      '---',
      'Produced in MERIDIAN. Figures cited alongside this note come from the workspace metric set and are labelled by origin in the application.',
    ].filter((l) => l !== '');
    downloadText(`${slug(props.title)}.md`, lines.join('\n'));
  };

  const latest = props.versions[0];
  const comparison = useMemo(() => {
    if (compareTo === null || !latest) return null;
    const older = props.versions.find((v) => v.version === compareTo);
    if (!older) return null;
    const keys = Array.from(new Set([...latest.sections.map((s) => s.key), ...older.sections.map((s) => s.key)]));
    return keys.map((key) => {
      const now = latest.sections.find((s) => s.key === key);
      const before = older.sections.find((s) => s.key === key);
      const state = !before ? 'added' : !now ? 'removed' : now.body === before.body ? 'unchanged' : 'changed';
      return { key, title: now?.title ?? before?.title ?? key, state, now: now?.body ?? '', before: before?.body ?? '' };
    });
  }, [compareTo, latest, props.versions]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Segmented
            value={mode}
            onChange={(v) => setMode(v)}
            options={[
              { value: 'read' as Mode, label: 'Read' },
              ...(props.canWrite ? [{ value: 'edit' as Mode, label: 'Edit' }] : []),
              { value: 'history' as Mode, label: `History (${props.versions.length})` },
            ]}
          />
          <div className="flex items-center gap-2">
            <Button icon={<Icon.Download size={13} />} onClick={exportMarkdown}>Markdown</Button>
            {props.canWrite && mode === 'edit' ? (
              <>
                <Button onClick={() => save()} loading={busy} disabled={!dirty}>Save draft</Button>
                <Button variant="primary" icon={<Icon.Check size={13} />} onClick={() => save('PUBLISHED')} loading={busy}>
                  {props.status === 'PUBLISHED' ? 'Save and keep published' : 'Publish'}
                </Button>
              </>
            ) : null}
            {props.canWrite && mode !== 'edit' ? (
              <Button icon={<Icon.Trash size={13} />} onClick={() => setDeleteModal(true)} title="Delete this note" />
            ) : null}
          </div>
        </div>

        {dirty && mode === 'edit' ? (
          <InlineNote tone="warn">Unsaved changes. Saving writes a new version so the earlier text stays readable.</InlineNote>
        ) : null}

        {mode === 'read' ? (
          <Panel>
            <div className="space-y-5 p-4">
              {props.sections.map((s) => (
                <section key={s.key}>
                  <h2 className="text-sm font-semibold text-ink">{s.title}</h2>
                  {s.body.trim() ? (
                    <div className="mt-1.5 space-y-2 text-[13px] leading-relaxed text-ink-2">
                      {s.body.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
                    </div>
                  ) : (
                    <p className="mt-1.5 text-xs text-ink-4">Not written yet.</p>
                  )}
                </section>
              ))}
              {props.sections.length === 0 ? <p className="text-xs text-ink-4">This note has no sections.</p> : null}
            </div>
          </Panel>
        ) : null}

        {mode === 'edit' ? (
          <div className="space-y-3">
            <Panel>
              <div className="grid gap-3 p-3 sm:grid-cols-2">
                <Field label="Title" required className="sm:col-span-2">
                  <Input value={draft.title} onChange={(e) => update('title', e.target.value)} />
                </Field>
                <Field label="Recommendation">
                  <Select value={draft.recommendation} onChange={(e) => update('recommendation', e.target.value)}>
                    <option value="">None</option>
                    <option value="STRONG_BUY">Strong buy</option>
                    <option value="BUY">Buy</option>
                    <option value="HOLD">Hold</option>
                    <option value="SELL">Sell</option>
                    <option value="STRONG_SELL">Strong sell</option>
                  </Select>
                </Field>
                <Field label="Conviction">
                  <Select value={draft.conviction} onChange={(e) => update('conviction', e.target.value)}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="VERY_HIGH">Very high</option>
                  </Select>
                </Field>
                <Field label="Target price" hint={props.company ? `In ${props.company.currency}.` : 'Optional.'}>
                  <NumberInput
                    value={draft.targetPrice ?? 0}
                    onValueChange={(v) => update('targetPrice', v || null)}
                  />
                </Field>
                <Field label="Tags" hint="Comma separated.">
                  <Input value={draft.tags} onChange={(e) => update('tags', e.target.value)} />
                </Field>
              </div>
            </Panel>

            {draft.sections.map((s, i) => (
              <Panel key={`${s.key}-${i}`}>
                <div className="flex items-center gap-2 border-b border-line p-2">
                  <Input
                    value={s.title}
                    onChange={(e) => setSection(i, { title: e.target.value })}
                    className="flex-1 font-medium"
                  />
                  <button type="button" title="Move up" disabled={i === 0} onClick={() => moveSection(i, -1)} className="rounded p-1 text-ink-4 hover:text-ink-2 disabled:opacity-30 focus-ring">
                    <Icon.ArrowUp size={13} />
                  </button>
                  <button type="button" title="Move down" disabled={i === draft.sections.length - 1} onClick={() => moveSection(i, 1)} className="rounded p-1 text-ink-4 hover:text-ink-2 disabled:opacity-30 focus-ring">
                    <Icon.ArrowDown size={13} />
                  </button>
                  <button type="button" title="Remove section" disabled={draft.sections.length === 1} onClick={() => removeSection(i)} className="rounded p-1 text-ink-4 hover:text-neg disabled:opacity-30 focus-ring">
                    <Icon.Trash size={13} />
                  </button>
                </div>
                <Textarea
                  rows={7}
                  value={s.body}
                  onChange={(e) => setSection(i, { body: e.target.value })}
                  className="rounded-none border-0 focus:ring-0"
                  placeholder="Write the argument. Cite the figure and where it came from — the reader should be able to check it."
                />
              </Panel>
            ))}
            <Button icon={<Icon.Plus size={13} />} onClick={addSection}>Add section</Button>
          </div>
        ) : null}

        {mode === 'history' ? (
          <div className="space-y-3">
            <Panel>
              <PanelHeader
                title="Version history"
                subtitle="A version is written whenever the text or the title changes"
              />
              <ul className="divide-y divide-line">
                {props.versions.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-3 px-3 py-2">
                    <div>
                      <span className="text-xs font-medium text-ink">Version {v.version}</span>
                      <span className="ml-2 text-2xs text-ink-4">{v.authorName} · {formatDateTime(v.createdAt)}</span>
                    </div>
                    {v.version === latest?.version ? (
                      <Badge tone="pos">current</Badge>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCompareTo(v.version)}
                        className={cx('text-2xs focus-ring rounded px-1', compareTo === v.version ? 'text-accent font-semibold' : 'text-ink-3 hover:text-accent')}
                      >
                        Compare with current
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </Panel>

            {comparison ? (
              <Panel>
                <PanelHeader
                  title={`Version ${compareTo} against version ${latest?.version}`}
                  subtitle="Section by section"
                />
                <div className="divide-y divide-line">
                  {comparison.map((c) => (
                    <div key={c.key} className="px-3 py-2.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-semibold text-ink">{c.title}</span>
                        <Badge tone={c.state === 'changed' ? 'warn' : c.state === 'added' ? 'pos' : c.state === 'removed' ? 'neg' : 'neutral'}>
                          {c.state}
                        </Badge>
                      </div>
                      {c.state === 'changed' || c.state === 'removed' ? (
                        <div className="mt-1.5 rounded border border-line bg-sunken p-2 text-2xs leading-relaxed text-ink-3">
                          <div className="label mb-1">Version {compareTo}</div>
                          {c.before || '—'}
                        </div>
                      ) : null}
                      {c.state === 'changed' || c.state === 'added' ? (
                        <div className="mt-1.5 rounded border border-line p-2 text-2xs leading-relaxed text-ink-2">
                          <div className="label mb-1">Current</div>
                          {c.now || '—'}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Panel>
            ) : (
              <InlineNote tone="info">Pick an earlier version to compare it against the current text.</InlineNote>
            )}
          </div>
        ) : null}
      </div>

      <aside className="space-y-3">
        <Panel>
          <PanelHeader title="Note" dense />
          <div className="px-3 pb-3 divide-y divide-line">
            <StatRow label="Status" value={<Badge tone={props.status === 'PUBLISHED' ? 'pos' : 'neutral'}>{props.status.toLowerCase()}</Badge>} />
            <StatRow label="Author" value={<span className="text-xs text-ink-2">{props.author}</span>} />
            <StatRow label="Created" value={<span className="text-xs text-ink-2">{formatDateTime(props.createdAt)}</span>} />
            <StatRow label="Updated" value={<span className="text-xs text-ink-2">{formatDateTime(props.updatedAt)}</span>} />
            <StatRow label="Versions" value={<span className="num text-xs text-ink-2">{props.versions.length}</span>} />
            <StatRow
              label="Call"
              value={props.recommendation ? <RecommendationBadge value={props.recommendation} /> : <span className="text-ink-4">{DASH}</span>}
            />
            <StatRow
              label="Target"
              value={<Num value={props.targetPrice} format="currency" currency={props.company?.currency ?? 'BRL'} />}
            />
          </div>
        </Panel>

        {props.company ? (
          <Panel>
            <PanelHeader
              title={
                <Link href={`/companies/${props.company.ticker}`} className="font-semibold text-ink hover:text-accent">
                  {props.company.ticker}
                </Link>
              }
              subtitle="Live workspace metrics, not figures stored in the note"
              dense
            />
            <div className="px-3 pb-3 divide-y divide-line">
              <StatRow label="Price" value={<Num value={props.company.price} format="currency" currency={props.company.currency} />} />
              <StatRow
                label="Upside to target"
                value={
                  <Num
                    value={
                      props.targetPrice !== null && props.company.price
                        ? props.targetPrice / props.company.price - 1
                        : null
                    }
                    format="percentSigned"
                  />
                }
              />
              <StatRow label="P / E" value={<Num value={props.company.pe} format="multiple" />} />
              <StatRow
                label="EV / EBITDA"
                value={props.company.bankLike
                  ? <span className="text-2xs text-ink-4" title="Enterprise value is not meaningful for a bank.">n/m</span>
                  : <Num value={props.company.evEbitda} format="multiple" />}
              />
              <StatRow
                label="ROIC"
                value={props.company.bankLike
                  ? <span className="text-2xs text-ink-4" title="Invested capital is not a meaningful denominator for a bank. Use ROE.">n/m</span>
                  : <Num value={props.company.roic} format="percent" />}
              />
            </div>
          </Panel>
        ) : null}

        {props.tags.length ? (
          <Panel>
            <PanelHeader title="Tags" dense />
            <div className="flex flex-wrap gap-1.5 px-3 pb-3">
              {props.tags.map((t) => <Badge key={t} tone="neutral">{t}</Badge>)}
            </div>
          </Panel>
        ) : null}
      </aside>

      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete this note?"
        subtitle="The note and every version of it are removed. This cannot be undone."
        width="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={remove} loading={busy}>Delete note</Button>
          </div>
        }
      >
        <p className="p-4 text-xs text-ink-2">
          &ldquo;{props.title}&rdquo; has {props.versions.length} version{props.versions.length === 1 ? '' : 's'}. Deleting it removes
          the note from the research list and from the company&apos;s research tab.
        </p>
      </Modal>
    </div>
  );
}

function slug(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
