import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { requireContext } from '@/server/context';
import { prisma, parseJson } from '@/lib/db';
import { Badge, InlineNote, PageHeader, Panel, PanelHeader } from '@/components/ui/primitives';
import { StatRow } from '@/components/ui/values';
import { formatDateTime } from '@/lib/finance/format';

export const dynamic = 'force-dynamic';

interface Extraction {
  method?: string;
  warning?: string | null;
  metrics?: { label: string; value: number | null; unit?: string | null; note?: string | null }[];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id }, select: { name: true } });
  return { title: doc?.name ?? 'Document' };
}

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireContext();

  const doc = await prisma.document.findFirst({
    where: { id, workspaceId: ctx.workspaceId },
    include: { company: true },
  });
  if (!doc) notFound();

  const extraction = parseJson<Extraction>(doc.extraction, {});
  const tags = parseJson<string[]>(doc.tags, []);
  const text = doc.content ?? '';
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim()).slice(0, 400);

  return (
    <>
      <PageHeader
        title={doc.name}
        subtitle={`${doc.kind.replace('_', ' ').toLowerCase()} · uploaded by ${doc.uploadedBy}`}
        breadcrumb={
          <span className="flex items-center gap-1.5">
            <Link href="/library" className="hover:text-accent">Research library</Link>
            {doc.company ? (
              <>
                <span className="text-ink-4">/</span>
                <Link href={`/companies/${doc.company.ticker}`} className="hover:text-accent">{doc.company.ticker}</Link>
              </>
            ) : null}
          </span>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Panel className="min-w-0">
          <PanelHeader
            title="Extracted text"
            subtitle={text ? `${text.length.toLocaleString('pt-BR')} characters` : 'No text could be extracted'}
          />
          <div className="max-h-[70vh] overflow-auto px-4 pb-4">
            {paragraphs.length ? (
              <div className="space-y-2.5 text-[13px] leading-relaxed text-ink-2">
                {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            ) : (
              <InlineNote tone="warn">
                No text was extracted from this file. It may be a scanned image or an unsupported format — the document is
                kept for the record, but it is not searchable and no figures were located in it.
              </InlineNote>
            )}
          </div>
        </Panel>

        <aside className="space-y-3">
          <Panel>
            <PanelHeader title="Document" dense />
            <div className="px-3 pb-3 divide-y divide-line">
              <StatRow label="Kind" value={<Badge tone="neutral">{doc.kind.replace('_', ' ').toLowerCase()}</Badge>} />
              <StatRow label="Type" value={<span className="text-2xs text-ink-2">{doc.mimeType}</span>} />
              <StatRow label="Size" value={<span className="num text-xs text-ink-2">{(doc.sizeBytes / 1024).toFixed(0)} KB</span>} />
              <StatRow label="Uploaded" value={<span className="text-2xs text-ink-2">{formatDateTime(doc.createdAt)}</span>} />
              <StatRow label="By" value={<span className="text-xs text-ink-2">{doc.uploadedBy}</span>} />
              {doc.company ? (
                <StatRow
                  label="Company"
                  value={<Link href={`/companies/${doc.company.ticker}`} className="text-xs font-semibold text-ink hover:text-accent">{doc.company.ticker}</Link>}
                />
              ) : null}
              {extraction.method ? <StatRow label="Extraction" value={<span className="text-2xs text-ink-2">{extraction.method}</span>} /> : null}
            </div>
          </Panel>

          {extraction.metrics?.length ? (
            <Panel>
              <PanelHeader
                title="Figures located"
                subtitle="Read from the text for reference. None of these is written into the statements."
                dense
              />
              <div className="px-3 pb-3 divide-y divide-line">
                {extraction.metrics.map((m, i) => (
                  <div key={i} className="py-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-2xs text-ink-2">{m.label}</span>
                      <span className="num shrink-0 text-2xs text-ink">
                        {m.value === null ? <span className="text-ink-4">unavailable</span> : m.value.toLocaleString('pt-BR')}
                        {m.unit ? <span className="ml-1 text-ink-4">{m.unit}</span> : null}
                      </span>
                    </div>
                    {m.note ? <p className="mt-0.5 text-2xs text-ink-4">{m.note}</p> : null}
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}

          {extraction.warning ? <InlineNote tone="warn">{extraction.warning}</InlineNote> : null}

          {tags.length ? (
            <Panel>
              <PanelHeader title="Tags" dense />
              <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                {tags.map((t) => <Badge key={t} tone="neutral">{t}</Badge>)}
              </div>
            </Panel>
          ) : null}

          <InlineNote tone="info">
            MERIDIAN stores the extracted text only. The original file is not retained, so this page is the record of what
            the document said.
          </InlineNote>
        </aside>
      </div>
    </>
  );
}
