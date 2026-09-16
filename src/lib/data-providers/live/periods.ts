import type { FinancialPeriod } from '@/lib/finance/types';
import {
  balanceFrom, cashFlowFrom, DEPRECIATION_PATTERN, findByDescription,
  foldRows, incomeFrom, isCapexLine, statementFile, type DfpYear,
} from './cvm';
import type { CompanyFacts } from './sec';
import { statementsFor } from './sec';

/* ==================================================================
   From a filing to a period the engine can read.

   Both regulators publish the same three statements and neither
   publishes them in the shape the model wants, so this is where the
   translation lives — and it is the only place, so there is one answer
   to "where did this number come from" per market.
   ================================================================== */

/**
 * One Brazilian fiscal year, assembled from the four standardised statements.
 *
 * Returns null rather than a partial period when the income statement is
 * missing: a company with a balance sheet and no revenue is a parsing failure,
 * not a company, and letting it through would put an empty top line into a
 * valuation.
 */
export function periodFromCvm(year: DfpYear, cnpj: string): FinancialPeriod | null {
  const dreRows = statementFile(year, 'DRE');
  const bpaRows = statementFile(year, 'BPA');
  const bppRows = statementFile(year, 'BPP');
  const dfcRows = statementFile(year, 'DFC_MI');
  if (!dreRows || !bpaRows || !bppRows) return null;

  const dre = foldRows(dreRows, cnpj);
  if (!dre || dre.byAccount.get('3.01') === undefined) return null;

  const income = incomeFrom(dre.byAccount);
  const bpa = foldRows(bpaRows, cnpj);
  const bpp = foldRows(bppRows, cnpj);
  const balance = bpa && bpp
    ? balanceFrom(bpa.byAccount, bpp.byAccount)
    : balanceFrom(new Map(), new Map());

  const dfc = dfcRows ? foldRows(dfcRows, cnpj) : null;
  const cashFlow = cashFlowFrom(dfc?.byAccount ?? new Map(), income.netIncome);

  if (dfcRows) {
    const mine = dfcRows.filter(
      (r) => r.CNPJ_CIA === cnpj && (r.ORDEM_EXERC ?? '').toUpperCase().startsWith('ÚLT'),
    );
    // Depreciation is an operating add-back and capex an investing outflow;
    // each is searched only inside its own block.
    const da = findByDescription(mine, '6.01', DEPRECIATION_PATTERN);
    const capex = findByDescription(mine, '6.02', isCapexLine);
    cashFlow.da = da === null ? null : Math.abs(da);
    cashFlow.capex = capex === null ? null : -Math.abs(capex);
  }

  // The standardised income statement has no depreciation line; it comes from
  // the cash flow statement, which is where the company does disclose it.
  income.da = cashFlow.da;
  if (income.ebit !== null && income.da !== null) income.ebitda = income.ebit + income.da;

  return {
    label: `FY${year.year}`,
    periodType: 'FY',
    fiscalYear: year.year,
    fiscalQuarter: null,
    endDate: dre.endDate || `${year.year}-12-31`,
    currency: 'BRL',
    standard: 'IFRS',
    unit: 'MILLIONS',
    income,
    balance,
    cashFlow,
  };
}

/** One US fiscal year, assembled from the XBRL facts. */
export function periodFromSec(facts: CompanyFacts, fiscalYear: number): FinancialPeriod | null {
  const s = statementsFor(facts, fiscalYear);
  if (!s) return null;

  return {
    label: `FY${fiscalYear}`,
    periodType: 'FY',
    fiscalYear,
    fiscalQuarter: null,
    endDate: s.endDate || `${fiscalYear}-12-31`,
    currency: 'USD',
    standard: 'US_GAAP',
    unit: 'MILLIONS',
    income: s.income,
    balance: s.balance,
    cashFlow: s.cashFlow,
  };
}

/**
 * Whether a period carries enough to be valued.
 *
 * The model needs a top line, something to earn on it, and an asset base to
 * earn it with. A period missing any of the three is loaded nowhere: it would
 * pass through the projection as zeros and come out as a valuation rather than
 * as a gap.
 */
export function isUsable(p: FinancialPeriod): boolean {
  return p.income.revenue !== null
    && p.income.revenue !== 0
    && p.income.ebit !== null
    && p.balance.totalAssets !== null;
}

/** What is missing, for a report that says why a company was skipped. */
export function missingFrom(p: FinancialPeriod): string[] {
  const gaps: string[] = [];
  if (p.income.revenue === null || p.income.revenue === 0) gaps.push('receita');
  if (p.income.ebit === null) gaps.push('EBIT');
  if (p.balance.totalAssets === null) gaps.push('ativo total');
  if (p.balance.totalEquity === null) gaps.push('patrimônio líquido');
  if (p.cashFlow.capex === null) gaps.push('capex');
  if (p.cashFlow.da === null) gaps.push('D&A');
  return gaps;
}
