import { describe, expect, it } from 'vitest';
import { annualYears, factFor, statementsFor, type CompanyFacts } from '@/lib/data-providers/live/sec';

/* US GAAP fixes the tag names and lets each filer pick which to use, which is
   the mirror image of the CVM's problem. These fixtures are shaped like the
   SEC's actual companyfacts payload, including the parts that mislead a naive
   reader: quarterly points sitting beside annual ones under the same concept,
   a restatement filed later than the original, and a filer using an older
   revenue tag than the one most companies use now. */

function point(o: Partial<{ start: string; end: string; val: number; fy: number; fp: string; form: string; filed: string }>) {
  return { end: '2024-12-31', val: 0, fy: 2024, fp: 'FY', form: '10-K', filed: '2025-02-01', ...o };
}

const usd = (points: ReturnType<typeof point>[]) => ({ units: { USD: points } });

const facts: CompanyFacts = {
  cik: 320193,
  entityName: 'TEST FILER INC',
  facts: {
    'us-gaap': {
      // A duration concept with a quarter and a year under the same key.
      RevenueFromContractWithCustomerExcludingAssessedTax: usd([
        point({ start: '2024-01-01', end: '2024-12-31', val: 400_000_000_000 }),
        point({ start: '2024-10-01', end: '2024-12-31', val: 120_000_000_000, fp: 'Q4', form: '10-Q' }),
        point({ start: '2023-01-01', end: '2023-12-31', val: 380_000_000_000, fy: 2023, filed: '2024-02-01' }),
      ]),
      CostOfGoodsAndServicesSold: usd([point({ start: '2024-01-01', end: '2024-12-31', val: 210_000_000_000 })]),
      OperatingIncomeLoss: usd([
        // An original filing and a later restatement of the same year.
        point({ start: '2024-01-01', end: '2024-12-31', val: 120_000_000_000, filed: '2025-02-01' }),
        point({ start: '2024-01-01', end: '2024-12-31', val: 123_000_000_000, filed: '2025-11-01' }),
      ]),
      NetIncomeLoss: usd([point({ start: '2024-01-01', end: '2024-12-31', val: 95_000_000_000 })]),
      SellingGeneralAndAdministrativeExpense: usd([point({ start: '2024-01-01', end: '2024-12-31', val: 25_000_000_000 })]),
      ResearchAndDevelopmentExpense: usd([point({ start: '2024-01-01', end: '2024-12-31', val: 30_000_000_000 })]),
      IncomeTaxExpenseBenefit: usd([point({ start: '2024-01-01', end: '2024-12-31', val: 17_000_000_000 })]),

      // Instant concepts carry no start.
      Assets: usd([point({ val: 360_000_000_000 })]),
      AssetsCurrent: usd([point({ val: 150_000_000_000 })]),
      CashAndCashEquivalentsAtCarryingValue: usd([point({ val: 30_000_000_000 })]),
      AccountsReceivableNetCurrent: usd([point({ val: 60_000_000_000 })]),
      InventoryNet: usd([point({ val: 7_000_000_000 })]),
      PropertyPlantAndEquipmentNet: usd([point({ val: 45_000_000_000 })]),
      Goodwill: usd([point({ val: 24_000_000_000 })]),
      IntangibleAssetsNetExcludingGoodwill: usd([point({ val: 20_000_000_000 })]),
      Liabilities: usd([point({ val: 280_000_000_000 })]),
      LiabilitiesCurrent: usd([point({ val: 140_000_000_000 })]),
      AccountsPayableCurrent: usd([point({ val: 65_000_000_000 })]),
      LongTermDebtCurrent: usd([point({ val: 10_000_000_000 })]),
      LongTermDebtNoncurrent: usd([point({ val: 90_000_000_000 })]),
      StockholdersEquity: usd([point({ val: 80_000_000_000 })]),
      RetainedEarningsAccumulatedDeficit: usd([point({ val: 15_000_000_000 })]),
      TreasuryStockValue: usd([point({ val: 5_000_000_000 })]),

      NetCashProvidedByUsedInOperatingActivities: usd([point({ start: '2024-01-01', end: '2024-12-31', val: 118_000_000_000 })]),
      NetCashProvidedByUsedInInvestingActivities: usd([point({ start: '2024-01-01', end: '2024-12-31', val: -12_000_000_000 })]),
      NetCashProvidedByUsedInFinancingActivities: usd([point({ start: '2024-01-01', end: '2024-12-31', val: -110_000_000_000 })]),
      DepreciationDepletionAndAmortization: usd([point({ start: '2024-01-01', end: '2024-12-31', val: 11_000_000_000 })]),
      PaymentsToAcquirePropertyPlantAndEquipment: usd([point({ start: '2024-01-01', end: '2024-12-31', val: 9_000_000_000 })]),
      PaymentsForRepurchaseOfCommonStock: usd([point({ start: '2024-01-01', end: '2024-12-31', val: 90_000_000_000 })]),
      PaymentsOfDividendsCommonStock: usd([point({ start: '2024-01-01', end: '2024-12-31', val: 15_000_000_000 })]),
    },
  },
};

describe('reading one concept out of the facts', () => {
  it('takes the annual point, not the quarter filed under the same concept', () => {
    const hit = factFor(facts, ['RevenueFromContractWithCustomerExcludingAssessedTax'], 2024, 'duration');
    expect(hit?.value).toBe(400_000_000_000);
  });

  it('takes the restatement over the original, because that is what the company now says', () => {
    const hit = factFor(facts, ['OperatingIncomeLoss'], 2024, 'duration');
    expect(hit?.value).toBe(123_000_000_000);
  });

  it('does not read a balance-sheet instant as a period figure', () => {
    // Assets has no start. Asking for it as a duration must find nothing
    // rather than treating a stock as a flow.
    expect(factFor(facts, ['Assets'], 2024, 'duration')).toBeNull();
    expect(factFor(facts, ['Assets'], 2024, 'instant')?.value).toBe(360_000_000_000);
  });

  it('falls through the chain to whichever tag the filer actually used', () => {
    const older: CompanyFacts = {
      cik: 1, entityName: 'OLD FILER',
      facts: { 'us-gaap': { SalesRevenueNet: usd([point({ start: '2024-01-01', end: '2024-12-31', val: 5_000_000_000 })]) } },
    };
    const hit = factFor(older, ['RevenueFromContractWithCustomerExcludingAssessedTax', 'Revenues', 'SalesRevenueNet'], 2024, 'duration');
    expect(hit?.value).toBe(5_000_000_000);
    expect(hit?.concept).toBe('SalesRevenueNet');
  });

  it('returns null for a year the filer has not reported', () => {
    expect(factFor(facts, ['NetIncomeLoss'], 2019, 'duration')).toBeNull();
  });

  it('lists the years with a full annual figure', () => {
    expect(annualYears(facts)).toEqual([2023, 2024]);
  });
});

describe('assembling the three statements', () => {
  const s = statementsFor(facts, 2024)!;

  it('reports in millions, as the rest of the platform does', () => {
    expect(s.income.revenue).toBeCloseTo(400_000, 6);
    expect(s.balance.totalAssets).toBeCloseTo(360_000, 6);
    expect(s.cashFlow.cfo).toBeCloseTo(118_000, 6);
  });

  it('balances', () => {
    expect((s.balance.totalLiabilities ?? 0) + (s.balance.totalEquity ?? 0))
      .toBeCloseTo(s.balance.totalAssets as number, 6);
  });

  it('keeps goodwill separate from other intangibles', () => {
    // The CVM cannot split these; the SEC tags them apart, and the amortising
    // base depends on the difference.
    expect(s.balance.goodwill).toBeCloseTo(24_000, 6);
    expect(s.balance.intangibles).toBeCloseTo(20_000, 6);
  });

  it('signs capex, buybacks and dividends as outflows', () => {
    // All three are filed as positive payments.
    expect(s.cashFlow.capex).toBeCloseTo(-9_000, 6);
    expect(s.cashFlow.buybacks).toBeCloseTo(-90_000, 6);
    expect(s.cashFlow.dividendsPaid).toBeCloseTo(-15_000, 6);
    expect(s.balance.treasuryStock).toBeCloseTo(-5_000, 6);
  });

  it('carries depreciation onto the income statement, where the engine reads it', () => {
    expect(s.cashFlow.da).toBeCloseTo(11_000, 6);
    expect(s.income.da).toBeCloseTo(11_000, 6);
    expect(s.income.ebitda).toBeCloseTo(123_000 + 11_000, 6);
  });

  it('derives the residual lines from the filer own subtotals', () => {
    // Current assets 150,000 less cash 30,000, receivables 60,000, inventory 7,000.
    expect(s.balance.otherCurrentAssets).toBeCloseTo(53_000, 6);
    // Total 360,000 less current 150,000 leaves 210,000 non-current; less
    // PP&E 45,000, goodwill 24,000 and intangibles 20,000.
    expect(s.balance.otherAssets).toBeCloseTo(121_000, 6);
  });

  it('records which tag each line came from', () => {
    // The mapping is the part most likely to be wrong for an unusual filer, so
    // it has to be inspectable rather than buried.
    expect(s.concepts.revenue).toBe('RevenueFromContractWithCustomerExcludingAssessedTax');
    expect(s.concepts.ebit).toBe('OperatingIncomeLoss');
    expect(s.concepts.goodwill).toBe('Goodwill');
  });

  it('returns null for a year with no revenue rather than an empty statement', () => {
    expect(statementsFor(facts, 2015)).toBeNull();
  });

  it('leaves a line nobody tagged null instead of zero', () => {
    // This filer tagged no lease liability. A zero would say it has none.
    expect(s.balance.leaseLiabilities).toBeNull();
    expect(s.income.financialResult).toBeNull();
  });
});
