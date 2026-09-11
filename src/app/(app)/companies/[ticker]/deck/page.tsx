import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { getCompanyDossier } from '@/server/services/company';
import { getQaPrep } from '@/server/services/qa';
import { prisma, parseJson } from '@/lib/db';
import { DeckWorkbench } from './deck-workbench';
import type { DeckRisk, DeckThesis, StressTest } from '@/lib/research/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} — Qualitative deck` };
}

export default async function DeckPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const ctx = await requireContext();
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) notFound();

  const [deck, qa] = await Promise.all([
    prisma.qualitativeDeck.findFirst({
      where: { workspaceId: ctx.workspaceId, companyId: dossier.company.id },
    }),
    getQaPrep(ctx.workspaceId, dossier.company.ticker),
  ]);

  return (
    <DeckWorkbench
      ticker={dossier.company.ticker}
      companyName={dossier.company.name}
      canEdit={ctx.can('thesis:write')}
      canGenerate={ctx.can('research:write')}
      status={deck?.status ?? 'DRAFT'}
      summary={deck?.summary ?? ''}
      authorName={deck?.authorName ?? null}
      updatedAt={deck?.updatedAt.toISOString() ?? null}
      theses={deck ? parseJson<DeckThesis[]>(deck.theses, []) : []}
      risks={deck ? parseJson<DeckRisk[]>(deck.risks, []) : []}
      stressTests={deck ? parseJson<StressTest[]>(deck.stressTests, []) : []}
      qa={qa}
    />
  );
}
