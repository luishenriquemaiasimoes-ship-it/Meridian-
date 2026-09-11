import { prisma } from '@/lib/db';
import { getUniverseMetrics, type CompanyMetrics } from './metrics';
import { balanceSheetCheck } from '@/lib/finance/statements';
import { getCompanyDossier } from './company';
import { isNum } from '@/lib/finance/core';

export type IssueSeverity = 'BLOCKING' | 'IMPORTANT' | 'INFORMATIONAL';

export interface QualityIssue {
  ticker: string;
  companyName: string;
  severity: IssueSeverity;
  kind: string;
  detail: string;
  /** What the analyst should do about it. */
  remedy: string;
}

export interface CompanyQuality {
  ticker: string;
  companyName: string;
  sector: string;
  source: string;
  isSimulated: boolean;
  balanceSheetBalances: boolean;
  missingFields: string[];
  staleDays: number | null;
  annualPeriods: number;
  quarterlyPeriods: number;
  hasLtm: boolean;
  /** 0–100. Starts at 100 and loses points for each defect, weighted by severity. */
  score: number;
  issues: QualityIssue[];
}

export interface QualityReport {
  companies: CompanyQuality[];
  issues: QualityIssue[];
  summary: {
    covered: number;
    clean: number;
    blocking: number;
    important: number;
    informational: number;
    simulated: number;
    medianScore: number | null;
    adjustments: number;
    documentsWithoutText: number;
    lastPriceDate: string | null;
    lastStatementLabel: string | null;
  };
}

const FIELD_LABEL: Record<string, string> = {
  revenue: 'revenue', ebitda: 'EBITDA', ebit: 'EBIT', netIncome: 'net income',
  cfo: 'cash from operations', capex: 'capital expenditure', totalDebt: 'total debt',
  equityBookValue: 'book equity', sharesOutstanding: 'shares outstanding', price: 'price',
};

function describe(fields: string[]): string {
  return fields.map((f) => FIELD_LABEL[f] ?? f).join(', ');
}

/**
 * Everything the platform knows about how trustworthy its own inputs are. The
 * point is not to hide a weak datum but to name it: which company, which field,
 * how old, and what the analyst should do next.
 */
export async function getQualityReport(workspaceId: string): Promise<QualityReport> {
  const [universe, adjustments, documents, lastBar, lastStatement] = await Promise.all([
    getUniverseMetrics(),
    prisma.normalizationAdjustment.count({ where: { workspaceId } }),
    prisma.document.count({ where: { workspaceId, content: null } }),
    prisma.priceBar.findFirst({ orderBy: { date: 'desc' }, select: { date: true } }),
    prisma.financialStatement.findFirst({ orderBy: { endDate: 'desc' }, select: { label: true } }),
  ]);

  const companies: CompanyQuality[] = universe.map((m) => buildCompanyQuality(m));
  const issues = companies.flatMap((c) => c.issues);
  const scores = companies.map((c) => c.score).sort((a, b) => a - b);

  return {
    companies,
    issues,
    summary: {
      covered: companies.length,
      // "Clean" means nothing to act on: an informational note (a bank, or
      // simulated data) describes the company rather than faulting its data.
      clean: companies.filter((c) => c.issues.every((i) => i.severity === 'INFORMATIONAL')).length,
      blocking: issues.filter((i) => i.severity === 'BLOCKING').length,
      important: issues.filter((i) => i.severity === 'IMPORTANT').length,
      informational: issues.filter((i) => i.severity === 'INFORMATIONAL').length,
      simulated: companies.filter((c) => c.isSimulated).length,
      medianScore: scores.length ? scores[Math.floor(scores.length / 2)] : null,
      adjustments,
      documentsWithoutText: documents,
      lastPriceDate: lastBar?.date.toISOString().slice(0, 10) ?? null,
      lastStatementLabel: lastStatement?.label ?? null,
    },
  };
}

function buildCompanyQuality(m: CompanyMetrics): CompanyQuality {
  const q = m.dataQuality;
  const issues: QualityIssue[] = [];
  const push = (severity: IssueSeverity, kind: string, detail: string, remedy: string) =>
    issues.push({ ticker: m.ticker, companyName: m.name, severity, kind, detail, remedy });

  if (!q.balanceSheetBalances) {
    push(
      'BLOCKING',
      'Balance sheet does not balance',
      'Total assets do not equal liabilities plus equity on the latest reported period.',
      'Nothing derived from the balance sheet — invested capital, ROIC, leverage — should be relied on until the statement is corrected at the source.',
    );
  }

  if (q.missingFields.length) {
    const critical = q.missingFields.filter((f) => ['revenue', 'ebitda', 'netIncome', 'cfo'].includes(f));
    if (critical.length) {
      push(
        'BLOCKING',
        'Core line items missing',
        `The latest period reports no ${describe(critical)}.`,
        'Margins, returns and cash-flow measures built on these are reported as unavailable rather than estimated. Load the missing period.',
      );
    }
    const rest = q.missingFields.filter((f) => !critical.includes(f));
    if (rest.length) {
      push(
        'IMPORTANT',
        'Secondary fields missing',
        `No ${describe(rest)} on the latest period.`,
        'Measures that depend on these read as unavailable. Everything else is unaffected.',
      );
    }
  }

  if (!q.hasLtm && q.quarterlyPeriods > 0 && q.quarterlyPeriods < 4) {
    push(
      'IMPORTANT',
      'No trailing twelve months',
      `Only ${q.quarterlyPeriods} quarter${q.quarterlyPeriods === 1 ? '' : 's'} on record, so an LTM cannot be built.`,
      'The company is valued on its last full year instead. Four consecutive quarters are needed before an LTM is computed — it is never approximated.',
    );
  }

  if (q.annualPeriods < 3) {
    push(
      'IMPORTANT',
      'Short history',
      `${q.annualPeriods} annual period${q.annualPeriods === 1 ? '' : 's'} on record.`,
      'Three-year and five-year growth rates are reported as unavailable. A DCF built on this history rests on very little.',
    );
  }

  if (isNum(q.staleDays) && (q.staleDays as number) > 120) {
    push(
      'IMPORTANT',
      'Stale fundamentals',
      `The latest reported period ended ${q.staleDays} days ago.`,
      'A company that has not reported in four months is either between filings or missing a period. Check the earnings calendar.',
    );
  }

  if (!isNum(m.price)) {
    push(
      'BLOCKING',
      'No price',
      'No quotation is on record for this security.',
      'Every multiple, market capitalisation and portfolio valuation for this name reads as unavailable.',
    );
  }

  if (!isNum(m.sharesOutstanding)) {
    push(
      'BLOCKING',
      'No share count',
      'Shares outstanding are not recorded.',
      'Market capitalisation, enterprise value, EPS and every per-share figure are unavailable without it.',
    );
  }

  if (m.bankLike) {
    push(
      'INFORMATIONAL',
      'Bank-like company',
      'Enterprise-value multiples and ROIC are suppressed for this name.',
      'For a bank, deposits and debt are operating funding rather than financing, and invested capital is not a meaningful denominator. Compare on P/E, P/B and ROE.',
    );
  }

  if (q.isSimulated) {
    push(
      'INFORMATIONAL',
      'Simulated data',
      `Supplied by ${q.source}.`,
      'Internally consistent and suitable for exercising the platform, but not market data and never to be presented as such.',
    );
  }

  const penalty = issues.reduce(
    (sum, i) => sum + (i.severity === 'BLOCKING' ? 30 : i.severity === 'IMPORTANT' ? 12 : 0),
    0,
  );

  return {
    ticker: m.ticker,
    companyName: m.name,
    sector: m.sector,
    source: q.source,
    isSimulated: q.isSimulated,
    balanceSheetBalances: q.balanceSheetBalances,
    missingFields: q.missingFields,
    staleDays: q.staleDays,
    annualPeriods: q.annualPeriods,
    quarterlyPeriods: q.quarterlyPeriods,
    hasLtm: q.hasLtm,
    score: Math.max(0, 100 - penalty),
    issues,
  };
}

export interface StatementCheck {
  label: string;
  periodType: string;
  endDate: string;
  assets: number | null;
  liabilitiesAndEquity: number | null;
  difference: number | null;
  balances: boolean;
  cashFlowArticulates: boolean | null;
  netChangeInCash: number | null;
  sumOfFlows: number | null;
}

/** Period-by-period integrity checks for one company. */
export async function getStatementChecks(ticker: string): Promise<StatementCheck[] | null> {
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) return null;

  return dossier.periods.map((p) => {
    const check = balanceSheetCheck(p.balance);
    const liabilitiesAndEquity =
      isNum(p.balance.totalLiabilities) && isNum(p.balance.totalEquity)
        ? (p.balance.totalLiabilities as number) + (p.balance.totalEquity as number)
        : null;
    const cf = p.cashFlow;
    const sum = [cf.cfo, cf.cfi, cf.cff].every(isNum)
      ? (cf.cfo as number) + (cf.cfi as number) + (cf.cff as number)
      : null;
    const articulates = isNum(sum) && isNum(cf.netChangeInCash)
      ? Math.abs((sum as number) - (cf.netChangeInCash as number)) <= Math.max(1, Math.abs(sum as number) * 0.01)
      : null;
    return {
      label: p.label,
      periodType: p.periodType,
      endDate: p.endDate,
      assets: p.balance.totalAssets,
      liabilitiesAndEquity,
      difference: check.gap,
      balances: check.balances,
      cashFlowArticulates: articulates,
      netChangeInCash: cf.netChangeInCash,
      sumOfFlows: sum,
    };
  });
}
