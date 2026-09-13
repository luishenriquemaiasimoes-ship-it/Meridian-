import { memo, DEFAULT_TTL_MS } from '../cache';
import {
  listCompanyRecords, loadPriceHistory, loadStatements,
  type CompanyRecord, type SecurityRecord,
} from '../repositories/company';
import { isBankLike, isPropertyLike } from '@/lib/data-providers/mock/blueprints';
import { cagr, growth, isNum, safeDiv } from '@/lib/finance/core';
import { computeLTM, findYoYComparable } from '@/lib/finance/statements';
import {
  bookValuePerShare, dividendPerShare, freeCashFlow, fundamentalSnapshot,
  netDebt, type FundamentalSnapshot,
} from '@/lib/finance/ratios';
import { calculateRoic, investedCapital } from '@/lib/finance/roic';
import { buildWacc } from '@/lib/finance/wacc';
import { earningsStability } from '@/lib/finance/factors';
import { simpleReturns, volatility } from '@/lib/finance/risk';
import type { Currency, FinancialPeriod } from '@/lib/finance/types';

/**
 * The single computation of a company's fundamentals. Screener, comparables,
 * factor scores, portfolio look-through and the AI layer all read this, so a
 * number can never disagree with itself between two screens.
 */
export interface CompanyMetrics {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  country: string;
  currency: Currency;
  exchange: string;
  themes: string[];
  bankLike: boolean;

  price: number | null;
  previousClose: number | null;
  dailyChange: number | null;
  dailyChangePct: number | null;
  week52High: number | null;
  week52Low: number | null;
  beta: number | null;
  sharesOutstanding: number | null;
  marketCap: number | null;
  enterpriseValue: number | null;
  averageVolume: number | null;
  priceAsOf: string | null;

  /** Period the fundamentals were taken from. */
  basisLabel: string;
  basisEndDate: string;
  usedLtm: boolean;

  revenue: number | null;
  ebitda: number | null;
  ebit: number | null;
  netIncome: number | null;
  eps: number | null;
  fcf: number | null;
  cfo: number | null;
  capex: number | null;
  da: number | null;
  totalDebt: number | null;
  netDebt: number | null;
  equityBookValue: number | null;
  investedCapital: number | null;
  dividendsPaid: number | null;

  revenueGrowth: number | null;
  ebitdaGrowth: number | null;
  ebitGrowth: number | null;
  epsGrowth: number | null;
  fcfGrowth: number | null;
  revenueCagr3y: number | null;
  revenueCagr5y: number | null;
  ebitdaCagr3y: number | null;

  grossMargin: number | null;
  ebitdaMargin: number | null;
  ebitMargin: number | null;
  netMargin: number | null;
  fcfMargin: number | null;

  roic: number | null;
  /** ROIC on capital that excludes goodwill and acquired intangibles. */
  roicExGoodwill: number | null;
  /** Goodwill and acquired intangibles as a share of invested capital. */
  acquiredShareOfCapital: number | null;
  roicNote: string | null;
  roe: number | null;
  roa: number | null;
  roce: number | null;
  nopatMargin: number | null;
  capitalTurnover: number | null;
  wacc: number | null;
  costOfEquity: number | null;
  costOfDebt: number | null;
  roicSpread: number | null;

  assetTurnover: number | null;
  inventoryTurnover: number | null;
  receivablesTurnover: number | null;
  dso: number | null;
  dio: number | null;
  dpo: number | null;
  cashConversionCycle: number | null;

  netDebtToEbitda: number | null;
  debtToEquity: number | null;
  interestCoverage: number | null;
  fcfConversion: number | null;
  capexToRevenue: number | null;
  effectiveTaxRate: number | null;

  evRevenue: number | null;
  evEbitda: number | null;
  evEbit: number | null;
  pe: number | null;
  pb: number | null;
  ps: number | null;
  fcfYield: number | null;
  earningsYield: number | null;
  dividendYield: number | null;
  bookValuePerShare: number | null;

  return1m: number | null;
  return3m: number | null;
  return6m: number | null;
  return12m: number | null;
  returnYtd: number | null;
  volatility: number | null;
  earningsStability: number | null;

  snapshot: FundamentalSnapshot;
  dataQuality: DataQualityFlags;
}

export interface DataQualityFlags {
  balanceSheetBalances: boolean;
  missingFields: string[];
  staleDays: number | null;
  annualPeriods: number;
  quarterlyPeriods: number;
  hasLtm: boolean;
  source: string;
  isSimulated: boolean;
}

export interface WorkspaceRates {
  riskFreeRate: number;
  equityRiskPremium: number;
  statutoryTaxRate: number;
}

const DEFAULT_RATES: Record<'BRL' | 'OTHER', WorkspaceRates> = {
  BRL: { riskFreeRate: 0.105, equityRiskPremium: 0.055, statutoryTaxRate: 0.34 },
  OTHER: { riskFreeRate: 0.042, equityRiskPremium: 0.05, statutoryTaxRate: 0.21 },
};

export function ratesForCurrency(currency: string): WorkspaceRates {
  return currency === 'BRL' ? DEFAULT_RATES.BRL : DEFAULT_RATES.OTHER;
}

function pctReturn(closes: { date: string; close: number }[], daysBack: number): number | null {
  if (closes.length < 2) return null;
  const last = closes[closes.length - 1];
  const targetTime = new Date(last.date).getTime() - daysBack * 86400000;
  let candidate: { date: string; close: number } | null = null;
  for (const bar of closes) {
    if (new Date(bar.date).getTime() <= targetTime) candidate = bar;
    else break;
  }
  if (!candidate || candidate.close === 0) return null;
  return last.close / candidate.close - 1;
}

function ytdReturn(closes: { date: string; close: number }[]): number | null {
  if (!closes.length) return null;
  const last = closes[closes.length - 1];
  const year = last.date.slice(0, 4);
  const first = closes.find((b) => b.date.slice(0, 4) === year);
  if (!first || first.close === 0) return null;
  return last.close / first.close - 1;
}

export interface MetricsInputs {
  company: CompanyRecord;
  security: SecurityRecord | null;
  periods: FinancialPeriod[];
  prices: { date: string; close: number }[];
  rates?: WorkspaceRates;
  asOf?: string;
}

/** Pure computation — given a company's raw data, produce the metric bundle. */
export function computeCompanyMetrics(input: MetricsInputs): CompanyMetrics {
  const { company, security, periods, prices } = input;
  const rates = input.rates ?? ratesForCurrency(company.currency);
  const annuals = periods.filter((p) => p.periodType === 'FY').sort((a, b) => a.endDate.localeCompare(b.endDate));
  const quarters = periods.filter((p) => p.periodType === 'Q').sort((a, b) => a.endDate.localeCompare(b.endDate));
  const ltm = computeLTM(quarters);
  const latestAnnual = annuals[annuals.length - 1] ?? null;
  const priorAnnual = annuals[annuals.length - 2] ?? null;
  const basis = ltm ?? latestAnnual;

  const bankLike = isBankLike(company.industry);
  // Separate from bankLike on purpose: a property owner keeps its EV multiples,
  // which are standard for the sector. It is only the ROIC block that misleads.
  const propertyLike = isPropertyLike(company.industry);
  const roicNotMeaningful = bankLike || propertyLike;

  const price = security?.lastPrice ?? null;
  const previousClose = security?.previousClose ?? null;
  const shares = security?.sharesOutstanding ?? basis?.income.dilutedShares ?? null;
  const marketCap = isNum(price) && isNum(shares) ? (price as number) * (shares as number) : null;
  const nd = basis ? netDebt(basis.balance) : null;
  const minority = basis?.balance.minorityInterestEquity ?? 0;
  const enterpriseValue = isNum(marketCap) && isNum(nd) ? (marketCap as number) + (nd as number) + minority : null;

  // No basis and no annual means no statements are loaded; the snapshot then
  // reports nulls rather than being handed an object cast into the shape.
  const snapshot = basis
    ? fundamentalSnapshot(basis, priorAnnual)
    : fundamentalSnapshot(annuals[0] ?? null, null);

  const roicResult = basis ? calculateRoic(basis, priorAnnual, rates.statutoryTaxRate) : null;

  const grossDebt = snapshot.totalDebt ?? 0;
  const observedKd = basis && isNum(basis.income.financialResult) && (basis.income.financialResult as number) < 0 && grossDebt > 0
    ? Math.abs(basis.income.financialResult as number) / grossDebt
    : rates.riskFreeRate + 0.02;
  const costOfDebt = observedKd > 0.005 && observedKd < 0.5 ? observedKd : rates.riskFreeRate + 0.02;

  const waccResult = buildWacc({
    riskFreeRate: rates.riskFreeRate,
    beta: security?.beta ?? 1,
    equityRiskPremium: rates.equityRiskPremium,
    costOfDebt,
    taxRate: rates.statutoryTaxRate,
    marketValueEquity: marketCap ?? 0,
    marketValueDebt: grossDebt,
  });

  // Growth is measured against the same period type to stay like-for-like.
  const yoyBasis = basis && basis.periodType === 'LTM'
    ? computeLTM(quarters.slice(0, Math.max(0, quarters.length - 4)))
    : priorAnnual;

  const g = (pick: (p: FinancialPeriod) => number | null) =>
    basis && yoyBasis ? growth(pick(basis), pick(yoyBasis)) : null;

  const revenueSeries = annuals.map((p) => p.income.revenue);
  const ebitdaSeries = annuals.map((p) => p.income.ebitda);
  const revenueCagr = (years: number) => {
    if (annuals.length <= years) return null;
    return cagr(revenueSeries[revenueSeries.length - 1], revenueSeries[revenueSeries.length - 1 - years], years);
  };

  const fcf = basis ? freeCashFlow(basis) : null;
  const priorFcf = yoyBasis ? freeCashFlow(yoyBasis) : null;

  const equityExMinority = isNum(basis?.balance.totalEquity)
    ? (basis!.balance.totalEquity as number) - (isNum(minority) ? minority : 0)
    : null;

  const closes = prices.map((p) => ({ date: p.date, close: p.close }));
  const returns = simpleReturns(closes.map((c) => c.close));

  const missingFields: string[] = [];
  if (!isNum(basis?.income.revenue)) missingFields.push('revenue');
  if (!isNum(basis?.income.ebitda)) missingFields.push('ebitda');
  if (!isNum(basis?.cashFlow.cfo)) missingFields.push('cfo');
  if (!isNum(basis?.balance.totalEquity)) missingFields.push('totalEquity');
  if (!isNum(price)) missingFields.push('price');

  const assets = basis?.balance.totalAssets;
  const liabilities = basis?.balance.totalLiabilities;
  const equity = basis?.balance.totalEquity;
  const balances =
    isNum(assets) && isNum(liabilities) && isNum(equity)
      ? Math.abs((assets as number) - ((liabilities as number) + (equity as number))) / Math.abs(assets as number) < 0.005
      : false;

  const asOfDate = input.asOf ? new Date(input.asOf) : new Date();
  const staleDays = security?.priceAsOf
    ? Math.max(0, Math.round((asOfDate.getTime() - new Date(security.priceAsOf).getTime()) / 86400000))
    : null;

  const dividendsPaid = basis?.cashFlow.dividendsPaid ?? null;

  return {
    id: company.id,
    ticker: company.ticker,
    name: company.name,
    sector: company.sector,
    industry: company.industry,
    country: company.country,
    currency: company.currency,
    exchange: company.exchange,
    themes: company.themes,
    bankLike,

    price,
    previousClose,
    dailyChange: isNum(price) && isNum(previousClose) ? (price as number) - (previousClose as number) : null,
    dailyChangePct: isNum(price) && isNum(previousClose) && (previousClose as number) !== 0
      ? (price as number) / (previousClose as number) - 1
      : null,
    week52High: security?.week52High ?? null,
    week52Low: security?.week52Low ?? null,
    beta: security?.beta ?? null,
    sharesOutstanding: shares,
    marketCap,
    enterpriseValue,
    averageVolume: security?.averageVolume ?? null,
    priceAsOf: security?.priceAsOf ?? null,

    basisLabel: basis?.label ?? '—',
    basisEndDate: basis?.endDate ?? '',
    usedLtm: !!ltm,

    revenue: basis?.income.revenue ?? null,
    ebitda: basis?.income.ebitda ?? null,
    ebit: basis?.income.ebit ?? null,
    netIncome: basis?.income.netIncome ?? null,
    eps: basis?.income.eps ?? null,
    fcf,
    cfo: basis?.cashFlow.cfo ?? null,
    capex: basis?.cashFlow.capex ?? null,
    da: basis?.income.da ?? null,
    totalDebt: snapshot.totalDebt,
    netDebt: nd,
    equityBookValue: equityExMinority,
    investedCapital: basis ? investedCapital(basis.balance) : null,
    dividendsPaid,

    revenueGrowth: g((p) => p.income.revenue),
    ebitdaGrowth: g((p) => p.income.ebitda),
    ebitGrowth: g((p) => p.income.ebit),
    epsGrowth: g((p) => p.income.eps),
    fcfGrowth: growth(fcf, priorFcf),
    revenueCagr3y: revenueCagr(3),
    revenueCagr5y: revenueCagr(5),
    ebitdaCagr3y: annuals.length > 3
      ? cagr(ebitdaSeries[ebitdaSeries.length - 1], ebitdaSeries[ebitdaSeries.length - 4], 3)
      : null,

    grossMargin: snapshot.grossMargin,
    ebitdaMargin: snapshot.ebitdaMargin,
    ebitMargin: snapshot.ebitMargin,
    netMargin: snapshot.netMargin,
    fcfMargin: snapshot.fcfMargin,

    // Invested capital is not a meaningful denominator for a bank: its
    // "operating assets" are the loan book funded by deposits.
    roic: roicNotMeaningful ? null : roicResult?.roic ?? null,
    roicExGoodwill: roicNotMeaningful ? null : roicResult?.roicExGoodwill ?? null,
    acquiredShareOfCapital: roicNotMeaningful ? null : roicResult?.acquiredShareOfCapital ?? null,
    roicNote: bankLike
      ? 'ROIC is not meaningful for a deposit-funded institution — return on equity is used instead.'
      : propertyLike
        ? 'ROIC understates a property owner: EBIT is charged depreciation on buildings that hold value, and invested capital carries them at depreciated book rather than market. Funds from operations and the cap-rate spread are the measures the sector uses.'
        : null,
    roe: snapshot.roe,
    roa: snapshot.roa,
    roce: roicNotMeaningful ? null : snapshot.roce,
    nopatMargin: roicNotMeaningful ? null : roicResult?.nopatMargin ?? null,
    capitalTurnover: roicNotMeaningful ? null : roicResult?.capitalTurnover ?? null,
    wacc: waccResult.wacc,
    costOfEquity: waccResult.impliedCostOfEquity,
    costOfDebt: waccResult.costOfDebt,
    roicSpread: roicNotMeaningful || !isNum(roicResult?.roic) || !isNum(waccResult.wacc)
      ? null
      : (roicResult!.roic as number) - (waccResult.wacc as number),

    assetTurnover: snapshot.assetTurnover,
    inventoryTurnover: snapshot.inventoryTurnover,
    receivablesTurnover: snapshot.receivablesTurnover,
    dso: snapshot.dso,
    dio: snapshot.dio,
    dpo: snapshot.dpo,
    cashConversionCycle: snapshot.cashConversionCycle,

    netDebtToEbitda: snapshot.netDebtToEbitda,
    debtToEquity: snapshot.debtToEquity,
    interestCoverage: snapshot.interestCoverage,
    fcfConversion: snapshot.fcfConversion,
    capexToRevenue: snapshot.capexToRevenue,
    effectiveTaxRate: snapshot.effectiveTaxRate,

    // Enterprise-value multiples are suppressed for banks, where the capital
    // structure is the business rather than a financing choice.
    evRevenue: bankLike ? null : safeDiv(enterpriseValue, basis?.income.revenue),
    evEbitda: bankLike || !isNum(basis?.income.ebitda) || (basis!.income.ebitda as number) <= 0
      ? null
      : safeDiv(enterpriseValue, basis!.income.ebitda),
    evEbit: bankLike || !isNum(basis?.income.ebit) || (basis!.income.ebit as number) <= 0
      ? null
      : safeDiv(enterpriseValue, basis!.income.ebit),
    pe: isNum(basis?.income.netIncome) && (basis!.income.netIncome as number) > 0
      ? safeDiv(marketCap, basis!.income.netIncome)
      : null,
    pb: isNum(equityExMinority) && (equityExMinority as number) > 0 ? safeDiv(marketCap, equityExMinority) : null,
    ps: safeDiv(marketCap, basis?.income.revenue),
    fcfYield: safeDiv(fcf, marketCap),
    earningsYield: safeDiv(basis?.income.netIncome, marketCap),
    dividendYield: safeDiv(isNum(dividendsPaid) ? Math.abs(dividendsPaid as number) : null, marketCap),
    bookValuePerShare: basis ? bookValuePerShare(basis) : null,

    return1m: pctReturn(closes, 30),
    return3m: pctReturn(closes, 91),
    return6m: pctReturn(closes, 182),
    return12m: pctReturn(closes, 365),
    returnYtd: ytdReturn(closes),
    volatility: volatility(returns, 252),
    earningsStability: earningsStability(annuals.map((p) => p.income.netIncome)),

    snapshot,
    dataQuality: {
      balanceSheetBalances: balances,
      missingFields,
      staleDays,
      annualPeriods: annuals.length,
      quarterlyPeriods: quarters.length,
      hasLtm: !!ltm,
      source: basis?.source ?? 'unknown',
      isSimulated: (basis?.source ?? '').includes('Mock'),
    },
  };
}

/** Loads and computes metrics for every company in the universe. */
export async function getUniverseMetrics(): Promise<CompanyMetrics[]> {
  return memo('universe-metrics', DEFAULT_TTL_MS, async () => {
    const companies = await listCompanyRecords();
    const out: CompanyMetrics[] = [];
    for (const c of companies) {
      const periods = await loadStatements(c.id);
      const prices = c.security ? await loadPriceHistory(c.security.id) : [];
      out.push(
        computeCompanyMetrics({
          company: c,
          security: c.security,
          periods,
          prices,
          rates: ratesForCurrency(c.currency),
        }),
      );
    }
    return out;
  });
}

export async function getMetricsFor(ticker: string): Promise<CompanyMetrics | null> {
  const all = await getUniverseMetrics();
  return all.find((m) => m.ticker === ticker.toUpperCase()) ?? null;
}

export async function getMetricsMap(): Promise<Map<string, CompanyMetrics>> {
  const all = await getUniverseMetrics();
  return new Map(all.map((m) => [m.ticker, m]));
}

export { findYoYComparable, dividendPerShare };
