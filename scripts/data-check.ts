/**
 * Asks every real source what it has, and prints exactly what came back.
 *
 * This exists because the code that talks to these services was written
 * against their documented shapes, not against their live responses — the
 * environment it was written in cannot reach any of them. So the first thing
 * anyone should do is run this and see which sources answer, which need a key,
 * and which return something the parser did not expect. It changes nothing and
 * writes nothing; it only reports.
 *
 * Run with: npm run data:check              (macro and market only)
 *           npm run data:check PETR4 AAPL   (those companies as well)
 */
import { allSeries, SERIES, type SeriesKey } from '../src/lib/data-providers/live/bcb';
import { latestCurve } from '../src/lib/data-providers/live/treasury';
import { fromBrapi, fromYahoo } from '../src/lib/data-providers/live/quotes';
import { cikFor, companyFacts, annualYears, statementsFor, recentFilings } from '../src/lib/data-providers/live/sec';
import {
  fetchDfpYear, foldRows, incomeFrom, balanceFrom, statementFile,
  findByDescription, DEPRECIATION_PATTERN, CAPEX_PATTERN,
} from '../src/lib/data-providers/live/cvm';
import { fetchRegistry, resolveCnpj } from '../src/lib/data-providers/live/registry';
import { findBlueprint } from '../src/lib/data-providers/mock/blueprints';
import { userAgent } from '../src/lib/data-providers/live/http';
import type { Fetched } from '../src/lib/data-providers/live/types';

const GREEN = '\x1b[32m'; const RED = '\x1b[31m'; const DIM = '\x1b[2m'; const OFF = '\x1b[0m';

function report<T>(label: string, f: Fetched<T>, render: (v: T) => string): void {
  if (f.ok) {
    console.log(`  ${GREEN}ok${OFF}    ${label.padEnd(26)} ${render(f.value)}`);
    console.log(`        ${DIM}${f.provenance.source} — ${f.provenance.asOf}${OFF}`);
  } else {
    console.log(`  ${RED}falhou${OFF} ${label.padEnd(26)} ${f.reason}`);
    console.log(`        ${DIM}${f.url}${OFF}`);
  }
}

async function main(): Promise<void> {
  const tickers = process.argv.slice(2).filter((a) => !a.startsWith('-'));

  console.log(`\nMERIDIAN — o que as fontes reais respondem`);
  console.log(`${DIM}User-Agent: ${userAgent()}${OFF}`);
  console.log(`${DIM}BRAPI_TOKEN: ${process.env.BRAPI_TOKEN ? 'configurado' : 'ausente'}${OFF}\n`);

  console.log('Banco Central do Brasil (SGS)');
  const series = await allSeries();
  for (const key of Object.keys(SERIES) as SeriesKey[]) {
    report(SERIES[key].name, series[key], (o) => {
      const change = o.previous === null ? '' : ` (anterior ${o.previous})`;
      return `${o.value}${change}`;
    });
  }

  console.log('\nUS Treasury');
  report('curva de juros', await latestCurve(), (c) => {
    const ten = c.byTenor['10Y'];
    const tenors = Object.keys(c.byTenor).length;
    return `${tenors} vértices, 10Y = ${ten === undefined ? '—' : `${(ten * 100).toFixed(2)}%`}`;
  });

  const brazilian = tickers.filter((t) => /\d$/.test(t));
  const american = tickers.filter((t) => !/\d$/.test(t));

  for (const ticker of tickers) {
    const bp = findBlueprint(ticker);
    const country = bp?.profile.country ?? (/\d$/.test(ticker) ? 'Brazil' : 'United States');
    console.log(`\n${ticker}${bp ? ` — ${bp.profile.name}` : ' (fora do universo)'} [${country}]`);

    const render = (q: { price: number; previousClose: number | null; currency: string | null }) =>
      `${q.currency ?? '?'} ${q.price}${q.previousClose === null ? '' : ` (fech. anterior ${q.previousClose})`}`;

    report('cotação — brapi', await fromBrapi(ticker), render);
    report('cotação — Yahoo', await fromYahoo(ticker, country), render);
  }

  /* --- SEC: one company at a time, it is keyed per filer --- */
  for (const ticker of american) {
    console.log(`\n${ticker} — SEC EDGAR`);
    const cik = await cikFor(ticker);
    report('CIK', cik, (c) => `${c.cik} — ${c.name}`);
    if (!cik.ok) continue;

    const facts = await companyFacts(cik.value.cik);
    report('company facts', facts, (f) => `${Object.keys(f.facts['us-gaap'] ?? {}).length} conceitos us-gaap`);
    if (!facts.ok) continue;

    const years = annualYears(facts.value);
    console.log(`  ${DIM}exercícios com receita anual: ${years.join(', ') || 'nenhum'}${OFF}`);

    const newest = years[years.length - 1];
    if (newest !== undefined) {
      const st = statementsFor(facts.value, newest);
      if (st) {
        const m = (v: number | null) => (v === null ? '—' : v.toLocaleString('pt-BR', { maximumFractionDigits: 0 }));
        console.log(`  ${GREEN}ok${OFF}    FY${newest} (milhões de USD)`);
        console.log(`        receita ${m(st.income.revenue)}  EBIT ${m(st.income.ebit)}  lucro ${m(st.income.netIncome)}`);
        console.log(`        ativo ${m(st.balance.totalAssets)}  PL ${m(st.balance.totalEquity)}  ágio ${m(st.balance.goodwill)}`);
        console.log(`        CFO ${m(st.cashFlow.cfo)}  capex ${m(st.cashFlow.capex)}  D&A ${m(st.cashFlow.da)}`);
        const missing = Object.entries({
          receita: st.income.revenue, ebit: st.income.ebit, ativo: st.balance.totalAssets,
          PL: st.balance.totalEquity, CFO: st.cashFlow.cfo, capex: st.cashFlow.capex, 'D&A': st.cashFlow.da,
        }).filter(([, v]) => v === null).map(([k]) => k);
        if (missing.length) console.log(`        ${RED}sem tag para: ${missing.join(', ')}${OFF}`);
      } else {
        console.log(`  ${RED}falhou${OFF} FY${newest} — nenhuma tag de receita reconhecida`);
      }
    }

    report('documentos recentes', await recentFilings(cik.value.cik, 5), (fs) =>
      fs.map((f) => `${f.form} ${f.filedAt}`).join(', ') || 'nenhum');
  }

  /* --- CVM: one archive carries every company, so fetch once --- */
  if (brazilian.length > 0) {
    const year = new Date().getUTCFullYear() - 1;
    console.log(`\nCVM — DFP ${year}`);
    const dfp = await fetchDfpYear(year);
    report('arquivo anual', dfp, (d) => `${d.files.size} CSVs: ${[...d.files.keys()].slice(0, 3).join(', ')}…`);

    console.log('');
    const registry = await fetchRegistry();
    report('cadastro de companhias', registry, (r) => `${r.entries.length} companhias ativas`);

    if (dfp.ok && registry.ok) {
      for (const ticker of brazilian) {
        const bp = findBlueprint(ticker);
        const legal = bp?.profile.legalName ?? bp?.profile.name ?? ticker;
        console.log(`\n  ${ticker} — ${legal}`);

        const found = resolveCnpj(registry.value, legal, bp?.profile.name);
        if (!found.ok) {
          console.log(`  ${RED}falhou${OFF} ${found.reason}`);
          for (const c of found.candidates) console.log(`        ${DIM}talvez: ${c}${OFF}`);
          continue;
        }
        console.log(`  ${GREEN}ok${OFF}    CNPJ ${found.cnpj} ${DIM}(casou pela ${found.matchedOn})${OFF}`);

        const dre = statementFile(dfp.value, 'DRE');
        const bpa = statementFile(dfp.value, 'BPA');
        const bpp = statementFile(dfp.value, 'BPP');
        const dfc = statementFile(dfp.value, 'DFC_MI');
        if (!dre || !bpa || !bpp) {
          console.log(`  ${RED}falhou${OFF} o arquivo não trouxe DRE/BPA/BPP com o nome esperado`);
          console.log(`        ${DIM}nomes presentes: ${[...dfp.value.files.keys()].join(', ')}${OFF}`);
          continue;
        }
        const folded = foldRows(dre, found.cnpj);
        if (!folded) {
          console.log(`  ${RED}falhou${OFF} nenhuma linha para esse CNPJ no arquivo de ${year}`);
          continue;
        }
        const income = incomeFrom(folded.byAccount);
        const fa = foldRows(bpa, found.cnpj); const fp = foldRows(bpp, found.cnpj);
        const balance = fa && fp ? balanceFrom(fa.byAccount, fp.byAccount) : null;
        const m = (v: number | null | undefined) =>
          (v === null || v === undefined ? '—' : v.toLocaleString('pt-BR', { maximumFractionDigits: 0 }));
        console.log(`        ${folded.denomination} — ${folded.endDate} (milhões de ${folded.currency})`);
        console.log(`        receita ${m(income.revenue)}  EBIT ${m(income.ebit)}  lucro ${m(income.netIncome)}`);
        console.log(`        ativo ${m(balance?.totalAssets)}  PL ${m(balance?.totalEquity)}  imobilizado ${m(balance?.ppe)}`);
        if (dfc) {
          const mine = dfc.filter((r) => r.CNPJ_CIA === found.cnpj && (r.ORDEM_EXERC ?? '').startsWith('\u00DALT'));
          console.log(`        D&A ${m(findByDescription(mine, '6.01', DEPRECIATION_PATTERN))}  capex ${m(findByDescription(mine, '6.02', CAPEX_PATTERN))}`);
        }
      }
    }
  }

  console.log(`\n${DIM}Nada foi gravado. Este comando só consulta e reporta.${OFF}\n`);
}

main().catch((e) => {
  console.error('\nO diagnóstico falhou antes de conseguir consultar as fontes:\n', e);
  process.exit(1);
});
