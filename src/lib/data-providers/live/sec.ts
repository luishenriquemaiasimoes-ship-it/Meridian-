import { getJson } from './http';
import { failed, ok, type Fetched } from './types';
import type { BalanceSheet, CashFlowStatement, IncomeStatement } from '@/lib/finance/types';

/* ==================================================================
   SEC — EDGAR company facts.

   Every US filer tags its statements in XBRL and the SEC republishes
   the tags as JSON. This is the 10-K itself, not a vendor's reading of
   one.

   The catch is the opposite of the CVM's. Brazil fixes the account
   codes and lets companies name the lines; US GAAP fixes the names and
   lets companies choose which to use. Apple's revenue is
   RevenueFromContractWithCustomerExcludingAssessedTax, an older filer's
   is SalesRevenueNet, and a third has Revenues. So each line is a
   chain of candidate tags tried in order of how specific they are, and
   a line nobody tagged stays null.
   ================================================================== */

const FACTS = 'https://data.sec.gov/api/xbrl/companyfacts';
const TICKERS = 'https://www.sec.gov/files/company_tickers.json';
const SUBMISSIONS = 'https://data.sec.gov/submissions';

interface FactPoint {
  start?: string;
  end: string;
  val: number;
  fy?: number;
  fp?: string;
  form?: string;
  filed?: string;
  frame?: string;
}

export interface CompanyFacts {
  cik: number;
  entityName: string;
  facts: Record<string, Record<string, { units: Record<string, FactPoint[]> }>>;
}

/* --------------------------- identity --------------------------- */

/** The SEC keys everything on a CIK, so a ticker has to be resolved first. */
export async function cikFor(ticker: string): Promise<Fetched<{ cik: number; name: string }>> {
  const res = await getJson<Record<string, { cik_str: number; ticker: string; title: string }>>(TICKERS);
  if (!res.ok) return res as Fetched<{ cik: number; name: string }>;

  const wanted = ticker.toUpperCase();
  for (const row of Object.values(res.value)) {
    if (row.ticker?.toUpperCase() === wanted) {
      return ok(
        { cik: row.cik_str, name: row.title },
        { source: 'SEC — company tickers', url: TICKERS, asOf: '' },
      );
    }
  }
  return failed(TICKERS, `${ticker} is not in the SEC's ticker list — it may not be a US filer`);
}

export const cikUrl = (cik: number): string =>
  `${FACTS}/CIK${String(cik).padStart(10, '0')}.json`;

export async function companyFacts(cik: number): Promise<Fetched<CompanyFacts>> {
  const url = cikUrl(cik);
  const res = await getJson<CompanyFacts>(url);
  if (!res.ok) return res as Fetched<CompanyFacts>;
  if (!res.value.facts) return failed(url, 'the response carried no facts block');
  return ok(res.value, { source: `SEC — EDGAR company facts (CIK ${cik})`, url, asOf: '' });
}

/* ----------------------- reading the facts ----------------------- */

/**
 * The value of one concept for one fiscal year.
 *
 * `duration` separates the two kinds of fact: an income or cash-flow line
 * covers a period and carries a start, a balance-sheet line is an instant and
 * does not. Asking for the wrong kind is how a quarter ends up read as a year.
 *
 * Where a period has been filed more than once — an original and then a
 * restatement — the latest filing wins, because that is what the company now
 * says happened.
 */
export function factFor(
  facts: CompanyFacts,
  concepts: string[],
  fiscalYear: number,
  kind: 'duration' | 'instant',
): { value: number; concept: string; end: string } | null {
  for (const taxonomy of ['us-gaap', 'ifrs-full']) {
    const block = facts.facts[taxonomy];
    if (!block) continue;

    for (const concept of concepts) {
      const units = block[concept]?.units;
      if (!units) continue;
      // USD first; a filer reporting in another currency lists it under that key.
      const series = units.USD ?? Object.values(units)[0];
      if (!Array.isArray(series)) continue;

      const candidates = series.filter((p) => {
        if (p.fy !== fiscalYear || p.fp !== 'FY') return false;
        if (p.form !== '10-K' && p.form !== '20-F' && p.form !== '40-F') return false;
        if (kind === 'instant') return p.start === undefined;
        if (p.start === undefined) return false;
        // A full year, give or take a 52/53-week retail calendar.
        const days = (Date.parse(p.end) - Date.parse(p.start)) / 86_400_000;
        return days > 300 && days < 400;
      });
      if (candidates.length === 0) continue;

      candidates.sort((a, b) => (a.filed ?? '').localeCompare(b.filed ?? ''));
      const chosen = candidates[candidates.length - 1];
      if (typeof chosen.val === 'number' && Number.isFinite(chosen.val)) {
        return { value: chosen.val, concept, end: chosen.end };
      }
    }
  }
  return null;
}

/** Which fiscal years the filer has a full annual revenue figure for. */
export function annualYears(facts: CompanyFacts): number[] {
  const years = new Set<number>();
  for (const taxonomy of ['us-gaap', 'ifrs-full']) {
    const block = facts.facts[taxonomy];
    if (!block) continue;
    for (const concept of REVENUE) {
      const series = block[concept]?.units?.USD;
      if (!Array.isArray(series)) continue;
      for (const p of series) {
        if (p.fp === 'FY' && (p.form === '10-K' || p.form === '20-F') && p.start && p.fy) {
          const days = (Date.parse(p.end) - Date.parse(p.start)) / 86_400_000;
          if (days > 300 && days < 400) years.add(p.fy);
        }
      }
    }
  }
  return [...years].sort((a, b) => a - b);
}

/* ------------------- the tag chains, most specific first ------------------- */

const REVENUE = [
  'RevenueFromContractWithCustomerExcludingAssessedTax',
  'RevenueFromContractWithCustomerIncludingAssessedTax',
  'Revenues', 'SalesRevenueNet', 'SalesRevenueGoodsNet',
];
const COGS = [
  'CostOfGoodsAndServicesSold', 'CostOfRevenue', 'CostOfGoodsSold', 'CostOfServices',
];
const SGA = ['SellingGeneralAndAdministrativeExpense', 'GeneralAndAdministrativeExpense'];
const RND = ['ResearchAndDevelopmentExpense'];
const EBIT = ['OperatingIncomeLoss'];
const EBT = [
  'IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest',
  'IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments',
];
const TAXES = ['IncomeTaxExpenseBenefit'];
const NET_INCOME = ['NetIncomeLoss', 'ProfitLoss'];

const CASH = ['CashAndCashEquivalentsAtCarryingValue', 'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents'];
const RECEIVABLES = ['AccountsReceivableNetCurrent', 'ReceivablesNetCurrent'];
const INVENTORY = ['InventoryNet'];
const CURRENT_ASSETS = ['AssetsCurrent'];
const TOTAL_ASSETS = ['Assets'];
const PPE = ['PropertyPlantAndEquipmentNet'];
const GOODWILL = ['Goodwill'];
const INTANGIBLES = ['IntangibleAssetsNetExcludingGoodwill', 'FiniteLivedIntangibleAssetsNet'];
const PAYABLES = ['AccountsPayableCurrent', 'AccountsPayableAndAccruedLiabilitiesCurrent'];
const SHORT_DEBT = ['LongTermDebtCurrent', 'DebtCurrent', 'ShortTermBorrowings'];
const LONG_DEBT = ['LongTermDebtNoncurrent', 'LongTermDebt'];
const LEASES = ['OperatingLeaseLiabilityNoncurrent', 'FinanceLeaseLiabilityNoncurrent'];
const CURRENT_LIABILITIES = ['LiabilitiesCurrent'];
const TOTAL_LIABILITIES = ['Liabilities'];
const EQUITY = ['StockholdersEquity'];
const EQUITY_WITH_MINORITY = ['StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'];
const SHARE_CAPITAL = ['AdditionalPaidInCapital', 'CommonStockValue', 'CommonStocksIncludingAdditionalPaidInCapital'];
const RETAINED = ['RetainedEarningsAccumulatedDeficit'];
const TREASURY = ['TreasuryStockValue', 'TreasuryStockCommonValue'];
const MINORITY = ['MinorityInterest'];

const CFO = ['NetCashProvidedByUsedInOperatingActivities', 'NetCashProvidedByUsedInOperatingActivitiesContinuingOperations'];
const CFI = ['NetCashProvidedByUsedInInvestingActivities', 'NetCashProvidedByUsedInInvestingActivitiesContinuingOperations'];
const CFF = ['NetCashProvidedByUsedInFinancingActivities', 'NetCashProvidedByUsedInFinancingActivitiesContinuingOperations'];
const DA = ['DepreciationDepletionAndAmortization', 'DepreciationAmortizationAndAccretionNet', 'DepreciationAndAmortization', 'Depreciation'];
const CAPEX = ['PaymentsToAcquirePropertyPlantAndEquipment', 'PaymentsToAcquireProductiveAssets'];
const ACQUISITIONS = ['PaymentsToAcquireBusinessesNetOfCashAcquired'];
const DEBT_ISSUED = ['ProceedsFromIssuanceOfLongTermDebt', 'ProceedsFromIssuanceOfDebt'];
const DEBT_REPAID = ['RepaymentsOfLongTermDebt', 'RepaymentsOfDebt'];
const DIVIDENDS = ['PaymentsOfDividendsCommonStock', 'PaymentsOfDividends'];
const BUYBACKS = ['PaymentsForRepurchaseOfCommonStock'];
const NET_CHANGE = ['CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalentsPeriodIncreaseDecreaseIncludingExchangeRateEffect', 'CashAndCashEquivalentsPeriodIncreaseDecrease'];

/* --------------------------- assembly --------------------------- */

/** US filers report in dollars; the platform stores millions. */
const toMillions = (v: number | null): number | null => (v === null ? null : v / 1_000_000);

export interface SecStatements {
  fiscalYear: number;
  endDate: string;
  income: IncomeStatement;
  balance: BalanceSheet;
  cashFlow: CashFlowStatement;
  /** Which tag each line was read from, so a reader can check the mapping. */
  concepts: Record<string, string>;
}

export function statementsFor(facts: CompanyFacts, fiscalYear: number): SecStatements | null {
  const concepts: Record<string, string> = {};

  const read = (chain: string[], kind: 'duration' | 'instant', label: string): number | null => {
    const hit = factFor(facts, chain, fiscalYear, kind);
    if (!hit) return null;
    concepts[label] = hit.concept;
    return hit.value;
  };
  const period = (chain: string[], label: string) => toMillions(read(chain, 'duration', label));
  const instant = (chain: string[], label: string) => toMillions(read(chain, 'instant', label));

  const revenue = period(REVENUE, 'revenue');
  if (revenue === null) return null;

  const endHit = factFor(facts, REVENUE, fiscalYear, 'duration');
  const cogs = period(COGS, 'cogs');
  const netIncome = period(NET_INCOME, 'netIncome');

  const income: IncomeStatement = {
    revenue,
    cogs: cogs === null ? null : Math.abs(cogs),
    grossProfit: cogs === null ? null : revenue - Math.abs(cogs),
    sga: (() => { const v = period(SGA, 'sga'); return v === null ? null : Math.abs(v); })(),
    rnd: (() => { const v = period(RND, 'rnd'); return v === null ? null : Math.abs(v); })(),
    otherOpex: null,
    ebitda: null,
    da: null,
    ebit: period(EBIT, 'ebit'),
    financialResult: null,
    ebt: period(EBT, 'ebt'),
    taxes: period(TAXES, 'taxes'),
    netIncome,
    minorityInterest: null,
    eps: null,
    dilutedShares: null,
  };

  const currentAssets = instant(CURRENT_ASSETS, 'currentAssets');
  const cash = instant(CASH, 'cash');
  const receivables = instant(RECEIVABLES, 'receivables');
  const inventory = instant(INVENTORY, 'inventory');
  const totalAssets = instant(TOTAL_ASSETS, 'totalAssets');
  const ppe = instant(PPE, 'ppe');
  const goodwill = instant(GOODWILL, 'goodwill');
  const intangibles = instant(INTANGIBLES, 'intangibles');
  const currentLiabilities = instant(CURRENT_LIABILITIES, 'currentLiabilities');
  const payables = instant(PAYABLES, 'payables');
  const shortTermDebt = instant(SHORT_DEBT, 'shortTermDebt');
  const longTermDebt = instant(LONG_DEBT, 'longTermDebt');
  const totalLiabilities = instant(TOTAL_LIABILITIES, 'totalLiabilities');
  const equity = instant(EQUITY, 'equity') ?? instant(EQUITY_WITH_MINORITY, 'equity');

  const known = (...xs: (number | null)[]) => {
    const present = xs.filter((x): x is number => x !== null);
    return present.length === 0 ? null : present.reduce((a, b) => a + b, 0);
  };
  const knownCurrent = known(cash, receivables, inventory);
  const nonCurrentAssets = totalAssets !== null && currentAssets !== null ? totalAssets - currentAssets : null;
  const knownNonCurrent = known(ppe, goodwill, intangibles);
  const knownCurrentLiabilities = known(payables, shortTermDebt);
  const nonCurrentLiabilities = totalLiabilities !== null && currentLiabilities !== null
    ? totalLiabilities - currentLiabilities : null;

  const balance: BalanceSheet = {
    cash, accountsReceivable: receivables, inventory,
    otherCurrentAssets: currentAssets !== null && knownCurrent !== null ? currentAssets - knownCurrent : null,
    ppe, intangibles, goodwill,
    otherAssets: nonCurrentAssets !== null && knownNonCurrent !== null ? nonCurrentAssets - knownNonCurrent : null,
    totalAssets,
    accountsPayable: payables, shortTermDebt,
    otherCurrentLiabilities: currentLiabilities !== null && knownCurrentLiabilities !== null
      ? currentLiabilities - knownCurrentLiabilities : null,
    longTermDebt,
    leaseLiabilities: instant(LEASES, 'leaseLiabilities'),
    otherLiabilities: nonCurrentLiabilities !== null && longTermDebt !== null
      ? nonCurrentLiabilities - longTermDebt : null,
    totalLiabilities,
    shareCapital: instant(SHARE_CAPITAL, 'shareCapital'),
    retainedEarnings: instant(RETAINED, 'retainedEarnings'),
    treasuryStock: (() => { const v = instant(TREASURY, 'treasuryStock'); return v === null ? null : -Math.abs(v); })(),
    minorityInterestEquity: instant(MINORITY, 'minorityInterest'),
    totalEquity: equity,
  };

  const capex = period(CAPEX, 'capex');
  const da = period(DA, 'da');

  const cashFlow: CashFlowStatement = {
    netIncome,
    // Filed as a positive add-back.
    da: da === null ? null : Math.abs(da),
    workingCapitalChange: null,
    otherOperating: null,
    cfo: period(CFO, 'cfo'),
    // Filed as a positive payment; the model treats capex as an outflow.
    capex: capex === null ? null : -Math.abs(capex),
    acquisitions: (() => { const v = period(ACQUISITIONS, 'acquisitions'); return v === null ? null : -Math.abs(v); })(),
    otherInvesting: null,
    cfi: period(CFI, 'cfi'),
    debtIssued: period(DEBT_ISSUED, 'debtIssued'),
    debtRepaid: (() => { const v = period(DEBT_REPAID, 'debtRepaid'); return v === null ? null : -Math.abs(v); })(),
    dividendsPaid: (() => { const v = period(DIVIDENDS, 'dividendsPaid'); return v === null ? null : -Math.abs(v); })(),
    buybacks: (() => { const v = period(BUYBACKS, 'buybacks'); return v === null ? null : -Math.abs(v); })(),
    otherFinancing: null,
    cff: period(CFF, 'cff'),
    netChangeInCash: period(NET_CHANGE, 'netChangeInCash'),
  };

  // D&A belongs on the income statement too, where the engine reads it.
  income.da = cashFlow.da;
  if (income.ebit !== null && cashFlow.da !== null) income.ebitda = income.ebit + cashFlow.da;

  return { fiscalYear, endDate: endHit?.end ?? '', income, balance, cashFlow, concepts };
}

/** Recent filings, for the news and documents feed. */
export interface Filing {
  form: string;
  filedAt: string;
  title: string;
  url: string;
}

export async function recentFilings(cik: number, limit = 20): Promise<Fetched<Filing[]>> {
  const url = `${SUBMISSIONS}/CIK${String(cik).padStart(10, '0')}.json`;
  const res = await getJson<{
    name?: string;
    filings?: { recent?: { form?: string[]; filingDate?: string[]; accessionNumber?: string[]; primaryDocument?: string[]; primaryDocDescription?: string[] } };
  }>(url);
  if (!res.ok) return res as Fetched<Filing[]>;

  const recent = res.value.filings?.recent;
  if (!recent?.form) return failed(url, 'the submissions response carried no recent filings');

  const out: Filing[] = [];
  for (let i = 0; i < Math.min(recent.form.length, limit * 4) && out.length < limit; i++) {
    const form = recent.form[i];
    // The filings an analyst reads, not every ownership form.
    if (!/^(10-K|10-Q|8-K|20-F|DEF 14A|6-K)$/.test(form ?? '')) continue;
    const accession = (recent.accessionNumber?.[i] ?? '').replace(/-/g, '');
    const doc = recent.primaryDocument?.[i] ?? '';
    out.push({
      form,
      filedAt: recent.filingDate?.[i] ?? '',
      title: recent.primaryDocDescription?.[i] || form,
      url: `https://www.sec.gov/Archives/edgar/data/${cik}/${accession}/${doc}`,
    });
  }
  return ok(out, { source: `SEC — EDGAR filings (CIK ${cik})`, url, asOf: out[0]?.filedAt ?? '' });
}
