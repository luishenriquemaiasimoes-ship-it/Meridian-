import type { Metadata } from 'next';
import Link from 'next/link';
import { requireContext } from '@/server/context';
import { prisma } from '@/lib/db';
import { getMetricsMap } from '@/server/services/metrics';
import { Badge, EmptyState, PageHeader, Panel, PanelHeader } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { MetricCard, Num, RecommendationBadge } from '@/components/ui/values';
import { formatDate } from '@/lib/finance/format';
import { NewMemoButton } from './new-memo-button';
import type { Currency } from '@/lib/finance/types';

export const metadata: Metadata = { title: 'Investment memos' };
export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<string, 'pos' | 'neutral' | 'warn' | 'neg'> = {
  APPROVED: 'pos', DRAFT: 'neutral', UNDER_REVIEW: 'warn', ARCHIVED: 'neutral', REJECTED: 'neg',
};

export default async function MemosPage() {
  const ctx = await requireContext();

  const [memos, companies, metrics] = await Promise.all([
    prisma.investmentMemo.findMany({
      where: { workspaceId: ctx.workspaceId },
      orderBy: { updatedAt: 'desc' },
      include: { author: true, company: true, committeeItems: { select: { id: true, status: true } } },
    }),
    prisma.company.findMany({ select: { ticker: true, name: true }, orderBy: { ticker: 'asc' } }),
    getMetricsMap(),
  ]);

  const byStatus = (s: string) => memos.filter((m) => m.status === s).length;

  return (
    <>
      <PageHeader
        title="Investment memos"
        subtitle="What am I asking the committee to approve?"
        actions={ctx.can('memo:write') ? <NewMemoButton companies={companies} /> : undefined}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Drafts" value={byStatus('DRAFT')} format="number" decimals={0} />
        <MetricCard label="Under review" value={byStatus('UNDER_REVIEW')} format="number" decimals={0} accent={byStatus('UNDER_REVIEW') > 0} />
        <MetricCard label="Approved" value={byStatus('APPROVED')} format="number" decimals={0} />
        <MetricCard label="Rejected" value={byStatus('REJECTED')} format="number" decimals={0} />
      </div>

      {memos.length === 0 ? (
        <Panel className="mt-4">
          <EmptyState
            icon={<Icon.Memo size={22} />}
            title="No memos yet"
            description="A memo is the twelve-section document the committee votes on. It pulls the thesis, the valuation models, the comparables and the risks together into one argument."
            action={ctx.can('memo:write') ? <NewMemoButton companies={companies} /> : undefined}
          />
        </Panel>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {memos.map((m) => {
            const price = metrics.get(m.company.ticker)?.price ?? null;
            const upside = m.targetPrice !== null && price ? m.targetPrice / price - 1 : null;
            return (
              <Panel key={m.id}>
                <PanelHeader
                  title={<Link href={`/memos/${m.id}`} className="font-semibold text-ink hover:text-accent">{m.title}</Link>}
                  subtitle={m.portfolioRole ?? `Prepared by ${m.author.name}`}
                  actions={<Badge tone={STATUS_TONE[m.status] ?? 'neutral'}>{m.status.replace('_', ' ').toLowerCase()}</Badge>}
                />
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-3 pb-3 sm:grid-cols-4">
                  <div>
                    <div className="label">Company</div>
                    <Link href={`/companies/${m.company.ticker}`} className="text-xs font-semibold text-ink hover:text-accent">
                      {m.company.ticker}
                    </Link>
                  </div>
                  <div>
                    <div className="label">Call</div>
                    {m.recommendation ? <RecommendationBadge value={m.recommendation} /> : <span className="text-xs text-ink-4">—</span>}
                  </div>
                  <div>
                    <div className="label">Target</div>
                    <Num value={m.targetPrice} format="currency" currency={m.company.currency as Currency} className="text-xs" />
                  </div>
                  <div>
                    <div className="label">Upside</div>
                    <Num value={upside} format="percentSigned" className="text-xs" />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-line px-3 py-2 text-2xs text-ink-4">
                  <span>Updated {formatDate(m.updatedAt)}</span>
                  {m.committeeItems.length ? (
                    <Link href="/committee" className="text-accent hover:underline">
                      On the committee agenda
                    </Link>
                  ) : (
                    <span>Not yet tabled</span>
                  )}
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </>
  );
}
