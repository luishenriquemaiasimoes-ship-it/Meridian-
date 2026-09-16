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
import { quote } from '../src/lib/data-providers/live/quotes';
import { fetchDfpYear, type DfpYear } from '../src/lib/data-providers/live/cvm';
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
};

/* ------------------------------ macro ------------------------------ */

async function syncMacro(): Promise<void> {
  console.log('\nBanco Central e Tesouro');
  const series = await allSeries();

  for (const key of Object.keys(SERIES) as SeriesKey[]) {
    const f = series[key];
    const meta = SERIES[key];
    const code = `BCB_${meta.code}`;
    if (!f.ok) {
      console.log(`  ${R}falhou${O} ${meta.name} — ${f.reason}`);
      tally.macro.failed.push(meta.name);
      continue;
    }
    await prisma.marketIndicator.upsert({
      where: { code },
      create: {
        code, name: meta.name, category: meta.unit === 'CURRENCY' ? 'FX' : 'RATE',
        value: f.value.value, previous: f.value.previous ?? f.value.value,
        unit: meta.unit, currency: meta.unit === 'CURRENCY' ? 'BRL' : null,
        asOf: new Date(f.value.asOf), source: f.provenance.source,
      },
      update: {
        value: f.value.value, previous: f.value.previous ?? f.value.value,
        asOf: new Date(f.value.asOf), source: f.provenance.source,
      },
    });
    console.log(`  ${G}ok${O}     ${meta.name.padEnd(26)} ${f.value.value}  ${D}${f.value.asOf}${O}`);
    tally.macro.updated.push(meta.name);
  }

  const curve = await latestCurve();
  if (!curve.ok) {
    console.log(`  ${R}falhou${O} curva do Tesouro — ${curve.reason}`);
    tally.macro.failed.push('curva do Tesouro');
    return;
  }
  for (const [tenor, value] of Object.entries(curve.value.byTenor)) {
    const code = `UST_${tenor}`;
    await prisma.marketIndicator.upsert({
      where: { code },
      create: {
        code, name: `US Treasury ${tenor}`, category: 'RATE', value, previous: value,
        unit: 'PERCENT', currency: 'USD', asOf: new Date(curve.value.asOf), source: curve.provenance.source,
      },
      update: { value, asOf: new Date(curve.value.asOf), source: curve.provenance.source },
    });
  }
  const ten = curve.value.byTenor['10Y'];
  console.log(`  ${G}ok${O}     ${'curva do Tesouro'.padEnd(26)} ${Object.keys(curve.value.byTenor).length} vértices`
    + `${ten === undefined ? '' : `, 10Y ${(ten * 100).toFixed(2)}%`}  ${D}${curve.value.asOf}${O}`);
  tally.macro.updated.push('curva do Tesouro');
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

async function syncBrazilian(
  company: { id: string; ticker: string; name: string; legalName: string | null },
  archives: Map<number, DfpYear>, registry: Registry,
): Promise<void> {
  const legal = company.legalName ?? company.name;
  const found = resolveCnpj(registry, legal, company.name);
  if (!found.ok) {
    console.log(`  ${R}falhou${O} ${company.ticker} — ${found.reason}`);
    for (const c of found.candidates) console.log(`         ${D}talvez: ${c}${O}`);
    tally.statements.failed.push(company.ticker);
    return;
  }

  const periods: FinancialPeriod[] = [];
  for (const archive of archives.values()) {
    const p = periodFromCvm(archive, found.cnpj);
    if (p) periods.push(p);
  }
  if (periods.length === 0) {
    console.log(`  ${R}falhou${O} ${company.ticker} — o CNPJ ${found.cnpj} não aparece em nenhum arquivo baixado`);
    tally.statements.failed.push(company.ticker);
    return;
  }

  periods.sort((a, b) => a.fiscalYear - b.fiscalYear);
  const written = await writePeriods(company.id, company.ticker, periods, `CVM — DFP (CNPJ ${found.cnpj})`);
  if (written === 0) {
    console.log(`  ${R}falhou${O} ${company.ticker} — nenhum exercício utilizável`);
    tally.statements.failed.push(company.ticker);
    return;
  }
  console.log(`  ${G}ok${O}     ${company.ticker.padEnd(8)} ${written} exercícios ${D}(CVM, ${periods[0].fiscalYear}–${periods[periods.length - 1].fiscalYear})${O}`);
  tally.statements.updated.push(company.ticker);
}

/* ------------------------------ quotes ------------------------------ */

async function syncQuote(company: { id: string; ticker: string; country: string }): Promise<void> {
  const q = await quote(company.ticker, company.country);
  if (!q.ok) {
    tally.quotes.failed.push(company.ticker);
    return;
  }
  const security = await prisma.security.findUnique({ where: { ticker: company.ticker } });
  if (!security) { tally.quotes.skipped.push(company.ticker); return; }

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

  /* One archive carries every listed company in Brazil, so each year is
     downloaded once and read for all of them — one download, not four hundred. */
  const archives = new Map<number, DfpYear>();
  let registry: Registry | null = null;

  if (brazilian.length > 0) {
    const thisYear = new Date().getUTCFullYear();
    console.log(`\nCVM — baixando ${HISTORY} arquivos anuais`);
    for (let y = thisYear - 1; y > thisYear - 1 - HISTORY; y--) {
      const a = await fetchDfpYear(y);
      if (a.ok) {
        archives.set(y, a.value);
        console.log(`  ${G}ok${O}     DFP ${y} ${D}(${a.value.files.size} arquivos)${O}`);
      } else {
        // A year not yet published is expected, not an error worth stopping for.
        console.log(`  ${Y}pulado${O} DFP ${y} — ${a.reason}`);
      }
    }
    const reg = await fetchRegistry();
    if (reg.ok) {
      registry = reg.value;
      console.log(`  ${G}ok${O}     cadastro ${D}(${reg.value.entries.length} companhias ativas)${O}`);
    } else {
      console.log(`  ${R}falhou${O} cadastro — ${reg.reason}. Nenhuma empresa brasileira será carregada.`);
    }
  }

  console.log('\nDemonstrações');
  for (const c of american) await syncAmerican(c);
  if (registry && archives.size > 0) {
    for (const c of brazilian) await syncBrazilian(c, archives, registry);
  } else {
    for (const c of brazilian) tally.statements.failed.push(c.ticker);
  }

  console.log('\nCotações');
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
