import type { CompanyQualitative } from '../types';
import { ENERGY } from './energy';
import { FINANCIALS } from './financials';
import { HEALTH_CARE } from './healthcare';
import { REAL_ESTATE } from './realestate';
import { MATERIALS } from './materials';
import { UTILITIES } from './utilities';

/* ==================================================================
   Company qualitative profiles.

   Split by sector because that is how they get written and reviewed —
   the questions worth asking about a miner are not the questions worth
   asking about a bank, and grouping them keeps each file internally
   comparable.

   A company with no profile yet returns null, and the UI says so
   rather than rendering an empty shell. An empty page that looks like
   a finished one is worse than an honest absence.
   ================================================================== */

export const COMPANY_QUALITATIVE: CompanyQualitative[] = [
  ...ENERGY,
  ...FINANCIALS,
  ...HEALTH_CARE,
  ...REAL_ESTATE,
  ...MATERIALS,
  ...UTILITIES,
];

const BY_TICKER = new Map(COMPANY_QUALITATIVE.map((c) => [c.ticker, c]));

export function findCompanyQualitative(ticker: string): CompanyQualitative | null {
  return BY_TICKER.get(ticker.toUpperCase()) ?? null;
}

/** How much of the universe has been researched, for the coverage view. */
export function qualitativeCoverage(): { researched: number; tickers: string[] } {
  return { researched: COMPANY_QUALITATIVE.length, tickers: [...BY_TICKER.keys()] };
}
