import { describe, it, expect } from 'vitest';
import { BLUEPRINTS } from '@/lib/data-providers/mock/blueprints';
import { SECTOR_DOSSIERS, findSectorDossier } from '@/lib/research/qualitative/sectors';
import { COMPANY_QUALITATIVE, findCompanyQualitative } from '@/lib/research/qualitative/companies';

const BASES = ['STRUCTURAL', 'REPORTED', 'INTERPRETATION'];

describe('sector dossiers', () => {
  it('covers every company in the universe', () => {
    const uncovered = BLUEPRINTS
      .filter((b) => !findSectorDossier(b.profile.sector, b.profile.country, b.profile.industry))
      .map((b) => `${b.profile.ticker} (${b.profile.sector}/${b.profile.country})`);
    expect(uncovered).toEqual([]);
  });

  it('resolves the country dossier before a global one', () => {
    // A Brazilian utility must not be handed research about state rate cases.
    const cmig = findSectorDossier('Utilities', 'Brazil', 'Electric Utilities');
    expect(cmig?.scope).toBe('BRAZIL');
    const duk = findSectorDossier('Utilities', 'United States', 'Electric Utilities');
    expect(duk?.scope).toBe('UNITED_STATES');
  });

  it('sends an advertising platform to the platform dossier, not to telecom', () => {
    // The whole reason industry is a required argument.
    const googl = findSectorDossier('Communication Services', 'United States', 'Interactive Media');
    expect(googl?.industries).toContain('Interactive Media');
    const vz = findSectorDossier('Communication Services', 'United States', 'Wireless Telecommunication Services');
    expect(vz?.industries).toContain('Wireless Telecommunication Services');
    expect(googl?.headline).not.toEqual(vz?.headline);
  });

  it('labels the basis of every claim', () => {
    for (const d of SECTOR_DOSSIERS) {
      const where = `${d.sector}/${d.scope}`;
      expect(BASES, where).toContain(d.structure.basis);
      for (const x of [...d.regulation, ...d.debates, ...d.failureModes]) {
        expect(BASES, `${where}: ${x.heading}`).toContain(x.basis);
      }
      for (const x of d.drivers) expect(BASES, `${where}: ${x.key}`).toContain(x.basis);
    }
  });

  it('gives every driver a mechanism and a measure to watch', () => {
    for (const d of SECTOR_DOSSIERS) {
      expect(d.drivers.length, `${d.sector}/${d.scope}`).toBeGreaterThanOrEqual(4);
      for (const x of d.drivers) {
        // A driver without a transmission mechanism is a mood, and one without
        // a measure cannot be tracked or disproved.
        expect(x.mechanism.length, `${d.sector}: ${x.key}`).toBeGreaterThan(80);
        expect(x.watch.length, `${d.sector}: ${x.key}`).toBeGreaterThan(20);
      }
    }
  });

  it('cites sources and carries an as-of date', () => {
    for (const d of SECTOR_DOSSIERS) {
      expect(d.sources.length, `${d.sector}/${d.scope}`).toBeGreaterThan(0);
      expect(d.asOf, `${d.sector}/${d.scope}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const s of d.sources) expect(s.url, s.label).toMatch(/^https:\/\//);
    }
  });

  it('has no duplicate sector and scope pairing', () => {
    const keys = SECTOR_DOSSIERS.map((d) => `${d.sector}/${d.scope}/${(d.industries ?? []).join('+')}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('company profiles', () => {
  const bySymbol = new Map(BLUEPRINTS.map((b) => [b.profile.ticker, b.profile]));

  it('only profiles companies that exist, with the right sector', () => {
    for (const q of COMPANY_QUALITATIVE) {
      const profile = bySymbol.get(q.ticker);
      expect(profile, `${q.ticker} is not in the universe`).toBeDefined();
      expect(q.sector, q.ticker).toBe(profile!.sector);
    }
  });

  it('has no duplicate profiles', () => {
    const tickers = COMPANY_QUALITATIVE.map((q) => q.ticker);
    expect(new Set(tickers).size).toBe(tickers.length);
  });

  it('labels the basis of every claim', () => {
    for (const q of COMPANY_QUALITATIVE) {
      expect(BASES, q.ticker).toContain(q.control.basis);
      expect(BASES, q.ticker).toContain(q.capitalAllocation.basis);
      for (const n of [...q.howItEarns, ...q.governance, ...q.sectorPosition, ...q.keyRisks]) {
        expect(BASES, `${q.ticker}: ${n.heading}`).toContain(n.basis);
      }
      for (const m of q.moat) expect(BASES, `${q.ticker}: ${m.label}`).toContain(m.basis);
    }
  });

  it('states what protects a minority holder wherever control is concentrated', () => {
    for (const q of COMPANY_QUALITATIVE) {
      expect(q.control.minorityProtections.length, q.ticker).toBeGreaterThan(0);
      expect(q.control.form.length, q.ticker).toBeGreaterThan(40);
    }
  });

  it('records capital allocation decisions that went badly', () => {
    for (const q of COMPANY_QUALITATIVE) {
      // A capital allocation record with no failures is a brochure. Omitting
      // them makes the successes worthless as evidence.
      expect(q.capitalAllocation.bad.length, `${q.ticker} lists no bad decisions`).toBeGreaterThan(0);
      expect(q.capitalAllocation.good.length, q.ticker).toBeGreaterThan(0);
    }
  });

  it('states a mechanism and an erosion path for every moat claim', () => {
    for (const q of COMPANY_QUALITATIVE) {
      for (const m of q.moat) {
        // "Strong brand" is a compliment. A moat claim names why it cannot be
        // copied, what it is worth, and what would take it away.
        expect(m.mechanism.length, `${q.ticker}: ${m.label}`).toBeGreaterThan(60);
        expect(m.evidence.length, `${q.ticker}: ${m.label}`).toBeGreaterThan(20);
        expect(m.erodedBy.length, `${q.ticker}: ${m.label}`).toBeGreaterThan(20);
      }
    }
  });

  it('makes every thesis falsifiable and connected to the model', () => {
    for (const q of COMPANY_QUALITATIVE) {
      expect(q.theses.length, q.ticker).toBeGreaterThanOrEqual(2);
      for (const t of q.theses) {
        expect(t.requires.length, `${q.ticker}: ${t.id}`).toBeGreaterThan(0);
        // A thesis that cannot be wrong is a preference.
        expect(t.breaks.length, `${q.ticker}: ${t.id} has no falsifier`).toBeGreaterThan(0);
        // A view that moves no assumption cannot be tested against the numbers.
        expect(t.modelLink.length, `${q.ticker}: ${t.id} touches no assumption`).toBeGreaterThan(0);
        expect(t.rationale.length, `${q.ticker}: ${t.id}`).toBeGreaterThan(150);
      }
    }
  });

  it('does not present only bull cases', () => {
    // A research layer that never disagrees with itself is marketing.
    for (const q of COMPANY_QUALITATIVE) {
      const sides = new Set(q.theses.map((t) => t.side));
      expect(sides.size, `${q.ticker} has only ${[...sides].join(', ')} theses`).toBeGreaterThan(1);
    }
  });

  it('cites sources and carries an as-of date', () => {
    for (const q of COMPANY_QUALITATIVE) {
      expect(q.sources.length, q.ticker).toBeGreaterThan(0);
      expect(q.asOf, q.ticker).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const s of q.sources) expect(s.url, `${q.ticker}: ${s.label}`).toMatch(/^https:\/\//);
    }
  });

  it('profiles every company in the universe', () => {
    // The universe is fully researched, and it stays that way: adding a company
    // to the blueprints without writing its research fails here rather than
    // rendering an empty Business tab in the product.
    const unresearched = BLUEPRINTS
      .filter((b) => !findCompanyQualitative(b.profile.ticker))
      .map((b) => `${b.profile.ticker} (${b.profile.sector})`);
    expect(unresearched).toEqual([]);
  });

  it('returns null rather than a shell for a company it does not hold', () => {
    // The UI branches on this: null means the page says so instead of
    // rendering a finished-looking empty shell.
    expect(findCompanyQualitative('NOTATICKER')).toBeNull();
  });
});
