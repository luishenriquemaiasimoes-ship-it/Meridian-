import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { requireContext } from '@/server/context';
import { prisma, parseJson } from '@/lib/db';
import { getMetricsMap } from '@/server/services/metrics';
import { PageHeader } from '@/components/ui/primitives';
import { NoteEditor, type NoteSection } from './note-editor';
import type { Currency } from '@/lib/finance/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const note = await prisma.researchNote.findUnique({ where: { id }, select: { title: true } });
  return { title: note?.title ?? 'Research note' };
}

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireContext();

  const note = await prisma.researchNote.findFirst({
    where: { id, workspaceId: ctx.workspaceId },
    include: {
      author: true,
      company: true,
      versions: { orderBy: { version: 'desc' } },
    },
  });
  if (!note) notFound();

  const metrics = note.company ? (await getMetricsMap()).get(note.company.ticker) : undefined;

  return (
    <>
      <PageHeader
        title={note.title}
        subtitle={
          note.company
            ? `${note.company.name} · written by ${note.author.name}`
            : `Thematic note · written by ${note.author.name}`
        }
        breadcrumb={
          <span className="flex items-center gap-1.5">
            <Link href="/research" className="hover:text-accent">Research</Link>
            <span className="text-ink-4">/</span>
            {note.company ? (
              <>
                <Link href={`/companies/${note.company.ticker}`} className="hover:text-accent">{note.company.ticker}</Link>
                <span className="text-ink-4">/</span>
              </>
            ) : null}
            <span className="text-ink-4">Note</span>
          </span>
        }
      />
      <NoteEditor
        id={note.id}
        title={note.title}
        status={note.status}
        recommendation={note.recommendation}
        targetPrice={note.targetPrice}
        conviction={note.conviction}
        sections={parseJson<NoteSection[]>(note.sections, [])}
        tags={parseJson<string[]>(note.tags, [])}
        author={note.author.name}
        createdAt={note.createdAt.toISOString()}
        updatedAt={note.updatedAt.toISOString()}
        canWrite={ctx.can('note:write')}
        company={
          note.company
            ? {
                ticker: note.company.ticker,
                name: note.company.name,
                currency: note.company.currency as Currency,
                price: metrics?.price ?? null,
                pe: metrics?.pe ?? null,
                evEbitda: metrics?.evEbitda ?? null,
                roic: metrics?.roic ?? null,
                bankLike: metrics?.bankLike ?? false,
              }
            : null
        }
        versions={note.versions.map((v) => ({
          id: v.id,
          version: v.version,
          title: v.title,
          authorName: v.authorName,
          createdAt: v.createdAt.toISOString(),
          sections: parseJson<NoteSection[]>(v.sections, []),
        }))}
      />
      <p className="mt-4 text-2xs text-ink-4">
        Market figures shown alongside this note come from the workspace metric set at the time the page was loaded, not
        from the note itself. <Link href="/settings/data-sources" className="text-accent hover:underline">Where the data comes from</Link>.
      </p>
    </>
  );
}
