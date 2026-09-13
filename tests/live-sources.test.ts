import { describe, expect, it, vi, afterEach } from 'vitest';
import { getJson, getText } from '@/lib/data-providers/live/http';
import { latest, SERIES } from '@/lib/data-providers/live/bcb';
import { latestCurve } from '@/lib/data-providers/live/treasury';
import { fromBrapi, fromYahoo, yahooSymbol } from '@/lib/data-providers/live/quotes';
import { failed, ok, reasonOf, valueOf } from '@/lib/data-providers/live/types';

/* The network cannot be reached from where this code was written, so the
   request side is unverifiable here and the parsing side is not. These tests
   run the parsers against the shapes the services document, including the
   shapes they return when something is wrong — which is the half that usually
   goes untested and then fails silently in front of a user. */

function respond(body: string, init: ResponseInit = {}): void {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(body, { status: 200, ...init })));
}

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('a source that cannot answer says why', () => {
  it('does not turn a 404 into an empty result', () => {
    const f = failed<number>('https://example.test/x', 'HTTP 404 Not Found');
    expect(valueOf(f)).toBeNull();
    expect(reasonOf(f)).toBe('HTTP 404 Not Found');
  });

  it('keeps the url on a failure so it can be checked by hand', () => {
    const f = failed<number>('https://example.test/x', 'timed out');
    expect(f.ok).toBe(false);
    if (!f.ok) expect(f.url).toBe('https://example.test/x');
  });

  it('carries the date the data refers to, not the date it was fetched', () => {
    const f = ok(1, { source: 'S', url: 'u', asOf: '2026-03-31' });
    expect(f.ok && f.provenance.asOf).toBe('2026-03-31');
  });

  it('treats an HTML error page served with a 200 as a failure, not as data', async () => {
    // Public services do this constantly, and a JSON.parse that throws inside
    // a try/catch returning null is how a maintenance page becomes a missing
    // number with no explanation.
    respond('<html><body>Service unavailable</body></html>');
    const r = await getJson<unknown>('https://example.test/x');
    expect(r.ok).toBe(false);
    expect(reasonOf(r)).toMatch(/expected JSON/);
  });

  it('does not retry a 4xx, because that is an answer', async () => {
    const spy = vi.fn(async () => new Response('nope', { status: 404 }));
    vi.stubGlobal('fetch', spy);
    const r = await getText('https://example.test/x', { retries: 3 });
    expect(r.ok).toBe(false);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('Banco Central — SGS', () => {
  it('reads the latest observation and the one before it', async () => {
    respond(JSON.stringify([
      { data: '11/09/2026', valor: '14.75' },
      { data: '12/09/2026', valor: '15.00' },
    ]));
    const r = await latest('selicTarget');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.value).toBe(15);
    expect(r.value.previous).toBe(14.75);
  });

  it('converts the Brazilian date to an ISO one', async () => {
    respond(JSON.stringify([{ data: '12/09/2026', valor: '15.00' }]));
    const r = await latest('selicTarget');
    expect(r.ok && r.value.asOf).toBe('2026-09-12');
    expect(r.ok && r.provenance.asOf).toBe('2026-09-12');
  });

  it('reports an empty series rather than returning zero', async () => {
    respond('[]');
    const r = await latest('ipca12m');
    expect(r.ok).toBe(false);
    expect(reasonOf(r)).toMatch(/no observations/);
  });

  it('reports an unparseable row rather than producing NaN', async () => {
    respond(JSON.stringify([{ data: 'ontem', valor: 'n/d' }]));
    const r = await latest('cdi');
    expect(r.ok).toBe(false);
    expect(reasonOf(r)).toMatch(/unparseable/);
  });

  it('uses the series numbers the Bank publishes', () => {
    // These are stable public identifiers; changing one silently would change
    // which rate the whole platform discounts at.
    expect(SERIES.selicTarget.code).toBe(432);
    expect(SERIES.ipca12m.code).toBe(13522);
    expect(SERIES.usdBrl.code).toBe(1);
  });
});

describe('US Treasury — par yield curve', () => {
  const entry = (date: string, ten: string) => `
    <entry>
      <content><m:properties>
        <d:NEW_DATE>${date}</d:NEW_DATE>
        <d:BC_1MONTH>4.30</d:BC_1MONTH>
        <d:BC_2YEAR>3.90</d:BC_2YEAR>
        <d:BC_10YEAR>${ten}</d:BC_10YEAR>
        <d:BC_30YEAR>4.60</d:BC_30YEAR>
      </m:properties></content>
    </entry>`;

  it('takes the most recent entry, not the first', async () => {
    // The feed carries the whole year in date order. Asking for "today" would
    // fail every weekend and every federal holiday.
    respond(`<feed>${entry('2026-01-02T00:00:00', '4.10')}${entry('2026-09-11T00:00:00', '4.35')}</feed>`);
    const r = await latestCurve(2026);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.asOf).toBe('2026-09-11');
    expect(r.value.byTenor['10Y']).toBeCloseTo(0.0435, 6);
  });

  it('stores decimals, because the rest of the platform does', async () => {
    respond(`<feed>${entry('2026-09-11T00:00:00', '4.35')}</feed>`);
    const r = await latestCurve(2026);
    expect(r.ok && r.value.byTenor['30Y']).toBeCloseTo(0.046, 6);
    expect(r.ok && r.value.byTenor['2Y']).toBeCloseTo(0.039, 6);
  });

  it('reports a feed with no entries rather than an empty curve', async () => {
    respond('<feed></feed>');
    const r = await latestCurve(2026);
    expect(r.ok).toBe(false);
    expect(reasonOf(r)).toMatch(/no daily entries/);
  });
});

describe('quotes', () => {
  it('suffixes a B3 ticker and leaves a US one alone', () => {
    expect(yahooSymbol('PETR4', 'Brazil')).toBe('PETR4.SA');
    expect(yahooSymbol('AAPL', 'United States')).toBe('AAPL');
  });

  it('refuses clearly when brapi has no token, rather than looking like an empty market', async () => {
    // A missing key and a delisted company must not produce the same result.
    vi.stubEnv('BRAPI_TOKEN', '');
    const r = await fromBrapi('PETR4');
    expect(r.ok).toBe(false);
    expect(reasonOf(r)).toMatch(/BRAPI_TOKEN/);
  });

  it('reads a brapi quote', async () => {
    vi.stubEnv('BRAPI_TOKEN', 'test-token');
    respond(JSON.stringify({
      results: [{
        symbol: 'PETR4', regularMarketPrice: 42.69, regularMarketPreviousClose: 43.42,
        regularMarketDayHigh: 43.5, regularMarketDayLow: 42.5,
        fiftyTwoWeekHigh: 45.1, fiftyTwoWeekLow: 31.2,
        regularMarketVolume: 51_000_000, currency: 'BRL',
        regularMarketTime: '2026-09-11T20:00:00.000Z',
      }],
    }));
    const r = await fromBrapi('PETR4');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.price).toBe(42.69);
    expect(r.value.previousClose).toBe(43.42);
    expect(r.value.currency).toBe('BRL');
    expect(r.value.asOf).toBe('2026-09-11');
  });

  it('surfaces a brapi error body instead of reading past it', async () => {
    vi.stubEnv('BRAPI_TOKEN', 'test-token');
    respond(JSON.stringify({ error: true, message: 'Ticker não encontrado' }));
    const r = await fromBrapi('XXXX9');
    expect(r.ok).toBe(false);
    expect(reasonOf(r)).toMatch(/não encontrado/);
  });

  it('reads a Yahoo quote', async () => {
    respond(JSON.stringify({
      chart: {
        result: [{
          meta: {
            regularMarketPrice: 246.3, previousClose: 244.1,
            fiftyTwoWeekHigh: 260.1, fiftyTwoWeekLow: 164.08,
            regularMarketVolume: 44_000_000, currency: 'USD',
            regularMarketTime: 1_757_620_800,
          },
        }],
      },
    }));
    const r = await fromYahoo('AAPL', 'United States');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.price).toBe(246.3);
    expect(r.value.currency).toBe('USD');
    expect(r.provenance.source).toMatch(/AAPL/);
  });

  it('surfaces a Yahoo error rather than reporting no price', async () => {
    respond(JSON.stringify({ chart: { error: { description: 'No data found, symbol may be delisted' } } }));
    const r = await fromYahoo('XXXX', 'United States');
    expect(r.ok).toBe(false);
    expect(reasonOf(r)).toMatch(/delisted/);
  });

  it('never reports a price without saying where it came from', async () => {
    respond(JSON.stringify({ chart: { result: [{ meta: { regularMarketPrice: 10, currency: 'USD' } }] } }));
    const r = await fromYahoo('X', 'United States');
    expect(r.ok && r.provenance.source.length).toBeGreaterThan(0);
    expect(r.ok && r.provenance.url).toMatch(/^https:/);
  });
});
