import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { getCompanyDossier } from '@/server/services/company';
import { prisma } from '@/lib/db';
import { Badge, InlineNote, Panel, PanelHeader } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { formatDate, formatDateTime } from '@/lib/finance/format';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} — News & timeline` };
}

const SENTIMENT_TONE = { POSITIVE: 'pos', NEGATIVE: 'neg', NEUTRAL: 'neutral' } as const;
const IMPACT_TONE = { HIGH: 'warn', MEDIUM: 'outline', LOW: 'outline' } as const;

export default async function NewsPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const ctx = await requireContext();
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) notFound();

  const [notes, targetChanges, catalysts] = await Promise.all([
    prisma.researchNote.findMany({
      where: { workspaceId: ctx.workspaceId, companyId: dossier.company.id },
      orderBy: { updatedAt: 'desc' }, include: { author: true },
    }),
    prisma.targetPriceRecord.findMany({
      where: { companyId: dossier.company.id, thesis: { workspaceId: ctx.workspaceId } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.catalyst.findMany({
      where: { companyId: dossier.company.id, thesis: { workspaceId: ctx.workspaceId } },
      orderBy: { expectedDate: 'asc' },
    }),
  ]);

  type TimelineItem = {
    date: string; kind: string; title: string; detail: string; href?: string; tone: 'pos' | 'neg' | 'neutral' | 'warn';
  };

  const timeline: TimelineItem[] = [
    ...dossier.earnings.map((e) => ({
      date: e.reportDate, kind: 'Earnings', title: `${e.label} results reported`,
      detail: 'Figures loaded into the earnings module with the consensus comparison.',
      href: `/companies/${dossier.company.ticker}/earnings?id=${e.id}`, tone: 'neutral' as const,
    })),
    ...notes.map((n) => ({
      date: n.updatedAt.toISOString().slice(0, 10), kind: 'Research', title: n.title,
      detail: `${n.status.toLowerCase()} — ${n.author.name}`,
      href: `/research/notes/${n.id}`, tone: 'neutral' as const,
    })),
    ...targetChanges.map((t) => ({
      date: t.createdAt.toISOString().slice(0, 10), kind: 'Target price',
      title: t.previousTarget === null
        ? `Coverage initiated at a target of ${t.targetPrice}`
        : `Target moved from ${t.previousTarget} to ${t.targetPrice}`,
      detail: t.reason,
      href: `/companies/${dossier.company.ticker}/thesis`,
      tone: (t.previousTarget !== null && t.targetPrice > t.previousTarget ? 'pos' : t.previousTarget !== null ? 'neg' : 'neutral') as 'pos' | 'neg' | 'neutral',
    })),
    ...catalysts.filter((c) => c.expectedDate).map((c) => ({
      date: c.expectedDate!.toISOString().slice(0, 10), kind: 'Catalyst', title: c.title,
      detail: `${c.expectedImpact.toLowerCase()} impact, ${Math.round(c.probability * 100)}% probability`,
      href: `/companies/${dossier.company.ticker}/thesis`,
      tone: (c.direction === 'POSITIVE' ? 'pos' : c.direction === 'NEGATIVE' ? 'neg' : 'warn') as 'pos' | 'neg' | 'warn',
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <Panel>
          <PanelHeader
            title="News and filings"
            subtitle="Loaded by MockNewsProvider. Headlines are simulated and are labelled as such."
          />
          <InlineNote tone="warn">
            These items are generated for demonstration. They are not real news, and the AI layer never treats them
            as evidence of a fact about the company.
          </InlineNote>
          <ul className="mt-3 space-y-3">
            {dossier.news.map((n) => (
              <li key={n.id} className="border-b border-line/60 pb-3 last:border-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone={SENTIMENT_TONE[n.sentiment as keyof typeof SENTIMENT_TONE] ?? 'neutral'}>{n.sentiment.toLowerCase()}</Badge>
                  <Badge tone={IMPACT_TONE[n.impact as keyof typeof IMPACT_TONE] ?? 'outline'}>{n.impact.toLowerCase()} impact</Badge>
                  <span className="text-2xs uppercase tracking-wider text-ink-4">{n.kind.toLowerCase()}</span>
                  <span className="ml-auto text-2xs text-ink-4">{formatDateTime(n.publishedAt)}</span>
                </div>
                <p className="mt-1.5 text-base font-medium text-ink">{n.headline}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-3">{n.summary}</p>
                <p className="mt-1 text-2xs text-ink-4">{n.source}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          title="Research timeline"
          subtitle="Everything this workspace recorded about the name, newest first."
        />
        <ol className="relative space-y-4 border-l border-line pl-4">
          {timeline.slice(0, 30).map((t, i) => (
            <li key={`${t.date}-${i}`} className="relative">
              <span className={`absolute -left-[21px] top-1 h-2 w-2 rounded-full ${
                t.tone === 'pos' ? 'bg-pos' : t.tone === 'neg' ? 'bg-neg' : t.tone === 'warn' ? 'bg-warn' : 'bg-ink-4'
              }`} />
              <div className="flex items-center gap-2">
                <span className="num text-2xs text-ink-4">{formatDate(t.date)}</span>
                <Badge tone="outline">{t.kind}</Badge>
              </div>
              {t.href ? (
                <Link href={t.href} className="mt-0.5 block text-xs font-medium text-ink hover:underline">{t.title}</Link>
              ) : (
                <p className="mt-0.5 text-xs font-medium text-ink">{t.title}</p>
              )}
              <p className="mt-0.5 text-2xs leading-relaxed text-ink-3">{t.detail}</p>
            </li>
          ))}
        </ol>
        {timeline.length === 0 ? (
          <p className="py-6 text-center text-xs text-ink-3">
            Nothing recorded yet. Write a note or a thesis and it appears here.
          </p>
        ) : null}
      </Panel>
    </div>
  );
}
