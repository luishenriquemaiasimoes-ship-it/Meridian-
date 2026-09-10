import { MockMarketDataProvider } from './mock/provider';
import type { MarketDataProvider } from './types';

export * from './types';
export { MockMarketDataProvider } from './mock/provider';
export { BLUEPRINTS, findBlueprint, isBankLike, TICKERS } from './mock/blueprints';

/**
 * Provider registry. Adding a vendor means registering a new implementation
 * here — no other part of the product changes.
 */
const registry = new Map<string, () => MarketDataProvider>([
  ['mock', () => new MockMarketDataProvider()],
]);

let cached: MarketDataProvider | null = null;

export function getMarketDataProvider(): MarketDataProvider {
  if (cached) return cached;
  const id = process.env.MARKET_DATA_PROVIDER ?? 'mock';
  const factory = registry.get(id) ?? registry.get('mock')!;
  cached = factory();
  return cached;
}

export function registerMarketDataProvider(id: string, factory: () => MarketDataProvider): void {
  registry.set(id, factory);
  cached = null;
}

export function listProviderIds(): string[] {
  return Array.from(registry.keys());
}
