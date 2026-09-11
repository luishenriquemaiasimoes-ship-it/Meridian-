import { describe, expect, it } from 'vitest';
import {
  impliedGrowthFromMultiple, impliedMultipleFromGordon, reconcileTerminalValue,
} from '@/lib/finance/terminalValue';
import { reconcileWithConsensus, validatePremises } from '@/lib/finance/consensus';
import { gordonTerminalValue, calculateDcf } from '@/lib/finance/dcf';
import {
  aggregateUnits, buildSegmentUnits, checkSegmentCoverage, valueExpiringWithin, valueUnit,
  clearExtensions, listExtensions, registerExtension, suggestExtensions,
  type AggregationContext, type CashFlowUnit,
} from '@/lib/finance/extensions';
import { normalizeAssumptions } from '@/lib/finance/dcf';
import { requiredDcfInputs, verifyInputs } from '@/lib/finance/provenance';

describe('terminal value reconciliation', () => {
  it('derives the multiple a perpetuity implies', () => {
    const tv = gordonTerminalValue(100, 0.11, 0.03) as number;
    expect(impliedMultipleFromGordon(100, 400, 0.11, 0.03)).toBeCloseTo(tv / 400, 10);
  });

  it('derives the growth an exit multiple implies, and round-trips', () => {
    const g = impliedGrowthFromMultiple(100, 400, 0.11, 8) as number;
    // Feeding that growth back into Gordon must reproduce the exit value.
    expect(gordonTerminalValue(100, 0.11, g)).toBeCloseTo(400 * 8, 6);
  });

  it('reports a material gap between the two methods', () => {
    const r = reconcileTerminalValue({
      // Gordon gives 1287.5; an 8x exit gives 3200.
      finalFcff: 100, finalEbitda: 400, wacc: 0.11, terminalGrowth: 0.03, exitMultiple: 8,
    });
    expect(r.divergence).toBeGreaterThan(0.25);
    expect(r.findings.find((f) => f.title.includes('disagree'))).toBeTruthy();
  });

  it('rejects growth at or above the discount rate', () => {
    const r = reconcileTerminalValue({
      finalFcff: 100, finalEbitda: 400, wacc: 0.10, terminalGrowth: 0.10, exitMultiple: 8,
    });
    expect(r.gordonValue).toBeNull();
    expect(r.findings.find((f) => f.severity === 'ERROR')).toBeTruthy();
  });

  it('flags an exit multiple implying growth above the economy', () => {
    const r = reconcileTerminalValue({
      finalFcff: 100, finalEbitda: 400, wacc: 0.11, terminalGrowth: 0.03,
      exitMultiple: 12, longRunNominalGrowth: 0.05,
    });
    expect(r.impliedGrowthFromMultiple).toBeGreaterThan(0.05);
    expect(r.findings.find((f) => f.title.includes('above the economy'))).toBeTruthy();
  });

  it('flags a perpetuity implying a multiple far from the peer set', () => {
    const r = reconcileTerminalValue({
      // 8% perpetual growth at an 11% discount rate implies a 9.0x exit.
      finalFcff: 100, finalEbitda: 400, wacc: 0.11, terminalGrowth: 0.08,
      exitMultiple: 8, peerMedianExitMultiple: 5,
    });
    expect(r.findings.find((f) => f.title.includes('far from the peer set'))).toBeTruthy();
  });

  it('reports nothing rather than guessing when an input is missing', () => {
    const r = reconcileTerminalValue({
      finalFcff: null, finalEbitda: 400, wacc: 0.11, terminalGrowth: 0.03, exitMultiple: 8,
    });
    expect(r.gordonValue).toBeNull();
    expect(r.impliedMultipleFromGordon).toBeNull();
    expect(r.exitMultipleValue).toBe(3200);
  });
});

describe('terminal value share of enterprise value', () => {
  it('warns above three quarters', () => {
    const r = calculateDcf({
      baseYear: 2025, baseRevenue: 1000, sharesOutstanding: 100,
      revenueGrowth: [0.02, 0.02, 0.02], ebitdaMargin: [0.2, 0.2, 0.2],
      daPctRevenue: [0.05], capexPctRevenue: [0.05], nwcPctRevenue: [0.1],
      taxRate: 0.34, wacc: 0.09, terminalMethod: 'GORDON', terminalGrowth: 0.035,
      netDebt: 0,
    });
    expect(r.terminalValuePctOfEv).toBeGreaterThan(0.75);
    expect(r.warnings.find((w) => w.includes('Terminal value is'))).toBeTruthy();
  });
});

describe('consensus reconciliation', () => {
  const targets = [
    { source: 'Broker A', targetPrice: 70 },
    { source: 'Broker B', targetPrice: 75 },
    { source: 'Broker C', targetPrice: 80 },
    { source: 'Broker D', targetPrice: 90 },
  ];

  it('places a target inside the range', () => {
    const r = reconcileWithConsensus(78, targets, 62);
    expect(r.position).toBe('WITHIN');
    expect(r.low).toBe(70);
    expect(r.high).toBe(90);
    expect(r.median).toBeCloseTo(77.5, 10);
    expect(r.modelUpside).toBeCloseTo(78 / 62 - 1, 10);
    expect(r.consensusUpside).toBeCloseTo(77.5 / 62 - 1, 10);
    expect(r.needsRationale).toBe(false);
  });

  it('marks a target above every contributor and asks for a reason', () => {
    const r = reconcileWithConsensus(110, targets, 62);
    expect(r.position).toBe('ABOVE');
    expect(r.needsRationale).toBe(true);
    expect(r.summary).toContain('needs a reason');
  });

  it('marks a target below every contributor', () => {
    const r = reconcileWithConsensus(50, targets, 62);
    expect(r.position).toBe('BELOW');
    expect(r.needsRationale).toBe(true);
  });

  it('says so when nothing is on record rather than inventing a range', () => {
    const r = reconcileWithConsensus(78, [], 62);
    expect(r.position).toBe('UNAVAILABLE');
    expect(r.median).toBeNull();
    expect(r.summary).toContain('No sell-side targets');
  });
});

describe('premise validation', () => {
  it('measures the deviation in basis points', () => {
    const r = validatePremises(
      { ebitdaMargin: 0.24 },
      [{ period: '2Q26', values: { ebitdaMargin: 0.228 } }],
    );
    const check = r.checks.find((c) => c.key === 'ebitdaMargin');
    expect(check?.deviationBps).toBeCloseTo(-120, 6);
    expect(check?.status).toBe('BELOW');
  });

  it('treats a small miss as on track', () => {
    const r = validatePremises(
      { ebitdaMargin: 0.24 },
      [{ period: '2Q26', values: { ebitdaMargin: 0.2405 } }],
    );
    expect(r.checks.find((c) => c.key === 'ebitdaMargin')?.status).toBe('ON_TRACK');
  });

  it('raises a persistent breach only after two periods in the same direction', () => {
    const one = validatePremises({ ebitdaMargin: 0.24 }, [
      { period: '1Q26', values: { ebitdaMargin: 0.242 } },
      { period: '2Q26', values: { ebitdaMargin: 0.225 } },
    ]);
    expect(one.persistentBreaches).toHaveLength(0);

    const two = validatePremises({ ebitdaMargin: 0.24 }, [
      { period: '1Q26', values: { ebitdaMargin: 0.226 } },
      { period: '2Q26', values: { ebitdaMargin: 0.225 } },
    ]);
    expect(two.persistentBreaches[0]?.key).toBe('ebitdaMargin');
    expect(two.persistentBreaches[0]?.periods).toBe(2);
    expect(two.persistentBreaches[0]?.averageBps).toBeLessThan(0);
  });

  it('does not count a breach that reversed direction', () => {
    const r = validatePremises({ ebitdaMargin: 0.24 }, [
      { period: '1Q26', values: { ebitdaMargin: 0.26 } },
      { period: '2Q26', values: { ebitdaMargin: 0.22 } },
    ]);
    expect(r.persistentBreaches).toHaveLength(0);
  });

  it('reports a premise with no reported figure as unavailable', () => {
    const r = validatePremises({ capexPctRevenue: 0.13 }, [{ period: '2Q26', values: {} }]);
    expect(r.checks.find((c) => c.key === 'capexPctRevenue')?.status).toBe('UNAVAILABLE');
  });
});

/* --------------------------- Sector extensions -------------------------- */

const CTX: AggregationContext = {
  wacc: 0.11, netDebt: 0, minorityInterest: 0, sharesOutstanding: 100,
  currentPrice: 10, baseYear: 2025, terminalGrowth: 0.03,
};

function unit(over: Partial<CashFlowUnit> = {}): CashFlowUnit {
  return {
    id: 'u1', name: 'Unit 1', kind: 'Contract',
    startYear: 2026, endYear: null, ownership: 1,
    cashFlows: [2026, 2027, 2028].map((year) => ({ year, revenue: 100, ebitda: 30, capex: 5, fcff: 20 })),
    ...over,
  };
}

describe('cash-flow units', () => {
  it('gives an indefinite-life unit a terminal value', () => {
    const v = valueUnit(unit(), CTX);
    expect(v.terminalValue).not.toBeNull();
    expect(v.remainingYears).toBeNull();
  });

  it('gives a finite-life unit no terminal value', () => {
    // A contract that ends is worth its remaining cash flows and nothing more.
    const v = valueUnit(unit({ endYear: 2028 }), CTX);
    expect(v.terminalValue).toBeNull();
    expect(v.remainingYears).toBe(3);
    expect(v.enterpriseValue).toBeCloseTo(v.presentValue as number, 10);
  });

  it('drops cash flows falling after the unit ends, and says so', () => {
    const v = valueUnit(unit({ endYear: 2027 }), CTX);
    expect(v.warnings.find((w) => w.includes('after this unit ends'))).toBeTruthy();
    const expected = 20 / 1.11 + 20 / 1.11 ** 2;
    expect(v.presentValue).toBeCloseTo(expected, 10);
  });

  it('contributes nothing from a unit that already expired', () => {
    const v = valueUnit(unit({ endYear: 2024 }), CTX);
    expect(v.presentValue).toBeNull();
    expect(v.remainingYears).toBe(0);
    expect(v.warnings.find((w) => w.includes('contributes nothing'))).toBeTruthy();
  });

  it('scales by the ownership share', () => {
    const full = valueUnit(unit({ endYear: 2028 }), CTX);
    const half = valueUnit(unit({ endYear: 2028, ownership: 0.5 }), CTX);
    expect(half.enterpriseValue).toBeCloseTo((full.enterpriseValue as number) * 0.5, 10);
  });

  it('uses a unit-level discount rate when one is given', () => {
    const base = valueUnit(unit({ endYear: 2028 }), CTX);
    const riskier = valueUnit(unit({ endYear: 2028, wacc: 0.18 }), CTX);
    expect(riskier.presentValue).toBeLessThan(base.presentValue as number);
  });
});

describe('aggregation', () => {
  const units = [
    unit({ id: 'a', name: 'A', endYear: 2028, netDebt: 100 }),
    unit({ id: 'b', name: 'B', endYear: 2030, netDebt: 50, cashFlows: [2026, 2027, 2028, 2029, 2030].map((year) => ({ year, revenue: 80, ebitda: 24, capex: 4, fcff: 16 })) }),
  ];

  it('consolidates by netting group debt once', () => {
    const r = aggregateUnits(units, 'CONSOLIDATED', { ...CTX, netDebt: 150 });
    expect(r.method).toBe('CONSOLIDATED');
    expect(r.equityValue).toBeCloseTo((r.enterpriseValue as number) - 150, 10);
  });

  it('sums the parts by netting each unit’s own debt', () => {
    const r = aggregateUnits(units, 'SOTP', { ...CTX, netDebt: 150 });
    const sumOfUnitEquity = r.units.reduce((s, u) => s + (u.equityValue as number), 0);
    expect(r.equityValue).toBeCloseTo(sumOfUnitEquity, 10);
    // Group debt is not deducted a second time.
    expect(r.equityValue).not.toBeCloseTo((r.enterpriseValue as number) - 150 - 150, 6);
  });

  it('warns when a sum of the parts has group debt with nothing allocated', () => {
    const noDebt = units.map((u) => ({ ...u, netDebt: null }));
    const r = aggregateUnits(noDebt, 'SOTP', { ...CTX, netDebt: 150 });
    expect(r.warnings.find((w) => w.includes('not deducted'))).toBeTruthy();
  });

  it('excludes an unvaluable unit rather than counting it as zero', () => {
    const broken = [...units, unit({ id: 'c', name: 'C', wacc: 0 })];
    const r = aggregateUnits(broken, 'CONSOLIDATED', CTX);
    const clean = aggregateUnits(units, 'CONSOLIDATED', CTX);
    expect(r.enterpriseValue).toBeCloseTo(clean.enterpriseValue as number, 10);
    expect(r.warnings.find((w) => w.includes('excluded from the total'))).toBeTruthy();
  });

  it('reports each unit’s share of value', () => {
    const r = aggregateUnits(units, 'CONSOLIDATED', CTX);
    const total = r.contributions.reduce((s, c) => s + (c.share ?? 0), 0);
    expect(total).toBeCloseTo(1, 10);
  });

  it('measures how much value expires inside a window', () => {
    const r = aggregateUnits(units, 'CONSOLIDATED', CTX);
    const within3 = valueExpiringWithin(r, 2025, 3);
    const within5 = valueExpiringWithin(r, 2025, 5);
    expect(within3).toBeGreaterThan(0);
    expect(within5).toBeCloseTo(1, 10);
  });
});

describe('segment units', () => {
  const assumptions = normalizeAssumptions({
    baseYear: 2025, baseRevenue: 1000, sharesOutstanding: 100,
    revenueGrowth: [0.05, 0.05, 0.05], ebitdaMargin: [0.25, 0.25, 0.25],
    daPctRevenue: [0.05], capexPctRevenue: [0.06], nwcPctRevenue: [0.1],
    taxRate: 0.34, wacc: 0.11,
  });

  it('splits base revenue by the declared shares', () => {
    const units = buildSegmentUnits(assumptions, [
      { name: 'Core', revenueShare: 0.7 },
      { name: 'Adjacent', revenueShare: 0.3 },
    ]);
    expect(units).toHaveLength(2);
    expect(units[0].cashFlows[0].revenue).toBeCloseTo(1000 * 0.7 * 1.05, 10);
    expect(units[1].cashFlows[0].revenue).toBeCloseTo(1000 * 0.3 * 1.05, 10);
  });

  it('applies a per-segment override over the model premise', () => {
    const units = buildSegmentUnits(assumptions, [
      { name: 'Core', revenueShare: 1, ebitdaMargin: 0.4 },
    ]);
    const y1 = units[0].cashFlows[0];
    expect((y1.ebitda as number) / (y1.revenue as number)).toBeCloseTo(0.4, 10);
  });

  it('zeroes a segment past its final year', () => {
    const units = buildSegmentUnits(assumptions, [
      { name: 'Expiring', revenueShare: 1, endYear: 2027 },
    ]);
    expect(units[0].cashFlows[1].fcff).not.toBe(0);
    expect(units[0].cashFlows[2].year).toBe(2028);
    expect(units[0].cashFlows[2].fcff).toBe(0);
    expect(units[0].endYear).toBe(2027);
  });

  it('warns when the segments do not account for the whole company', () => {
    expect(checkSegmentCoverage([{ name: 'A', revenueShare: 0.6 }]).warning).toContain('not valued anywhere');
    expect(checkSegmentCoverage([{ name: 'A', revenueShare: 0.7 }, { name: 'B', revenueShare: 0.5 }]).warning)
      .toContain('counted twice');
    expect(checkSegmentCoverage([{ name: 'A', revenueShare: 0.6 }, { name: 'B', revenueShare: 0.4 }]).warning)
      .toBeNull();
  });
});

describe('extension registry', () => {
  it('ships with no industry built in', () => {
    clearExtensions();
    expect(listExtensions()).toEqual([]);
  });

  it('registers, suggests and removes an extension', () => {
    clearExtensions();
    registerExtension({
      id: 'test-ext',
      name: 'Test extension',
      description: 'For the test.',
      appliesWhen: (c) => c.segments.length > 1,
    });
    expect(listExtensions()).toHaveLength(1);
    const many = { ticker: 'X', sector: null, industry: null, country: null, currency: 'BRL', segments: ['a', 'b'], tags: [] };
    const one = { ...many, segments: ['a'] };
    expect(suggestExtensions(many)).toHaveLength(1);
    // Matching means "offer", and not matching means the generic model stands.
    expect(suggestExtensions(one)).toHaveLength(0);
    clearExtensions();
    expect(listExtensions()).toEqual([]);
  });

  it('does not let a throwing matcher break the suggestion list', () => {
    clearExtensions();
    registerExtension({
      id: 'bad', name: 'Bad', description: '',
      appliesWhen: () => { throw new Error('boom'); },
    });
    expect(suggestExtensions({ ticker: 'X', sector: null, industry: null, country: null, currency: 'BRL', segments: [], tags: [] }))
      .toEqual([]);
    clearExtensions();
  });
});

/* ----------------------------- Provenance ------------------------------- */

describe('source verification', () => {
  const asOf = '2026-09-10';
  const required = requiredDcfInputs({
    riskFree: 0.118, equityRiskPremium: 0.055, beta: 1.15, costOfDebt: 0.125,
    taxRate: 0.34, marketValueEquity: 262180, debt: 60840, baseRevenue: 205000,
    revenueGrowth: [0.036], ebitdaMargin: [0.4155], terminalGrowth: 0.03,
    netDebt: 60840, sharesOutstanding: 4270,
  });

  it('marks an input with a primary source as verified', () => {
    const r = verifyInputs(
      required,
      [{ path: 'wacc.riskFree', label: 'Risk-free rate', kind: 'MARKET', reference: 'NTN-F 2033', asOf: '2026-09-09' }],
      asOf,
    );
    expect(r.rows.find((x) => x.path === 'wacc.riskFree')?.status).toBe('VERIFIED');
  });

  it('separates the analyst’s own estimate from a filing', () => {
    const r = verifyInputs(
      required,
      [
        { path: 'forecast.ebitdaMargin', label: 'Margin', kind: 'MANUAL', reference: 'Analyst estimate' },
        { path: 'forecast.baseRevenue', label: 'Revenue', kind: 'FILING', reference: '2Q26 ITR' },
      ],
      asOf,
    );
    expect(r.rows.find((x) => x.path === 'forecast.ebitdaMargin')?.status).toBe('ASSERTED');
    expect(r.rows.find((x) => x.path === 'forecast.baseRevenue')?.status).toBe('VERIFIED');
  });

  it('marks a market observation past the staleness window', () => {
    const r = verifyInputs(
      required,
      [{ path: 'wacc.riskFree', label: 'Rf', kind: 'MARKET', reference: 'NTN-F', asOf: '2026-01-02' }],
      asOf,
    );
    const row = r.rows.find((x) => x.path === 'wacc.riskFree');
    expect(row?.status).toBe('STALE');
    expect(row?.ageDays).toBeGreaterThan(90);
  });

  it('marks simulated data as simulated, never as verified', () => {
    const r = verifyInputs(
      required,
      [{ path: 'forecast.baseRevenue', label: 'Revenue', kind: 'MOCK', reference: 'MockMarketDataProvider', asOf }],
      asOf,
    );
    expect(r.rows.find((x) => x.path === 'forecast.baseRevenue')?.status).toBe('SIMULATED');
  });

  it('counts load-bearing inputs with no source', () => {
    const r = verifyInputs(required, [], asOf);
    expect(r.counts.unverified).toBe(required.length);
    expect(r.counts.criticalUnverified).toBe(required.filter((x) => x.critical).length);
    expect(r.score).toBe(0);
    expect(r.summary).toContain('load-bearing');
  });

  it('scores a fully sourced model at 100', () => {
    const r = verifyInputs(
      required,
      required.map((x) => ({ path: x.path, label: x.label, kind: 'FILING' as const, reference: 'ITR 2Q26', asOf })),
      asOf,
    );
    expect(r.score).toBe(100);
    expect(r.counts.unverified).toBe(0);
    expect(r.summary).toContain('traces to a source');
  });

  it('penalises an unsourced critical input more than an optional one', () => {
    const withOptionalMissing = verifyInputs(
      required,
      required.filter((x) => x.critical).map((x) => ({ path: x.path, label: x.label, kind: 'FILING' as const, reference: 'ITR', asOf })),
      asOf,
    );
    const withCriticalMissing = verifyInputs(
      required,
      required.filter((x) => !x.critical).map((x) => ({ path: x.path, label: x.label, kind: 'FILING' as const, reference: 'ITR', asOf })),
      asOf,
    );
    expect(withOptionalMissing.score).toBeGreaterThan(withCriticalMissing.score);
  });
});

describe('sum of the parts debt allocation', () => {
  const unit = (id: string, fcff: number, netDebt: number | null, ownership = 1): CashFlowUnit => ({
    id, name: id, kind: 'Segment', startYear: 2026, endYear: null, ownership,
    cashFlows: [2026, 2027, 2028].map((year) => ({ year, revenue: fcff * 5, ebitda: fcff * 2, capex: fcff, fcff })),
    wacc: null, netDebt, source: null,
  });

  const ctx = {
    wacc: 0.11, netDebt: 10_000, minorityInterest: 0, sharesOutstanding: 1_000,
    currentPrice: 50, baseYear: 2025, terminalGrowth: 0.03,
  };

  it('says so when no debt is allocated to any unit', () => {
    const agg = aggregateUnits([unit('a', 100, null), unit('b', 60, null)], 'SOTP', ctx);
    expect(agg.warnings.some((w) => /No debt is recorded at unit level/.test(w))).toBe(true);
  });

  it('says so when only part of the group debt reaches the units', () => {
    const agg = aggregateUnits([unit('a', 100, 3_000), unit('b', 60, null)], 'SOTP', ctx);
    const w = agg.warnings.find((x) => /allocated nowhere/.test(x));
    expect(w).toBeDefined();
    expect(w).toContain('7000');
  });

  it('says so when the units carry more debt than the group reports', () => {
    const agg = aggregateUnits([unit('a', 100, 9_000), unit('b', 60, 6_000)], 'SOTP', ctx);
    expect(agg.warnings.some((x) => /deducted twice/.test(x))).toBe(true);
  });

  it('stays quiet when the allocation matches the group', () => {
    const agg = aggregateUnits([unit('a', 100, 6_000), unit('b', 60, 4_000)], 'SOTP', ctx);
    expect(agg.warnings.filter((x) => /net debt|debt is recorded/.test(x))).toEqual([]);
  });

  it('weights a partially owned unit’s debt by the stake, as it weights its value', () => {
    // 20,000 at a 50% stake is 10,000 attributable: exactly the group figure.
    const agg = aggregateUnits([unit('a', 100, 20_000, 0.5)], 'SOTP', ctx);
    expect(agg.warnings.filter((x) => /net debt|debt is recorded/.test(x))).toEqual([]);
  });

  it('deducts the group debt once under a consolidated aggregation instead', () => {
    const agg = aggregateUnits([unit('a', 100, null), unit('b', 60, null)], 'CONSOLIDATED', ctx);
    expect(agg.warnings.some((w) => /debt/.test(w))).toBe(false);
    expect(agg.equityValue).toBeCloseTo((agg.enterpriseValue as number) - 10_000, 6);
  });
});
