'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, cx, EmptyState, Field, InlineNote, Input, Modal, Panel, PanelHeader,
  Segmented, Select, Tabs, Textarea, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { DataTable, type Column } from '@/components/ui/table';
import { MetricCard, Num, RecommendationBadge } from '@/components/ui/values';
import { DASH, formatDate } from '@/lib/finance/format';

type Tab = 'notes' | 'memos' | 'documents' | 'reviews';

interface NoteRow {
  id: string; title: string; status: string; ticker: string | null; companyName: string | null;
  author: string; recommendation: string | null; targetPrice: number | null; conviction: string | null;
  versions: number; createdAt: string; updatedAt: string;
}

interface MemoRow {
  id: string; title: string; status: string; ticker: string; companyName: string; author: string;
  recommendation: string | null; targetPrice: number | null; portfolioRole: string | null;
  committeeItems: number; updatedAt: string;
}

interface DocRow {
  id: string; name: string; kind: string; ticker: string | null; sizeBytes: number;
  uploadedBy: string; createdAt: string; hasText: boolean;
}

interface ReviewRow {
  id: string; ticker: string; headline: string; period: string;
  thesisImpact: string; authorName: string; createdAt: string;
}

const STATUS_TONE: Record<string, 'pos' | 'neutral' | 'warn' | 'neg'> = {
  PUBLISHED: 'pos', APPROVED: 'pos', DRAFT: 'neutral', UNDER_REVIEW: 'warn',
  ARCHIVED: 'neutral', REJECTED: 'neg',
};

/** The section skeleton a new note starts from. */
const NOTE_TEMPLATES: Record<string, { label: string; sections: { key: string; title: string; body: string }[] }> = {
  initiation: {
    label: 'Initiation',
    sections: [
      { key: 'summary', title: '1. Summary and recommendation', body: '' },
      { key: 'business', title: '2. What the business does', body: '' },
      { key: 'financials', title: '3. Financial record', body: '' },
      { key: 'valuation', title: '4. Valuation', body: '' },
      { key: 'risks', title: '5. What would make this wrong', body: '' },
    ],
  },
  update: {
    label: 'Thesis update',
    sections: [
      { key: 'what-changed', title: 'What changed', body: '' },
      { key: 'numbers', title: 'Effect on the numbers', body: '' },
      { key: 'thesis', title: 'Effect on the thesis', body: '' },
      { key: 'action', title: 'Action', body: '' },
    ],
  },
  earnings: {
    label: 'Earnings reaction',
    sections: [
      { key: 'print', title: 'The print against expectations', body: '' },
      { key: 'drivers', title: 'What drove it', body: '' },
      { key: 'guidance', title: 'Guidance and commentary', body: '' },
      { key: 'view', title: 'Our view after the print', body: '' },
    ],
  },
  blank: {
    label: 'Blank',
    sections: [{ key: 'body', title: 'Note', body: '' }],
  },
};

export function ResearchWorkbench(props: {
  initialTab: string;
  openNew: boolean;
  prefillTicker: string;
  canWrite: boolean;
  companies: { ticker: string; name: string }[];
  notes: NoteRow[];
  memos: MemoRow[];
  documents: DocRow[];
  reviews: ReviewRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>((props.initialTab as Tab) ?? 'notes');
  const [statusFilter, setStatusFilter] = useState<'all' | 'DRAFT' | 'PUBLISHED'>('all');
  const [modal, setModal] = useState(props.openNew);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: '', ticker: props.prefillTicker, template: 'initiation',
    recommendation: '', summary: '',
  });

  const notes = useMemo(
    () => (statusFilter === 'all' ? props.notes : props.notes.filter((n) => n.status === statusFilter)),
    [props.notes, statusFilter],
  );

  const createNote = async () => {
    setBusy(true);
    try {
      const template = NOTE_TEMPLATES[form.template] ?? NOTE_TEMPLATES.blank;
      const sections = template.sections.map((s, i) =>
        i === 0 && form.summary ? { ...s, body: form.summary } : s,
      );
      const res = await fetch('/api/notes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          ticker: form.ticker ? form.ticker.toUpperCase() : null,
          sections,
          recommendation: form.recommendation || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Note not created', description: data.error }); return; }
      toast.push({ tone: 'pos', title: 'Note created', description: 'Opening the editor.' });
      router.push(`/research/notes/${data.note.id}`);
    } finally { setBusy(false); }
  };

  const noteColumns: Column<NoteRow>[] = [
    {
      key: 'title', header: 'Title', sticky: true, width: '300px', sortable: true, value: (n) => n.title,
      render: (n) => (
        <Link href={`/research/notes/${n.id}`} className="font-medium text-ink hover:text-accent">{n.title}</Link>
      ),
    },
    {
      key: 'ticker', header: 'Company', value: (n) => n.ticker ?? '', sortable: true, width: '110px',
      render: (n) => n.ticker
        ? <Link href={`/companies/${n.ticker}`} className="font-semibold text-ink-2 hover:text-accent">{n.ticker}</Link>
        : <span className="text-ink-4">Workspace</span>,
    },
    {
      key: 'status', header: 'Status', value: (n) => n.status, sortable: true, width: '100px',
      render: (n) => <Badge tone={STATUS_TONE[n.status] ?? 'neutral'}>{n.status.replace('_', ' ').toLowerCase()}</Badge>,
    },
    {
      key: 'rec', header: 'Call', value: (n) => n.recommendation ?? '', sortable: true, width: '110px',
      render: (n) => n.recommendation ? <RecommendationBadge value={n.recommendation} /> : <span className="text-ink-4">{DASH}</span>,
    },
    { key: 'target', header: 'Target', value: (n) => n.targetPrice, format: 'currency', align: 'right', sortable: true },
    { key: 'author', header: 'Author', value: (n) => n.author, sortable: true, className: 'text-ink-3 text-2xs' },
    { key: 'versions', header: 'Versions', value: (n) => n.versions, format: 'number', align: 'right', sortable: true },
    {
      key: 'updated', header: 'Updated', value: (n) => n.updatedAt, sortable: true, align: 'right',
      render: (n) => <span className="text-2xs text-ink-3">{formatDate(n.updatedAt)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Notes" value={props.notes.length} format="number" decimals={0} sublabel={`${props.notes.filter((n) => n.status === 'PUBLISHED').length} published`} />
        <MetricCard label="Investment memos" value={props.memos.length} format="number" decimals={0} sublabel={`${props.memos.filter((m) => m.status === 'UNDER_REVIEW').length} under review`} />
        <MetricCard label="Documents" value={props.documents.length} format="number" decimals={0} sublabel={`${props.documents.filter((d) => d.hasText).length} with extracted text`} />
        <MetricCard label="Earnings reviews" value={props.reviews.length} format="number" decimals={0} sublabel="Written after a print" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          tabs={[
            { value: 'notes', label: 'Notes', count: props.notes.length },
            { value: 'memos', label: 'Memos', count: props.memos.length },
            { value: 'documents', label: 'Documents', count: props.documents.length },
            { value: 'reviews', label: 'Earnings reviews', count: props.reviews.length },
          ]}
          className="flex-1"
        />
        {props.canWrite ? (
          <Button variant="primary" icon={<Icon.Plus size={13} />} onClick={() => setModal(true)}>New note</Button>
        ) : null}
      </div>

      {tab === 'notes' ? (
        <div className="space-y-3">
          <Segmented
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: `All (${props.notes.length})` },
              { value: 'DRAFT', label: `Drafts (${props.notes.filter((n) => n.status === 'DRAFT').length})` },
              { value: 'PUBLISHED', label: `Published (${props.notes.filter((n) => n.status === 'PUBLISHED').length})` },
            ]}
          />
          <Panel>
            <DataTable
              columns={noteColumns}
              rows={notes}
              rowKey={(n) => n.id}
              initialSort={{ key: 'updated', direction: 'desc' }}
              dense
              searchable
              searchValue={(n) => `${n.title} ${n.ticker ?? ''} ${n.author}`}
              emptyTitle="No notes"
              emptyDescription="A research note is where the argument lives before it becomes a memo."
            />
          </Panel>
        </div>
      ) : null}

      {tab === 'memos' ? (
        props.memos.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {props.memos.map((m) => (
              <Panel key={m.id}>
                <PanelHeader
                  title={<Link href={`/memos/${m.id}`} className="font-semibold text-ink hover:text-accent">{m.title}</Link>}
                  subtitle={m.portfolioRole ?? `${m.companyName} — prepared by ${m.author}`}
                  actions={<Badge tone={STATUS_TONE[m.status] ?? 'neutral'}>{m.status.replace('_', ' ').toLowerCase()}</Badge>}
                />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 pb-3 text-2xs text-ink-3">
                  <Link href={`/companies/${m.ticker}`} className="font-semibold text-ink-2 hover:text-accent">{m.ticker}</Link>
                  {m.recommendation ? <RecommendationBadge value={m.recommendation} /> : null}
                  {m.targetPrice !== null ? (
                    <span>Target <Num value={m.targetPrice} format="currency" className="font-semibold text-ink-2" /></span>
                  ) : null}
                  <span>Updated {formatDate(m.updatedAt)}</span>
                  {m.committeeItems > 0 ? (
                    <Link href="/committee" className="text-accent hover:underline">
                      {m.committeeItems} committee item{m.committeeItems === 1 ? '' : 's'}
                    </Link>
                  ) : null}
                </div>
              </Panel>
            ))}
          </div>
        ) : (
          <Panel>
            <EmptyState
              icon={<Icon.Memo size={22} />}
              title="No memos yet"
              description="A memo is the document the committee votes on. Write it from a company's research tab once the thesis is settled."
            />
          </Panel>
        )
      ) : null}

      {tab === 'documents' ? (
        <Panel>
          <PanelHeader title="Documents" subtitle="Filings, releases and models uploaded into this workspace" />
          {props.documents.length ? (
            <ul className="divide-y divide-line">
              {props.documents.map((d) => (
                <li key={d.id} className="flex items-center gap-3 px-3 py-2.5">
                  <Icon.Library size={15} className="shrink-0 text-ink-4" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/library/${d.id}`} className="text-xs font-medium text-ink hover:text-accent">{d.name}</Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-2xs text-ink-4">
                      <Badge tone="neutral">{d.kind.replace('_', ' ').toLowerCase()}</Badge>
                      {d.ticker ? <Link href={`/companies/${d.ticker}`} className="text-accent hover:underline">{d.ticker}</Link> : null}
                      <span>{(d.sizeBytes / 1024).toFixed(0)} KB</span>
                      <span>{d.uploadedBy}</span>
                      <span>{formatDate(d.createdAt)}</span>
                      {!d.hasText ? <span className="text-warn">No text extracted</span> : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<Icon.Library size={22} />} title="No documents" description="Upload a filing or a release from the research library." />
          )}
        </Panel>
      ) : null}

      {tab === 'reviews' ? (
        <Panel>
          <PanelHeader title="Earnings reviews" subtitle="What the desk concluded after each print" />
          {props.reviews.length ? (
            <ul className="divide-y divide-line">
              {props.reviews.map((r) => (
                <li key={r.id} className="px-3 py-2.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="flex items-baseline gap-2">
                      <Link href={`/companies/${r.ticker}/earnings`} className="text-xs font-semibold text-ink hover:text-accent">{r.ticker}</Link>
                      <span className="text-2xs text-ink-4">{r.period}</span>
                    </div>
                    <Badge tone={r.thesisImpact === 'SUPPORTS' ? 'pos' : r.thesisImpact === 'WEAKENS' ? 'neg' : 'neutral'}>
                      {r.thesisImpact.toLowerCase()}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-2">{r.headline}</p>
                  <p className="mt-0.5 text-2xs text-ink-4">{r.authorName} · {formatDate(r.createdAt)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<Icon.Earnings size={22} />} title="No reviews" description="Write one from a company's earnings tab after a print." />
          )}
        </Panel>
      ) : null}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="New research note"
        subtitle="Pick a skeleton to start from. Every edit is versioned."
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={createNote} loading={busy} disabled={form.title.trim().length < 3}>
              Create and open
            </Button>
          </div>
        }
      >
        <div className="space-y-3 p-4">
          <Field label="Title" required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Vale — the capex cycle is turning"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Company" hint="Leave blank for a thematic note.">
              <Select value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value })}>
                <option value="">No company</option>
                {props.companies.map((c) => (
                  <option key={c.ticker} value={c.ticker}>{c.ticker} — {c.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Template">
              <Select value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })}>
                {Object.entries(NOTE_TEMPLATES).map(([key, t]) => (
                  <option key={key} value={key}>{t.label}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Recommendation" hint="Optional. A note can be published without a call.">
            <Select value={form.recommendation} onChange={(e) => setForm({ ...form, recommendation: e.target.value })}>
              <option value="">None</option>
              <option value="STRONG_BUY">Strong buy</option>
              <option value="BUY">Buy</option>
              <option value="HOLD">Hold</option>
              <option value="SELL">Sell</option>
              <option value="STRONG_SELL">Strong sell</option>
            </Select>
          </Field>
          <Field label="Opening paragraph" hint="Goes into the first section. You can finish the rest in the editor.">
            <Textarea rows={4} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </Field>
          <InlineNote tone="info">
            A note is saved as a draft. Publishing it makes it visible as the desk&apos;s position on the name and records a
            version you can compare against later.
          </InlineNote>
        </div>
      </Modal>
    </div>
  );
}

/** Kept for the status chips used above. */
export { STATUS_TONE };
