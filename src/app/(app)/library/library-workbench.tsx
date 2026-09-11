'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, cx, EmptyState, Field, InlineNote, Input, Modal, Panel, PanelHeader,
  Select, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { MetricCard } from '@/components/ui/values';
import { formatDate } from '@/lib/finance/format';

interface DocRow {
  id: string; name: string; kind: string; mimeType: string; sizeBytes: number;
  ticker: string | null; companyName: string | null; uploadedBy: string; createdAt: string;
  characters: number; excerpt: string; method: string | null; warning: string | null;
  metricCount: number; match: string | null;
}

const KINDS = [
  { value: 'EARNINGS_RELEASE', label: 'Earnings release' },
  { value: 'PRESENTATION', label: 'Presentation' },
  { value: 'TRANSCRIPT', label: 'Transcript' },
  { value: 'FILING', label: 'Filing' },
  { value: 'MODEL', label: 'Model' },
  { value: 'OTHER', label: 'Other' },
];

export function LibraryWorkbench(props: {
  canUpload: boolean;
  companies: { id: string; ticker: string; name: string }[];
  initialQuery: string;
  initialTicker: string;
  documents: DocRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(props.initialQuery);
  const [ticker, setTicker] = useState(props.initialTicker);
  const [uploadModal, setUploadModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadCompany, setUploadCompany] = useState('');
  const [uploadKind, setUploadKind] = useState('');
  const [result, setResult] = useState<{ extracted: number; warning?: string | null; metrics?: { label: string; value: number | null; note?: string | null }[] } | null>(null);

  const search = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (ticker) params.set('ticker', ticker);
    router.push(`/library${params.toString() ? `?${params}` : ''}`);
  };

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      if (uploadCompany) form.append('companyId', uploadCompany);
      if (uploadKind) form.append('kind', uploadKind);
      const res = await fetch('/api/documents', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Upload failed', description: data.error }); return; }
      setResult({ extracted: data.extracted, warning: data.warning, metrics: data.metrics });
      toast.push({
        tone: data.warning ? 'warn' : 'pos',
        title: 'Document stored',
        description: data.warning ?? `${data.extracted} figure${data.extracted === 1 ? '' : 's'} located in the text.`,
      });
      router.refresh();
    } finally { setBusy(false); }
  };

  const remove = async (id: string, name: string) => {
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      toast.push({ tone: 'neg', title: 'Not deleted', description: data.error });
      return;
    }
    toast.push({ tone: 'pos', title: 'Document deleted', description: name });
    router.refresh();
  };

  const withText = props.documents.filter((d) => d.characters > 0).length;
  const withMetrics = props.documents.filter((d) => d.metricCount > 0).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Documents" value={props.documents.length} format="number" decimals={0} />
        <MetricCard label="With extracted text" value={withText} format="number" decimals={0} sublabel="Searchable full text" />
        <MetricCard label="With located figures" value={withMetrics} format="number" decimals={0} sublabel="Numbers found in the text" />
        <MetricCard
          label="Companies covered"
          value={new Set(props.documents.map((d) => d.ticker).filter(Boolean)).size}
          format="number" decimals={0}
        />
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <Field label="Search the full text" className="min-w-[240px] flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') search(); }}
            placeholder="capex guidance, covenant, buyback…"
          />
        </Field>
        <Field label="Company" className="min-w-[180px]">
          <Select value={ticker} onChange={(e) => setTicker(e.target.value)}>
            <option value="">Every company</option>
            {props.companies.map((c) => <option key={c.ticker} value={c.ticker}>{c.ticker}</option>)}
          </Select>
        </Field>
        <Button icon={<Icon.Search size={13} />} onClick={search}>Search</Button>
        {props.initialQuery || props.initialTicker ? (
          <Button onClick={() => { setQuery(''); setTicker(''); router.push('/library'); }}>Clear</Button>
        ) : null}
        {props.canUpload ? (
          <Button variant="primary" icon={<Icon.Upload size={13} />} onClick={() => setUploadModal(true)} className="ml-auto">
            Upload
          </Button>
        ) : null}
      </div>

      {props.initialQuery ? (
        <InlineNote tone="info">
          Showing documents whose name or extracted text contains &ldquo;{props.initialQuery}&rdquo;. Documents whose text
          could not be extracted are not searchable and are marked below.
        </InlineNote>
      ) : null}

      {props.documents.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<Icon.Library size={22} />}
            title={props.initialQuery ? 'Nothing matches that search' : 'The library is empty'}
            description={
              props.initialQuery
                ? 'Try a different term, or clear the filters to see every document.'
                : 'Upload a filing, an earnings release or a transcript. The text is extracted and indexed; the original binary is not stored.'
            }
            action={props.canUpload && !props.initialQuery
              ? <Button variant="primary" icon={<Icon.Upload size={13} />} onClick={() => setUploadModal(true)}>Upload a document</Button>
              : undefined}
          />
        </Panel>
      ) : (
        <div className="space-y-2">
          {props.documents.map((d) => (
            <Panel key={d.id} className="p-3">
              <div className="flex items-start gap-3">
                <Icon.Library size={16} className="mt-0.5 shrink-0 text-ink-4" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <Link href={`/library/${d.id}`} className="text-sm font-medium text-ink hover:text-accent">{d.name}</Link>
                    <Badge tone="neutral">{d.kind.replace('_', ' ').toLowerCase()}</Badge>
                    {d.ticker ? (
                      <Link href={`/companies/${d.ticker}`} className="text-2xs font-semibold text-accent hover:underline">{d.ticker}</Link>
                    ) : null}
                  </div>
                  <p className={cx('mt-1 text-xs leading-relaxed', d.match ? 'text-ink-2' : 'text-ink-3')}>
                    {d.match ?? d.excerpt ?? 'No text was extracted from this document.'}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-ink-4">
                    <span>{(d.sizeBytes / 1024).toFixed(0)} KB</span>
                    <span>{d.characters.toLocaleString('pt-BR')} characters extracted</span>
                    {d.metricCount > 0 ? <span>{d.metricCount} figures located</span> : null}
                    {d.method ? <span>{d.method}</span> : null}
                    <span>{d.uploadedBy}</span>
                    <span>{formatDate(d.createdAt)}</span>
                    {d.warning ? <span className="text-warn">{d.warning}</span> : null}
                  </div>
                </div>
                {props.canUpload ? (
                  <button
                    type="button" title={`Delete ${d.name}`}
                    className="shrink-0 rounded p-1 text-ink-4 hover:text-neg focus-ring"
                    onClick={() => remove(d.id, d.name)}
                  >
                    <Icon.Trash size={13} />
                  </button>
                ) : null}
              </div>
            </Panel>
          ))}
        </div>
      )}

      <Modal
        open={uploadModal}
        onClose={() => { setUploadModal(false); setResult(null); setFile(null); }}
        title="Upload a document"
        subtitle="PDF, spreadsheet, CSV or text. Up to 12 MB."
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => { setUploadModal(false); setResult(null); setFile(null); }}>Close</Button>
            <Button variant="primary" onClick={upload} loading={busy} disabled={!file}>Upload and extract</Button>
          </div>
        }
      >
        <div className="space-y-3 p-4">
          <Field label="File" required>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.xlsx,.xls,.csv,.txt,.md"
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); }}
              className="block w-full text-xs text-ink-2 file:mr-3 file:rounded file:border file:border-line file:bg-raised file:px-2.5 file:py-1.5 file:text-xs file:text-ink hover:file:bg-sunken"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Company" hint="Optional. Links the document to a company's research tab.">
              <Select value={uploadCompany} onChange={(e) => setUploadCompany(e.target.value)}>
                <option value="">No company</option>
                {props.companies.map((c) => <option key={c.id} value={c.id}>{c.ticker} — {c.name}</option>)}
              </Select>
            </Field>
            <Field label="Kind" hint="Left blank, it is inferred from the file name.">
              <Select value={uploadKind} onChange={(e) => setUploadKind(e.target.value)}>
                <option value="">Infer from the file name</option>
                {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
              </Select>
            </Field>
          </div>

          {result ? (
            <div className="rounded border border-line p-3">
              <div className="label mb-1.5">Extraction result</div>
              {result.warning ? <InlineNote tone="warn">{result.warning}</InlineNote> : null}
              <p className="mt-1 text-xs text-ink-2">
                {result.extracted} figure{result.extracted === 1 ? '' : 's'} located in the text.
              </p>
              {result.metrics?.length ? (
                <ul className="mt-2 space-y-1 text-2xs">
                  {result.metrics.slice(0, 8).map((m, i) => (
                    <li key={i} className="flex items-baseline justify-between gap-2">
                      <span className="text-ink-3">{m.label}</span>
                      <span className="num text-ink">{m.value === null ? 'unavailable' : m.value.toLocaleString('pt-BR')}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-2 text-2xs text-ink-4">
                Located figures are a reading aid, not data. Nothing here is written into the statements — a figure only
                enters the financial engine through a normalization adjustment you record yourself.
              </p>
            </div>
          ) : (
            <InlineNote tone="info">
              The text is extracted and stored so it can be searched; the original file is not kept. Numbers found in the
              text are surfaced for reference and never written into the statements.
            </InlineNote>
          )}
        </div>
      </Modal>
    </div>
  );
}
