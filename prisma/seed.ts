/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/password';
import { BLUEPRINTS, findBlueprint } from '../src/lib/data-providers/mock/blueprints';
import { MockMarketDataProvider, MARKET_INDICATORS } from '../src/lib/data-providers/mock/provider';
import { AS_OF, LATEST_FISCAL_YEAR, buildConsensusTargets } from '../src/lib/data-providers/mock/generator';
import { buildDefaultDcfAssumptions } from '../src/lib/finance/modelDefaults';
import { calculateDcf } from '../src/lib/finance/dcf';
import { deriveScenarioSet, runScenarios } from '../src/lib/finance/scenarios';
import { computeLTM } from '../src/lib/finance/statements';
import { freeCashFlow, netDebt } from '../src/lib/finance/ratios';
import type { FinancialPeriod } from '../src/lib/finance/types';

const prisma = new PrismaClient();
const provider = new MockMarketDataProvider();
const DEMO_PASSWORD = 'meridian2026';

const j = (v: unknown) => JSON.stringify(v);
const d = (s: string) => new Date(`${s}T00:00:00.000Z`);

async function reset() {
  // SQLite: delete in dependency order.
  const tables = [
    'committeeComment', 'committeeVote', 'committeeItem', 'aiMessage', 'aiConversation',
    'auditLog', 'notification', 'alertEvent', 'alert', 'savedScreen',
    'rebalanceTargetRecord', 'portfolioValuationPoint', 'portfolioTransaction',
    'portfolioPosition', 'portfolio', 'watchlistItem', 'watchlist',
    'earningsReview', 'document', 'investmentMemo', 'researchNoteVersion', 'researchNote',
    'normalizationAdjustment', 'peerGroup', 'inputSource', 'consensusTarget',
    'qaItem', 'qualitativeDeck', 'peerComparisonTemplate', 'sectorAnalysis',
    'valuationModel', 'targetPriceRecord',
    'riskItem', 'catalyst', 'investmentThesis', 'dataSource',
    'peerLink', 'earningsEvent', 'newsItem', 'estimate', 'ownershipRecord',
    'managementRecord', 'segmentDatum', 'financialStatement', 'priceBar', 'security',
    'company', 'benchmarkPoint', 'marketIndicator', 'workspace', 'benchmark',
    'membership', 'session', 'organization', 'user',
  ] as const;
  for (const t of tables) {
    // @ts-expect-error dynamic model access is intentional for the reset helper
    await prisma[t].deleteMany({});
  }
}

async function seedBenchmarksAndMacro() {
  const benchmarks = await provider.getBenchmarks();
  const created: Record<string, string> = {};
  for (const b of benchmarks) {
    const row = await prisma.benchmark.create({
      data: {
        code: b.code, name: b.name, currency: b.currency, region: b.region,
        lastValue: b.lastValue, previousValue: b.previousValue,
      },
    });
    created[b.code] = row.id;
    // Every trading day is stored. Sampling the series would silently change
    // the meaning of a return: a five-day gap annualised at 252 periods
    // overstates volatility by the square root of five.
    await prisma.benchmarkPoint.createMany({
      data: b.history.map((p) => ({ benchmarkId: row.id, date: d(p.date), value: p.value })),
    });
  }
  await prisma.marketIndicator.createMany({
    data: MARKET_INDICATORS.map((m) => ({
      code: m.code, name: m.name, category: m.category, value: m.value,
      previous: m.previous, unit: m.unit, currency: m.currency ?? null, asOf: d(m.asOf),
      source: 'MockMarketDataProvider',
    })),
  });
  return created;
}

async function seedUniverse() {
  const ids: Record<string, string> = {};

  for (const bp of BLUEPRINTS) {
    const t = bp.profile.ticker;
    const company = await prisma.company.create({
      data: {
        ticker: t,
        name: bp.profile.name,
        legalName: bp.profile.legalName ?? null,
        exchange: bp.profile.exchange,
        country: bp.profile.country,
        sector: bp.profile.sector,
        industry: bp.profile.industry,
        currency: bp.profile.currency,
        accountingStandard: bp.profile.accountingStandard,
        fiscalYearEnd: bp.profile.fiscalYearEnd,
        description: bp.profile.description,
        businessModel: bp.profile.businessModel,
        competitiveAdvantages: j(bp.profile.competitiveAdvantages),
        website: bp.profile.website ?? null,
        employees: bp.profile.employees ?? null,
        foundedYear: bp.profile.foundedYear ?? null,
        ceo: bp.profile.ceo ?? null,
        headquarters: bp.profile.headquarters ?? null,
        reportingUnit: bp.profile.reportingUnit,
        themes: j(bp.profile.themes),
      },
    });
    ids[t] = company.id;

    const quote = (await provider.getQuote(t))!;
    const bars = await provider.getHistoricalPrices(t);
    const security = await prisma.security.create({
      data: {
        companyId: company.id, ticker: t,
        isin: `MK${t.padEnd(10, '0').slice(0, 10)}`,
        currency: quote.currency,
        sharesOutstanding: quote.sharesOutstanding,
        freeFloat: quote.freeFloat,
        lastPrice: quote.price, previousClose: quote.previousClose,
        dayHigh: quote.dayHigh, dayLow: quote.dayLow,
        week52High: quote.week52High, week52Low: quote.week52Low,
        averageVolume: quote.averageVolume, beta: quote.beta,
        priceAsOf: d(quote.asOf),
      },
    });

    // Every trading day is stored, so a close-to-close return is a genuine
    // one-day return and can be annualised with 252 periods.
    await prisma.priceBar.createMany({
      data: bars.map((b) => ({
        securityId: security.id, date: d(b.date),
        open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume,
      })),
    });

    const periods = await provider.getFinancials(t);
    await prisma.financialStatement.createMany({
      data: periods.map((p) => ({
        companyId: company.id, label: p.label, periodType: p.periodType,
        fiscalYear: p.fiscalYear, fiscalQuarter: p.fiscalQuarter ?? null,
        endDate: d(p.endDate), currency: p.currency, standard: p.standard, unit: p.unit,
        source: 'MockMarketDataProvider', isEstimate: false, confidence: 1,
        income: j(p.income), balance: j(p.balance), cashFlow: j(p.cashFlow),
      })),
    });

    const segments = await provider.getSegments(t);
    await prisma.segmentDatum.createMany({
      data: segments.map((s) => ({
        companyId: company.id, segment: s.segment, kind: s.kind, fiscalYear: s.fiscalYear,
        revenue: s.revenue, ebitda: s.ebitda, capex: s.capex, assets: s.assets, marketShare: s.marketShare,
      })),
    });

    const mgmt = await provider.getManagement(t);
    await prisma.managementRecord.createMany({
      data: mgmt.map((m) => ({ companyId: company.id, name: m.name, role: m.role, since: m.since, background: m.background })),
    });

    const own = await provider.getOwnership(t);
    await prisma.ownershipRecord.createMany({
      data: own.map((o) => ({ companyId: company.id, holder: o.holder, kind: o.kind, stake: o.stake })),
    });

    const est = await provider.getEstimates(t);
    await prisma.estimate.createMany({
      data: est.map((e) => ({
        companyId: company.id, fiscalYear: e.fiscalYear, fiscalQuarter: e.fiscalQuarter,
        metric: e.metric, value: e.value, analysts: e.analysts, source: e.source,
      })),
    });

    const targets = buildConsensusTargets(bp);
    await prisma.consensusTarget.createMany({
      data: targets.map((c) => ({
        companyId: company.id, contributor: c.contributor, targetPrice: c.targetPrice,
        recommendation: c.recommendation, currency: c.currency,
        asOf: d(c.asOf), source: c.source,
      })),
    });

    const news = await provider.getNews(t);
    await prisma.newsItem.createMany({
      data: news.map((n) => ({
        companyId: company.id, headline: n.headline, summary: n.summary, source: n.source,
        url: n.url ?? null, publishedAt: new Date(n.publishedAt), sentiment: n.sentiment,
        impact: n.impact, kind: n.kind,
      })),
    });

    const earnings = await provider.getEarnings(t);
    await prisma.earningsEvent.createMany({
      data: earnings.map((e) => ({
        companyId: company.id, label: e.label, fiscalYear: e.fiscalYear, fiscalQuarter: e.fiscalQuarter,
        reportDate: d(e.reportDate), status: e.status, revenue: e.revenue, ebitda: e.ebitda,
        ebit: e.ebit, netIncome: e.netIncome, eps: e.eps, fcf: e.fcf,
        consensusRevenue: e.consensusRevenue, consensusEbitda: e.consensusEbitda,
        consensusEps: e.consensusEps, guidance: j(e.guidance), commentary: e.commentary,
      })),
    });
  }

  // Peer links, once every company exists.
  for (const bp of BLUEPRINTS) {
    const peers = bp.peers.filter((p) => ids[p]);
    await prisma.peerLink.createMany({
      data: peers.map((p, i) => ({ companyId: ids[bp.profile.ticker], peerId: ids[p], rank: i })),
    });
  }
  return ids;
}

interface Ctx {
  workspaceId: string;
  companyIds: Record<string, string>;
  users: { admin: string; pm: string; analyst: string; researcher: string; viewer: string };
  names: Record<string, string>;
}

async function financialsFor(ticker: string): Promise<FinancialPeriod[]> {
  return provider.getFinancials(ticker);
}

const THESIS_SPECS: {
  ticker: string;
  recommendation: string;
  conviction: string;
  status: string;
  upside: number;          // target premium over the current price
  horizon: number;
  core: string;
  bull: string;
  base: string;
  bear: string;
  drivers: string[];
  moat: string[];
  assumptions: { label: string; metric: string; comparator: 'GTE' | 'LTE'; target: number; unit: string }[];
  catalysts: { title: string; kind: string; months: number; impact: string; direction: string; probability: number; notes: string }[];
  risks: { title: string; category: string; severity: string; probability: number; mitigation: string }[];
}[] = [
  {
    ticker: 'VALE3', recommendation: 'BUY', conviction: 'HIGH', status: 'ACTIVE', upside: 0.27, horizon: 12,
    core:
      'The market is pricing a structural decline in iron ore realisations while the asset base still earns a return on capital comfortably above its cost of capital. At the current multiple the equity is discounting a mid-cycle price well below the company own cash cost curve position, and the energy-transition metals division is being valued at close to zero.',
    bull:
      'Chinese steel output stabilises, the quality premium for high-grade ore widens, and the base metals division reaches its targeted margin. Distributions resume at the upper end of the policy.',
    base:
      'Iron ore trades in a range around the current benchmark, volumes grow with the northern system ramp, and margins hold in the low forties. Free cash flow funds a payout in line with the policy.',
    bear:
      'Chinese construction demand deteriorates further, the benchmark falls below the second-quartile cost curve, and provisions for legacy liabilities increase.',
    drivers: [
      'Northern system volume ramp lifting the average grade sold',
      'Base metals margin recovery toward the segment target',
      'Distribution policy converting free cash flow into shareholder returns',
    ],
    moat: ['COST_ADVANTAGE', 'SCALE', 'SWITCHING_COSTS'],
    assumptions: [
      { label: 'EBITDA margin holds above 38%', metric: 'ebitdaMargin', comparator: 'GTE', target: 0.38, unit: 'PERCENT' },
      { label: 'ROIC stays above the cost of capital', metric: 'roicSpread', comparator: 'GTE', target: 0, unit: 'PERCENT' },
      { label: 'Net debt/EBITDA below 1.5x', metric: 'netDebtToEbitda', comparator: 'LTE', target: 1.5, unit: 'MULTIPLE' },
    ],
    catalysts: [
      { title: 'Third-quarter production report', kind: 'EARNINGS', months: 1, impact: 'MEDIUM', direction: 'UNCERTAIN', probability: 0.99, notes: 'Volume and realised price disclosure sets the tone for the quarter.' },
      { title: 'Capital markets day and distribution policy review', kind: 'INVESTOR_DAY', months: 4, impact: 'HIGH', direction: 'POSITIVE', probability: 0.75, notes: 'Management has signalled a review of the shareholder return framework.' },
      { title: 'Base metals asset partnership decision', kind: 'M_AND_A', months: 7, impact: 'HIGH', direction: 'POSITIVE', probability: 0.4, notes: 'A partial sale would crystallise value the market is not attributing today.' },
    ],
    risks: [
      { title: 'Chinese steel demand contracts faster than modelled', category: 'MACRO', severity: 'HIGH', probability: 0.35, mitigation: 'Position sized below the maximum single-name limit; monitored through weekly port inventory data.' },
      { title: 'Additional provisions for legacy liabilities', category: 'REGULATORY', severity: 'MEDIUM', probability: 0.3, mitigation: 'Bear case charges a further provision against equity value.' },
      { title: 'Currency appreciation compressing the BRL cost advantage', category: 'MACRO', severity: 'MEDIUM', probability: 0.4, mitigation: 'Sensitivity run on the FX assumption inside the DCF.' },
    ],
  },
  {
    ticker: 'WEGE3', recommendation: 'HOLD', conviction: 'MEDIUM', status: 'UNDER_REVIEW', upside: 0.06, horizon: 12,
    core:
      'An exceptional business trading at a demanding multiple. Returns on capital and the electrification runway are genuine, but the current price already discounts sustained mid-teens growth with stable margins, leaving little room for execution error.',
    bull: 'Transmission and distribution equipment demand accelerates, export mix lifts margin, and the company sustains growth above 15% for longer than the market expects.',
    base: 'Growth decelerates gradually toward low double digits as the equipment cycle normalises, with margins broadly stable.',
    bear: 'The capex cycle in electrical equipment turns, growth halves, and the multiple de-rates toward its own long-run median.',
    drivers: ['Electrification and grid investment', 'Share gains in export markets', 'Operating leverage from vertical integration'],
    moat: ['BRAND', 'SWITCHING_COSTS', 'SCALE'],
    assumptions: [
      { label: 'Revenue growth stays above 10%', metric: 'revenueGrowth', comparator: 'GTE', target: 0.10, unit: 'PERCENT' },
      { label: 'EBITDA margin at or above 21%', metric: 'ebitdaMargin', comparator: 'GTE', target: 0.21, unit: 'PERCENT' },
      { label: 'ROIC above 20%', metric: 'roic', comparator: 'GTE', target: 0.20, unit: 'PERCENT' },
    ],
    catalysts: [
      { title: 'Quarterly results', kind: 'EARNINGS', months: 2, impact: 'MEDIUM', direction: 'UNCERTAIN', probability: 0.99, notes: 'Order book commentary is the variable that matters.' },
      { title: 'Grid equipment auction awards', kind: 'CONTRACT', months: 5, impact: 'MEDIUM', direction: 'POSITIVE', probability: 0.6, notes: 'Transmission auctions feed the GTD backlog.' },
    ],
    risks: [
      { title: 'Multiple compression from a high starting point', category: 'VALUATION', severity: 'HIGH', probability: 0.5, mitigation: 'Position held at half weight until the multiple or growth gap closes.' },
      { title: 'Equipment cycle turns with industrial capex', category: 'COMPETITIVE', severity: 'MEDIUM', probability: 0.35, mitigation: 'Backlog and book-to-bill monitored quarterly.' },
    ],
  },
  {
    ticker: 'ITUB4', recommendation: 'BUY', conviction: 'HIGH', status: 'ACTIVE', upside: 0.21, horizon: 12,
    core:
      'A bank compounding book value in the low twenties on return on equity while trading close to its historical average on price to book. Falling policy rates should support loan growth and reduce provisions, and the fee businesses give earnings a quality the multiple does not reflect.',
    bull: 'Policy easing drives credit growth above 10%, cost of risk falls, and return on equity moves into the mid twenties.',
    base: 'Mid-single-digit loan growth, stable cost of risk, and continued positive operating jaws.',
    bear: 'Credit quality deteriorates in the consumer book and regulatory changes compress fee income.',
    drivers: ['Falling policy rate supporting credit demand', 'Fee income mix from cards and asset management', 'Cost discipline producing positive operating jaws'],
    moat: ['SCALE', 'SWITCHING_COSTS', 'BRAND'],
    assumptions: [
      { label: 'ROE at or above 20%', metric: 'roe', comparator: 'GTE', target: 0.20, unit: 'PERCENT' },
      { label: 'Revenue growth above 6%', metric: 'revenueGrowth', comparator: 'GTE', target: 0.06, unit: 'PERCENT' },
    ],
    catalysts: [
      { title: 'Quarterly results and guidance update', kind: 'EARNINGS', months: 1, impact: 'MEDIUM', direction: 'UNCERTAIN', probability: 0.99, notes: 'Guidance on loan growth and cost of risk.' },
      { title: 'Policy rate decision', kind: 'MACRO', months: 2, impact: 'MEDIUM', direction: 'POSITIVE', probability: 0.7, notes: 'Further easing supports the credit cycle.' },
      { title: 'Extraordinary dividend decision', kind: 'DIVIDEND', months: 4, impact: 'MEDIUM', direction: 'POSITIVE', probability: 0.55, notes: 'Excess capital above the regulatory minimum.' },
    ],
    risks: [
      { title: 'Consumer credit deterioration', category: 'FINANCIAL', severity: 'MEDIUM', probability: 0.35, mitigation: 'Non-performing loan formation tracked monthly.' },
      { title: 'Regulatory intervention in interchange or credit fees', category: 'REGULATORY', severity: 'MEDIUM', probability: 0.25, mitigation: 'Fee income sensitivity modelled in the bear case.' },
    ],
  },
  {
    ticker: 'PETR4', recommendation: 'BUY', conviction: 'MEDIUM', status: 'ACTIVE', upside: 0.18, horizon: 12,
    core:
      'Free cash flow yield remains extraordinary relative to the rest of the market even at a conservative Brent assumption. The governance discount is real and should be treated as a permanent feature of the valuation rather than a temporary one, but at the current multiple the market is over-charging for it.',
    bull: 'Brent holds above the modelled level, capital discipline is maintained, and the distribution policy is applied without political interference.',
    base: 'Brent in the low seventies, capex at the plan, distributions in line with the stated policy.',
    bear: 'Capital allocation is redirected toward low-return refining and social projects, and the payout is cut.',
    drivers: ['Pre-salt lifting cost per barrel', 'Distribution policy execution', 'Refining utilisation'],
    moat: ['COST_ADVANTAGE', 'SCALE'],
    assumptions: [
      { label: 'FCF yield above 12%', metric: 'fcfYield', comparator: 'GTE', target: 0.12, unit: 'PERCENT' },
      { label: 'Net debt/EBITDA below 1.2x', metric: 'netDebtToEbitda', comparator: 'LTE', target: 1.2, unit: 'MULTIPLE' },
      { label: 'Capex discipline: capex below 16% of revenue', metric: 'capexToRevenue', comparator: 'LTE', target: 0.16, unit: 'PERCENT' },
    ],
    catalysts: [
      { title: 'Quarterly results and dividend declaration', kind: 'EARNINGS', months: 1, impact: 'HIGH', direction: 'POSITIVE', probability: 0.99, notes: 'The distribution is the single most important disclosure.' },
      { title: 'Five-year business plan release', kind: 'INVESTOR_DAY', months: 3, impact: 'HIGH', direction: 'UNCERTAIN', probability: 0.9, notes: 'Capex envelope determines the free cash flow trajectory.' },
    ],
    risks: [
      { title: 'Political interference in pricing or capital allocation', category: 'REGULATORY', severity: 'HIGH', probability: 0.45, mitigation: 'Position capped and paired against a private-sector energy holding.' },
      { title: 'Brent falls below the bear-case assumption', category: 'MACRO', severity: 'HIGH', probability: 0.3, mitigation: 'Bear case runs Brent at a level below the marginal barrel.' },
    ],
  },
  {
    ticker: 'NVDA', recommendation: 'HOLD', conviction: 'MEDIUM', status: 'UNDER_REVIEW', upside: 0.04, horizon: 12,
    core:
      'The accelerated-computing franchise is genuine and the software moat is underestimated by bears, but the current price requires data-centre revenue to compound at a rate that has no precedent at this revenue base. The reverse DCF is the honest way to frame the debate.',
    bull: 'Inference demand broadens beyond the largest labs, the networking attach rate rises, and gross margin holds above seventy percent.',
    base: 'Growth decelerates from triple digits toward the thirties as the installed base matures; margins drift down modestly.',
    bear: 'Hyperscaler capex digestion arrives, custom silicon takes share, and the multiple compresses alongside the growth rate.',
    drivers: ['Data-centre accelerator demand', 'Networking and systems attach', 'CUDA software lock-in'],
    moat: ['SWITCHING_COSTS', 'NETWORK_EFFECTS', 'SCALE'],
    assumptions: [
      { label: 'Revenue growth above 25%', metric: 'revenueGrowth', comparator: 'GTE', target: 0.25, unit: 'PERCENT' },
      { label: 'EBITDA margin above 60%', metric: 'ebitdaMargin', comparator: 'GTE', target: 0.60, unit: 'PERCENT' },
    ],
    catalysts: [
      { title: 'Quarterly results and data-centre guidance', kind: 'EARNINGS', months: 1, impact: 'HIGH', direction: 'UNCERTAIN', probability: 0.99, notes: 'Guidance is the primary driver of the multiple.' },
      { title: 'Next-generation platform launch', kind: 'PRODUCT', months: 6, impact: 'HIGH', direction: 'POSITIVE', probability: 0.85, notes: 'Product cadence sustains the pricing structure.' },
      { title: 'Export control revision', kind: 'REGULATORY', months: 4, impact: 'MEDIUM', direction: 'UNCERTAIN', probability: 0.4, notes: 'Changes to restricted-market access alter the addressable base.' },
    ],
    risks: [
      { title: 'Customer concentration in a handful of hyperscalers', category: 'COMPETITIVE', severity: 'HIGH', probability: 0.5, mitigation: 'Reverse DCF used to frame the growth already priced in.' },
      { title: 'Valuation leaves no margin of safety', category: 'VALUATION', severity: 'HIGH', probability: 0.6, mitigation: 'Held at benchmark weight rather than overweight.' },
    ],
  },
  {
    ticker: 'RENT3', recommendation: 'SELL', conviction: 'MEDIUM', status: 'DETERIORATING', upside: -0.12, horizon: 12,
    core:
      'The fleet economics that made this a compounder have inverted. Depreciation per vehicle has reset higher, the cost of funding the fleet has risen faster than rental rates, and return on invested capital has fallen below the cost of capital for the first time in the series we track.',
    bull: 'Used-car prices recover, rental rates reprice ahead of depreciation, and leverage falls back below the covenant comfort zone.',
    base: 'Return on capital stays near the cost of capital while the balance sheet deleverages slowly.',
    bear: 'Funding costs stay elevated, fleet impairments follow, and the equity absorbs the adjustment.',
    drivers: ['Rental rate repricing', 'Used-car price recovery', 'Fleet deleveraging'],
    moat: ['SCALE', 'COST_ADVANTAGE'],
    assumptions: [
      { label: 'ROIC above the cost of capital', metric: 'roicSpread', comparator: 'GTE', target: 0, unit: 'PERCENT' },
      { label: 'Net debt/EBITDA below 3.0x', metric: 'netDebtToEbitda', comparator: 'LTE', target: 3.0, unit: 'MULTIPLE' },
    ],
    catalysts: [
      { title: 'Quarterly results — depreciation per vehicle', kind: 'EARNINGS', months: 1, impact: 'HIGH', direction: 'NEGATIVE', probability: 0.99, notes: 'The single line that decides the thesis.' },
      { title: 'Debenture issuance and cost of funding', kind: 'CAPITAL_ALLOCATION', months: 3, impact: 'MEDIUM', direction: 'NEGATIVE', probability: 0.6, notes: 'Marginal funding cost feeds directly into the model.' },
    ],
    risks: [
      { title: 'Short squeeze on a crowded negative view', category: 'VALUATION', severity: 'MEDIUM', probability: 0.3, mitigation: 'Expressed as an underweight rather than a short.' },
      { title: 'Faster-than-expected used-car price recovery', category: 'OPERATIONAL', severity: 'MEDIUM', probability: 0.35, mitigation: 'Used-vehicle price index tracked monthly.' },
    ],
  },
  {
    ticker: 'SUZB3', recommendation: 'BUY', conviction: 'MEDIUM', status: 'ACTIVE', upside: 0.23, horizon: 18,
    core:
      'The lowest-cost producer in a commodity where the cost curve is steep. With the expansion project delivered, capex normalises and the free cash flow yield on the current market capitalisation becomes difficult to ignore even at a mid-cycle pulp price.',
    bull: 'Pulp prices recover with Chinese restocking while capex falls to maintenance levels.',
    base: 'Pulp trades near the current level; deleveraging proceeds and the payout increases.',
    bear: 'New supply pressures the price below the cash cost of the second quartile and leverage stays elevated.',
    drivers: ['Capex normalisation after the expansion project', 'Cash cost per tonne advantage', 'Deleveraging path'],
    moat: ['COST_ADVANTAGE', 'SCALE'],
    assumptions: [
      { label: 'Net debt/EBITDA below 3.0x', metric: 'netDebtToEbitda', comparator: 'LTE', target: 3.0, unit: 'MULTIPLE' },
      { label: 'EBITDA margin above 40%', metric: 'ebitdaMargin', comparator: 'GTE', target: 0.40, unit: 'PERCENT' },
    ],
    catalysts: [
      { title: 'Quarterly results and cash cost disclosure', kind: 'EARNINGS', months: 2, impact: 'MEDIUM', direction: 'POSITIVE', probability: 0.99, notes: 'Cash cost per tonne is the key operational metric.' },
      { title: 'Pulp price announcement for the Chinese market', kind: 'MACRO', months: 1, impact: 'HIGH', direction: 'UNCERTAIN', probability: 0.9, notes: 'Monthly list price moves the earnings estimate directly.' },
    ],
    risks: [
      { title: 'New capacity from competing producers', category: 'COMPETITIVE', severity: 'HIGH', probability: 0.4, mitigation: 'Supply pipeline tracked; bear case assumes full commissioning.' },
      { title: 'Leverage above the covenant comfort zone', category: 'FINANCIAL', severity: 'MEDIUM', probability: 0.3, mitigation: 'Deleveraging trajectory monitored against the alert threshold.' },
    ],
  },
  {
    ticker: 'MSFT', recommendation: 'BUY', conviction: 'HIGH', status: 'ACTIVE', upside: 0.14, horizon: 24,
    core:
      'The clearest way to own the enterprise adoption of artificial intelligence without paying a semiconductor cycle multiple. Recurring revenue, pricing power inside enterprise agreements and a cloud business still growing near twenty percent justify a premium to the market.',
    bull: 'AI services attach at a higher rate than modelled, cloud growth reaccelerates and margins expand despite the capex cycle.',
    base: 'Cloud grows near twenty percent, capex remains elevated, and free cash flow grows slower than earnings.',
    bear: 'AI monetisation disappoints relative to the capital deployed and returns on incremental capital fall.',
    drivers: ['Cloud consumption growth', 'AI services attach rate', 'Enterprise agreement pricing'],
    moat: ['SWITCHING_COSTS', 'NETWORK_EFFECTS', 'SCALE'],
    assumptions: [
      { label: 'Revenue growth above 12%', metric: 'revenueGrowth', comparator: 'GTE', target: 0.12, unit: 'PERCENT' },
      { label: 'ROIC above 20%', metric: 'roic', comparator: 'GTE', target: 0.20, unit: 'PERCENT' },
      { label: 'EBITDA margin above 50%', metric: 'ebitdaMargin', comparator: 'GTE', target: 0.50, unit: 'PERCENT' },
    ],
    catalysts: [
      { title: 'Quarterly results and cloud growth disclosure', kind: 'EARNINGS', months: 1, impact: 'HIGH', direction: 'UNCERTAIN', probability: 0.99, notes: 'Cloud growth and capex guidance.' },
      { title: 'Enterprise AI pricing announcement', kind: 'PRODUCT', months: 5, impact: 'MEDIUM', direction: 'POSITIVE', probability: 0.6, notes: 'Per-seat pricing changes flow straight to margin.' },
    ],
    risks: [
      { title: 'Capital intensity permanently higher', category: 'FINANCIAL', severity: 'MEDIUM', probability: 0.5, mitigation: 'Capex as a share of revenue tracked against the assumption.' },
      { title: 'Competitive pressure in cloud infrastructure', category: 'COMPETITIVE', severity: 'MEDIUM', probability: 0.3, mitigation: 'Segment growth compared against peers each quarter.' },
    ],
  },
];

async function seedWorkspaceContent(ctx: Ctx) {
  const now = new Date(`${AS_OF}T12:00:00.000Z`);
  const monthsFromNow = (m: number) => new Date(now.getTime() + m * 30 * 86400000);
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000);

  /* --------------------------- Data sources --------------------------- */
  await prisma.dataSource.createMany({
    data: [
      { workspaceId: ctx.workspaceId, code: 'mock-market', name: 'MockMarketDataProvider', kind: 'MARKET_DATA', status: 'CONNECTED', isMock: true, lastSyncAt: now, coverage: j({ companies: BLUEPRINTS.length, priceHistoryDays: 760 }), notes: 'Simulated prices and quotes. Replace with a vendor implementation of MarketDataProvider to go live.' },
      { workspaceId: ctx.workspaceId, code: 'mock-fundamentals', name: 'MockFundamentalsProvider', kind: 'FUNDAMENTALS', status: 'CONNECTED', isMock: true, lastSyncAt: now, coverage: j({ annualYears: 6, quarters: 10 }), notes: 'Simulated statements. Internally consistent: the balance sheet balances and the cash-flow statement articulates.' },
      { workspaceId: ctx.workspaceId, code: 'mock-consensus', name: 'MockConsensusProvider', kind: 'CONSENSUS', status: 'DEGRADED', isMock: true, lastSyncAt: daysAgo(6), coverage: j({ forwardYears: 3 }), notes: 'Simulated consensus. Last refresh is more than five days old.' },
      { workspaceId: ctx.workspaceId, code: 'mock-news', name: 'MockNewsProvider', kind: 'NEWS', status: 'CONNECTED', isMock: true, lastSyncAt: now, coverage: j({ itemsPerCompany: 7 }), notes: 'Simulated headlines, clearly labelled throughout the interface.' },
      { workspaceId: ctx.workspaceId, code: 'user-upload', name: 'User uploads', kind: 'USER_UPLOAD', status: 'CONNECTED', isMock: false, lastSyncAt: null, coverage: j({ formats: ['PDF', 'XLSX', 'CSV', 'TXT'] }), notes: 'Documents uploaded into this workspace. Extraction keeps a reference to the source document.' },
      { workspaceId: ctx.workspaceId, code: 'manual', name: 'Manual input', kind: 'MANUAL', status: 'CONNECTED', isMock: false, lastSyncAt: null, coverage: j({ scope: 'Normalization adjustments, model assumptions, portfolio transactions' }), notes: 'Values entered by analysts. Every entry is recorded in the audit trail.' },
    ],
  });


  /**
   * Builds a DCF from a company's own reported history, with the discount rate
   * as a build and a source on every input. Every covered company gets one:
   * a universe where only the names with a written thesis carry a model is a
   * universe where the screener and the comparables have nothing to read.
   */
  async function seedDcfModel(ticker: string, companyId: string) {
    const bp = findBlueprint(ticker)!;
      // A DCF anchored to the company's own reported history.
      const periods = await financialsFor(ticker);
      const assumptions = buildDefaultDcfAssumptions(
        periods,
        { price: bp.anchors.price, sharesOutstanding: bp.anchors.shares, beta: bp.anchors.beta },
        { riskFreeRate: bp.profile.currency === 'BRL' ? 0.105 : 0.042, equityRiskPremium: bp.profile.currency === 'BRL' ? 0.055 : 0.05, statutoryTaxRate: bp.anchors.taxRate, countryRiskPremium: bp.profile.currency === 'BRL' ? 0 : 0 },
      );
      const result = calculateDcf(assumptions);
      const scenarioDefs = deriveScenarioSet(assumptions);
      const scenarioResult = runScenarios(scenarioDefs, bp.anchors.price);

      // The discount rate as a build, with a source on every component. One of
      // the demo models deliberately carries the inflation-linked instrument and
      // no country premium, so the review checks have something real to catch.
      const usesRealRate = ticker === 'ITUB4';
      const isBrl = bp.profile.currency === 'BRL';
      const waccBuild = {
        currency: bp.profile.currency,
        erpIsDevelopedMarket: true,
        riskFree: usesRealRate
          ? { value: 0.0642, source: 'NTN-B 2035 real yield (MockMarketDataProvider)', asOf: AS_OF, basis: 'REAL', inflation: 0.0418, instrument: 'NTN-B 2035 real yield' }
          : isBrl
            ? { value: 0.1218, source: 'NTN-F 2033 nominal yield (MockMarketDataProvider)', asOf: AS_OF, basis: 'NOMINAL', inflation: null, instrument: 'NTN-F 2033 nominal yield' }
            : { value: 0.0412, source: 'US Treasury 10Y (MockMarketDataProvider)', asOf: AS_OF, basis: 'NOMINAL', inflation: null, instrument: 'US Treasury 10Y' },
        equityRiskPremium: { value: 0.046, source: 'Mature-market equity risk premium (MockMarketDataProvider)', asOf: AS_OF },
        countryRiskPremium: isBrl && !usesRealRate
          ? { value: 0.0208, source: 'EMBI+ Brazil sovereign spread (MockMarketDataProvider)', asOf: AS_OF }
          : null,
        betaMethod: 'OBSERVED',
        observedBeta: { value: bp.anchors.beta, source: 'Regression against the market benchmark', asOf: AS_OF, window: '3y daily', benchmark: isBrl ? 'IBOV' : 'SPX' },
        peerBetas: [],
        targetDebtToEquity: null,
        costOfDebt: { value: bp.anchors.costOfDebt, source: 'Weighted average cost of debt in the notes', asOf: AS_OF, basis: 'REPORTED' },
        taxRate: { value: bp.anchors.taxRate, source: 'Statutory rate', asOf: AS_OF },
        marketValueEquity: { value: bp.anchors.shares * bp.anchors.price, source: 'Market price x shares outstanding', asOf: AS_OF },
        debt: { value: assumptions.netDebt, source: `Net debt on ${LATEST_FISCAL_YEAR} reported balance sheet`, asOf: AS_OF, basis: 'NET_DEBT' },
        cash: null,
        targetEquityWeight: null,
        rationale: usesRealRate
          ? null
          : 'Observed beta over three years covers a full cycle; country premium taken from the sovereign spread because the revenue is domestic.',
      };

      const model = await prisma.valuationModel.create({
        data: {
          workspaceId: ctx.workspaceId, companyId,
          name: `${ticker} — DCF ${LATEST_FISCAL_YEAR + 1}E`,
          kind: 'DCF', status: 'ACTIVE',
          assumptions: j(assumptions),
          waccBuild: j(waccBuild),
          scenarios: j(scenarioDefs.map((s) => ({ key: s.key, label: s.label, probability: s.probability, assumptions: s.assumptions }))),
          outputs: j({
            fairValuePerShare: result.fairValuePerShare,
            enterpriseValue: result.enterpriseValue,
            equityValue: result.equityValue,
            upside: result.upside,
            wacc: assumptions.wacc,
            terminalGrowth: assumptions.terminalGrowth,
            expectedValue: scenarioResult.expectedValue,
            computedAt: now.toISOString(),
          }),
          notes: 'Assumptions initialised from the company reported history; edit any cell to re-run the model.',
          authorName: ctx.names.analyst,
          createdAt: daysAgo(118), updatedAt: daysAgo(9),
        },
      });

      // Provenance for each input. Everything here traces to the mock provider or
      // to the analyst, and is recorded as whichever it is — the verification
      // panel then shows a real mix rather than a uniformly clean model.
      const sourceRows: { path: string; label: string; kind: string; reference: string; value: number | null }[] = [
        { path: 'wacc.riskFree', label: 'Risk-free rate', kind: 'MOCK', reference: waccBuild.riskFree.source, value: waccBuild.riskFree.value },
        { path: 'wacc.equityRiskPremium', label: 'Equity risk premium', kind: 'MOCK', reference: waccBuild.equityRiskPremium.source, value: waccBuild.equityRiskPremium.value },
        ...(waccBuild.countryRiskPremium ? [{ path: 'wacc.countryRiskPremium', label: 'Country risk premium', kind: 'MOCK', reference: waccBuild.countryRiskPremium.source, value: waccBuild.countryRiskPremium.value }] : []),
        { path: 'wacc.beta', label: 'Beta', kind: 'DERIVED', reference: 'Regression against the market benchmark', value: bp.anchors.beta },
        { path: 'wacc.costOfDebt', label: 'Cost of debt', kind: 'FILING', reference: `Note 18, ${LATEST_FISCAL_YEAR} annual report`, value: bp.anchors.costOfDebt },
        { path: 'wacc.taxRate', label: 'Tax rate', kind: 'MANUAL', reference: 'Statutory rate applied by the analyst', value: bp.anchors.taxRate },
        { path: 'wacc.marketValueEquity', label: 'Market value of equity', kind: 'MARKET', reference: 'Market price x shares outstanding', value: bp.anchors.shares * bp.anchors.price },
        { path: 'wacc.debt', label: 'Debt', kind: 'FILING', reference: `Balance sheet, FY${LATEST_FISCAL_YEAR}`, value: assumptions.netDebt },
        { path: 'forecast.baseRevenue', label: 'Base-year revenue', kind: 'FILING', reference: `Income statement, FY${LATEST_FISCAL_YEAR}`, value: assumptions.baseRevenue },
        { path: 'forecast.revenueGrowth', label: 'Revenue growth path', kind: 'MANUAL', reference: 'Analyst forecast', value: assumptions.revenueGrowth[0] ?? null },
        { path: 'forecast.ebitdaMargin', label: 'EBITDA margin path', kind: 'MANUAL', reference: 'Analyst forecast', value: assumptions.ebitdaMargin[0] ?? null },
        { path: 'terminal.growth', label: 'Perpetuity growth', kind: 'MANUAL', reference: 'Analyst assumption, anchored to long-run nominal growth', value: assumptions.terminalGrowth },
        { path: 'bridge.netDebt', label: 'Net debt', kind: 'FILING', reference: `Balance sheet, FY${LATEST_FISCAL_YEAR}`, value: assumptions.netDebt },
        { path: 'bridge.shares', label: 'Shares outstanding', kind: 'FILING', reference: `Shareholding note, FY${LATEST_FISCAL_YEAR}`, value: assumptions.sharesOutstanding },
      ];
      await prisma.inputSource.createMany({
        data: sourceRows.map((r) => ({
          workspaceId: ctx.workspaceId, modelId: model.id, path: r.path, label: r.label,
          kind: r.kind, reference: r.reference, value: r.value,
          asOf: d(AS_OF), verifiedBy: ctx.names.analyst, verifiedAt: daysAgo(9),
        })),
      });

  }

  /* ------------------------ Theses and valuations ---------------------- */
  const thesisIds: Record<string, string> = {};
  for (const spec of THESIS_SPECS) {
    const companyId = ctx.companyIds[spec.ticker];
    if (!companyId) continue;
    const bp = findBlueprint(spec.ticker)!;
    const target = Math.round(bp.anchors.price * (1 + spec.upside) * 100) / 100;

    const thesis = await prisma.investmentThesis.create({
      data: {
        workspaceId: ctx.workspaceId, companyId,
        recommendation: spec.recommendation, targetPrice: target,
        timeHorizonMonths: spec.horizon, conviction: spec.conviction, status: spec.status,
        coreThesis: spec.core, bullCase: spec.bull, baseCase: spec.base, bearCase: spec.bear,
        growthDrivers: j(spec.drivers), moat: j(spec.moat), assumptions: j(spec.assumptions),
        authorName: ctx.names.analyst,
        createdAt: daysAgo(120), updatedAt: daysAgo(9),
      },
    });
    thesisIds[spec.ticker] = thesis.id;
    await seedDcfModel(spec.ticker, companyId);

    await prisma.catalyst.createMany({
      data: spec.catalysts.map((c) => ({
        thesisId: thesis.id, companyId, title: c.title, kind: c.kind,
        expectedDate: monthsFromNow(c.months), expectedImpact: c.impact,
        direction: c.direction, probability: c.probability, status: 'PENDING', notes: c.notes,
      })),
    });

    await prisma.riskItem.createMany({
      data: spec.risks.map((r) => ({
        thesisId: thesis.id, companyId, title: r.title, category: r.category,
        severity: r.severity, probability: r.probability, mitigation: r.mitigation,
      })),
    });

    const previousTarget = Math.round(target * 0.92 * 100) / 100;
    await prisma.targetPriceRecord.createMany({
      data: [
        {
          thesisId: thesis.id, companyId, targetPrice: previousTarget, previousTarget: null,
          recommendation: spec.recommendation, previousRecommendation: null,
          reason: 'Initiation of coverage following the full model build.',
          authorName: ctx.names.analyst, createdAt: daysAgo(120),
        },
        {
          thesisId: thesis.id, companyId, targetPrice: target, previousTarget: previousTarget,
          recommendation: spec.recommendation, previousRecommendation: spec.recommendation,
          reason: 'Rolled the DCF forward one year and updated the WACC for the new risk-free rate.',
          authorName: ctx.names.analyst, createdAt: daysAgo(9),
        },
      ],
    });

  }

  // Every other covered company gets a model too, so the screener, the
  // comparables and the agents have something to read on all 55 names.
  for (const bp of BLUEPRINTS) {
    const companyId = ctx.companyIds[bp.profile.ticker];
    if (!companyId) continue;
    if (THESIS_SPECS.some((t) => t.ticker === bp.profile.ticker)) continue;
    await seedDcfModel(bp.profile.ticker, companyId);
  }

  /* --------------------------- Normalization --------------------------- */
  await prisma.normalizationAdjustment.createMany({
    data: [
      {
        workspaceId: ctx.workspaceId, companyId: ctx.companyIds.VALE3, periodLabel: `FY${LATEST_FISCAL_YEAR}`,
        lineItem: 'EBITDA', category: 'RESTRUCTURING', amount: 1850,
        rationale: 'Non-recurring provision related to legacy liabilities, added back to reach a comparable operating result.',
        authorName: ctx.names.analyst, createdAt: daysAgo(30),
      },
      {
        workspaceId: ctx.workspaceId, companyId: ctx.companyIds.VALE3, periodLabel: `FY${LATEST_FISCAL_YEAR}`,
        lineItem: 'NET_INCOME', category: 'UNUSUAL_TAX', amount: -640,
        rationale: 'One-off deferred tax credit removed; it does not recur and inflates the reported bottom line.',
        authorName: ctx.names.pm, createdAt: daysAgo(29),
      },
      {
        workspaceId: ctx.workspaceId, companyId: ctx.companyIds.RENT3, periodLabel: `FY${LATEST_FISCAL_YEAR}`,
        lineItem: 'EBITDA', category: 'ONE_OFF_EXPENSE', amount: 420,
        rationale: 'Integration costs from the fleet acquisition, treated as non-recurring for comparability.',
        authorName: ctx.names.analyst, createdAt: daysAgo(26),
      },
    ],
  });

  /* ----------------------- Qualitative decks and Q&A ----------------------- */
  // Three decks across three sectors, of deliberately different shapes: a
  // high-conviction long, a short whose stress test already broke, and a
  // hold where the core point has no falsifier written for it yet.
  const DECKS: {
    ticker: string;
    status: string;
    summary: string;
    theses: { title: string; weight: string; rationale: string; requires: string[]; breaks: string[]; conviction: string }[];
    risks: { title: string; category: string; probability: number; impact: number; detail: string; mitigation: string }[];
    stress: { kind: string; title: string; trigger: string; consequence: string; verdict: string; response: string }[];
  }[] = [
    {
      ticker: 'VALE3',
      status: 'PUBLISHED',
      summary: 'A low-cost producer trading below replacement value, where the case rests on cost position rather than on a price forecast.',
      theses: [
        {
          title: 'Cost position survives a lower price deck',
          weight: 'CORE',
          rationale: 'Cash costs sit in the first quartile of the global curve. At prices that push half the curve into loss, this producer still generates cash, which is what makes the equity a claim on a cycle rather than a bet on one.',
          requires: ['Unit costs stay inside the first quartile', 'No step change in royalty or levy'],
          breaks: ['Costs rise above the second quartile for two consecutive years', 'A regulatory levy lands that the curve cannot absorb'],
          conviction: 'HIGH',
        },
        {
          title: 'Capital returns are policy, not discretion',
          weight: 'SUPPORTING',
          rationale: 'Distribution is formula-linked rather than decided each year, which narrows the range of outcomes for a minority holder.',
          requires: ['The policy survives a board change'],
          breaks: ['A large acquisition is funded from the distribution'],
          conviction: 'MEDIUM',
        },
        {
          title: 'The transition-metals division is optionality, not value',
          weight: 'OPTIONAL',
          rationale: 'It is modelled at its current economics. Anything better is upside nobody is paying for; the thesis does not need it.',
          requires: [],
          breaks: ['The division consumes capital at a rate the core cannot fund'],
          conviction: 'LOW',
        },
      ],
      risks: [
        { title: 'Demand from the largest importing economy slows structurally', category: 'DEMAND', probability: 0.55, impact: 0.7, detail: 'A structural rather than cyclical slowdown would reset the price deck the whole curve is drawn against.', mitigation: 'Volume and price tracked against the model premise each quarter.' },
        { title: 'Licence or levy change in the operating jurisdiction', category: 'REGULATORY', probability: 0.3, impact: 0.8, detail: 'A levy applies to revenue rather than profit, so it lands on the cost position directly.', mitigation: 'Legislative calendar monitored; the stress test below sizes it.' },
        { title: 'Logistics disruption at the export terminals', category: 'OPERATIONAL', probability: 0.6, impact: 0.25, detail: 'Recurring but small: shipments move between quarters rather than disappearing.', mitigation: 'Treated as timing in the quarterly premise check.' },
      ],
      stress: [
        { kind: 'COMPETITIVE', title: 'A new low-cost entrant adds supply at the bottom of the curve', trigger: 'A greenfield project reaches nameplate two years early and adds volume at costs below the first quartile.', consequence: 'The price the marginal tonne clears at falls; this producer stays cash-generative but the spread narrows.', verdict: 'WEAKENED', response: 'Re-cut the curve with the new entrant included before changing the target.' },
        { kind: 'REGULATORY', title: 'Revenue levy raised by 300 basis points', trigger: 'The operating jurisdiction raises the levy on gross revenue rather than on profit.', consequence: 'Cash cost rises by roughly the levy on revenue; the first-quartile position holds but the margin of safety thins.', verdict: 'SURVIVES', response: 'Sized in the bear case; no change to the recommendation.' },
      ],
    },
    {
      ticker: 'RENT3',
      status: 'PUBLISHED',
      summary: 'A leveraged balance sheet meeting a higher cost of debt, where the refinancing window matters more than the operating story.',
      theses: [
        {
          title: 'The refinancing window is the thesis',
          weight: 'CORE',
          rationale: 'Debt raised in a low-rate period comes due into a materially higher curve. Rolling it at current spreads absorbs a large share of operating cash flow before anything reaches equity.',
          requires: ['Cost of debt on refinanced tranches stays below the operating margin'],
          breaks: ['A tranche is refinanced at a spread that turns interest coverage below two times'],
          conviction: 'HIGH',
        },
        {
          title: 'Residual values are a second-order exposure',
          weight: 'SUPPORTING',
          rationale: 'The used-asset market sets the exit value of the fleet. A soft residual market compounds the financing problem rather than offsetting it.',
          requires: ['Used prices stay within the depreciation schedule'],
          breaks: ['Two consecutive quarters of losses on asset disposals'],
          conviction: 'MEDIUM',
        },
      ],
      risks: [
        { title: 'Refinancing at a spread the operating margin cannot carry', category: 'FINANCIAL', probability: 0.65, impact: 0.85, detail: 'The largest tranche matures inside the thesis horizon.', mitigation: 'No mitigation available to a minority holder; it is the reason for the recommendation.' },
        { title: 'Residual values fall faster than the depreciation schedule', category: 'OPERATIONAL', probability: 0.5, impact: 0.6, detail: 'Disposal losses would hit the income statement and the collateral value at once.', mitigation: 'Disposal gains tracked quarterly.' },
      ],
      stress: [
        { kind: 'FINANCING', title: 'Cost of debt rises 300 basis points at refinancing', trigger: 'The maturing tranche is rolled at 300 basis points above the rate it carried.', consequence: 'Interest coverage falls below two times and the equity value in the base case goes to a fraction of the current price.', verdict: 'BROKEN', response: 'This is the case. The recommendation follows from it rather than despite it.' },
        { kind: 'OPERATIONAL', title: 'Used-asset prices fall 15%', trigger: 'A soft secondary market pushes realised disposal prices 15% below the carrying schedule.', consequence: 'Disposal losses and a lower collateral value at the same moment as the refinancing.', verdict: 'BROKEN', response: 'Compounds the financing case; no offset.' },
      ],
    },
    {
      ticker: 'MSFT',
      status: 'DRAFT',
      summary: 'Recurring revenue and pricing power against a capital cycle nobody has seen the end of.',
      theses: [
        {
          title: 'Enterprise agreements carry pricing power through the cycle',
          weight: 'CORE',
          rationale: 'Contracted, multi-year and renewed at a rate that has not moved through two downturns. Price rises land inside the agreement rather than being negotiated each year.',
          requires: [],
          breaks: [],
          conviction: 'HIGH',
        },
        {
          title: 'Capital intensity is temporary, not structural',
          weight: 'SUPPORTING',
          rationale: 'The current build is a step function rather than a new run rate. If it is a new run rate, returns on incremental capital fall and the multiple is wrong.',
          requires: ['Capex as a share of revenue falls back inside three years'],
          breaks: ['Capex stays above the current share for three consecutive years with no matching revenue'],
          conviction: 'MEDIUM',
        },
      ],
      risks: [
        { title: 'Returns on the capital cycle disappoint', category: 'FINANCIAL', probability: 0.5, impact: 0.7, detail: 'The capital is being deployed ahead of the revenue it is meant to serve.', mitigation: 'ROIC tracked against the thesis assumption each quarter.' },
        { title: 'Competitive pressure in cloud infrastructure', category: 'COMPETITIVE', probability: 0.35, impact: 0.5, detail: 'Segment growth compared against peers each quarter.', mitigation: 'Segment disclosure read at every result.' },
      ],
      stress: [
        { kind: 'COMPETITIVE', title: 'A competitor prices infrastructure 20% below', trigger: 'A peer with a different economic model prices to fill capacity.', consequence: 'Gross margin on the infrastructure line compresses; the agreement business is unaffected.', verdict: 'WEAKENED', response: 'Split the segment in the model before revising the target.' },
        { kind: 'OTHER', title: 'Capital cycle extends a further three years', trigger: 'Capex stays at the current share of revenue through the forecast horizon.', consequence: 'Free cash flow grows materially slower than earnings for the whole horizon.', verdict: 'UNTESTED', response: '' },
      ],
    },
  ];

  for (const deck of DECKS) {
    const companyId = ctx.companyIds[deck.ticker];
    if (!companyId) continue;
    await prisma.qualitativeDeck.create({
      data: {
        workspaceId: ctx.workspaceId, companyId,
        status: deck.status, summary: deck.summary,
        theses: j(deck.theses.map((t, i) => ({
          id: `thesis-${deck.ticker.toLowerCase()}-${i + 1}`,
          order: i + 1, title: t.title, weight: t.weight, rationale: t.rationale,
          requires: t.requires, breaks: t.breaks, drivers: [], conviction: t.conviction,
        }))),
        risks: j(deck.risks.map((r, i) => ({
          id: `risk-${deck.ticker.toLowerCase()}-${i + 1}`,
          title: r.title, category: r.category, probability: r.probability, impact: r.impact,
          detail: r.detail, mitigation: r.mitigation,
        }))),
        stressTests: j(deck.stress.map((t, i) => ({
          id: `stress-${deck.ticker.toLowerCase()}-${i + 1}`,
          kind: t.kind, title: t.title, trigger: t.trigger, consequence: t.consequence,
          verdict: t.verdict, response: t.response || null,
        }))),
        authorName: ctx.names.analyst,
        createdAt: daysAgo(40), updatedAt: daysAgo(7),
      },
    });
  }

  // A prepared committee pack on the published deck, and one question nobody
  // has closed — which is what the consolidation screen is meant to surface.
  await prisma.qaItem.createMany({
    data: [
      {
        workspaceId: ctx.workspaceId, companyId: ctx.companyIds.VALE3, theme: 'VALUATION',
        question: 'What exit multiple does your perpetuity growth assumption imply, and is the market paying it today?',
        draftAnswer: 'The reconciliation screen shows both terminal methods side by side and the multiple the growth assumption implies at the final-year EBITDA, against the peer median on the comparables screen.',
        citations: j(['Terminal value reconciliation — Valuation tab', 'Peer median EV/EBITDA — Comparables tab']),
        hasGap: false, status: 'PREPARED', createdBy: ctx.names.analyst,
      },
      {
        workspaceId: ctx.workspaceId, companyId: ctx.companyIds.VALE3, theme: 'CAPITAL_STRUCTURE',
        question: 'How much refinancing does the company face, and what happens to the thesis if the cost of debt rises 300 basis points?',
        draftAnswer: 'Net debt and the cost of debt are on the model. The maturity profile is not in the workspace.',
        citations: j(['Net debt — Financials tab', 'Cost of debt — WACC build']),
        hasGap: true, status: 'NEEDS_WORK',
        notes: 'No debt maturity schedule is loaded. A refinancing question needs one; the rest can be answered from the statements.',
        createdBy: ctx.names.analyst,
      },
      {
        workspaceId: ctx.workspaceId, companyId: ctx.companyIds.VALE3, theme: 'COMPETITION',
        question: 'Why does this company earn its returns rather than the competitor next to it, and how durable is that?',
        draftAnswer: 'ROIC against the peer set is on the comparables screen, and the cost-position argument is the core point of the deck.',
        citations: j(['ROIC vs peers — Comparables tab', 'Core thesis — Deck & Q&A']),
        hasGap: false, status: 'PREPARED', createdBy: ctx.names.analyst,
      },
    ],
  });

  /* --------------------------- Sector analysis ---------------------------- */
  // One worked example and the row set it produced, saved as a template. The
  // rows are the ones an analyst chose for these companies, not a default the
  // product ships: a different analyst covering the same names would keep a
  // different table, and the product has no opinion about which is right.
  const MINING_ROWS = [
    { key: 'ebitdaMargin', label: 'EBITDA margin', kind: 'METRIC', metric: 'ebitdaMargin', format: 'percent', inverse: false },
    { key: 'roic', label: 'ROIC', kind: 'METRIC', metric: 'roic', format: 'percent', inverse: false },
    { key: 'netDebtToEbitda', label: 'Net debt / EBITDA', kind: 'METRIC', metric: 'netDebtToEbitda', format: 'multiple', inverse: true },
    { key: 'capexToRevenue', label: 'Capex % of revenue', kind: 'METRIC', metric: 'capexToRevenue', format: 'percent', inverse: true },
    { key: 'evEbitda', label: 'EV / EBITDA', kind: 'METRIC', metric: 'evEbitda', format: 'multiple', inverse: true },
    { key: 'fcfYield', label: 'FCF yield', kind: 'METRIC', metric: 'fcfYield', format: 'percent', inverse: false },
    { key: 'position', label: 'Position on the cost curve', kind: 'MANUAL', format: 'text', inverse: false },
    { key: 'jurisdictions', label: 'Principal jurisdictions', kind: 'MANUAL', format: 'text', inverse: false },
  ];

  await prisma.sectorAnalysis.create({
    data: {
      workspaceId: ctx.workspaceId,
      sector: 'Diversified mining',
      title: 'Diversified mining — cost position and capital discipline',
      status: 'PUBLISHED',
      sections: j([
        {
          key: 'structure',
          title: 'Industry structure',
          body: 'Four producers account for most of the seaborne supply, and the marginal tonne is set by a long tail of higher-cost operations. Where a producer sits on that curve decides how much of the cycle reaches its equity, which is why the comparison below leads with margin and cost rather than with multiples.',
        },
        {
          key: 'capital',
          title: 'Capital discipline',
          body: 'The last cycle was lost to capital allocation rather than to prices. Capex as a share of revenue and net debt against EBITDA are here for that reason: they are the two measures that separated the producers that compounded from the ones that survived.',
        },
        {
          key: 'conclusion',
          title: 'What this means for coverage',
          body: 'Coverage is anchored on cost position rather than on a price forecast. The manual rows carry what no metric can: where each producer sits on the curve, and which jurisdictions it depends on.',
        },
      ]),
      tickers: j(['VALE3', 'RIO', 'BHP', 'FCX', 'SUZB3']),
      rows: j(MINING_ROWS.map((r) => (r.kind === 'MANUAL'
        ? { ...r, values: {
            VALE3: r.key === 'position' ? 'First quartile' : 'Brazil, Indonesia',
            RIO: r.key === 'position' ? 'First quartile' : 'Australia, Canada, Mongolia',
            BHP: r.key === 'position' ? 'First quartile' : 'Australia, Chile',
            FCX: r.key === 'position' ? 'Second quartile' : 'Indonesia, United States, Peru',
            SUZB3: r.key === 'position' ? 'First quartile' : 'Brazil',
          } }
        : r))),
      authorName: ctx.names.analyst,
      createdAt: daysAgo(35), updatedAt: daysAgo(11),
    },
  });

  await prisma.peerComparisonTemplate.create({
    data: {
      workspaceId: ctx.workspaceId,
      name: 'Cost-curve producers',
      sector: 'Diversified mining',
      rows: j(MINING_ROWS),
      authorName: ctx.names.analyst,
      createdAt: daysAgo(35), updatedAt: daysAgo(35),
    },
  });

  /* ------------------------------ Peer groups ------------------------------ */
  await prisma.peerGroup.createMany({
    data: [
      { workspaceId: ctx.workspaceId, name: 'Global diversified miners', anchorTicker: 'VALE3', companyIds: j(['VALE3', 'RIO', 'BHP', 'FCX']) },
      { workspaceId: ctx.workspaceId, name: 'Brazilian banks', anchorTicker: 'ITUB4', companyIds: j(['ITUB4', 'BBAS3', 'BPAC11']) },
      { workspaceId: ctx.workspaceId, name: 'Mega-cap technology', anchorTicker: 'MSFT', companyIds: j(['MSFT', 'AAPL', 'GOOGL', 'NVDA', 'META', 'AMZN']) },
    ],
  });

  /* ------------------------------ Watchlists ------------------------------ */
  const watchlists: { name: string; description: string; tickers: string[] }[] = [
    { name: 'Brazilian core holdings', description: 'Names with an active thesis and a position or a candidate position.', tickers: ['VALE3', 'PETR4', 'ITUB4', 'WEGE3', 'SUZB3', 'BBAS3'] },
    { name: 'Global technology', description: 'Mega-cap technology tracked for the global sleeve.', tickers: ['MSFT', 'AAPL', 'NVDA', 'GOOGL', 'META', 'AMZN'] },
    { name: 'High ROIC compounders', description: 'Businesses earning returns well above their cost of capital.', tickers: ['WEGE3', 'MSFT', 'ABEV3', 'TOTS3', 'B3SA3'] },
    { name: 'Deep value screen output', description: 'Cheap on cash generation, awaiting a catalyst.', tickers: ['PETR4', 'BBAS3', 'VALE3', 'XOM'] },
    { name: 'Turnarounds and watch items', description: 'Theses under review or deteriorating.', tickers: ['RENT3', 'HAPV3', 'EQTL3', 'LREN3'] },
  ];
  for (const w of watchlists) {
    const list = await prisma.watchlist.create({
      data: { workspaceId: ctx.workspaceId, name: w.name, description: w.description, createdAt: daysAgo(90) },
    });
    await prisma.watchlistItem.createMany({
      data: w.tickers
        .filter((t) => ctx.companyIds[t])
        .map((t) => ({ watchlistId: list.id, companyId: ctx.companyIds[t], addedAt: daysAgo(80) })),
    });
  }

  /* ------------------------------ Portfolios ------------------------------ */
  // The book is built across the whole price history: a core established near
  // inception and additions layered in later. Average prices are set from the
  // generated close on the trade date below, so cost basis, the transaction
  // ledger and the NAV history all describe the same events.
  const holdings: { ticker: string; quantity: number; days: number }[] = [
    { ticker: 'ITUB4', quantity: 1_050_000, days: 1_340 },
    { ticker: 'ABEV3', quantity: 1_400_000, days: 1_320 },
    { ticker: 'VALE3', quantity: 640_000, days: 1_300 },
    { ticker: 'PETR4', quantity: 900_000, days: 1_270 },
    { ticker: 'BBAS3', quantity: 720_000, days: 1_180 },
    { ticker: 'B3SA3', quantity: 900_000, days: 980 },
    { ticker: 'WEGE3', quantity: 480_000, days: 760 },
    { ticker: 'RENT3', quantity: 180_000, days: 620 },
    { ticker: 'SUZB3', quantity: 260_000, days: 430 },
    { ticker: 'TOTS3', quantity: 210_000, days: 360 },
    { ticker: 'EQTL3', quantity: 300_000, days: 260 },
    { ticker: 'PRIO3', quantity: 160_000, days: 190 },
  ];

  const flagshipCash = 4_250_000;
  const flagshipBuilt = await buildBook({
    workspaceId: ctx.workspaceId,
    name: 'Meridian Equities FIA',
    description: 'Flagship long-only Brazilian equity fund benchmarked against the Ibovespa.',
    baseCurrency: 'BRL',
    cash: flagshipCash,
    benchmarkCode: 'IBOV',
    isModel: false,
    holdings,
    companyIds: ctx.companyIds,
    daysAgo,
    traderName: ctx.names.pm,
    treasurerName: ctx.names.admin,
    depositNote: 'Fund seed capital.',
    tradeNote: 'Position opened following committee approval.',
  });
  const flagship = flagshipBuilt.portfolio;

  // Global sleeve, a smaller model portfolio.
  const globalHoldings = [
    { ticker: 'MSFT', quantity: 9_000, days: 1_120 },
    { ticker: 'AAPL', quantity: 12_000, days: 1_050 },
    { ticker: 'GOOGL', quantity: 14_000, days: 880 },
    { ticker: 'NVDA', quantity: 18_000, days: 540 },
    { ticker: 'META', quantity: 4_200, days: 300 },
  ];
  const globalBuilt = await buildBook({
    workspaceId: ctx.workspaceId,
    name: 'Global Quality Sleeve',
    description: 'Model portfolio of global compounders used for the offshore allocation study.',
    baseCurrency: 'BRL',
    cash: 900_000,
    benchmarkCode: 'SPX',
    isModel: true,
    holdings: globalHoldings,
    companyIds: ctx.companyIds,
    daysAgo,
    traderName: ctx.names.pm,
    treasurerName: ctx.names.admin,
    depositNote: 'Allocation funded from the offshore sleeve.',
    tradeNote: 'Model position opened for the offshore allocation study.',
  });
  const global = globalBuilt.portfolio;

  await prisma.rebalanceTargetRecord.createMany({
    data: [
      { portfolioId: flagship.id, ticker: 'VALE3', targetWeight: 0.11 },
      { portfolioId: flagship.id, ticker: 'PETR4', targetWeight: 0.10 },
      { portfolioId: flagship.id, ticker: 'ITUB4', targetWeight: 0.12 },
      { portfolioId: flagship.id, ticker: 'WEGE3', targetWeight: 0.06 },
      { portfolioId: flagship.id, ticker: 'SUZB3', targetWeight: 0.05 },
      { portfolioId: flagship.id, ticker: 'BBAS3', targetWeight: 0.08 },
      { portfolioId: flagship.id, ticker: 'ABEV3', targetWeight: 0.07 },
      { portfolioId: flagship.id, ticker: 'B3SA3', targetWeight: 0.07 },
      { portfolioId: flagship.id, ticker: 'RENT3', targetWeight: 0.02 },
      { portfolioId: flagship.id, ticker: 'TOTS3', targetWeight: 0.05 },
      { portfolioId: flagship.id, ticker: 'EQTL3', targetWeight: 0.05 },
      { portfolioId: flagship.id, ticker: 'PRIO3', targetWeight: 0.04 },
    ],
  });

  // NAV history is derived from the ledger rather than invented: on each trading
  // day the book is valued at the close of what it actually held that day, plus
  // the cash it actually had. Every risk and attribution number downstream is
  // therefore a statement about the same positions shown on the screen.
  await seedNavSeries(flagship.id, 'IBOV', flagshipBuilt);
  await seedNavSeries(global.id, 'SPX', globalBuilt);

  /* -------------------------------- Alerts -------------------------------- */
  const alerts = [
    { ticker: 'VALE3', name: 'VALE3 EV/EBITDA below 4.0x', category: 'VALUATION', metric: 'evEbitda', comparator: 'LT', threshold: 4, severity: 'IMPORTANT' },
    { ticker: 'RENT3', name: 'RENT3 ROIC below WACC', category: 'FUNDAMENTAL', metric: 'roicSpread', comparator: 'LT', threshold: 0, severity: 'CRITICAL' },
    { ticker: 'SUZB3', name: 'SUZB3 net debt/EBITDA above 3.0x', category: 'FUNDAMENTAL', metric: 'netDebtToEbitda', comparator: 'GT', threshold: 3, severity: 'IMPORTANT' },
    { ticker: 'PETR4', name: 'PETR4 reaches target price', category: 'PRICE', metric: 'price', comparator: 'GTE', threshold: 45.5, severity: 'IMPORTANT' },
    { ticker: 'WEGE3', name: 'WEGE3 revenue growth below 10%', category: 'FUNDAMENTAL', metric: 'revenueGrowth', comparator: 'LT', threshold: 0.10, severity: 'IMPORTANT' },
    { ticker: 'NVDA', name: 'NVDA EV/EBITDA above 30x', category: 'VALUATION', metric: 'evEbitda', comparator: 'GT', threshold: 30, severity: 'INFORMATIONAL' },
    { ticker: 'ITUB4', name: 'ITUB4 ROE below 20%', category: 'FUNDAMENTAL', metric: 'roe', comparator: 'LT', threshold: 0.20, severity: 'IMPORTANT' },
    { ticker: 'HAPV3', name: 'HAPV3 EBITDA margin below 14%', category: 'FUNDAMENTAL', metric: 'ebitdaMargin', comparator: 'LT', threshold: 0.14, severity: 'INFORMATIONAL' },
  ];
  for (const a of alerts) {
    await prisma.alert.create({
      data: {
        workspaceId: ctx.workspaceId, companyId: ctx.companyIds[a.ticker] ?? null,
        name: a.name, category: a.category, metric: a.metric, comparator: a.comparator,
        threshold: a.threshold, severity: a.severity, enabled: true, createdBy: ctx.names.analyst,
        createdAt: daysAgo(70),
      },
    });
  }

  /* ----------------------------- Saved screens ----------------------------- */
  await prisma.savedScreen.createMany({
    data: [
      {
        workspaceId: ctx.workspaceId, name: 'Quality at a reasonable price',
        filters: j([
          { metric: 'roic', comparator: 'GTE', value: 0.15 },
          { metric: 'evEbitda', comparator: 'LTE', value: 12 },
          { metric: 'revenueGrowth', comparator: 'GTE', value: 0.05 },
        ]),
        sortBy: 'roic', createdBy: ctx.names.analyst, createdAt: daysAgo(60),
      },
      {
        workspaceId: ctx.workspaceId, name: 'Cash generative and lowly levered',
        filters: j([
          { metric: 'fcfYield', comparator: 'GTE', value: 0.08 },
          { metric: 'netDebtToEbitda', comparator: 'LTE', value: 1.5 },
        ]),
        sortBy: 'fcfYield', createdBy: ctx.names.pm, createdAt: daysAgo(45),
      },
      {
        workspaceId: ctx.workspaceId, name: 'Brazilian large caps under 10x earnings',
        filters: j([
          { metric: 'pe', comparator: 'LTE', value: 10 },
          { metric: 'marketCap', comparator: 'GTE', value: 20000 },
        ]),
        sortBy: 'pe', createdBy: ctx.names.analyst, createdAt: daysAgo(20),
      },
    ],
  });

  /* ------------------------------ Research ------------------------------ */
  const noteSections = (ticker: string, name: string) => [
    { key: 'executive-summary', title: 'Executive summary', body: `We are publishing an updated view on ${name} (${ticker}) following the latest quarterly print and a full roll-forward of the discounted cash flow model. The valuation section sets out the fair value under the base case and the sensitivity to the two assumptions that matter most.` },
    { key: 'investment-thesis', title: 'Investment thesis', body: `The thesis rests on three observable measures tracked in the monitoring module: the operating margin trajectory, the spread between return on invested capital and the cost of capital, and the conversion of EBITDA into free cash flow. Each is checked against its threshold at every reporting date.` },
    { key: 'business', title: 'Business', body: `Revenue is built from the segment disclosure in the financial statements tab. Where the company does not disclose a segment margin we mark the figure as unavailable rather than estimating it.` },
    { key: 'industry', title: 'Industry', body: `Peer comparison is drawn from the comparables module using the peer group defined for this name. Multiples are computed from the same statement set used elsewhere in the workspace, so a figure here reconciles to the company page.` },
    { key: 'financials', title: 'Financial analysis', body: `Margins, returns, working capital and leverage are analysed in the fundamentals tab. Normalization adjustments, where applied, are listed with their rationale and author.` },
    { key: 'valuation', title: 'Valuation', body: `The discounted cash flow uses a WACC derived from the capital asset pricing model with the workspace risk-free rate and equity risk premium. The terminal value is computed on the Gordon growth method and cross-checked against the implied exit multiple.` },
    { key: 'catalysts', title: 'Catalysts', body: `The catalyst timeline lists each event with its expected impact and probability. Events are marked as occurred once the corresponding disclosure is loaded.` },
    { key: 'risks', title: 'Risks', body: `Risks are tracked with a severity and probability and are mapped to the bear case in the scenario module.` },
    { key: 'conclusion', title: 'Conclusion', body: `The recommendation and target price in the header reflect the base case fair value; the expected value across the three scenarios is shown alongside it in the thesis module.` },
  ];

  const noteSpecs = [
    { ticker: 'VALE3', title: 'Vale — the market is paying for the wrong cycle', rec: 'BUY', status: 'PUBLISHED', days: 9 },
    { ticker: 'ITUB4', title: 'Itaú Unibanco — compounding through the easing cycle', rec: 'BUY', status: 'PUBLISHED', days: 16 },
    { ticker: 'RENT3', title: 'Localiza — fleet economics have inverted', rec: 'SELL', status: 'PUBLISHED', days: 24 },
    { ticker: 'NVDA', title: 'NVIDIA — what the price already requires', rec: 'HOLD', status: 'PUBLISHED', days: 31 },
    { ticker: 'WEGE3', title: 'WEG — a great business at a demanding price', rec: 'HOLD', status: 'DRAFT', days: 3 },
    { ticker: 'SUZB3', title: 'Suzano — capex normalisation is the whole story', rec: 'BUY', status: 'PUBLISHED', days: 40 },
  ];

  for (const n of noteSpecs) {
    const companyId = ctx.companyIds[n.ticker];
    if (!companyId) continue;
    const bp = findBlueprint(n.ticker)!;
    const spec = THESIS_SPECS.find((t) => t.ticker === n.ticker);
    const sections = noteSections(n.ticker, bp.profile.name);
    const note = await prisma.researchNote.create({
      data: {
        workspaceId: ctx.workspaceId, companyId, authorId: ctx.users.analyst,
        title: n.title, status: n.status, recommendation: n.rec,
        targetPrice: spec ? Math.round(bp.anchors.price * (1 + spec.upside) * 100) / 100 : null,
        conviction: spec?.conviction ?? 'MEDIUM',
        sections: j(sections), tags: j([bp.profile.sector, bp.profile.country, n.rec]),
        createdAt: daysAgo(n.days + 5), updatedAt: daysAgo(n.days),
      },
    });
    await prisma.researchNoteVersion.createMany({
      data: [
        { noteId: note.id, version: 1, title: n.title, sections: j(sections.slice(0, 4)), authorName: ctx.names.analyst, createdAt: daysAgo(n.days + 5) },
        { noteId: note.id, version: 2, title: n.title, sections: j(sections), authorName: ctx.names.analyst, createdAt: daysAgo(n.days) },
      ],
    });
  }

  /* --------------------------- Investment memos --------------------------- */
  const memoSections = (name: string) => [
    { key: 'executive-summary', title: '1. Executive summary', body: `Recommendation, target price and proposed position size for ${name}, with the expected value across the bull, base and bear cases.` },
    { key: 'investment-thesis', title: '2. Investment thesis', body: 'The three propositions the investment depends on, each mapped to a measurable assumption tracked by the monitoring module.' },
    { key: 'business-overview', title: '3. Business overview', body: 'Revenue model, segment mix, geographic exposure and the customer base as disclosed in the filings loaded into this workspace.' },
    { key: 'industry', title: '4. Industry', body: 'Structure of the industry, the position of this company inside it, and the peer set used for the comparables analysis.' },
    { key: 'financial-analysis', title: '5. Financial analysis', body: 'Growth, margins, returns on capital, working capital and leverage over the reported history, with normalization adjustments listed separately.' },
    { key: 'competitive-position', title: '6. Competitive position', body: 'Sources of durable advantage and the evidence for each in the financial record.' },
    { key: 'valuation', title: '7. Valuation', body: 'Discounted cash flow, trading comparables and the historical multiple range, with the reverse DCF stating what the current price already requires.' },
    { key: 'catalysts', title: '8. Catalysts', body: 'Dated events with expected impact and probability.' },
    { key: 'risks', title: '9. Risks', body: 'Ranked by severity and probability, with the mitigation or the position-sizing response for each.' },
    { key: 'scenarios', title: '10. Bull / base / bear', body: 'Three independent sets of assumptions, their fair values, and the probability weighting that produces the expected value.' },
    { key: 'portfolio-role', title: '11. Portfolio role', body: 'How the position interacts with the existing book: sector exposure, factor tilt, and the correlation with the largest holdings.' },
    { key: 'conclusion', title: '12. Conclusion', body: 'The decision requested of the committee and the conditions under which the thesis would be abandoned.' },
  ];

  for (const t of ['VALE3', 'ITUB4', 'SUZB3']) {
    const companyId = ctx.companyIds[t];
    const bp = findBlueprint(t)!;
    const spec = THESIS_SPECS.find((s) => s.ticker === t)!;
    const memo = await prisma.investmentMemo.create({
      data: {
        workspaceId: ctx.workspaceId, companyId, authorId: ctx.users.analyst,
        title: `${bp.profile.name} — investment memo`,
        status: t === 'VALE3' ? 'UNDER_REVIEW' : 'DRAFT',
        sections: j(memoSections(bp.profile.name)),
        recommendation: spec.recommendation,
        targetPrice: Math.round(bp.anchors.price * (1 + spec.upside) * 100) / 100,
        portfolioRole: t === 'VALE3' ? 'Core cyclical exposure, sized at up to 11% of the fund.' : 'Satellite position sized at up to 5%.',
        createdAt: daysAgo(20), updatedAt: daysAgo(4),
      },
    });

    if (t === 'VALE3') {
      const item = await prisma.committeeItem.create({
        data: {
          workspaceId: ctx.workspaceId, companyId, memoId: memo.id,
          title: 'Vale — increase position to 11%',
          proposal: 'INCREASE', recommendation: 'BUY',
          targetPrice: Math.round(bp.anchors.price * 1.27 * 100) / 100,
          proposedWeight: 0.11, status: 'UNDER_REVIEW',
          meetingDate: monthsFromNow(0.3),
          summary: 'Proposal to raise the position by roughly two percentage points, funded from the cash balance, on the basis of the updated DCF and the discount to the historical multiple range.',
          createdBy: ctx.names.analyst, createdAt: daysAgo(4), updatedAt: daysAgo(2),
        },
      });
      await prisma.committeeVote.createMany({
        data: [
          { itemId: item.id, userId: ctx.users.pm, vote: 'APPROVE', rationale: 'Risk-reward is favourable and the position remains within the single-name limit.', createdAt: daysAgo(2) },
          { itemId: item.id, userId: ctx.users.admin, vote: 'ABSTAIN', rationale: 'Would prefer to wait for the production report before adding.', createdAt: daysAgo(2) },
        ],
      });
      await prisma.committeeComment.createMany({
        data: [
          { itemId: item.id, userId: ctx.users.pm, body: 'Please add the sensitivity of the fair value to a 10 dollar move in the benchmark iron ore price before the meeting.', createdAt: daysAgo(3) },
          { itemId: item.id, userId: ctx.users.analyst, body: 'Added to the valuation section — a 10 dollar move is worth roughly 8% of fair value on the base case.', createdAt: daysAgo(2) },
        ],
      });
    }
  }

  /* ------------------------------- Documents ------------------------------- */
  await prisma.document.createMany({
    data: [
      {
        workspaceId: ctx.workspaceId, companyId: ctx.companyIds.VALE3,
        name: `VALE3 ${LATEST_FISCAL_YEAR} Q4 earnings release.txt`, kind: 'EARNINGS_RELEASE',
        mimeType: 'text/plain', sizeBytes: 4820,
        content: 'Simulated earnings release loaded by MockMarketDataProvider. Revenue, EBITDA and net income for the period are recorded in the financial statements tab with the same values.',
        extraction: j({ metrics: [{ label: 'Revenue', value: null, note: 'Loaded from the statements dataset rather than parsed from this document.' }] }),
        tags: j(['earnings', 'VALE3']), uploadedBy: ctx.names.analyst, createdAt: daysAgo(50),
      },
      {
        workspaceId: ctx.workspaceId, companyId: ctx.companyIds.ITUB4,
        name: 'ITUB4 investor presentation.txt', kind: 'PRESENTATION',
        mimeType: 'text/plain', sizeBytes: 6210,
        content: 'Simulated investor presentation. Guidance items referenced in the thesis assumptions are recorded against the thesis rather than inferred from this file.',
        extraction: null, tags: j(['presentation', 'ITUB4']), uploadedBy: ctx.names.researcher, createdAt: daysAgo(38),
      },
    ],
  });

  /* ----------------------------- Notifications ----------------------------- */
  await prisma.notification.createMany({
    data: [
      { workspaceId: ctx.workspaceId, userId: ctx.users.pm, severity: 'CRITICAL', category: 'THESIS', title: 'RENT3 — return on invested capital has fallen below the cost of capital', body: 'The value-creation assumption in the Localiza thesis is no longer holding. Review the thesis and the position weight.', ticker: 'RENT3', href: '/companies/RENT3/thesis', createdAt: daysAgo(2) },
      { workspaceId: ctx.workspaceId, userId: ctx.users.pm, severity: 'IMPORTANT', category: 'VALUATION', title: 'VALE3 — EV/EBITDA is in the lowest decile of its five-year range', body: 'The current multiple sits well below the five-year median. The valuation gap is the core of the published thesis.', ticker: 'VALE3', href: '/companies/VALE3/valuation', createdAt: daysAgo(3) },
      { workspaceId: ctx.workspaceId, userId: ctx.users.analyst, severity: 'IMPORTANT', category: 'EARNINGS', title: 'SUZB3 reported second-quarter results', body: 'The print has been loaded into the earnings module with the consensus comparison and the variance analysis.', ticker: 'SUZB3', href: '/earnings', createdAt: daysAgo(5) },
      { workspaceId: ctx.workspaceId, userId: null, severity: 'INFORMATIONAL', category: 'SYSTEM', title: 'Consensus data source is stale', body: 'MockConsensusProvider last refreshed more than five days ago. Estimates shown may not reflect the latest revisions.', href: '/settings/data-sources', createdAt: daysAgo(6) },
      { workspaceId: ctx.workspaceId, userId: ctx.users.analyst, severity: 'INFORMATIONAL', category: 'PORTFOLIO', title: 'Rebalancing drift exceeds 200 bps on three positions', body: 'ITUB4, WEGE3 and PRIO3 have drifted from their target weights beyond the tolerance band.', href: '/portfolio', createdAt: daysAgo(1) },
    ],
  });

  /* ------------------------------ Audit trail ------------------------------ */
  await prisma.auditLog.createMany({
    data: [
      { workspaceId: ctx.workspaceId, userId: ctx.users.analyst, actorName: ctx.names.analyst, action: 'UPDATE', entityType: 'InvestmentThesis', entityLabel: 'VALE3 thesis', field: 'targetPrice', previousValue: '71.85', newValue: '77.98', summary: 'Target price changed from R$ 71,85 to R$ 77,98 after rolling the DCF forward one year.', createdAt: daysAgo(9) },
      { workspaceId: ctx.workspaceId, userId: ctx.users.analyst, actorName: ctx.names.analyst, action: 'UPDATE', entityType: 'ValuationModel', entityLabel: 'VALE3 — DCF', field: 'wacc', previousValue: '0.1180', newValue: '0.1124', summary: 'WACC changed from 11.80% to 11.24% following the fall in the risk-free rate.', createdAt: daysAgo(9) },
      { workspaceId: ctx.workspaceId, userId: ctx.users.pm, actorName: ctx.names.pm, action: 'UPDATE', entityType: 'InvestmentThesis', entityLabel: 'RENT3 thesis', field: 'status', previousValue: 'ACTIVE', newValue: 'DETERIORATING', summary: 'Thesis status changed to deteriorating after the return on capital breached its threshold.', createdAt: daysAgo(2) },
      { workspaceId: ctx.workspaceId, userId: ctx.users.analyst, actorName: ctx.names.analyst, action: 'CREATE', entityType: 'NormalizationAdjustment', entityLabel: 'VALE3 FY2025 EBITDA', field: 'amount', previousValue: null, newValue: '1850', summary: 'Restructuring provision of R$ 1,85 bi added back to EBITDA for comparability.', createdAt: daysAgo(30) },
      { workspaceId: ctx.workspaceId, userId: ctx.users.pm, actorName: ctx.names.pm, action: 'CREATE', entityType: 'PortfolioTransaction', entityLabel: 'Meridian Equities FIA', field: null, previousValue: null, newValue: 'BUY PRIO3 160,000 @ 38.40', summary: 'Position opened in PRIO3 following committee approval.', createdAt: daysAgo(190) },
      { workspaceId: ctx.workspaceId, userId: ctx.users.admin, actorName: ctx.names.admin, action: 'LOGIN', entityType: 'User', entityLabel: ctx.names.admin, field: null, previousValue: null, newValue: null, summary: 'Signed in to the workspace.', createdAt: daysAgo(1) },
    ],
  });

  /* ---------------------------- AI conversation ---------------------------- */
  const conv = await prisma.aiConversation.create({
    data: {
      workspaceId: ctx.workspaceId, userId: ctx.users.analyst,
      title: 'Is Vale cheap?', contextType: 'COMPANY', contextId: 'VALE3',
      createdAt: daysAgo(3), updatedAt: daysAgo(3),
    },
  });
  await prisma.aiMessage.createMany({
    data: [
      { conversationId: conv.id, role: 'user', content: 'A Vale está barata?', createdAt: daysAgo(3) },
      {
        conversationId: conv.id, role: 'assistant',
        content: 'Answer assembled from the workspace dataset. Every figure below is traceable to the company page.',
        blocks: j([
          { kind: 'FACT', text: 'VALE3 trades at 3.7x EV/EBITDA on the last reported fiscal year, against a five-year median of 4.6x.', sources: ['FinancialStatement FY2025', 'PriceBar series'] },
          { kind: 'CALCULATION', text: 'Free cash flow yield on the current market capitalisation is 13.4%, computed as CFO less capex over market capitalisation.', sources: ['CashFlowStatement FY2025', 'Security.lastPrice'] },
          { kind: 'INTERPRETATION', text: 'The discount to the historical range is concentrated in the terminal assumptions rather than the next two years of earnings.', sources: ['DCF model VALE3'] },
          { kind: 'OPINION', text: 'On the workspace base case the shares appear undervalued, but the conclusion depends on the iron ore price assumption, which is an input rather than an observation.', sources: [] },
        ]),
        provider: 'deterministic', createdAt: daysAgo(3),
      },
    ],
  });

  /* --------------------------- Earnings reviews --------------------------- */
  const suzEarnings = await prisma.earningsEvent.findFirst({
    where: { companyId: ctx.companyIds.SUZB3 }, orderBy: { reportDate: 'desc' },
  });
  if (suzEarnings) {
    await prisma.earningsReview.create({
      data: {
        workspaceId: ctx.workspaceId, companyId: ctx.companyIds.SUZB3, earningsId: suzEarnings.id,
        headline: 'Cash cost per tonne improved while volumes met the plan; the capex step-down is visible for the first time.',
        analysis: j({
          positives: ['Cash cost per tonne fell against the prior quarter', 'Volumes in line with the annual plan', 'Capex fell below the quarterly run rate of the expansion phase'],
          negatives: ['Realised price below the prior quarter', 'Working capital consumed cash in the period'],
          surprises: ['EBITDA came in above the consensus recorded in this workspace'],
          guidance: ['Full-year capex reiterated', 'No change to the leverage target'],
          commentary: 'Management reiterated the deleveraging path.',
          thesisImpact: 'The capex normalisation assumption in the thesis is now supported by a reported quarter rather than by guidance alone.',
          valuationImpact: 'No change to the base-case fair value; the free cash flow profile is unchanged.',
        }),
        thesisImpact: 'SUPPORTS', authorName: ctx.names.analyst, createdAt: daysAgo(5),
      },
    });
  }
}

interface BuiltBook {
  portfolio: { id: string; name: string; cash: number };
  /** One entry per holding: shares held and the day they were bought. */
  lots: { ticker: string; companyId: string; quantity: number; price: number; tradeDate: Date }[];
  /** Cash the book holds today, after every purchase above. */
  endingCash: number;
  inceptionDate: Date;
  /** Subscriptions into the fund, in date order. Redemptions would be negative. */
  flows: { date: Date; amount: number }[];
}

/**
 * Creates a portfolio, its positions and the transaction ledger that produced
 * them. Each position is bought at the generated closing price on its trade
 * date, so the cost basis on screen is a price that actually occurred; the
 * opening deposit is then whatever those purchases plus the ending cash
 * required, which keeps the cash ledger articulated.
 */
async function buildBook(spec: {
  workspaceId: string;
  name: string;
  description: string;
  baseCurrency: string;
  cash: number;
  benchmarkCode: string;
  isModel: boolean;
  holdings: { ticker: string; quantity: number; days: number }[];
  companyIds: Record<string, string>;
  daysAgo: (n: number) => Date;
  traderName: string;
  treasurerName: string;
  depositNote: string;
  tradeNote: string;
}): Promise<BuiltBook> {
  const FEE_RATE = 0.0003;
  const lots: BuiltBook['lots'] = [];

  for (const h of spec.holdings) {
    const companyId = spec.companyIds[h.ticker];
    if (!companyId) continue;
    const target = spec.daysAgo(h.days);
    // The close on or immediately before the intended trade date.
    const bar = await prisma.priceBar.findFirst({
      where: { security: { companyId }, date: { lte: target } },
      orderBy: { date: 'desc' },
    });
    if (!bar) continue;
    lots.push({ ticker: h.ticker, companyId, quantity: h.quantity, price: bar.close, tradeDate: bar.date });
  }
  if (!lots.length) throw new Error(`No price history to build "${spec.name}".`);

  const inceptionDate = lots.reduce((min, l) => (l.tradeDate < min ? l.tradeDate : min), lots[0].tradeDate);
  const inceptionKey = inceptionDate.toISOString().slice(0, 10);
  const cost = (l: BuiltBook['lots'][number]) => l.quantity * l.price * (1 + FEE_RATE);

  // The book stays invested: the opening subscription funds the positions taken
  // at launch plus the working cash balance, and every later purchase is funded
  // by a subscription on the same day. The fund therefore never sits on idle
  // cash it did not choose to hold.
  const openingLots = lots.filter((l) => l.tradeDate.toISOString().slice(0, 10) === inceptionKey);
  const laterLots = lots.filter((l) => l.tradeDate.toISOString().slice(0, 10) !== inceptionKey);
  const openingDeposit = openingLots.reduce((s, l) => s + cost(l), 0) + spec.cash;

  const portfolio = await prisma.portfolio.create({
    data: {
      workspaceId: spec.workspaceId, name: spec.name, description: spec.description,
      baseCurrency: spec.baseCurrency, cash: spec.cash, benchmarkCode: spec.benchmarkCode,
      inceptionDate, isModel: spec.isModel,
    },
  });

  const flows: { date: Date; amount: number }[] = [{ date: inceptionDate, amount: openingDeposit }];
  await prisma.portfolioTransaction.create({
    data: {
      portfolioId: portfolio.id, kind: 'DEPOSIT',
      amount: Math.round(openingDeposit * 100) / 100,
      tradeDate: inceptionDate, note: spec.depositNote, createdBy: spec.treasurerName,
    },
  });
  for (const l of laterLots) {
    const amount = Math.round(cost(l) * 100) / 100;
    flows.push({ date: l.tradeDate, amount });
    await prisma.portfolioTransaction.create({
      data: {
        portfolioId: portfolio.id, kind: 'DEPOSIT', amount,
        tradeDate: l.tradeDate, note: `Subscription funding the ${l.ticker} position.`,
        createdBy: spec.treasurerName,
      },
    });
  }

  for (const l of lots) {
    await prisma.portfolioPosition.create({
      data: {
        portfolioId: portfolio.id, companyId: l.companyId, quantity: l.quantity,
        averagePrice: l.price, openedAt: l.tradeDate,
      },
    });
    await prisma.portfolioTransaction.create({
      data: {
        portfolioId: portfolio.id, companyId: l.companyId, kind: 'BUY', quantity: l.quantity,
        price: l.price, amount: -(l.quantity * l.price), fees: l.quantity * l.price * FEE_RATE,
        tradeDate: l.tradeDate, note: spec.tradeNote, createdBy: spec.traderName,
      },
    });
  }

  return { portfolio, lots, endingCash: spec.cash, inceptionDate, flows };
}

/**
 * Values the book at every trading day from inception: shares held on that day
 * at that day's close, plus the cash the ledger says the book held. The
 * benchmark column is the index rebased to the same starting NAV, so the two
 * series are directly comparable.
 */
async function seedNavSeries(portfolioId: string, benchmarkCode: string, book: BuiltBook) {
  const tickers = book.lots.map((l) => l.ticker);
  const bars = await prisma.priceBar.findMany({
    where: { security: { company: { ticker: { in: tickers } } }, date: { gte: book.inceptionDate } },
    orderBy: { date: 'asc' },
    include: { security: { include: { company: { select: { ticker: true, currency: true } } } } },
  });
  if (!bars.length) return;

  const fx = await prisma.marketIndicator.findUnique({ where: { code: 'USDBRL' } });
  const usdBrl = fx?.value ?? 5.18;
  const rateFor = (currency: string) => (currency === 'USD' ? usdBrl : 1);

  // close[date][ticker]
  const closes = new Map<string, Map<string, number>>();
  for (const b of bars) {
    const key = b.date.toISOString().slice(0, 10);
    if (!closes.has(key)) closes.set(key, new Map());
    closes.get(key)!.set(b.security.company.ticker, b.close * rateFor(b.security.company.currency));
  }
  const dates = Array.from(closes.keys()).sort();

  const benchmark = await prisma.benchmark.findUnique({
    where: { code: benchmarkCode },
    include: { history: { orderBy: { date: 'asc' } } },
  });
  const benchByDate = new Map(
    (benchmark?.history ?? []).map((h) => [h.date.toISOString().slice(0, 10), h.value] as const),
  );

  const FEE_RATE = 0.0003;
  const BASE_UNIT_VALUE = 100;
  const flowsByDate = new Map<string, number>();
  for (const f of book.flows) {
    const key = f.date.toISOString().slice(0, 10);
    flowsByDate.set(key, (flowsByDate.get(key) ?? 0) + f.amount);
  }

  const rows: {
    portfolioId: string; date: Date; value: number; units: number; unitValue: number; benchmark: number;
  }[] = [];
  let lastBench: number | null = null;
  let baseBench: number | null = null;
  let units = 0;
  let cash = 0;
  let unitValue = BASE_UNIT_VALUE;

  for (const date of dates) {
    const priced = closes.get(date)!;

    // Value yesterday's book at today's close, *before* today's flow: that is
    // the price at which units are created, so a subscription buys in at a
    // price it did not itself move.
    let equityBefore = 0;
    let priceable = true;
    for (const lot of book.lots) {
      if (lot.tradeDate.toISOString().slice(0, 10) >= date) continue;
      const close = priced.get(lot.ticker);
      if (close === undefined) { priceable = false; break; }
      equityBefore += lot.quantity * close;
    }
    if (!priceable) continue;

    if (units > 0) unitValue = (equityBefore + cash) / units;

    const subscription = flowsByDate.get(date) ?? 0;
    if (subscription !== 0) {
      cash += subscription;
      units += subscription / unitValue;
    }

    // Today's purchases settle at their trade price.
    let equity = equityBefore;
    for (const lot of book.lots) {
      if (lot.tradeDate.toISOString().slice(0, 10) !== date) continue;
      const close = priced.get(lot.ticker);
      if (close === undefined) { priceable = false; break; }
      cash -= lot.quantity * lot.price * (1 + FEE_RATE);
      equity += lot.quantity * close;
    }
    if (!priceable || units <= 0) continue;

    const nav = equity + cash;
    unitValue = nav / units;

    const bench: number | null = benchByDate.get(date) ?? lastBench;
    if (bench === null) continue;
    lastBench = bench;
    baseBench ??= bench;
    if (baseBench === null) continue;

    rows.push({
      portfolioId,
      date: new Date(`${date}T00:00:00.000Z`),
      value: Math.round(nav * 100) / 100,
      units: Math.round(units * 1e6) / 1e6,
      unitValue: Math.round(unitValue * 1e6) / 1e6,
      benchmark: Math.round((bench / baseBench) * BASE_UNIT_VALUE * 1e6) / 1e6,
    });
  }

  await prisma.portfolioValuationPoint.createMany({ data: rows });
}

async function main() {
  console.log('MERIDIAN — seeding demo data');
  await reset();

  const benchmarkIds = await seedBenchmarksAndMacro();
  console.log('  benchmarks and macro indicators');

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const org = await prisma.organization.create({
    data: {
      name: 'Meridian Capital', slug: 'meridian-capital',
      kind: 'ASSET_MANAGEMENT', plan: 'INSTITUTIONAL', baseCurrency: 'BRL',
    },
  });

  const people = [
    { key: 'admin', email: 'demo@meridian.app', name: 'Helena Braga', title: 'Chief Investment Officer', role: 'ADMIN', color: '#9C7A30' },
    { key: 'pm', email: 'pm@meridian.app', name: 'Rafael Duarte', title: 'Portfolio Manager', role: 'PORTFOLIO_MANAGER', color: '#2A5CD6' },
    { key: 'analyst', email: 'analyst@meridian.app', name: 'Camila Prado', title: 'Senior Equity Analyst', role: 'ANALYST', color: '#0D7C5A' },
    { key: 'researcher', email: 'researcher@meridian.app', name: 'Tiago Moreno', title: 'Research Associate', role: 'RESEARCHER', color: '#B0700C' },
    { key: 'viewer', email: 'viewer@meridian.app', name: 'Ana Lins', title: 'Investor Relations', role: 'VIEWER', color: '#BE2D3A' },
  ] as const;

  const users: Record<string, string> = {};
  const names: Record<string, string> = {};
  for (const p of people) {
    const user = await prisma.user.create({
      data: {
        email: p.email, name: p.name, passwordHash, title: p.title,
        avatarColor: p.color, theme: 'dark', locale: 'pt-BR', onboarded: true,
        lastLoginAt: new Date(),
      },
    });
    await prisma.membership.create({ data: { userId: user.id, organizationId: org.id, role: p.role } });
    users[p.key] = user.id;
    names[p.key] = p.name;
  }
  console.log(`  organization and ${people.length} users`);

  const research = await prisma.workspace.create({
    data: {
      organizationId: org.id, name: 'Equity Research', slug: 'equity-research', kind: 'RESEARCH',
      market: 'BRAZIL', baseCurrency: 'BRL', benchmarkId: benchmarkIds.IBOV,
      riskFreeRate: 0.105, equityRiskPremium: 0.055, statutoryTaxRate: 0.34, isDemo: true,
    },
  });
  await prisma.workspace.create({
    data: {
      organizationId: org.id, name: 'Global Portfolio', slug: 'global-portfolio', kind: 'PORTFOLIO',
      market: 'GLOBAL', baseCurrency: 'USD', benchmarkId: benchmarkIds.SPX,
      riskFreeRate: 0.042, equityRiskPremium: 0.05, statutoryTaxRate: 0.21, isDemo: true,
    },
  });
  await prisma.workspace.create({
    data: {
      organizationId: org.id, name: 'Personal', slug: 'personal', kind: 'PERSONAL',
      market: 'BRAZIL', baseCurrency: 'BRL', benchmarkId: benchmarkIds.IBOV,
      riskFreeRate: 0.105, equityRiskPremium: 0.055, statutoryTaxRate: 0.34, isDemo: false,
    },
  });
  console.log('  workspaces');

  const companyIds = await seedUniverse();
  console.log(`  ${Object.keys(companyIds).length} companies with statements, prices, segments and earnings`);

  await seedWorkspaceContent({
    workspaceId: research.id,
    companyIds,
    users: {
      admin: users.admin, pm: users.pm, analyst: users.analyst,
      researcher: users.researcher, viewer: users.viewer,
    },
    names: {
      admin: names.admin, pm: names.pm, analyst: names.analyst,
      researcher: names.researcher, viewer: names.viewer,
    },
  });
  console.log('  theses, valuations, portfolios, watchlists, alerts and research');

  const counts = {
    companies: await prisma.company.count(),
    statements: await prisma.financialStatement.count(),
    priceBars: await prisma.priceBar.count(),
    theses: await prisma.investmentThesis.count(),
    models: await prisma.valuationModel.count(),
    positions: await prisma.portfolioPosition.count(),
    decks: await prisma.qualitativeDeck.count(),
    committeeQuestions: await prisma.qaItem.count(),
    sectorAnalyses: await prisma.sectorAnalysis.count(),
  };
  console.log('MERIDIAN — seed complete', counts);
  console.log(`\n  Sign in with any of: ${people.map((p) => p.email).join(', ')}`);
  console.log(`  Password: ${DEMO_PASSWORD}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { computeLTM, freeCashFlow, netDebt };
