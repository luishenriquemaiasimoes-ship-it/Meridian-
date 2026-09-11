import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { getCompanyDossier } from '@/server/services/company';
import { evaluateThesisHealth } from '@/server/services/alerts';
import { defaultAssumptionsFor } from '@/server/services/valuation';
import { getFactorProfile } from '@/server/services/screener';
import { prisma, parseJson } from '@/lib/db';
import { calculateDcf } from '@/lib/finance/dcf';
import { deriveScenarioSet, runScenarios } from '@/lib/finance/scenarios';
import { ThesisWorkbench } from './thesis-workbench';
import type { Currency } from '@/lib/finance/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} — Investment thesis` };
}

export default async function ThesisPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const ctx = await requireContext();
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) notFound();

  const [thesis, health, targetHistory, model] = await Promise.all([
    prisma.investmentThesis.findFirst({
      where: { workspaceId: ctx.workspaceId, companyId: dossier.company.id },
      include: { catalysts: { orderBy: { expectedDate: 'asc' } }, risks: true },
    }),
    evaluateThesisHealth(ctx.workspaceId),
    prisma.targetPriceRecord.findMany({
      where: { companyId: dossier.company.id, thesis: { workspaceId: ctx.workspaceId } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.valuationModel.findFirst({
      where: { workspaceId: ctx.workspaceId, companyId: dossier.company.id, kind: 'DCF' },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  const thesisHealth = health.find((h) => h.ticker === dossier.company.ticker) ?? null;

  const assumptions = model
    ? parseJson(model.assumptions, await defaultAssumptionsFor(ticker))
    : await defaultAssumptionsFor(ticker);

  const scenarioAnalysis = assumptions
    ? runScenarios(deriveScenarioSet(assumptions), dossier.metrics.price)
    : null;
  const baseResult = assumptions ? calculateDcf(assumptions) : null;

  const factorProfile = await getFactorProfile(dossier.company.ticker, {
    upside: thesisHealth?.upside ?? baseResult?.upside ?? null,
    catalystCount: thesis?.catalysts.length ?? 0,
    catalystProbabilityAvg: thesis?.catalysts.length
      ? thesis.catalysts.reduce((s, c) => s + c.probability, 0) / thesis.catalysts.length
      : null,
    riskCount: thesis?.risks.length ?? 0,
  });

  return (
    <ThesisWorkbench
      ticker={dossier.company.ticker}
      companyId={dossier.company.id}
      companyName={dossier.company.name}
      currency={dossier.company.currency as Currency}
      currentPrice={dossier.metrics.price}
      modelFairValue={baseResult?.fairValuePerShare ?? null}
      canEdit={ctx.can('thesis:write')}
      thesis={thesis ? {
        id: thesis.id,
        recommendation: thesis.recommendation,
        targetPrice: thesis.targetPrice,
        timeHorizonMonths: thesis.timeHorizonMonths,
        conviction: thesis.conviction,
        status: thesis.status,
        coreThesis: thesis.coreThesis,
        bullCase: thesis.bullCase,
        baseCase: thesis.baseCase,
        bearCase: thesis.bearCase,
        growthDrivers: parseJson<string[]>(thesis.growthDrivers, []),
        moat: parseJson<string[]>(thesis.moat, []),
        assumptions: parseJson<{ label: string; metric: string; comparator: 'GTE' | 'LTE'; target: number; unit?: string }[]>(thesis.assumptions, []),
        authorName: thesis.authorName,
        updatedAt: thesis.updatedAt.toISOString(),
      } : null}
      catalysts={(thesis?.catalysts ?? []).map((c) => ({
        id: c.id, title: c.title, kind: c.kind,
        expectedDate: c.expectedDate?.toISOString().slice(0, 10) ?? null,
        expectedImpact: c.expectedImpact, direction: c.direction,
        probability: c.probability, status: c.status, notes: c.notes,
      }))}
      risks={(thesis?.risks ?? []).map((r) => ({
        id: r.id, title: r.title, category: r.category, severity: r.severity,
        probability: r.probability, mitigation: r.mitigation,
      }))}
      health={thesisHealth}
      targetHistory={targetHistory.map((t) => ({
        id: t.id, targetPrice: t.targetPrice, previousTarget: t.previousTarget,
        recommendation: t.recommendation, previousRecommendation: t.previousRecommendation,
        reason: t.reason, author: t.authorName, createdAt: t.createdAt.toISOString(),
      }))}
      scenarios={scenarioAnalysis ? {
        expectedValue: scenarioAnalysis.expectedValue,
        expectedUpside: scenarioAnalysis.expectedUpside,
        riskReward: scenarioAnalysis.riskReward,
        rows: scenarioAnalysis.scenarios.map((s) => ({
          key: s.key, label: s.label, probability: s.probability,
          fairValue: s.fairValue, upside: s.upside,
        })),
      } : null}
      factorScores={factorProfile ? {
        total: factorProfile.score.total,
        coverage: factorProfile.score.coverage,
        components: factorProfile.score.components.map((c) => ({
          key: c.key, label: c.label, score: c.score, weight: c.weight, basis: c.basis,
        })),
        factors: factorProfile.factorScores.map((f) => ({ factor: f.factor, label: f.label, score: f.score, coverage: f.coverage })),
      } : null}
    />
  );
}
