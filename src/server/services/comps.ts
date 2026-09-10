import { getUniverseMetrics, type CompanyMetrics } from './metrics';
import { loadPeerTickers } from '../repositories/company';
import { prisma, parseJson } from '@/lib/db';
import {
  computeMultiples, impliedValuation, peerStatsTable,
  type CompanyMultiples, type ImpliedBasis, type MultipleKey, type StatSummary,
} from '@/lib/finance/comps';

export const COMP_MULTIPLE_KEYS: MultipleKey[] = [
  'evRevenue', 'evEbitda', 'evEbit', 'pe', 'pb', 'ps', 'fcfYield', 'dividendYield',
];
export const COMP_OPERATING_KEYS: MultipleKey[] = [
  'revenueGrowth', 'ebitdaGrowth', 'ebitdaMargin', 'roic', 'roe', 'netDebtToEbitda',
];

function toMultipleInput(m: CompanyMetrics) {
  return computeMultiples({
    ticker: m.ticker,
    name: m.name,
    price: m.price,
    sharesOutstanding: m.sharesOutstanding,
    marketCap: m.marketCap,
    netDebt: m.netDebt,
    revenue: m.revenue,
    ebitda: m.bankLike ? null : m.ebitda,
    ebit: m.bankLike ? null : m.ebit,
    netIncome: m.netIncome,
    equityBookValue: m.equityBookValue,
    fcf: m.fcf,
    dividends: m.dividendsPaid,
    revenueGrowth: m.revenueGrowth,
    ebitdaGrowth: m.ebitdaGrowth,
    ebitdaMargin: m.ebitdaMargin,
    roic: m.roic,
    roe: m.roe,
    netDebtToEbitda: m.bankLike ? null : m.netDebtToEbitda,
    currency: m.currency,
  });
}

export interface CompsResult {
  anchor: CompanyMultiples;
  anchorMetrics: CompanyMetrics;
  peers: CompanyMultiples[];
  peerMetrics: CompanyMetrics[];
  stats: Record<string, StatSummary>;
  multipleKeys: MultipleKey[];
  operatingKeys: MultipleKey[];
  bankLike: boolean;
  /** Where the anchor sits inside the peer distribution, per multiple. */
  anchorPercentiles: Record<string, number | null>;
  note: string | null;
}

function percentileWithin(values: (number | null)[], value: number | null): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  const xs = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (!xs.length) return null;
  const below = xs.filter((x) => x < value).length;
  const equal = xs.filter((x) => x === value).length;
  return (below + equal / 2) / xs.length;
}

export async function getComps(ticker: string, overridePeers?: string[]): Promise<CompsResult | null> {
  const all = await getUniverseMetrics();
  const anchorMetrics = all.find((m) => m.ticker === ticker.toUpperCase());
  if (!anchorMetrics) return null;

  let peerTickers = overridePeers;
  if (!peerTickers?.length) peerTickers = await loadPeerTickers(anchorMetrics.id);
  if (!peerTickers.length) {
    // Fall back to the sector cohort so the module always has something to compare.
    peerTickers = all
      .filter((m) => m.sector === anchorMetrics.sector && m.ticker !== anchorMetrics.ticker)
      .slice(0, 5)
      .map((m) => m.ticker);
  }

  const peerMetrics = peerTickers
    .map((t) => all.find((m) => m.ticker === t.toUpperCase()))
    .filter((m): m is CompanyMetrics => !!m);

  const anchor = toMultipleInput(anchorMetrics);
  const peers = peerMetrics.map(toMultipleInput);
  const cohort = [anchor, ...peers];

  const bankLike = anchorMetrics.bankLike;
  const multipleKeys: MultipleKey[] = bankLike
    ? ['pe', 'pb', 'ps', 'fcfYield', 'dividendYield']
    : COMP_MULTIPLE_KEYS;
  const operatingKeys: MultipleKey[] = bankLike
    ? ['revenueGrowth', 'ebitdaGrowth', 'roe']
    : COMP_OPERATING_KEYS;

  const stats = peerStatsTable(peers, [...multipleKeys, ...operatingKeys]);

  const anchorPercentiles: Record<string, number | null> = {};
  for (const k of multipleKeys) {
    anchorPercentiles[k] = percentileWithin(
      peers.map((p) => p[k] as number | null),
      anchor[k] as number | null,
    );
  }

  return {
    anchor,
    anchorMetrics,
    peers,
    peerMetrics,
    stats,
    multipleKeys,
    operatingKeys,
    bankLike,
    anchorPercentiles,
    note: bankLike
      ? 'Enterprise-value multiples are hidden for deposit-funded institutions: debt is an input to the business, not a financing choice, so EV/EBITDA is not comparable.'
      : null,
  };
}

export interface ImpliedRequest {
  ticker: string;
  basis: ImpliedBasis;
  /** 'median' | 'mean' | 'p25' | 'p75' | a numeric multiple. */
  multiple: number | 'median' | 'mean' | 'p25' | 'p75';
  peers?: string[];
}

export async function getImpliedValuation(request: ImpliedRequest) {
  const comps = await getComps(request.ticker, request.peers);
  if (!comps) return null;
  const keyByBasis: Record<ImpliedBasis, MultipleKey> = {
    EV_EBITDA: 'evEbitda', EV_EBIT: 'evEbit', EV_REVENUE: 'evRevenue',
    PE: 'pe', PB: 'pb', PS: 'ps',
  };
  const key = keyByBasis[request.basis];
  const stat = comps.stats[key];
  const multiple =
    typeof request.multiple === 'number'
      ? request.multiple
      : (stat?.[request.multiple] as number | null) ?? null;
  if (multiple === null) return null;

  const m = comps.anchorMetrics;
  const metricByBasis: Record<ImpliedBasis, number | null> = {
    EV_EBITDA: m.ebitda, EV_EBIT: m.ebit, EV_REVENUE: m.revenue,
    PE: m.netIncome, PB: m.equityBookValue, PS: m.revenue,
  };

  return {
    ...impliedValuation({
      basis: request.basis,
      multiple,
      metric: metricByBasis[request.basis],
      netDebt: m.netDebt,
      minorityInterest: 0,
      sharesOutstanding: m.sharesOutstanding,
      currentPrice: m.price,
    }),
    peerStat: stat,
    peerCount: comps.peers.length,
    source: typeof request.multiple === 'number' ? 'Custom multiple' : `Peer ${request.multiple}`,
  };
}

export interface PeerGroupRecord {
  id: string;
  name: string;
  anchorTicker: string | null;
  tickers: string[];
}

export async function listPeerGroups(workspaceId: string): Promise<PeerGroupRecord[]> {
  const rows = await prisma.peerGroup.findMany({ where: { workspaceId }, orderBy: { name: 'asc' } });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    anchorTicker: r.anchorTicker,
    tickers: parseJson<string[]>(r.companyIds, []),
  }));
}
