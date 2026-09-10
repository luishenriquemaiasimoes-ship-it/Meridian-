import type { Currency } from '@/lib/finance/types';

/**
 * The context pack: the complete, structured view of what the workspace knows
 * about the subject of a question. The reasoning layer may use nothing else,
 * which is what makes "Data unavailable" a real answer rather than a fallback.
 */
export interface CompanyContext {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  country: string;
  currency: Currency;
  bankLike: boolean;
  basisLabel: string;
  price: number | null;
  marketCap: number | null;
  enterpriseValue: number | null;
  metrics: Record<string, number | null>;
  history: {
    label: string;
    revenue: number | null;
    ebitda: number | null;
    ebitdaMargin: number | null;
    netIncome: number | null;
    fcf: number | null;
    roic: number | null;
    netDebtToEbitda: number | null;
  }[];
  historicalMultiples: {
    metric: string;
    label: string;
    current: number | null;
    median5y: number | null;
    percentileIn5y: number | null;
    min5y: number | null;
    max5y: number | null;
  }[];
  peers: {
    ticker: string;
    name: string;
    evEbitda: number | null;
    pe: number | null;
    ebitdaMargin: number | null;
    roic: number | null;
    revenueGrowth: number | null;
    netDebtToEbitda: number | null;
  }[];
  peerStats: Record<string, { median: number | null; mean: number | null; min: number | null; max: number | null; count: number }>;
  thesis: {
    recommendation: string;
    conviction: string;
    status: string;
    targetPrice: number | null;
    upside: number | null;
    coreThesis: string;
    assumptionChecks: { label: string; metricLabel: string; status: string; currentFormatted: string; targetFormatted: string }[];
    verdict: string;
    catalysts: { title: string; expectedDate: string | null; impact: string; direction: string; probability: number }[];
    risks: { title: string; category: string; severity: string; probability: number }[];
  } | null;
  dcf: {
    name: string;
    fairValuePerShare: number | null;
    upside: number | null;
    wacc: number;
    terminalGrowth: number;
    revenueGrowth: number[];
    ebitdaMargin: number[];
    terminalValuePctOfEv: number | null;
    warnings: string[];
  } | null;
  reverseDcf: {
    impliedRevenueCagr: number | null;
    impliedEbitdaMargin: number | null;
    impliedTerminalGrowth: number | null;
    impliedExitMultiple: number | null;
  } | null;
  latestEarnings: {
    label: string;
    reportDate: string;
    revenue: number | null;
    ebitda: number | null;
    eps: number | null;
    consensusRevenue: number | null;
    consensusEbitda: number | null;
    consensusEps: number | null;
    guidance: Record<string, string> | null;
  } | null;
  priorEarnings: {
    label: string;
    revenue: number | null;
    ebitda: number | null;
    eps: number | null;
  } | null;
  portfolioPosition: {
    portfolioName: string;
    weight: number | null;
    marketValue: number | null;
    unrealizedPnlPct: number | null;
    contribution: number | null;
  } | null;
  dataQuality: {
    missingFields: string[];
    isSimulated: boolean;
    source: string;
    balanceSheetBalances: boolean;
  };
  capitalAllocation: {
    capex: number | null;
    dividends: number | null;
    buybacks: number | null;
    acquisitions: number | null;
    debtIssued: number | null;
    debtRepaid: number | null;
    cfo: number | null;
  } | null;
}

export interface PortfolioContext {
  name: string;
  baseCurrency: string;
  totalValue: number | null;
  positionCount: number;
  cash: number;
  unrealizedPnlPct: number | null;
  topContributors: { ticker: string; name: string; contribution: number | null; weight: number | null }[];
  topDetractors: { ticker: string; name: string; contribution: number | null; weight: number | null }[];
  exposures: { key: string; weight: number }[];
  concentration: { top5: number | null; hhi: number | null; effectiveNumberOfPositions: number | null };
  lookThrough: { label: string; value: number | null; benchmark: number | null; coverage: number }[];
  performance: { totalReturn: number | null; annualizedReturn: number | null; volatility: number | null; sharpe: number | null; maxDrawdown: number | null; var95: number | null };
  benchmarkPerformance: { totalReturn: number | null; annualizedReturn: number | null };
  periodReturns: { label: string; portfolio: number | null; benchmark: number | null; active: number | null }[];
  holdings: {
    ticker: string; name: string; weight: number | null; upsideToTarget: number | null;
    evEbitda: number | null; pe: number | null; roic: number | null; roicSpread: number | null;
    thesisStatus: string | null; thesisVerdict: string | null;
  }[];
  riskContribution: { key: string; contributionPct: number | null }[];
}

export interface AiContext {
  workspaceName: string;
  baseCurrency: string;
  asOf: string;
  company: CompanyContext | null;
  portfolio: PortfolioContext | null;
  universeSize: number;
  isDemoData: boolean;
}
