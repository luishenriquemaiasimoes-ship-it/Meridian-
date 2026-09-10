import type {
  AccountingStandard, Currency, FinancialPeriod, Unit,
} from '@/lib/finance/types';

/**
 * MERIDIAN never depends on a specific market-data vendor. Every source of
 * external data — a vendor API, a user CSV, an Excel model, manual input — is
 * expressed through this interface, so a new source is a new implementation
 * rather than a change to the product.
 */

export interface CompanyProfile {
  ticker: string;
  name: string;
  legalName?: string;
  exchange: string;
  country: string;
  sector: string;
  industry: string;
  currency: Currency;
  accountingStandard: AccountingStandard;
  fiscalYearEnd: string;
  description: string;
  businessModel: string;
  competitiveAdvantages: string[];
  website?: string;
  employees?: number;
  foundedYear?: number;
  ceo?: string;
  headquarters?: string;
  reportingUnit: Unit;
  themes: string[];
}

export interface QuoteData {
  ticker: string;
  price: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  week52High: number;
  week52Low: number;
  averageVolume: number;
  sharesOutstanding: number;   // in the same unit as reported financials
  freeFloat: number;
  beta: number;
  currency: Currency;
  asOf: string;
}

export interface PriceBarData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SegmentData {
  segment: string;
  kind: 'BUSINESS' | 'GEOGRAPHY';
  fiscalYear: number;
  revenue: number | null;
  ebitda: number | null;
  capex: number | null;
  assets: number | null;
  marketShare: number | null;
}

export interface ManagementData {
  name: string;
  role: string;
  since: number | null;
  background: string | null;
}

export interface OwnershipData {
  holder: string;
  kind: 'CONTROLLING' | 'INSTITUTIONAL' | 'RETAIL' | 'TREASURY' | 'INSIDER';
  stake: number;
}

export interface EstimateData {
  fiscalYear: number;
  fiscalQuarter: number | null;
  metric: 'revenue' | 'ebitda' | 'ebit' | 'netIncome' | 'eps';
  value: number;
  analysts: number;
  source: string;
}

export interface NewsData {
  headline: string;
  summary: string;
  source: string;
  url?: string;
  publishedAt: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  kind: 'NEWS' | 'FILING' | 'PRESENTATION' | 'TRANSCRIPT';
}

export interface EarningsData {
  label: string;
  fiscalYear: number;
  fiscalQuarter: number;
  reportDate: string;
  status: 'SCHEDULED' | 'REPORTED';
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

export interface MarketIndicatorData {
  code: string;
  name: string;
  category: 'INDEX' | 'RATE' | 'FX' | 'COMMODITY' | 'MACRO';
  value: number;
  previous: number;
  unit: string;
  currency?: string;
  asOf: string;
}

export interface BenchmarkData {
  code: string;
  name: string;
  currency: Currency;
  region: string;
  lastValue: number;
  previousValue: number;
  history: { date: string; value: number }[];
}

/**
 * The contract every data source must satisfy. Implementations return `null`
 * for anything they cannot supply — they never invent a value.
 */
export interface MarketDataProvider {
  readonly id: string;
  readonly label: string;
  readonly isMock: boolean;

  listCompanies(): Promise<CompanyProfile[]>;
  getCompany(ticker: string): Promise<CompanyProfile | null>;
  getQuote(ticker: string): Promise<QuoteData | null>;
  getHistoricalPrices(ticker: string, from?: string, to?: string): Promise<PriceBarData[]>;
  getFinancials(ticker: string): Promise<FinancialPeriod[]>;
  getSegments(ticker: string): Promise<SegmentData[]>;
  getManagement(ticker: string): Promise<ManagementData[]>;
  getOwnership(ticker: string): Promise<OwnershipData[]>;
  getEstimates(ticker: string): Promise<EstimateData[]>;
  getNews(ticker: string, limit?: number): Promise<NewsData[]>;
  getEarnings(ticker: string): Promise<EarningsData[]>;
  getPeers(ticker: string): Promise<string[]>;
  getMarketIndicators(): Promise<MarketIndicatorData[]>;
  getBenchmarks(): Promise<BenchmarkData[]>;
}

/** Every value the platform stores carries where it came from. */
export interface ProvenanceTag {
  source: string;
  asOf: string;
  isMock: boolean;
  confidence: number;
}
