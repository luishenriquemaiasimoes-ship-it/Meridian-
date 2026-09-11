import { derivePeriod, EMPTY_BALANCE, EMPTY_CASHFLOW, EMPTY_INCOME } from '@/lib/finance/statements';
import { netWorkingCapital } from '@/lib/finance/ratios';
import type { Currency, FinancialPeriod } from '@/lib/finance/types';
import type {
  EarningsData, EstimateData, ManagementData, NewsData, OwnershipData,
  PriceBarData, QuoteData, SegmentData,
} from '../types';
import { isBankLike, type CompanyBlueprint } from './blueprints';

/* ================================================================
   Deterministic generator for the demo universe.

   Everything produced here is synthetic. It is internally consistent
   (the balance sheet balances, the cash-flow statement articulates with
   the change in cash) so that the platform's calculations can be
   exercised end to end, and it is tagged as MockMarketDataProvider so
   the interface can always tell the user the data is simulated.
   ================================================================ */

export const LATEST_FISCAL_YEAR = 2025;
export const HISTORY_YEARS = 6;              // FY2020 .. FY2025
export const QUARTERS_BACK = 10;             // 1Q24 .. 2Q26
export const AS_OF = '2026-09-10';
export const PRICE_HISTORY_DAYS = 1400;      // ~5.5 years of trading days

/** Small, fast, deterministic PRNG (mulberry32). */
export function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const round2 = (v: number) => Math.round(v * 100) / 100;

interface YearFrame {
  fiscalYear: number;
  revenue: number;
  ebitdaMargin: number;
  cash: number;
  grossDebt: number;
  nwc: number;
}

/* ------------------------- Annual statements ------------------------- */

function buildYearFrames(bp: CompanyBlueprint): YearFrame[] {
  const a = bp.anchors;
  const years: number[] = [];
  for (let i = 0; i < HISTORY_YEARS; i++) years.push(LATEST_FISCAL_YEAR - HISTORY_YEARS + 1 + i);

  // Walk revenue backwards from the anchor year.
  const revenues: number[] = new Array(HISTORY_YEARS);
  revenues[HISTORY_YEARS - 1] = a.revenue;
  for (let i = HISTORY_YEARS - 2; i >= 0; i--) {
    const g = a.growthPath[i + 1] ?? 0.05;
    revenues[i] = revenues[i + 1] / (1 + g);
  }

  return years.map((fiscalYear, i) => {
    const revenue = revenues[i];
    const ebitdaMargin = a.ebitdaMarginPath[i] ?? a.ebitdaMarginPath[a.ebitdaMarginPath.length - 1];
    const ebitda = revenue * ebitdaMargin;
    const cash = revenue * a.cashPctRevenue;
    const grossDebt = Math.max(0, a.netDebtToEbitda * ebitda + cash);
    const cogs = revenue * (1 - a.grossMargin);
    const nwc =
      (revenue * a.arDays) / 365 +
      (cogs * a.invDays) / 365 +
      revenue * 0.03 -
      (cogs * a.apDays) / 365 -
      revenue * 0.05;
    return { fiscalYear, revenue, ebitdaMargin, cash, grossDebt, nwc };
  });
}

function buildAnnualPeriod(
  bp: CompanyBlueprint,
  frame: YearFrame,
  prior: YearFrame | null,
): FinancialPeriod {
  const a = bp.anchors;
  const financial = isBankLike(bp.profile.industry);
  const { revenue, ebitdaMargin } = frame;

  const cogs = revenue * (1 - a.grossMargin);
  const grossProfit = revenue - cogs;
  const ebitda = revenue * ebitdaMargin;
  const da = revenue * a.daPctRevenue;
  const ebit = ebitda - da;
  const rnd = revenue * a.rndPctRevenue;
  const sga = Math.max(0, grossProfit - ebit - rnd);

  // Financial-sector revenue is already stated net of funding cost.
  const interestExpense = financial ? 0 : frame.grossDebt * a.costOfDebt;
  const interestIncome = financial ? 0 : frame.cash * 0.55 * a.costOfDebt;
  const financialResult = financial ? 0 : interestIncome - interestExpense;

  const ebt = ebit + financialResult;
  const taxes = ebt > 0 ? ebt * a.taxRate : 0;
  const netIncomeBeforeMinority = ebt - taxes;
  const minorityInterest = netIncomeBeforeMinority * a.minorityPctNetIncome;
  const netIncome = netIncomeBeforeMinority - minorityInterest;

  const accountsReceivable = (revenue * a.arDays) / 365;
  const inventory = (cogs * a.invDays) / 365;
  const accountsPayable = (cogs * a.apDays) / 365;
  const otherCurrentAssets = revenue * 0.03;
  const otherCurrentLiabilities = revenue * 0.05;
  const ppe = revenue * a.ppePctRevenue;
  const intangibles = revenue * a.intangiblesPctRevenue;
  const goodwill = revenue * a.goodwillPctRevenue;
  // Financial institutions carry the loan book in other assets and their
  // funding (deposits and issued paper) in other liabilities.
  const otherAssets = financial ? revenue * 8 : revenue * (a.otherAssetsPctRevenue ?? 0.05);
  const otherLiabilities = financial ? revenue * 7.2 : revenue * 0.06;

  const shortTermDebt = frame.grossDebt * 0.2;
  const longTermDebt = frame.grossDebt * (financial ? 0.8 : 0.7);
  const leaseLiabilities = financial ? 0 : frame.grossDebt * 0.1;

  const totalAssets =
    frame.cash + accountsReceivable + inventory + otherCurrentAssets + ppe + intangibles + goodwill + otherAssets;
  const totalLiabilities =
    accountsPayable + shortTermDebt + otherCurrentLiabilities + longTermDebt + leaseLiabilities + otherLiabilities;
  const totalEquity = totalAssets - totalLiabilities;
  const minorityEquity = Math.max(0, totalEquity * a.minorityPctNetIncome * 3);
  const shareCapital = totalEquity * 0.35;
  const treasuryStock = -Math.abs(totalEquity * 0.02);
  const retainedEarnings = totalEquity - shareCapital - treasuryStock - minorityEquity;

  // Cash flow, articulated so that the net change in cash matches the balance sheet.
  const workingCapitalChange = prior ? -(frame.nwc - prior.nwc) : 0;
  const otherOperating = revenue * 0.004;
  const cfo = netIncome + da + workingCapitalChange + otherOperating;
  const capex = -(revenue * a.capexPctRevenue);
  const acquisitions = -(revenue * (goodwill > 0 ? 0.006 : 0));
  const otherInvesting = -(revenue * 0.003);
  const cfi = capex + acquisitions + otherInvesting;

  const dividendsPaid = -(Math.max(0, netIncome) * a.dividendPayout);
  const buybacks = -(Math.max(0, netIncome) * a.buybackPctNetIncome);
  const debtDelta = prior ? frame.grossDebt - prior.grossDebt : 0;
  const debtIssued = Math.max(0, debtDelta) + frame.grossDebt * 0.08;
  const debtRepaid = -(Math.max(0, -debtDelta) + frame.grossDebt * 0.08);

  const targetChangeInCash = prior ? frame.cash - prior.cash : 0;
  const cffKnown = debtIssued + debtRepaid + dividendsPaid + buybacks;
  const otherFinancing = prior ? targetChangeInCash - cfo - cfi - cffKnown : 0;
  const cff = cffKnown + otherFinancing;

  return derivePeriod({
    label: `FY${frame.fiscalYear}`,
    periodType: 'FY',
    fiscalYear: frame.fiscalYear,
    fiscalQuarter: null,
    endDate: `${frame.fiscalYear}-12-31`,
    currency: bp.profile.currency as Currency,
    standard: bp.profile.accountingStandard,
    unit: 'MILLIONS',
    source: 'MockMarketDataProvider',
    income: {
      ...EMPTY_INCOME,
      revenue: round2(revenue),
      cogs: round2(cogs),
      grossProfit: round2(grossProfit),
      sga: round2(sga),
      rnd: round2(rnd),
      otherOpex: 0,
      ebitda: round2(ebitda),
      da: round2(da),
      ebit: round2(ebit),
      financialResult: round2(financialResult),
      ebt: round2(ebt),
      taxes: round2(taxes),
      minorityInterest: round2(minorityInterest),
      netIncome: round2(netIncome),
      dilutedShares: a.shares,
    },
    balance: {
      ...EMPTY_BALANCE,
      cash: round2(frame.cash),
      accountsReceivable: round2(accountsReceivable),
      inventory: round2(inventory),
      otherCurrentAssets: round2(otherCurrentAssets),
      ppe: round2(ppe),
      intangibles: round2(intangibles),
      goodwill: round2(goodwill),
      otherAssets: round2(otherAssets),
      totalAssets: round2(totalAssets),
      accountsPayable: round2(accountsPayable),
      shortTermDebt: round2(shortTermDebt),
      otherCurrentLiabilities: round2(otherCurrentLiabilities),
      longTermDebt: round2(longTermDebt),
      leaseLiabilities: round2(leaseLiabilities),
      otherLiabilities: round2(otherLiabilities),
      totalLiabilities: round2(totalLiabilities),
      shareCapital: round2(shareCapital),
      retainedEarnings: round2(retainedEarnings),
      treasuryStock: round2(treasuryStock),
      minorityInterestEquity: round2(minorityEquity),
      totalEquity: round2(totalEquity),
    },
    cashFlow: {
      ...EMPTY_CASHFLOW,
      netIncome: round2(netIncome),
      da: round2(da),
      workingCapitalChange: round2(workingCapitalChange),
      otherOperating: round2(otherOperating),
      cfo: round2(cfo),
      capex: round2(capex),
      acquisitions: round2(acquisitions),
      otherInvesting: round2(otherInvesting),
      cfi: round2(cfi),
      debtIssued: round2(debtIssued),
      debtRepaid: round2(debtRepaid),
      dividendsPaid: round2(dividendsPaid),
      buybacks: round2(buybacks),
      otherFinancing: round2(otherFinancing),
      cff: round2(cff),
      netChangeInCash: round2(cfo + cfi + cff),
    },
  });
}

export function buildAnnualPeriods(bp: CompanyBlueprint): FinancialPeriod[] {
  const frames = buildYearFrames(bp);
  return frames.map((f, i) => buildAnnualPeriod(bp, f, i > 0 ? frames[i - 1] : null));
}

/* ------------------------ Quarterly statements ----------------------- */

const QUARTER_END: Record<number, string> = { 1: '03-31', 2: '06-30', 3: '09-30', 4: '12-31' };

/** Seasonal revenue weights per quarter, jittered per company but summing to 1. */
function seasonality(bp: CompanyBlueprint): number[] {
  const rng = makeRng(seedFromString(`${bp.profile.ticker}-season`));
  const raw = [0.235, 0.245, 0.25, 0.27].map((w) => w * (0.94 + rng() * 0.12));
  const total = raw.reduce((s, x) => s + x, 0);
  return raw.map((w) => w / total);
}

export function buildQuarterlyPeriods(bp: CompanyBlueprint, annuals: FinancialPeriod[]): FinancialPeriod[] {
  const a = bp.anchors;
  const weights = seasonality(bp);
  const rng = makeRng(seedFromString(`${bp.profile.ticker}-q`));
  const byYear = new Map(annuals.map((p) => [p.fiscalYear, p]));

  // Forward year (partially reported) continues the last observed growth, damped.
  const forwardGrowth = (a.growthPath[a.growthPath.length - 1] ?? 0.05) * 0.85;
  const fy25 = byYear.get(LATEST_FISCAL_YEAR)!;
  const forwardRevenue = (fy25.income.revenue ?? 0) * (1 + forwardGrowth);
  const forwardMargin = (a.ebitdaMarginPath[a.ebitdaMarginPath.length - 1] ?? 0.2) + 0.004;

  const out: FinancialPeriod[] = [];
  const plan: { year: number; quarter: number; annualRevenue: number; annualMargin: number }[] = [];
  for (const year of [LATEST_FISCAL_YEAR - 1, LATEST_FISCAL_YEAR]) {
    const ann = byYear.get(year)!;
    for (let q = 1; q <= 4; q++) {
      plan.push({
        year, quarter: q,
        annualRevenue: ann.income.revenue ?? 0,
        annualMargin: (ann.income.ebitda ?? 0) / (ann.income.revenue || 1),
      });
    }
  }
  for (let q = 1; q <= 2; q++) {
    plan.push({ year: LATEST_FISCAL_YEAR + 1, quarter: q, annualRevenue: forwardRevenue, annualMargin: forwardMargin });
  }

  const trimmed = plan.slice(-QUARTERS_BACK);

  for (const item of trimmed) {
    const wobble = 0.97 + rng() * 0.06;
    const revenue = item.annualRevenue * weights[item.quarter - 1] * wobble;
    const marginWobble = item.annualMargin * (0.96 + rng() * 0.08);
    const ebitda = revenue * marginWobble;
    const cogs = revenue * (1 - a.grossMargin);
    const da = revenue * a.daPctRevenue;
    const ebit = ebitda - da;
    const rnd = revenue * a.rndPctRevenue;
    const sga = Math.max(0, revenue - cogs - ebit - rnd);
    const financial = isBankLike(bp.profile.industry);
    const annual = byYear.get(Math.min(item.year, LATEST_FISCAL_YEAR))!;
    const grossDebt =
      (annual.balance.shortTermDebt ?? 0) + (annual.balance.longTermDebt ?? 0) + (annual.balance.leaseLiabilities ?? 0);
    const financialResult = financial ? 0 : -(grossDebt * a.costOfDebt) / 4 + ((annual.balance.cash ?? 0) * 0.55 * a.costOfDebt) / 4;
    const ebt = ebit + financialResult;
    const taxes = ebt > 0 ? ebt * a.taxRate : 0;
    const niBeforeMinority = ebt - taxes;
    const minority = niBeforeMinority * a.minorityPctNetIncome;
    const netIncome = niBeforeMinority - minority;

    const scale = revenue / (annual.income.revenue || 1);
    const balance = { ...annual.balance };
    const wc = 0.97 + rng() * 0.06;
    balance.accountsReceivable = round2((annual.balance.accountsReceivable ?? 0) * (1 + (scale - 0.25) * 0.4) * wc);
    balance.inventory = round2((annual.balance.inventory ?? 0) * wc);
    balance.cash = round2((annual.balance.cash ?? 0) * (0.92 + rng() * 0.16));

    // Working capital and cash move during the quarter while the funding side
    // does not, so retained earnings absorbs the difference — which is what a
    // real balance sheet does, and what keeps A = L + E true in every period
    // rather than only at the year end.
    const quarterAssets =
      (balance.cash ?? 0) + (balance.accountsReceivable ?? 0) + (balance.inventory ?? 0) +
      (balance.otherCurrentAssets ?? 0) + (balance.ppe ?? 0) + (balance.intangibles ?? 0) +
      (balance.goodwill ?? 0) + (balance.otherAssets ?? 0);
    const annualAssets =
      (annual.balance.cash ?? 0) + (annual.balance.accountsReceivable ?? 0) + (annual.balance.inventory ?? 0) +
      (annual.balance.otherCurrentAssets ?? 0) + (annual.balance.ppe ?? 0) + (annual.balance.intangibles ?? 0) +
      (annual.balance.goodwill ?? 0) + (annual.balance.otherAssets ?? 0);
    balance.retainedEarnings = round2((annual.balance.retainedEarnings ?? 0) + (quarterAssets - annualAssets));

    balance.totalAssets = null;
    balance.totalLiabilities = null;
    balance.totalEquity = null;

    const cfo = netIncome + da + revenue * -0.012;
    const capex = -(revenue * a.capexPctRevenue);

    out.push(
      derivePeriod({
        label: `${item.quarter}Q${String(item.year).slice(2)}`,
        periodType: 'Q',
        fiscalYear: item.year,
        fiscalQuarter: item.quarter,
        endDate: `${item.year}-${QUARTER_END[item.quarter]}`,
        currency: bp.profile.currency as Currency,
        standard: bp.profile.accountingStandard,
        unit: 'MILLIONS',
        source: 'MockMarketDataProvider',
        isEstimate: false,
        income: {
          ...EMPTY_INCOME,
          revenue: round2(revenue), cogs: round2(cogs), grossProfit: round2(revenue - cogs),
          sga: round2(sga), rnd: round2(rnd), otherOpex: 0,
          ebitda: round2(ebitda), da: round2(da), ebit: round2(ebit),
          financialResult: round2(financialResult), ebt: round2(ebt), taxes: round2(taxes),
          minorityInterest: round2(minority), netIncome: round2(netIncome), dilutedShares: a.shares,
        },
        balance,
        cashFlow: {
          ...EMPTY_CASHFLOW,
          netIncome: round2(netIncome), da: round2(da),
          workingCapitalChange: round2(revenue * -0.012), cfo: round2(cfo),
          capex: round2(capex), cfi: round2(capex),
          dividendsPaid: round2(-(Math.max(0, netIncome) * a.dividendPayout)),
        },
      }),
    );
  }
  return out;
}

/* ------------------------------ Prices ------------------------------ */

/**
 * The trading-day calendar every generated series shares: `days` weekdays
 * ending on AS_OF, oldest first. Because prices, benchmark levels and NAV
 * points are all stamped from this one calendar, a return computed from any of
 * them is a genuine one-day return and can be annualised with 252 periods.
 */
export function tradingDays(days = PRICE_HISTORY_DAYS, endDate = AS_OF): string[] {
  const dates: string[] = [];
  let cursor = new Date(`${endDate}T00:00:00Z`);
  while (dates.length < days) {
    const dow = cursor.getUTCDay();
    if (dow !== 0 && dow !== 6) dates.push(cursor.toISOString().slice(0, 10));
    cursor = new Date(cursor.getTime() - 86400000);
  }
  return dates.reverse();
}

export type MarketFactorCode = 'IBOV' | 'SPX';

/** Daily standard deviation of each market factor (≈16.7% and ≈13.5% a year). */
export const MARKET_DAILY_VOL: Record<MarketFactorCode, number> = { IBOV: 0.0105, SPX: 0.0085 };

function boxMuller(rng: () => number): number {
  const u1 = Math.max(rng(), 1e-9);
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

const FACTOR_CACHE = new Map<string, number[]>();

/**
 * Standard-normal daily shocks for a market index. Every company in that market
 * is built from these same shocks, scaled by its beta, so the universe has a
 * real common factor: correlations between holdings are non-zero, portfolio
 * diversification is not free, and the beta quoted for a company is the beta
 * you get back if you regress its generated prices on the index.
 */
export function marketShocks(code: MarketFactorCode, days = PRICE_HISTORY_DAYS): number[] {
  const key = `${code}:${days}`;
  const cached = FACTOR_CACHE.get(key);
  if (cached) return cached;
  const rng = makeRng(seedFromString(`market-factor-${code}-a`));
  const out = Array.from({ length: days }, () => boxMuller(rng));
  FACTOR_CACHE.set(key, out);
  return out;
}

/** The market factor a company loads on, from where it is listed. */
export function marketFactorFor(country: string): MarketFactorCode {
  return country === 'Brazil' ? 'IBOV' : 'SPX';
}

export function buildPriceHistory(bp: CompanyBlueprint, days = PRICE_HISTORY_DAYS): PriceBarData[] {
  const a = bp.anchors;
  const rng = makeRng(seedFromString(`${bp.profile.ticker}-px`));
  const dailyVol = a.annualVolatility / Math.sqrt(252);
  const dailyDrift = a.priceDrift / 252;

  // Two-factor return: beta x market shock, plus an idiosyncratic shock sized so
  // that the total daily variance still equals the company's annual volatility
  // anchor. The systematic share is capped so a high-beta, low-volatility anchor
  // cannot demand more variance than the anchor allows.
  const factorCode = marketFactorFor(bp.profile.country);
  const shocks = marketShocks(factorCode, days);
  const systematicVol = Math.min(a.beta * MARKET_DAILY_VOL[factorCode], dailyVol * 0.95);
  const idiosyncraticVol = Math.sqrt(Math.max(0, dailyVol ** 2 - systematicVol ** 2));

  // `priceDrift` is the compound (geometric) return the path should deliver, so
  // it enters the exponent directly; adding a -0.5 sigma-squared term here would
  // make a volatile name drift below the rate its anchor claims.
  const closes: number[] = [];
  let level = 1;
  for (let i = 0; i < days; i++) {
    const shock = systematicVol * shocks[i] + idiosyncraticVol * boxMuller(rng);
    level *= Math.exp(dailyDrift + shock);
    closes.push(level);
  }
  // Rescale so the final close equals the quoted price.
  const scale = a.price / closes[closes.length - 1];

  const bars: PriceBarData[] = [];
  const dates = tradingDays(days);

  for (let i = 0; i < days; i++) {
    const close = closes[i] * scale;
    const prev = i === 0 ? close : closes[i - 1] * scale;
    const open = prev * (1 + (rng() - 0.5) * dailyVol * 0.6);
    const high = Math.max(open, close) * (1 + rng() * dailyVol * 0.8);
    const low = Math.min(open, close) * (1 - rng() * dailyVol * 0.8);
    const volume = a.averageVolume * (0.6 + rng() * 0.9);
    bars.push({
      date: dates[i],
      open: round2(open), high: round2(high), low: round2(low), close: round2(close),
      volume: Math.round(volume),
    });
  }
  return bars;
}

export function buildQuote(bp: CompanyBlueprint, bars: PriceBarData[]): QuoteData {
  const a = bp.anchors;
  const last = bars[bars.length - 1];
  const prev = bars[bars.length - 2] ?? last;
  const window = bars.slice(-252);
  return {
    ticker: bp.profile.ticker,
    price: last.close,
    previousClose: prev.close,
    dayHigh: last.high,
    dayLow: last.low,
    week52High: round2(Math.max(...window.map((b) => b.high))),
    week52Low: round2(Math.min(...window.map((b) => b.low))),
    averageVolume: Math.round(window.reduce((s, b) => s + b.volume, 0) / window.length),
    sharesOutstanding: a.shares,
    freeFloat: a.freeFloat,
    beta: a.beta,
    currency: bp.profile.currency as Currency,
    asOf: AS_OF,
  };
}

/* --------------------------- Other datasets --------------------------- */

export function buildSegments(bp: CompanyBlueprint, annuals: FinancialPeriod[]): SegmentData[] {
  const out: SegmentData[] = [];
  for (const period of annuals.slice(-4)) {
    const revenue = period.income.revenue ?? 0;
    const yearsFromLatest = LATEST_FISCAL_YEAR - period.fiscalYear;
    for (const seg of bp.segments) {
      // Roll the share backwards using each segment's own growth rate.
      const shareDrift = (1 + seg.growth) ** -yearsFromLatest;
      const segRevenue = revenue * seg.share * shareDrift;
      out.push({
        segment: seg.name,
        kind: 'BUSINESS',
        fiscalYear: period.fiscalYear,
        revenue: round2(segRevenue),
        ebitda: round2(segRevenue * seg.margin),
        capex: round2(segRevenue * bp.anchors.capexPctRevenue),
        assets: round2(segRevenue * 1.4),
        marketShare: seg.marketShare ?? null,
      });
    }
    for (const geo of bp.geographies) {
      out.push({
        segment: geo.name,
        kind: 'GEOGRAPHY',
        fiscalYear: period.fiscalYear,
        revenue: round2(revenue * geo.share),
        ebitda: null, capex: null, assets: null, marketShare: null,
      });
    }
  }
  return out;
}

export function buildManagement(bp: CompanyBlueprint): ManagementData[] {
  return bp.management.map((m) => ({ name: m.name, role: m.role, since: m.since, background: m.background }));
}

export function buildOwnership(bp: CompanyBlueprint): OwnershipData[] {
  return bp.ownership.map((o) => ({ holder: o.holder, kind: o.kind, stake: o.stake }));
}

export function buildEstimates(bp: CompanyBlueprint, annuals: FinancialPeriod[]): EstimateData[] {
  const rng = makeRng(seedFromString(`${bp.profile.ticker}-est`));
  const latest = annuals[annuals.length - 1];
  const a = bp.anchors;
  const out: EstimateData[] = [];
  let revenue = latest.income.revenue ?? 0;
  let margin = (latest.income.ebitda ?? 0) / (latest.income.revenue || 1);
  const forwardGrowth = (a.growthPath[a.growthPath.length - 1] ?? 0.05) * 0.85;

  for (let i = 1; i <= 3; i++) {
    const year = LATEST_FISCAL_YEAR + i;
    revenue = revenue * (1 + forwardGrowth * (1 - i * 0.12) + (rng() - 0.5) * 0.01);
    margin = margin + (rng() - 0.45) * 0.004;
    const ebitda = revenue * margin;
    const ebit = ebitda - revenue * a.daPctRevenue;
    const netIncome = Math.max(0, ebit * (1 - a.taxRate)) * (1 - a.minorityPctNetIncome);
    const analysts = 8 + Math.floor(rng() * 14);
    out.push(
      { fiscalYear: year, fiscalQuarter: null, metric: 'revenue', value: round2(revenue), analysts, source: 'MockConsensusProvider' },
      { fiscalYear: year, fiscalQuarter: null, metric: 'ebitda', value: round2(ebitda), analysts, source: 'MockConsensusProvider' },
      { fiscalYear: year, fiscalQuarter: null, metric: 'ebit', value: round2(ebit), analysts, source: 'MockConsensusProvider' },
      { fiscalYear: year, fiscalQuarter: null, metric: 'netIncome', value: round2(netIncome), analysts, source: 'MockConsensusProvider' },
      { fiscalYear: year, fiscalQuarter: null, metric: 'eps', value: round2((netIncome / a.shares) * 100) / 100, analysts, source: 'MockConsensusProvider' },
    );
  }
  return out;
}

export function buildEarnings(bp: CompanyBlueprint, quarters: FinancialPeriod[]): EarningsData[] {
  const rng = makeRng(seedFromString(`${bp.profile.ticker}-earn`));
  const a = bp.anchors;
  return quarters.map((q) => {
    const surprise = (rng() - 0.48) * 0.07;   // consensus sits near, but not on, the print
    const revenue = q.income.revenue ?? 0;
    const ebitda = q.income.ebitda ?? 0;
    const eps = q.income.eps ?? 0;
    const reportDate = new Date(new Date(`${q.endDate}T00:00:00Z`).getTime() + 38 * 86400000)
      .toISOString()
      .slice(0, 10);
    const fcf = (q.cashFlow.cfo ?? 0) + (q.cashFlow.capex ?? 0);
    return {
      label: q.label,
      fiscalYear: q.fiscalYear,
      fiscalQuarter: q.fiscalQuarter ?? 1,
      reportDate,
      status: 'REPORTED' as const,
      revenue: round2(revenue),
      ebitda: round2(ebitda),
      ebit: round2(q.income.ebit ?? 0),
      netIncome: round2(q.income.netIncome ?? 0),
      eps: Math.round(eps * 10000) / 10000,
      fcf: round2(fcf),
      consensusRevenue: round2(revenue / (1 + surprise)),
      consensusEbitda: round2(ebitda / (1 + surprise * 1.6)),
      consensusEps: Math.round((eps / (1 + surprise * 2.1)) * 10000) / 10000,
      guidance: {
        revenueGrowth: `${((a.growthPath[a.growthPath.length - 1] ?? 0.05) * 100).toFixed(0)}% for the full year`,
        capex: `${(a.capexPctRevenue * 100).toFixed(0)}% of revenue`,
        margin: `EBITDA margin around ${(((q.income.ebitda ?? 0) / (revenue || 1)) * 100).toFixed(1)}%`,
      },
      commentary:
        'Simulated management commentary generated by MockMarketDataProvider for demonstration. It is not a statement made by the company.',
    };
  });
}

const NEWS_TEMPLATES: {
  kind: NewsData['kind']; sentiment: NewsData['sentiment']; impact: NewsData['impact'];
  headline: (t: string, n: string) => string; summary: (n: string) => string;
}[] = [
  {
    kind: 'FILING', sentiment: 'NEUTRAL', impact: 'MEDIUM',
    headline: (t) => `${t} files quarterly results`,
    summary: (n) => `${n} filed its quarterly financial statements. The figures in this workspace were loaded from the filing by MockMarketDataProvider and reconcile to the statements tab.`,
  },
  {
    kind: 'PRESENTATION', sentiment: 'POSITIVE', impact: 'MEDIUM',
    headline: (t) => `${t} hosts investor day and reiterates capital allocation framework`,
    summary: (n) => `${n} presented its medium-term plan, covering capital expenditure, returns policy and the operating targets tracked in the thesis module.`,
  },
  {
    kind: 'NEWS', sentiment: 'POSITIVE', impact: 'HIGH',
    headline: (t) => `${t} announces expansion of core operations`,
    summary: (n) => `Simulated news item: ${n} disclosed an expansion of its principal operating asset base, with capital deployment phased over the coming years.`,
  },
  {
    kind: 'NEWS', sentiment: 'NEGATIVE', impact: 'MEDIUM',
    headline: (t) => `${t} flags cost pressure in its main input basket`,
    summary: (n) => `Simulated news item: management at ${n} pointed to higher input costs, with a partial pass-through expected over the next two quarters.`,
  },
  {
    kind: 'TRANSCRIPT', sentiment: 'NEUTRAL', impact: 'LOW',
    headline: (t) => `${t} earnings call transcript available`,
    summary: (n) => `Transcript of the ${n} results call, including the question-and-answer session with sell-side analysts.`,
  },
  {
    kind: 'NEWS', sentiment: 'POSITIVE', impact: 'LOW',
    headline: (t) => `${t} approves shareholder distribution`,
    summary: (n) => `Simulated news item: the board of ${n} approved a distribution to shareholders, consistent with the payout ratio observed in the cash-flow statement.`,
  },
  {
    kind: 'NEWS', sentiment: 'NEGATIVE', impact: 'HIGH',
    headline: (t) => `Regulatory review opens on ${t} operations`,
    summary: (n) => `Simulated news item: a regulator opened a review touching part of the ${n} operating footprint. Timing and financial impact are undetermined.`,
  },
];

export function buildNews(bp: CompanyBlueprint): NewsData[] {
  const rng = makeRng(seedFromString(`${bp.profile.ticker}-news`));
  const base = new Date(`${AS_OF}T12:00:00Z`).getTime();
  return NEWS_TEMPLATES.map((tpl, i) => ({
    headline: tpl.headline(bp.profile.ticker, bp.profile.name),
    summary: tpl.summary(bp.profile.name),
    source: 'MockNewsProvider (simulated)',
    publishedAt: new Date(base - (i * 9 + Math.floor(rng() * 6)) * 86400000).toISOString(),
    sentiment: tpl.sentiment,
    impact: tpl.impact,
    kind: tpl.kind,
  }));
}

/* --------------------------- Full assembly --------------------------- */

export interface GeneratedCompany {
  blueprint: CompanyBlueprint;
  annuals: FinancialPeriod[];
  quarters: FinancialPeriod[];
  prices: PriceBarData[];
  quote: QuoteData;
  segments: SegmentData[];
  management: ManagementData[];
  ownership: OwnershipData[];
  estimates: EstimateData[];
  earnings: EarningsData[];
  news: NewsData[];
}

export function generateCompany(bp: CompanyBlueprint): GeneratedCompany {
  const annuals = buildAnnualPeriods(bp);
  const quarters = buildQuarterlyPeriods(bp, annuals);
  const prices = buildPriceHistory(bp);
  return {
    blueprint: bp,
    annuals,
    quarters,
    prices,
    quote: buildQuote(bp, prices),
    segments: buildSegments(bp, annuals),
    management: buildManagement(bp),
    ownership: buildOwnership(bp),
    estimates: buildEstimates(bp, annuals),
    earnings: buildEarnings(bp, quarters),
    news: buildNews(bp),
  };
}

export { netWorkingCapital };
