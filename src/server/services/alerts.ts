import { prisma } from '@/lib/db';
import { getMetricsMap, type CompanyMetrics } from './metrics';
import { getPortfolioAnalytics } from './portfolio';
import { formatMetric, type MetricFormat } from '@/lib/finance/format';
import { isNum } from '@/lib/finance/core';

/* ===========================  ALERT ENGINE  =========================== */

export type AlertComparator = 'GT' | 'GTE' | 'LT' | 'LTE' | 'CROSSES_ABOVE' | 'CROSSES_BELOW';

export const ALERT_METRICS: Record<string, { label: string; format: MetricFormat; category: string }> = {
  price: { label: 'Price', format: 'currency', category: 'PRICE' },
  dailyChangePct: { label: 'Daily change', format: 'percent', category: 'PRICE' },
  return12m: { label: '12-month return', format: 'percent', category: 'PRICE' },
  evEbitda: { label: 'EV / EBITDA', format: 'multiple', category: 'VALUATION' },
  pe: { label: 'P / E', format: 'multiple', category: 'VALUATION' },
  pb: { label: 'P / Book', format: 'multiple', category: 'VALUATION' },
  fcfYield: { label: 'FCF yield', format: 'percent', category: 'VALUATION' },
  dividendYield: { label: 'Dividend yield', format: 'percent', category: 'VALUATION' },
  roic: { label: 'ROIC', format: 'percent', category: 'FUNDAMENTAL' },
  roe: { label: 'ROE', format: 'percent', category: 'FUNDAMENTAL' },
  roicSpread: { label: 'ROIC − WACC', format: 'percent', category: 'FUNDAMENTAL' },
  ebitdaMargin: { label: 'EBITDA margin', format: 'percent', category: 'FUNDAMENTAL' },
  revenueGrowth: { label: 'Revenue growth', format: 'percent', category: 'FUNDAMENTAL' },
  netDebtToEbitda: { label: 'Net debt / EBITDA', format: 'multiple', category: 'FUNDAMENTAL' },
  interestCoverage: { label: 'Interest coverage', format: 'multiple', category: 'FUNDAMENTAL' },
  portfolioWeight: { label: 'Portfolio weight', format: 'percent', category: 'PORTFOLIO' },
  upsideToTarget: { label: 'Upside to target', format: 'percent', category: 'THESIS' },
};

export const COMPARATOR_LABELS: Record<AlertComparator, string> = {
  GT: 'is above', GTE: 'is at or above', LT: 'is below', LTE: 'is at or below',
  CROSSES_ABOVE: 'crosses above', CROSSES_BELOW: 'crosses below',
};

function triggered(value: number | null, comparator: string, threshold: number, previous?: number | null): boolean {
  if (!isNum(value)) return false;
  const v = value as number;
  switch (comparator) {
    case 'GT': return v > threshold;
    case 'GTE': return v >= threshold;
    case 'LT': return v < threshold;
    case 'LTE': return v <= threshold;
    case 'CROSSES_ABOVE': return isNum(previous) ? (previous as number) <= threshold && v > threshold : false;
    case 'CROSSES_BELOW': return isNum(previous) ? (previous as number) >= threshold && v < threshold : false;
    default: return false;
  }
}

export interface EvaluatedAlert {
  id: string;
  name: string;
  category: string;
  metric: string;
  metricLabel: string;
  comparator: string;
  comparatorLabel: string;
  threshold: number;
  thresholdFormatted: string;
  severity: string;
  enabled: boolean;
  ticker: string | null;
  companyName: string | null;
  currentValue: number | null;
  currentFormatted: string;
  isTriggered: boolean;
  distance: number | null;
  lastTriggeredAt: string | null;
  message: string;
  dataAvailable: boolean;
}

/**
 * Evaluates every alert in the workspace against the current metric set.
 * Alerts whose metric is unavailable are reported as such rather than treated
 * as not triggered — a silent alert on missing data is a false negative.
 */
export async function evaluateAlerts(workspaceId: string): Promise<EvaluatedAlert[]> {
  const [alerts, metrics] = await Promise.all([
    prisma.alert.findMany({ where: { workspaceId }, include: { company: true }, orderBy: { createdAt: 'desc' } }),
    getMetricsMap(),
  ]);

  let portfolioWeights: Map<string, number> | null = null;
  let upsideByTicker: Map<string, number> | null = null;

  if (alerts.some((a) => a.metric === 'portfolioWeight')) {
    const analytics = await getPortfolioAnalytics(workspaceId);
    portfolioWeights = new Map(
      (analytics?.summary.positions ?? [])
        .filter((p) => isNum(p.weight))
        .map((p) => [p.ticker, p.weight as number]),
    );
  }
  if (alerts.some((a) => a.metric === 'upsideToTarget')) {
    const theses = await prisma.investmentThesis.findMany({ where: { workspaceId }, include: { company: true } });
    upsideByTicker = new Map();
    for (const t of theses) {
      const m = metrics.get(t.company.ticker);
      if (isNum(t.targetPrice) && isNum(m?.price) && (m!.price as number) > 0) {
        upsideByTicker.set(t.company.ticker, (t.targetPrice as number) / (m!.price as number) - 1);
      }
    }
  }

  return alerts.map((a) => {
    const ticker = a.company?.ticker ?? null;
    const m: CompanyMetrics | undefined = ticker ? metrics.get(ticker) : undefined;
    let currentValue: number | null = null;
    if (a.metric === 'portfolioWeight') currentValue = ticker ? portfolioWeights?.get(ticker) ?? null : null;
    else if (a.metric === 'upsideToTarget') currentValue = ticker ? upsideByTicker?.get(ticker) ?? null : null;
    else currentValue = m ? ((m as unknown as Record<string, number | null>)[a.metric] ?? null) : null;

    const def = ALERT_METRICS[a.metric] ?? { label: a.metric, format: 'ratio' as MetricFormat, category: a.category };
    const fired = triggered(currentValue, a.comparator, a.threshold, a.lastValue);
    const currency = m?.currency ?? 'BRL';

    return {
      id: a.id,
      name: a.name,
      category: a.category,
      metric: a.metric,
      metricLabel: def.label,
      comparator: a.comparator,
      comparatorLabel: COMPARATOR_LABELS[a.comparator as AlertComparator] ?? a.comparator,
      threshold: a.threshold,
      thresholdFormatted: formatMetric(a.threshold, def.format, { currency }),
      severity: a.severity,
      enabled: a.enabled,
      ticker,
      companyName: a.company?.name ?? null,
      currentValue,
      currentFormatted: formatMetric(currentValue, def.format, { currency }),
      isTriggered: a.enabled && fired,
      distance: isNum(currentValue) ? (currentValue as number) - a.threshold : null,
      lastTriggeredAt: a.lastTriggeredAt?.toISOString() ?? null,
      dataAvailable: isNum(currentValue),
      message: !isNum(currentValue)
        ? `${def.label} is unavailable for ${ticker ?? 'this workspace'} — the alert cannot be evaluated.`
        : fired
          ? `${ticker ?? ''} ${def.label} ${COMPARATOR_LABELS[a.comparator as AlertComparator] ?? a.comparator} ${formatMetric(a.threshold, def.format, { currency })} (currently ${formatMetric(currentValue, def.format, { currency })}).`
          : `${ticker ?? ''} ${def.label} is ${formatMetric(currentValue, def.format, { currency })}, against a threshold of ${formatMetric(a.threshold, def.format, { currency })}.`,
    };
  });
}

/** Persists the fired state and writes an alert event + notification. */
export async function persistTriggered(workspaceId: string, evaluated: EvaluatedAlert[]): Promise<number> {
  let written = 0;
  for (const e of evaluated) {
    if (!e.isTriggered) {
      if (isNum(e.currentValue)) {
        await prisma.alert.update({ where: { id: e.id }, data: { lastValue: e.currentValue } });
      }
      continue;
    }
    const alert = await prisma.alert.findUnique({ where: { id: e.id } });
    const alreadyToday =
      alert?.lastTriggeredAt && Date.now() - alert.lastTriggeredAt.getTime() < 12 * 3600 * 1000;
    await prisma.alert.update({
      where: { id: e.id },
      data: { lastValue: e.currentValue, lastTriggeredAt: new Date() },
    });
    if (alreadyToday) continue;
    await prisma.alertEvent.create({
      data: { alertId: e.id, value: e.currentValue ?? 0, message: e.message },
    });
    await prisma.notification.create({
      data: {
        workspaceId, severity: e.severity, category: e.category,
        title: e.name, body: e.message, ticker: e.ticker,
        href: e.ticker ? `/companies/${e.ticker}` : '/monitoring',
      },
    });
    written++;
  }
  return written;
}

/* ------------------------- Thesis monitoring ------------------------- */

export interface ThesisAssumptionCheck {
  label: string;
  metric: string;
  metricLabel: string;
  comparator: 'GTE' | 'LTE';
  target: number;
  current: number | null;
  currentFormatted: string;
  targetFormatted: string;
  status: 'HOLDING' | 'BREACHED' | 'UNAVAILABLE';
  gap: number | null;
}

export interface ThesisHealth {
  ticker: string;
  companyName: string;
  thesisId: string;
  recommendation: string;
  conviction: string;
  status: string;
  targetPrice: number | null;
  currentPrice: number | null;
  upside: number | null;
  checks: ThesisAssumptionCheck[];
  holding: number;
  breached: number;
  unavailable: number;
  verdict: 'INTACT' | 'WEAKENING' | 'BROKEN' | 'INSUFFICIENT_DATA';
  summary: string;
}

interface StoredAssumption {
  label: string;
  metric: string;
  comparator: 'GTE' | 'LTE';
  target: number;
  unit?: string;
}

export async function evaluateThesisHealth(workspaceId: string): Promise<ThesisHealth[]> {
  const [theses, metrics] = await Promise.all([
    prisma.investmentThesis.findMany({ where: { workspaceId }, include: { company: true } }),
    getMetricsMap(),
  ]);

  return theses.map((t) => {
    const m = metrics.get(t.company.ticker);
    let stored: StoredAssumption[] = [];
    try {
      stored = t.assumptions ? (JSON.parse(t.assumptions) as StoredAssumption[]) : [];
    } catch {
      stored = [];
    }

    const checks: ThesisAssumptionCheck[] = stored.map((a) => {
      const def = ALERT_METRICS[a.metric] ?? { label: a.metric, format: 'ratio' as MetricFormat, category: 'FUNDAMENTAL' };
      const current = m ? ((m as unknown as Record<string, number | null>)[a.metric] ?? null) : null;
      const currency = m?.currency ?? 'BRL';
      const status: ThesisAssumptionCheck['status'] = !isNum(current)
        ? 'UNAVAILABLE'
        : (a.comparator === 'GTE' ? (current as number) >= a.target : (current as number) <= a.target)
          ? 'HOLDING'
          : 'BREACHED';
      return {
        label: a.label,
        metric: a.metric,
        metricLabel: def.label,
        comparator: a.comparator,
        target: a.target,
        current,
        currentFormatted: formatMetric(current, def.format, { currency }),
        targetFormatted: formatMetric(a.target, def.format, { currency }),
        status,
        gap: isNum(current) ? (current as number) - a.target : null,
      };
    });

    const holding = checks.filter((c) => c.status === 'HOLDING').length;
    const breached = checks.filter((c) => c.status === 'BREACHED').length;
    const unavailable = checks.filter((c) => c.status === 'UNAVAILABLE').length;
    const evaluated = holding + breached;

    let verdict: ThesisHealth['verdict'] = 'INSUFFICIENT_DATA';
    if (evaluated > 0) {
      if (breached === 0) verdict = 'INTACT';
      else if (breached >= evaluated) verdict = 'BROKEN';
      else verdict = 'WEAKENING';
    }

    const upside =
      isNum(t.targetPrice) && isNum(m?.price) && (m!.price as number) > 0
        ? (t.targetPrice as number) / (m!.price as number) - 1
        : null;

    const summary =
      verdict === 'INTACT'
        ? `All ${holding} tracked assumptions are holding.`
        : verdict === 'WEAKENING'
          ? `${breached} of ${evaluated} tracked assumptions have been breached: ${checks.filter((c) => c.status === 'BREACHED').map((c) => c.metricLabel).join(', ')}.`
          : verdict === 'BROKEN'
            ? `Every tracked assumption has been breached. The thesis needs to be rewritten or closed.`
            : 'No assumption can be evaluated with the data available.';

    return {
      ticker: t.company.ticker,
      companyName: t.company.name,
      thesisId: t.id,
      recommendation: t.recommendation,
      conviction: t.conviction,
      status: t.status,
      targetPrice: t.targetPrice,
      currentPrice: m?.price ?? null,
      upside,
      checks, holding, breached, unavailable, verdict, summary,
    };
  });
}
