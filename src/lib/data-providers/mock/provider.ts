import type { FinancialPeriod } from '@/lib/finance/types';
import type {
  BenchmarkData, CompanyProfile, EarningsData, EstimateData, ManagementData,
  MarketDataProvider, MarketIndicatorData, NewsData, OwnershipData,
  PriceBarData, QuoteData, SegmentData,
} from '../types';
import { BLUEPRINTS, findBlueprint } from './blueprints';
import {
  AS_OF, generateCompany, makeRng, MARKET_DAILY_VOL, marketShocks, PRICE_HISTORY_DAYS,
  seedFromString, tradingDays, type GeneratedCompany, type MarketFactorCode,
} from './generator';

/**
 * Deterministic in-memory provider. Produces the demo universe without any
 * network call, so MERIDIAN is fully usable on a fresh install. Every value it
 * returns is labelled as simulated by `isMock`.
 */
export class MockMarketDataProvider implements MarketDataProvider {
  readonly id = 'mock';
  readonly label = 'MockMarketDataProvider (simulated)';
  readonly isMock = true;

  private cache = new Map<string, GeneratedCompany>();

  private load(ticker: string): GeneratedCompany | null {
    const key = ticker.toUpperCase();
    const cached = this.cache.get(key);
    if (cached) return cached;
    const bp = findBlueprint(key);
    if (!bp) return null;
    const generated = generateCompany(bp);
    this.cache.set(key, generated);
    return generated;
  }

  async listCompanies(): Promise<CompanyProfile[]> {
    return BLUEPRINTS.map((b) => b.profile);
  }

  async getCompany(ticker: string): Promise<CompanyProfile | null> {
    return findBlueprint(ticker)?.profile ?? null;
  }

  async getQuote(ticker: string): Promise<QuoteData | null> {
    return this.load(ticker)?.quote ?? null;
  }

  async getHistoricalPrices(ticker: string, from?: string, to?: string): Promise<PriceBarData[]> {
    const bars = this.load(ticker)?.prices ?? [];
    return bars.filter((b) => (!from || b.date >= from) && (!to || b.date <= to));
  }

  async getFinancials(ticker: string): Promise<FinancialPeriod[]> {
    const g = this.load(ticker);
    if (!g) return [];
    return [...g.annuals, ...g.quarters];
  }

  async getSegments(ticker: string): Promise<SegmentData[]> {
    return this.load(ticker)?.segments ?? [];
  }

  async getManagement(ticker: string): Promise<ManagementData[]> {
    return this.load(ticker)?.management ?? [];
  }

  async getOwnership(ticker: string): Promise<OwnershipData[]> {
    return this.load(ticker)?.ownership ?? [];
  }

  async getEstimates(ticker: string): Promise<EstimateData[]> {
    return this.load(ticker)?.estimates ?? [];
  }

  async getNews(ticker: string, limit = 20): Promise<NewsData[]> {
    return (this.load(ticker)?.news ?? []).slice(0, limit);
  }

  async getEarnings(ticker: string): Promise<EarningsData[]> {
    return this.load(ticker)?.earnings ?? [];
  }

  async getPeers(ticker: string): Promise<string[]> {
    return findBlueprint(ticker)?.peers ?? [];
  }

  async getMarketIndicators(): Promise<MarketIndicatorData[]> {
    return MARKET_INDICATORS;
  }

  async getBenchmarks(): Promise<BenchmarkData[]> {
    return BENCHMARKS.map((b) => ({ ...b, history: buildBenchmarkHistory(b.code, b.lastValue) }));
  }
}

/* --------------------------- Macro & benchmarks --------------------------- */

export const MARKET_INDICATORS: MarketIndicatorData[] = [
  { code: 'IBOV', name: 'Ibovespa', category: 'INDEX', value: 148320, previous: 147105, unit: 'POINTS', currency: 'BRL', asOf: AS_OF },
  { code: 'SPX', name: 'S&P 500', category: 'INDEX', value: 6742.3, previous: 6718.9, unit: 'POINTS', currency: 'USD', asOf: AS_OF },
  { code: 'IXIC', name: 'Nasdaq Composite', category: 'INDEX', value: 23106.4, previous: 23241.7, unit: 'POINTS', currency: 'USD', asOf: AS_OF },
  { code: 'SMLL', name: 'Small Cap Index (Brazil)', category: 'INDEX', value: 2418.6, previous: 2402.1, unit: 'POINTS', currency: 'BRL', asOf: AS_OF },
  { code: 'USDBRL', name: 'USD / BRL', category: 'FX', value: 5.184, previous: 5.212, unit: 'RATE', currency: 'BRL', asOf: AS_OF },
  { code: 'EURBRL', name: 'EUR / BRL', category: 'FX', value: 5.976, previous: 5.994, unit: 'RATE', currency: 'BRL', asOf: AS_OF },
  { code: 'SELIC', name: 'Selic target rate', category: 'RATE', value: 10.75, previous: 11.25, unit: 'PERCENT', asOf: AS_OF },
  { code: 'CDI', name: 'CDI', category: 'RATE', value: 10.65, previous: 11.15, unit: 'PERCENT', asOf: AS_OF },
  { code: 'US10Y', name: 'US Treasury 10Y', category: 'RATE', value: 4.12, previous: 4.18, unit: 'PERCENT', asOf: AS_OF },
  { code: 'NTNB35', name: 'NTN-B 2035 real yield', category: 'RATE', value: 6.42, previous: 6.51, unit: 'PERCENT', asOf: AS_OF },
  { code: 'IPCA', name: 'IPCA (12-month)', category: 'MACRO', value: 4.18, previous: 4.32, unit: 'PERCENT', asOf: AS_OF },
  { code: 'BRENT', name: 'Brent crude', category: 'COMMODITY', value: 71.4, previous: 72.8, unit: 'USD_PER_BARREL', currency: 'USD', asOf: AS_OF },
  { code: 'IRONORE', name: 'Iron ore 62% Fe', category: 'COMMODITY', value: 98.6, previous: 96.9, unit: 'USD_PER_TONNE', currency: 'USD', asOf: AS_OF },
  { code: 'COPPER', name: 'Copper LME', category: 'COMMODITY', value: 9840, previous: 9765, unit: 'USD_PER_TONNE', currency: 'USD', asOf: AS_OF },
  { code: 'GOLD', name: 'Gold spot', category: 'COMMODITY', value: 3412.5, previous: 3398.2, unit: 'USD_PER_OUNCE', currency: 'USD', asOf: AS_OF },
  { code: 'PULP', name: 'BHKP pulp (China net)', category: 'COMMODITY', value: 562, previous: 571, unit: 'USD_PER_TONNE', currency: 'USD', asOf: AS_OF },
];

export const BENCHMARKS: Omit<BenchmarkData, 'history'>[] = [
  { code: 'IBOV', name: 'Ibovespa', currency: 'BRL', region: 'BRAZIL', lastValue: 148320, previousValue: 147105 },
  { code: 'SPX', name: 'S&P 500', currency: 'USD', region: 'US', lastValue: 6742.3, previousValue: 6718.9 },
  { code: 'IXIC', name: 'Nasdaq Composite', currency: 'USD', region: 'US', lastValue: 23106.4, previousValue: 23241.7 },
  { code: 'CDI', name: 'CDI (cash benchmark)', currency: 'BRL', region: 'BRAZIL', lastValue: 100, previousValue: 99.96 },
];

/**
 * An index is its constituents, so its drift is theirs. The capitalisation-
 * weighted price drift of the names listed on that market, divided by their
 * capitalisation-weighted beta, gives the drift of the factor those betas are
 * measured against — which keeps the index and the companies inside it from
 * telling two different stories about the same market.
 */
function indexDrift(factor: MarketFactorCode): number {
  const listed = BLUEPRINTS.filter((b) =>
    factor === 'IBOV' ? b.profile.country === 'Brazil' : b.profile.country !== 'Brazil',
  );
  let cap = 0;
  let driftWeighted = 0;
  let betaWeighted = 0;
  for (const b of listed) {
    const marketCap = b.anchors.shares * b.anchors.price;
    cap += marketCap;
    driftWeighted += marketCap * b.anchors.priceDrift;
    betaWeighted += marketCap * b.anchors.beta;
  }
  if (cap === 0) return 0;
  const beta = betaWeighted / cap;
  return beta > 0 ? driftWeighted / cap / beta : driftWeighted / cap;
}

/**
 * Three years of daily benchmark levels, ending at the quoted value. IBOV and
 * SPX are driven by the same market shocks the equity generator uses, so an
 * index and the companies listed on it move together. CDI is a cash rate and
 * has its own near-deterministic path.
 */
export function buildBenchmarkHistory(code: string, lastValue: number, days = PRICE_HISTORY_DAYS): { date: string; value: number }[] {
  const isCash = code === 'CDI';
  const factor: MarketFactorCode = code === 'IBOV' ? 'IBOV' : 'SPX';
  const vol = isCash ? 0.0002 : MARKET_DAILY_VOL[factor];
  const drift = isCash ? 0.1065 / 252 : indexDrift(factor) / 252;
  const shocks = isCash ? null : marketShocks(factor, days);
  const rng = makeRng(seedFromString(`bench-${code}`));

  const levels: number[] = [];
  let level = 1;
  for (let i = 0; i < days; i++) {
    let z: number;
    if (shocks) {
      z = shocks[i];
    } else {
      const u1 = Math.max(rng(), 1e-9);
      const u2 = rng();
      z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }
    level *= Math.exp(drift + vol * z);
    levels.push(level);
  }
  const scale = lastValue / levels[levels.length - 1];
  const dates = tradingDays(days);
  return levels.map((v, i) => ({ date: dates[i], value: Math.round(v * scale * 100) / 100 }));
}
