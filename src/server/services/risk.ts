import {
  getPortfolioAnalytics, PORTFOLIO_SCENARIOS, type PortfolioAnalytics,
} from './portfolio';
import { getUniverseMetrics } from './metrics';
import { buildMetricUniverse, companyFactorInput } from './screener';
import { applyScenario, maxDrawdown } from '@/lib/finance/risk';
import {
  FACTOR_DEFINITIONS, scoreAllFactors, type FactorKey,
} from '@/lib/finance/factors';
import { isNum } from '@/lib/finance/core';

/**
 * Portfolio factor exposure. Each holding is scored cross-sectionally against
 * the whole universe, then the scores are weighted by position weight. Holdings
 * without a score are excluded and the remaining weights renormalised, so the
 * coverage figure says how much of the book the exposure actually describes.
 */
export interface FactorExposureRow {
  factor: FactorKey;
  label: string;
  description: string;
  portfolio: number | null;
  benchmark: number | null;
  active: number | null;
  coverage: number;
  /** The three holdings pulling the exposure hardest in each direction. */
  leaders: { ticker: string; weight: number; score: number }[];
  laggards: { ticker: string; weight: number; score: number }[];
}

export interface DrawdownPoint {
  date: string;
  portfolio: number;
  benchmark: number;
}

export interface PortfolioRiskProfile {
  analytics: PortfolioAnalytics;
  factorExposure: FactorExposureRow[];
  drawdown: {
    series: DrawdownPoint[];
    worst: {
      depth: number | null; peakDate: string | null; troughDate: string | null;
      recoveryDate: string | null; lengthDays: number | null; recoveryDays: number | null;
    };
    current: number | null;
  };
  scenarios: ReturnType<typeof applyScenario>[];
  /** Position-level stress: worst single-scenario loss for each holding. */
  stressByPosition: {
    ticker: string; name: string; sector: string; weight: number;
    worstScenario: string; worstImpact: number; worstContribution: number;
    valueAtRisk: number | null;
  }[];
  valueAtRisk: {
    horizon: string; confidence: number;
    historical: number | null; parametric: number | null; conditional: number | null;
    historicalValue: number | null; conditionalValue: number | null;
  }[];
}

const FACTOR_KEYS = Object.keys(FACTOR_DEFINITIONS) as FactorKey[];

export async function getPortfolioRiskProfile(
  workspaceId: string,
  portfolioId?: string,
): Promise<PortfolioRiskProfile | null> {
  const analytics = await getPortfolioAnalytics(workspaceId, portfolioId);
  if (!analytics) return null;

  const all = await getUniverseMetrics();
  const universe = buildMetricUniverse(all);
  const scoresByTicker = new Map<string, Partial<Record<FactorKey, number | null>>>();
  for (const m of all) {
    const scored = scoreAllFactors(companyFactorInput(m), universe);
    const rec: Partial<Record<FactorKey, number | null>> = {};
    for (const s of scored) rec[s.factor] = s.score;
    scoresByTicker.set(m.ticker, rec);
  }

  // The benchmark is the investable universe on the same side of the border as
  // the book's benchmark index, equal-weighted — an explicit, auditable proxy.
  const benchUniverse = all.filter((m) =>
    analytics.portfolio.benchmarkCode === 'IBOV' ? m.country === 'Brazil' : m.country !== 'Brazil',
  );

  const holdings = analytics.summary.positions
    .filter((p) => isNum(p.weight))
    .map((p) => ({ ticker: p.ticker, weight: p.weight as number }));

  const factorExposure: FactorExposureRow[] = FACTOR_KEYS.map((factor) => {
    const def = FACTOR_DEFINITIONS[factor];
    const scored = holdings
      .map((h) => ({ ...h, score: scoresByTicker.get(h.ticker)?.[factor] ?? null }))
      .filter((h): h is { ticker: string; weight: number; score: number } => isNum(h.score));
    const covered = scored.reduce((s, h) => s + h.weight, 0);
    const totalWeight = holdings.reduce((s, h) => s + h.weight, 0);
    const portfolio = covered > 0
      ? scored.reduce((s, h) => s + h.weight * h.score, 0) / covered
      : null;

    const benchScores = benchUniverse
      .map((m) => scoresByTicker.get(m.ticker)?.[factor] ?? null)
      .filter((v): v is number => isNum(v));
    const benchmark = benchScores.length
      ? benchScores.reduce((s, v) => s + v, 0) / benchScores.length
      : null;

    const ranked = scored.slice().sort((a, b) => b.score - a.score);
    return {
      factor,
      label: def.label,
      description: def.description,
      portfolio,
      benchmark,
      active: isNum(portfolio) && isNum(benchmark) ? (portfolio as number) - (benchmark as number) : null,
      coverage: totalWeight > 0 ? covered / totalWeight : 0,
      leaders: ranked.slice(0, 3),
      laggards: ranked.slice(-3).reverse(),
    };
  });

  /* ------------------------------ Drawdown ------------------------------ */
  // Drawdown is a performance statement, so it is measured on the unit value:
  // a subscription raises the NAV without making the book any less underwater.
  const navValues = analytics.navSeries.map((p) => p.unitValue);
  const benchValues = analytics.navSeries.map((p) => p.benchmark);
  const dates = analytics.navSeries.map((p) => p.date);
  const ddPort = maxDrawdown(navValues);
  const ddBench = maxDrawdown(benchValues);
  const dayDiff = (a: string | null, b: string | null): number | null =>
    a && b ? Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000) : null;
  const at = (i: number | null): string | null => (i === null ? null : dates[i] ?? null);

  const drawdown = {
    series: dates.map((date, i) => ({
      date,
      portfolio: ddPort.series[i] ?? 0,
      benchmark: ddBench.series[i] ?? 0,
    })),
    worst: {
      depth: ddPort.maxDrawdown,
      peakDate: at(ddPort.peakIndex),
      troughDate: at(ddPort.troughIndex),
      recoveryDate: at(ddPort.recoveryIndex),
      lengthDays: dayDiff(at(ddPort.peakIndex), at(ddPort.troughIndex)),
      recoveryDays: dayDiff(at(ddPort.troughIndex), at(ddPort.recoveryIndex)),
    },
    current: ddPort.currentDrawdown,
  };

  /* ------------------------------ Scenarios ----------------------------- */
  const scenarioPositions = analytics.summary.positions.map((p) => ({
    ticker: p.ticker, name: p.name, sector: p.sector, weight: p.weight, beta: p.beta,
  }));
  const scenarios = PORTFOLIO_SCENARIOS.map((s) => applyScenario(scenarioPositions, s));

  const total = analytics.summary.totalMarketValue;
  const stressByPosition = analytics.summary.positions
    .filter((p) => isNum(p.weight))
    .map((p) => {
      let worst = { name: '', impact: 0, contribution: 0 };
      let first = true;
      for (const s of scenarios) {
        const row = s.rows.find((r) => r.ticker === p.ticker);
        if (!row) continue;
        if (first || row.impact < worst.impact) {
          worst = { name: s.scenario.name, impact: row.impact, contribution: row.contribution };
          first = false;
        }
      }
      return {
        ticker: p.ticker,
        name: p.name,
        sector: p.sector ?? 'Unclassified',
        weight: p.weight as number,
        worstScenario: worst.name,
        worstImpact: worst.impact,
        worstContribution: worst.contribution,
        valueAtRisk: isNum(total) && isNum(p.marketValue)
          ? (p.marketValue as number) * worst.impact
          : null,
      };
    })
    .sort((a, b) => a.worstContribution - b.worstContribution);

  /* --------------------------------- VaR -------------------------------- */
  // Daily VaR is measured on the NAV series; the multi-day figures scale by the
  // square root of time, which is an approximation and is labelled as such.
  const daily = analytics.performance;
  const scale = (v: number | null, days: number): number | null =>
    isNum(v) ? (v as number) * Math.sqrt(days) : null;
  const money = (v: number | null): number | null =>
    isNum(v) && isNum(total) ? (v as number) * (total as number) : null;

  const valueAtRisk = [
    { horizon: '1 day', days: 1 },
    { horizon: '1 week', days: 5 },
    { horizon: '1 month', days: 21 },
  ].map((h) => {
    const hist = scale(daily.var95, h.days);
    const cond = scale(daily.cvar95, h.days);
    const param = isNum(daily.volatility)
      ? -1.6448536269514722 * ((daily.volatility as number) / Math.sqrt(252)) * Math.sqrt(h.days)
      : null;
    return {
      horizon: h.horizon,
      confidence: 0.95,
      historical: hist,
      parametric: param,
      conditional: cond,
      historicalValue: money(hist),
      conditionalValue: money(cond),
    };
  });

  return { analytics, factorExposure, drawdown, scenarios, stressByPosition, valueAtRisk };
}
