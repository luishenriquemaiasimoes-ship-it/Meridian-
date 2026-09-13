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
  shrinkGrowth, CROSS_SECTIONAL_GROWTH_SPREAD, GROWTH_PRIOR_EXCESS, SECTOR_GROWTH_EXCESS,
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

interface Observation { sector: string; excess: number; se2: number }

function observations(): Observation[] {
  return BLUEPRINTS.map((bp) => {
    const gs = yearlyGrowthOf(bp.profile.ticker);
    if (gs.length < 2) return null;
    const m = mean(gs) as number;
    const variance = gs.reduce((s, g) => s + (g - m) ** 2, 0) / (gs.length - 1);
    return {
      sector: bp.profile.sector,
      excess: m - (LONG_RUN[bp.profile.currency] ?? 0.04),
      se2: variance / gs.length,
    };
  }).filter((o): o is Observation => o !== null);
}

/** Spread of a set of values, net of the average sampling noise inside each. */
function spreadNetOfNoise(values: number[], noiseVars: number[]): number {
  const m = mean(values) as number;
  const observed = values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(Math.max(observed - (mean(noiseVars) as number), 0));
}

/**
 * The population a company's own trailing rate is weighted against, measured in
 * excess over its currency's long-run nominal rate so currencies with different
 * inflation are comparable.
 *
 * The centre is where large listed companies actually sit, not where the economy
 * sits. The spread is what is genuinely different between companies rather than
 * between five-year windows.
 */
export function deriveGrowthPrior(): { excess: number; spread: number } {
  const obs = observations();
  return {
    excess: mean(obs.map((o) => o.excess)) as number,
    spread: spreadNetOfNoise(obs.map((o) => o.excess), obs.map((o) => o.se2)),
  };
}

/**
 * The same thing one level down: what each sector grows at, weighted against the
 * universe by how well its own members pin it down.
 *
 * A company is more like its sector than like the universe, and the sectors are
 * genuinely apart — 4.3 points of spread between them against 2.5 points of
 * noise in any one sector's mean. Materials run 4.4 points BELOW their
 * economies' nominal growth and information technology 12.8 above, so weighting
 * a miner and a semiconductor designer against the same 4.5-point average is
 * using a prior neither of them belongs to.
 */
export function deriveSectorPriors(): Record<string, number> {
  const obs = observations();
  const global = mean(obs.map((o) => o.excess)) as number;

  const groups: Record<string, Observation[]> = {};
  for (const o of obs) (groups[o.sector] ??= []).push(o);

  const sectors = Object.entries(groups).map(([sector, members]) => {
    const m = mean(members.map((x) => x.excess)) as number;
    const within = members.length > 1
      ? members.reduce((a, x) => a + (x.excess - m) ** 2, 0) / (members.length - 1)
      : 0;
    return { sector, mean: m, se2: within / members.length };
  });

  const tau = spreadNetOfNoise(sectors.map((s) => s.mean), sectors.map((s) => s.se2));
  const out: Record<string, number> = {};
  for (const s of sectors) {
    const weight = tau ** 2 / (tau ** 2 + s.se2);
    out[s.sector] = weight * s.mean + (1 - weight) * global;
  }
  return out;
}

if (process.argv[1]?.includes('audit-growth')) {
  const prior = deriveGrowthPrior();
  const sectors = deriveSectorPriors();
  console.log(`\nMERIDIAN — growth prior\n`);
  console.log(`  universe centre   derived ${(prior.excess * 100).toFixed(1)} pts over long-run nominal`
    + `   in model ${(GROWTH_PRIOR_EXCESS * 100).toFixed(1)}`);
  console.log(`  universe spread   derived ${(prior.spread * 100).toFixed(1)} pts`
    + `   in model ${(CROSS_SECTIONAL_GROWTH_SPREAD * 100).toFixed(1)}\n`);

  console.log('  sector                            derived   in model');
  for (const [s, v] of Object.entries(sectors).sort((a, b) => a[1] - b[1])) {
    console.log(`  ${s.padEnd(30)}${(v * 100).toFixed(1).padStart(9)}`
      + `${((SECTOR_GROWTH_EXCESS[s] ?? NaN) * 100).toFixed(1).padStart(11)}`);
  }

  const rows = BLUEPRINTS.map((bp) => {
    const gs = yearlyGrowthOf(bp.profile.ticker);
    const lr = LONG_RUN[bp.profile.currency] ?? 0.04;
    const s = shrinkGrowth(gs, lr, bp.profile.sector);
    return { t: bp.profile.ticker, sector: bp.profile.sector, raw: mean(gs) ?? lr, ...s };
  }).sort((a, b) => a.weight - b.weight);

  console.log('\n  tkr      trailing%    s.e.%   weight    prior%    used%');
  for (const r of rows) {
    console.log(
      `  ${r.t.padEnd(8)}${(r.raw * 100).toFixed(1).padStart(9)}`
      + `${(r.standardError * 100).toFixed(1).padStart(9)}${r.weight.toFixed(3).padStart(9)}`
      + `${(r.prior * 100).toFixed(1).padStart(10)}${(r.growth * 100).toFixed(1).padStart(9)}`,
    );
  }
}
