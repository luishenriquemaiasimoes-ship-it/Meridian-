import { prisma, parseJson } from '@/lib/db';
import { getCompanyDossier, buildHistoricalMultiples } from './company';
import { getComps } from './comps';
import { getMetricsMap, ratesForCurrency } from './metrics';
import { getPortfolioAnalytics } from './portfolio';
import { evaluateThesisHealth } from './alerts';
import { defaultAssumptionsFor } from './valuation';
import { calculateDcf, reverseDcf } from '@/lib/finance/dcf';
import { buildDefaultDcfAssumptions } from '@/lib/finance/modelDefaults';
import type { AiContext, CompanyContext, PortfolioContext } from '@/lib/ai/context';
import type { AiAnswer, AiContextScope } from '@/lib/ai/types';
import { getAiProvider } from '@/lib/ai/llm';
import { detectIntent, extractTicker } from '@/lib/ai/intent';
import { roicSeries } from '@/lib/finance/roic';
import { freeCashFlow, netDebtToEbitda } from '@/lib/finance/ratios';
import { isNum } from '@/lib/finance/core';
import type { DcfAssumptions } from '@/lib/finance/dcf';

/* ================================================================
   Context assembly. Everything the AI layer is allowed to see is
   gathered here, from the workspace database only.
   ================================================================ */

export async function buildCompanyContext(
  workspaceId: string,
  ticker: string,
): Promise<CompanyContext | null> {
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) return null;
  const m = dossier.metrics;

  const [comps, thesisRow, modelRow, healthList, position] = await Promise.all([
    getComps(ticker),
    prisma.investmentThesis.findFirst({
      where: { workspaceId, company: { ticker: ticker.toUpperCase() } },
      include: { catalysts: true, risks: true },
    }),
    prisma.valuationModel.findFirst({
      where: { workspaceId, company: { ticker: ticker.toUpperCase() }, kind: 'DCF' },
      orderBy: { updatedAt: 'desc' },
    }),
    evaluateThesisHealth(workspaceId),
    prisma.portfolioPosition.findFirst({
      where: { company: { ticker: ticker.toUpperCase() }, portfolio: { workspaceId } },
      include: { portfolio: true },
    }),
  ]);

  const health = healthList.find((h) => h.ticker === ticker.toUpperCase()) ?? null;

  const annuals = dossier.annuals;
  const roicByLabel = new Map(roicSeries(annuals).map((r) => [r.label, r.roic]));

  const history = annuals.map((p) => ({
    label: p.label,
    revenue: p.income.revenue,
    ebitda: p.income.ebitda,
    ebitdaMargin: isNum(p.income.ebitda) && isNum(p.income.revenue) && (p.income.revenue as number) !== 0
      ? (p.income.ebitda as number) / (p.income.revenue as number) : null,
    netIncome: p.income.netIncome,
    fcf: freeCashFlow(p),
    roic: m.bankLike ? null : roicByLabel.get(p.label) ?? null,
    netDebtToEbitda: netDebtToEbitda(p),
  }));

  const historicalMultiples = buildHistoricalMultiples(
    dossier.periods,
    dossier.prices,
    m.sharesOutstanding,
    m.bankLike,
  ).map((h) => ({
    metric: h.metric,
    label: h.label,
    current: h.stats.current,
    median5y: h.stats.median5y,
    percentileIn5y: h.stats.percentileIn5y,
    min5y: h.stats.min5y,
    max5y: h.stats.max5y,
  }));

  // The stored model if there is one, otherwise a defensible default so the
  // AI can still speak to intrinsic value rather than declining the question.
  let assumptions: DcfAssumptions | null = null;
  let dcfName = 'Default model (unsaved)';
  if (modelRow) {
    assumptions = parseJson<DcfAssumptions | null>(modelRow.assumptions, null);
    dcfName = modelRow.name;
  }
  if (!assumptions && dossier.security) {
    assumptions = buildDefaultDcfAssumptions(
      dossier.periods,
      { price: dossier.security.lastPrice, sharesOutstanding: dossier.security.sharesOutstanding, beta: dossier.security.beta ?? 1 },
      ratesForCurrency(dossier.company.currency),
    );
  }

  const dcfResult = assumptions ? calculateDcf(assumptions) : null;
  const rev = assumptions && isNum(m.price) ? reverseDcf(assumptions, m.price as number) : null;

  const latestEarnings = dossier.earnings[0] ?? null;
  const priorEarnings = dossier.earnings[1] ?? null;

  const cf = (dossier.ltm ?? annuals[annuals.length - 1])?.cashFlow ?? null;

  return {
    ticker: m.ticker,
    name: m.name,
    sector: m.sector,
    industry: m.industry,
    country: m.country,
    currency: m.currency,
    bankLike: m.bankLike,
    basisLabel: m.basisLabel,
    price: m.price,
    marketCap: m.marketCap,
    enterpriseValue: m.enterpriseValue,
    metrics: {
      revenue: m.revenue, ebitda: m.ebitda, ebit: m.ebit, netIncome: m.netIncome, eps: m.eps,
      fcf: m.fcf, cfo: m.cfo, capex: m.capex, netDebt: m.netDebt, totalDebt: m.totalDebt,
      investedCapital: m.investedCapital,
      revenueGrowth: m.revenueGrowth, ebitdaGrowth: m.ebitdaGrowth, epsGrowth: m.epsGrowth,
      fcfGrowth: m.fcfGrowth, revenueCagr3y: m.revenueCagr3y, revenueCagr5y: m.revenueCagr5y,
      grossMargin: m.grossMargin, ebitdaMargin: m.ebitdaMargin, ebitMargin: m.ebitMargin,
      netMargin: m.netMargin, fcfMargin: m.fcfMargin, fcfConversion: m.fcfConversion,
      roic: m.roic, roe: m.roe, roa: m.roa, roce: m.roce, wacc: m.wacc, roicSpread: m.roicSpread,
      nopatMargin: m.nopatMargin, capitalTurnover: m.capitalTurnover,
      netDebtToEbitda: m.netDebtToEbitda, debtToEquity: m.debtToEquity, interestCoverage: m.interestCoverage,
      capexToRevenue: m.capexToRevenue, effectiveTaxRate: m.effectiveTaxRate,
      evEbitda: m.evEbitda, evEbit: m.evEbit, evRevenue: m.evRevenue, pe: m.pe, pb: m.pb, ps: m.ps,
      fcfYield: m.fcfYield, dividendYield: m.dividendYield, earningsYield: m.earningsYield,
      dso: m.dso, dio: m.dio, dpo: m.dpo, cashConversionCycle: m.cashConversionCycle,
      return1m: m.return1m, return6m: m.return6m, return12m: m.return12m, volatility: m.volatility, beta: m.beta,
    },
    history,
    historicalMultiples,
    peers: (comps?.peerMetrics ?? []).map((p) => ({
      ticker: p.ticker, name: p.name, evEbitda: p.evEbitda, pe: p.pe,
      ebitdaMargin: p.ebitdaMargin, roic: p.roic, revenueGrowth: p.revenueGrowth,
      netDebtToEbitda: p.netDebtToEbitda,
    })),
    peerStats: Object.fromEntries(
      Object.entries(comps?.stats ?? {}).map(([k, v]) => [
        k, { median: v.median, mean: v.mean, min: v.min, max: v.max, count: v.count },
      ]),
    ),
    thesis: thesisRow
      ? {
          recommendation: thesisRow.recommendation,
          conviction: thesisRow.conviction,
          status: thesisRow.status,
          targetPrice: thesisRow.targetPrice,
          upside: health?.upside ?? null,
          coreThesis: thesisRow.coreThesis,
          assumptionChecks: (health?.checks ?? []).map((c) => ({
            label: c.label, metricLabel: c.metricLabel, status: c.status,
            currentFormatted: c.currentFormatted, targetFormatted: c.targetFormatted,
          })),
          verdict: health?.verdict ?? 'INSUFFICIENT_DATA',
          catalysts: thesisRow.catalysts.map((c) => ({
            title: c.title,
            expectedDate: c.expectedDate?.toISOString().slice(0, 10) ?? null,
            impact: c.expectedImpact, direction: c.direction, probability: c.probability,
          })),
          risks: thesisRow.risks.map((r) => ({
            title: r.title, category: r.category, severity: r.severity, probability: r.probability,
          })),
        }
      : null,
    dcf: dcfResult && assumptions
      ? {
          name: dcfName,
          fairValuePerShare: dcfResult.fairValuePerShare,
          upside: dcfResult.upside,
          wacc: assumptions.wacc,
          terminalGrowth: assumptions.terminalGrowth,
          revenueGrowth: assumptions.revenueGrowth,
          ebitdaMargin: assumptions.ebitdaMargin,
          terminalValuePctOfEv: dcfResult.terminalValuePctOfEv,
          warnings: dcfResult.warnings,
        }
      : null,
    reverseDcf: rev
      ? {
          impliedRevenueCagr: rev.impliedRevenueCagr,
          impliedEbitdaMargin: rev.impliedEbitdaMargin,
          impliedTerminalGrowth: rev.impliedTerminalGrowth,
          impliedExitMultiple: rev.impliedExitMultiple,
        }
      : null,
    latestEarnings: latestEarnings
      ? {
          label: latestEarnings.label, reportDate: latestEarnings.reportDate,
          revenue: latestEarnings.revenue, ebitda: latestEarnings.ebitda, eps: latestEarnings.eps,
          consensusRevenue: latestEarnings.consensusRevenue,
          consensusEbitda: latestEarnings.consensusEbitda,
          consensusEps: latestEarnings.consensusEps,
          guidance: latestEarnings.guidance,
        }
      : null,
    priorEarnings: priorEarnings
      ? { label: priorEarnings.label, revenue: priorEarnings.revenue, ebitda: priorEarnings.ebitda, eps: priorEarnings.eps }
      : null,
    portfolioPosition: position
      ? await (async () => {
          const analytics = await getPortfolioAnalytics(workspaceId, position.portfolioId);
          const row = analytics?.summary.positions.find((p) => p.ticker === ticker.toUpperCase());
          const contribution = analytics?.contributions.find((c) => c.key === ticker.toUpperCase());
          return {
            portfolioName: position.portfolio.name,
            weight: row?.weight ?? null,
            marketValue: row?.marketValue ?? null,
            unrealizedPnlPct: row?.unrealizedPnlPct ?? null,
            contribution: contribution?.contribution ?? null,
          };
        })()
      : null,
    dataQuality: {
      missingFields: m.dataQuality.missingFields,
      isSimulated: m.dataQuality.isSimulated,
      source: m.dataQuality.source,
      balanceSheetBalances: m.dataQuality.balanceSheetBalances,
    },
    capitalAllocation: cf
      ? {
          capex: cf.capex, dividends: cf.dividendsPaid, buybacks: cf.buybacks,
          acquisitions: cf.acquisitions, debtIssued: cf.debtIssued, debtRepaid: cf.debtRepaid, cfo: cf.cfo,
        }
      : null,
  };
}

export async function buildPortfolioContext(workspaceId: string, portfolioId?: string): Promise<PortfolioContext | null> {
  const analytics = await getPortfolioAnalytics(workspaceId, portfolioId);
  if (!analytics) return null;
  const health = await evaluateThesisHealth(workspaceId);
  const healthByTicker = new Map(health.map((h) => [h.ticker, h]));

  const contributions = analytics.contributions;
  return {
    name: analytics.portfolio.name,
    baseCurrency: analytics.portfolio.baseCurrency,
    totalValue: analytics.summary.totalMarketValue,
    positionCount: analytics.summary.positionCount,
    cash: analytics.summary.cash,
    unrealizedPnlPct: analytics.summary.unrealizedPnlPct,
    topContributors: contributions.slice(0, 5).map((c) => ({
      ticker: c.key, name: c.label, contribution: c.contribution, weight: c.weight,
    })),
    topDetractors: contributions.slice(-5).reverse().map((c) => ({
      ticker: c.key, name: c.label, contribution: c.contribution, weight: c.weight,
    })),
    exposures: analytics.exposures.sector.map((e) => ({ key: e.key, weight: e.weight })),
    concentration: {
      top5: analytics.concentration.top5,
      hhi: analytics.concentration.hhi,
      effectiveNumberOfPositions: analytics.concentration.effectiveNumberOfPositions,
    },
    lookThrough: analytics.lookThrough.map((l) => ({
      label: l.label, value: l.value, benchmark: l.benchmark, coverage: l.coverage,
    })),
    performance: {
      totalReturn: analytics.performance.totalReturn,
      annualizedReturn: analytics.performance.annualizedReturn,
      volatility: analytics.performance.volatility,
      sharpe: analytics.performance.sharpe,
      maxDrawdown: analytics.performance.maxDrawdown,
      var95: analytics.performance.var95,
    },
    benchmarkPerformance: {
      totalReturn: analytics.benchmarkPerformance.totalReturn,
      annualizedReturn: analytics.benchmarkPerformance.annualizedReturn,
    },
    periodReturns: analytics.periodReturns,
    holdings: analytics.summary.positions.map((p) => {
      const m = analytics.metricsByTicker.get(p.ticker);
      const h = healthByTicker.get(p.ticker);
      return {
        ticker: p.ticker, name: p.name, weight: p.weight, upsideToTarget: p.upsideToTarget,
        evEbitda: m?.evEbitda ?? null, pe: m?.pe ?? null, roic: m?.roic ?? null,
        roicSpread: m?.roicSpread ?? null,
        thesisStatus: h?.status ?? null, thesisVerdict: h?.verdict ?? null,
      };
    }),
    riskContribution: analytics.riskContribution.rows.map((r) => ({ key: r.key, contributionPct: r.contributionPct })),
  };
}

export async function buildAiContext(
  workspaceId: string,
  question: string,
  scope: AiContextScope,
): Promise<AiContext> {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  const metrics = await getMetricsMap();
  const universe = Array.from(metrics.keys());

  // A ticker named in the question always wins over the page the user is on.
  const named = extractTicker(question, universe);
  const scopeTicker = scope.type === 'COMPANY' || scope.type === 'DCF' ? scope.id ?? null : null;
  const ticker = named ?? scopeTicker;

  const { intent } = detectIntent(question);
  const wantsPortfolio =
    intent === 'PORTFOLIO_REVIEW' || intent === 'PORTFOLIO_RISK' || scope.type === 'PORTFOLIO' || !ticker;

  const [company, portfolio] = await Promise.all([
    ticker ? buildCompanyContext(workspaceId, ticker) : Promise.resolve(null),
    wantsPortfolio ? buildPortfolioContext(workspaceId) : Promise.resolve(null),
  ]);

  return {
    workspaceName: workspace?.name ?? 'Workspace',
    baseCurrency: workspace?.baseCurrency ?? 'BRL',
    asOf: new Date().toISOString().slice(0, 10),
    company,
    portfolio,
    universeSize: universe.length,
    isDemoData: workspace?.isDemo ?? false,
  };
}

/* ------------------------------ Conversation ------------------------------ */

export interface AskResult {
  answer: AiAnswer;
  conversationId: string;
}

export async function ask(params: {
  workspaceId: string;
  userId: string;
  question: string;
  scope: AiContextScope;
  conversationId?: string | null;
}): Promise<AskResult> {
  const { workspaceId, userId, question, scope } = params;

  let conversationId = params.conversationId ?? null;
  let history: { role: 'user' | 'assistant'; content: string }[] = [];

  if (conversationId) {
    const existing = await prisma.aiConversation.findFirst({ where: { id: conversationId, workspaceId } });
    if (!existing) conversationId = null;
    else {
      const msgs = await prisma.aiMessage.findMany({
        where: { conversationId }, orderBy: { createdAt: 'asc' }, take: 20,
      });
      history = msgs.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    }
  }

  if (!conversationId) {
    const created = await prisma.aiConversation.create({
      data: {
        workspaceId, userId,
        title: question.slice(0, 80),
        contextType: scope.type,
        contextId: scope.id ?? null,
      },
    });
    conversationId = created.id;
  }

  const context = await buildAiContext(workspaceId, question, scope);
  const provider = getAiProvider();
  const answer = await provider.answer(question, context, history);

  await prisma.aiMessage.create({ data: { conversationId, role: 'user', content: question } });
  await prisma.aiMessage.create({
    data: {
      conversationId, role: 'assistant',
      content: answer.headline,
      blocks: JSON.stringify(answer.blocks),
      provider: answer.provider,
    },
  });
  await prisma.aiConversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });

  return { answer, conversationId };
}

export async function listConversations(workspaceId: string, userId: string, limit = 25) {
  const rows = await prisma.aiConversation.findMany({
    where: { workspaceId, userId },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  });
  return rows.map((r) => ({
    id: r.id, title: r.title, contextType: r.contextType, contextId: r.contextId,
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function getConversation(workspaceId: string, conversationId: string) {
  const conv = await prisma.aiConversation.findFirst({ where: { id: conversationId, workspaceId } });
  if (!conv) return null;
  const messages = await prisma.aiMessage.findMany({
    where: { conversationId }, orderBy: { createdAt: 'asc' },
  });
  return {
    id: conv.id,
    title: conv.title,
    contextType: conv.contextType,
    contextId: conv.contextId,
    messages: messages.map((m) => ({
      id: m.id, role: m.role, content: m.content,
      blocks: parseJson<{ kind: string; text: string; sources: string[] }[]>(m.blocks, []),
      provider: m.provider, createdAt: m.createdAt.toISOString(),
    })),
  };
}

export { defaultAssumptionsFor };
