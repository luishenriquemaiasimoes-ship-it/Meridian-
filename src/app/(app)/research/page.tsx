import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { prisma } from '@/lib/db';
import { PageHeader } from '@/components/ui/primitives';
import { ResearchWorkbench } from './research-workbench';

export const metadata: Metadata = { title: 'Research' };
export const dynamic = 'force-dynamic';

export default async function ResearchPage({
  searchParams,
}: { searchParams: Promise<{ tab?: string; new?: string; ticker?: string }> }) {
  const ctx = await requireContext();
  const sp = await searchParams;

  const [notes, memos, documents, reviews, companies] = await Promise.all([
    prisma.researchNote.findMany({
      where: { workspaceId: ctx.workspaceId },
      orderBy: { updatedAt: 'desc' },
      include: { author: true, company: true, _count: { select: { versions: true } } },
    }),
    prisma.investmentMemo.findMany({
      where: { workspaceId: ctx.workspaceId },
      orderBy: { updatedAt: 'desc' },
      include: { author: true, company: true, committeeItems: { select: { id: true, status: true } } },
    }),
    prisma.document.findMany({
      where: { workspaceId: ctx.workspaceId },
      orderBy: { createdAt: 'desc' }, take: 40,
      include: { company: true },
    }),
    prisma.earningsReview.findMany({
      where: { workspaceId: ctx.workspaceId },
      orderBy: { createdAt: 'desc' }, take: 20,
      include: { company: true, earnings: true },
    }),
    prisma.company.findMany({ select: { ticker: true, name: true }, orderBy: { ticker: 'asc' } }),
  ]);

  const published = notes.filter((n) => n.status === 'PUBLISHED').length;

  return (
    <>
      <PageHeader
        title="Research"
        subtitle={`${notes.length} note${notes.length === 1 ? '' : 's'} (${published} published), ${memos.length} memo${memos.length === 1 ? '' : 's'} and ${documents.length} document${documents.length === 1 ? '' : 's'} in this workspace.`}
      />
      <ResearchWorkbench
        initialTab={sp.tab ?? 'notes'}
        openNew={sp.new === 'note'}
        prefillTicker={sp.ticker ?? ''}
        canWrite={ctx.can('note:write')}
        companies={companies}
        notes={notes.map((n) => ({
          id: n.id,
          title: n.title,
          status: n.status,
          ticker: n.company?.ticker ?? null,
          companyName: n.company?.name ?? null,
          author: n.author.name,
          recommendation: n.recommendation,
          targetPrice: n.targetPrice,
          conviction: n.conviction,
          versions: n._count.versions,
          createdAt: n.createdAt.toISOString(),
          updatedAt: n.updatedAt.toISOString(),
        }))}
        memos={memos.map((m) => ({
          id: m.id,
          title: m.title,
          status: m.status,
          ticker: m.company.ticker,
          companyName: m.company.name,
          author: m.author.name,
          recommendation: m.recommendation,
          targetPrice: m.targetPrice,
          portfolioRole: m.portfolioRole,
          committeeItems: m.committeeItems.length,
          updatedAt: m.updatedAt.toISOString(),
        }))}
        documents={documents.map((d) => ({
          id: d.id,
          name: d.name,
          kind: d.kind,
          ticker: d.company?.ticker ?? null,
          sizeBytes: d.sizeBytes,
          uploadedBy: d.uploadedBy,
          createdAt: d.createdAt.toISOString(),
          hasText: !!d.content,
        }))}
        reviews={reviews.map((r) => ({
          id: r.id,
          ticker: r.company.ticker,
          headline: r.headline,
          period: r.earnings.label,
          thesisImpact: r.thesisImpact,
          authorName: r.authorName,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
