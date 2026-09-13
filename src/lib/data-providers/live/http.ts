import { failed, type Fetched } from './types';

/* ==================================================================
   One place where the network is touched.

   Public data services are run by public bodies and they behave like
   it: they rate-limit, they go down for maintenance, they return HTML
   error pages with a 200, and the SEC rejects any request that does
   not identify who is making it. None of that should be discovered
   separately in seven different clients.
   ================================================================== */

/**
 * The SEC requires a declared identity on every request and blocks
 * anything that omits it. This is configurable because the polite thing
 * is for the operator to put their own contact address here.
 */
const DEFAULT_AGENT = 'Meridian research platform (contact via repository)';

export interface FetchOptions {
  timeoutMs?: number;
  /** Attempts on a timeout or a 5xx. Never on a 4xx — that is an answer. */
  retries?: number;
  headers?: Record<string, string>;
}

export function userAgent(): string {
  return process.env.MERIDIAN_USER_AGENT ?? DEFAULT_AGENT;
}

async function once(url: string, opts: FetchOptions): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 20_000);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': userAgent(), Accept: '*/*', ...opts.headers },
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Fetches text, or explains why it could not. */
export async function getText(url: string, opts: FetchOptions = {}): Promise<Fetched<string>> {
  const retries = opts.retries ?? 2;
  let last = 'not attempted';

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await once(url, opts);
      if (res.status >= 400 && res.status < 500) {
        // A client error is an answer: the resource is not there, or we are
        // not allowed, or we are being throttled. Retrying will not change it.
        return failed(url, `HTTP ${res.status} ${res.statusText}`);
      }
      if (!res.ok) {
        last = `HTTP ${res.status} ${res.statusText}`;
      } else {
        return { ok: true, value: await res.text(), provenance: { source: url, url, asOf: '' } };
      }
    } catch (e) {
      last = e instanceof Error && e.name === 'AbortError'
        ? `timed out after ${opts.timeoutMs ?? 20_000}ms`
        : `network error: ${e instanceof Error ? e.message : String(e)}`;
    }
    // Back off before trying again, so a struggling public service is not
    // hammered by a retry loop.
    if (attempt < retries) await new Promise((r) => setTimeout(r, 400 * 2 ** attempt));
  }
  return failed(url, last);
}

/** Fetches JSON, or explains why it could not. A body that is not JSON is a failure, not a null. */
export async function getJson<T>(url: string, opts: FetchOptions = {}): Promise<Fetched<T>> {
  const text = await getText(url, { ...opts, headers: { Accept: 'application/json', ...opts.headers } });
  if (!text.ok) return text as Fetched<T>;
  try {
    return { ok: true, value: JSON.parse(text.value) as T, provenance: text.provenance };
  } catch {
    const head = text.value.slice(0, 120).replace(/\s+/g, ' ');
    return failed(url, `expected JSON, got ${text.value.length} bytes starting "${head}"`);
  }
}

/** Fetches raw bytes — the CVM publishes its filings as zipped CSV. */
export async function getBytes(url: string, opts: FetchOptions = {}): Promise<Fetched<Buffer>> {
  try {
    const res = await once(url, { timeoutMs: 60_000, ...opts });
    if (!res.ok) return failed(url, `HTTP ${res.status} ${res.statusText}`);
    return {
      ok: true,
      value: Buffer.from(await res.arrayBuffer()),
      provenance: { source: url, url, asOf: '' },
    };
  } catch (e) {
    return failed(url, `network error: ${e instanceof Error ? e.message : String(e)}`);
  }
}
