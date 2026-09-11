import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { requirePageContext } from '@/server/context';
import { getCompanyDossier } from '@/server/services/company';
import { prisma, parseJson } from '@/lib/db';
import { Badge, Button, EmptyState, Panel, PanelHeader } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { Num, RecommendationBadge } from '@/components/ui/values';
import { formatDate } from '@/lib/finance/format';
import type { Currency } from '@/lib/finance/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} — Research` };
}

export default async function CompanyResearchPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const ctx = await requirePageContext();
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) notFound();

  const currency = dossier.company.currency as Currency;

  const [notes, memos, documents, models] = await Promise.all([
    prisma.researchNote.findMany({
      where: { workspaceId: ctx.workspaceId, companyId: dossier.company.id },
      orderBy: { updatedAt: 'desc' }, include: { author: true },
    }),
    prisma.investmentMemo.findMany({
      where: { workspaceId: ctx.workspaceId, companyId: dossier.company.id },
      orderBy: { updatedAt: 'desc' }, include: { author: true },
    }),
    prisma.document.findMany({
      where: { workspaceId: ctx.workspaceId, companyId: dossier.company.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.valuationModel.findMany({
      where: { workspaceId: ctx.workspaceId, companyId: dossier.company.id },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel padded={false}>
        <div className="flex items-center justify-between gap-2 p-3 pb-2">
          <PanelHeader title="Research notes" subtitle={`${notes.length} on ${dossier.company.ticker}`} dense />
          <Link href={`/research?new=note&ticker=${dossier.company.ticker}`}>
            <Button size="xs" icon={<Icon.Plus size={11} />}>New note</Button>
          </Link>
        </div>
        {notes.length === 0 ? (
          <EmptyState title="No notes yet" description="Write the first note on this name." icon={<Icon.Research size={20} />} />
        ) : (
          <ul className="divide-y divide-line/60">
            {notes.map((n) => (
              <li key={n.id}>
                <Link href={`/research/notes/${n.id}`} className="block px-3 py-2.5 transition hover:bg-raised">
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0 text-base font-medium text-ink">{n.title}</span>
                    <Badge tone={n.status === 'PUBLISHED' ? 'pos' : 'outline'}>{n.status.toLowerCase()}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-ink-4">
                    <span>{n.author.name}</span>
                    <span>{formatDate(n.updatedAt)}</span>
                    {n.recommendation ? <RecommendationBadge value={n.recommendation} /> : null}
                    {n.targetPrice !== null ? <Num value={n.targetPrice} format="currency" currency={currency} decimals={2} className="text-2xs" /> : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="space-y-4">
        <Panel padded={false}>
          <div className="flex items-center justify-between gap-2 p-3 pb-2">
            <PanelHeader title="Investment memos" dense />
            <Link href={`/memos?new=memo&ticker=${dossier.company.ticker}`}>
              <Button size="xs" icon={<Icon.Plus size={11} />}>New memo</Button>
            </Link>
          </div>
          {memos.length === 0 ? (
            <p className="px-3 pb-4 text-center text-xs text-ink-3">No memo written for this name.</p>
          ) : (
            <ul className="divide-y divide-line/60">
              {memos.map((m) => (
                <li key={m.id}>
                  <Link href={`/memos/${m.id}`} className="block px-3 py-2.5 transition hover:bg-raised">
                    <div className="flex items-start justify-between gap-2">
                      <span className="min-w-0 text-base font-medium text-ink">{m.title}</span>
                      <Badge tone={m.status === 'APPROVED' ? 'pos' : m.status === 'REJECTED' ? 'neg' : m.status === 'UNDER_REVIEW' ? 'warn' : 'outline'}>
                        {m.status.replace('_', ' ').toLowerCase()}
                      </Badge>
                    </div>
                    <div className="mt-1 text-2xs text-ink-4">
                      {m.author.name} · {formatDate(m.updatedAt)} · {parseJson<{ key: string }[]>(m.sections, []).length} sections
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel padded={false}>
          <div className="p-3 pb-2"><PanelHeader title="Valuation models" dense /></div>
          {models.length === 0 ? (
            <p className="px-3 pb-4 text-center text-xs text-ink-3">No saved model.</p>
          ) : (
            <ul className="divide-y divide-line/60">
              {models.map((m) => (
                <li key={m.id}>
                  <Link href={`/companies/${dossier.company.ticker}/valuation`} className="block px-3 py-2 transition hover:bg-raised">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-ink">{m.name}</span>
                      <Badge tone="outline">{m.kind}</Badge>
                    </div>
                    <span className="text-2xs text-ink-4">{m.authorName} · {formatDate(m.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel padded={false}>
          <div className="p-3 pb-2"><PanelHeader title="Documents" dense /></div>
          {documents.length === 0 ? (
            <p className="px-3 pb-4 text-center text-xs text-ink-3">Nothing uploaded for this company.</p>
          ) : (
            <ul className="divide-y divide-line/60">
              {documents.map((d) => (
                <li key={d.id}>
                  <Link href={`/library/${d.id}`} className="block px-3 py-2 transition hover:bg-raised">
                    <span className="block truncate text-xs text-ink">{d.name}</span>
                    <span className="text-2xs text-ink-4">
                      {d.kind.replace('_', ' ').toLowerCase()} · {(d.sizeBytes / 1024).toFixed(0)} KB · {d.uploadedBy}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
