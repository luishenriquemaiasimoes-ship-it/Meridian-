import type { CompanyQualitative } from '../types';
import { COMMUNICATIONS } from './communications';
import { CONSUMER_DISCRETIONARY } from './consumer';
import { CONSUMER_STAPLES } from './staples';
import { ENERGY } from './energy';
import { FINANCIALS } from './financials';
import { HEALTH_CARE } from './healthcare';
import { INDUSTRIALS } from './industrials';
import { REAL_ESTATE } from './realestate';
import { TECH } from './tech';
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
  ...COMMUNICATIONS,
  ...CONSUMER_DISCRETIONARY,
  ...CONSUMER_STAPLES,
  ...ENERGY,
  ...FINANCIALS,
  ...HEALTH_CARE,
  ...INDUSTRIALS,
  ...REAL_ESTATE,
  ...TECH,
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
