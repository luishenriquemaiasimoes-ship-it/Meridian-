import { prisma } from '@/lib/db';
import { getMetricsMap, type CompanyMetrics } from './metrics';
import { getPortfolioAnalytics } from './portfolio';
import { evaluateAlerts, evaluateThesisHealth, type EvaluatedAlert, type ThesisHealth } from './alerts';
import { isNum } from '@/lib/finance/core';
import { formatBps, formatMultiple, formatPercent } from '@/lib/finance/format';

export interface MarketIndicatorRow {
  code: string; name: string; category: string; value: number; previous: number;
  change: number | null; changePct: number | null; unit: string; currency: string | null; asOf: string;
}

export interface WatchRow {
  ticker: string;
  name: string;
  sector: string;
  currency: string;
  price: number | null;
  dailyChangePct: number | null;
  evEbitda: number | null;
  pe: number | null;
  roic: number | null;
  targetPrice: number | null;
  upside: number | null;
  recommendation: string | null;
  thesisVerdict: string | null;
  nextEarnings: string | null;
}

export interface AiInsight {
  id: string;
  ticker: string | null;
  severity: 'CRITICAL' | 'IMPORTANT' | 'INFORMATIONAL';
  kind: string;
  text: string;
  href: string;
  basis: string;
}

export interface DashboardData {
  indicators: MarketIndicatorRow[];
  watchlistName: string | null;
  watchRows: WatchRow[];
  portfolio: Awaited<ReturnType<typeof getPortfolioAnalytics>>;
  thesisHealth: ThesisHealth[];
  alerts: EvaluatedAlert[];
  triggeredAlerts: EvaluatedAlert[];
  recentNotes: { id: string; title: string; ticker: string | null; status: string; updatedAt: string; author: string }[];
  recentTargetChanges: { ticker: string; from: number | null; to: number; reason: string; author: string; at: string }[];
  upcomingCatalysts: { ticker: string; title: string; date: string | null; impact: string; direction: string; probability: number }[];
  recentEarnings: { ticker: string; label: string; reportDate: string; revenueSurprise: number | null; ebitdaSurprise: number | null }[];
  insights: AiInsight[];
  isDemo: boolean;
}

/**
 * Assembles the home dashboard. The insight list is derived, not written: each
 * item states a measured fact and links to the screen where it can be checked.
 */
export async function getDashboard(workspaceId: string): Promise<DashboardData> {
  const [indicatorRows, workspace, metrics, portfolio, thesisHealth, alerts] = await Promise.all([
    prisma.marketIndicator.findMany({ orderBy: { category: 'asc' } }),
    prisma.workspace.findUnique({ where: { id: workspaceId } }),
    getMetricsMap(),
    getPortfolioAnalytics(workspaceId),
    evaluateThesisHealth(workspaceId),
    evaluateAlerts(workspaceId),
  ]);

  const watchlist = await prisma.watchlist.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: 'asc' },
    include: { items: { include: { company: true } } },
  });

  const theses = await prisma.investmentThesis.findMany({
    where: { workspaceId },
    include: { company: true, catalysts: true },
  });
  const thesisByTicker = new Map(theses.map((t) => [t.company.ticker, t]));
  const healthByTicker = new Map(thesisHealth.map((h) => [h.ticker, h]));

  const upcomingEarnings = await prisma.earningsEvent.findMany({
    where: { reportDate: { gte: new Date() } },
    orderBy: { reportDate: 'asc' },
    include: { company: true },
    take: 40,
  });
  const nextEarningsByTicker = new Map<string, string>();
  for (const e of upcomingEarnings) {
    if (!nextEarningsByTicker.has(e.company.ticker)) {
      nextEarningsByTicker.set(e.company.ticker, e.reportDate.toISOString().slice(0, 10));
    }
  }

  const watchRows: WatchRow[] = (watchlist?.items ?? []).map((item) => {
    const m = metrics.get(item.company.ticker);
    const thesis = thesisByTicker.get(item.company.ticker);
    const health = healthByTicker.get(item.company.ticker);
    return {
      ticker: item.company.ticker,
      name: item.company.name,
      sector: item.company.sector,
      currency: item.company.currency,
      price: m?.price ?? null,
      dailyChangePct: m?.dailyChangePct ?? null,
      evEbitda: m?.evEbitda ?? null,
      pe: m?.pe ?? null,
      roic: m?.roic ?? null,
      targetPrice: thesis?.targetPrice ?? null,
      upside: health?.upside ?? null,
      recommendation: thesis?.recommendation ?? null,
      thesisVerdict: health?.verdict ?? null,
      nextEarnings: nextEarningsByTicker.get(item.company.ticker) ?? null,
    };
  });

  const [notes, targetChanges, catalysts, reportedEarnings] = await Promise.all([
    prisma.researchNote.findMany({
      where: { workspaceId }, orderBy: { updatedAt: 'desc' }, take: 6,
      include: { company: true, author: true },
    }),
    prisma.targetPriceRecord.findMany({
      where: { thesis: { workspaceId } }, orderBy: { createdAt: 'desc' }, take: 6,
      include: { company: true },
    }),
    prisma.catalyst.findMany({
      where: { thesis: { workspaceId }, expectedDate: { gte: new Date() }, status: 'PENDING' },
      orderBy: { expectedDate: 'asc' }, take: 8, include: { company: true },
    }),
    prisma.earningsEvent.findMany({
      where: { status: 'REPORTED' }, orderBy: { reportDate: 'desc' }, take: 8, include: { company: true },
    }),
  ]);

  const coveredTickers = new Set([
    ...watchRows.map((w) => w.ticker),
    ...(portfolio?.summary.positions ?? []).map((p) => p.ticker),
  ]);

  return {
    indicators: indicatorRows.map((i) => ({
      code: i.code, name: i.name, category: i.category, value: i.value, previous: i.previous,
      change: i.value - i.previous,
      changePct: i.previous !== 0 ? i.value / i.previous - 1 : null,
      unit: i.unit, currency: i.currency, asOf: i.asOf.toISOString().slice(0, 10),
    })),
    watchlistName: watchlist?.name ?? null,
    watchRows,
    portfolio,
    thesisHealth,
    alerts,
    triggeredAlerts: alerts.filter((a) => a.isTriggered),
    recentNotes: notes.map((n) => ({
      id: n.id, title: n.title, ticker: n.company?.ticker ?? null,
      status: n.status, updatedAt: n.updatedAt.toISOString(), author: n.author.name,
    })),
    recentTargetChanges: targetChanges
      .filter((t) => t.previousTarget !== null)
      .map((t) => ({
        ticker: t.company.ticker, from: t.previousTarget, to: t.targetPrice,
        reason: t.reason, author: t.authorName, at: t.createdAt.toISOString(),
      })),
    upcomingCatalysts: catalysts.map((c) => ({
      ticker: c.company.ticker, title: c.title,
      date: c.expectedDate?.toISOString().slice(0, 10) ?? null,
      impact: c.expectedImpact, direction: c.direction, probability: c.probability,
    })),
    recentEarnings: reportedEarnings
      .filter((e) => coveredTickers.has(e.company.ticker))
      .slice(0, 5)
      .map((e) => ({
        ticker: e.company.ticker, label: e.label,
        reportDate: e.reportDate.toISOString().slice(0, 10),
        revenueSurprise: isNum(e.revenue) && isNum(e.consensusRevenue) && (e.consensusRevenue as number) !== 0
          ? (e.revenue as number) / (e.consensusRevenue as number) - 1 : null,
        ebitdaSurprise: isNum(e.ebitda) && isNum(e.consensusEbitda) && (e.consensusEbitda as number) !== 0
          ? (e.ebitda as number) / (e.consensusEbitda as number) - 1 : null,
      })),
    insights: buildInsights(metrics, thesisHealth, alerts, portfolio, coveredTickers),
    isDemo: workspace?.isDemo ?? false,
  };
}

function buildInsights(
  metrics: Map<string, CompanyMetrics>,
  health: ThesisHealth[],
  alerts: EvaluatedAlert[],
  portfolio: Awaited<ReturnType<typeof getPortfolioAnalytics>>,
  covered: Set<string>,
): AiInsight[] {
  const out: AiInsight[] = [];

  for (const h of health) {
    if (h.verdict === 'BROKEN' || h.verdict === 'WEAKENING') {
      const breached = h.checks.filter((c) => c.status === 'BREACHED');
      out.push({
        id: `thesis-${h.ticker}`,
        ticker: h.ticker,
        severity: h.verdict === 'BROKEN' ? 'CRITICAL' : 'IMPORTANT',
        kind: 'Thesis',
        text: `${h.ticker}: ${breached.length} tracked assumption${breached.length === 1 ? ' has' : 's have'} been breached — ${breached.map((b) => `${b.metricLabel} at ${b.currentFormatted} against ${b.targetFormatted}`).join('; ')}.`,
        href: `/companies/${h.ticker}/thesis`,
        basis: 'Thesis monitor',
      });
    }
  }

  for (const a of alerts.filter((x) => x.isTriggered)) {
    out.push({
      id: `alert-${a.id}`,
      ticker: a.ticker,
      severity: a.severity as AiInsight['severity'],
      kind: 'Alert',
      text: a.message,
      href: a.ticker ? `/companies/${a.ticker}` : '/monitoring',
      basis: 'Alert engine',
    });
  }

  for (const ticker of covered) {
    const m = metrics.get(ticker);
    if (!m) continue;
    if (isNum(m.roicSpread) && (m.roicSpread as number) < 0) {
      out.push({
        id: `roic-${ticker}`, ticker, severity: 'IMPORTANT', kind: 'Returns',
        text: `${ticker} earns a return on invested capital ${formatBps(Math.abs(m.roicSpread as number))} below its cost of capital, so growth currently consumes value.`,
        href: `/companies/${ticker}/fundamentals`, basis: 'ROIC engine',
      });
    }
    if (isNum(m.netDebtToEbitda) && (m.netDebtToEbitda as number) > 3) {
      out.push({
        id: `lev-${ticker}`, ticker, severity: 'INFORMATIONAL', kind: 'Balance sheet',
        text: `${ticker} carries net debt of ${formatMultiple(m.netDebtToEbitda, 2)} EBITDA — at this level refinancing terms become a driver of equity value.`,
        href: `/companies/${ticker}/fundamentals`, basis: `FinancialStatement ${m.basisLabel}`,
      });
    }
    if (isNum(m.ebitdaMargin) && isNum(m.revenueGrowth) && (m.revenueGrowth as number) > 0.1 && (m.roicSpread ?? 0) > 0.05) {
      out.push({
        id: `compound-${ticker}`, ticker, severity: 'INFORMATIONAL', kind: 'Quality',
        text: `${ticker} is growing revenue at ${formatPercent(m.revenueGrowth)} while earning ${formatBps(m.roicSpread)} above its cost of capital — growth is adding value at the margin.`,
        href: `/companies/${ticker}/fundamentals`, basis: 'ROIC engine',
      });
    }
  }

  if (portfolio) {
    const c = portfolio.concentration;
    if (isNum(c.top5) && (c.top5 as number) > 0.55) {
      out.push({
        id: 'concentration', ticker: null, severity: 'INFORMATIONAL', kind: 'Portfolio',
        text: `The top five positions are ${formatPercent(c.top5)} of the book — single-name research errors are not diversified away at this concentration.`,
        href: '/risk', basis: 'Concentration analysis',
      });
    }
    const drift = portfolio.summary.positions.filter((p) => isNum(p.upsideToTarget) && (p.upsideToTarget as number) < 0);
    if (drift.length) {
      out.push({
        id: 'above-target', ticker: null, severity: 'IMPORTANT', kind: 'Portfolio',
        text: `${drift.length} holding${drift.length === 1 ? '' : 's'} now trade above the target price recorded in the workspace: ${drift.map((p) => p.ticker).join(', ')}.`,
        href: '/portfolio', basis: 'InvestmentThesis.targetPrice',
      });
    }
  }

  const order = { CRITICAL: 0, IMPORTANT: 1, INFORMATIONAL: 2 };
  return out.sort((a, b) => order[a.severity] - order[b.severity]).slice(0, 10);
}
