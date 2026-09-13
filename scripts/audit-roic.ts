/**
 * Prints ROIC against WACC for every company where the comparison means
 * something, sorted by spread.
 *
 * It exists because a ROIC below WACC has two possible causes that look
 * identical in a table — a business that genuinely does not earn its cost of
 * capital, and a metric applied where it does not belong — and the only way to
 * tell them apart is to look at the whole distribution at once. Banks and
 * property owners are excluded here for the same reason the product excludes
 * them: their invested capital is not the capital the business runs on.
 *
 * Run with: npm run audit:roic
 */
import { BLUEPRINTS, isBankLike, isPropertyLike } from '../src/lib/data-providers/mock/blueprints';
import { buildAnnualPeriods } from '../src/lib/data-providers/mock/generator';
import { calculateRoic } from '../src/lib/finance/roic';
import { buildWacc } from '../src/lib/finance/wacc';
import { ratesForCurrency } from '../src/server/services/metrics';
import { sum } from '../src/lib/finance/core';

interface Row {
  ticker: string; country: string; sector: string;
  roic: number; wacc: number; spread: number;
  capitalToRevenue: number; acquiredShare: number; turnover: number;
}

const rows: Row[] = [];

for (const bp of BLUEPRINTS) {
  const p = bp.profile;
  if (isBankLike(p.industry) || isPropertyLike(p.industry)) continue;
  if (/Insurance|Capital Markets|Financial Services/.test(p.industry)) continue;

  const annuals = buildAnnualPeriods(bp);
  const last = annuals[annuals.length - 1];
  const prior = annuals[annuals.length - 2];
  const rates = ratesForCurrency(p.currency);
  const b = last.balance;

  const grossDebt = sum(b.shortTermDebt, b.longTermDebt, b.leaseLiabilities) ?? 0;
  const impliedKd = Math.abs(last.income.financialResult ?? 0) / (grossDebt || 1);
  const w = buildWacc({
    riskFreeRate: rates.riskFreeRate,
    beta: bp.anchors.beta,
    equityRiskPremium: rates.equityRiskPremium,
    costOfDebt: impliedKd > 0.005 && impliedKd < 0.5 ? impliedKd : rates.riskFreeRate + 0.02,
    taxRate: rates.statutoryTaxRate,
    marketValueEquity: bp.anchors.shares * bp.anchors.price,
    marketValueDebt: grossDebt,
  });
  const r = calculateRoic(last, prior, rates.statutoryTaxRate);
  if (r.roic == null || w.wacc == null || r.investedCapital == null) continue;

  rows.push({
    ticker: p.ticker, country: p.country, sector: p.sector,
    roic: r.roic, wacc: w.wacc, spread: r.roic - w.wacc,
    capitalToRevenue: r.investedCapital / (last.income.revenue ?? 1),
    acquiredShare: ((b.goodwill ?? 0) + (b.intangibles ?? 0)) / r.investedCapital,
    turnover: r.capitalTurnover ?? 0,
  });
}

const pct = (x: number) => `${(x * 100).toFixed(1).padStart(6)}%`;
rows.sort((a, b) => a.spread - b.spread);

console.log(`${rows.length} companies where ROIC is a meaningful measure\n`);
console.log('TICKER  SECTOR                    ROIC    WACC  SPREAD  CAP/REV  ACQ%  TURN');
for (const r of rows) {
  console.log(
    `${r.ticker.padEnd(7)} ${r.sector.slice(0, 22).padEnd(24)} ${pct(r.roic)} ${pct(r.wacc)} ` +
    `${pct(r.spread)}  ${r.capitalToRevenue.toFixed(2)}x  ${(r.acquiredShare * 100).toFixed(0).padStart(3)}%  ${r.turnover.toFixed(2)}x`,
  );
}

console.log('\nA negative spread is only a finding once the cost of capital is accounted for.');
for (const country of ['Brazil', 'United States']) {
  const all = rows.filter((r) => r.country === country);
  if (!all.length) continue;
  const below = all.filter((r) => r.spread < 0);
  const avgWacc = all.reduce((a, r) => a + r.wacc, 0) / all.length;
  console.log(
    `  ${country.padEnd(15)} ${below.length}/${all.length} below WACC ` +
    `(${((below.length / all.length) * 100).toFixed(0)}%), average WACC ${(avgWacc * 100).toFixed(1)}%`,
  );
}
