import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { prisma, parseJson } from '@/lib/db';
import { PageHeader } from '@/components/ui/primitives';
import { LibraryWorkbench } from './library-workbench';

export const metadata: Metadata = { title: 'Research library' };
export const dynamic = 'force-dynamic';

interface Extraction {
  method?: string;
  warning?: string | null;
  metrics?: { label: string; value: number | null; unit?: string | null; note?: string | null }[];
}

export default async function LibraryPage({
  searchParams,
}: { searchParams: Promise<{ q?: string; ticker?: string }> }) {
  const ctx = await requireContext();
  const { q, ticker } = await searchParams;

  const [documents, companies] = await Promise.all([
    prisma.document.findMany({
      where: {
        workspaceId: ctx.workspaceId,
        ...(ticker ? { company: { ticker: ticker.toUpperCase() } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { company: true },
      take: 300,
    }),
    prisma.company.findMany({ select: { id: true, ticker: true, name: true }, orderBy: { ticker: 'asc' } }),
  ]);

  const query = (q ?? '').toLowerCase();
  const filtered = query
    ? documents.filter((d) => `${d.name} ${d.content ?? ''}`.toLowerCase().includes(query))
    : documents;

  const totalBytes = documents.reduce((s, d) => s + d.sizeBytes, 0);

  return (
    <>
      <PageHeader
        title="Research library"
        subtitle={`${documents.length} document${documents.length === 1 ? '' : 's'}, ${(totalBytes / 1024 / 1024).toFixed(1)} MB of source material. Only the extracted text is retained — the original binary is never stored.`}
      />
      <LibraryWorkbench
        canUpload={ctx.can('document:upload')}
        companies={companies}
        initialQuery={q ?? ''}
        initialTicker={ticker ?? ''}
        documents={filtered.map((d) => {
          const extraction = parseJson<Extraction>(d.extraction, {});
          return {
            id: d.id,
            name: d.name,
            kind: d.kind,
            mimeType: d.mimeType,
            sizeBytes: d.sizeBytes,
            ticker: d.company?.ticker ?? null,
            companyName: d.company?.name ?? null,
            uploadedBy: d.uploadedBy,
            createdAt: d.createdAt.toISOString(),
            characters: (d.content ?? '').length,
            excerpt: (d.content ?? '').replace(/\s+/g, ' ').slice(0, 240),
            method: extraction.method ?? null,
            warning: extraction.warning ?? null,
            metricCount: extraction.metrics?.length ?? 0,
            match: query
              ? excerptAround(d.content ?? '', query)
              : null,
          };
        })}
      />
    </>
  );
}

/** The first passage containing the query, so a search result shows its context. */
function excerptAround(text: string, query: string): string | null {
  const idx = text.toLowerCase().indexOf(query);
  if (idx < 0) return null;
  const start = Math.max(0, idx - 90);
  return `${start > 0 ? '…' : ''}${text.slice(start, idx + query.length + 110).replace(/\s+/g, ' ')}…`;
}
