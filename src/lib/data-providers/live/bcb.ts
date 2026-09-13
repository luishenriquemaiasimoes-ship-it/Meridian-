import { getJson } from './http';
import { failed, ok, type Fetched } from './types';

/* ==================================================================
   Banco Central do Brasil — SGS.

   The SGS is the Bank's own time-series service and it is the primary
   publication of the Selic target, the IPCA and the reference exchange
   rate. Nothing here is a vendor's reading of a Brazilian rate: it is
   the Brazilian rate, from the institution that sets it.
   ================================================================== */

const BASE = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs';

/**
 * SGS series numbers. These are stable identifiers the Bank has published
 * for decades, not codes invented here.
 */
export const SERIES = {
  /** Selic target set by the Copom, % a year. */
  selicTarget: { code: 432, name: 'Selic meta (Copom)', unit: 'PERCENT' },
  /** IPCA accumulated over twelve months, % — the index the inflation target is set on. */
  ipca12m: { code: 13522, name: 'IPCA acumulado 12 meses', unit: 'PERCENT' },
  /** Reference USD/BRL selling rate (PTAX). */
  usdBrl: { code: 1, name: 'Dólar (PTAX venda)', unit: 'CURRENCY' },
  /** CDI accumulated, % a year. */
  cdi: { code: 4389, name: 'CDI a.a.', unit: 'PERCENT' },
  /** IPCA for the month, %. */
  ipcaMonth: { code: 433, name: 'IPCA mensal', unit: 'PERCENT' },
} as const;

export type SeriesKey = keyof typeof SERIES;

interface SgsRow { data: string; valor: string }

/** SGS dates are dd/MM/yyyy. */
function isoFromBrazilian(d: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d.trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

export interface Observation {
  value: number;
  /** The previous observation, where the series has one — for a change reading. */
  previous: number | null;
  asOf: string;
  name: string;
  unit: string;
}

/**
 * The latest value of one series, with the observation before it.
 *
 * Two observations rather than one because every indicator in the product
 * shows a change, and computing that from a single point would mean inventing
 * the other end of it.
 */
export async function latest(key: SeriesKey): Promise<Fetched<Observation>> {
  const s = SERIES[key];
  const url = `${BASE}.${s.code}/dados/ultimos/2?formato=json`;
  const res = await getJson<SgsRow[]>(url);
  if (!res.ok) return res as Fetched<Observation>;

  const rows = res.value;
  if (!Array.isArray(rows) || rows.length === 0) {
    return failed(url, `series ${s.code} returned no observations`);
  }

  const last = rows[rows.length - 1];
  const asOf = isoFromBrazilian(last?.data ?? '');
  const value = Number(last?.valor);
  if (asOf === null || !Number.isFinite(value)) {
    return failed(url, `series ${s.code} returned an unparseable row: ${JSON.stringify(last)}`);
  }

  const prior = rows.length > 1 ? Number(rows[rows.length - 2]?.valor) : NaN;

  return ok(
    {
      value,
      previous: Number.isFinite(prior) ? prior : null,
      asOf,
      name: s.name,
      unit: s.unit,
    },
    { source: `Banco Central do Brasil — SGS ${s.code}`, url, asOf },
  );
}

/** Every series the platform uses, each succeeding or failing on its own. */
export async function allSeries(): Promise<Record<SeriesKey, Fetched<Observation>>> {
  const keys = Object.keys(SERIES) as SeriesKey[];
  const results = await Promise.all(keys.map((k) => latest(k)));
  return Object.fromEntries(keys.map((k, i) => [k, results[i]])) as Record<SeriesKey, Fetched<Observation>>;
}
