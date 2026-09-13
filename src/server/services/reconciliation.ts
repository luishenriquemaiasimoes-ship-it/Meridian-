import { prisma, parseJson } from '@/lib/db';
import { getCompanyDossier } from './company';
import { getComps } from './comps';
import {
  reconcileWithConsensus, validatePremises,
  type ConsensusReconciliation, type PremiseKey, type PremiseValidation,
} from '@/lib/finance/consensus';
import { reconcileTerminalValue, type TerminalReconciliation } from '@/lib/finance/terminalValue';
import { requiredDcfInputs, verifyInputs, type SourceKind, type VerificationReport } from '@/lib/finance/provenance';
import { calculateDcf, normalizeAssumptions, type DcfAssumptions } from '@/lib/finance/dcf';
import { getPublishedValuation } from './projection';
import type { WaccBuildInput } from '@/lib/finance/waccBuilder';
import { isNum, safeDiv } from '@/lib/finance/core';

/* ==================================================================
   Everything that checks a model against something outside it: the
   sell-side range, what the company actually reported, the other
   terminal method, and whether each input traces to a source.
   ================================================================== */

export interface ModelReconciliation {
  ticker: string;
  companyName: string;
  currency: string;
  modelId: string | null;
  modelName: string | null;
  targetPrice: number | null;
  currentPrice: number | null;
  consensus: ConsensusReconciliation;
  contributors: { contributor: string; targetPrice: number; recommendation: string | null; asOf: string; source: string }[];
  consensusNote: { rationale: string; recordedBy: string; recordedAt: string } | null;
  terminal: TerminalReconciliation;
  premises: PremiseValidation;
  verification: VerificationReport;
}

/** Turns a reported period into the ratios a DCF premise is stated in. */
function premisesFromPeriod(
  period: { label: string; income: { revenue: number | null; ebitda: number | null; ebit: number | null; da: number | null; taxes: number | null; ebt: number | null }; cashFlow: { capex: number | null } },
  priorRevenue: number | null,
): { period: string; values: Partial<Record<PremiseKey, number | null>> } {
  const rev = period.income.revenue;
  return {
    period: period.label,
    values: {
      revenueGrowth: isNum(rev) && isNum(priorRevenue) && (priorRevenue as number) !== 0
        ? (rev as number) / Math.abs(priorRevenue as number) - 1
        : null,
      ebitdaMargin: safeDiv(period.income.ebitda, rev),
      ebitMargin: safeDiv(period.income.ebit, rev),
      daPctRevenue: safeDiv(period.income.da, rev),
      capexPctRevenue: isNum(period.cashFlow.capex) ? safeDiv(Math.abs(period.cashFlow.capex as number), rev) : null,
      taxRate: safeDiv(period.income.taxes, period.income.ebt),
    },
  };
}

export async function getModelReconciliation(
  workspaceId: string,
  ticker: string,
  modelId?: string | null,
  /** Assumptions to check, when previewing an unsaved edit. */
  override?: Partial<DcfAssumptions> | null,
): Promise<ModelReconciliation | null> {
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) return null;

  // The sources belong to whichever model is actually being checked, which is
  // the one passed in or, failing that, the most recent DCF on the company.
  const [model, targetRows, comps, workspace] = await Promise.all([
    modelId
      ? prisma.valuationModel.findFirst({ where: { id: modelId, workspaceId } })
      : prisma.valuationModel.findFirst({
          where: { workspaceId, companyId: dossier.company.id, kind: 'DCF' },
          orderBy: { updatedAt: 'desc' },
        }),
    prisma.consensusTarget.findMany({
      where: { companyId: dossier.company.id },
      orderBy: { targetPrice: 'asc' },
    }),
    getComps(ticker),
    prisma.workspace.findUnique({ where: { id: workspaceId } }),
  ]);

  const sourceRows = model
    ? await prisma.inputSource.findMany({ where: { workspaceId, modelId: model.id } })
    : [];

  const stored = model ? parseJson<Partial<DcfAssumptions>>(model.assumptions, {}) : {};
  const assumptions = normalizeAssumptions({ ...stored, ...(override ?? {}) });
  const result = calculateDcf(assumptions);
  // The model target reconciled against contributed targets is the published
  // one, from the full projection. Reconciling a different model's output
  // against the street would compare the analyst's view to a number the
  // product does not quote anywhere else.
  const published = await getPublishedValuation(ticker, { workspaceId, modelId: model?.id ?? null });
  const modelTarget = published?.valuePerShare ?? null;
  const price = dossier.metrics.price;

  /* ------------------------------ Consensus ------------------------------ */
  const consensus = reconcileWithConsensus(
    modelTarget,
    targetRows.map((t) => ({ source: t.contributor, targetPrice: t.targetPrice, recommendation: t.recommendation, asOf: t.asOf.toISOString() })),
    price,
  );

  /* --------------------------- Terminal methods -------------------------- */
  const last = result.years[result.years.length - 1];
  const terminal = reconcileTerminalValue({
    finalFcff: last?.fcff ?? null,
    finalEbitda: last?.ebitda ?? null,
    wacc: assumptions.wacc,
    terminalGrowth: assumptions.terminalGrowth,
    exitMultiple: assumptions.exitMultiple,
    peerMedianExitMultiple: comps?.stats.evEbitda?.median ?? null,
    // Long-run nominal growth: the risk-free rate is the market's own estimate
    // of it, so a perpetuity above that is a company outgrowing its economy.
    longRunNominalGrowth: workspace?.riskFreeRate ?? null,
  });

  /* -------------------------- Premises vs actual ------------------------- */
  const quarters = dossier.quarters.slice(-6);
  const actuals = quarters.map((q, i) => {
    // Against the same quarter a year earlier, so seasonality does not read as growth.
    const yearAgo = dossier.quarters.find(
      (p) => p.fiscalQuarter === q.fiscalQuarter && p.fiscalYear === q.fiscalYear - 1,
    );
    return premisesFromPeriod(q, yearAgo?.income.revenue ?? (i > 0 ? quarters[i - 1].income.revenue : null));
  });

  const premises = validatePremises(
    {
      revenueGrowth: assumptions.revenueGrowth[0] ?? null,
      ebitdaMargin: assumptions.ebitdaMargin[0] ?? null,
      daPctRevenue: assumptions.daPctRevenue[0] ?? null,
      capexPctRevenue: assumptions.capexPctRevenue[0] ?? null,
      nwcPctRevenue: assumptions.nwcPctRevenue[0] ?? null,
      taxRate: assumptions.taxRate,
    },
    actuals,
  );

  /* ----------------------------- Verification ---------------------------- */
  const waccBuild = model?.waccBuild ? parseJson<WaccBuildInput | null>(model.waccBuild, null) : null;
  const verification = verifyInputs(
    requiredDcfInputs({
      wacc: assumptions.wacc,
      riskFree: waccBuild?.riskFree.value ?? null,
      equityRiskPremium: waccBuild?.equityRiskPremium.value ?? null,
      countryRiskPremium: waccBuild?.countryRiskPremium?.value ?? null,
      beta: waccBuild?.observedBeta?.value ?? dossier.metrics.beta,
      costOfDebt: waccBuild?.costOfDebt.value ?? dossier.metrics.costOfDebt,
      taxRate: assumptions.taxRate,
      marketValueEquity: waccBuild?.marketValueEquity.value ?? dossier.metrics.marketCap,
      debt: waccBuild?.debt.value ?? dossier.metrics.netDebt,
      baseRevenue: assumptions.baseRevenue,
      revenueGrowth: assumptions.revenueGrowth,
      ebitdaMargin: assumptions.ebitdaMargin,
      capexPctRevenue: assumptions.capexPctRevenue,
      nwcPctRevenue: assumptions.nwcPctRevenue,
      terminalGrowth: assumptions.terminalGrowth,
      exitMultiple: assumptions.exitMultiple,
      netDebt: assumptions.netDebt,
      sharesOutstanding: assumptions.sharesOutstanding,
    }),
    sourceRows.map((s) => ({
      path: s.path,
      label: s.label,
      kind: s.kind as SourceKind,
      reference: s.reference,
      documentId: s.documentId,
      url: s.url,
      asOf: s.asOf?.toISOString().slice(0, 10) ?? null,
      value: s.value,
      note: s.note,
      verifiedBy: s.verifiedBy,
      verifiedAt: s.verifiedAt?.toISOString() ?? null,
    })),
    new Date().toISOString().slice(0, 10),
  );

  return {
    ticker: dossier.company.ticker,
    companyName: dossier.company.name,
    currency: dossier.company.currency,
    modelId: model?.id ?? null,
    modelName: model?.name ?? null,
    targetPrice: modelTarget,
    currentPrice: price,
    consensus,
    contributors: targetRows.map((t) => ({
      contributor: t.contributor,
      targetPrice: t.targetPrice,
      recommendation: t.recommendation,
      asOf: t.asOf.toISOString().slice(0, 10),
      source: t.source,
    })),
    consensusNote: model?.consensusNote
      ? parseJson<{ rationale: string; recordedBy: string; recordedAt: string } | null>(model.consensusNote, null)
      : null,
    terminal,
    premises,
    verification,
  };
}

/** Every model in the workspace with an unverified load-bearing input. */
export async function getWorkspaceVerificationGaps(workspaceId: string) {
  const models = await prisma.valuationModel.findMany({
    where: { workspaceId },
    include: { company: { select: { ticker: true, name: true } }, sources: true },
    orderBy: { updatedAt: 'desc' },
  });

  return models.map((m) => {
    const assumptions = normalizeAssumptions(parseJson<Partial<DcfAssumptions>>(m.assumptions, {}));
    const waccBuild = m.waccBuild ? parseJson<WaccBuildInput | null>(m.waccBuild, null) : null;
    const report = verifyInputs(
      requiredDcfInputs({
        riskFree: waccBuild?.riskFree.value ?? null,
        equityRiskPremium: waccBuild?.equityRiskPremium.value ?? null,
        countryRiskPremium: waccBuild?.countryRiskPremium?.value ?? null,
        beta: waccBuild?.observedBeta?.value ?? null,
        costOfDebt: waccBuild?.costOfDebt.value ?? null,
        taxRate: assumptions.taxRate,
        marketValueEquity: waccBuild?.marketValueEquity.value ?? null,
        debt: waccBuild?.debt.value ?? null,
        baseRevenue: assumptions.baseRevenue,
        revenueGrowth: assumptions.revenueGrowth,
        ebitdaMargin: assumptions.ebitdaMargin,
        capexPctRevenue: assumptions.capexPctRevenue,
        nwcPctRevenue: assumptions.nwcPctRevenue,
        terminalGrowth: assumptions.terminalGrowth,
        exitMultiple: assumptions.exitMultiple,
        netDebt: assumptions.netDebt,
        sharesOutstanding: assumptions.sharesOutstanding,
      }),
      m.sources.map((s) => ({
        path: s.path, label: s.label, kind: s.kind as SourceKind, reference: s.reference,
        asOf: s.asOf?.toISOString().slice(0, 10) ?? null, value: s.value,
        verifiedBy: s.verifiedBy, verifiedAt: s.verifiedAt?.toISOString() ?? null,
      })),
      new Date().toISOString().slice(0, 10),
    );
    return {
      modelId: m.id,
      modelName: m.name,
      kind: m.kind,
      ticker: m.company.ticker,
      companyName: m.company.name,
      authorName: m.authorName,
      updatedAt: m.updatedAt.toISOString(),
      hasWaccBuild: !!waccBuild,
      report,
    };
  });
}
