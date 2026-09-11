import { prisma, parseJson } from '@/lib/db';
import { getCompanyDossier } from './company';
import { evaluateThesisHealth } from './alerts';
import { isNum, safeDiv } from '@/lib/finance/core';
import { formatBps, formatMultiple, formatPercent } from '@/lib/finance/format';
import type { Currency } from '@/lib/finance/types';

/* ================================================================
   EARNINGS INTELLIGENCE

   Compares the print with the consensus recorded in this workspace,
   with the prior year and with the prior quarter, then states what the
   variance means for the thesis. Every sentence is derived from the
   figures in the comparison table.
   ================================================================ */

export interface EarningsComparison {
  metric: string;
  label: string;
  format: 'currencyCompact' | 'currency' | 'percent';
  actual: number | null;
  consensus: number | null;
  priorYear: number | null;
  priorQuarter: number | null;
  vsConsensus: number | null;
  vsPriorYear: number | null;
  vsPriorQuarter: number | null;
}

export interface EarningsAnalysis {
  headline: string;
  keyPositives: string[];
  keyNegatives: string[];
  surprises: string[];
  guidance: { label: string; value: string }[];
  managementCommentary: string | null;
  marginAnalysis: string[];
  cashFlowAnalysis: string[];
  balanceSheetAnalysis: string[];
  thesisImpact: { verdict: 'SUPPORTS' | 'NEUTRAL' | 'WEAKENS'; text: string };
  valuationImpact: string;
  whatChanged: string;
  temporaryOrStructural: string;
}

export interface EarningsDetail {
  id: string;
  ticker: string;
  companyName: string;
  currency: Currency;
  label: string;
  reportDate: string;
  status: string;
  comparisons: EarningsComparison[];
  analysis: EarningsAnalysis;
  savedReview: { headline: string; thesisImpact: string; author: string; createdAt: string } | null;
}

function pct(a: number | null, b: number | null): number | null {
  if (!isNum(a) || !isNum(b) || b === 0) return null;
  return (a as number) / Math.abs(b as number) - 1;
}

export async function getEarningsDetail(workspaceId: string, earningsId: string): Promise<EarningsDetail | null> {
  const event = await prisma.earningsEvent.findUnique({
    where: { id: earningsId },
    include: { company: true },
  });
  if (!event) return null;

  const dossier = await getCompanyDossier(event.company.ticker);
  if (!dossier) return null;

  const all = await prisma.earningsEvent.findMany({
    where: { companyId: event.companyId },
    orderBy: { reportDate: 'asc' },
  });
  const index = all.findIndex((e) => e.id === event.id);
  const priorQuarter = index > 0 ? all[index - 1] : null;
  const priorYear = all.find((e) => e.fiscalYear === event.fiscalYear - 1 && e.fiscalQuarter === event.fiscalQuarter) ?? null;

  type EventRow = (typeof all)[number];
  const metrics: { metric: keyof EventRow; label: string; format: EarningsComparison['format']; consensusKey?: keyof EventRow }[] = [
    { metric: 'revenue', label: 'Revenue', format: 'currencyCompact', consensusKey: 'consensusRevenue' },
    { metric: 'ebitda', label: 'EBITDA', format: 'currencyCompact', consensusKey: 'consensusEbitda' },
    { metric: 'ebit', label: 'EBIT', format: 'currencyCompact' },
    { metric: 'netIncome', label: 'Net income', format: 'currencyCompact' },
    { metric: 'eps', label: 'EPS', format: 'currency', consensusKey: 'consensusEps' },
    { metric: 'fcf', label: 'Free cash flow', format: 'currencyCompact' },
  ];

  const comparisons: EarningsComparison[] = metrics.map((m) => {
    const actual = event[m.metric] as number | null;
    const consensus = m.consensusKey ? (event[m.consensusKey] as number | null) : null;
    const py = priorYear ? (priorYear[m.metric] as number | null) : null;
    const pq = priorQuarter ? (priorQuarter[m.metric] as number | null) : null;
    return {
      metric: String(m.metric), label: m.label, format: m.format,
      actual, consensus, priorYear: py, priorQuarter: pq,
      vsConsensus: pct(actual, consensus),
      vsPriorYear: pct(actual, py),
      vsPriorQuarter: pct(actual, pq),
    };
  });

  const health = await evaluateThesisHealth(workspaceId);
  const thesisHealth = health.find((h) => h.ticker === event.company.ticker) ?? null;

  const savedReview = await prisma.earningsReview.findFirst({
    where: { workspaceId, earningsId: event.id },
  });

  const analysis = buildAnalysis({
    ticker: event.company.ticker,
    currency: dossier.company.currency as Currency,
    comparisons,
    guidance: parseJson<Record<string, string> | null>(event.guidance, null),
    commentary: event.commentary,
    thesisHealth,
    evEbitda: dossier.metrics.evEbitda,
    priorLabel: priorYear?.label ?? priorQuarter?.label ?? null,
  });

  return {
    id: event.id,
    ticker: event.company.ticker,
    companyName: event.company.name,
    currency: dossier.company.currency as Currency,
    label: event.label,
    reportDate: event.reportDate.toISOString().slice(0, 10),
    status: event.status,
    comparisons,
    analysis,
    savedReview: savedReview
      ? {
          headline: savedReview.headline,
          thesisImpact: savedReview.thesisImpact,
          author: savedReview.authorName,
          createdAt: savedReview.createdAt.toISOString(),
        }
      : null,
  };
}

function buildAnalysis(input: {
  ticker: string;
  currency: Currency;
  comparisons: EarningsComparison[];
  guidance: Record<string, string> | null;
  commentary: string | null;
  thesisHealth: Awaited<ReturnType<typeof evaluateThesisHealth>>[number] | null;
  evEbitda: number | null;
  priorLabel: string | null;
}): EarningsAnalysis {
  const find = (m: string) => input.comparisons.find((c) => c.metric === m) ?? null;
  const revenue = find('revenue');
  const ebitda = find('ebitda');
  const eps = find('eps');
  const fcf = find('fcf');
  const netIncome = find('netIncome');

  const positives: string[] = [];
  const negatives: string[] = [];
  const surprises: string[] = [];

  for (const c of input.comparisons) {
    if (isNum(c.vsConsensus)) {
      const diff = c.vsConsensus as number;
      const line = `${c.label} came in ${formatPercent(Math.abs(diff))} ${diff >= 0 ? 'above' : 'below'} the consensus recorded in this workspace.`;
      if (Math.abs(diff) >= 0.02) surprises.push(line);
      (diff >= 0 ? positives : negatives).push(line);
    }
    if (isNum(c.vsPriorYear)) {
      const diff = c.vsPriorYear as number;
      const line = `${c.label} ${diff >= 0 ? 'grew' : 'fell'} ${formatPercent(Math.abs(diff))} against the same quarter a year earlier.`;
      (diff >= 0 ? positives : negatives).push(line);
    }
  }

  // Margin analysis from the reported figures rather than commentary.
  const marginAnalysis: string[] = [];
  const marginNow = safeDiv(ebitda?.actual ?? null, revenue?.actual ?? null);
  const marginPriorYear = safeDiv(ebitda?.priorYear ?? null, revenue?.priorYear ?? null);
  const marginPriorQuarter = safeDiv(ebitda?.priorQuarter ?? null, revenue?.priorQuarter ?? null);
  if (isNum(marginNow)) {
    marginAnalysis.push(`EBITDA margin in the period was ${formatPercent(marginNow)}.`);
    if (isNum(marginPriorYear)) {
      const delta = (marginNow as number) - (marginPriorYear as number);
      marginAnalysis.push(`That is ${formatBps(delta)} against the same quarter a year earlier.`);
      if (delta < -0.005) negatives.push(`EBITDA margin compressed ${formatBps(Math.abs(delta))} year on year.`);
      if (delta > 0.005) positives.push(`EBITDA margin expanded ${formatBps(delta)} year on year.`);
    }
    if (isNum(marginPriorQuarter)) {
      marginAnalysis.push(`Against the prior quarter the move is ${formatBps((marginNow as number) - (marginPriorQuarter as number))}.`);
    }
  } else {
    marginAnalysis.push('The EBITDA margin cannot be computed for this period: revenue or EBITDA is missing.');
  }

  const cashFlowAnalysis: string[] = [];
  if (isNum(fcf?.actual)) {
    cashFlowAnalysis.push(`Free cash flow in the quarter was ${formatMoneyish(fcf!.actual, input.currency)}.`);
    const conversion = safeDiv(fcf?.actual ?? null, ebitda?.actual ?? null);
    if (isNum(conversion)) {
      cashFlowAnalysis.push(`That is ${formatPercent(conversion)} of EBITDA.`);
      if ((conversion as number) < 0.3) {
        negatives.push('Cash conversion was weak: less than a third of EBITDA reached free cash flow.');
      }
    }
    if (isNum(fcf?.vsPriorYear)) {
      cashFlowAnalysis.push(`Against the same quarter last year, free cash flow moved ${formatPercent(fcf!.vsPriorYear, 1, { signed: true })}.`);
    }
  } else {
    cashFlowAnalysis.push('Free cash flow is not recorded for this period.');
  }

  const balanceSheetAnalysis: string[] = isNum(netIncome?.actual)
    ? [`Net income of ${formatMoneyish(netIncome!.actual, input.currency)} flows to retained earnings; the balance-sheet effect is visible in the statements tab from the next reported period.`]
    : ['Net income is not recorded for this period, so the balance-sheet effect cannot be traced.'];

  const headline = (() => {
    const revSurprise = revenue?.vsConsensus;
    const ebitdaSurprise = ebitda?.vsConsensus;
    if (isNum(revSurprise) && isNum(ebitdaSurprise)) {
      const rev = (revSurprise as number) >= 0 ? 'ahead of' : 'behind';
      const eb = (ebitdaSurprise as number) >= 0 ? 'ahead of' : 'behind';
      const margin = isNum(marginNow) && isNum(marginPriorYear)
        ? `, with margin ${formatBps((marginNow as number) - (marginPriorYear as number))} year on year`
        : '';
      return `Revenue ${rev} consensus and EBITDA ${eb}${margin}.`;
    }
    if (isNum(revenue?.vsPriorYear)) {
      return `Revenue ${formatPercent(revenue!.vsPriorYear, 1, { signed: true })} year on year${isNum(marginNow) ? ` at a ${formatPercent(marginNow)} EBITDA margin` : ''}.`;
    }
    return 'The workspace does not hold enough of this print to summarise it.';
  })();

  const guidance = input.guidance
    ? Object.entries(input.guidance).map(([label, value]) => ({ label, value }))
    : [];

  const thesisImpact = (() => {
    if (!input.thesisHealth) {
      return {
        verdict: 'NEUTRAL' as const,
        text: `No thesis has been written for ${input.ticker} in this workspace, so the print cannot be tested against one.`,
      };
    }
    const breached = input.thesisHealth.checks.filter((c) => c.status === 'BREACHED');
    if (!breached.length) {
      return {
        verdict: 'SUPPORTS' as const,
        text: `Every tracked assumption still holds after this print: ${input.thesisHealth.checks.map((c) => `${c.metricLabel} at ${c.currentFormatted}`).join('; ')}.`,
      };
    }
    return {
      verdict: 'WEAKENS' as const,
      text: `${breached.length} tracked assumption${breached.length === 1 ? '' : 's'} now sit${breached.length === 1 ? 's' : ''} outside its threshold: ${breached.map((b) => `${b.metricLabel} at ${b.currentFormatted} against ${b.targetFormatted}`).join('; ')}.`,
    };
  })();

  const valuationImpact = isNum(input.evEbitda)
    ? `On the updated trailing figures the shares trade at ${formatMultiple(input.evEbitda)} EV/EBITDA. The DCF is unchanged until its forecast assumptions are edited — a single quarter moves the model only through the base period, not through the terminal value.`
    : 'The valuation impact cannot be quantified: the current multiple is unavailable.';

  const whatChanged = [
    isNum(revenue?.vsPriorYear) ? `Revenue ${formatPercent(revenue!.vsPriorYear, 1, { signed: true })}` : null,
    isNum(ebitda?.vsPriorYear) ? `EBITDA ${formatPercent(ebitda!.vsPriorYear, 1, { signed: true })}` : null,
    isNum(eps?.vsPriorYear) ? `EPS ${formatPercent(eps!.vsPriorYear, 1, { signed: true })}` : null,
    isNum(marginNow) && isNum(marginPriorYear) ? `EBITDA margin ${formatBps((marginNow as number) - (marginPriorYear as number))}` : null,
  ].filter(Boolean).join(', ') || 'Not enough comparable history to say what changed.';

  const temporaryOrStructural = (() => {
    if (!isNum(marginNow) || !isNum(marginPriorYear) || !isNum(marginPriorQuarter)) {
      return 'Whether the change is temporary or structural cannot be judged: fewer than three comparable periods are available.';
    }
    const yoy = (marginNow as number) - (marginPriorYear as number);
    const qoq = (marginNow as number) - (marginPriorQuarter as number);
    if (Math.sign(yoy) === Math.sign(qoq) && Math.abs(yoy) > 0.005) {
      return `The margin has moved in the same direction against both the prior quarter (${formatBps(qoq)}) and the prior year (${formatBps(yoy)}). A consistent direction across both comparisons is more consistent with a structural change than with a seasonal one.`;
    }
    return `The margin moved ${formatBps(qoq)} against the prior quarter but ${formatBps(yoy)} against the prior year. The two comparisons disagree, which points to a seasonal or mix effect rather than a structural break.`;
  })();

  return {
    headline,
    keyPositives: Array.from(new Set(positives)).slice(0, 6),
    keyNegatives: Array.from(new Set(negatives)).slice(0, 6),
    surprises: Array.from(new Set(surprises)).slice(0, 5),
    guidance,
    managementCommentary: input.commentary,
    marginAnalysis,
    cashFlowAnalysis,
    balanceSheetAnalysis,
    thesisImpact,
    valuationImpact,
    whatChanged,
    temporaryOrStructural,
  };
}

function formatMoneyish(v: number | null, currency: Currency): string {
  if (!isNum(v)) return '—';
  const abs = Math.abs(v as number);
  const symbol = currency === 'BRL' ? 'R$ ' : '$';
  if (abs >= 1000) return `${symbol}${((v as number) / 1000).toFixed(2)} bn`;
  return `${symbol}${(v as number).toFixed(0)} mn`;
}

export async function listEarnings(workspaceId: string, limit = 60) {
  const [events, reviews] = await Promise.all([
    prisma.earningsEvent.findMany({
      orderBy: { reportDate: 'desc' },
      take: limit,
      include: { company: true },
    }),
    prisma.earningsReview.findMany({ where: { workspaceId } }),
  ]);
  const reviewed = new Set(reviews.map((r) => r.earningsId));

  return events.map((e) => ({
    id: e.id,
    ticker: e.company.ticker,
    companyName: e.company.name,
    currency: e.company.currency as Currency,
    label: e.label,
    reportDate: e.reportDate.toISOString().slice(0, 10),
    status: e.status,
    revenue: e.revenue,
    ebitda: e.ebitda,
    eps: e.eps,
    revenueSurprise: pct(e.revenue, e.consensusRevenue),
    ebitdaSurprise: pct(e.ebitda, e.consensusEbitda),
    epsSurprise: pct(e.eps, e.consensusEps),
    hasReview: reviewed.has(e.id),
  }));
}
