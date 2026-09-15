import { describe, expect, it } from 'vitest';
import { normaliseName, resolveCnpj, type Registry, type RegistryEntry } from '@/lib/data-providers/live/registry';

/* Matching a company by name is the kind of thing that works for ninety
   companies and then attaches the wrong statements to the ninety-first. These
   tests are mostly about the ninety-first. */

function registryOf(entries: Partial<RegistryEntry>[]): Registry {
  const full = entries.map((e) => ({
    cnpj: '', legalName: '', tradeName: '', cvmCode: '', status: 'ATIVO', ...e,
  }));
  const byName = new Map<string, RegistryEntry[]>();
  for (const e of full) {
    for (const n of [e.legalName, e.tradeName]) {
      if (!n) continue;
      const k = normaliseName(n);
      if (!k) continue;
      const list = byName.get(k);
      if (list) { if (!list.includes(e)) list.push(e); } else byName.set(k, [e]);
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
      expect(r.reason).toMatch(/share/);
      expect(r.candidates.length).toBe(2);
    }
  });

  it('offers the nearest spellings when nothing matches', () => {
    const r = resolveCnpj(registry, 'Petroleo Brasileiro Sociedade Anonima');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason).toMatch(/no active company/);
      // Enough to see that the registry spells it with PETROBRAS appended.
      expect(r.candidates.join(' ')).toMatch(/PETROBRAS/);
    }
  });

  it('never returns a CNPJ it did not actually find', () => {
    const r = resolveCnpj(registry, 'Empresa Que Nao Existe');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.candidates).toEqual([]);
  });
});
