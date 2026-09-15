import { getBytes } from './http';
import { parseCsv } from './csv';
import { failed, ok, type Fetched } from './types';

/* ==================================================================
   Ticker to CNPJ.

   The CVM indexes every filing by CNPJ and never mentions a ticker, so
   something has to bridge the two. The CVM's own registry of listed
   companies carries the CNPJ against the legal name, and the legal
   name is what the platform already stores.

   Matching on a name is the kind of thing that works for ninety
   companies and then quietly attaches the wrong statements to the
   ninety-first. So it is deliberately strict: names are normalised to
   a comparable form, a match must be unique, and anything ambiguous or
   absent is reported by name rather than resolved by picking the first
   candidate.
   ================================================================== */

const REGISTRY = 'https://dados.cvm.gov.br/dados/CIA_ABERTA/CAD/DADOS/cad_cia_aberta.csv';

/**
 * A legal name reduced to what is comparable across two registries.
 *
 * Accents, punctuation and the corporate form are all written differently in
 * different places — "Petróleo Brasileiro S.A." against "PETROLEO BRASILEIRO
 * S A PETROBRAS" — and none of that difference is information.
 */
export function normaliseName(name: string): string {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')   // strip accents
    .toUpperCase()
    .replace(/&/g, ' E ')
    .replace(/COMPANHIA/g, 'CIA')
    .replace(/[^A-Z0-9 ]+/g, ' ')                        // punctuation out
    .replace(/\b(S A|SA|LTDA|ME|EPP|EIRELI|HOLDING|HOLDINGS|PARTICIPACOES|PART)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface RegistryEntry {
  cnpj: string;
  legalName: string;
  tradeName: string;
  cvmCode: string;
  status: string;
}

export interface Registry {
  entries: RegistryEntry[];
  /** Normalised legal name to every entry carrying it. */
  byName: Map<string, RegistryEntry[]>;
}

export async function fetchRegistry(): Promise<Fetched<Registry>> {
  const res = await getBytes(REGISTRY);
  if (!res.ok) return res as Fetched<Registry>;

  const rows = parseCsv(res.value);
  if (rows.length === 0) return failed(REGISTRY, 'the registry file parsed to no rows');

  const entries: RegistryEntry[] = rows
    .map((r) => ({
      cnpj: r.CNPJ_CIA ?? '',
      legalName: r.DENOM_SOCIAL ?? '',
      tradeName: r.DENOM_COMERC ?? '',
      cvmCode: r.CD_CVM ?? '',
      status: r.SIT ?? '',
    }))
    // A cancelled registration still appears; its filings are historical and
    // attaching them to a live ticker would be wrong.
    .filter((e) => e.cnpj !== '' && /ATIVO/i.test(e.status));

  if (entries.length === 0) {
    return failed(REGISTRY, `the registry had ${rows.length} rows but none active with a CNPJ`);
  }

  const byName = new Map<string, RegistryEntry[]>();
  for (const e of entries) {
    for (const name of [e.legalName, e.tradeName]) {
      if (!name) continue;
      const key = normaliseName(name);
      if (!key) continue;
      const list = byName.get(key);
      if (list) { if (!list.includes(e)) list.push(e); } else byName.set(key, [e]);
    }
  }

  return ok({ entries, byName }, { source: 'CVM — cadastro de companhias abertas', url: REGISTRY, asOf: '' });
}

export type Resolution =
  | { ok: true; cnpj: string; matchedOn: string; entry: RegistryEntry }
  | { ok: false; reason: string; candidates: string[] };

/**
 * The CNPJ for one company, or a refusal saying why.
 *
 * Three ways this resolves, in descending order of confidence: the normalised
 * legal name matches exactly and uniquely; it matches exactly but more than one
 * company carries that name, which is a refusal; or no entry matches, in which
 * case the nearest few are reported so a person can see whether the registry
 * spells it differently.
 */
export function resolveCnpj(registry: Registry, legalName: string, tradeName?: string): Resolution {
  for (const [label, name] of [['razão social', legalName], ['nome de pregão', tradeName]] as const) {
    if (!name) continue;
    const key = normaliseName(name);
    const hits = registry.byName.get(key);
    if (!hits || hits.length === 0) continue;
    if (hits.length > 1) {
      return {
        ok: false,
        reason: `${hits.length} companies share the ${label} "${name}"`,
        candidates: hits.map((h) => `${h.legalName} (${h.cnpj})`),
      };
    }
    return { ok: true, cnpj: hits[0].cnpj, matchedOn: label, entry: hits[0] };
  }

  // Nothing matched: offer the closest spellings rather than a bare failure.
  const key = normaliseName(legalName);
  const first = key.split(' ')[0] ?? '';
  const near = first.length >= 4
    ? registry.entries.filter((e) => normaliseName(e.legalName).startsWith(first)).slice(0, 5)
    : [];

  return {
    ok: false,
    reason: `no active company in the CVM registry matches "${legalName}"`,
    candidates: near.map((e) => `${e.legalName} (${e.cnpj})`),
  };
}
