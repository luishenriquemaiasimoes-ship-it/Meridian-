import { describe, expect, it } from 'vitest';
import {
  bottomUpBeta, buildWaccInstitutional, diffWaccBuilds, fisherNominal, fisherReal,
  type WaccBuildInput,
} from '@/lib/finance/waccBuilder';
import { leveredBeta, unleveredBeta } from '@/lib/finance/wacc';

const src = (value: number, source = 'test') => ({ value, source, asOf: '2026-09-10' });

function baseInput(over: Partial<WaccBuildInput> = {}): WaccBuildInput {
  return {
    currency: 'BRL',
    erpIsDevelopedMarket: true,
    riskFree: { value: 0.1180, source: 'NTN-F 2033', asOf: '2026-09-10', basis: 'NOMINAL', instrument: 'NTN-F' },
    equityRiskPremium: src(0.055, 'Damodaran, July 2026'),
    countryRiskPremium: src(0.021, 'EMBI+ Brazil'),
    betaMethod: 'OBSERVED',
    observedBeta: { value: 1.15, source: 'Regression vs IBOV', asOf: '2026-09-10', window: '5y weekly', benchmark: 'IBOV' },
    costOfDebt: { value: 0.125, source: 'Weighted average in note 18', asOf: '2026-06-30', basis: 'REPORTED' },
    taxRate: src(0.34, 'Statutory IRPJ + CSLL'),
    marketValueEquity: { value: 262_180, source: 'Market price x shares', asOf: '2026-09-10' },
    debt: { value: 60_840, source: 'Balance sheet 2Q26', asOf: '2026-06-30', basis: 'NET_DEBT' },
    rationale: 'Observed beta over five years covers a full commodity cycle.',
    ...over,
  };
}

describe('Fisher conversion', () => {
  it('converts a real rate to nominal', () => {
    // (1.0642)(1.0418) - 1 = 0.10868356
    expect(fisherNominal(0.0642, 0.0418)).toBeCloseTo(0.10868356, 8);
  });

  it('round-trips', () => {
    const nominal = fisherNominal(0.0642, 0.0418) as number;
    expect(fisherReal(nominal, 0.0418)).toBeCloseTo(0.0642, 10);
  });

  it('returns null on a missing input', () => {
    expect(fisherNominal(0.06, NaN)).toBeNull();
    expect(fisherReal(NaN, 0.04)).toBeNull();
  });
});

describe('Hamada', () => {
  it('unlevers and relevers back to the original', () => {
    const bu = unleveredBeta(1.32, 0.45, 0.34) as number;
    expect(bu).toBeCloseTo(1.32 / (1 + 0.66 * 0.45), 10);
    expect(leveredBeta(bu, 0.45, 0.34)).toBeCloseTo(1.32, 10);
  });

  it('takes the median of the peer set, not the mean', () => {
    // One peer with an extreme structure must not set the sector beta.
    const peers = [
      { ticker: 'A', leveredBeta: 1.0, debtToEquity: 0.2, taxRate: 0.34 },
      { ticker: 'B', leveredBeta: 1.1, debtToEquity: 0.25, taxRate: 0.34 },
      { ticker: 'C', leveredBeta: 4.0, debtToEquity: 3.0, taxRate: 0.34 },
    ];
    const { unleveredMedian, perPeer } = bottomUpBeta(peers, 0.3, 0.34);
    const unlevered = perPeer.map((p) => p.unlevered as number).sort((a, b) => a - b);
    expect(unleveredMedian).toBeCloseTo(unlevered[1], 10);
    const mean = unlevered.reduce((s, v) => s + v, 0) / 3;
    expect(unleveredMedian).not.toBeCloseTo(mean, 3);
  });

  it('relevers to the subject structure', () => {
    const peers = [{ ticker: 'A', leveredBeta: 1.2, debtToEquity: 0.5, taxRate: 0.34 }];
    const { unleveredMedian, relevered } = bottomUpBeta(peers, 0.8, 0.34);
    expect(relevered).toBeCloseTo(leveredBeta(unleveredMedian as number, 0.8, 0.34) as number, 10);
  });

  it('reports no beta from an empty peer set rather than zero', () => {
    const { unleveredMedian, relevered } = bottomUpBeta([], 0.5, 0.34);
    expect(unleveredMedian).toBeNull();
    expect(relevered).toBeNull();
  });
});

describe('WACC build', () => {
  it('computes Ke, Kd and the weights from market values', () => {
    const r = buildWaccInstitutional(baseInput());
    // Ke = 11.80% + 1.15 x 5.5% + 2.1% = 20.225%
    expect(r.costOfEquity).toBeCloseTo(0.20225, 6);
    expect(r.costOfDebtAfterTax).toBeCloseTo(0.125 * 0.66, 10);
    const total = 262_180 + 60_840;
    expect(r.equityWeight).toBeCloseTo(262_180 / total, 10);
    expect(r.debtWeight).toBeCloseTo(60_840 / total, 10);
    expect(r.wacc).toBeCloseTo(
      (262_180 / total) * 0.20225 + (60_840 / total) * 0.125 * 0.66,
      10,
    );
  });

  it('converts an inflation-linked risk-free rate and says it did', () => {
    const r = buildWaccInstitutional(baseInput({
      riskFree: { value: 0.0642, source: 'NTN-B 2035', asOf: '2026-09-10', basis: 'REAL', inflation: 0.0418, instrument: 'NTN-B' },
    }));
    expect(r.riskFreeConverted).toBe(true);
    expect(r.riskFreeAsSupplied).toBe(0.0642);
    expect(r.riskFreeNominal).toBeCloseTo(0.10868356, 8);
    expect(r.checks.find((c) => c.id === 'rf-converted')).toBeTruthy();
  });

  it('refuses to guess when a real rate has no inflation assumption', () => {
    const r = buildWaccInstitutional(baseInput({
      riskFree: { value: 0.0642, source: 'NTN-B 2035', asOf: null, basis: 'REAL', instrument: 'NTN-B' },
    }));
    expect(r.riskFreeNominal).toBeNull();
    expect(r.costOfEquity).toBeNull();
    expect(r.checks.find((c) => c.id === 'rf-real-no-inflation')?.severity).toBe('ERROR');
  });

  it('warns when a local-currency model carries no country premium', () => {
    const r = buildWaccInstitutional(baseInput({ countryRiskPremium: null }));
    const check = r.checks.find((c) => c.id === 'crp-missing');
    expect(check?.severity).toBe('WARNING');
    // A warning, never a block: the analyst may have a reason.
    expect(r.wacc).not.toBeNull();
  });

  it('does not ask for a country premium in a developed-market model', () => {
    const r = buildWaccInstitutional(baseInput({ currency: 'USD', countryRiskPremium: null }));
    expect(r.checks.find((c) => c.id === 'crp-missing')).toBeUndefined();
  });

  it('does not ask for a country premium when the ERP is already local', () => {
    const r = buildWaccInstitutional(baseInput({ erpIsDevelopedMarket: false, countryRiskPremium: null }));
    expect(r.checks.find((c) => c.id === 'crp-missing')).toBeUndefined();
  });

  it('shows both beta methods side by side and reports the gap', () => {
    const r = buildWaccInstitutional(baseInput({
      peerBetas: [
        { ticker: 'A', leveredBeta: 0.90, debtToEquity: 0.30, taxRate: 0.34 },
        { ticker: 'B', leveredBeta: 0.95, debtToEquity: 0.35, taxRate: 0.34 },
        { ticker: 'C', leveredBeta: 1.00, debtToEquity: 0.40, taxRate: 0.34 },
      ],
    }));
    expect(r.beta.observed).toBe(1.15);
    expect(r.beta.bottomUp).not.toBeNull();
    expect(r.beta.peerCount).toBe(3);
    expect(r.beta.used).toBe(1.15);
    expect(r.beta.usedMethod).toBe('OBSERVED');
    expect(r.beta.spread).toBeCloseTo(1.15 - (r.beta.bottomUp as number), 10);
    expect(r.checks.find((c) => c.id === 'beta-divergence')).toBeTruthy();
  });

  it('uses the bottom-up beta when that method is selected', () => {
    const r = buildWaccInstitutional(baseInput({
      betaMethod: 'BOTTOM_UP',
      peerBetas: [
        { ticker: 'A', leveredBeta: 1.10, debtToEquity: 0.30, taxRate: 0.34 },
        { ticker: 'B', leveredBeta: 1.15, debtToEquity: 0.35, taxRate: 0.34 },
        { ticker: 'C', leveredBeta: 1.20, debtToEquity: 0.40, taxRate: 0.34 },
      ],
      targetDebtToEquity: 0.35,
    }));
    expect(r.beta.usedMethod).toBe('BOTTOM_UP');
    expect(r.beta.used).toBe(r.beta.bottomUp);
    expect(r.beta.releveredAt).toBe(0.35);
  });

  it('flags a bottom-up beta resting on fewer than three peers', () => {
    const r = buildWaccInstitutional(baseInput({
      betaMethod: 'BOTTOM_UP',
      peerBetas: [{ ticker: 'A', leveredBeta: 1.1, debtToEquity: 0.3, taxRate: 0.34 }],
    }));
    expect(r.checks.find((c) => c.id === 'beta-thin-peers')?.severity).toBe('WARNING');
  });

  it('flags a capital structure far from the declared target', () => {
    const r = buildWaccInstitutional(baseInput({ targetEquityWeight: 0.55 }));
    expect(r.checks.find((c) => c.id === 'structure-drift')?.severity).toBe('WARNING');
  });

  it('flags a cost of debt below the risk-free rate', () => {
    const r = buildWaccInstitutional(baseInput({
      costOfDebt: { value: 0.08, source: 'Subsidised credit line', asOf: null, basis: 'REPORTED' },
    }));
    expect(r.checks.find((c) => c.id === 'kd-below-rf')?.severity).toBe('WARNING');
  });

  it('asks for a rationale when none is recorded', () => {
    const r = buildWaccInstitutional(baseInput({ rationale: null }));
    expect(r.checks.find((c) => c.id === 'no-rationale')?.severity).toBe('WARNING');
  });

  it('carries a source on every component', () => {
    const r = buildWaccInstitutional(baseInput());
    for (const c of r.components) {
      expect(typeof c.source).toBe('string');
    }
    expect(r.components.find((c) => c.key === 'rf')?.source).toBe('NTN-F 2033');
    expect(r.components.find((c) => c.key === 'erp')?.source).toContain('Damodaran');
  });

  it('reports no WACC rather than a partial one when an input is missing', () => {
    const r = buildWaccInstitutional(baseInput({
      marketValueEquity: { value: NaN, source: '', asOf: null },
    }));
    expect(r.wacc).toBeNull();
    expect(r.checks.find((c) => c.id === 'equity-missing')?.severity).toBe('ERROR');
  });
});

describe('WACC diff', () => {
  it('names the component that moved the WACC', () => {
    const before = buildWaccInstitutional(baseInput({
      riskFree: { value: 0.0642, source: 'NTN-B 2035', asOf: null, basis: 'REAL', inflation: 0.0418, instrument: 'NTN-B' },
    }));
    const after = buildWaccInstitutional(baseInput());
    const { rows, waccDelta } = diffWaccBuilds(before, after);
    expect(rows.find((r) => r.key === 'rf')).toBeTruthy();
    expect(waccDelta).not.toBeNull();
    expect(waccDelta).toBeCloseTo((after.wacc as number) - (before.wacc as number), 12);
  });

  it('returns nothing to compare against on a first build', () => {
    const { rows, waccDelta } = diffWaccBuilds(null, buildWaccInstitutional(baseInput()));
    expect(rows).toEqual([]);
    expect(waccDelta).toBeNull();
  });
});

describe('sovereign spread double counting', () => {
  // A Brazilian model built from an NTN-F yield plus an EMBI+ spread charges
  // the country twice: the spread is already inside the government's own bond.
  const base = {
    currency: 'BRL',
    erpIsDevelopedMarket: true,
    riskFree: { value: 0.1218, source: 'NTN-F 2033', asOf: null, basis: 'NOMINAL' as const, inflation: null, instrument: 'NTN-F 2033' },
    equityRiskPremium: { value: 0.046, source: 'mature market', asOf: null },
    countryRiskPremium: { value: 0.0208, source: 'EMBI+ Brazil', asOf: null },
    betaMethod: 'OBSERVED' as const,
    // Above the 0.80 beta floor on purpose: this case is about the sovereign
    // spread, and a floored beta would make the arithmetic test two things.
    observedBeta: { value: 1.10, source: 'regression', asOf: null, window: '3y daily', benchmark: 'IBOV' },
    peerBetas: [],
    targetDebtToEquity: 0.5,
    costOfDebt: { value: 0.1228, source: 'implied', asOf: null, basis: 'REPORTED' as const },
    taxRate: { value: 0.26, source: 'effective', asOf: null },
  };

  it('removes the spread once when the risk-free is that sovereign\'s own bond', () => {
    const built = buildWaccInstitutional({ ...base, riskFreeIsLocalSovereign: true } as never);
    // 12.18% - 2.08% = 10.10% risk-free, then + 1.10 x 4.60% + 2.08%
    expect(built.costOfEquity as number).toBeCloseTo(0.1010 + 1.10 * 0.046 + 0.0208, 6);
    expect(built.checks.map((c) => c.id)).toContain('rf-sovereign-spread-removed');
  });

  it('leaves the risk-free alone when it is not the same sovereign', () => {
    // A US Treasury risk-free with a Brazil premium is the global construction
    // and carries no overlap, so nothing should be stripped.
    const built = buildWaccInstitutional({ ...base, riskFreeIsLocalSovereign: false } as never);
    expect(built.costOfEquity as number).toBeCloseTo(0.1218 + 1.10 * 0.046 + 0.0208, 6);
    expect(built.checks.map((c) => c.id)).not.toContain('rf-sovereign-spread-removed');
  });

  it('costs exactly the sovereign spread', () => {
    const withFix = buildWaccInstitutional({ ...base, riskFreeIsLocalSovereign: true } as never);
    const without = buildWaccInstitutional({ ...base, riskFreeIsLocalSovereign: false } as never);
    expect((without.costOfEquity as number) - (withFix.costOfEquity as number)).toBeCloseTo(0.0208, 8);
  });
});

describe('the beta floor', () => {
  const base = {
    currency: 'USD',
    erpIsDevelopedMarket: true,
    riskFree: { value: 0.0412, source: 'US10Y', asOf: null, basis: 'NOMINAL' as const, inflation: null, instrument: 'US 10Y' },
    equityRiskPremium: { value: 0.046, source: 'mature market', asOf: null },
    countryRiskPremium: null,
    betaMethod: 'OBSERVED' as const,
    peerBetas: [],
    targetDebtToEquity: 0.5,
    costOfDebt: { value: 0.05, source: 'implied', asOf: null, basis: 'REPORTED' as const },
    taxRate: { value: 0.21, source: 'statutory', asOf: null },
  };

  it('lifts a defensive beta to the floor and says so', () => {
    // A 0.4 beta returns a cost of equity below the company's own dividend
    // yield, which cannot be the required return on a levered equity.
    const built = buildWaccInstitutional({
      ...base,
      observedBeta: { value: 0.40, source: 'regression', asOf: null, window: '3y daily', benchmark: 'SPX' },
    } as never);
    expect(built.costOfEquity as number).toBeCloseTo(0.0412 + 0.8 * 0.046, 6);
    expect(built.checks.map((c) => c.id)).toContain('beta-floored');
  });

  it('leaves a beta above the floor exactly where the regression put it', () => {
    const built = buildWaccInstitutional({
      ...base,
      observedBeta: { value: 1.25, source: 'regression', asOf: null, window: '3y daily', benchmark: 'SPX' },
    } as never);
    expect(built.costOfEquity as number).toBeCloseTo(0.0412 + 1.25 * 0.046, 6);
    expect(built.checks.map((c) => c.id)).not.toContain('beta-floored');
  });
});

describe('which beta a company is discounted at', () => {
  /* A regression beta is one stock against one index over one window, and it
     carries the noise of all three. Re-levering a peer median to the company's
     own capital structure keeps the business risk and drops most of that noise,
     which is why it is the institutional default. But the median needs peers to
     be a median, and the choice has to reflect that. */
  const peer = (ticker: string, leveredBeta: number) => ({
    ticker, leveredBeta, debtToEquity: 0.4, taxRate: 0.34,
  });

  it('separates a noisy regression from the risk of the business it measures', () => {
    // Tesla's observed beta came out near two, which put a 13.2% cost of
    // capital on a carmaker. Its peers do not carry that.
    const peers = [peer('F', 1.05), peer('GM', 1.10), peer('TM', 0.95), peer('RIVN', 1.20)];
    const { relevered } = bottomUpBeta(peers, 0.4, 0.34);
    expect(relevered).not.toBeNull();
    expect(relevered as number).toBeLessThan(1.9);
    expect(relevered as number).toBeGreaterThan(0.8);
  });

  it('keeps both figures visible whichever one is used', () => {
    // The analyst has to be able to see what the choice cost: the comparison
    // stays on the screen either way.
    const peers = [peer('A', 1.05), peer('B', 1.10), peer('C', 0.95)];
    for (const method of ['OBSERVED', 'BOTTOM_UP'] as const) {
      const r = buildWaccInstitutional({
        ...baseInput(),
        betaMethod: method,
        observedBeta: { value: 1.9, source: 'Regression', asOf: null },
        peerBetas: peers,
        targetDebtToEquity: 0.4,
      });
      expect(r.beta.observed).toBe(1.9);
      expect(r.beta.bottomUp).not.toBeNull();
      expect(r.beta.spread).toBeCloseTo(1.9 - (r.beta.bottomUp as number), 10);
      expect(r.beta.usedMethod).toBe(method);
    }
  });

  it('says so when a bottom-up beta rests on too few peers to be a median', () => {
    // Below three the median is not measuring much, and the service falls back
    // to the company's own regression as the better of two weak estimates.
    const r = buildWaccInstitutional({
      ...baseInput(),
      betaMethod: 'BOTTOM_UP',
      observedBeta: { value: 1.2, source: 'Regression', asOf: null },
      peerBetas: [peer('A', 1.05), peer('B', 1.10)],
      targetDebtToEquity: 0.4,
    });
    expect(r.beta.peerCount).toBeLessThan(3);
    expect(r.checks.some((c) => /peer/i.test(c.title) || /peer/i.test(c.detail))).toBe(true);
  });
});
