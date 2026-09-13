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

  for (const ticker of tickers) {
    const bp = findBlueprint(ticker);
    const country = bp?.profile.country ?? (/\d$/.test(ticker) ? 'Brazil' : 'United States');
    console.log(`\n${ticker}${bp ? ` — ${bp.profile.name}` : ' (fora do universo)'} [${country}]`);

    const render = (q: { price: number; previousClose: number | null; currency: string | null }) =>
      `${q.currency ?? '?'} ${q.price}${q.previousClose === null ? '' : ` (fechamento anterior ${q.previousClose})`}`;

    report('cotação — brapi', await fromBrapi(ticker), render);
    report('cotação — Yahoo', await fromYahoo(ticker, country), render);
  }

  console.log(`\n${DIM}Nada foi gravado. Este comando só consulta e reporta.${OFF}\n`);
}

main().catch((e) => {
  console.error('\nO diagnóstico falhou antes de conseguir consultar as fontes:\n', e);
  process.exit(1);
});
