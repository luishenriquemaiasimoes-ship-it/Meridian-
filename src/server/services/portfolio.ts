import { prisma } from '@/lib/db';
import { getMetricsMap, type CompanyMetrics } from './metrics';
import {
  buildPortfolio, concentration, contributionByPosition, exposureBy,
  groupContribution, rebalance, weightedMetric,
  type PortfolioSummary, type PositionInput, type RebalanceTarget,
} from '@/lib/finance/portfolio';
import {
  applyScenario, correlationMatrix, performanceStats, riskContribution,
  simpleReturns, trackingStats, type ScenarioShock,
} from '@/lib/finance/risk';
import { loadPriceHistory } from '../repositories/company';
import { isNum } from '@/lib/finance/core';

export interface PortfolioRecord {
  id: string;
  name: string;
  description: string | null;
  baseCurrency: string;
  cash: number;
  benchmarkCode: string;
  inceptionDate: string;
  isModel: boolean;
}

export async function listPortfolios(workspaceId: string): Promise<PortfolioRecord[]> {
  const rows = await prisma.portfolio.findMany({ where: { workspaceId }, orderBy: { createdAt: 'asc' } });
  return rows.map((p) => ({
    id: p.id, name: p.name, description: p.description, baseCurrency: p.baseCurrency,
    cash: p.cash, benchmarkCode: p.benchmarkCode,
    inceptionDate: p.inceptionDate.toISOString().slice(0, 10), isModel: p.isModel,
  }));
}

/**
 * FX conversion into the portfolio base currency. Rates come from the market
 * indicator table so that a converted figure can always be traced to a source.
 */
async function fxTable(base: string): Promise<Record<string, number>> {
  const indicators = await prisma.marketIndicator.findMany({ where: { category: 'FX' } });
  const usdBrl = indicators.find((i) => i.code === 'USDBRL')?.value ?? 5.18;
  const eurBrl = indicators.find((i) => i.code === 'EURBRL')?.value ?? 5.98;
  const toBrl: Record<string, number> = { BRL: 1, USD: usdBrl, EUR: eurBrl, GBP: eurBrl * 1.17 };
  if (base === 'BRL') return toBrl;
  const divisor = toBrl[base] ?? 1;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(toBrl)) out[k] = v / divisor;
  return out;
}

export interface PortfolioAnalytics {
  portfolio: PortfolioRecord;
  summary: PortfolioSummary;
  contributions: ReturnType<typeof contributionByPosition>;
  sectorContribution: ReturnType<typeof groupContribution>;
  countryContribution: ReturnType<typeof groupContribution>;
  exposures: {
    sector: ReturnType<typeof exposureBy>;
    country: ReturnType<typeof exposureBy>;
    currency: ReturnType<typeof exposureBy>;
    marketCap: ReturnType<typeof exposureBy>;
  };
  concentration: ReturnType<typeof concentration>;
  lookThrough: { key: string; label: string; value: number | null; coverage: number; format: string; benchmark: number | null }[];
  navSeries: { date: string; value: number; unitValue: number; benchmark: number }[];
  performance: ReturnType<typeof performanceStats>;
  benchmarkPerformance: ReturnType<typeof performanceStats>;
  tracking: ReturnType<typeof trackingStats>;
  riskContribution: ReturnType<typeof riskContribution>;
  correlation: ReturnType<typeof correlationMatrix>;
  periodReturns: { label: string; portfolio: number | null; benchmark: number | null; active: number | null }[];
  fxRates: Record<string, number>;
  metricsByTicker: Map<string, CompanyMetrics>;
}

function periodReturn(series: number[], days: number, dates: string[]): number | null {
  if (series.length < 2) return null;
  const lastDate = new Date(dates[dates.length - 1]).getTime();
  let startIdx = 0;
  for (let i = 0; i < dates.length; i++) {
    if (new Date(dates[i]).getTime() >= lastDate - days * 86400000) { startIdx = i; break; }
  }
  const start = series[startIdx];
  if (!start) return null;
  return series[series.length - 1] / start - 1;
}

export async function getPortfolioAnalytics(
  workspaceId: string,
  portfolioId?: string,
): Promise<PortfolioAnalytics | null> {
  const portfolioRow = portfolioId
    ? await prisma.portfolio.findFirst({ where: { id: portfolioId, workspaceId } })
    : await prisma.portfolio.findFirst({ where: { workspaceId }, orderBy: { createdAt: 'asc' } });
  if (!portfolioRow) return null;

  const [positions, navPoints, metrics] = await Promise.all([
    prisma.portfolioPosition.findMany({ where: { portfolioId: portfolioRow.id }, include: { company: true } }),
    prisma.portfolioValuationPoint.findMany({ where: { portfolioId: portfolioRow.id }, orderBy: { date: 'asc' } }),
    getMetricsMap(),
  ]);

  const fx = await fxTable(portfolioRow.baseCurrency);

  const inputs: PositionInput[] = positions.map((p) => {
    const m = metrics.get(p.company.ticker);
    return {
      id: p.id,
      ticker: p.company.ticker,
      name: p.company.name,
      sector: p.company.sector,
      industry: p.company.industry,
      country: p.company.country,
      currency: p.company.currency,
      quantity: p.quantity,
      averagePrice: p.averagePrice,
      currentPrice: m?.price ?? null,
      previousClose: m?.previousClose ?? null,
      fxRate: fx[p.company.currency] ?? 1,
      pe: m?.pe ?? null,
      evEbitda: m?.evEbitda ?? null,
      fcfYield: m?.fcfYield ?? null,
      roic: m?.roic ?? null,
      revenueGrowth: m?.revenueGrowth ?? null,
      ebitdaMargin: m?.ebitdaMargin ?? null,
      netDebtToEbitda: m?.netDebtToEbitda ?? null,
      dividendYield: m?.dividendYield ?? null,
      beta: m?.beta ?? null,
      marketCap: isNum(m?.marketCap) ? (m!.marketCap as number) * (fx[p.company.currency] ?? 1) : null,
    };
  });

  const summary = buildPortfolio(inputs, portfolioRow.cash, portfolioRow.baseCurrency);
  const contributions = contributionByPosition(summary);

  // `value` is the book's net asset value and `unitValue` the time-weighted unit
  // price. Performance and risk are measured on the unit price so that a
  // subscription or redemption never reads as a return; the NAV is what the
  // screen shows as the size of the book.
  const navSeries = navPoints.map((p) => ({
    date: p.date.toISOString().slice(0, 10),
    value: p.value,
    unitValue: p.unitValue,
    benchmark: p.benchmark,
  }));
  const navValues = navSeries.map((p) => p.unitValue);
  const benchValues = navSeries.map((p) => p.benchmark);
  const dates = navSeries.map((p) => p.date);

  const portReturns = simpleReturns(navValues);
  const benchReturns = simpleReturns(benchValues);

  // Daily return series per holding, for risk contribution and correlation.
  const returnSeries: Record<string, number[]> = {};
  for (const p of positions) {
    const company = await prisma.company.findUnique({ where: { id: p.companyId }, include: { security: true } });
    if (!company?.security) continue;
    const bars = await loadPriceHistory(company.security.id);
    returnSeries[company.ticker] = simpleReturns(bars.map((b) => b.close)).slice(-260);
  }
  const weights: Record<string, number> = {};
  for (const pos of summary.positions) if (isNum(pos.weight)) weights[pos.ticker] = pos.weight as number;

  const lookThroughDefs = [
    { key: 'pe', label: 'Weighted P/E', format: 'multiple' },
    { key: 'evEbitda', label: 'Weighted EV/EBITDA', format: 'multiple' },
    { key: 'fcfYield', label: 'Weighted FCF yield', format: 'percent' },
    { key: 'roic', label: 'Weighted ROIC', format: 'percent' },
    { key: 'revenueGrowth', label: 'Revenue growth', format: 'percent' },
    { key: 'ebitdaMargin', label: 'EBITDA margin', format: 'percent' },
    { key: 'netDebtToEbitda', label: 'Net debt/EBITDA', format: 'multiple' },
    { key: 'dividendYield', label: 'Dividend yield', format: 'percent' },
    { key: 'beta', label: 'Weighted beta', format: 'ratio' },
  ] as const;

  // Benchmark look-through: the median of the local universe for the portfolio's market.
  const universe = Array.from(metrics.values());
  const benchmarkUniverse = universe.filter((m) =>
    portfolioRow.benchmarkCode === 'IBOV' ? m.country === 'Brazil' : m.country !== 'Brazil',
  );
  const medianOf = (key: string): number | null => {
    const xs = benchmarkUniverse
      .map((m) => (m as unknown as Record<string, number | null>)[key])
      .filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
      .sort((a, b) => a - b);
    if (!xs.length) return null;
    const mid = Math.floor(xs.length / 2);
    return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
  };

  return {
    portfolio: {
      id: portfolioRow.id, name: portfolioRow.name, description: portfolioRow.description,
      baseCurrency: portfolioRow.baseCurrency, cash: portfolioRow.cash,
      benchmarkCode: portfolioRow.benchmarkCode,
      inceptionDate: portfolioRow.inceptionDate.toISOString().slice(0, 10),
      isModel: portfolioRow.isModel,
    },
    summary,
    contributions,
    sectorContribution: groupContribution(contributions, summary.positions, 'sector'),
    countryContribution: groupContribution(contributions, summary.positions, 'country'),
    exposures: {
      sector: exposureBy(summary, 'sector'),
      country: exposureBy(summary, 'country'),
      currency: exposureBy(summary, 'currency'),
      marketCap: exposureBy(summary, 'marketCapBucket'),
    },
    concentration: concentration(summary),
    lookThrough: lookThroughDefs.map((d) => {
      const r = weightedMetric(summary, d.key);
      return { key: d.key, label: d.label, value: r.value, coverage: r.coverage, format: d.format, benchmark: medianOf(d.key) };
    }),
    navSeries,
    performance: performanceStats(navValues, 0.1065, 252),
    benchmarkPerformance: performanceStats(benchValues, 0.1065, 252),
    tracking: trackingStats(portReturns, benchReturns, 252),
    riskContribution: riskContribution(weights, returnSeries, 252),
    correlation: correlationMatrix(returnSeries),
    periodReturns: [
      { label: '1M', days: 30 }, { label: '3M', days: 91 }, { label: '6M', days: 182 },
      { label: '1Y', days: 365 }, { label: '3Y', days: 1095 },
    ].map((p) => {
      const pr = periodReturn(navValues, p.days, dates);
      const br = periodReturn(benchValues, p.days, dates);
      return {
        label: p.label, portfolio: pr, benchmark: br,
        active: isNum(pr) && isNum(br) ? (pr as number) - (br as number) : null,
      };
    }).concat([
      (() => {
        const year = dates[dates.length - 1]?.slice(0, 4);
        const idx = dates.findIndex((dt) => dt.slice(0, 4) === year);
        const pr = idx >= 0 && navValues[idx] ? navValues[navValues.length - 1] / navValues[idx] - 1 : null;
        const br = idx >= 0 && benchValues[idx] ? benchValues[benchValues.length - 1] / benchValues[idx] - 1 : null;
        return { label: 'YTD', portfolio: pr, benchmark: br, active: isNum(pr) && isNum(br) ? pr - br : null };
      })(),
      (() => {
        const pr = navValues.length > 1 && navValues[0] ? navValues[navValues.length - 1] / navValues[0] - 1 : null;
        const br = benchValues.length > 1 && benchValues[0] ? benchValues[benchValues.length - 1] / benchValues[0] - 1 : null;
        return { label: 'Inception', portfolio: pr, benchmark: br, active: isNum(pr) && isNum(br) ? pr - br : null };
      })(),
    ]),
    fxRates: fx,
    metricsByTicker: metrics,
  };
}

export async function getRebalancePlan(workspaceId: string, portfolioId: string) {
  const analytics = await getPortfolioAnalytics(workspaceId, portfolioId);
  if (!analytics) return null;
  const targets = await prisma.rebalanceTargetRecord.findMany({ where: { portfolioId } });
  const list: RebalanceTarget[] = targets.map((t) => ({ ticker: t.ticker, targetWeight: t.targetWeight }));
  return {
    portfolio: analytics.portfolio,
    rows: rebalance(analytics.summary, list, 50),
    totalValue: analytics.summary.totalMarketValue,
    targetsDefined: list.length > 0,
  };
}

/* --------------------------- Scenario analysis --------------------------- */

export const PORTFOLIO_SCENARIOS: ScenarioShock[] = [
  {
    id: 'bull', name: 'Bull market', description: 'Risk appetite returns; cyclicals and high-beta names lead.',
    sectorImpact: { Materials: 0.14, Energy: 0.12, Financials: 0.11, Industrials: 0.13, 'Information Technology': 0.16, 'Consumer Discretionary': 0.12, 'Communication Services': 0.13 },
    defaultImpact: 0.09, marketMove: 0.04,
  },
  {
    id: 'base', name: 'Base case', description: 'Rates drift lower, growth holds, no shock.',
    sectorImpact: {}, defaultImpact: 0.02, marketMove: 0.01,
  },
  {
    id: 'recession', name: 'Recession', description: 'Demand contracts; earnings estimates are cut across cyclicals.',
    sectorImpact: { Materials: -0.24, Energy: -0.21, 'Consumer Discretionary': -0.22, Industrials: -0.19, Financials: -0.16, 'Consumer Staples': -0.06, Utilities: -0.05, 'Health Care': -0.08 },
    defaultImpact: -0.15, marketMove: -0.06,
  },
  {
    id: 'inflation', name: 'Inflation shock', description: 'Input costs jump; margin compression for price-takers, benefit for producers.',
    sectorImpact: { Materials: 0.08, Energy: 0.11, 'Consumer Staples': -0.09, 'Consumer Discretionary': -0.13, 'Information Technology': -0.10, Utilities: -0.07, Financials: -0.03 },
    defaultImpact: -0.06, marketMove: -0.03,
  },
  {
    id: 'rates', name: 'Selic +300 bps', description: 'Policy rate rises sharply; long-duration equity de-rates.',
    sectorImpact: { Financials: 0.03, Utilities: -0.11, 'Information Technology': -0.14, 'Consumer Discretionary': -0.12, Industrials: -0.09, 'Real Estate': -0.15 },
    defaultImpact: -0.07, marketMove: -0.04,
  },
  {
    id: 'commodity', name: 'Commodity shock', description: 'Iron ore and oil fall 25%; producers take the impact.',
    sectorImpact: { Materials: -0.26, Energy: -0.23, Industrials: -0.05, 'Consumer Discretionary': 0.03, 'Consumer Staples': 0.02 },
    defaultImpact: -0.02, marketMove: -0.02,
  },
];

export async function runPortfolioScenarios(workspaceId: string, portfolioId?: string) {
  const analytics = await getPortfolioAnalytics(workspaceId, portfolioId);
  if (!analytics) return null;
  const positions = analytics.summary.positions.map((p) => ({
    ticker: p.ticker, name: p.name, sector: p.sector, weight: p.weight, beta: p.beta,
  }));
  return {
    portfolio: analytics.portfolio,
    totalValue: analytics.summary.totalMarketValue,
    scenarios: PORTFOLIO_SCENARIOS.map((s) => applyScenario(positions, s)),
  };
}
