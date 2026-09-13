import { describe, expect, it } from 'vitest';
import { project } from '@/lib/finance/projection/engine';
import { BLUEPRINTS } from '@/lib/data-providers/mock/blueprints';
import { buildAnnualPeriods } from '@/lib/data-providers/mock/generator';
import { valueProjection } from '@/lib/finance/projection/valuation';
import { buildDebtSchedule, buildVintageSchedule } from '@/lib/finance/projection/schedule';
import {
  capexCeiling, capexFadePath, growthFadePath, maintenanceCapex, shrinkGrowth,
  CROSS_SECTIONAL_GROWTH_SPREAD, GROWTH_PRIOR_EXCESS, SECTOR_GROWTH_EXCESS,
} from '@/server/services/projection';
import { deriveGrowthPrior, deriveSectorPriors, yearlyGrowthOf } from '../scripts/audit-growth';
import type { ProjectionInput } from '@/lib/finance/projection/types';

/* A concession, modelled the way the reference model does it: a toll
   revenue built from traffic and an index-linked tariff, an accessory
   line as a share of it, a construction line mirroring capex, costs
   built from their own drivers, an asset base amortised to the end of
   the contract, and debt on a schedule. */
function concession(overrides: Partial<ProjectionInput> = {}): ProjectionInput {
  return {
    baseYear: 2025,
    years: 8,
    opening: {
      cash: 6_844,
      shortTermInvestments: 27_490,
      receivables: 12_064,
      inventory: 0,
      otherCurrentAssets: 6_564,
      tangibleAssets: 7_698,
      intangibleAssets: 679_464,
      otherNonCurrentAssets: 37_096,
      payables: 6_870,
      shortTermDebt: 34_301,
      longTermDebt: 448_770,
      otherCurrentLiabilities: 29_120,
      otherNonCurrentLiabilities: 23_677,
      provisions: 3_950,
      shareCapital: 169_918,
      retainedEarnings: 60_614,
      minorityInterest: 0,
    },
    revenue: [
      {
        key: 'toll', label: 'Receita de pedágio', kind: 'VOLUME_PRICE',
        baseVolume: 29_565.614, volumeGrowth: [0.005, 0.006, 0.007, 0.008],
        basePrice: 6.2, priceGrowth: [0.045, 0.041, 0.038, 0.035], priceIndex: 'IPCA',
        source: 'Tarifa homologada e tráfego reportado',
      },
      { key: 'accessory', label: 'Receita acessória', kind: 'PCT_OF', ofKey: 'toll', pctOf: [0.057] },
      { key: 'construction', label: 'Receita de construção', kind: 'CONSTRUCTION', pctOfCapex: [0.909] },
    ],
    revenueDeductions: [0.072],
    costs: [
      { key: 'construction', label: 'Custo de construção', block: 'COGS', kind: 'CONSTRUCTION' },
      { key: 'opex', label: 'Pessoal, manutenção e serviços', block: 'COGS', kind: 'PCT_REVENUE', pct: [0.387] },
      { key: 'sga', label: 'SG&A', block: 'SGA', kind: 'PCT_REVENUE', pct: [0.076] },
    ],
    capex: [
      {
        key: 'programme', label: 'Programa de investimentos', block: undefined as never,
        pctRevenue: [0.165], tangibleShare: 0.035, usefulLife: 20,
        amortiseToYear: 2045, contractedRemaining: 451_690,
      } as never,
    ],
    workingCapital: {
      receivableDays: 19.4, payableDays: 23.6, inventoryDays: 0,
      otherAssetDays: 10.6, otherLiabilityDays: 47,
      provisionDays: [{ key: 'maintenance', label: 'Provisão para manutenção', days: 6.1 }],
    },
    debt: {
      openingBalance: 483_071, costOfDebt: 0.101, amortisationYears: 20,
      capexFundedByDebt: 0.75, newDebtTenor: 19, cashYield: 0.1,
      source: 'Última debênture emitida: IPCA + spread',
    },
    distribution: { payout: [0] },
    taxRate: [0.34],
    wacc: 0.109, costOfEquity: 0.203, sharesOutstanding: 1_000, currentPrice: 100,
    covenants: [{ key: 'dscr', label: 'DSCR', measure: 'DSCR', threshold: 1.3, comparator: 'GTE' }],
    ...overrides,
  };
}

describe('vintage schedules', () => {
  it('writes a contract-dated base off over the years it has left', () => {
    const s = buildVintageSchedule({
      baseYear: 2025, years: 5, openingBalance: 1000, openingLife: 10,
      openingShape: 'TO_DATE', additions: [0, 0, 0, 0, 0], lifeFor: () => 10,
    });
    expect(s.rows.find((r) => r.year === 2026)?.charge).toBeCloseTo(100, 6);
    expect(s.rows.find((r) => r.year === 2030)?.closing).toBeCloseTo(500, 6);
  });

  it('shortens each vintage as a contract runs down', () => {
    // Added in 2026 with the contract ending 2030: four years left, not ten.
    const s = buildVintageSchedule({
      baseYear: 2025, years: 5, openingBalance: 0, openingLife: 0,
      additions: [400, 0, 0, 0, 0], lifeFor: (y) => 2030 - y + 1,
    });
    expect(s.rows.find((r) => r.year === 2026)?.charge).toBeCloseTo(80, 6);
    expect(s.rows.find((r) => r.year === 2030)?.closing).toBeCloseTo(0, 6);
  });

  it('writes off exactly what was added, never more', () => {
    const s = buildVintageSchedule({
      baseYear: 2025, years: 12, openingBalance: 500, openingLife: 5,
      additions: [100, 100, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0], lifeFor: () => 4,
    });
    expect(s.totalCharge).toBeCloseTo(800, 6);
    expect(s.rows.find((r) => r.year === 2037)?.closing).toBeCloseTo(0, 6);
  });
});

describe('debt schedule', () => {
  const s = buildDebtSchedule({
    baseYear: 2025, years: 5, openingBalance: 1000, amortisationYears: 10,
    costOfDebt: 0.1, draws: [200, 200, 0, 0, 0], newDebtTenor: 5,
  });

  it('runs opening to closing through draws and amortisation', () => {
    const y1 = s.years[0];
    expect(y1.opening).toBe(1000);
    expect(y1.draws).toBe(200);
    expect(y1.amortisation).toBeCloseTo(100, 6);
    expect(y1.closing).toBeCloseTo(1100, 6);
  });

  it('charges interest on the average balance, not the opening one', () => {
    const y1 = s.years[0];
    expect(y1.interest).toBeCloseTo(((1000 + 1100) / 2) * 0.1, 6);
  });

  it('each year opens where the last one closed', () => {
    for (let i = 1; i < s.years.length; i++) {
      expect(s.years[i].opening).toBeCloseTo(s.years[i - 1].closing, 9);
    }
  });

  it('never amortises more than is outstanding', () => {
    const tight = buildDebtSchedule({
      baseYear: 2025, years: 4, openingBalance: 100, amortisationYears: 1,
      costOfDebt: 0.1, draws: [0, 0, 0, 0], newDebtTenor: 1,
    });
    expect(tight.years.every((y) => y.amortisation <= y.opening + y.draws + 1e-9)).toBe(true);
    expect(tight.years.every((y) => y.closing >= -1e-9)).toBe(true);
  });
});

describe('the projected balance sheet', () => {
  const r = project(concession());

  it('closes in every projected year', () => {
    for (const b of r.balance) {
      // Math.abs because the sign of a 1e-13 residue is not information, and
      // a negative zero formats as "-0.000000" and fails a string comparison
      // that is only here to name the year in the message.
      expect(`${b.year}: gap ${Math.abs(b.balanceGap).toFixed(6)}`).toBe(`${b.year}: gap ${(0).toFixed(6)}`);
    }
    expect(r.balance.every((b) => b.balances)).toBe(true);
  });

  it('says so rather than plugging when the opening balance does not itself balance', () => {
    const broken = concession();
    broken.opening = { ...broken.opening, cash: broken.opening.cash + 50_000 };
    const bad = project(broken);
    expect(bad.balance.every((b) => b.balances)).toBe(false);
    expect(bad.warnings.some((w) => /does not close/.test(w))).toBe(true);
    // The gap is the error introduced, carried rather than hidden.
    expect(bad.balance[0].balanceGap).toBeCloseTo(50_000, 6);
  });

  it('carries the asset base forward as capex less depreciation', () => {
    for (let i = 1; i < r.balance.length; i++) {
      const prior = r.balance[i - 1];
      const now = r.balance[i];
      const added = r.capexTotal[i];
      const charged = -(r.income[i].da);
      const moved = (now.tangibleAssets + now.intangibleAssets) - (prior.tangibleAssets + prior.intangibleAssets);
      expect(moved).toBeCloseTo(added - charged, 4);
    }
  });

  it('splits debt between what falls due next year and the rest', () => {
    for (let i = 0; i < r.balance.length; i++) {
      const b = r.balance[i];
      expect(b.shortTermDebt + b.longTermDebt).toBeCloseTo(r.debtSchedule.years[i].closing, 6);
    }
  });
});

describe('the projected cash flow', () => {
  const r = project(concession());

  it('articulates: opening cash plus the net change is closing cash', () => {
    for (const c of r.cashFlow) {
      expect(c.openingCash + c.netChangeInCash).toBeCloseTo(c.closingCash, 6);
    }
  });

  it('hands closing cash to the next year and to the balance sheet', () => {
    for (let i = 0; i < r.cashFlow.length; i++) {
      expect(r.cashFlow[i].closingCash).toBeCloseTo(r.balance[i].cash, 6);
      if (i > 0) expect(r.cashFlow[i].openingCash).toBeCloseTo(r.cashFlow[i - 1].closingCash, 9);
    }
  });

  it('sums its three blocks to the net change', () => {
    for (const c of r.cashFlow) {
      expect(c.operatingCashFlow + c.investingCashFlow + c.financingCashFlow)
        .toBeCloseTo(c.netChangeInCash, 6);
    }
  });

  it('warns when cash goes negative rather than drawing on a balance that is not there', () => {
    const starved = concession();
    starved.opening = { ...starved.opening, cash: 0 };
    starved.debt = { ...starved.debt, capexFundedByDebt: 0 };
    const bad = project(starved);
    if (bad.cashFlow.some((c) => c.closingCash < 0)) {
      expect(bad.warnings.some((w) => /Cash goes negative/.test(w))).toBe(true);
    }
  });
});

describe('the revenue build-up', () => {
  const r = project(concession());

  it('builds the toll line from traffic and tariff, not from a growth rate', () => {
    const y1 = r.revenue[0].lines.find((l) => l.key === 'toll')!;
    expect(y1.volume).toBeCloseTo(29_565.614 * 1.005, 4);
    expect(y1.price).toBeCloseTo(6.2 * 1.045, 6);
    expect(y1.gross).toBeCloseTo((y1.volume as number) * (y1.price as number), 4);
  });

  it('resolves a line stated as a share of another line', () => {
    const y1 = r.revenue[0];
    const toll = y1.lines.find((l) => l.key === 'toll')!;
    const accessory = y1.lines.find((l) => l.key === 'accessory')!;
    expect(accessory.gross).toBeCloseTo(toll.gross * 0.057, 6);
  });

  it('recognises the capital programme as revenue and as cost, netting to nothing', () => {
    const construction = r.revenue[0].lines.find((l) => l.key === 'construction')!;
    const cost = r.income[0].costLines.find((c) => c.key === 'construction')!;
    expect(construction.gross).toBeCloseTo(r.capexTotal[0] * 0.909, 6);
    expect(cost.amount).toBeCloseTo(r.capexTotal[0], 6);
  });

  it('keeps the declared line order rather than the order it resolved them in', () => {
    expect(r.revenue[0].lines.map((l) => l.key)).toEqual(['toll', 'accessory', 'construction']);
  });
});

describe('working capital from payment terms', () => {
  const r = project(concession());

  it('sizes receivables on the stated days, not on a percentage', () => {
    const wc = r.workingCapital[0];
    expect(wc.receivables).toBeCloseTo((r.revenue[0].netRevenue * 19.4) / 365, 6);
  });

  it('treats a rise in working capital as a use of cash', () => {
    for (let i = 1; i < r.workingCapital.length; i++) {
      const rose = r.workingCapital[i].netWorkingCapital > r.workingCapital[i - 1].netWorkingCapital;
      if (rose) expect(r.workingCapital[i].change).toBeLessThan(0);
    }
  });
});

describe('FCFF, FCFE and the two routes to equity', () => {
  const input = concession();
  const r = project(input);
  const v = valueProjection(input, r);

  it('taxes EBIT rather than reusing the levered tax charge', () => {
    const c = v.cashFlows[0];
    const inc = r.income[0];
    expect(c.taxOnEbit).toBeCloseTo(-inc.ebit * (inc.effectiveTaxRate ?? 0), 6);
    // The levered charge is smaller, because the interest shielded some of it.
    expect(Math.abs(c.taxOnEbit)).toBeGreaterThan(Math.abs(inc.taxes));
  });

  it('builds FCFF from NOPAT, D&A, capex and working capital', () => {
    for (const c of v.cashFlows) {
      expect(c.fcff).toBeCloseTo(c.nopat + c.da + c.capex + c.workingCapitalChange, 6);
    }
  });

  it('builds FCFE from FCFF by serving and rolling the debt', () => {
    for (const c of v.cashFlows) {
      expect(c.fcfe).toBeCloseTo(c.fcff + c.debtDrawn + c.debtRepaid + c.netInterestAfterTax, 6);
    }
  });

  it('gives the interest its tax shield on the way to the equity', () => {
    const c = v.cashFlows[0];
    const inc = r.income[0];
    const gross = inc.financialExpense + inc.financialIncome;
    expect(Math.abs(c.netInterestAfterTax)).toBeLessThan(Math.abs(gross));
  });

  it('discounts each flow at the rate that belongs to it', () => {
    const c = v.cashFlows[2];
    expect(c.pvFcff).toBeCloseTo(c.fcff / (1 + (input.wacc as number)) ** c.period, 6);
    expect(c.pvFcfe).toBeCloseTo(c.fcfe / (1 + (input.costOfEquity as number)) ** c.period, 6);
  });

  it('gives a concession no terminal value, because the asset stops', () => {
    expect(v.terminalValue).toBeNull();
    expect(v.enterpriseValue).toBeCloseTo(v.pvExplicitFcff as number, 6);
  });

  it('gives an ongoing business a terminal value when one is asked for', () => {
    const ongoing = concession();
    ongoing.capex = [{ key: 'maintenance', label: 'Capex', pctRevenue: [0.08], tangibleShare: 1, usefulLife: 12 }];
    const rr = project(ongoing);
    const vv = valueProjection(ongoing, rr, { terminalGrowth: 0.03 });
    expect(vv.terminalValue).not.toBeNull();
    expect(vv.enterpriseValue as number).toBeGreaterThan(vv.pvExplicitFcff as number);
  });

  it('reports the gap between the two routes instead of picking one quietly', () => {
    expect(v.equityValueFromFcff).not.toBeNull();
    expect(v.equityValueFromFcfe).not.toBeNull();
    expect(v.routeGap).toBeCloseTo(
      (v.equityValueFromFcfe as number) - (v.equityValueFromFcff as number), 6);
  });

  it('returns an unlevered and a levered IRR that price their own stream', () => {
    expect(v.unleveredIrr).not.toBeNull();
    expect(v.leveredIrr).not.toBeNull();
    // Paying the equity value for the equity stream earns the cost of equity.
    expect(v.leveredIrr as number).toBeCloseTo(input.costOfEquity as number, 2);
  });

  it('scales the value by the stake actually held', () => {
    const partial = { ...concession(), ownership: 0.65 };
    const rp = project(partial);
    const vp = valueProjection(partial, rp);
    const full = valueProjection(concession(), r);
    expect(vp.attributableEquityValue as number)
      .toBeCloseTo((full.attributableEquityValue as number) * 0.65, 4);
  });
});

describe('covenants', () => {
  const input = concession();
  const r = project(input);
  const v = valueProjection(input, r);

  it('tests the ratio every projected year', () => {
    expect(v.covenants).toHaveLength(r.income.length);
    expect(v.covenants.every((c) => c.measure === 'DSCR')).toBe(true);
  });

  it('computes DSCR as EBITDA over interest plus amortisation', () => {
    const c = v.covenants[0];
    const inc = r.income[0];
    const d = r.debtSchedule.years[0];
    expect(c.value).toBeCloseTo(inc.ebitda / (Math.abs(inc.financialExpense) + d.amortisation), 6);
  });

  it('reports headroom, not just pass or fail', () => {
    for (const c of v.covenants) {
      if (c.value === null) continue;
      expect(c.headroom).toBeCloseTo((c.value as number) - c.threshold, 9);
      expect(c.passes).toBe((c.value as number) >= c.threshold);
    }
  });

  it('raises a breach as an event of default, not as a footnote', () => {
    const tight = concession();
    tight.covenants = [{ key: 'dscr', label: 'DSCR', measure: 'DSCR', threshold: 99, comparator: 'GTE' }];
    const vv = valueProjection(tight, project(tight));
    expect(vv.covenantBreaches.length).toBeGreaterThan(0);
    expect(vv.warnings.some((w) => /event of default/.test(w))).toBe(true);
  });
});

describe('the construction pass-through', () => {
  it('lets a cost driver exclude it, because it adds revenue without economics', () => {
    const withPassThrough = concession();
    withPassThrough.costs = [
      { key: 'construction', label: 'Custo de construção', block: 'COGS', kind: 'CONSTRUCTION' },
      { key: 'opex', label: 'Opex', block: 'COGS', kind: 'PCT_REVENUE', pct: [0.387],
        base: 'NET_REVENUE_EX_CONSTRUCTION' },
      { key: 'sga', label: 'SG&A', block: 'SGA', kind: 'PCT_REVENUE', pct: [0.076] },
    ];
    const r = project(withPassThrough);
    const rev = r.revenue[0];
    const opex = r.income[0].costLines.find((c) => c.key === 'opex')!;

    expect(rev.netRevenueExConstruction).toBeLessThan(rev.netRevenue);
    expect(opex.amount).toBeCloseTo(rev.netRevenueExConstruction * 0.387, 6);

    // Stated against reported revenue the same driver costs more, which is
    // exactly the overstatement the option exists to avoid.
    const naive = project(concession());
    const naiveOpex = naive.income[0].costLines.find((c) => c.key === 'opex')!;
    expect(naiveOpex.amount).toBeGreaterThan(opex.amount);
  });

  it('still balances with the pass-through excluded from the driver', () => {
    const m = concession();
    m.costs = m.costs.map((c) =>
      c.key === 'opex' ? { ...c, base: 'NET_REVENUE_EX_CONSTRUCTION' as const } : c);
    expect(project(m).balance.every((b) => b.balances)).toBe(true);
  });
});

describe('refinancing', () => {
  const deleveraging = concession();
  const rolling = { ...concession(), debt: { ...concession().debt, rollMaturities: true } };

  it('rolls what matures instead of repaying it out of operating cash', () => {
    const a = project(deleveraging);
    const b = project(rolling);
    expect(b.debtSchedule.years[0].draws)
      .toBeCloseTo(a.debtSchedule.years[0].draws + a.debtSchedule.years[0].amortisation, 6);
  });

  it('holds the debt stack roughly flat rather than amortising it away', () => {
    const a = project(deleveraging);
    const b = project(rolling);
    const last = b.debtSchedule.years.length - 1;
    expect(b.debtSchedule.years[last].closing).toBeGreaterThan(a.debtSchedule.years[last].closing);
  });

  it('leaves more cash in the business, because less of it went to lenders', () => {
    const a = project(deleveraging);
    const b = project(rolling);
    expect(b.cashFlow[b.cashFlow.length - 1].closingCash)
      .toBeGreaterThan(a.cashFlow[a.cashFlow.length - 1].closingCash);
  });

  it('still closes the balance sheet every year', () => {
    expect(project(rolling).balance.every((x) => x.balances)).toBe(true);
  });

  it('leaves an explicit draw schedule alone, because that is the analyst speaking', () => {
    const explicit = {
      ...concession(),
      debt: { ...concession().debt, rollMaturities: true, draws: [1000, 1000, 0, 0, 0, 0, 0, 0] },
    };
    expect(project(explicit).debtSchedule.years[0].draws).toBe(1000);
  });
});

describe('crossing the API boundary', () => {
  // The engine runs on the server and the tables render on the client, so
  // everything the tables read has to survive JSON. A Map serialises to `{}`,
  // which renders as an empty column rather than as an error.
  const r = project(concession());
  const v = valueProjection(concession(), r);
  const round = JSON.parse(JSON.stringify({ projected: r, valuation: v }));

  it('keeps the depreciation schedule readable after serialisation', () => {
    expect(round.projected.depreciationSchedule.rows).toHaveLength(r.depreciationSchedule.rows.length);
    expect(round.projected.depreciationSchedule.rows[0].charge)
      .toBeCloseTo(r.depreciationSchedule.rows[0].charge, 6);
  });

  it('keeps every statement and schedule an array, not a keyed collection', () => {
    for (const path of [
      round.projected.income, round.projected.balance, round.projected.cashFlow,
      round.projected.revenue, round.projected.workingCapital,
      round.projected.depreciationSchedule.rows, round.projected.amortisationSchedule.rows,
      round.projected.debtSchedule.years, round.valuation.cashFlows, round.valuation.covenants,
    ]) {
      expect(Array.isArray(path)).toBe(true);
      expect(path.length).toBeGreaterThan(0);
    }
  });

  it('loses no figure the tables depend on', () => {
    expect(round.projected.balance[0].totalAssets).toBeCloseTo(r.balance[0].totalAssets, 6);
    expect(round.valuation.cashFlows[0].fcfe).toBeCloseTo(v.cashFlows[0].fcfe, 6);
    expect(round.valuation.covenants[0].value).toBeCloseTo(v.covenants[0].value as number, 6);
  });
});

describe('the balance tolerance', () => {
  it('tolerates the cent the reported statements are rounded to', () => {
    const m = concession();
    // A cent of rounding in the opening balance is the source's, not the model's.
    m.opening = { ...m.opening, cash: m.opening.cash + 0.01 };
    expect(project(m).balance.every((b) => b.balances)).toBe(true);
  });

  it('does not tolerate an error the size of a real line', () => {
    const m = concession();
    m.opening = { ...m.opening, cash: m.opening.cash + 100 };
    const r = project(m);
    expect(r.balance.every((b) => b.balances)).toBe(false);
    expect(r.balance[0].balanceGap).toBeCloseTo(100, 6);
  });

  it('tolerates rounding arriving on every line at once, not just on one', () => {
    const m = concession();
    // Rounding does not land on a single figure. Every line of a reported
    // balance sheet is stated to the cent, so each one is already up to half a
    // cent out, and reading a dozen of them accumulates that drift in one
    // direction. Pushing every asset line the same way is the worst case.
    const assetLines = ['cash', 'shortTermInvestments', 'receivables', 'inventory',
      'otherCurrentAssets', 'tangibleAssets', 'intangibleAssets', 'otherNonCurrentAssets'] as const;
    const opening = { ...m.opening };
    for (const k of assetLines) {
      const v = opening[k];
      if (typeof v === 'number') opening[k] = v + 0.005;
    }
    m.opening = opening;
    expect(project(m).balance.every((b) => b.balances)).toBe(true);
  });

  it('is still far below a single real line, however many lines were read', () => {
    const m = concession();
    // The allowance grows with the line count; it must never grow into the range
    // where an actual modelling error would pass as rounding.
    m.opening = { ...m.opening, cash: m.opening.cash + 1 };
    expect(project(m).balance.every((b) => b.balances)).toBe(false);
  });

  it('scales with the balance sheet, so a large company is not held to a cent', () => {
    const big = concession();
    const scale = 1000;
    big.opening = Object.fromEntries(
      Object.entries(big.opening).map(([k, v]) => [k, typeof v === 'number' ? v * scale : v]),
    ) as typeof big.opening;
    big.revenue = big.revenue.map((r) => ({
      ...r,
      baseVolume: r.baseVolume ? r.baseVolume * scale : r.baseVolume,
      baseRevenue: r.baseRevenue ? r.baseRevenue * scale : r.baseRevenue,
    }));
    big.debt = { ...big.debt, openingBalance: big.debt.openingBalance * scale };
    expect(project(big).balance.every((b) => b.balances)).toBe(true);
  });
});

describe('a volume-and-price line', () => {
  const m = concession();
  const r = project(m);

  it('reconciles: volume times price is the line', () => {
    for (const year of r.revenue) {
      const toll = year.lines.find((l) => l.key === 'toll')!;
      expect(toll.gross).toBeCloseTo((toll.volume as number) * (toll.price as number), 6);
    }
  });

  it('compounds volume and price independently, not as one growth rate', () => {
    const flatTraffic = {
      ...concession(),
      revenue: concession().revenue.map((l) =>
        l.key === 'toll' ? { ...l, volumeGrowth: [0] } : l),
    };
    const a = project(concession()).revenue[3].lines.find((l) => l.key === 'toll')!;
    const b = project(flatTraffic).revenue[3].lines.find((l) => l.key === 'toll')!;
    // Same tariff path, different traffic: the price is untouched.
    expect(b.price).toBeCloseTo(a.price as number, 9);
    expect(b.volume as number).toBeLessThan(a.volume as number);
  });

  it('holds the price flat when only the index is set to zero', () => {
    const frozen = {
      ...concession(),
      revenue: concession().revenue.map((l) =>
        l.key === 'toll' ? { ...l, priceGrowth: [0] } : l),
    };
    const line = project(frozen).revenue[4].lines.find((l) => l.key === 'toll')!;
    expect(line.price).toBeCloseTo(6.2, 9);
  });
});

describe('capex scales with the revenue it is quoted against', () => {
  it('applies a percentage of revenue to each year, not to the base year', () => {
    // A 7.5%-of-revenue programme frozen on the base year becomes 2.7% by year
    // ten when revenue grows. The share is the assumption; holding it is the
    // whole point of quoting capex that way.
    const m = concession();
    m.years = 10;
    // No construction line, so operating revenue is all the revenue and the
    // quoted share should hold exactly against the reported figure.
    m.revenue = m.revenue.filter((l) => l.kind !== 'CONSTRUCTION');
    m.costs = m.costs.filter((c) => c.kind !== 'CONSTRUCTION');
    m.capex = [{ key: 'capex', label: 'Capex', pctRevenue: [0.075], tangibleShare: 0.5, usefulLife: 10 } as never];
    const out = project(m);
    for (let i = 0; i < out.income.length; i += 1) {
      const share = out.capexTotal[i] / out.income[i].netRevenue;
      expect(share, `year ${i}`).toBeCloseTo(0.075, 6);
    }
  });

  it('sizes the programme on operating revenue, not on the revenue it creates', () => {
    // A concessionaire books its own construction as revenue and an equal cost.
    // Sizing the programme against that is circular, so it is excluded — and
    // the reported share therefore sits below the quoted one by exactly the
    // construction line's contribution.
    const m = concession();
    const out = project(m);
    const quoted = 0.165;
    const reported = out.capexTotal[0] / out.income[0].netRevenue;
    expect(reported).toBeLessThan(quoted);
    expect(reported).toBeGreaterThan(quoted * 0.5);
  });

  it('does not let the asset base shrink while revenue grows', () => {
    // Capex below depreciation every year for a decade is a company liquidating
    // itself, and it reads as free cash flow if nothing checks the balance sheet.
    const m = concession();
    m.years = 10;
    m.capex = [{ key: 'capex', label: 'Capex', pctRevenue: [0.075], tangibleShare: 0.5, usefulLife: 10 }];
    const out = project(m);
    const first = out.balance[0].tangibleAssets;
    const last = out.balance[out.balance.length - 1].tangibleAssets;
    const revGrew = out.income[out.income.length - 1].netRevenue > out.income[0].netRevenue;
    if (revGrew) expect(last).toBeGreaterThan(first * 0.9);
  });
});

describe('a valuation that has stopped meaning anything', () => {
  it('withholds a valuation when the terminal year loses money', () => {
    // Capitalising a negative terminal profit produces a negative perpetuity.
    // That is arithmetic, not a bear case, and a reader cannot disagree with it
    // usefully — so it is not published.
    const m = concession();
    m.costs = m.costs.map((c) =>
      c.kind === 'PCT_REVENUE' ? { ...c, pct: [1.4] } : c,
    );
    const out = valueProjection(m, project(m));
    expect(out.valuePerShare).toBeNull();
    expect(out.warnings.join(' ')).toMatch(/negative operating profit|not positive/);
  });

  it('withholds rather than printing a negative price per share', () => {
    // Limited liability puts a floor of zero under a share price, so a negative
    // one is never a forecast — it means net debt exceeds enterprise value.
    const m = concession();
    m.opening = { ...m.opening, longTermDebt: 5_000_000 };
    m.debt = { ...m.debt, openingBalance: 5_000_000 };
    const out = valueProjection(m, project(m));
    expect(out.valuePerShare).toBeNull();
    expect(out.warnings.join(' ')).toMatch(/worth less than nothing|not positive/);
  });

  it('still publishes a value for a company that simply looks expensive', () => {
    // The guard must not swallow an ordinary bad result: a low value with a
    // negative upside is a view, and withholding it would hide the answer.
    // A low value with a negative upside is a view a reader can disagree with,
    // and withholding it would hide the answer rather than protect anyone. Debt
    // is cut here so the fixture clears the integrity guards and the case being
    // tested is the ordinary one.
    const m = concession();
    m.currentPrice = 10_000;
    m.opening = { ...m.opening, longTermDebt: 40_000, shortTermDebt: 3_000 };
    m.debt = { ...m.debt, openingBalance: 43_000 };
    const out = valueProjection(m, project(m));
    expect(out.valuePerShare).not.toBeNull();
    expect(out.upside as number).toBeLessThan(0);
  });
});

describe('financials funded by their own balance sheet', () => {
  it('publishes no value per share for a bank or insurer', () => {
    // Deposits are raw material, not financing. Subtracting them as net debt
    // subtracts the business from itself, which is how six banks came to carry
    // upsides between 47% and 115%.
    const m = concession();
    m.balanceSheetFunded = true;
    const out = valueProjection(m, project(m));
    expect(out.valuePerShare).toBeNull();
    expect(out.warnings.join(' ')).toMatch(/deposit- or float-funded/);
  });

  it('leaves an ordinary company alone', () => {
    const m = concession();
    m.balanceSheetFunded = false;
    const out = valueProjection(m, project(m));
    expect(out.warnings.join(' ')).not.toMatch(/deposit- or float-funded/);
  });
});

describe('reinvestment is consistent with the growth that is forecast', () => {
  it('fades capex from what the company spends now toward what growth requires', () => {
    // A heavy investor: 12% of revenue against 7% depreciation, all tangible.
    const maintenance = maintenanceCapex(0.12, 0.07, 1, 0.04);
    const path = capexFadePath(0.12, maintenance);

    expect(path[0]).toBeCloseTo(0.12, 6);
    for (let i = 1; i < path.length; i += 1) expect(path[i]).toBeLessThan(path[i - 1]);
    expect(path[path.length - 1]).toBeGreaterThan(maintenance);
    expect(path[path.length - 1]).toBeLessThan(0.09);
  });

  it('fades a company spending below depreciation upward, not downward', () => {
    // The old behaviour froze the trailing ratio, so a company in a capex
    // trough was assumed never to replace its assets and the model read the
    // shortfall as free cash flow.
    const maintenance = maintenanceCapex(0.03, 0.07, 1, 0.04);
    const path = capexFadePath(0.03, maintenance);

    expect(path[0]).toBeCloseTo(0.03, 6);
    for (let i = 1; i < path.length; i += 1) expect(path[i]).toBeGreaterThan(path[i - 1]);
    expect(path[path.length - 1]).toBeLessThan(maintenance);
  });

  it('does not demand replacement capex for amortisation of an acquired intangible', () => {
    // AMD is 13% tangible against 87% Xilinx amortisation. Charging its whole
    // D&A as a spending requirement would make a fabless designer invest like
    // a foundry — so the tangible share holds the requirement down.
    const fabless = maintenanceCapex(0.004, 0.09, 0.13, 0.04);
    const foundry = maintenanceCapex(0.004, 0.09, 1, 0.04);

    expect(fabless).toBeCloseTo(0.09 * 1.04 * 0.13, 6);
    expect(fabless).toBeLessThan(foundry / 5);
  });

  it('covers replacement plus the increment the long-run growth needs', () => {
    // Maintenance is not depreciation: a business still growing at the
    // long-run nominal rate has to equip that growth as well as replace.
    const m = maintenanceCapex(0.20, 0.07, 1, 0.055);
    expect(m).toBeGreaterThan(0.07);
    expect(m).toBeCloseTo(0.07 * 1.055, 6);
  });

  it('leaves a company already at maintenance flat', () => {
    const maintenance = maintenanceCapex(0.0728, 0.07, 1, 0.04);
    const path = capexFadePath(maintenance, maintenance);
    for (const p of path) expect(p).toBeCloseTo(maintenance, 10);
  });

  it('never fades a company below what it has been spending all along', () => {
    // Verizon reads as 38% tangible because spectrum and goodwill sit in the
    // asset base and neither is amortised. Taking 38% of its depreciation as
    // the requirement set maintenance capex at 5.2% of revenue against the
    // 12.8% Verizon has actually spent every year for a decade. A company
    // already spending at or below its depreciation charge is not in an
    // investment phase — there is nothing to fade away.
    const m = maintenanceCapex(0.128, 0.130, 0.383, 0.04);
    expect(m).toBeCloseTo(0.128, 6);

    const path = capexFadePath(0.128, m);
    for (const p of path) expect(p).toBeCloseTo(0.128, 10);
  });

  it('fades a genuine investment phase down to the depreciation it must replace', () => {
    // Spending well above depreciation is the case the fade exists for, and
    // there the floor is the whole replacement charge, not a share of it.
    const m = maintenanceCapex(0.38, 0.25, 0.85, 0.04);
    expect(m).toBeCloseTo(0.25 * 1.04, 6);
    expect(m).toBeLessThan(0.38);
  });
});

describe('a trailing growth rate is weighted by how much of it is signal', () => {
  it('passes a steady compounder through untouched', () => {
    // Visa's revenue has grown 9.8% a year with a spread under a point. There
    // is nothing to shrink toward: the window is measuring the business.
    const steady = [0.098, 0.096, 0.100, 0.097, 0.099];
    const s = shrinkGrowth(steady, 0.04);
    expect(s.weight).toBeGreaterThan(0.99);
    expect(s.growth).toBeCloseTo(0.098, 3);
  });

  it('pulls a rate that is mostly noise back toward the population', () => {
    // NVIDIA's mean is 65% with a 54-point standard deviation. It clears any
    // significance bar you care to set — it is large AND uncertain, which is
    // why a threshold cannot handle it and a weight can.
    const boom = [1.26, 0.61, 0.00, 0.61, 0.78];
    const s = shrinkGrowth(boom, 0.04);
    expect(s.weight).toBeLessThan(0.2);
    expect(s.growth).toBeLessThan(0.20);
    expect(s.growth).toBeGreaterThan(0.04);
    // Far nearer the population than the boom it was measured in.
    expect(Math.abs(s.growth - s.prior)).toBeLessThan(Math.abs(s.growth - 0.652) / 5);
  });

  it('does not read a cyclical trough as permanent decline', () => {
    // ConocoPhillips averages -4.8% a year against an 11-point spread. Held
    // for a decade that shrinks an oil major by a third because the window
    // happened to open at a peak.
    const cyclical = [-0.20, 0.12, -0.15, 0.05, -0.06];
    const raw = cyclical.reduce((a, b) => a + b, 0) / cyclical.length;
    const s = shrinkGrowth(cyclical, 0.04);
    expect(raw).toBeLessThan(0);
    expect(s.growth).toBeGreaterThan(raw);
    expect(s.weight).toBeLessThan(0.8);
  });

  it('keeps a measured decline when the decline is what the data shows', () => {
    // A steadily shrinking top line is not noise, and must not be shrunk away
    // into growth the company is not delivering.
    const declining = [-0.010, -0.008, -0.012, -0.009, -0.011];
    const s = shrinkGrowth(declining, 0.04);
    expect(s.weight).toBeGreaterThan(0.99);
    expect(s.growth).toBeLessThan(0);
  });

  it('falls back to the population when there is nothing to measure', () => {
    expect(shrinkGrowth([], 0.04).growth).toBeCloseTo(0.04 + GROWTH_PRIOR_EXCESS, 10);
    expect(shrinkGrowth([0.12], 0.04).growth).toBeCloseTo(0.04 + GROWTH_PRIOR_EXCESS, 10);
  });

  it('shrinks toward where large companies actually sit, not toward the economy', () => {
    // These are large listed companies and they have outgrown their economies
    // by 4.5 points a year. Shrinking an uncertain one toward the economy's
    // growth instead is the wrong centre, and it biases every uncertain
    // company downward — the universe's median model value fell from 1.03x
    // market to 0.91x when it was tried that way.
    const noisy = [0.40, -0.10, 0.35, 0.05, 0.20];
    const s = shrinkGrowth(noisy, 0.04);
    expect(s.prior).toBeCloseTo(0.04 + GROWTH_PRIOR_EXCESS, 10);
    expect(s.growth).toBeGreaterThan(0.04);
  });

  it('weights a company against its own sector, not the whole universe', () => {
    // Materials run below their economies' nominal growth and information
    // technology well above it. Shrinking a miner and a semiconductor designer
    // toward the same universe average is using a prior neither belongs to.
    const noisy = [0.40, -0.10, 0.35, 0.05, 0.20];
    const miner = shrinkGrowth(noisy, 0.04, 'Materials');
    const semi = shrinkGrowth(noisy, 0.04, 'Information Technology');
    expect(miner.prior).toBeLessThan(0.04);
    expect(semi.prior).toBeGreaterThan(0.10);
    expect(miner.growth).toBeLessThan(semi.growth);
  });

  it('falls back to the universe for a sector it has no measurement for', () => {
    const noisy = [0.40, -0.10, 0.35, 0.05, 0.20];
    expect(shrinkGrowth(noisy, 0.04, 'Conglomerates').prior)
      .toBeCloseTo(0.04 + GROWTH_PRIOR_EXCESS, 10);
  });

  it('pins the priors to what the universe actually shows', () => {
    // The weight needs numbers a single company cannot supply: where its
    // population sits, and how far apart the members genuinely are. All are
    // derived from the cross-section, not chosen, so the constants have to
    // track the derivation.
    const derived = deriveGrowthPrior();
    expect(derived.excess).toBeCloseTo(GROWTH_PRIOR_EXCESS, 3);
    expect(derived.spread).toBeCloseTo(CROSS_SECTIONAL_GROWTH_SPREAD, 3);

    const sectors = deriveSectorPriors();
    expect(Object.keys(sectors).sort()).toEqual(Object.keys(SECTOR_GROWTH_EXCESS).sort());
    for (const [sector, value] of Object.entries(sectors)) {
      expect(SECTOR_GROWTH_EXCESS[sector]).toBeCloseTo(value, 3);
    }
  });

  it('shrinks the companies whose own window is noisiest, and only those', () => {
    const nvda = shrinkGrowth(yearlyGrowthOf('NVDA'), 0.04);
    const visa = shrinkGrowth(yearlyGrowthOf('V'), 0.04);
    expect(nvda.weight).toBeLessThan(0.2);
    expect(visa.weight).toBeGreaterThan(0.99);
  });
});

describe('growth fades toward what an economy can sustain', () => {
  it('brings an impossible rate down', () => {
    // Held flat, a company off two years above 100% forecasts sixty percent a
    // year for a decade and reaches revenue no market is that large.
    const path = growthFadePath(0.60, 0.04);
    expect(path[0]).toBeCloseTo(0.60, 6);
    for (let i = 1; i < path.length; i += 1) expect(path[i]).toBeLessThan(path[i - 1]);
    expect(path[path.length - 1]).toBeLessThan(0.20);
    expect(path[path.length - 1]).toBeGreaterThan(0.04);
  });

  it('never speeds a mature company up', () => {
    // Converging from below would forecast a telecom growing 1.5% today
    // accelerating to 4% by year ten. That is not mean reversion, it is an
    // assumption that maturity reverses.
    const path = growthFadePath(0.015, 0.04);
    for (const g of path) expect(g).toBeCloseTo(0.015, 10);
  });

  it('lets a decline decay toward zero instead of compounding forever', () => {
    // Held flat, -4% leaves a third of the revenue gone by year ten while the
    // asset base and its depreciation stay put, so operating profit goes
    // negative and the model refuses to publish any value. Shell and Usiminas
    // are going concerns in a commodity trough; both came out unvaluable.
    const path = growthFadePath(-0.04, 0.04);
    expect(path[0]).toBeCloseTo(-0.04, 6);
    for (let i = 1; i < path.length; i += 1) expect(path[i]).toBeGreaterThan(path[i - 1]);
    expect(path[path.length - 1]).toBeLessThan(0);
    expect(path[path.length - 1]).toBeGreaterThan(-0.01);

    const flat = Array.from({ length: 10 }, () => -0.04);
    const shrink = (p: number[]) => p.reduce((a, g) => a * (1 + g), 1);
    expect(shrink(path)).toBeGreaterThan(shrink(flat));
  });

  it('never turns a decline into growth the company is not showing', () => {
    for (const g of growthFadePath(-0.04, 0.04)) expect(g).toBeLessThanOrEqual(0);
  });
});

describe('an asset base in steady state charges a steady depreciation', () => {
  /* A business that spends exactly what it consumes: annual capex equal to the
     depreciation charge, on a base whose book value is what that policy leaves
     behind. Under straight line with a useful life L, net book value settles at
     C*(L+1)/2 against an annual charge of C — so the book value divided by the
     charge is (L+1)/2, NOT L. Reading it as L halves the life of everything the
     company buys next, and the excess charge accumulates year on year. */
  const LIFE = 17;
  const CAPEX = 100;
  const steadyStateBook = Array.from({ length: LIFE }, (_, a) => CAPEX * (LIFE - a) / LIFE)
    .reduce((a, b) => a + b, 0);

  it('has a book value of (L+1)/2 times its annual charge', () => {
    expect(steadyStateBook / CAPEX).toBeCloseTo((LIFE + 1) / 2, 6);
  });

  it('does not let the charge drift while capex matches it', () => {
    const schedule = buildVintageSchedule({
      baseYear: 2025,
      years: 10,
      openingBalance: steadyStateBook,
      openingLife: LIFE,
      additions: new Array(10).fill(CAPEX),
      lifeFor: () => LIFE,
    });

    // Year one continues from the last reported charge rather than restarting:
    // the stack charges the book value over its average remaining life, plus
    // one year of the new vintage.
    expect(schedule.rows[0].charge).toBeCloseTo(CAPEX * (1 + 1 / LIFE), 6);

    // And it stays there. This is the invariant that matters — a company
    // spending exactly what it consumes must not show a rising charge.
    for (const row of schedule.rows) {
      expect(row.charge).toBeCloseTo(schedule.rows[0].charge, 6);
    }

    // The base it is charged against holds too.
    // The base holds too, to within the one-year convention: an addition here
    // starts charging in the year it lands rather than the year after, so the
    // charge runs 1/L above replacement.
    const last = schedule.rows[schedule.rows.length - 1];
    expect(last.closing / steadyStateBook).toBeGreaterThan(0.90);
    expect(last.closing / steadyStateBook).toBeLessThan(1.02);
  });
});

describe('capex cannot outrun the growth it is supposed to buy', () => {
  it('caps a build-out that would raise capital intensity forever', () => {
    // NextEra: 93% of revenue on capex, an asset base 5.1x revenue, D&A 29% of
    // revenue and 8.3% growth. The spending is real, but compounding the base
    // at 15% against 8% revenue growth means capital intensity rises every year
    // without end, and the implied return on the money is 3.9%.
    const ceiling = capexCeiling(0.29, 5.1, 0.083);
    expect(ceiling).toBeCloseTo(0.29 + 0.083 * 5.1, 6);
    expect(ceiling).toBeLessThan(0.93);
    expect(Math.min(0.93, ceiling)).toBe(ceiling);
  });

  it('leaves a genuine growth investor alone', () => {
    // Equinix spends 35% of revenue building data centres, on a base 4x revenue
    // with D&A at 26% and 9% growth. That spending is consistent with the
    // growth it is forecast to produce, so nothing binds.
    expect(capexCeiling(0.26, 4.0, 0.09)).toBeGreaterThan(0.35);
    // Verizon and Tesla likewise.
    expect(capexCeiling(0.13, 2.1, 0.011)).toBeGreaterThan(0.128);
    expect(capexCeiling(0.048, 0.8, 0.087)).toBeGreaterThan(0.098);
  });

  it('is a ceiling and not a target', () => {
    // A company spending below what its growth would justify keeps spending
    // below it — the constraint never pushes investment up.
    const ceiling = capexCeiling(0.07, 1.5, 0.05);
    expect(Math.min(0.03, ceiling)).toBeCloseTo(0.03, 10);
  });

  it('still allows replacement when growth is zero or negative', () => {
    // A shrinking company does not stop replacing what wears out.
    expect(capexCeiling(0.09, 2.0, 0)).toBeCloseTo(0.09, 10);
    expect(capexCeiling(0.09, 2.0, -0.03)).toBeCloseTo(0.09, 10);
  });

  it('never falls below the maintenance level passed to it', () => {
    // The floor is what the business must spend to stand still; the ceiling is
    // what growth justifies on top. They must not cross.
    expect(capexCeiling(0.02, 0.5, 0.01, 0.06)).toBeCloseTo(0.06, 10);
  });
});

describe('the first projected year continues from the last reported one', () => {
  /* The engine charges depreciation from a schedule, not as a percentage of
     revenue, so year one's charge has to land on the last reported charge. If
     it does not, every projected operating margin is wrong from the start —
     and it was, in one direction, for 48 of the 117 companies: Realty Income's
     modelled margin came out at -32% against 39% reported, NextEra's at 17%
     against 50%, AMD's at -4% against 17%.

     Two causes, both charging for consumption that does not happen. Goodwill
     was in the amortising base, and goodwill is never amortised — which is why
     the worst cases were the acquirers. And the useful life was capped at 40
     years, so a base the data says lasts longer was written off too fast,
     which is why the rest were REITs, towers and utilities. */
  const cases = BLUEPRINTS.map((bp) => {
    const annuals = buildAnnualPeriods(bp);
    const last = annuals[annuals.length - 1];
    const ppe = last.balance.ppe ?? 0;
    const intangibles = last.balance.intangibles ?? 0;
    const da = Math.abs(last.income.da ?? 0);
    return { ticker: bp.profile.ticker, base: ppe + intangibles, da };
  }).filter((c) => c.da > 0 && c.base > 0);

  it('covers the universe', () => {
    expect(cases.length).toBeGreaterThan(100);
  });

  it('charges what the company last reported, for every company', () => {
    // A vintage schedule is annual cohorts, so the life is an integer and the
    // charge moves in steps of roughly 1/(L+1). That granularity is the whole
    // tolerance here: anything outside it is a real break, not rounding.
    const off: string[] = [];
    const ratios: number[] = [];
    for (const c of cases) {
      const exactLife = (2 * c.base) / c.da - 1;
      const life = Math.max(3, Math.min(120, Math.round(exactLife)));
      const schedule = buildVintageSchedule({
        baseYear: 2025, years: 10,
        openingBalance: c.base, openingLife: life,
        additions: new Array(10).fill(0), lifeFor: () => life,
      });
      const ratio = schedule.rows[0].charge / c.da;
      ratios.push(ratio);
      const granularity = 1 / (Math.min(exactLife, life) + 1);
      if (Math.abs(ratio - 1) > granularity * 1.05) off.push(`${c.ticker} ${ratio.toFixed(2)}x`);
    }
    expect(off).toEqual([]);

    // And no company is off by a margin that granularity could explain away:
    // the 40-year cap had Realty Income charging 1.5x its reported depreciation.
    for (const r of ratios) expect(r).toBeGreaterThan(0.85);
    for (const r of ratios) expect(r).toBeLessThan(1.15);
    const sorted = [...ratios].sort((a, b) => a - b);
    expect(sorted[Math.floor(sorted.length / 2)]).toBeCloseTo(1, 2);
  });

  it('does not charge a company for consuming its goodwill', () => {
    // Goodwill is tested for impairment, not amortised. Charging it made AMD —
    // 24bn of Xilinx goodwill against 1.7bn of plant — look like it was
    // consuming a fab every year.
    const withGoodwill = 21.7 + 24;
    const withoutGoodwill = 21.7;
    const da = 4.5;
    const life = (b: number) => Math.max(3, Math.min(120, Math.round((2 * b) / da - 1)));
    const chargeFor = (b: number, l: number) => buildVintageSchedule({
      baseYear: 2025, years: 5, openingBalance: b, openingLife: l,
      additions: new Array(5).fill(0), lifeFor: () => l,
    }).rows[0].charge;

    // Reconciles on the amortising base alone.
    expect(chargeFor(withoutGoodwill, life(withoutGoodwill)) / da).toBeCloseTo(1, 1);
    // And the life read off a goodwill-inflated base is not the same number.
    expect(life(withGoodwill)).toBeGreaterThan(life(withoutGoodwill) * 2);
  });
});

describe('operating margin reconciles with the statement it was read from', () => {
  /* The engine charges depreciation from its own schedule, so the cost ratios
     it is handed must be free of it. Taking the whole D&A charge out of COGS
     assumes that is where it sits — true for a manufacturer, false for a REIT,
     a utility or a services business, where it sits in operating expenses. Then
     SG&A carries its depreciation and is charged again from the schedule, while
     COGS has a charge removed that was never in it. Where D&A exceeded COGS the
     subtraction went negative and an abs turned it back into a cost, inventing
     expense out of the sign: Realty Income came out at -25.5% against the 39%
     it reports. */
  function ratiosFrom(p: {
    revenue: number; ebit: number; da: number; cogs: number; sga: number;
  }): { cogsPct: number; sgaPct: number } {
    const cashCost = p.revenue - p.ebit - p.da;
    const reported = p.cogs + p.sga;
    const cogsShare = reported > 0 ? p.cogs / reported : 1;
    return {
      cogsPct: (cashCost * cogsShare) / p.revenue,
      sgaPct: (cashCost * (1 - cogsShare)) / p.revenue,
    };
  }

  const modelledMargin = (p: { revenue: number; ebit: number; da: number; cogs: number; sga: number }) => {
    const { cogsPct, sgaPct } = ratiosFrom(p);
    // What the engine computes: revenue less the cost ratios, less its own D&A.
    return (p.revenue * (1 - cogsPct - sgaPct) - p.da) / p.revenue;
  };

  it('reconciles for a manufacturer, where depreciation sits in cost of sales', () => {
    const p = { revenue: 100, ebit: 31, da: 3, cogs: 55, sga: 13 };
    expect(modelledMargin(p)).toBeCloseTo(p.ebit / p.revenue, 10);
  });

  it('reconciles for a property owner, where depreciation dwarfs cost of sales', () => {
    // Realty Income: 6.3bn of rent, 2.35bn of depreciation, almost no COGS.
    // The old subtraction went negative here and came back as a 35% cost.
    const p = { revenue: 6.3, ebit: 2.46, da: 2.35, cogs: 0.2, sga: 1.29 };
    expect(modelledMargin(p)).toBeCloseTo(p.ebit / p.revenue, 10);
    const { cogsPct } = ratiosFrom(p);
    expect(cogsPct).toBeGreaterThanOrEqual(0);
    expect(cogsPct).toBeLessThan(0.05);
  });

  it('reconciles for a utility, where depreciation sits in operating expenses', () => {
    // NextEra: charging SG&A its own depreciation and then the schedule's put
    // the margin at 17.8% against the 50.1% reported.
    const p = { revenue: 27.1, ebit: 13.6, da: 7.5, cogs: 3.2, sga: 11.6 };
    expect(modelledMargin(p)).toBeCloseTo(p.ebit / p.revenue, 10);
  });

  it('reconciles across the universe, not just the easy shapes', () => {
    const off: string[] = [];
    for (const bp of BLUEPRINTS) {
      const annuals = buildAnnualPeriods(bp);
      const last = annuals[annuals.length - 1];
      const revenue = last.income.revenue ?? 0;
      const ebit = last.income.ebit;
      if (revenue <= 0 || ebit == null) continue;
      const p = {
        revenue,
        ebit,
        da: Math.abs(last.income.da ?? 0),
        cogs: Math.abs(last.income.cogs ?? 0),
        sga: Math.abs(last.income.sga ?? 0) + Math.abs(last.income.rnd ?? 0),
      };
      if (p.revenue - p.ebit - p.da < 0) continue;
      const gap = Math.abs(modelledMargin(p) - p.ebit / p.revenue);
      if (gap > 1e-9) off.push(`${bp.profile.ticker} ${(gap * 100).toFixed(1)}pts`);
    }
    expect(off).toEqual([]);
  });

  it('never turns a missing cost line into an invented one', () => {
    // The failure mode was a sign flip, so the ratios must stay non-negative
    // whatever the statement looks like.
    const p = { revenue: 10, ebit: 4, da: 5, cogs: 0, sga: 1 };
    const { cogsPct, sgaPct } = ratiosFrom(p);
    expect(cogsPct).toBeGreaterThanOrEqual(0);
    expect(sgaPct).toBeGreaterThanOrEqual(0);
    expect(cogsPct + sgaPct).toBeCloseTo(0.1, 10);
  });
});
