import { prisma, parseJson } from '@/lib/db';
import { EMPTY_BALANCE, EMPTY_CASHFLOW, EMPTY_INCOME, derivePeriod } from '@/lib/finance/statements';
import type {
  AccountingStandard, BalanceSheet, CashFlowStatement, Currency,
  FinancialPeriod, IncomeStatement, PeriodType, Unit,
} from '@/lib/finance/types';

export interface CompanyRecord {
  id: string;
  ticker: string;
  name: string;
  legalName: string | null;
  exchange: string;
  country: string;
  sector: string;
  industry: string;
  currency: Currency;
  accountingStandard: AccountingStandard;
  fiscalYearEnd: string;
  description: string;
  businessModel: string | null;
  competitiveAdvantages: string[];
  website: string | null;
  employees: number | null;
  foundedYear: number | null;
  ceo: string | null;
  headquarters: string | null;
  reportingUnit: Unit;
  themes: string[];
}

export interface SecurityRecord {
  id: string;
  ticker: string;
  currency: Currency;
  sharesOutstanding: number;
  freeFloat: number | null;
  lastPrice: number;
  previousClose: number;
  dayHigh: number | null;
  dayLow: number | null;
  week52High: number | null;
  week52Low: number | null;
  averageVolume: number | null;
  beta: number | null;
  priceAsOf: string;
}

type CompanyRow = Awaited<ReturnType<typeof prisma.company.findFirst>>;

export function mapCompany(row: NonNullable<CompanyRow>): CompanyRecord {
  return {
    id: row.id,
    ticker: row.ticker,
    name: row.name,
    legalName: row.legalName,
    exchange: row.exchange,
    country: row.country,
    sector: row.sector,
    industry: row.industry,
    currency: row.currency as Currency,
    accountingStandard: row.accountingStandard as AccountingStandard,
    fiscalYearEnd: row.fiscalYearEnd,
    description: row.description,
    businessModel: row.businessModel,
    competitiveAdvantages: parseJson<string[]>(row.competitiveAdvantages, []),
    website: row.website,
    employees: row.employees,
    foundedYear: row.foundedYear,
    ceo: row.ceo,
    headquarters: row.headquarters,
    reportingUnit: row.reportingUnit as Unit,
    themes: parseJson<string[]>(row.themes, []),
  };
}

export function mapStatement(row: {
  label: string; periodType: string; fiscalYear: number; fiscalQuarter: number | null;
  endDate: Date; currency: string; standard: string; unit: string; source: string;
  isEstimate: boolean; income: string; balance: string; cashFlow: string;
}): FinancialPeriod {
  return derivePeriod({
    label: row.label,
    periodType: row.periodType as PeriodType,
    fiscalYear: row.fiscalYear,
    fiscalQuarter: row.fiscalQuarter,
    endDate: row.endDate.toISOString().slice(0, 10),
    currency: row.currency as Currency,
    standard: row.standard as AccountingStandard,
    unit: row.unit as Unit,
    source: row.source,
    isEstimate: row.isEstimate,
    income: { ...EMPTY_INCOME, ...parseJson<Partial<IncomeStatement>>(row.income, {}) },
    balance: { ...EMPTY_BALANCE, ...parseJson<Partial<BalanceSheet>>(row.balance, {}) },
    cashFlow: { ...EMPTY_CASHFLOW, ...parseJson<Partial<CashFlowStatement>>(row.cashFlow, {}) },
  });
}

export async function findCompanyByTicker(ticker: string) {
  return prisma.company.findUnique({
    where: { ticker: ticker.toUpperCase() },
    include: { security: true },
  });
}

export async function listCompanyRecords(): Promise<(CompanyRecord & { security: SecurityRecord | null })[]> {
  const rows = await prisma.company.findMany({ include: { security: true }, orderBy: { ticker: 'asc' } });
  return rows.map((row) => ({
    ...mapCompany(row),
    security: row.security
      ? {
          id: row.security.id,
          ticker: row.security.ticker,
          currency: row.security.currency as Currency,
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
      : null,
  }));
}

export async function loadStatements(companyId: string): Promise<FinancialPeriod[]> {
  const rows = await prisma.financialStatement.findMany({
    where: { companyId },
    orderBy: { endDate: 'asc' },
  });
  return rows.map(mapStatement);
}

export async function loadPriceHistory(securityId: string, limit?: number) {
  const rows = await prisma.priceBar.findMany({
    where: { securityId },
    orderBy: { date: 'asc' },
  });
  const sliced = limit ? rows.slice(-limit) : rows;
  return sliced.map((b) => ({
    date: b.date.toISOString().slice(0, 10),
    open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume,
  }));
}

export async function loadPeerTickers(companyId: string): Promise<string[]> {
  const links = await prisma.peerLink.findMany({
    where: { companyId },
    orderBy: { rank: 'asc' },
    include: { peer: { select: { ticker: true } } },
  });
  return links.map((l) => l.peer.ticker);
}
