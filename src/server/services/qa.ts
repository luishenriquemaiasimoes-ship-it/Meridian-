import { prisma, parseJson } from '@/lib/db';
import { getCompanyDossier } from './company';
import { getComps } from './comps';
import { getModelReconciliation } from './reconciliation';
import { getPortfolioAnalytics } from './portfolio';
import { evaluateThesisHealth } from './alerts';
import { formatMetric, formatPercent } from '@/lib/finance/format';
import { isNum } from '@/lib/finance/core';
import { QA_THEME_LABEL, type DeckRisk, type DeckThesis, type QaTheme, type StressTest } from '@/lib/research/types';
import type { Currency } from '@/lib/finance/types';

/* ==================================================================
   Q&A preparation.

   The questions a committee asks are not mysterious: they are the places
   the case is thinnest. This generator finds those places in the
   workspace's own data and drafts an answer from it.

   The rule the whole thing turns on: a draft answer cites figures the
   workspace holds, or it says what is missing. It never reaches for a
   plausible number. A question the data cannot answer is more useful
   than a confident sentence built on nothing — so it is marked as a gap
   and left for the analyst.
   ================================================================== */

export interface GeneratedQuestion {
  theme: QaTheme;
  question: string;
  /** Assembled from workspace data, or null when the data is not there. */
  draftAnswer: string | null;
  /** Where each figure in the draft came from. */
  citations: string[];
  /** True when the workspace cannot support an answer. */
  hasGap: boolean;
  /** What is missing, when there is a gap. */
  gap?: string;
}

export interface QaPrep {
  ticker: string;
  companyName: string;
  questions: GeneratedQuestion[];
  /** Questions already stored against this company. */
  saved: {
    id: string; theme: string; question: string; draftAnswer: string | null;
    citations: string[]; status: string; hasGap: boolean; notes: string | null;
    createdBy: string; updatedAt: string;
  }[];
  counts: { total: number; prepared: number; needsWork: number; pending: number; gaps: number };
}

/** Builds a citation line the reader can follow back to a screen. */
function cite(what: string, where: string): string {
  return `${what} — ${where}`;
}

export async function generateQuestions(workspaceId: string, ticker: string): Promise<GeneratedQuestion[]> {
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) return [];

  const [reconciliation, comps, deck, health, portfolio, thesisRow] = await Promise.all([
    getModelReconciliation(workspaceId, ticker),
    getComps(ticker),
    prisma.qualitativeDeck.findFirst({ where: { workspaceId, companyId: dossier.company.id } }),
    evaluateThesisHealth(workspaceId),
    getPortfolioAnalytics(workspaceId),
    prisma.investmentThesis.findFirst({
      where: { workspaceId, companyId: dossier.company.id },
      include: { risks: true, catalysts: true },
    }),
  ]);

  const m = dossier.metrics;
  const currency = dossier.company.currency as Currency;
  const cur = (v: number | null | undefined) => formatMetric(v ?? null, 'currency', { currency });
  const out: GeneratedQuestion[] = [];

  /* ------------------------------ Valuation ------------------------------ */
  if (reconciliation?.consensus.position === 'ABOVE' || reconciliation?.consensus.position === 'BELOW') {
    const c = reconciliation.consensus;
    out.push({
      theme: 'VALUATION',
      question: `Your target is ${c.position === 'ABOVE' ? 'above' : 'below'} every contributed target on record. What do you see that the sell-side does not?`,
      draftAnswer: reconciliation.consensusNote?.rationale
        ?? `The model produces ${cur(c.targetPrice)} against a contributed range of ${cur(c.low)} to ${cur(c.high)}, a median of ${cur(c.median)}. No reason has been recorded for the gap.`,
      citations: [cite(`Model target ${cur(c.targetPrice)}`, 'DCF, valuation tab'), cite(`Contributed range from ${c.count} targets`, 'Reconciliation tab')],
      hasGap: !reconciliation.consensusNote,
      gap: reconciliation.consensusNote ? undefined : 'No rationale has been recorded for the difference from the range.',
    });
  }

  if (reconciliation && isNum(reconciliation.terminal.impliedMultipleFromGordon)) {
    const t = reconciliation.terminal;
    const peer = comps?.stats.evEbitda?.median ?? null;
    out.push({
      theme: 'VALUATION',
      question: 'What exit multiple does your perpetuity growth assumption imply, and is the market paying it today?',
      draftAnswer: `Growing at ${formatPercent(reconciliation.premises.checks.find((c) => c.key === 'revenueGrowth')?.assumed ?? null, 2)} in perpetuity implies an exit at ${formatMetric(t.impliedMultipleFromGordon, 'multiple')}${isNum(peer) ? `, against a peer median of ${formatMetric(peer, 'multiple')}` : ''}. The exit multiple in the model implies perpetual growth of ${formatMetric(t.impliedGrowthFromMultiple, 'percent')}.`,
      citations: [
        cite('Implied multiple and growth', 'Reconciliation tab, terminal methods'),
        ...(isNum(peer) ? [cite(`Peer median EV/EBITDA ${formatMetric(peer, 'multiple')}`, 'Comparables tab')] : []),
      ],
      hasGap: false,
    });
  }

  const tvShare = reconciliation ? null : null;
  void tvShare;

  /* ------------------------- Capital structure --------------------------- */
  if (isNum(m.netDebtToEbitda)) {
    const cover = m.interestCoverage;
    out.push({
      theme: 'CAPITAL_STRUCTURE',
      question: 'How much refinancing does the company face, and what happens to the thesis if the cost of debt rises 300 basis points?',
      draftAnswer: `Net debt is ${formatMetric(m.netDebtToEbitda, 'multiple')} EBITDA${isNum(cover) ? ` with interest covered ${formatMetric(cover, 'multiple')}` : ''}. The cost of debt in the model is ${formatPercent(m.costOfDebt, 2)}. The workspace holds no maturity schedule, so the timing of refinancing cannot be answered from it.`,
      citations: [
        cite(`Net debt / EBITDA ${formatMetric(m.netDebtToEbitda, 'multiple')}`, `Fundamentals, ${m.basisLabel}`),
        cite(`Cost of debt ${formatPercent(m.costOfDebt, 2)}`, 'WACC build'),
      ],
      hasGap: true,
      gap: 'No debt maturity schedule is loaded. A refinancing question needs one; the rest can be answered from the statements.',
    });
  }

  if (reconciliation?.verification.counts.criticalUnverified) {
    out.push({
      theme: 'DATA',
      question: 'Which numbers in this model are your estimates rather than reported figures?',
      draftAnswer: `Of ${reconciliation.verification.counts.total} inputs, ${reconciliation.verification.counts.verified} trace to a source, ${reconciliation.verification.counts.asserted} are the analyst's own estimate, ${reconciliation.verification.counts.simulated} rest on simulated data and ${reconciliation.verification.counts.unverified} carry no source at all — ${reconciliation.verification.counts.criticalUnverified} of those are load-bearing.`,
      citations: [cite('Input provenance', 'Reconciliation tab, source verification')],
      hasGap: reconciliation.verification.counts.criticalUnverified > 0,
      gap: `${reconciliation.verification.counts.criticalUnverified} load-bearing inputs have no source recorded.`,
    });
  }

  /* ------------------------------ Governance ----------------------------- */
  const controlling = dossier.ownership.filter((o) => o.kind === 'CONTROLLING');
  if (controlling.length) {
    const top = controlling.sort((a, b) => b.stake - a.stake)[0];
    out.push({
      theme: 'GOVERNANCE',
      question: 'Where do the controlling shareholder’s interests diverge from the minority’s, and what protects you?',
      draftAnswer: `${top.holder} holds ${formatPercent(top.stake, 1)}. The workspace records the shareholding but nothing about related-party transactions, board composition or the tag-along terms, so the conflict cannot be assessed from it.`,
      citations: [cite(`${top.holder} at ${formatPercent(top.stake, 1)}`, 'Ownership tab')],
      hasGap: true,
      gap: 'Related-party transactions and governance terms are not loaded.',
    });
  }

  /* ----------------------------- Competition ----------------------------- */
  if (comps?.peers.length) {
    const anchor = comps.anchor;
    const peerMedianRoic = comps.stats.roic?.median ?? null;
    out.push({
      theme: 'COMPETITION',
      question: 'Why does this company earn its returns rather than the competitor next to it, and how durable is that?',
      draftAnswer: m.bankLike
        ? `Return on equity is ${formatPercent(m.roe, 1)} against a peer set of ${comps.peers.length}. Invested capital is not a meaningful denominator for this kind of company, so the comparison runs on ROE rather than ROIC.`
        : `Return on invested capital is ${formatPercent(anchor.roic, 1)}${isNum(peerMedianRoic) ? ` against a peer median of ${formatPercent(peerMedianRoic, 1)}` : ''}, on a cost of capital of ${formatPercent(m.wacc, 1)}. The spread is ${formatPercent(m.roicSpread, 1)}. What sustains it is a qualitative judgement the workspace does not hold unless the deck says so.`,
      citations: [
        cite(`ROIC ${formatPercent(m.roic, 1)}`, `Fundamentals, ${m.basisLabel}`),
        ...(isNum(peerMedianRoic) ? [cite(`Peer median ROIC ${formatPercent(peerMedianRoic, 1)}`, 'Comparables tab')] : []),
      ],
      hasGap: false,
    });
  }

  /* ------------------------------- Thesis -------------------------------- */
  const deckTheses = deck ? parseJson<DeckThesis[]>(deck.theses, []) : [];
  const deckRisks = deck ? parseJson<DeckRisk[]>(deck.risks, []) : [];
  const stressTests = deck ? parseJson<StressTest[]>(deck.stressTests, []) : [];

  for (const t of deckTheses.filter((x) => x.weight === 'CORE')) {
    out.push({
      theme: 'THESIS',
      question: `On "${t.title}" — what single observation would tell you first that it is not working?`,
      draftAnswer: t.breaks.length
        ? `The deck records ${t.breaks.length} thing${t.breaks.length === 1 ? '' : 's'} that would break it: ${t.breaks.join('; ')}.`
        : null,
      citations: [cite(`Thesis ${t.order}: ${t.title}`, 'Qualitative deck')],
      hasGap: t.breaks.length === 0,
      gap: t.breaks.length === 0 ? 'The deck does not say what would invalidate this thesis.' : undefined,
    });
  }

  const companyHealth = health.find((h) => h.ticker === dossier.company.ticker);
  if (companyHealth && companyHealth.breached > 0) {
    out.push({
      theme: 'THESIS',
      question: `${companyHealth.breached} of your tracked assumptions have been breached. Why is the thesis still intact?`,
      draftAnswer: companyHealth.summary,
      citations: [cite('Assumption checks', 'Monitoring, thesis health')],
      hasGap: false,
    });
  }

  const untested = stressTests.filter((s) => s.verdict === 'UNTESTED');
  if (stressTests.length && untested.length) {
    out.push({
      theme: 'COMPETITION',
      question: 'Which of your stress tests have you actually run?',
      draftAnswer: `${stressTests.length - untested.length} of ${stressTests.length} have a verdict recorded; ${untested.length} are still untested: ${untested.map((s) => s.title).join(', ')}.`,
      citations: [cite('Stress tests', 'Qualitative deck')],
      hasGap: true,
      gap: `${untested.length} stress tests have no verdict.`,
    });
  }

  const highRisks = deckRisks.filter((r) => r.probability >= 0.5 && r.impact >= 0.5);
  if (highRisks.length) {
    out.push({
      theme: 'THESIS',
      question: `You have ${highRisks.length} risk${highRisks.length === 1 ? '' : 's'} in the manage quadrant. What is the mitigation?`,
      draftAnswer: highRisks.map((r) => `${r.title}: ${r.mitigation ?? 'no mitigation recorded'}`).join('. ') + '.',
      citations: [cite('Risk quadrant', 'Qualitative deck')],
      hasGap: highRisks.some((r) => !r.mitigation),
      gap: highRisks.some((r) => !r.mitigation) ? 'At least one high-probability, high-impact risk has no mitigation recorded.' : undefined,
    });
  }

  /* --------------------------- Portfolio fit ----------------------------- */
  const position = portfolio?.summary.positions.find((p) => p.ticker === dossier.company.ticker);
  if (portfolio) {
    const sectorExposure = portfolio.exposures.sector.find((e) => e.label === dossier.company.sector);
    out.push({
      theme: 'PORTFOLIO',
      question: position
        ? 'You already own this. What does adding to it do to the concentration of the book?'
        : 'What does this position do to the shape of the book?',
      draftAnswer: position
        ? `The position is ${formatPercent(position.weight, 1)} of the book today, inside a ${dossier.company.sector} exposure of ${formatPercent(sectorExposure?.weight ?? null, 1)}. The top five names are ${formatPercent(portfolio.concentration.top5, 1)}.`
        : `${dossier.company.sector} is ${formatPercent(sectorExposure?.weight ?? null, 1)} of the book. The top five names are ${formatPercent(portfolio.concentration.top5, 1)}, an effective ${formatMetric(portfolio.concentration.effectiveNumberOfPositions, 'number', { decimals: 1 })} equally-weighted positions.`,
      citations: [
        cite('Sector exposure and concentration', 'Portfolio, exposure tab'),
        ...(position ? [cite(`Position weight ${formatPercent(position.weight, 1)}`, 'Portfolio, positions')] : []),
      ],
      hasGap: false,
    });
  }

  /* --------------------------- Regulation / cycle ------------------------ */
  const regulatoryRisks = (thesisRow?.risks ?? []).filter((r) => r.category === 'REGULATORY' || r.category === 'MACRO');
  if (regulatoryRisks.length) {
    out.push({
      theme: 'REGULATION',
      question: 'What in the regulatory or macro environment could change the economics here, and how fast?',
      draftAnswer: regulatoryRisks
        .map((r) => `${r.title} (${r.severity.toLowerCase()} severity, ${formatPercent(r.probability, 0)} likely)${r.mitigation ? `: ${r.mitigation}` : ''}`)
        .join('. ') + '.',
      citations: [cite('Recorded risks', 'Thesis tab')],
      hasGap: false,
    });
  }

  /* ----------------------------- Operations ------------------------------ */
  if (reconciliation?.premises.persistentBreaches.length) {
    const b = reconciliation.premises.persistentBreaches[0];
    out.push({
      theme: 'OPERATIONS',
      question: `Your ${b.label.toLowerCase()} assumption has missed for ${b.periods} periods running. Why have you not changed it?`,
      draftAnswer: `Reported ${b.label.toLowerCase()} has been ${b.averageBps >= 0 ? 'above' : 'below'} the model by ${Math.abs(b.averageBps).toFixed(0)} bps on average across ${b.periods} periods. No revision has been recorded.`,
      citations: [cite('Premise checks', 'Reconciliation tab')],
      hasGap: false,
    });
  }

  return out;
}

export async function getQaPrep(workspaceId: string, ticker: string): Promise<QaPrep | null> {
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) return null;

  const [questions, savedRows] = await Promise.all([
    generateQuestions(workspaceId, ticker),
    prisma.qaItem.findMany({
      where: { workspaceId, companyId: dossier.company.id },
      orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  const saved = savedRows.map((q) => ({
    id: q.id,
    theme: q.theme,
    question: q.question,
    draftAnswer: q.draftAnswer,
    citations: parseJson<string[]>(q.citations, []),
    status: q.status,
    hasGap: q.hasGap,
    notes: q.notes,
    createdBy: q.createdBy,
    updatedAt: q.updatedAt.toISOString(),
  }));

  return {
    ticker: dossier.company.ticker,
    companyName: dossier.company.name,
    questions,
    saved,
    counts: {
      total: saved.length,
      prepared: saved.filter((q) => q.status === 'PREPARED').length,
      needsWork: saved.filter((q) => q.status === 'NEEDS_WORK').length,
      pending: saved.filter((q) => q.status === 'PENDING').length,
      gaps: saved.filter((q) => q.hasGap).length,
    },
  };
}

export { QA_THEME_LABEL };
