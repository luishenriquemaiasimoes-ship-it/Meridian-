/**
 * Derives the cross-sectional spread of sustainable growth rates from the
 * universe, and prints what each company's trailing rate shrinks to.
 *
 * A single company's five-year window gives a growth mean with a large standard
 * error, so the projection does not extrapolate it raw — it weights it against
 * the long-run rate by how much of it is signal. That weighting needs one number
 * the individual company cannot supply: how far apart companies' underlying
 * rates genuinely are. This derives it the only way it can be derived, from the
 * cross-section: the spread of observed means, less the average sampling noise
 * inside each window.
 *
 * Run with: npm run audit:growth
 */
import { BLUEPRINTS } from '../src/lib/data-providers/mock/blueprints';
import { buildAnnualPeriods } from '../src/lib/data-providers/mock/generator';
import { mean, isNum } from '../src/lib/finance/core';
import {
  shrinkGrowth, CROSS_SECTIONAL_GROWTH_SPREAD, GROWTH_PRIOR_EXCESS,
} from '../src/server/services/projection';

const LONG_RUN: Record<string, number> = { BRL: 0.055, USD: 0.04, EUR: 0.03 };

/**
 * The same growth series the projection reads: every reported year, not the
 * recent slice the cost ratios use. The prior has to be derived from the data
 * the model actually sees, or the standard errors it weights against are
 * measured on a different number of observations than the ones it weights.
 */
export function yearlyGrowthOf(ticker: string): number[] {
  const bp = BLUEPRINTS.find((b) => b.profile.ticker === ticker);
  if (!bp) return [];
  const annuals = buildAnnualPeriods(bp);
  return annuals.slice(1).map((p, i) => {
    const prior = annuals[i].income.revenue;
    return isNum(p.income.revenue) && isNum(prior) && (prior as number) !== 0
      ? (p.income.revenue as number) / Math.abs(prior as number) - 1
      : null;
  }).filter((g): g is number => g !== null);
}

/**
 * The population these estimates are weighted against, measured in excess over
 * each currency's long-run nominal rate so currencies with different inflation
 * are comparable.
 *
 * The centre is where large listed companies actually sit, not where the
 * economy sits. The spread is the observed spread net of the sampling noise
 * inside each company's own window — what is genuinely different between
 * companies rather than what is different between five-year windows.
 */
export function deriveGrowthPrior(): { excess: number; spread: number } {
  const obs = BLUEPRINTS.map((bp) => {
    const gs = yearlyGrowthOf(bp.profile.ticker);
    if (gs.length < 2) return null;
    const m = mean(gs) as number;
    const variance = gs.reduce((s, g) => s + (g - m) ** 2, 0) / (gs.length - 1);
    return { excess: m - (LONG_RUN[bp.profile.currency] ?? 0.04), se2: variance / gs.length };
  }).filter((o): o is { excess: number; se2: number } => o !== null);

  const centre = mean(obs.map((o) => o.excess)) as number;
  const observedVar = obs.reduce((s, o) => s + (o.excess - centre) ** 2, 0) / (obs.length - 1);
  const noiseVar = mean(obs.map((o) => o.se2)) as number;
  return { excess: centre, spread: Math.sqrt(Math.max(observedVar - noiseVar, 0)) };
}

if (process.argv[1]?.includes('audit-growth')) {
  const prior = deriveGrowthPrior();
  console.log(`\nMERIDIAN — growth prior\n`);
  console.log(`  derived centre          ${(prior.excess * 100).toFixed(1)} pts over long-run nominal`);
  console.log(`  constant in the model   ${(GROWTH_PRIOR_EXCESS * 100).toFixed(1)} pts`);
  console.log(`  derived spread          ${(prior.spread * 100).toFixed(1)} pts`);
  console.log(`  constant in the model   ${(CROSS_SECTIONAL_GROWTH_SPREAD * 100).toFixed(1)} pts\n`);

  const rows = BLUEPRINTS.map((bp) => {
    const gs = yearlyGrowthOf(bp.profile.ticker);
    const lr = LONG_RUN[bp.profile.currency] ?? 0.04;
    const s = shrinkGrowth(gs, lr);
    return { t: bp.profile.ticker, raw: mean(gs) ?? lr, ...s };
  }).sort((a, b) => a.weight - b.weight);

  console.log('  tkr      trailing%    s.e.%   weight   used%');
  for (const r of rows) {
    console.log(
      `  ${r.t.padEnd(8)}${(r.raw * 100).toFixed(1).padStart(9)}`
      + `${(r.standardError * 100).toFixed(1).padStart(9)}${r.weight.toFixed(3).padStart(9)}`
      + `${(r.growth * 100).toFixed(1).padStart(8)}`,
    );
  }
}
