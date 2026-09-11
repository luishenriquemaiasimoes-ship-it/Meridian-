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
