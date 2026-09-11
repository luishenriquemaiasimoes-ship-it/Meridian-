import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requirePageContext } from '@/server/context';
import { getCompanyDossier } from '@/server/services/company';
import { getComps } from '@/server/services/comps';
import { defaultAssumptionsFor, defaultSotpFor, listValuationModels } from '@/server/services/valuation';
import { prisma, parseJson } from '@/lib/db';
import { ValuationWorkbench } from './valuation-workbench';
import type { DcfAssumptions } from '@/lib/finance/dcf';
import type { ScenarioDefinition } from '@/lib/finance/scenarios';
import type { Currency } from '@/lib/finance/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} — Valuation` };
}

export default async function ValuationPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const ctx = await requirePageContext();
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) notFound();

  const [models, defaults, sotpDefaults, comps, thesis] = await Promise.all([
    listValuationModels(ctx.workspaceId, dossier.company.ticker),
    defaultAssumptionsFor(dossier.company.ticker),
    defaultSotpFor(dossier.company.ticker),
    getComps(dossier.company.ticker),
    prisma.investmentThesis.findFirst({
      where: { workspaceId: ctx.workspaceId, companyId: dossier.company.id },
    }),
  ]);

  const dcfModel = models.find((mm) => mm.kind === 'DCF') ?? null;
  const savedAssumptions = dcfModel ? (dcfModel.assumptions as unknown as DcfAssumptions) : null;
  const savedScenarios = dcfModel?.scenarios as ScenarioDefinition[] | null;

  const sotpModel = models.find((mm) => mm.kind === 'SOTP') ?? null;

  return (
    <ValuationWorkbench
      ticker={dossier.company.ticker}
      companyName={dossier.company.name}
      companyId={dossier.company.id}
      currency={dossier.company.currency as Currency}
      assumptions={savedAssumptions ?? defaults}
      isSaved={!!dcfModel}
      modelId={dcfModel?.id ?? null}
      modelName={dcfModel?.name ?? `${dossier.company.ticker} — DCF`}
      modelUpdatedAt={dcfModel?.updatedAt ?? null}
      modelAuthor={dcfModel?.authorName ?? ctx.name}
      savedScenarios={savedScenarios}
      sotpInput={(sotpModel ? parseJson(JSON.stringify(sotpModel.assumptions), sotpDefaults) : sotpDefaults) ?? null}
      sotpModelId={sotpModel?.id ?? null}
      peerMedianEvEbitda={comps?.stats.evEbitda?.median ?? null}
      peerMedianPe={comps?.stats.pe?.median ?? null}
      targetPrice={thesis?.targetPrice ?? null}
      dividendYield={dossier.metrics.dividendYield ?? 0}
      currentEvEbitda={dossier.metrics.evEbitda}
      canEdit={ctx.can('valuation:write')}
      bankLike={dossier.metrics.bankLike}
    />
  );
}
