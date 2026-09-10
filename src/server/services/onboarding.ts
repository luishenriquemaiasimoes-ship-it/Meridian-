import { prisma } from '@/lib/db';
import { getMetricsMap } from './metrics';
import { buildDefaultDcfAssumptions } from '@/lib/finance/modelDefaults';
import { calculateDcf } from '@/lib/finance/dcf';
import { loadStatements } from '../repositories/company';
import { ratesForCurrency } from './metrics';
import { recordAudit } from './audit';

const MARKET_TICKERS: Record<string, string[]> = {
  BRAZIL: ['VALE3', 'PETR4', 'ITUB4', 'WEGE3', 'BBAS3', 'SUZB3', 'ABEV3', 'B3SA3'],
  US: ['MSFT', 'AAPL', 'NVDA', 'GOOGL', 'AMZN', 'META', 'XOM', 'FCX'],
  GLOBAL: ['VALE3', 'ITUB4', 'WEGE3', 'MSFT', 'NVDA', 'GOOGL', 'RIO', 'BHP'],
};

const DATA_SOURCES = [
  { code: 'mock-market', name: 'MockMarketDataProvider', kind: 'MARKET_DATA', notes: 'Simulated prices and quotes. Swap in a vendor implementation of MarketDataProvider to go live.' },
  { code: 'mock-fundamentals', name: 'MockFundamentalsProvider', kind: 'FUNDAMENTALS', notes: 'Simulated statements. Internally consistent: the balance sheet balances and the cash-flow statement articulates.' },
  { code: 'mock-consensus', name: 'MockConsensusProvider', kind: 'CONSENSUS', notes: 'Simulated consensus estimates.' },
  { code: 'mock-news', name: 'MockNewsProvider', kind: 'NEWS', notes: 'Simulated headlines, labelled throughout the interface.' },
  { code: 'user-upload', name: 'User uploads', kind: 'USER_UPLOAD', notes: 'Documents uploaded into this workspace.' },
  { code: 'manual', name: 'Manual input', kind: 'MANUAL', notes: 'Values entered by analysts. Every entry is recorded in the audit trail.' },
];

export interface OnboardingInput {
  workspaceType: 'ASSET_MANAGEMENT' | 'EQUITY_RESEARCH' | 'FAMILY_OFFICE' | 'INDEPENDENT';
  market: 'BRAZIL' | 'US' | 'GLOBAL';
  start: 'DEMO' | 'EMPTY' | 'IMPORT';
  /** Rows from an uploaded CSV / Excel portfolio, already parsed. */
  positions?: { ticker: string; quantity: number; averagePrice: number }[];
  portfolioName?: string;
}

const WORKSPACE_NAME: Record<OnboardingInput['workspaceType'], string> = {
  ASSET_MANAGEMENT: 'Asset Management',
  EQUITY_RESEARCH: 'Equity Research',
  FAMILY_OFFICE: 'Family Office',
  INDEPENDENT: 'Independent Research',
};

/**
 * Completes onboarding: configures the workspace for the chosen market,
 * registers the data sources and, unless the user asked for an empty
 * workspace, builds a starting watchlist, portfolio and valuation model from
 * the reference universe.
 */
export async function completeOnboarding(params: {
  userId: string;
  userName: string;
  organizationId: string;
  workspaceId: string;
  input: OnboardingInput;
}): Promise<{ portfolioId: string | null; watchlistId: string | null; imported: number; skipped: string[] }> {
  const { input, workspaceId, organizationId, userId, userName } = params;

  const rates = input.market === 'US' ? ratesForCurrency('USD') : ratesForCurrency('BRL');
  const baseCurrency = input.market === 'US' ? 'USD' : 'BRL';
  const benchmark = await prisma.benchmark.findUnique({
    where: { code: input.market === 'US' ? 'SPX' : 'IBOV' },
  });

  await prisma.organization.update({
    where: { id: organizationId },
    data: { kind: input.workspaceType, baseCurrency },
  });
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      name: WORKSPACE_NAME[input.workspaceType],
      kind: input.workspaceType === 'ASSET_MANAGEMENT' ? 'PORTFOLIO' : 'RESEARCH',
      market: input.market,
      baseCurrency,
      benchmarkId: benchmark?.id ?? null,
      riskFreeRate: rates.riskFreeRate,
      equityRiskPremium: rates.equityRiskPremium,
      statutoryTaxRate: rates.statutoryTaxRate,
    },
  });

  for (const s of DATA_SOURCES) {
    await prisma.dataSource.upsert({
      where: { workspaceId_code: { workspaceId, code: s.code } },
      update: {},
      create: {
        workspaceId, code: s.code, name: s.name, kind: s.kind,
        status: 'CONNECTED', isMock: s.code.startsWith('mock'),
        lastSyncAt: s.code.startsWith('mock') ? new Date() : null,
        notes: s.notes,
      },
    });
  }
  await prisma.user.update({ where: { id: userId }, data: { onboarded: true } });

  if (input.start === 'EMPTY') {
    await recordAudit({
      workspaceId, userId, actorName: userName, action: 'CREATE', entityType: 'Workspace',
      entityId: workspaceId, entityLabel: WORKSPACE_NAME[input.workspaceType],
      summary: `Workspace configured for the ${input.market.toLowerCase()} market with no starting data.`,
    });
    return { portfolioId: null, watchlistId: null, imported: 0, skipped: [] };
  }

  const metrics = await getMetricsMap();
  const universeTickers = MARKET_TICKERS[input.market] ?? MARKET_TICKERS.GLOBAL;

  const watchlist = await prisma.watchlist.create({
    data: {
      workspaceId,
      name: input.market === 'US' ? 'US large caps' : input.market === 'BRAZIL' ? 'Brazilian large caps' : 'Global coverage',
      description: 'Starting coverage list. Add or remove names as your coverage changes.',
    },
  });
  for (const ticker of universeTickers) {
    const company = await prisma.company.findUnique({ where: { ticker } });
    if (company) {
      await prisma.watchlistItem.create({ data: { watchlistId: watchlist.id, companyId: company.id } });
    }
  }

  // Portfolio: imported rows if supplied, otherwise an equal-weighted starter.
  const skipped: string[] = [];
  let imported = 0;
  const portfolio = await prisma.portfolio.create({
    data: {
      workspaceId,
      name: input.portfolioName?.trim() || (input.start === 'IMPORT' ? 'Imported portfolio' : 'Starter portfolio'),
      description: input.start === 'IMPORT'
        ? 'Positions imported during onboarding.'
        : 'An equal-weighted starting book built from the reference universe so every module has data.',
      baseCurrency,
      cash: input.start === 'IMPORT' ? 0 : 250_000,
      benchmarkCode: input.market === 'US' ? 'SPX' : 'IBOV',
    },
  });

  const rows = input.start === 'IMPORT' && input.positions?.length
    ? input.positions
    : universeTickers.slice(0, 6).map((ticker) => {
        const m = metrics.get(ticker);
        const price = m?.price ?? 10;
        return { ticker, quantity: Math.round(250_000 / price), averagePrice: Math.round(price * 0.94 * 100) / 100 };
      });

  for (const row of rows) {
    const company = await prisma.company.findUnique({ where: { ticker: row.ticker.toUpperCase() } });
    if (!company) { skipped.push(row.ticker); continue; }
    if (!Number.isFinite(row.quantity) || row.quantity <= 0) { skipped.push(row.ticker); continue; }
    await prisma.portfolioPosition.upsert({
      where: { portfolioId_companyId: { portfolioId: portfolio.id, companyId: company.id } },
      update: { quantity: row.quantity, averagePrice: row.averagePrice },
      create: {
        portfolioId: portfolio.id, companyId: company.id,
        quantity: row.quantity, averagePrice: row.averagePrice,
      },
    });
    await prisma.portfolioTransaction.create({
      data: {
        portfolioId: portfolio.id, companyId: company.id, kind: 'BUY',
        quantity: row.quantity, price: row.averagePrice,
        amount: -(row.quantity * row.averagePrice), tradeDate: new Date(),
        note: input.start === 'IMPORT' ? 'Imported during onboarding.' : 'Opening position from the starter book.',
        createdBy: userName,
      },
    });
    imported++;
  }

  // One worked valuation model so the valuation module is not empty on day one.
  const anchor = universeTickers[0];
  const anchorCompany = await prisma.company.findUnique({ where: { ticker: anchor }, include: { security: true } });
  if (anchorCompany?.security) {
    const periods = await loadStatements(anchorCompany.id);
    const assumptions = buildDefaultDcfAssumptions(
      periods,
      {
        price: anchorCompany.security.lastPrice,
        sharesOutstanding: anchorCompany.security.sharesOutstanding,
        beta: anchorCompany.security.beta ?? 1,
      },
      rates,
    );
    const result = calculateDcf(assumptions);
    await prisma.valuationModel.create({
      data: {
        workspaceId, companyId: anchorCompany.id,
        name: `${anchor} — DCF`, kind: 'DCF', status: 'DRAFT',
        assumptions: JSON.stringify(assumptions),
        outputs: JSON.stringify({
          fairValuePerShare: result.fairValuePerShare, upside: result.upside,
          enterpriseValue: result.enterpriseValue, equityValue: result.equityValue,
        }),
        notes: 'Assumptions initialised from the reported history. Edit any input to re-run the model.',
        authorName: userName,
      },
    });
  }

  await recordAudit({
    workspaceId, userId, actorName: userName, action: 'CREATE', entityType: 'Workspace',
    entityId: workspaceId, entityLabel: WORKSPACE_NAME[input.workspaceType],
    summary: `Workspace configured for the ${input.market.toLowerCase()} market with ${imported} starting position${imported === 1 ? '' : 's'}.`,
  });

  return { portfolioId: portfolio.id, watchlistId: watchlist.id, imported, skipped };
}
