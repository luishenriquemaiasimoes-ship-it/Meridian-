import { describe, expect, it } from 'vitest';
import { normaliseName, resolveCnpj, type Registry, type RegistryEntry } from '@/lib/data-providers/live/registry';

/* Matching a company by name is the kind of thing that works for ninety
   companies and then attaches the wrong statements to the ninety-first. These
   tests are mostly about the ninety-first. */

function registryOf(entries: Partial<RegistryEntry>[]): Registry {
  const full = entries.map((e) => ({
    cnpj: '', legalName: '', tradeName: '', cvmCode: '', status: 'ATIVO', ...e,
  }));
  const byName = new Map<string, Map<string, RegistryEntry>>();
  for (const e of full) {
    for (const n of [e.legalName, e.tradeName]) {
      if (!n) continue;
      const k = normaliseName(n);
      if (!k) continue;
      const byCnpj = byName.get(k) ?? new Map<string, RegistryEntry>();
      if (!byCnpj.has(e.cnpj)) byCnpj.set(e.cnpj, e);
      byName.set(k, byCnpj);
    }
  }
  return { entries: full, byName };
}

describe('reducing a legal name to what is comparable', () => {
  it('ignores accents, case and punctuation', () => {
    expect(normaliseName('Petróleo Brasileiro S.A.')).toBe(normaliseName('PETROLEO BRASILEIRO SA'));
  });

  it('ignores the corporate form, which is written differently everywhere', () => {
    expect(normaliseName('Vale S.A.')).toBe('VALE');
    expect(normaliseName('WEG S/A')).toBe('WEG');
    expect(normaliseName('Localiza Rent a Car S.A.')).toBe('LOCALIZA RENT A CAR');
  });

  it('treats Companhia and Cia as the same word', () => {
    expect(normaliseName('Companhia Siderúrgica Nacional'))
      .toBe(normaliseName('CIA SIDERURGICA NACIONAL'));
  });

  it('does not collapse two genuinely different companies', () => {
    // The normalisation must not be so aggressive that distinct filers merge.
    expect(normaliseName('Banco do Brasil S.A.')).not.toBe(normaliseName('Banco Bradesco S.A.'));
    expect(normaliseName('Eletrobras')).not.toBe(normaliseName('Eletropaulo'));
  });
});

describe('resolving a ticker to a CNPJ', () => {
  const registry = registryOf([
    { cnpj: '33.000.167/0001-01', legalName: 'PETROLEO BRASILEIRO S.A. PETROBRAS', tradeName: 'PETROBRAS' },
    { cnpj: '33.592.510/0001-54', legalName: 'VALE S.A.', tradeName: 'VALE' },
    { cnpj: '07.526.557/0001-00', legalName: 'CIA SIDERURGICA NACIONAL', tradeName: 'CSN' },
    { cnpj: '11.111.111/0001-11', legalName: 'ALFA PARTICIPACOES S.A.', tradeName: 'ALFA' },
    { cnpj: '22.222.222/0001-22', legalName: 'ALFA HOLDING S.A.', tradeName: 'ALFA CORP' },
    // The same filer listed twice, as the CVM registry does — one row per
    // registration category, one CNPJ.
    { cnpj: '33.000.167/0001-01', legalName: 'PETROLEO BRASILEIRO S.A. - PETROBRAS', tradeName: 'PETROBRAS' },
  ]);

  it('matches on the legal name', () => {
    const r = resolveCnpj(registry, 'Vale S.A.');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.cnpj).toBe('33.592.510/0001-54');
  });

  it('falls back to the trade name when the legal name is written differently', () => {
    const r = resolveCnpj(registry, 'Petrobras Holding Inexistente', 'Petrobras');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.cnpj).toBe('33.000.167/0001-01');
      expect(r.matchedOn).toBe('nome de pregão');
    }
  });

  it('refuses rather than guessing when two companies share a name', () => {
    // Both normalise to ALFA once the corporate form is stripped. Picking the
    // first would silently load one company's statements under the other.
    const r = resolveCnpj(registry, 'Alfa Participações S.A.');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason).toMatch(/2 companies match/);
      expect(r.candidates.length).toBe(2);
    }
  });

  it('does not read one company listed twice as two companies', () => {
    // The CVM registry has a row per registration category, so a filer appears
    // several times under the same name with one CNPJ. Petrobras was refused
    // for an ambiguity between itself and itself.
    const r = resolveCnpj(registry, 'Petrobras');
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.cnpj).toBe('33.000.167/0001-01');
  });

  it('matches a legal name the registry extends with the trading name', () => {
    // The filing says "Petróleo Brasileiro S.A."; the registry says
    // "PETROLEO BRASILEIRO S.A. - PETROBRAS".
    const r = resolveCnpj(registry, 'Petróleo Brasileiro S.A.');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.cnpj).toBe('33.000.167/0001-01');
      expect(r.matchedOn).toBe('razão social estendida');
    }
  });

  it('extends in one direction only', () => {
    // Accepting a registry name that is a PREFIX of ours would match
    // "Banco do Brasil" to a company registered as "Banco" — and the extra
    // words are the ones that identify the company.
    const short = registryOf([{ cnpj: '99.999.999/0001-99', legalName: 'BANCO' }]);
    const r = resolveCnpj(short, 'Banco do Brasil S.A.');
    expect(r.ok).toBe(false);
  });

  it('refuses an extended match that fits more than one company', () => {
    const many = registryOf([
      { cnpj: '11.111.111/0001-11', legalName: 'ENERGISA MATO GROSSO DISTRIBUIDORA' },
      { cnpj: '22.222.222/0001-22', legalName: 'ENERGISA MATO GROSSO DO SUL DISTRIBUIDORA' },
    ]);
    const r = resolveCnpj(many, 'Energisa Mato Grosso');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.candidates.length).toBe(2);
  });

  it('offers the nearest spellings when nothing matches', () => {
    const r = resolveCnpj(registry, 'Petroleo Sociedade Anonima Inexistente');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/no active company/);
  });

  it('never returns a CNPJ it did not actually find', () => {
    const r = resolveCnpj(registry, 'Empresa Que Nao Existe');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.candidates).toEqual([]);
  });
});
