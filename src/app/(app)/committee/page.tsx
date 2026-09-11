import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { prisma } from '@/lib/db';
import { getMetricsMap } from '@/server/services/metrics';
import { getPortfolioAnalytics } from '@/server/services/portfolio';
import { PageHeader } from '@/components/ui/primitives';
import { CommitteeBoard } from './committee-board';
import type { Currency } from '@/lib/finance/types';

export const metadata: Metadata = { title: 'Committee' };
export const dynamic = 'force-dynamic';

export default async function CommitteePage() {
  const ctx = await requireContext();

  const [items, metrics, analytics, memos, companies, members] = await Promise.all([
    prisma.committeeItem.findMany({
      where: { workspaceId: ctx.workspaceId },
      orderBy: [{ status: 'asc' }, { meetingDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        company: true,
        memo: { select: { id: true, title: true, status: true } },
        votes: { include: { user: true }, orderBy: { createdAt: 'asc' } },
        comments: { include: { user: true }, orderBy: { createdAt: 'asc' } },
      },
    }),
    getMetricsMap(),
    getPortfolioAnalytics(ctx.workspaceId),
    prisma.investmentMemo.findMany({
      where: { workspaceId: ctx.workspaceId },
      select: { id: true, title: true, company: { select: { ticker: true } } },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.company.findMany({ select: { ticker: true, name: true }, orderBy: { ticker: 'asc' } }),
    prisma.membership.count({ where: { organizationId: ctx.organizationId, role: { in: ['PORTFOLIO_MANAGER', 'ADMIN'] } } }),
  ]);

  const weights = new Map(
    (analytics?.summary.positions ?? []).map((p) => [p.ticker, p.weight ?? null] as const),
  );

  const open = items.filter((i) => i.status === 'UNDER_REVIEW' || i.status === 'DRAFT').length;

  return (
    <>
      <PageHeader
        title="Committee"
        subtitle={
          open
            ? `${open} item${open === 1 ? '' : 's'} awaiting a decision. ${members} voting member${members === 1 ? '' : 's'} in this organisation.`
            : 'What is up for decision? Nothing is open right now.'
        }
      />
      <CommitteeBoard
        canVote={ctx.can('committee:vote')}
        canDecide={ctx.can('committee:decide')}
        canTable={ctx.can('memo:write')}
        currentUser={ctx.name}
        votingMembers={members}
        companies={companies}
        memos={memos.map((m) => ({ id: m.id, title: m.title, ticker: m.company.ticker }))}
        items={items.map((i) => {
          const m = metrics.get(i.company.ticker);
          const price = m?.price ?? null;
          return {
            id: i.id,
            title: i.title,
            status: i.status,
            proposal: i.proposal,
            recommendation: i.recommendation,
            targetPrice: i.targetPrice,
            proposedWeight: i.proposedWeight,
            currentWeight: weights.get(i.company.ticker) ?? null,
            meetingDate: i.meetingDate?.toISOString().slice(0, 10) ?? null,
            summary: i.summary,
            createdBy: i.createdBy,
            createdAt: i.createdAt.toISOString(),
            ticker: i.company.ticker,
            companyName: i.company.name,
            currency: i.company.currency as Currency,
            price,
            upside: i.targetPrice !== null && price ? i.targetPrice / price - 1 : null,
            memo: i.memo,
            votes: i.votes.map((v) => ({
              user: v.user.name, vote: v.vote, rationale: v.rationale,
              createdAt: v.createdAt.toISOString(), isMe: v.user.name === ctx.name,
            })),
            comments: i.comments.map((c) => ({
              id: c.id, user: c.user.name, body: c.body, createdAt: c.createdAt.toISOString(),
            })),
          };
        })}
      />
    </>
  );
}
