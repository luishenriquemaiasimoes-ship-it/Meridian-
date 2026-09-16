import { getBytes } from './http';
import { failed, ok, type Fetched } from './types';
import { numeric, parseCsv } from './csv';

/* ==================================================================
   Tesouro Transparente — yields on the bonds the Treasury sells.

   The Brazilian risk-free rate has to come from a Brazilian government
   bond, and the Selic is not one: it is the overnight policy rate,
   which is a different instrument with a different maturity and a
   different meaning in a discount rate.

   The National Treasury publishes the daily yield on every bond it
   offers through Tesouro Direto. The prefixed bond with semiannual
   coupons is the NTN-F, and the inflation-linked one is the NTN-B —
   which is the nominal and the real rate the platform already asks for.
   ================================================================== */

const PRICES = 'https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/'
  + 'resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv';

export interface TreasuryYield {
  /** Bond name as the Treasury writes it. */
  bond: string;
  maturity: string;
  /** Yield to maturity as a decimal. */
  rate: number;
  asOf: string;
}

/** dd/MM/yyyy, as the Treasury publishes it. */
function isoDate(d: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d.trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

/** The Treasury quotes decimals with a comma. */
function brNumber(v: string | undefined): number | null {
  if (!v) return null;
  return numeric(v.replace(/\./g, '').replace(',', '.'));
}

export interface TreasuryCurve {
  /** The longest nominal (prefixed) bond on offer. */
  nominal: TreasuryYield | null;
  /** The longest inflation-linked bond on offer. */
  real: TreasuryYield | null;
  asOf: string;
}

/**
 * The most recent quote for the longest bond of each kind.
 *
 * Longest rather than a fixed maturity because which bonds are on offer
 * changes: asking for the 2033 NTN-F by name would start returning nothing the
 * day the Treasury stops issuing it. The longest available is always the best
 * approximation to a perpetuity discount rate.
 */
export async function latestYields(): Promise<Fetched<TreasuryCurve>> {
  // The file carries the full history of every bond, so this is a large
  // download for two numbers. It is the official source and there is no
  // lighter endpoint that gives a long nominal yield.
  const res = await getBytes(PRICES, { stallMs: 60_000 });
  if (!res.ok) return res as Fetched<TreasuryCurve>;

  const rows = parseCsv(res.value);
  if (rows.length === 0) return failed(PRICES, 'the price file parsed to no rows');

  // Column names carry accents and have shifted before; find them by content.
  const header = Object.keys(rows[0]);
  const col = (re: RegExp) => header.find((h) => re.test(h)) ?? '';
  const cBond = col(/tipo.*t[íi]tulo/i);
  const cMaturity = col(/vencimento/i);
  const cDate = col(/data.*base|data.*refer/i);
  const cRate = col(/taxa.*compra|taxa.*manh/i);
  if (!cBond || !cMaturity || !cDate || !cRate) {
    return failed(PRICES, `could not find the expected columns. Header is: ${header.join(', ')}`);
  }

  let latest = '';
  for (const r of rows) {
    const d = isoDate(r[cDate] ?? '');
    if (d && d > latest) latest = d;
  }
  if (!latest) return failed(PRICES, 'no parseable dates in the price file');

  const onLatest = rows.filter((r) => isoDate(r[cDate] ?? '') === latest);

  const longest = (match: RegExp): TreasuryYield | null => {
    let best: TreasuryYield | null = null;
    for (const r of onLatest) {
      const bond = r[cBond] ?? '';
      if (!match.test(bond)) continue;
      const maturity = isoDate(r[cMaturity] ?? '');
      const rate = brNumber(r[cRate]);
      if (!maturity || rate === null) continue;
      if (!best || maturity > best.maturity) {
        best = { bond, maturity, rate: rate / 100, asOf: latest };
      }
    }
    return best;
  };

  // "Tesouro Prefixado com Juros Semestrais" is the NTN-F; "Tesouro IPCA+" is
  // the NTN-B. The plain "Tesouro Prefixado" is an LTN, which pays no coupon
  // and is short, so it is excluded.
  const nominal = longest(/prefixado com juros semestrais/i);
  const real = longest(/ipca\+/i);

  if (!nominal && !real) {
    return failed(PRICES, `no prefixed or inflation-linked bonds quoted on ${latest}`);
  }

  return ok(
    { nominal, real, asOf: latest },
    { source: 'Tesouro Nacional — Tesouro Transparente', url: PRICES, asOf: latest },
  );
}
