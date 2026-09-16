/**
 * Replaces simulated data with what the companies actually filed.
 *
 * Reads the CVM for Brazilian filers and the SEC for American ones, the Banco
 * Central and the Treasury for rates, and Yahoo or brapi for prices, and writes
 * what comes back into the database with the source recorded against every row.
 *
 * Two rules govern the whole thing, and they are the reason this is a separate
 * command rather than part of the seed.
 *
 * A source that fails changes nothing. A network error, a company the registry
 * does not carry, a year not yet published — none of those blank an existing
 * row. The worst outcome for a valuation platform is not stale data, it is data
 * that silently became partial.
 *
 * And nothing is guessed. A period missing revenue, operating profit or an
 * asset base is skipped and reported, because it would otherwise pass through
 * the projection as zeros and emerge as a valuation rather than as a gap.
 *
 * Run with: npm run data:sync                 (every company)
 *           npm run data:sync PETR4 AAPL      (only those)
 *           npm run data:sync -- --years 10   (how much history)
 */
import { prisma } from '../src/lib/db';
import { allSeries, SERIES, type SeriesKey } from '../src/lib/data-providers/live/bcb';
import { latestCurve } from '../src/lib/data-providers/live/treasury';
import { benchmarkSymbol, history, quote, yahooSymbol } from '../src/lib/data-providers/live/quotes';
import { latestYields } from '../src/lib/data-providers/live/tesouro';
import { regressBeta } from '../src/lib/finance/beta';
import { fetchDfpYear } from '../src/lib/data-providers/live/cvm';
import { fetchRegistry, resolveCnpj, type Registry } from '../src/lib/data-providers/live/registry';
import { annualYears, cikFor, companyFacts, recentFilings } from '../src/lib/data-providers/live/sec';
import { isUsable, missingFrom, periodFromCvm, periodFromSec } from '../src/lib/data-providers/live/periods';
import type { FinancialPeriod } from '../src/lib/finance/types';

const G = '\x1b[32m'; const R = '\x1b[31m'; const Y = '\x1b[33m'; const D = '\x1b[2m'; const O = '\x1b[0m';

const args = process.argv.slice(2);
const yearsFlag = args.indexOf('--years');
const HISTORY = yearsFlag >= 0 ? Math.max(1, Number(args[yearsFlag + 1]) || 6) : 6;
const only = args.filter((a) => !a.startsWith('--') && a !== String(HISTORY));

interface Tally { updated: string[]; skipped: string[]; failed: string[] }
const tally: Record<string, Tally> = {
  macro: { updated: [], skipped: [], failed: [] },
  quotes: { updated: [], skipped: [], failed: [] },
  statements: { updated: [], skipped: [], failed: [] },
  news: { updated: [], skipped: [], failed: [] },
  prices: { updated: [], skipped: [], failed: [] },
  beta: { updated: [], skipped: [], failed: [] },
};

/* ------------------------------ macro ------------------------------ */

/**
 * The codes the WACC already looks for.
 *
 * The valuation reads its rates by code — SELIC, IPCA, US10Y and so on — so
 * writing real figures under new names would have left them sitting in the
 * database unused while the discount rate went on reading the simulated ones.
 * That is the failure nobody would notice from the screen.
 */
const INDICATOR_CODES = {
  selic: 'SELIC', ipca: 'IPCA', usdBrl: 'USDBRL', cdi: 'CDI',
  ust10y: 'US10Y', ntnf: 'NTNF33', ntnb: 'NTNB35',
} as const;

async function writeIndicator(
  code: string, name: string, category: string, value: number,
  previous: number | null, unit: string, currency: string | null, asOf: string, source: string,
): Promise<void> {
  await prisma.marketIndicator.upsert({
    where: { code },
    create: {
      code, name, category, value, previous: previous ?? value,
      unit, currency, asOf: new Date(asOf), source,
    },
    update: { name, value, previous: previous ?? value, asOf: new Date(asOf), source },
  });
}

async function syncMacro(): Promise<void> {
  console.log('\nBanco Central, Tesouro Nacional e US Treasury');
  const series = await allSeries();

  // The platform stores these as percentages; the Bank publishes them that way.
  const macroTargets: Partial<Record<SeriesKey, { code: string; category: string; currency: string | null }>> = {
    selicTarget: { code: INDICATOR_CODES.selic, category: 'RATE', currency: null },
    ipca12m: { code: INDICATOR_CODES.ipca, category: 'MACRO', currency: null },
    usdBrl: { code: INDICATOR_CODES.usdBrl, category: 'FX', currency: 'BRL' },
    cdi: { code: INDICATOR_CODES.cdi, category: 'RATE', currency: null },
  };

  for (const key of Object.keys(SERIES) as SeriesKey[]) {
    const f = series[key];
    const meta = SERIES[key];
    const target = macroTargets[key];
    if (!f.ok) {
      console.log(`  ${R}falhou${O} ${meta.name} — ${f.reason}`);
      tally.macro.failed.push(meta.name);
      continue;
    }
    if (!target) continue;
    await writeIndicator(
      target.code, meta.name, target.category, f.value.value, f.value.previous,
      meta.unit === 'CURRENCY' ? 'RATE' : 'PERCENT', target.currency, f.value.asOf, f.provenance.source,
    );
    console.log(`  ${G}ok${O}     ${target.code.padEnd(8)} ${meta.name.padEnd(26)} ${f.value.value}  ${D}${f.value.asOf}${O}`);
    tally.macro.updated.push(target.code);
  }

  // The Brazilian risk-free has to be a Brazilian government bond. The Selic is
  // an overnight policy rate, which is a different instrument at a different
  // maturity and means something else inside a discount rate.
  const tesouro = await latestYields();
  if (tesouro.ok) {
    const { nominal, real } = tesouro.value;
    if (nominal) {
      await writeIndicator(
        INDICATOR_CODES.ntnf, `NTN-F ${nominal.maturity.slice(0, 4)} (Tesouro Prefixado)`, 'RATE',
        nominal.rate * 100, null, 'PERCENT', 'BRL', nominal.asOf, tesouro.provenance.source,
      );
      console.log(`  ${G}ok${O}     ${INDICATOR_CODES.ntnf.padEnd(8)} ${'juro nominal longo'.padEnd(26)} ${(nominal.rate * 100).toFixed(2)}%  ${D}venc. ${nominal.maturity}${O}`);
      tally.macro.updated.push(INDICATOR_CODES.ntnf);
    }
    if (real) {
      await writeIndicator(
        INDICATOR_CODES.ntnb, `NTN-B ${real.maturity.slice(0, 4)} (Tesouro IPCA+)`, 'RATE',
        real.rate * 100, null, 'PERCENT', 'BRL', real.asOf, tesouro.provenance.source,
      );
      console.log(`  ${G}ok${O}     ${INDICATOR_CODES.ntnb.padEnd(8)} ${'juro real longo'.padEnd(26)} ${(real.rate * 100).toFixed(2)}%  ${D}venc. ${real.maturity}${O}`);
      tally.macro.updated.push(INDICATOR_CODES.ntnb);
    }
  } else {
    console.log(`  ${R}falhou${O} títulos do Tesouro — ${tesouro.reason}`);
    tally.macro.failed.push('curva brasileira');
  }

  const curve = await latestCurve();
  if (!curve.ok) {
    console.log(`  ${R}falhou${O} curva do US Treasury — ${curve.reason}`);
    tally.macro.failed.push('curva do US Treasury');
    return;
  }
  for (const [tenor, value] of Object.entries(curve.value.byTenor)) {
    const code = tenor === '10Y' ? INDICATOR_CODES.ust10y : `UST_${tenor}`;
    await writeIndicator(
      code, `US Treasury ${tenor}`, 'RATE', value * 100, null,
      'PERCENT', 'USD', curve.value.asOf, curve.provenance.source,
    );
  }
  const ten = curve.value.byTenor['10Y'];
  console.log(`  ${G}ok${O}     ${INDICATOR_CODES.ust10y.padEnd(8)} ${'juro americano 10 anos'.padEnd(26)} `
    + `${ten === undefined ? '—' : `${(ten * 100).toFixed(2)}%`}  ${D}${curve.value.asOf}${O}`);
  tally.macro.updated.push(INDICATOR_CODES.ust10y);

  // What the platform still carries without a real source, said out loud.
  const stillSimulated = await prisma.marketIndicator.findMany({
    where: { code: { in: ['EMBIBR', 'ERPUS'] } }, select: { code: true, name: true },
  });
  for (const i of stillSimulated) {
    console.log(`  ${Y}simulado${O} ${i.code.padEnd(8)} ${i.name} ${D}— sem fonte pública gratuita${O}`);
  }
}

/* ---------------------------- statements ---------------------------- */

async function writePeriods(
  companyId: string, ticker: string, periods: FinancialPeriod[], source: string,
): Promise<number> {
  let written = 0;
  for (const p of periods) {
    if (!isUsable(p)) {
      console.log(`         ${Y}FY${p.fiscalYear} ignorado${O} ${D}— sem ${missingFrom(p).join(', ')}${O}`);
      continue;
    }
    await prisma.financialStatement.upsert({
      where: { companyId_label: { companyId, label: p.label } },
      create: {
        companyId, label: p.label, periodType: p.periodType, fiscalYear: p.fiscalYear,
        fiscalQuarter: null, endDate: new Date(p.endDate), currency: p.currency,
        standard: p.standard, unit: p.unit, source, isEstimate: false, confidence: 1,
        income: JSON.stringify(p.income), balance: JSON.stringify(p.balance),
        cashFlow: JSON.stringify(p.cashFlow),
      },
      update: {
        endDate: new Date(p.endDate), currency: p.currency, standard: p.standard,
        unit: p.unit, source, isEstimate: false, confidence: 1,
        income: JSON.stringify(p.income), balance: JSON.stringify(p.balance),
        cashFlow: JSON.stringify(p.cashFlow),
      },
    });
    written++;
  }
  // The old simulated periods are only cleared once real ones are in place, so
  // a failure part-way through never leaves a company with nothing.
  if (written > 0) {
    const kept = periods.filter(isUsable).map((p) => p.label);
    const removed = await prisma.financialStatement.deleteMany({
      where: { companyId, label: { notIn: kept } },
    });
    if (removed.count > 0) console.log(`         ${D}${removed.count} períodos simulados removidos${O}`);
  }
  return written;
}

async function syncAmerican(company: { id: string; ticker: string; name: string }): Promise<void> {
  const cik = await cikFor(company.ticker);
  if (!cik.ok) {
    console.log(`  ${R}falhou${O} ${company.ticker} — ${cik.reason}`);
    tally.statements.failed.push(company.ticker);
    return;
  }
  const facts = await companyFacts(cik.value.cik);
  if (!facts.ok) {
    console.log(`  ${R}falhou${O} ${company.ticker} — ${facts.reason}`);
    tally.statements.failed.push(company.ticker);
    return;
  }

  const years = annualYears(facts.value).slice(-HISTORY);
  const periods = years
    .map((y) => periodFromSec(facts.value, y))
    .filter((p): p is FinancialPeriod => p !== null);

  const written = await writePeriods(company.id, company.ticker, periods, facts.provenance.source);
  if (written === 0) {
    console.log(`  ${R}falhou${O} ${company.ticker} — nenhum exercício utilizável`);
    tally.statements.failed.push(company.ticker);
    return;
  }
  console.log(`  ${G}ok${O}     ${company.ticker.padEnd(8)} ${written} exercícios ${D}(SEC EDGAR, ${years[0]}–${years[years.length - 1]})${O}`);
  tally.statements.updated.push(company.ticker);

  const filings = await recentFilings(cik.value.cik, 10);
  if (filings.ok && filings.value.length > 0) {
    await prisma.newsItem.deleteMany({ where: { companyId: company.id, kind: 'FILING' } });
    await prisma.newsItem.createMany({
      data: filings.value.map((f) => ({
        companyId: company.id,
        headline: `${f.form} — ${company.name}`,
        summary: f.title,
        source: 'SEC EDGAR',
        url: f.url,
        publishedAt: new Date(f.filedAt),
        sentiment: 'NEUTRAL', impact: f.form === '10-K' ? 'HIGH' : 'MEDIUM', kind: 'FILING',
      })),
    });
    tally.news.updated.push(company.ticker);
  }
}

/**
 * Brazilian statements, one year of filings at a time.
 *
 * The first version downloaded all six archives, kept them parsed, and then
 * looped the companies — and ran the process out of memory on the third year.
 * An archive is tens of megabytes of CSV that becomes millions of JavaScript
 * objects, and six of those do not fit anywhere.
 *
 * So the loop is inverted: a year is downloaded, every company is read out of
 * it, and it is dropped before the next one is fetched. What survives across
 * iterations is one small period object per company per year, which is the
 * thing actually wanted.
 */
async function collectBrazilian(
  companies: { id: string; ticker: string; name: string; legalName: string | null }[],
  registry: Registry, historyYears: number,
): Promise<Map<string, FinancialPeriod[]>> {
  const byTicker = new Map<string, FinancialPeriod[]>();
  const cnpjs = new Map<string, string>();

  for (const c of companies) {
    const found = resolveCnpj(registry, c.legalName ?? c.name, c.name);
    if (found.ok) {
      cnpjs.set(c.ticker, found.cnpj);
      byTicker.set(c.ticker, []);
    } else {
      console.log(`  ${R}falhou${O} ${c.ticker} — ${found.reason}`);
      for (const cand of found.candidates) console.log(`         ${D}talvez: ${cand}${O}`);
      tally.statements.failed.push(c.ticker);
    }
  }
  if (cnpjs.size === 0) return byTicker;

  const thisYear = new Date().getUTCFullYear();
  for (let y = thisYear - 1; y > thisYear - 1 - historyYears; y--) {
    let shown = 0;
    const archive = await fetchDfpYear(y, (bytes) => {
      const mb = Math.floor(bytes / 1_048_576);
      if (mb > shown) {
        shown = mb;
        process.stdout.write(`\r  ${D}       DFP ${y} — ${mb} MB${O}   `);
      }
    });
    if (shown > 0) process.stdout.write(`\r${' '.repeat(44)}\r`);

    if (!archive.ok) {
      // A year not yet published, or one that would not download, is a gap in
      // the history rather than a reason to abandon the rest.
      console.log(`  ${Y}pulado${O} DFP ${y} — ${archive.reason}`);
      continue;
    }

    let found = 0;
    for (const [ticker, cnpj] of cnpjs) {
      const p = periodFromCvm(archive.value, cnpj);
      if (p) { byTicker.get(ticker)!.push(p); found++; }
    }
    console.log(`  ${G}ok${O}     DFP ${y} ${D}— ${found} de ${cnpjs.size} empresas${O}`);
    // The archive falls out of scope here, before the next one is fetched.
  }

  return byTicker;
}

async function writeBrazilian(
  company: { id: string; ticker: string }, periods: FinancialPeriod[],
): Promise<void> {
  if (periods.length === 0) {
    console.log(`  ${R}falhou${O} ${company.ticker} — não aparece em nenhum arquivo baixado`);
    tally.statements.failed.push(company.ticker);
    return;
  }
  periods.sort((a, b) => a.fiscalYear - b.fiscalYear);
  const written = await writePeriods(company.id, company.ticker, periods, 'CVM — DFP');
  if (written === 0) {
    console.log(`  ${R}falhou${O} ${company.ticker} — nenhum exercício utilizável`);
    tally.statements.failed.push(company.ticker);
    return;
  }
  console.log(`  ${G}ok${O}     ${company.ticker.padEnd(8)} ${written} exercícios `
    + `${D}(CVM, ${periods[0].fiscalYear}–${periods[periods.length - 1].fiscalYear})${O}`);
  tally.statements.updated.push(company.ticker);
}

/* ------------------------------ quotes ------------------------------ */

async function syncQuote(company: { id: string; ticker: string; country: string }): Promise<void> {
  const security = await prisma.security.findUnique({ where: { ticker: company.ticker } });
  if (!security) { tally.quotes.skipped.push(company.ticker); return; }

  const q = await quote(company.ticker, company.country);
  if (q.ok) {
    await prisma.security.update({
      where: { id: security.id },
      data: {
        lastPrice: q.value.price,
        previousClose: q.value.previousClose ?? security.previousClose,
        dayHigh: q.value.dayHigh ?? security.dayHigh,
        dayLow: q.value.dayLow ?? security.dayLow,
        week52High: q.value.week52High ?? security.week52High,
        week52Low: q.value.week52Low ?? security.week52Low,
        averageVolume: q.value.volume ?? security.averageVolume,
        priceAsOf: new Date(q.value.asOf),
      },
    });
    tally.quotes.updated.push(company.ticker);
  } else {
    tally.quotes.failed.push(company.ticker);
  }

  /* The beta was a stored number with no derivation — no window, no index, no
     error bar, and all three change it materially. Regressed here against the
     market the company actually trades in, from the same source on both legs so
     the two are measured on one calendar. */
  const bars = await history(yahooSymbol(company.ticker, company.country));
  if (!bars.ok) { tally.prices.failed.push(company.ticker); return; }

  await prisma.priceBar.deleteMany({ where: { securityId: security.id } });
  await prisma.priceBar.createMany({
    data: bars.value.map((b) => ({
      securityId: security.id, date: new Date(b.date),
      open: b.open, high: b.high, low: b.low, close: b.close, volume: b.volume,
    })),
  });
  tally.prices.updated.push(company.ticker);

  const index = benchmarkSymbol(company.country);
  const marketBars = benchmarkCache.get(index);
  if (!marketBars) return;

  const r = regressBeta(bars.value, marketBars, index);
  if (!r) { tally.beta.failed.push(company.ticker); return; }
  await prisma.security.update({ where: { id: security.id }, data: { beta: r.beta } });
  tally.beta.updated.push(company.ticker);
}

/** Index history is fetched once per market, not once per company. */
const benchmarkCache = new Map<string, { date: string; close: number }[]>();

async function loadBenchmarks(countries: Set<string>): Promise<void> {
  const symbols = new Set([...countries].map(benchmarkSymbol));
  for (const s of symbols) {
    const bars = await history(s);
    if (bars.ok) {
      benchmarkCache.set(s, bars.value);
      console.log(`  ${G}ok${O}     ${s.padEnd(8)} ${bars.value.length} pregões ${D}até ${bars.provenance.asOf}${O}`);
    } else {
      console.log(`  ${R}falhou${O} ${s} — ${bars.reason}. Sem beta para esse mercado.`);
    }
  }
}

/* ------------------------------- main ------------------------------- */

async function main(): Promise<void> {
  console.log(`\nMERIDIAN — carregando dados reais (${HISTORY} anos de histórico)`);
  if (only.length) console.log(`${D}restrito a: ${only.join(', ')}${O}`);

  await syncMacro();

  const companies = await prisma.company.findMany({
    where: only.length ? { ticker: { in: only } } : {},
    select: { id: true, ticker: true, name: true, legalName: true, country: true },
    orderBy: { ticker: 'asc' },
  });
  if (companies.length === 0) {
    console.log(`\n${R}Nenhuma empresa encontrada no banco. Rode npm run db:seed antes.${O}\n`);
    return;
  }

  const brazilian = companies.filter((c) => c.country === 'Brazil');
  const american = companies.filter((c) => c.country !== 'Brazil');

  console.log('\nDemonstrações — Estados Unidos');
  for (const c of american) await syncAmerican(c);

  if (brazilian.length > 0) {
    console.log('\nDemonstrações — Brasil');
    const reg = await fetchRegistry();
    if (!reg.ok) {
      console.log(`  ${R}falhou${O} cadastro da CVM — ${reg.reason}`);
      console.log(`  ${D}nenhuma empresa brasileira será carregada; nada foi apagado.${O}`);
      for (const c of brazilian) tally.statements.failed.push(c.ticker);
    } else {
      console.log(`  ${G}ok${O}     cadastro ${D}(${reg.value.entries.length} companhias ativas)${O}`);
      const collected = await collectBrazilian(brazilian, reg.value, HISTORY);
      for (const c of brazilian) {
        const periods = collected.get(c.ticker);
        if (periods) await writeBrazilian(c, periods);
      }
    }
  }

  console.log('\nÍndices de mercado');
  await loadBenchmarks(new Set(companies.map((c) => c.country)));

  console.log('\nCotações, histórico e beta');
  for (const c of companies) await syncQuote(c);
  console.log(`  ${G}${tally.quotes.updated.length} atualizadas${O}`
    + (tally.quotes.failed.length ? `, ${R}${tally.quotes.failed.length} sem cotação${O}` : ''));

  /* The badge the product shows has to follow the data, not the intention. */
  const anyReal = tally.statements.updated.length > 0;
  if (anyReal) {
    await prisma.dataSource.updateMany({
      where: { code: { in: ['mock-fundamentals', 'mock-market'] } },
      data: {
        isMock: false, status: 'CONNECTED', lastSyncAt: new Date(),
        name: 'CVM, SEC EDGAR, Banco Central, Tesouro dos EUA',
        notes: 'Demonstrações padronizadas entregues aos reguladores. Cada linha guarda a fonte de onde veio.',
      },
    });
  }

  console.log('\n──────────────────────────────────────────');
  console.log(`  demonstrações  ${G}${tally.statements.updated.length} empresas${O}`
    + (tally.statements.failed.length ? `  ${R}${tally.statements.failed.length} falharam${O}` : ''));
  console.log(`  cotações       ${G}${tally.quotes.updated.length}${O}`);
  console.log(`  histórico      ${G}${tally.prices.updated.length}${O}`);
  console.log(`  beta regredido ${G}${tally.beta.updated.length}${O}`
    + (tally.beta.failed.length ? `  ${R}${tally.beta.failed.length} sem série suficiente${O}` : ''));
  console.log(`  indicadores    ${G}${tally.macro.updated.length}${O}`
    + (tally.macro.failed.length ? `  ${R}${tally.macro.failed.length} falharam${O}` : ''));
  console.log(`  documentos     ${G}${tally.news.updated.length} empresas${O}`);
  if (tally.statements.failed.length) {
    console.log(`\n  ${D}sem demonstrações reais: ${tally.statements.failed.join(', ')}${O}`);
    console.log(`  ${D}essas mantêm o que já estava no banco — nada foi apagado.${O}`);
  }
  console.log('');
}

main()
  .catch((e) => { console.error('\nA carga falhou:\n', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
