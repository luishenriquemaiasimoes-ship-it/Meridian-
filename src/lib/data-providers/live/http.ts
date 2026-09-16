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
  /**
   * How long to wait with NO BYTES ARRIVING before giving up.
   *
   * Deliberately a stall timeout rather than a total one. The CVM publishes a
   * year of filings as a single archive of tens of megabytes, and a total
   * timeout either kills a slow-but-healthy download or is set so high that a
   * dead connection hangs for minutes. What actually distinguishes the two is
   * whether bytes are still arriving.
   */
  stallMs?: number;
  /** Attempts on a stall, a network error or a 5xx. Never on a 4xx — that is an answer. */
  retries?: number;
  headers?: Record<string, string>;
  /** Called as the body arrives, for downloads worth showing progress on. */
  onProgress?: (bytesSoFar: number) => void;
}

export function userAgent(): string {
  return process.env.MERIDIAN_USER_AGENT ?? DEFAULT_AGENT;
}

class Stalled extends Error {}

/**
 * Fetches and reads a whole body under one stall timer.
 *
 * The timer covering only the request was the original bug: `fetch` resolves
 * when the HEADERS arrive, so clearing the timeout there left the body to
 * download with no limit at all. A 50MB archive that stalled mid-transfer hung
 * the process with no error and no way to tell it apart from slow progress.
 */
async function fetchBody(
  url: string, opts: FetchOptions,
): Promise<{ status: number; statusText: string; ok: boolean; body: Buffer }> {
  const stallMs = opts.stallMs ?? 30_000;
  const controller = new AbortController();

  /**
   * Runs one step against the clock.
   *
   * Racing rather than relying on the abort signal to interrupt the read. The
   * signal usually does propagate into the body stream, but "usually" is how
   * the original hang happened: when nothing interrupts the read, the process
   * waits forever with no error and no way to tell a stall from slow progress.
   * A race cannot be ignored by the transport.
   */
  const withinStall = async <T>(step: Promise<T>): Promise<T> => {
    let timer: NodeJS.Timeout | undefined;
    const stall = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        reject(new Stalled(`no data for ${Math.round(stallMs / 1000)}s`));
      }, stallMs);
    });
    try {
      return await Promise.race([step, stall]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  const res = await withinStall(fetch(url, {
    signal: controller.signal,
    headers: { 'User-Agent': userAgent(), Accept: '*/*', ...opts.headers },
  }));

  if (!res.ok || !res.body) {
    return { status: res.status, statusText: res.statusText, ok: res.ok, body: Buffer.alloc(0) };
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    for (;;) {
      const { done, value } = await withinStall(reader.read());
      if (done) break;
      if (value) {
        chunks.push(value);
        total += value.length;
        opts.onProgress?.(total);
      }
    }
  } catch (e) {
    // Let go of the socket rather than leaving it open behind a rejected read.
    reader.cancel().catch(() => {});
    throw e;
  }

  return { status: res.status, statusText: res.statusText, ok: true, body: Buffer.concat(chunks) };
}

/** Fetches bytes, retrying a stall or a 5xx but never a 4xx. */
export async function getBytes(url: string, opts: FetchOptions = {}): Promise<Fetched<Buffer>> {
  const retries = opts.retries ?? 2;
  let last = 'not attempted';

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchBody(url, opts);
      if (res.status >= 400 && res.status < 500) {
        // A client error is an answer: not there, not allowed, or throttled.
        return failed(url, `HTTP ${res.status} ${res.statusText}`);
      }
      if (res.ok) {
        return { ok: true, value: res.body, provenance: { source: url, url, asOf: '' } };
      }
      last = `HTTP ${res.status} ${res.statusText}`;
    } catch (e) {
      last = e instanceof Stalled
        ? `stalled — ${e.message}`
        : `network error: ${e instanceof Error ? e.message : String(e)}`;
    }
    // Back off before trying again, so a struggling public service is not
    // hammered by a retry loop. A large archive over a home connection fails
    // transiently often enough that one attempt is not a fair test of it.
    if (attempt < retries) await new Promise((r) => setTimeout(r, 1_500 * 2 ** attempt));
  }
  return failed(url, `${last} (após ${retries + 1} tentativas)`);
}

/** Fetches text, or explains why it could not. */
export async function getText(url: string, opts: FetchOptions = {}): Promise<Fetched<string>> {
  const res = await getBytes(url, opts);
  if (!res.ok) return res as Fetched<string>;
  return { ok: true, value: res.value.toString('utf8'), provenance: res.provenance };
}

/** Fetches JSON. A body that is not JSON is a failure, not a null. */
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
