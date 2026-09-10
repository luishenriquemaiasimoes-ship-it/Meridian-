import { prisma, parseJson } from '@/lib/db';
import {
  findCompanyByTicker, loadPeerTickers, loadPriceHistory, loadStatements, mapCompany,
  type CompanyRecord, type SecurityRecord,
} from '../repositories/company';
import { computeCompanyMetrics, getMetricsMap, ratesForCurrency, type CompanyMetrics } from './metrics';
import { computeLTM, findQoQComparable, findYoYComparable, normalizePeriod } from '@/lib/finance/statements';
import { historicalMultipleStats, type HistoricalMultiplePoint } from '@/lib/finance/comps';
import { netDebt } from '@/lib/finance/ratios';
import { roicSeries } from '@/lib/finance/roic';
import { isNum, safeDiv } from '@/lib/finance/core';
import type { FinancialPeriod, NormalizationAdjustment } from '@/lib/finance/types';

export interface SegmentRow {
  segment: string;
  kind: 'BUSINESS' | 'GEOGRAPHY';
  fiscalYear: number;
  revenue: number | null;
  ebitda: number | null;
  capex: number | null;
  assets: number | null;
  marketShare: number | null;
}

export interface CompanyDossier {
  company: CompanyRecord;
  security: SecurityRecord | null;
  metrics: CompanyMetrics;
  periods: FinancialPeriod[];
  annuals: FinancialPeriod[];
  quarters: FinancialPeriod[];
  ltm: FinancialPeriod | null;
  prices: { date: string; open: number; high: number; low: number; close: number; volume: number }[];
  peers: string[];
  segments: SegmentRow[];
  management: { name: string; role: string; since: number | null; background: string | null }[];
  ownership: { holder: string; kind: string; stake: number }[];
  estimates: { fiscalYear: number; fiscalQuarter: number | null; metric: string; value: number; analysts: number; source: string }[];
  news: { id: string; headline: string; summary: string; source: string; publishedAt: string; sentiment: string; impact: string; kind: string }[];
  earnings: EarningsRow[];
}

export interface EarningsRow {
  id: string;
  label: string;
  fiscalYear: number;
  fiscalQuarter: number;
  reportDate: string;
  status: string;
  revenue: number | null;
  ebitda: number | null;
  ebit: number | null;
  netIncome: number | null;
  eps: number | null;
  fcf: number | null;
  consensusRevenue: number | null;
  consensusEbitda: number | null;
  consensusEps: number | null;
  guidance: Record<string, string> | null;
  commentary: string | null;
}

export async function getCompanyDossier(ticker: string): Promise<CompanyDossier | null> {
  const row = await findCompanyByTicker(ticker);
  if (!row) return null;
  const company = mapCompany(row);
  const security: SecurityRecord | null = row.security
    ? {
        id: row.security.id,
        ticker: row.security.ticker,
        currency: row.security.currency as CompanyRecord['currency'],
        sharesOutstanding: row.security.sharesOutstanding,
        freeFloat: row.security.freeFloat,
        lastPrice: row.security.lastPrice,
        previousClose: row.security.previousClose,
        dayHigh: row.security.dayHigh,
        dayLow: row.security.dayLow,
        week52High: row.security.week52High,
        week52Low: row.security.week52Low,
        averageVolume: row.security.averageVolume,
        beta: row.security.beta,
        priceAsOf: row.security.priceAsOf.toISOString(),
      }
    : null;

  const [periods, prices, peers, segmentRows, mgmt, own, est, news, earnings] = await Promise.all([
    loadStatements(company.id),
    security ? loadPriceHistory(security.id) : Promise.resolve([]),
    loadPeerTickers(company.id),
    prisma.segmentDatum.findMany({ where: { companyId: company.id }, orderBy: [{ fiscalYear: 'asc' }, { segment: 'asc' }] }),
    prisma.managementRecord.findMany({ where: { companyId: company.id } }),
    prisma.ownershipRecord.findMany({ where: { companyId: company.id }, orderBy: { stake: 'desc' } }),
    prisma.estimate.findMany({ where: { companyId: company.id }, orderBy: [{ fiscalYear: 'asc' }] }),
    prisma.newsItem.findMany({ where: { companyId: company.id }, orderBy: { publishedAt: 'desc' }, take: 20 }),
    prisma.earningsEvent.findMany({ where: { companyId: company.id }, orderBy: { reportDate: 'desc' } }),
  ]);

  const annuals = periods.filter((p) => p.periodType === 'FY');
  const quarters = periods.filter((p) => p.periodType === 'Q');

  return {
    company,
    security,
    metrics: computeCompanyMetrics({
      company, security, periods, prices, rates: ratesForCurrency(company.currency),
    }),
    periods,
    annuals,
    quarters,
    ltm: computeLTM(quarters),
    prices,
    peers,
    segments: segmentRows.map((s) => ({
      segment: s.segment, kind: s.kind as 'BUSINESS' | 'GEOGRAPHY', fiscalYear: s.fiscalYear,
      revenue: s.revenue, ebitda: s.ebitda, capex: s.capex, assets: s.assets, marketShare: s.marketShare,
    })),
    management: mgmt.map((m) => ({ name: m.name, role: m.role, since: m.since, background: m.background })),
    ownership: own.map((o) => ({ holder: o.holder, kind: o.kind, stake: o.stake })),
    estimates: est.map((e) => ({
      fiscalYear: e.fiscalYear, fiscalQuarter: e.fiscalQuarter, metric: e.metric,
      value: e.value, analysts: e.analysts, source: e.source,
    })),
    news: news.map((n) => ({
      id: n.id, headline: n.headline, summary: n.summary, source: n.source,
      publishedAt: n.publishedAt.toISOString(), sentiment: n.sentiment, impact: n.impact, kind: n.kind,
    })),
    earnings: earnings.map((e) => ({
      id: e.id, label: e.label, fiscalYear: e.fiscalYear, fiscalQuarter: e.fiscalQuarter,
      reportDate: e.reportDate.toISOString().slice(0, 10), status: e.status,
      revenue: e.revenue, ebitda: e.ebitda, ebit: e.ebit, netIncome: e.netIncome,
      eps: e.eps, fcf: e.fcf, consensusRevenue: e.consensusRevenue,
      consensusEbitda: e.consensusEbitda, consensusEps: e.consensusEps,
      guidance: parseJson<Record<string, string> | null>(e.guidance, null),
      commentary: e.commentary,
    })),
  };
}

/* --------------------------- Historical multiples --------------------------- */

export interface HistoricalMultipleSeries {
  metric: 'evEbitda' | 'pe' | 'ps' | 'fcfYield' | 'pb';
  label: string;
  points: HistoricalMultiplePoint[];
  stats: ReturnType<typeof historicalMultipleStats>;
}

/**
 * Rebuilds the multiple at each point in the price history by pairing the price
 * with the trailing fundamentals reported at that date — never with today's
 * fundamentals, which would misstate the historical range.
 */
export function buildHistoricalMultiples(
  periods: FinancialPeriod[],
  prices: { date: string; close: number }[],
  shares: number | null,
  bankLike: boolean,
): HistoricalMultipleSeries[] {
  const quarters = periods.filter((p) => p.periodType === 'Q').sort((a, b) => a.endDate.localeCompare(b.endDate));
  const annuals = periods.filter((p) => p.periodType === 'FY').sort((a, b) => a.endDate.localeCompare(b.endDate));
  if (!isNum(shares) || !prices.length) return [];

  // Build the trailing-twelve-month fundamentals available at each date.
  interface Snap { available: string; ebitda: number | null; netIncome: number | null; revenue: number | null; equity: number | null; netDebt: number | null; fcf: number | null }
  const snaps: Snap[] = [];

  for (let i = 3; i < quarters.length; i++) {
    const window = quarters.slice(i - 3, i + 1);
    const ltm = computeLTM(window);
    if (!ltm) continue;
    // Assume the figures become public roughly 40 days after period end.
    const available = new Date(new Date(`${window[3].endDate}T00:00:00Z`).getTime() + 40 * 86400000)
      .toISOString().slice(0, 10);
    snaps.push({
      available,
      ebitda: ltm.income.ebitda,
      netIncome: ltm.income.netIncome,
      revenue: ltm.income.revenue,
      equity: ltm.balance.totalEquity,
      netDebt: netDebt(ltm.balance),
      fcf: (ltm.cashFlow.cfo ?? 0) + (ltm.cashFlow.capex ?? 0),
    });
  }
  for (const a of annuals) {
    const available = new Date(new Date(`${a.endDate}T00:00:00Z`).getTime() + 60 * 86400000)
      .toISOString().slice(0, 10);
    snaps.push({
      available,
      ebitda: a.income.ebitda, netIncome: a.income.netIncome, revenue: a.income.revenue,
      equity: a.balance.totalEquity, netDebt: netDebt(a.balance),
      fcf: (a.cashFlow.cfo ?? 0) + (a.cashFlow.capex ?? 0),
    });
  }
  snaps.sort((x, y) => x.available.localeCompare(y.available));
  if (!snaps.length) return [];

  const series: Record<string, HistoricalMultiplePoint[]> = { evEbitda: [], pe: [], ps: [], fcfYield: [], pb: [] };
  let snapIdx = 0;
  // Sample weekly to keep the chart readable and the payload small.
  const sampled = prices.filter((_, i) => i % 5 === 0 || i === prices.length - 1);

  for (const bar of sampled) {
    while (snapIdx + 1 < snaps.length && snaps[snapIdx + 1].available <= bar.date) snapIdx++;
    const snap = snaps[snapIdx];
    if (snap.available > bar.date) continue;
    const mc = bar.close * (shares as number);
    const ev = isNum(snap.netDebt) ? mc + (snap.netDebt as number) : null;
    series.evEbitda.push({
      date: bar.date,
      value: bankLike || !isNum(snap.ebitda) || (snap.ebitda as number) <= 0 ? null : safeDiv(ev, snap.ebitda),
    });
    series.pe.push({
      date: bar.date,
      value: isNum(snap.netIncome) && (snap.netIncome as number) > 0 ? safeDiv(mc, snap.netIncome) : null,
    });
    series.ps.push({ date: bar.date, value: safeDiv(mc, snap.revenue) });
    series.fcfYield.push({ date: bar.date, value: safeDiv(snap.fcf, mc) });
    series.pb.push({
      date: bar.date,
      value: isNum(snap.equity) && (snap.equity as number) > 0 ? safeDiv(mc, snap.equity) : null,
    });
  }

  const labels: Record<string, string> = {
    evEbitda: 'EV / EBITDA', pe: 'P / E', ps: 'P / Sales', fcfYield: 'FCF yield', pb: 'P / Book',
  };
  const keys: HistoricalMultipleSeries['metric'][] = bankLike
    ? ['pe', 'pb', 'ps', 'fcfYield']
    : ['evEbitda', 'pe', 'ps', 'fcfYield', 'pb'];

  return keys.map((metric) => ({
    metric,
    label: labels[metric],
    points: series[metric],
    stats: historicalMultipleStats(series[metric]),
  }));
}

/* ---------------------------- Normalization ---------------------------- */

export async function getNormalizationAdjustments(
  workspaceId: string,
  companyId: string,
): Promise<NormalizationAdjustment[]> {
  const rows = await prisma.normalizationAdjustment.findMany({
    where: { workspaceId, companyId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((r) => ({
    id: r.id,
    periodLabel: r.periodLabel,
    lineItem: r.lineItem as NormalizationAdjustment['lineItem'],
    category: r.category as NormalizationAdjustment['category'],
    amount: r.amount,
    rationale: r.rationale,
    author: r.authorName,
    createdAt: r.createdAt.toISOString(),
  }));
}

export { computeLTM, findQoQComparable, findYoYComparable, normalizePeriod, roicSeries, getMetricsMap };
