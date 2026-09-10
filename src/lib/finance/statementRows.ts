import type { FinancialPeriod } from './types';
import { freeCashFlow, netDebt, netWorkingCapital, totalDebt } from './ratios';
import { isNum, safeDiv } from './core';

/**
 * The canonical line-item definitions for the three statements. Both the
 * on-screen tables and the Excel export read from here, so an exported model
 * always matches the screen it came from.
 */

export interface StatementLine {
  key: string;
  label: string;
  pick: (p: FinancialPeriod) => number | null;
  indent?: 0 | 1 | 2;
  emphasis?: 'total' | 'subtotal' | 'normal';
  formula?: string;
  divider?: boolean;
  percentOfRevenue?: boolean;
}

const divider = (key: string, label: string): StatementLine => ({
  key, label, pick: () => null, divider: true,
});

export const INCOME_STATEMENT_LINES: StatementLine[] = [
  { key: 'revenue', label: 'Revenue', pick: (p) => p.income.revenue, emphasis: 'subtotal' },
  { key: 'cogs', label: 'Cost of goods sold', pick: (p) => (isNum(p.income.cogs) ? -(p.income.cogs as number) : null), indent: 1 },
  { key: 'grossProfit', label: 'Gross profit', pick: (p) => p.income.grossProfit, emphasis: 'subtotal', formula: 'Revenue − COGS' },
  { key: 'sga', label: 'Selling, general & administrative', pick: (p) => (isNum(p.income.sga) ? -(p.income.sga as number) : null), indent: 1 },
  { key: 'rnd', label: 'Research & development', pick: (p) => (isNum(p.income.rnd) ? -(p.income.rnd as number) : null), indent: 1 },
  { key: 'otherOpex', label: 'Other operating expenses', pick: (p) => (isNum(p.income.otherOpex) ? -(p.income.otherOpex as number) : null), indent: 1 },
  { key: 'ebitda', label: 'EBITDA', pick: (p) => p.income.ebitda, emphasis: 'subtotal', formula: 'EBIT + D&A' },
  { key: 'da', label: 'Depreciation & amortisation', pick: (p) => (isNum(p.income.da) ? -(p.income.da as number) : null), indent: 1 },
  { key: 'ebit', label: 'EBIT', pick: (p) => p.income.ebit, emphasis: 'subtotal', formula: 'EBITDA − D&A' },
  { key: 'financialResult', label: 'Financial result, net', pick: (p) => p.income.financialResult, indent: 1 },
  { key: 'ebt', label: 'Earnings before tax', pick: (p) => p.income.ebt, emphasis: 'subtotal', formula: 'EBIT + financial result' },
  { key: 'taxes', label: 'Income tax', pick: (p) => (isNum(p.income.taxes) ? -(p.income.taxes as number) : null), indent: 1 },
  { key: 'minorityInterest', label: 'Minority interest', pick: (p) => (isNum(p.income.minorityInterest) ? -(p.income.minorityInterest as number) : null), indent: 1 },
  { key: 'netIncome', label: 'Net income', pick: (p) => p.income.netIncome, emphasis: 'total', formula: 'EBT − tax − minority interest' },
  divider('perShare', 'Per share'),
  { key: 'eps', label: 'Earnings per share (diluted)', pick: (p) => p.income.eps, formula: 'Net income ÷ diluted shares' },
  { key: 'dilutedShares', label: 'Diluted shares', pick: (p) => p.income.dilutedShares },
];

export const BALANCE_SHEET_LINES: StatementLine[] = [
  divider('assets', 'Assets'),
  { key: 'cash', label: 'Cash and equivalents', pick: (p) => p.balance.cash, indent: 1 },
  { key: 'accountsReceivable', label: 'Accounts receivable', pick: (p) => p.balance.accountsReceivable, indent: 1 },
  { key: 'inventory', label: 'Inventory', pick: (p) => p.balance.inventory, indent: 1 },
  { key: 'otherCurrentAssets', label: 'Other current assets', pick: (p) => p.balance.otherCurrentAssets, indent: 1 },
  { key: 'ppe', label: 'Property, plant & equipment', pick: (p) => p.balance.ppe, indent: 1 },
  { key: 'intangibles', label: 'Intangibles', pick: (p) => p.balance.intangibles, indent: 1 },
  { key: 'goodwill', label: 'Goodwill', pick: (p) => p.balance.goodwill, indent: 1 },
  { key: 'otherAssets', label: 'Other assets', pick: (p) => p.balance.otherAssets, indent: 1 },
  { key: 'totalAssets', label: 'Total assets', pick: (p) => p.balance.totalAssets, emphasis: 'total' },
  divider('liabilities', 'Liabilities'),
  { key: 'accountsPayable', label: 'Accounts payable', pick: (p) => p.balance.accountsPayable, indent: 1 },
  { key: 'shortTermDebt', label: 'Short-term debt', pick: (p) => p.balance.shortTermDebt, indent: 1 },
  { key: 'otherCurrentLiabilities', label: 'Other current liabilities', pick: (p) => p.balance.otherCurrentLiabilities, indent: 1 },
  { key: 'longTermDebt', label: 'Long-term debt', pick: (p) => p.balance.longTermDebt, indent: 1 },
  { key: 'leaseLiabilities', label: 'Lease liabilities', pick: (p) => p.balance.leaseLiabilities, indent: 1 },
  { key: 'otherLiabilities', label: 'Other liabilities', pick: (p) => p.balance.otherLiabilities, indent: 1 },
  { key: 'totalLiabilities', label: 'Total liabilities', pick: (p) => p.balance.totalLiabilities, emphasis: 'total' },
  divider('equity', 'Equity'),
  { key: 'shareCapital', label: 'Share capital', pick: (p) => p.balance.shareCapital, indent: 1 },
  { key: 'retainedEarnings', label: 'Retained earnings', pick: (p) => p.balance.retainedEarnings, indent: 1 },
  { key: 'treasuryStock', label: 'Treasury stock', pick: (p) => p.balance.treasuryStock, indent: 1 },
  { key: 'minorityInterestEquity', label: 'Minority interest', pick: (p) => p.balance.minorityInterestEquity, indent: 1 },
  { key: 'totalEquity', label: 'Total equity', pick: (p) => p.balance.totalEquity, emphasis: 'total' },
  divider('derived', 'Derived'),
  { key: 'totalDebt', label: 'Gross debt', pick: (p) => totalDebt(p.balance), formula: 'Short-term + long-term debt + leases' },
  { key: 'netDebt', label: 'Net debt', pick: (p) => netDebt(p.balance), formula: 'Gross debt − cash' },
  { key: 'nwc', label: 'Operating net working capital', pick: (p) => netWorkingCapital(p.balance), formula: '(AR + inventory + other CA) − (AP + other CL)' },
];

export const CASH_FLOW_LINES: StatementLine[] = [
  { key: 'cfNetIncome', label: 'Net income', pick: (p) => p.cashFlow.netIncome },
  { key: 'cfDa', label: 'Depreciation & amortisation', pick: (p) => p.cashFlow.da, indent: 1 },
  { key: 'workingCapitalChange', label: 'Change in working capital', pick: (p) => p.cashFlow.workingCapitalChange, indent: 1 },
  { key: 'otherOperating', label: 'Other operating items', pick: (p) => p.cashFlow.otherOperating, indent: 1 },
  { key: 'cfo', label: 'Cash from operations', pick: (p) => p.cashFlow.cfo, emphasis: 'subtotal' },
  divider('investing', 'Investing'),
  { key: 'capex', label: 'Capital expenditure', pick: (p) => p.cashFlow.capex, indent: 1 },
  { key: 'acquisitions', label: 'Acquisitions', pick: (p) => p.cashFlow.acquisitions, indent: 1 },
  { key: 'otherInvesting', label: 'Other investing', pick: (p) => p.cashFlow.otherInvesting, indent: 1 },
  { key: 'cfi', label: 'Cash from investing', pick: (p) => p.cashFlow.cfi, emphasis: 'subtotal' },
  divider('financing', 'Financing'),
  { key: 'debtIssued', label: 'Debt issued', pick: (p) => p.cashFlow.debtIssued, indent: 1 },
  { key: 'debtRepaid', label: 'Debt repaid', pick: (p) => p.cashFlow.debtRepaid, indent: 1 },
  { key: 'dividendsPaid', label: 'Dividends paid', pick: (p) => p.cashFlow.dividendsPaid, indent: 1 },
  { key: 'buybacks', label: 'Share buybacks', pick: (p) => p.cashFlow.buybacks, indent: 1 },
  { key: 'otherFinancing', label: 'Other financing', pick: (p) => p.cashFlow.otherFinancing, indent: 1 },
  { key: 'cff', label: 'Cash from financing', pick: (p) => p.cashFlow.cff, emphasis: 'subtotal' },
  divider('net', 'Net'),
  { key: 'netChangeInCash', label: 'Net change in cash', pick: (p) => p.cashFlow.netChangeInCash, emphasis: 'total' },
  { key: 'fcf', label: 'Free cash flow', pick: (p) => freeCashFlow(p), emphasis: 'total', formula: 'CFO − capex' },
];

export interface BuiltRow {
  key: string;
  label: string;
  values: Record<string, number | null>;
  indent?: 0 | 1 | 2;
  emphasis?: 'total' | 'subtotal' | 'normal';
  formula?: string;
  divider?: boolean;
}

/** Turns line definitions plus a set of periods into table-ready rows. */
export function buildStatementRows(
  lines: StatementLine[],
  periods: FinancialPeriod[],
  mode: 'ABSOLUTE' | 'PERCENT_OF_REVENUE' = 'ABSOLUTE',
): BuiltRow[] {
  return lines.map((line) => {
    const values: Record<string, number | null> = {};
    for (const p of periods) {
      const raw = line.pick(p);
      values[p.label] =
        mode === 'PERCENT_OF_REVENUE' && !line.divider && line.key !== 'dilutedShares' && line.key !== 'eps'
          ? safeDiv(raw, p.income.revenue)
          : raw;
    }
    return {
      key: line.key, label: line.label, values,
      indent: line.indent, emphasis: line.emphasis, formula: line.formula, divider: line.divider,
    };
  });
}

export const STATEMENT_TABS = [
  { key: 'income', label: 'Income statement', lines: INCOME_STATEMENT_LINES },
  { key: 'balance', label: 'Balance sheet', lines: BALANCE_SHEET_LINES },
  { key: 'cashflow', label: 'Cash flow', lines: CASH_FLOW_LINES },
] as const;

export type StatementKey = (typeof STATEMENT_TABS)[number]['key'];
