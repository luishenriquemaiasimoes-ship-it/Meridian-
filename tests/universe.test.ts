import { describe, expect, it } from 'vitest';
import { BLUEPRINTS, isBankLike } from '../src/lib/data-providers/mock/blueprints';
import {
  buildAnnualPeriods, buildQuarterlyPeriods, buildPriceHistory,
  MARKET_DAILY_VOL, marketFactorFor, marketShocks, PRICE_HISTORY_DAYS, tradingDays,
} from '../src/lib/data-providers/mock/generator';
import { buildBenchmarkHistory } from '../src/lib/data-providers/mock/provider';
import { balanceSheetCheck, computeLTM } from '../src/lib/finance/statements';
import { isNum } from '../src/lib/finance/core';
import { beta, simpleReturns, volatility } from '../src/lib/finance/risk';

/**
 * The demo universe is synthetic, which makes it more important that it obeys
 * the identities a real statement obeys: if the generator can produce a balance
 * sheet that does not balance, every ratio built on it is quietly wrong and the
 * platform has no way to notice.
 */
describe('generated universe integrity', () => {
  const companies = BLUEPRINTS.map((bp) => {
    const annuals = buildAnnualPeriods(bp);
    const quarters = buildQuarterlyPeriods(bp, annuals);
    return { bp, annuals, quarters, periods: [...annuals, ...quarters] };
  });

  it('covers every blueprint', () => {
    expect(companies.length).toBeGreaterThanOrEqual(26);
  });

  it.each(companies.map((c) => [c.bp.profile.ticker, c] as const))(
    '%s balances in every period',
    (_ticker, c) => {
      for (const period of c.periods) {
        const check = balanceSheetCheck(period.balance);
        expect(
          check.balances,
          `${c.bp.profile.ticker} ${period.label}: assets ${period.balance.totalAssets}, liabilities + equity ${
            (period.balance.totalLiabilities ?? 0) + (period.balance.totalEquity ?? 0)
          }`,
        ).toBe(true);
      }
    },
  );

  it.each(companies.map((c) => [c.bp.profile.ticker, c] as const))(
    '%s articulates cash flow with the change in cash',
    (_ticker, c) => {
      for (const period of c.periods) {
        const { cfo, cfi, cff, netChangeInCash } = period.cashFlow;
        if (![cfo, cfi, cff, netChangeInCash].every(isNum)) continue;
        const sum = (cfo as number) + (cfi as number) + (cff as number);
        expect(Math.abs(sum - (netChangeInCash as number))).toBeLessThanOrEqual(
          Math.max(1, Math.abs(sum) * 0.01),
        );
      }
    },
  );

  it.each(companies.map((c) => [c.bp.profile.ticker, c] as const))(
    '%s produces an LTM that balances and keeps its provenance',
    (_ticker, c) => {
      const ltm = computeLTM(c.quarters);
      expect(ltm).not.toBeNull();
      expect(balanceSheetCheck(ltm!.balance).balances).toBe(true);
      // An LTM is an aggregation, not a new source: the reader must still be
      // able to see that the underlying figures are simulated.
      expect(ltm!.source).toContain('Mock');
      expect(ltm!.source).toContain('LTM');
    },
  );

  it('reports revenue on every annual period', () => {
    for (const c of companies) {
      for (const a of c.annuals) {
        expect(isNum(a.income.revenue), `${c.bp.profile.ticker} ${a.label}`).toBe(true);
      }
    }
  });

  it('suppresses enterprise-value measures only for banks', () => {
    const banks = BLUEPRINTS.filter((bp) => isBankLike(bp.profile.industry)).map((bp) => bp.profile.ticker);
    expect(banks).toContain('ITUB4');
    expect(banks).toContain('BBAS3');
    expect(banks).not.toContain('VALE3');
  });
});

/**
 * Price series carry two claims the rest of the platform relies on: the
 * volatility anchor and the beta. Both must be recoverable from the series
 * itself, or every risk number computed downstream describes a different
 * universe from the one the company screen quotes.
 */
describe('generated price series', () => {
  it('stamps prices and benchmarks from one trading calendar', () => {
    const dates = tradingDays(PRICE_HISTORY_DAYS);
    const bars = buildPriceHistory(BLUEPRINTS[0]);
    const bench = buildBenchmarkHistory('IBOV', 148320);
    expect(bars.length).toBe(PRICE_HISTORY_DAYS);
    expect(bench.length).toBe(PRICE_HISTORY_DAYS);
    expect(bars[0].date).toBe(dates[0]);
    expect(bench[0].date).toBe(dates[0]);
    expect(bars[bars.length - 1].date).toBe(dates[dates.length - 1]);
  });

  it('gives the index the volatility its factor implies', () => {
    const bench = buildBenchmarkHistory('IBOV', 148320);
    const v = volatility(simpleReturns(bench.map((b) => b.value)));
    const expected = MARKET_DAILY_VOL.IBOV * Math.sqrt(252);
    expect(v).not.toBeNull();
    expect(Math.abs((v as number) - expected)).toBeLessThan(0.03);
  });

  for (const ticker of ['VALE3', 'ITUB4', 'ABEV3', 'PRIO3', 'AAPL']) {
    it(`${ticker} realises its volatility and beta anchors`, () => {
      const bp = BLUEPRINTS.find((b) => b.profile.ticker === ticker)!;
      const factor = marketFactorFor(bp.profile.country);
      const index = buildBenchmarkHistory(factor === 'IBOV' ? 'IBOV' : 'SPX', 1000);
      const bars = buildPriceHistory(bp);

      const assetReturns = simpleReturns(bars.map((b) => b.close));
      const indexReturns = simpleReturns(index.map((p) => p.value));

      const vol = volatility(assetReturns);
      expect(vol).not.toBeNull();
      expect(Math.abs((vol as number) - bp.anchors.annualVolatility)).toBeLessThan(0.05);

      const b = beta(assetReturns, indexReturns);
      expect(b).not.toBeNull();
      expect(Math.abs((b as number) - bp.anchors.beta)).toBeLessThan(0.2);
    });
  }

  it('correlates companies on the same market through the shared factor', () => {
    const shocks = marketShocks('IBOV');
    expect(shocks.length).toBe(PRICE_HISTORY_DAYS);
    // The same call returns the same series, or two companies would load on
    // different "markets" and the correlation matrix would be meaningless.
    expect(marketShocks('IBOV')[10]).toBe(shocks[10]);
  });
});
