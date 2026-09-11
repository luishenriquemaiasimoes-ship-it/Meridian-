import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { requirePageContext } from '@/server/context';
import { prisma, parseJson } from '@/lib/db';
import { getMemoEvidence } from '@/server/services/memo';
import { PageHeader } from '@/components/ui/primitives';
import { MemoEditor } from './memo-editor';
import type { MemoSection } from '@/lib/memo/sections';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const memo = await prisma.investmentMemo.findUnique({ where: { id }, select: { title: true } });
  return { title: memo?.title ?? 'Investment memo' };
}

export default async function MemoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requirePageContext();

  const memo = await prisma.investmentMemo.findFirst({
    where: { id, workspaceId: ctx.workspaceId },
    include: {
      author: true,
      company: true,
      committeeItems: {
        include: { votes: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!memo) notFound();

  const evidence = await getMemoEvidence(ctx.workspaceId, memo.company.ticker);

  return (
    <>
      <PageHeader
        title={memo.title}
        subtitle={`${memo.company.name} · prepared by ${memo.author.name}`}
        breadcrumb={
          <span className="flex items-center gap-1.5">
            <Link href="/memos" className="hover:text-accent">Memos</Link>
            <span className="text-ink-4">/</span>
            <Link href={`/companies/${memo.company.ticker}`} className="hover:text-accent">{memo.company.ticker}</Link>
          </span>
        }
      />
      <MemoEditor
        id={memo.id}
        title={memo.title}
        status={memo.status}
        recommendation={memo.recommendation}
        targetPrice={memo.targetPrice}
        portfolioRole={memo.portfolioRole}
        sections={parseJson<MemoSection[]>(memo.sections, [])}
        author={memo.author.name}
        updatedAt={memo.updatedAt.toISOString()}
        canWrite={ctx.can('memo:write')}
        canDecide={ctx.can('committee:decide')}
        evidence={evidence}
        committeeItems={memo.committeeItems.map((c) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          proposal: c.proposal,
          meetingDate: c.meetingDate?.toISOString().slice(0, 10) ?? null,
          votes: c.votes.map((v) => ({ user: v.user.name, vote: v.vote, rationale: v.rationale })),
        }))}
      />
    </>
  );
}
