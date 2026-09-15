import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { entryMatching, readZip, ZipError } from '@/lib/data-providers/live/zip';
import { numeric, parseCsv } from '@/lib/data-providers/live/csv';
import {
  balanceFrom, CAPEX_PATTERN, cashFlowFrom, DEPRECIATION_PATTERN,
  findByDescription, foldRows, incomeFrom,
} from '@/lib/data-providers/live/cvm';

/* A real archive in the CVM's shape: zipped, semicolon separated, Latin-1,
   with the regulator's column names, both the filed year and its comparative,
   and more than one company in the same file. Those last two are the ones that
   quietly corrupt a loader — a comparative belongs to the PREVIOUS filing at a
   different revision, and a file carries every listed company in Brazil. */
const archive = readFileSync(join(__dirname, 'fixtures', 'dfp_cia_aberta_2024.zip'));
const PETRO = '33.000.167/0001-01';

function filesOf(buf: Buffer): Map<string, ReturnType<typeof parseCsv>> {
  const out = new Map<string, ReturnType<typeof parseCsv>>();
  for (const e of readZip(buf)) {
    if (/\.csv$/i.test(e.name)) out.set(e.name.toLowerCase(), parseCsv(e.data));
  }
  return out;
}

describe('reading a CVM archive', () => {
  it('unpacks both deflated and stored entries', () => {
    const entries = readZip(archive);
    expect(entries.length).toBe(5);
    expect(entryMatching(entries, /dre_con/)).not.toBeNull();
    // The stored entry is the one that a reader handling only deflate loses.
    const readme = entryMatching(entries, /leiame/);
    expect(readme?.data.toString('latin1')).toBe('Arquivo de teste');
  });

  it('says so when handed something that is not an archive', () => {
    expect(() => readZip(Buffer.from('this is not a zip file'))).toThrow(ZipError);
  });

  it('decodes Latin-1, which is what the CVM publishes', () => {
    const rows = filesOf(archive).get('dfp_cia_aberta_dre_con_2024.csv')!;
    const revenue = rows.find((r) => r.CD_CONTA === '3.01');
    // Mojibake here would be invisible in the numbers and obvious to a reader.
    expect(revenue?.DS_CONTA).toBe('Receita de Venda de Bens e/ou Serviços');
  });

  it('distinguishes an unreported line from a zero', () => {
    expect(numeric('')).toBeNull();
    expect(numeric('-')).toBeNull();
    expect(numeric(undefined)).toBeNull();
    expect(numeric('0')).toBe(0);
    expect(numeric('-45000000')).toBe(-45_000_000);
  });
});

describe('selecting the right rows out of a file of every company', () => {
  const files = filesOf(archive);
  const dre = files.get('dfp_cia_aberta_dre_con_2024.csv')!;

  it('takes only the company asked for', () => {
    const folded = foldRows(dre, PETRO)!;
    expect(folded.denomination).toMatch(/PETROBRAS/);
    // 777777777 belongs to another filer in the same file.
    expect(folded.byAccount.get('3.01')).not.toBeCloseTo(777_777.777, 3);
  });

  it('ignores the comparative year, which belongs to the previous filing', () => {
    // PENÚLTIMO carries 999999999 for the same account code. Loading it would
    // overwrite the filed year with a restated figure at a different revision.
    const folded = foldRows(dre, PETRO)!;
    expect(folded.byAccount.get('3.01')).toBeCloseTo(490_000, 6);
  });

  it('returns null for a company that did not file, rather than an empty statement', () => {
    expect(foldRows(dre, '00.000.000/0001-00')).toBeNull();
  });

  it('converts the declared scale to millions', () => {
    // The file says MIL and carries 490000000, so 490,000 million.
    const folded = foldRows(dre, PETRO)!;
    expect(folded.byAccount.get('3.01')).toBeCloseTo(490_000, 6);
  });
});

describe('the regulator fixes the account codes, so the mapping is not per company', () => {
  const files = filesOf(archive);
  const dre = foldRows(files.get('dfp_cia_aberta_dre_con_2024.csv')!, PETRO)!;
  const bpa = foldRows(files.get('dfp_cia_aberta_bpa_con_2024.csv')!, PETRO)!;
  const bpp = foldRows(files.get('dfp_cia_aberta_bpp_con_2024.csv')!, PETRO)!;
  const dfcRows = files.get('dfp_cia_aberta_dfc_mi_con_2024.csv')!;
  const dfc = foldRows(dfcRows, PETRO)!;

  const income = incomeFrom(dre.byAccount);
  const balance = balanceFrom(bpa.byAccount, bpp.byAccount);
  const cash = cashFlowFrom(dfc.byAccount, income.netIncome);

  it('reads the income statement', () => {
    expect(income.revenue).toBeCloseTo(490_000, 6);
    expect(income.ebit).toBeCloseTo(180_000, 6);
    expect(income.netIncome).toBeCloseTo(105_000, 6);
    expect(income.financialResult).toBeCloseTo(-30_000, 6);
  });

  it('turns costs into magnitudes, since the CVM files them as negatives', () => {
    expect(income.cogs).toBeCloseTo(250_000, 6);
    // Selling plus administrative, both filed negative.
    expect(income.sga).toBeCloseTo(27_000, 6);
  });

  it('reads the balance sheet and balances it', () => {
    expect(balance.totalAssets).toBeCloseTo(1_100_000, 6);
    expect(balance.totalEquity).toBeCloseTo(500_000, 6);
    expect(balance.ppe).toBeCloseTo(700_000, 6);
    expect((balance.totalLiabilities ?? 0) + (balance.totalEquity ?? 0))
      .toBeCloseTo(balance.totalAssets as number, 6);
  });

  it('derives the residual lines from the regulator subtotals, not from assumption', () => {
    // Current assets 200,000 less cash 60,000, investments 20,000,
    // receivables 40,000 and inventory 50,000 leaves 30,000.
    expect(balance.otherCurrentAssets).toBeCloseTo(30_000, 6);
    // Non-current 900,000 less PP&E 700,000 and intangibles 50,000.
    expect(balance.otherAssets).toBeCloseTo(150_000, 6);
    // Non-current liabilities 420,000 less long-term debt 350,000.
    expect(balance.otherLiabilities).toBeCloseTo(70_000, 6);
  });

  it('leaves goodwill null, because the standardised layout does not split it out', () => {
    // Reporting intangibles as goodwill would put it in the amortising base.
    expect(balance.goodwill).toBeNull();
    expect(balance.intangibles).toBeCloseTo(50_000, 6);
  });

  it('reads the cash flow blocks the regulator does fix', () => {
    expect(cash.cfo).toBeCloseTo(200_000, 6);
    expect(cash.cfi).toBeCloseTo(-90_000, 6);
    expect(cash.cff).toBeCloseTo(-100_000, 6);
    expect(cash.netChangeInCash).toBeCloseTo(10_000, 6);
  });
});

describe('depreciation and capex, which the regulator does not fix a code for', () => {
  const files = filesOf(archive);
  const dfcRows = files.get('dfp_cia_aberta_dfc_mi_con_2024.csv')!
    .filter((r) => r.CNPJ_CIA === PETRO && (r.ORDEM_EXERC ?? '').startsWith('ÚLT'));

  it('finds depreciation inside the operating block', () => {
    expect(findByDescription(dfcRows, '6.01', DEPRECIATION_PATTERN)).toBeCloseTo(75_000, 6);
  });

  it('finds capex inside the investing block, summing plant and intangibles', () => {
    expect(findByDescription(dfcRows, '6.02', CAPEX_PATTERN)).toBeCloseTo(-85_000, 6);
  });

  it('will not pick up a word from the wrong half of the statement', () => {
    // Depreciation is an operating add-back. Matching it anywhere in the
    // statement would let an investing line that mentions amortisation of a
    // loan be added to it.
    expect(findByDescription(dfcRows, '6.02', DEPRECIATION_PATTERN)).toBeNull();
  });

  it('returns null when nothing matches, rather than zero', () => {
    expect(findByDescription(dfcRows, '6.03', /pagamento de arrendamento/i)).toBeNull();
  });
});
