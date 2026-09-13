import { getText } from './http';
import { failed, ok, type Fetched } from './types';

/* ==================================================================
   US Treasury — daily par yield curve.

   The Treasury publishes the curve it borrows at, every business day,
   as an XML feed. It is the primary source for the dollar risk-free
   rate, which is what the WACC needs: not a vendor's copy of the ten
   year, the ten year.
   ================================================================== */

const FEED = 'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml';

export interface YieldCurve {
  /** Tenor in years mapped to the par yield as a decimal, so 0.0412 not 4.12. */
  byTenor: Record<string, number>;
  asOf: string;
}

/** The tenors the feed publishes, in the element names it uses. */
const TENORS: [string, string][] = [
  ['1M', 'BC_1MONTH'], ['3M', 'BC_3MONTH'], ['6M', 'BC_6MONTH'],
  ['1Y', 'BC_1YEAR'], ['2Y', 'BC_2YEAR'], ['3Y', 'BC_3YEAR'],
  ['5Y', 'BC_5YEAR'], ['7Y', 'BC_7YEAR'], ['10Y', 'BC_10YEAR'],
  ['20Y', 'BC_20YEAR'], ['30Y', 'BC_30YEAR'],
];

function lastTag(xml: string, tag: string): string | null {
  const matches = [...xml.matchAll(new RegExp(`<(?:\\w+:)?${tag}[^>]*>([^<]*)</(?:\\w+:)?${tag}>`, 'g'))];
  const last = matches[matches.length - 1];
  return last ? last[1].trim() : null;
}

/**
 * The most recent published curve.
 *
 * The feed carries a whole year and the entries are in date order, so the
 * curve wanted is the last one in the document. Asking for "today" would
 * fail every weekend and every federal holiday.
 */
export async function latestCurve(year = new Date().getUTCFullYear()): Promise<Fetched<YieldCurve>> {
  const url = `${FEED}?data=daily_treasury_yield_curve&field_tdr_date_value=${year}`;
  const res = await getText(url, { headers: { Accept: 'application/xml' } });
  if (!res.ok) return res as Fetched<YieldCurve>;

  const xml = res.value;
  // Each day is one <entry>; take the last, which is the most recent.
  const entries = xml.split(/<entry[\s>]/).slice(1);
  const newest = entries[entries.length - 1];
  if (!newest) {
    return failed(url, `no daily entries in the ${year} curve feed (${xml.length} bytes)`);
  }

  const rawDate = lastTag(newest, 'NEW_DATE');
  const asOf = rawDate ? rawDate.slice(0, 10) : null;
  if (!asOf) return failed(url, 'the newest entry carries no date');

  const byTenor: Record<string, number> = {};
  for (const [label, tag] of TENORS) {
    const raw = lastTag(newest, tag);
    const pct = raw === null ? NaN : Number(raw);
    // The feed quotes percentages; the platform stores decimals throughout.
    if (Number.isFinite(pct)) byTenor[label] = pct / 100;
  }

  if (Object.keys(byTenor).length === 0) {
    return failed(url, `the entry for ${asOf} carried no readable tenors`);
  }

  return ok({ byTenor, asOf }, { source: 'US Department of the Treasury — daily par yield curve', url, asOf });
}
