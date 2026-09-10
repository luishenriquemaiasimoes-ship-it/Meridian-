/** Shared financial vocabulary for the MERIDIAN engine. */

export type PeriodType = 'FY' | 'Q' | 'LTM';
export type Currency = 'BRL' | 'USD' | 'EUR' | 'GBP';
export type AccountingStandard = 'IFRS' | 'US_GAAP' | 'BR_GAAP';

/**
 * Provenance of every number surfaced by the platform. The UI is required to
 * render this so that an observed figure is never confused with an assumption.
 */
export type ValueOrigin = 'OBSERVED' | 'CALCULATED' | 'ESTIMATED' | 'ASSUMPTION' | 'AI_INTERPRETATION';

export interface DataPoint<T = number | null> {
  value: T;
  origin: ValueOrigin;
  source?: string;
  asOf?: string;
  period?: string;
  currency?: Currency;
  unit?: Unit;
  confidence?: number; // 0..1
}

export type Unit = 'ABSOLUTE' | 'THOUSANDS' | 'MILLIONS' | 'BILLIONS' | 'PERCENT' | 'RATIO' | 'MULTIPLE' | 'PER_SHARE' | 'DAYS' | 'BPS';

export interface IncomeStatement {
  revenue: number | null;
  cogs: number | null;
  grossProfit: number | null;
  sga: number | null;
  rnd: number | null;
  otherOpex: number | null;
  ebitda: number | null;
  da: number | null;
  ebit: number | null;
  financialResult: number | null;
  ebt: number | null;
  taxes: number | null;
  netIncome: number | null;
  minorityInterest: number | null;
  eps: number | null;
  dilutedShares: number | null;
}

export interface BalanceSheet {
  cash: number | null;
  accountsReceivable: number | null;
  inventory: number | null;
  otherCurrentAssets: number | null;
  ppe: number | null;
  intangibles: number | null;
  goodwill: number | null;
  otherAssets: number | null;
  totalAssets: number | null;

  accountsPayable: number | null;
  shortTermDebt: number | null;
  otherCurrentLiabilities: number | null;
  longTermDebt: number | null;
  leaseLiabilities: number | null;
  otherLiabilities: number | null;
  totalLiabilities: number | null;

  shareCapital: number | null;
  retainedEarnings: number | null;
  treasuryStock: number | null;
  minorityInterestEquity: number | null;
  totalEquity: number | null;
}

export interface CashFlowStatement {
  netIncome: number | null;
  da: number | null;
  workingCapitalChange: number | null;
  otherOperating: number | null;
  cfo: number | null;
  capex: number | null;
  acquisitions: number | null;
  otherInvesting: number | null;
  cfi: number | null;
  debtIssued: number | null;
  debtRepaid: number | null;
  dividendsPaid: number | null;
  buybacks: number | null;
  otherFinancing: number | null;
  cff: number | null;
  netChangeInCash: number | null;
}

export interface FinancialPeriod {
  id?: string;
  label: string;          // "FY2024", "3Q25", "LTM"
  periodType: PeriodType;
  fiscalYear: number;
  fiscalQuarter?: number | null;
  endDate: string;        // ISO
  currency: Currency;
  standard: AccountingStandard;
  unit: Unit;             // reporting unit for absolute values
  income: IncomeStatement;
  balance: BalanceSheet;
  cashFlow: CashFlowStatement;
  source?: string;
  isEstimate?: boolean;
}

export interface NormalizationAdjustment {
  id: string;
  periodLabel: string;
  lineItem: 'EBITDA' | 'EBIT' | 'NET_INCOME';
  category:
    | 'ONE_OFF_EXPENSE'
    | 'EXTRAORDINARY_GAIN'
    | 'RESTRUCTURING'
    | 'IMPAIRMENT'
    | 'UNUSUAL_TAX'
    | 'M_AND_A'
    | 'DISCONTINUED_OPS'
    | 'OTHER';
  amount: number;   // signed, added to the reported figure
  rationale: string;
  author: string;
  createdAt: string;
}

export interface MarketSnapshot {
  price: number | null;
  sharesOutstanding: number | null;
  marketCap: number | null;
  netDebt: number | null;
  minorityInterest: number | null;
  enterpriseValue: number | null;
  currency: Currency;
  asOf: string;
}

export interface EngineNote {
  level: 'INFO' | 'WARNING';
  message: string;
}
