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
  /**
   * Normalised name to the DISTINCT companies carrying it, keyed by CNPJ.
   *
   * Keyed by CNPJ rather than held as a list because the registry has a row per
   * registration category, so one company appears several times under the same
   * name. Two rows are only an ambiguity when they are two companies.
   */
  byName: Map<string, Map<string, RegistryEntry>>;
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

  // The registry carries more than one row per company — one per registration
  // category — so a name legitimately resolves to several rows that are all the
  // same filer. Collapsing on CNPJ here is what keeps that from reading as an
  // ambiguity later: Petrobras appeared twice, with one CNPJ, and was refused.
  const byName = new Map<string, Map<string, RegistryEntry>>();
  for (const e of entries) {
    for (const name of [e.legalName, e.tradeName]) {
      if (!name) continue;
      const key = normaliseName(name);
      if (!key) continue;
      const byCnpj = byName.get(key) ?? new Map<string, RegistryEntry>();
      if (!byCnpj.has(e.cnpj)) byCnpj.set(e.cnpj, e);
      byName.set(key, byCnpj);
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
  const attempt = (label: string, hits: RegistryEntry[] | undefined): Resolution | null => {
    if (!hits || hits.length === 0) return null;
    if (hits.length > 1) {
      return {
        ok: false,
        reason: `${hits.length} companies match by ${label}`,
        candidates: hits.map((h) => `${h.legalName} (${h.cnpj})`),
      };
    }
    return { ok: true, cnpj: hits[0].cnpj, matchedOn: label, entry: hits[0] };
  };

  // Exact, on either name the platform holds.
  for (const [label, name] of [['razão social', legalName], ['nome de pregão', tradeName]] as const) {
    if (!name) continue;
    const key = normaliseName(name);
    const found = attempt(label, [...(registry.byName.get(key)?.values() ?? [])]);
    if (found) return found;
  }

  /**
   * The registry commonly appends the trading name to the legal one —
   * "PETROLEO BRASILEIRO S.A. - PETROBRAS" against the "Petróleo Brasileiro
   * S.A." a filing carries. So a registry name that BEGINS with the whole
   * normalised name, at a word boundary, is the same company.
   *
   * The direction matters and only one of them is safe. Accepting a registry
   * name that is a prefix of ours would match "BANCO DO BRASIL" to "BANCO", and
   * the extra words are the ones that identify the company.
   */
  const key = normaliseName(legalName);
  if (key.length >= 8) {
    const extended = new Map<string, RegistryEntry>();
    for (const [name, companies] of registry.byName) {
      if (name === key || !name.startsWith(`${key} `)) continue;
      for (const [cnpj, entry] of companies) extended.set(cnpj, entry);
    }
    const found = attempt('razão social estendida', [...extended.values()]);
    if (found) return found;
  }

  // Nothing matched: offer the closest spellings rather than a bare failure.
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
