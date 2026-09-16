import { getBytes } from './http';
import { failed, ok, type Fetched } from './types';
import { readZip, ZipError } from './zip';
import { numeric, parseCsv, type Row } from './csv';
import type { BalanceSheet, CashFlowStatement, IncomeStatement } from '@/lib/finance/types';

/* ==================================================================
   CVM — Demonstrações Financeiras Padronizadas.

   This is the filing itself. Every listed Brazilian company sends the
   CVM a standardised set of statements each year, the CVM publishes
   them as open data, and the account codes are fixed by the regulator
   rather than chosen by the company. That last part is what makes this
   usable without per-company mapping: 3.01 is net revenue at every
   company in Brazil, because the CVM says so.

   Consolidated figures are used wherever they exist. A holding's
   parent-only statements describe a company that does not operate.
   ================================================================== */

const BASE = 'https://dados.cvm.gov.br/dados/CIA_ABERTA';

/**
 * The regulator's chart of accounts, as far as the model needs it.
 *
 * These are prefixes matched exactly, not by `startsWith`: 3.01 is revenue and
 * 3.01.01 is a breakdown of it, and adding the two would double the top line.
 */
export const DRE = {
  revenue: '3.01',
  cogs: '3.02',
  grossProfit: '3.03',
  operatingExpenses: '3.04',
  sellingExpenses: '3.04.01',
  adminExpenses: '3.04.02',
  ebit: '3.05',
  financialResult: '3.06',
  ebt: '3.07',
  taxes: '3.08',
  netIncomeContinuing: '3.09',
  netIncome: '3.11',
} as const;

export const BPA = {
  totalAssets: '1',
  currentAssets: '1.01',
  cash: '1.01.01',
  shortTermInvestments: '1.01.02',
  receivables: '1.01.03',
  inventory: '1.01.04',
  nonCurrentAssets: '1.02',
  ppe: '1.02.03',
  intangibles: '1.02.04',
} as const;

export const BPP = {
  totalLiabilitiesAndEquity: '2',
  currentLiabilities: '2.01',
  payables: '2.01.02',
  shortTermDebt: '2.01.04',
  nonCurrentLiabilities: '2.02',
  longTermDebt: '2.02.01',
  equity: '2.03',
  shareCapital: '2.03.01',
  retainedEarnings: '2.03.05',
  minorityInterest: '2.03.09',
} as const;

export const DFC = {
  cfo: '6.01',
  cfi: '6.02',
  cff: '6.03',
  netChangeInCash: '6.05',
} as const;

/** ESCALA_MOEDA is either MIL or UNIDADE; the platform stores millions. */
function scaleToMillions(escala: string, value: number): number {
  const s = escala.trim().toUpperCase();
  if (s === 'MIL') return value / 1_000;
  if (s === 'UNIDADE') return value / 1_000_000;
  // An unrecognised scale must not be guessed at.
  return NaN;
}

export interface CvmStatementRows {
  /** Account code to value in millions, for one company and one period. */
  byAccount: Map<string, number>;
  denomination: string;
  cnpj: string;
  endDate: string;
  currency: string;
}

/**
 * Folds the CVM's long-format rows into one map per company per period.
 *
 * The files carry every company for a year, both consolidated and parent-only,
 * and both the current and the prior year of each filing. Selecting is the
 * whole job: `ORDEM_EXERC` of ÚLTIMO is the year the document is filed for,
 * and PENÚLTIMO is the comparative, which belongs to the previous filing and
 * would otherwise be loaded twice with different revisions.
 */
export function foldRows(rows: Row[], cnpj: string): CvmStatementRows | null {
  const mine = rows.filter(
    (r) => r.CNPJ_CIA === cnpj && (r.ORDEM_EXERC ?? '').toUpperCase().startsWith('ÚLT'),
  );
  if (mine.length === 0) return null;

  // A company can file more than once for a year; the highest VERSAO wins.
  const latestVersion = Math.max(...mine.map((r) => Number(r.VERSAO) || 0));
  const current = mine.filter((r) => (Number(r.VERSAO) || 0) === latestVersion);

  const byAccount = new Map<string, number>();
  for (const r of current) {
    const raw = numeric(r.VL_CONTA);
    if (raw === null) continue;
    const scaled = scaleToMillions(r.ESCALA_MOEDA ?? '', raw);
    if (!Number.isFinite(scaled)) continue;
    byAccount.set(r.CD_CONTA, scaled);
  }
  if (byAccount.size === 0) return null;

  const first = current[0];
  return {
    byAccount,
    denomination: first.DENOM_CIA ?? '',
    cnpj,
    endDate: first.DT_FIM_EXERC || first.DT_REFER || '',
    currency: first.MOEDA || 'REAL',
  };
}

const at = (m: Map<string, number>, code: string): number | null => m.get(code) ?? null;

/** Sums the entries that exist, or null when none do — never a zero standing in for absence. */
function sum(...values: (number | null)[]): number | null {
  const present = values.filter((v): v is number => v !== null);
  return present.length === 0 ? null : present.reduce((a, b) => a + b, 0);
}

export function incomeFrom(m: Map<string, number>): IncomeStatement {
  const revenue = at(m, DRE.revenue);
  const cogs = at(m, DRE.cogs);
  const ebit = at(m, DRE.ebit);
  const sga = sum(at(m, DRE.sellingExpenses), at(m, DRE.adminExpenses));

  return {
    revenue,
    // The CVM reports costs and expenses as negatives; the model wants magnitudes.
    cogs: cogs === null ? null : Math.abs(cogs),
    grossProfit: at(m, DRE.grossProfit),
    sga: sga === null ? null : Math.abs(sga),
    rnd: null,
    otherOpex: null,
    // D&A is not a line in the standardised DRE. It comes from the cash flow
    // statement, and is filled in there rather than guessed at here.
    ebitda: null,
    da: null,
    ebit,
    financialResult: at(m, DRE.financialResult),
    ebt: at(m, DRE.ebt),
    taxes: at(m, DRE.taxes),
    netIncome: at(m, DRE.netIncome) ?? at(m, DRE.netIncomeContinuing),
    minorityInterest: null,
    eps: null,
    dilutedShares: null,
  };
}

export function balanceFrom(assets: Map<string, number>, liabilities: Map<string, number>): BalanceSheet {
  const currentAssets = at(assets, BPA.currentAssets);
  const knownCurrent = sum(
    at(assets, BPA.cash), at(assets, BPA.shortTermInvestments),
    at(assets, BPA.receivables), at(assets, BPA.inventory),
  );
  const nonCurrent = at(assets, BPA.nonCurrentAssets);
  const knownNonCurrent = sum(at(assets, BPA.ppe), at(assets, BPA.intangibles));

  const currentLiabilities = at(liabilities, BPP.currentLiabilities);
  const knownCurrentLiabilities = sum(at(liabilities, BPP.payables), at(liabilities, BPP.shortTermDebt));
  const nonCurrentLiabilities = at(liabilities, BPP.nonCurrentLiabilities);
  const longTermDebt = at(liabilities, BPP.longTermDebt);

  const total = at(liabilities, BPP.totalLiabilitiesAndEquity) ?? at(assets, BPA.totalAssets);
  const equity = at(liabilities, BPP.equity);

  return {
    cash: at(assets, BPA.cash),
    accountsReceivable: at(assets, BPA.receivables),
    inventory: at(assets, BPA.inventory),
    // What the company put in current assets beyond the named lines. The
    // regulator's subtotal less its own components, not an assumption.
    otherCurrentAssets: currentAssets !== null && knownCurrent !== null
      ? currentAssets - knownCurrent : null,
    ppe: at(assets, BPA.ppe),
    // The CVM does not separate goodwill from other intangibles in the
    // standardised balance sheet, so it is reported as intangibles and
    // goodwill stays null rather than being split by guesswork.
    intangibles: at(assets, BPA.intangibles),
    goodwill: null,
    otherAssets: nonCurrent !== null && knownNonCurrent !== null ? nonCurrent - knownNonCurrent : null,
    totalAssets: at(assets, BPA.totalAssets),

    accountsPayable: at(liabilities, BPP.payables),
    shortTermDebt: at(liabilities, BPP.shortTermDebt),
    otherCurrentLiabilities: currentLiabilities !== null && knownCurrentLiabilities !== null
      ? currentLiabilities - knownCurrentLiabilities : null,
    longTermDebt,
    // Lease liabilities are inside the debt lines in the standardised layout
    // and cannot be separated from them here.
    leaseLiabilities: null,
    otherLiabilities: nonCurrentLiabilities !== null && longTermDebt !== null
      ? nonCurrentLiabilities - longTermDebt : null,
    totalLiabilities: total !== null && equity !== null ? total - equity : null,

    shareCapital: at(liabilities, BPP.shareCapital),
    retainedEarnings: at(liabilities, BPP.retainedEarnings),
    treasuryStock: null,
    minorityInterestEquity: at(liabilities, BPP.minorityInterest),
    totalEquity: equity,
  };
}

export function cashFlowFrom(m: Map<string, number>, netIncome: number | null): CashFlowStatement {
  return {
    netIncome,
    // The indirect-method statement has depreciation inside the operating
    // block, but the sub-account it sits in is not fixed by the regulator, so
    // it is located by description rather than by code — done by the caller,
    // which has the descriptions.
    da: null,
    workingCapitalChange: null,
    otherOperating: null,
    cfo: at(m, DFC.cfo),
    capex: null,
    acquisitions: null,
    otherInvesting: null,
    cfi: at(m, DFC.cfi),
    debtIssued: null,
    debtRepaid: null,
    dividendsPaid: null,
    buybacks: null,
    otherFinancing: null,
    cff: at(m, DFC.cff),
    netChangeInCash: at(m, DFC.netChangeInCash),
  };
}

/**
 * Depreciation and capital expenditure, found by what the line says.
 *
 * Neither has a fixed code: the regulator fixes the top-level blocks of the
 * cash flow statement but lets companies name what goes inside them. So these
 * are matched on DS_CONTA, the company's own label, restricted to the block
 * each belongs in — depreciation inside operating, capex inside investing —
 * so a word appearing in the wrong half cannot be picked up by accident.
 */
export function findByDescription(
  rows: Row[], blockPrefix: string, test: RegExp | ((description: string) => boolean),
): number | null {
  const matches_ = (d: string) => (test instanceof RegExp ? test.test(d) : test(d));
  const matches = rows.filter(
    (r) => r.CD_CONTA?.startsWith(blockPrefix) && matches_(r.DS_CONTA ?? ''),
  );
  if (matches.length === 0) return null;

  let total = 0;
  let found = false;
  for (const r of matches) {
    const raw = numeric(r.VL_CONTA);
    if (raw === null) continue;
    const scaled = scaleToMillions(r.ESCALA_MOEDA ?? '', raw);
    if (!Number.isFinite(scaled)) continue;
    total += scaled;
    found = true;
  }
  return found ? total : null;
}

export const DEPRECIATION_PATTERN = /deprecia|amortiza|exaust/i;

/**
 * Capital expenditure, identified by what it buys rather than by how it is
 * phrased.
 *
 * The first version listed phrasings — "aquisição de imobilizado" and a few
 * neighbours — and found nothing for either Petrobras or Vale, because
 * Brazilian statements overwhelmingly say "Adições ao Imobilizado". Listing
 * verbs is a losing game: companies name these lines themselves, and there are
 * as many phrasings as there are filers.
 *
 * What does not vary is the asset. Inside the investing block, money moving in
 * respect of `imobilizado` or `intangível` is capital expenditure — unless it
 * is moving the other way. Disposals belong to the same assets and must not be
 * netted into the spend: a company selling a refinery has not invested in one.
 */
const CAPEX_ASSET = /imobilizado|intang[íi]vel/i;
const DISPOSAL = /venda|alienac|aliena[çc]|baixa|recebiment|recebid|desinvest|aliena/i;

export function isCapexLine(description: string): boolean {
  return CAPEX_ASSET.test(description) && !DISPOSAL.test(description);
}

/** Retained for callers that want the asset test on its own. */
export const CAPEX_PATTERN = CAPEX_ASSET;

/** The zipped DFP file for one year. */
export function dfpUrl(year: number): string {
  return `${BASE}/DOC/DFP/DADOS/dfp_cia_aberta_${year}.zip`;
}

/** The registry that maps a CVM code and CNPJ to a company name. */
export function registryUrl(): string {
  return `${BASE}/CAD/DADOS/cad_cia_aberta.csv`;
}

export interface DfpYear {
  year: number;
  /** Every statement file in the archive, keyed by the CVM's own file naming. */
  files: Map<string, Row[]>;
}

/**
 * Downloads and unpacks one year of filings.
 *
 * One archive carries every listed company, so this is fetched once per year
 * and then read for each company rather than fetched per company — the
 * difference between one download and four hundred.
 */
export async function fetchDfpYear(year: number): Promise<Fetched<DfpYear>> {
  const url = dfpUrl(year);
  const res = await getBytes(url);
  if (!res.ok) return res as Fetched<DfpYear>;

  let entries;
  try {
    entries = readZip(res.value);
  } catch (e) {
    const why = e instanceof ZipError ? e.message : String(e);
    return failed(url, `could not unpack the archive: ${why}`);
  }

  const files = new Map<string, Row[]>();
  for (const entry of entries) {
    if (!/\.csv$/i.test(entry.name)) continue;
    files.set(entry.name.toLowerCase(), parseCsv(entry.data));
  }
  if (files.size === 0) return failed(url, `the archive held no CSV files (${entries.length} entries)`);

  return ok({ year, files }, { source: `CVM — DFP ${year}`, url, asOf: `${year}-12-31` });
}

/** Picks the consolidated file for a statement, falling back to parent-only. */
export function statementFile(year: DfpYear, statement: 'DRE' | 'BPA' | 'BPP' | 'DFC_MI'): Row[] | null {
  const consolidated = `dfp_cia_aberta_${statement.toLowerCase()}_con_${year.year}.csv`;
  const individual = `dfp_cia_aberta_${statement.toLowerCase()}_ind_${year.year}.csv`;
  return year.files.get(consolidated) ?? year.files.get(individual) ?? null;
}
