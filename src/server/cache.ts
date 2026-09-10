/**
 * Process-local memo cache with a time-to-live.
 *
 * Company fundamentals are recomputed from the same statement set by the
 * screener, the comparables module, the portfolio look-through and the factor
 * scores. Computing them once per interval keeps those screens responsive
 * without introducing an external cache.
 */
interface Entry<T> { value: T; expiresAt: number }

const store = new Map<string, Entry<unknown>>();

export const DEFAULT_TTL_MS = 60_000;

export async function memo<T>(key: string, ttlMs: number, factory: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expiresAt > now) return hit.value;
  const value = await factory();
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export function invalidate(prefix: string): void {
  for (const key of Array.from(store.keys())) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

export function invalidateAll(): void {
  store.clear();
}

export function cacheSize(): number {
  return store.size;
}
