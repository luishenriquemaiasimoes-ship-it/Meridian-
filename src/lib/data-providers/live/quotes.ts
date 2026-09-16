import { getJson } from './http';
import { failed, ok, type Fetched } from './types';

/* ==================================================================
   Quotes.

   Two sources because no free one covers both markets well. brapi is
   built on B3 data and takes the ticker in the form a Brazilian
   analyst writes it; Yahoo covers everything but wants a suffixed
   symbol and is an unofficial endpoint that can change without notice.

   Whichever answers, the value carries the name of who answered. A
   price with no source is not usable in a valuation.
   ================================================================== */

export interface LiveQuote {
  ticker: string;
  price: number;
  previousClose: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  week52High: number | null;
  week52Low: number | null;
  volume: number | null;
  currency: string | null;
  asOf: string;
}

const num = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;

/* ----------------------------- brapi ----------------------------- */

interface BrapiResult {
  symbol?: string;
  regularMarketPrice?: number;
  regularMarketPreviousClose?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  regularMarketVolume?: number;
  currency?: string;
  regularMarketTime?: string;
}

/**
 * brapi.dev. The free tier needs a token, which is why this returns a clear
 * refusal rather than an empty quote when one is not configured — a missing
 * key and a delisted company are different problems and must not look alike.
 */
export async function fromBrapi(ticker: string): Promise<Fetched<LiveQuote>> {
  const token = process.env.BRAPI_TOKEN;
  const url = `https://brapi.dev/api/quote/${encodeURIComponent(ticker)}`;
  if (!token) {
    return failed(url, 'BRAPI_TOKEN is not set — register a free token at brapi.dev and put it in .env');
  }

  const res = await getJson<{ results?: BrapiResult[]; error?: string; message?: string }>(
    `${url}?token=${encodeURIComponent(token)}`,
  );
  if (!res.ok) return res as Fetched<LiveQuote>;

  const body = res.value;
  if (body.error || body.message) return failed(url, String(body.message ?? body.error));

  const r = body.results?.[0];
  const price = num(r?.regularMarketPrice);
  if (!r || price === null) return failed(url, `no quote for ${ticker} in the response`);

  const asOf = (r.regularMarketTime ?? new Date().toISOString()).slice(0, 10);
  return ok(
    {
      ticker,
      price,
      previousClose: num(r.regularMarketPreviousClose),
      dayHigh: num(r.regularMarketDayHigh),
      dayLow: num(r.regularMarketDayLow),
      week52High: num(r.fiftyTwoWeekHigh),
      week52Low: num(r.fiftyTwoWeekLow),
      volume: num(r.regularMarketVolume),
      currency: r.currency ?? 'BRL',
      asOf,
    },
    { source: 'brapi.dev (B3)', url, asOf },
  );
}

/* ----------------------------- Yahoo ----------------------------- */

interface YahooMeta {
  regularMarketPrice?: number;
  previousClose?: number;
  chartPreviousClose?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  regularMarketVolume?: number;
  currency?: string;
  regularMarketTime?: number;
}

/** B3 tickers are suffixed .SA on Yahoo; US tickers are bare. */
export function yahooSymbol(ticker: string, country: string): string {
  return country === 'Brazil' || /\d$/.test(ticker) ? `${ticker}.SA` : ticker;
}

export async function fromYahoo(ticker: string, country: string): Promise<Fetched<LiveQuote>> {
  const symbol = yahooSymbol(ticker, country);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`;
  const res = await getJson<{ chart?: { result?: { meta?: YahooMeta }[]; error?: { description?: string } } }>(url);
  if (!res.ok) return res as Fetched<LiveQuote>;

  const chart = res.value.chart;
  if (chart?.error) return failed(url, chart.error.description ?? 'Yahoo returned an error');

  const meta = chart?.result?.[0]?.meta;
  const price = num(meta?.regularMarketPrice);
  if (!meta || price === null) return failed(url, `no quote for ${symbol} in the response`);

  const asOf = meta.regularMarketTime
    ? new Date(meta.regularMarketTime * 1000).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return ok(
    {
      ticker,
      price,
      previousClose: num(meta.previousClose) ?? num(meta.chartPreviousClose),
      dayHigh: num(meta.regularMarketDayHigh),
      dayLow: num(meta.regularMarketDayLow),
      week52High: num(meta.fiftyTwoWeekHigh),
      week52Low: num(meta.fiftyTwoWeekLow),
      volume: num(meta.regularMarketVolume),
      currency: meta.currency ?? null,
      asOf,
    },
    { source: `Yahoo Finance (${symbol})`, url, asOf },
  );
}

/**
 * The best quote available, trying the market's own source first.
 *
 * Both failures are reported together when neither works: knowing that brapi
 * wanted a token AND that Yahoo did not recognise the symbol is what tells an
 * operator which of the two to fix.
 */
export async function quote(ticker: string, country: string): Promise<Fetched<LiveQuote>> {
  const brazilian = country === 'Brazil' || /\d$/.test(ticker);
  const first = brazilian ? await fromBrapi(ticker) : await fromYahoo(ticker, country);
  if (first.ok) return first;

  const second = brazilian ? await fromYahoo(ticker, country) : await fromBrapi(ticker);
  if (second.ok) return second;

  return failed(second.url, `${first.reason} | then ${second.reason}`);
}

/* ---------------------------- history ---------------------------- */

export interface PriceBar {
  date: string;
  open: number; high: number; low: number; close: number; volume: number;
}

/**
 * Daily closes, for the price chart and for the beta regression.
 *
 * Yahoo is used for both the stock and the index because a beta is only
 * meaningful when both legs are measured the same way, on the same calendar,
 * from the same source.
 */
export async function history(
  symbol: string, range = '3y',
): Promise<Fetched<PriceBar[]>> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`
    + `?range=${range}&interval=1d`;
  const res = await getJson<{
    chart?: {
      result?: {
        timestamp?: number[];
        indicators?: { quote?: { open?: (number | null)[]; high?: (number | null)[]; low?: (number | null)[]; close?: (number | null)[]; volume?: (number | null)[] }[] };
      }[];
      error?: { description?: string };
    };
  }>(url);
  if (!res.ok) return res as Fetched<PriceBar[]>;

  const chart = res.value.chart;
  if (chart?.error) return failed(url, chart.error.description ?? 'Yahoo returned an error');

  const result = chart?.result?.[0];
  const stamps = result?.timestamp;
  const q = result?.indicators?.quote?.[0];
  if (!stamps || !q?.close) return failed(url, `no price history for ${symbol}`);

  const bars: PriceBar[] = [];
  for (let i = 0; i < stamps.length; i++) {
    const close = q.close[i];
    // Yahoo returns nulls for halted days. A null close is not a zero price.
    if (typeof close !== 'number' || !Number.isFinite(close)) continue;
    bars.push({
      date: new Date(stamps[i] * 1000).toISOString().slice(0, 10),
      open: q.open?.[i] ?? close,
      high: q.high?.[i] ?? close,
      low: q.low?.[i] ?? close,
      close,
      volume: q.volume?.[i] ?? 0,
    });
  }
  if (bars.length === 0) return failed(url, `${symbol} returned timestamps but no usable closes`);

  return ok(bars, { source: `Yahoo Finance (${symbol})`, url, asOf: bars[bars.length - 1].date });
}

/** The index a company's beta is measured against. */
export function benchmarkSymbol(country: string): string {
  return country === 'Brazil' ? '^BVSP' : '^GSPC';
}
