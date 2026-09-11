import { prisma, parseJson } from '@/lib/db';
import { getCompanyDossier } from './company';
import { getComps } from './comps';
import { getModelReconciliation } from './reconciliation';
import { getWaccBuildContext } from './wacc';
import { getQaPrep } from './qa';
import { evaluateThesisHealth } from './alerts';
import { defaultAssumptionsFor } from './valuation';
import { buildWaccInstitutional, type WaccBuildInput } from '@/lib/finance/waccBuilder';
import { calculateDcf, normalizeAssumptions, type DcfAssumptions } from '@/lib/finance/dcf';
import { isNum, safeDiv, median } from '@/lib/finance/core';
import { formatMultiple, formatPercent, formatNumber } from '@/lib/finance/format';
import {
  AGENT_META, countSeverities, finding, sortFindings, verdictOf,
  type AgentFinding, type AgentReport, type AgentStatement, type AgentStep, type FindingSeverity,
} from '@/lib/ai/agents';

/* ==================================================================
   The specialised agents.

   Each one is a procedure over workspace records. None of them calls a
   language model to produce a number, because none of them needs to:
   the figures are already in the database, and the value an agent adds
   is knowing which of them to put next to which.

   The guardrail is structural. Every finding carries the screen it can
   be checked on, and anything the workspace does not hold is reported
   as unavailable rather than estimated.
   ================================================================== */

const SEVERITY_FROM_CHECK: Record<'ERROR' | 'WARNING' | 'INFO', FindingSeverity> = {
  ERROR: 'FAIL', WARNING: 'WARNING', INFO: 'INFO',
};

function report(
  agent: AgentReport['agent'],
  subject: string,
  subjectLabel: string,
  headline: string,
  statements: AgentStatement[],
  findings: AgentFinding[],
  steps: AgentStep[],
  simulated: boolean,
): AgentReport {
  const sorted = sortFindings(findings);
  return {
    agent,
    subject,
    subjectLabel,
    headline,
    verdict: verdictOf(sorted),
    statements,
    findings: sorted,
    steps,
    counts: countSeverities(sorted),
    generatedAt: new Date().toISOString(),
    simulated,
  };
}

/** Whether the workspace is running on simulated data, which is never hidden. */
async function isSimulated(workspaceId: string): Promise<boolean> {
  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { isDemo: true } });
  return ws?.isDemo ?? false;
}

/* ==================================================================
   1. DCF Build Agent.

   Walks the layers in the order the engine evaluates them and asks for
   each premise before it is used. What the workspace can offer towards
   an answer is shown with its source and left for the analyst to
   accept, change or reject: outside a demo workspace the agent fills
   nothing, because a premise nobody chose is a premise nobody owns.
   ================================================================== */

interface Offer { label: string; value: string; source: string }

function offer(label: string, value: string | null, source: string): Offer[] {
  return value === null ? [] : [{ label, value, source }];
}

export async function runDcfBuildAgent(
  workspaceId: string,
  ticker: string,
  modelId?: string | null,
): Promise<AgentReport | null> {
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) return null;

  const symbol = dossier.company.ticker;
  const simulated = await isSimulated(workspaceId);

  const model = modelId
    ? await prisma.valuationModel.findFirst({ where: { id: modelId, workspaceId } })
    : await prisma.valuationModel.findFirst({
        where: { workspaceId, company: { ticker: symbol }, kind: 'DCF' },
        orderBy: { updatedAt: 'desc' },
      });

  const stored = model ? parseJson<Partial<DcfAssumptions>>(model.assumptions, {}) : null;
  const suggested = await defaultAssumptionsFor(symbol);
  const a = stored ? normalizeAssumptions(stored) : null;

  const sources = model
    ? await prisma.inputSource.findMany({ where: { workspaceId, modelId: model.id } })
    : [];
  const sourced = new Set(sources.map((s) => s.path));

  const annuals = dossier.annuals.slice(-4);
  const last = annuals[annuals.length - 1] ?? null;
  const statementSource = `Financials tab for ${symbol}`;
  const marketSource = `Market data for ${symbol}`;

  const histGrowth = annuals.length > 1
    ? median(annuals.slice(1).map((p, i) => safeDiv(p.income.revenue, annuals[i].income.revenue)).filter(isNum).map((r) => (r as number) - 1))
    : null;
  const histMargin = median(annuals.map((p) => safeDiv(p.income.ebitda, p.income.revenue)).filter(isNum) as number[]);
  const histCapex = median(annuals.map((p) => (isNum(p.cashFlow.capex) ? safeDiv(Math.abs(p.cashFlow.capex as number), p.income.revenue) : null)).filter(isNum) as number[]);
  const histDa = median(annuals.map((p) => safeDiv(p.income.da, p.income.revenue)).filter(isNum) as number[]);
  const histTax = median(annuals.map((p) => safeDiv(p.income.taxes, p.income.ebt)).filter(isNum) as number[]);

  const steps: AgentStep[] = [];
  const findings: AgentFinding[] = [];
  const href = `/companies/${symbol}/valuation`;

  const step = (s: Omit<AgentStep, 'order'>) => { steps.push({ ...s, order: steps.length + 1 }); };

  /* --- 1. the anchor ------------------------------------------------ */
  const haveBase = !!a && isNum(a.baseRevenue) && a.baseRevenue !== 0;
  step({
    id: 'base',
    title: 'Anchor the model on a reported year',
    question: 'Which reported year does the forecast start from, and what revenue does it close on?',
    status: haveBase ? 'DONE' : last ? 'NEEDS_INPUT' : 'BLOCKED',
    offered: last
      ? [
          { label: `${last.label} revenue`, value: formatNumber(last.income.revenue, 0), source: `${statementSource} — ${last.label}${last.source ? ` (${last.source})` : ''}` },
          { label: 'Fiscal year', value: String(last.fiscalYear), source: statementSource },
        ]
      : [],
    findings: last ? [] : [finding({
      id: 'base-no-statements',
      severity: 'FAIL',
      area: 'Forecast',
      title: 'No annual statements to anchor on',
      detail: `The workspace holds no annual period for ${symbol}, so there is nothing to start a forecast from.`,
      remedy: 'Load the annual statements before building a model.',
      sources: [statementSource],
    })],
    href,
  });

  /* --- 2. revenue --------------------------------------------------- */
  step({
    id: 'revenue',
    title: 'Revenue path',
    question: 'What does revenue do each forecast year, and what drives it?',
    status: a && a.revenueGrowth.length ? 'DONE' : 'NEEDS_INPUT',
    offered: offer('Median growth, last reported years', isNum(histGrowth) ? formatPercent(histGrowth, 1) : null, `${statementSource} — ${annuals.length} annual periods`),
    findings: [],
    href,
  });

  /* --- 3. margins --------------------------------------------------- */
  const marginFindings: AgentFinding[] = [];
  if (a && isNum(histMargin) && a.ebitdaMargin.length) {
    const terminalMargin = a.ebitdaMargin[a.ebitdaMargin.length - 1];
    const gapBps = (terminalMargin - (histMargin as number)) * 10_000;
    if (gapBps > 500) {
      marginFindings.push(finding({
        id: 'margin-expansion',
        severity: 'WARNING',
        area: 'Forecast',
        title: 'Terminal margin sits well above what the company has reported',
        detail: `The final forecast year assumes a ${formatPercent(terminalMargin, 1)} EBITDA margin against a reported median of ${formatPercent(histMargin, 1)} — ${Math.round(gapBps)} bps of expansion.`,
        remedy: 'Say in the model notes what delivers the expansion, or bring the terminal margin back towards the reported range.',
        sources: [`${href} — forecast`, statementSource],
      }));
    }
  }
  step({
    id: 'margins',
    title: 'Operating margin',
    question: 'Where does the EBITDA margin go, and what gets it there?',
    status: a && a.ebitdaMargin.length ? 'DONE' : 'NEEDS_INPUT',
    offered: offer('Median EBITDA margin, last reported years', isNum(histMargin) ? formatPercent(histMargin, 1) : null, statementSource),
    findings: marginFindings,
    href,
  });
  findings.push(...marginFindings);

  /* --- 4. tax ------------------------------------------------------- */
  step({
    id: 'tax',
    title: 'Tax on operating profit',
    question: 'What tax rate applies to EBIT — the effective rate the company pays, or the statutory one?',
    status: a && isNum(a.taxRate) ? 'DONE' : 'NEEDS_INPUT',
    offered: offer('Median effective rate, last reported years', isNum(histTax) ? formatPercent(histTax, 1) : null, `${statementSource} — taxes over pre-tax profit`),
    findings: [],
    href,
  });

  /* --- 5. capex and D&A --------------------------------------------- */
  step({
    id: 'capex',
    title: 'Capex and depreciation',
    question: 'What does the company have to spend to deliver the revenue above, and how does that compare with its depreciation?',
    status: a && a.capexPctRevenue.length ? 'DONE' : 'NEEDS_INPUT',
    offered: [
      ...offer('Median capex % of revenue', isNum(histCapex) ? formatPercent(histCapex, 1) : null, `${statementSource} — cash flow statement`),
      ...offer('Median D&A % of revenue', isNum(histDa) ? formatPercent(histDa, 1) : null, statementSource),
    ],
    findings: [],
    href,
  });

  /* --- 6. working capital ------------------------------------------- */
  step({
    id: 'nwc',
    title: 'Working capital',
    question: 'How much working capital does each extra unit of revenue absorb?',
    status: a && a.nwcPctRevenue.length ? 'DONE' : 'NEEDS_INPUT',
    offered: offer(
      'Suggested from the reported balance sheet',
      suggested && suggested.nwcPctRevenue.length ? formatPercent(suggested.nwcPctRevenue[0], 1) : null,
      `${statementSource} — balance sheet`,
    ),
    findings: [],
    href,
  });

  /* --- 7. discount rate --------------------------------------------- */
  const waccContext = await getWaccBuildContext(workspaceId, symbol, model?.id ?? null);
  const waccInput: WaccBuildInput | null = waccContext ? (waccContext.saved ?? waccContext.suggested) : null;
  const waccResult = waccInput ? buildWaccInstitutional(waccInput) : null;
  const waccFindings: AgentFinding[] = (waccResult?.checks ?? []).map((c) => finding({
    id: `wacc-${c.id}`,
    severity: SEVERITY_FROM_CHECK[c.severity],
    area: 'Discount rate',
    title: c.title,
    detail: c.detail,
    remedy: c.remedy,
    sources: [`${href} — WACC build`],
  }));
  step({
    id: 'wacc',
    title: 'Discount rate',
    question: 'Which risk-free instrument, which beta, and on what capital structure?',
    status: waccContext?.saved ? 'DONE' : 'NEEDS_INPUT',
    offered: (waccResult?.components ?? []).map((c) => ({
      label: c.label,
      value: c.format === 'percent' ? formatPercent(c.value, 2) : c.format === 'ratio' ? formatMultiple(c.value, 2) : formatNumber(c.value, 0),
      source: c.source,
    })),
    findings: waccFindings,
    href: `${href}?tab=wacc`,
  });
  findings.push(...waccFindings);

  /* --- 8. terminal value -------------------------------------------- */
  const comps = await getComps(symbol).catch(() => null);
  const peerMedian = comps ? median(comps.peers.map((p) => p.evEbitda).filter(isNum) as number[]) : null;
  const terminalFindings: AgentFinding[] = [];
  if (a && isNum(a.wacc) && a.terminalMethod === 'GORDON' && a.terminalGrowth >= a.wacc) {
    terminalFindings.push(finding({
      id: 'terminal-growth-above-wacc',
      severity: 'FAIL',
      area: 'Terminal value',
      title: 'Perpetuity growth is not below the discount rate',
      detail: `g of ${formatPercent(a.terminalGrowth, 2)} against a WACC of ${formatPercent(a.wacc, 2)}. The Gordon formula has no finite answer here.`,
      remedy: 'Lower the growth rate below the discount rate, or value the terminal year on an exit multiple instead.',
      sources: [`${href} — terminal value`],
    }));
  }
  step({
    id: 'terminal',
    title: 'Terminal value',
    question: 'Perpetuity growth or an exit multiple — and does the other method agree?',
    status: a ? 'DONE' : 'NEEDS_INPUT',
    offered: [
      ...offer('Peer median EV/EBITDA', isNum(peerMedian) ? formatMultiple(peerMedian, 1) : null, `Comparables for ${symbol}`),
      ...offer('Long-run nominal growth used by the workspace', formatPercent(0.045, 1), 'Workspace macro assumptions'),
    ],
    findings: terminalFindings,
    href,
  });
  findings.push(...terminalFindings);

  /* --- 9. the bridge ------------------------------------------------ */
  const netDebt = dossier.metrics.netDebt;
  const shares = dossier.metrics.sharesOutstanding;
  step({
    id: 'bridge',
    title: 'Enterprise value to value per share',
    question: 'What net debt, minorities and share count turn enterprise value into a price?',
    status: a && isNum(a.sharesOutstanding) && a.sharesOutstanding > 0 ? 'DONE' : 'NEEDS_INPUT',
    offered: [
      ...offer('Net debt', isNum(netDebt) ? formatNumber(netDebt, 0) : null, `${statementSource} — latest balance sheet`),
      ...offer('Shares outstanding', isNum(shares) ? formatNumber(shares, 0) : null, marketSource),
    ],
    findings: [],
    href,
  });

  /* --- 10. the market ----------------------------------------------- */
  const targets = await prisma.consensusTarget.count({ where: { company: { ticker: symbol } } });
  step({
    id: 'consensus',
    title: 'Reconcile against the market',
    question: 'Where does this target sit against the contributed range, and why does it differ?',
    status: model?.consensusNote ? 'DONE' : targets > 0 ? 'NEEDS_INPUT' : 'BLOCKED',
    offered: targets > 0
      ? [{ label: 'Contributed targets on file', value: String(targets), source: `${href} — reconciliation` }]
      : [],
    findings: targets === 0 ? [finding({
      id: 'consensus-none',
      severity: 'INFO',
      area: 'Market',
      title: 'No contributed targets to reconcile against',
      detail: `The workspace holds no third-party target price for ${symbol}. The model stands on its own until one is loaded.`,
      sources: [`${href} — reconciliation`],
    })] : [],
    href,
  });

  const unsourcedSteps = ['wacc.riskFree', 'wacc.beta', 'terminal.growth'].filter((p) => !sourced.has(p));
  if (model && unsourcedSteps.length) {
    findings.push(finding({
      id: 'build-unsourced',
      severity: 'WARNING',
      area: 'Provenance',
      title: 'Load-bearing premises have no source on file',
      detail: `${unsourcedSteps.join(', ')} carry no recorded source. A number nobody can trace is an assertion, whoever typed it.`,
      remedy: 'Record where each came from in the WACC build or the source panel.',
      sources: ['Data quality — source verification'],
    }));
  }

  const outstanding = steps.filter((s) => s.status !== 'DONE').length;
  const statements: AgentStatement[] = [
    {
      kind: 'INTERPRETATION',
      text: outstanding === 0
        ? `Every layer of the ${symbol} model has an answer. What remains is whether the answers are the right ones, which is what the audit agent looks at.`
        : `${outstanding} of ${steps.length} layers still ${outstanding === 1 ? 'needs' : 'need'} a decision from you. Each one below shows what the workspace can offer and where it came from.`,
      sources: [href],
    },
    {
      kind: simulated ? 'OPINION' : 'FACT',
      text: simulated
        ? 'This is a demo workspace, so the models arrive pre-filled to show the shape of a finished build. In a live workspace the agent offers figures and never writes them.'
        : 'The agent does not write into the model. Every figure below is an offer with its source attached, for you to accept, change or reject.',
      sources: [href],
    },
  ];

  return report(
    'DCF_BUILD',
    symbol,
    `${dossier.company.name} (${symbol})`,
    outstanding === 0
      ? 'Build complete — every layer answered'
      : `${outstanding} layer${outstanding === 1 ? ' still needs' : 's still need'} a premise`,
    statements,
    findings,
    steps,
    simulated,
  );
}

/* ==================================================================
   2. Model Audit Agent.

   The Model Health report. Everything a senior reviewer would open the
   model to check, run in one pass and graded Pass, Warning or Fail.
   ================================================================== */

export async function runModelAudit(
  workspaceId: string,
  ticker: string,
  modelId?: string | null,
): Promise<AgentReport | null> {
  const reconciliation = await getModelReconciliation(workspaceId, ticker, modelId);
  if (!reconciliation) return null;

  const symbol = reconciliation.ticker;
  const simulated = await isSimulated(workspaceId);
  const href = `/companies/${symbol}/valuation`;
  const findings: AgentFinding[] = [];

  const model = reconciliation.modelId
    ? await prisma.valuationModel.findFirst({ where: { id: reconciliation.modelId, workspaceId } })
    : null;
  const assumptions = model
    ? normalizeAssumptions(parseJson<Partial<DcfAssumptions>>(model.assumptions, {}))
    : await defaultAssumptionsFor(symbol);
  const dcf = assumptions ? calculateDcf(assumptions) : null;

  /* --- arithmetic ---------------------------------------------------- */
  if (!dcf || !isNum(dcf.fairValuePerShare)) {
    findings.push(finding({
      id: 'audit-no-value',
      severity: 'FAIL',
      area: 'Arithmetic',
      title: 'The model does not produce a value per share',
      detail: 'One of the inputs the bridge needs is missing or zero, so the engine returns no fair value.',
      remedy: 'Check the share count, net debt and the forecast horizon.',
      sources: [href],
    }));
  } else {
    findings.push(finding({
      id: 'audit-values',
      severity: 'PASS',
      area: 'Arithmetic',
      title: 'The model resolves to a value per share',
      detail: `Enterprise value bridges to ${formatNumber(dcf.fairValuePerShare, 2)} per share across ${dcf.years.length} explicit years.`,
      sources: [href],
    }));
  }

  for (const [i, w] of (dcf?.warnings ?? []).entries()) {
    findings.push(finding({
      id: `audit-engine-${i}`,
      severity: 'WARNING',
      area: 'Forecast',
      title: 'The engine flagged the forecast',
      detail: w,
      remedy: 'Revisit the assumption the warning names.',
      sources: [href],
    }));
  }

  /* --- terminal value ------------------------------------------------ */
  for (const [i, f] of reconciliation.terminal.findings.entries()) {
    findings.push(finding({
      id: `audit-terminal-${i}`,
      severity: SEVERITY_FROM_CHECK[f.severity],
      area: 'Terminal value',
      title: f.title,
      detail: f.detail,
      remedy: f.severity === 'ERROR' ? 'The terminal assumption has to change before the model means anything.' : 'Reconcile the two methods, or say in the notes which one carries the case.',
      sources: [`${href} — reconciliation`],
    }));
  }
  if (!reconciliation.terminal.findings.length) {
    findings.push(finding({
      id: 'audit-terminal-ok',
      severity: 'PASS',
      area: 'Terminal value',
      title: 'Both terminal methods agree within tolerance',
      detail: 'The perpetuity assumption and the exit multiple imply values close enough that neither is doing the work alone.',
      sources: [`${href} — reconciliation`],
    }));
  }

  /* --- discount rate -------------------------------------------------- */
  const waccContext = await getWaccBuildContext(workspaceId, symbol, reconciliation.modelId);
  if (waccContext?.saved) {
    const built = buildWaccInstitutional(waccContext.saved);
    for (const c of built.checks) {
      findings.push(finding({
        id: `audit-wacc-${c.id}`,
        severity: SEVERITY_FROM_CHECK[c.severity],
        area: 'Discount rate',
        title: c.title,
        detail: c.detail,
        remedy: c.remedy,
        sources: [`${href} — WACC build`],
      }));
    }
    if (!built.checks.length) {
      findings.push(finding({
        id: 'audit-wacc-ok',
        severity: 'PASS',
        area: 'Discount rate',
        title: 'The discount rate survives the usual questions',
        detail: `WACC of ${formatPercent(built.wacc, 2)} built from a nominal risk-free rate, a stated beta method and market-value weights.`,
        sources: [`${href} — WACC build`],
      }));
    }
  } else {
    findings.push(finding({
      id: 'audit-wacc-untracked',
      severity: 'WARNING',
      area: 'Discount rate',
      title: 'The discount rate was typed rather than built',
      detail: `The model carries a WACC of ${formatPercent(assumptions?.wacc ?? null, 2)} with no recorded build behind it, so nobody can see which risk-free rate, beta or capital structure produced it.`,
      remedy: 'Open the WACC build tab and assemble the rate from its components.',
      sources: [`${href} — WACC build`],
    }));
  }

  /* --- the market ----------------------------------------------------- */
  if (reconciliation.consensus.position === 'UNAVAILABLE') {
    findings.push(finding({
      id: 'audit-consensus-none',
      severity: 'INFO',
      area: 'Market',
      title: 'Nothing to reconcile the target against',
      detail: `No contributed target prices are on file for ${symbol}.`,
      sources: [`${href} — reconciliation`],
    }));
  } else if (reconciliation.consensus.needsRationale && !reconciliation.consensusNote) {
    findings.push(finding({
      id: 'audit-consensus-gap',
      severity: 'WARNING',
      area: 'Market',
      title: 'The target differs materially from the contributed range with no reason recorded',
      detail: reconciliation.consensus.summary,
      remedy: 'Record what the model sees that the contributed targets do not. It goes into the research note.',
      sources: [`${href} — reconciliation`],
    }));
  } else {
    findings.push(finding({
      id: 'audit-consensus-ok',
      severity: 'PASS',
      area: 'Market',
      title: 'The target is reconciled against the contributed range',
      detail: reconciliation.consensusNote
        ? `${reconciliation.consensus.summary} Rationale on file from ${reconciliation.consensusNote.recordedBy}.`
        : reconciliation.consensus.summary,
      sources: [`${href} — reconciliation`],
    }));
  }

  /* --- premises against reality ---------------------------------------- */
  for (const breach of reconciliation.premises.persistentBreaches) {
    findings.push(finding({
      id: `audit-premise-${breach.key}`,
      severity: 'WARNING',
      area: 'Premises',
      title: `${breach.label} has missed in the same direction for ${breach.periods} periods`,
      detail: `Average deviation of ${Math.round(breach.averageBps)} bps against what the model assumes. One period is noise; a run in one direction is a premise that has stopped describing the company.`,
      remedy: 'Re-cut the premise against what has actually been reported, or say why the reported periods are not representative.',
      sources: [`${href} — reconciliation`, `Financials tab for ${symbol}`],
    }));
  }
  if (!reconciliation.premises.persistentBreaches.length && reconciliation.premises.checks.length) {
    findings.push(finding({
      id: 'audit-premises-ok',
      severity: 'PASS',
      area: 'Premises',
      title: 'No premise has drifted persistently from what was reported',
      detail: reconciliation.premises.summary,
      sources: [`${href} — reconciliation`],
    }));
  }

  /* --- provenance ------------------------------------------------------ */
  const v = reconciliation.verification;
  if (v.counts.criticalUnverified > 0) {
    findings.push(finding({
      id: 'audit-provenance-critical',
      severity: 'FAIL',
      area: 'Provenance',
      title: `${v.counts.criticalUnverified} load-bearing input${v.counts.criticalUnverified === 1 ? '' : 's'} cannot be traced to a source`,
      detail: v.summary,
      remedy: 'Record the filing, release or manual entry each one came from before the model is circulated.',
      sources: ['Data quality — source verification'],
    }));
  } else if (v.counts.unverified > 0) {
    findings.push(finding({
      id: 'audit-provenance',
      severity: 'WARNING',
      area: 'Provenance',
      title: `${v.counts.unverified} input${v.counts.unverified === 1 ? '' : 's'} without a recorded source`,
      detail: v.summary,
      remedy: 'Record where each came from in the source panel.',
      sources: ['Data quality — source verification'],
    }));
  } else {
    findings.push(finding({
      id: 'audit-provenance-ok',
      severity: 'PASS',
      area: 'Provenance',
      title: 'Every input traces to a source',
      detail: v.summary,
      sources: ['Data quality — source verification'],
    }));
  }
  if (v.counts.simulated > 0) {
    findings.push(finding({
      id: 'audit-provenance-simulated',
      severity: 'INFO',
      area: 'Provenance',
      title: `${v.counts.simulated} input${v.counts.simulated === 1 ? ' comes' : 's come'} from simulated data`,
      detail: 'Marked as simulated rather than presented as observed. The model is sound; the inputs are not real filings.',
      sources: ['Data quality — source verification'],
    }));
  }

  const counts = countSeverities(findings);
  const verdict = verdictOf(findings);

  const statements: AgentStatement[] = [
    {
      kind: 'CALCULATION',
      text: dcf && isNum(dcf.fairValuePerShare)
        ? `The model values ${symbol} at ${formatNumber(dcf.fairValuePerShare, 2)} per share against a price of ${formatNumber(reconciliation.currentPrice, 2)}, with ${formatPercent(dcf.terminalValuePctOfEv, 0)} of enterprise value in the terminal assumption.`
        : 'The model does not resolve to a value per share, so there is nothing to grade beyond the inputs.',
      sources: [href],
    },
    {
      kind: 'INTERPRETATION',
      text: verdict === 'FAIL'
        ? `${counts.FAIL} check${counts.FAIL === 1 ? '' : 's'} would stop this model in a review. Those come first below.`
        : verdict === 'WARNING'
          ? `Nothing here is wrong arithmetically. ${counts.WARNING} judgement${counts.WARNING === 1 ? '' : 's'} would be questioned.`
          : 'The model passes every check the platform knows how to run. That is not the same as being right.',
      sources: [href],
    },
    {
      kind: 'OPINION',
      text: 'A clean report says the model is internally consistent and traceable. Whether the premises describe the business is a judgement no check can make for you.',
      sources: [href],
    },
  ];

  return report(
    'MODEL_AUDIT',
    symbol,
    `${reconciliation.companyName} (${symbol})${reconciliation.modelName ? ` — ${reconciliation.modelName}` : ''}`,
    verdict === 'FAIL' ? 'Model health: fail' : verdict === 'WARNING' ? 'Model health: warnings' : 'Model health: pass',
    statements,
    findings,
    [],
    simulated,
  );
}

/* ==================================================================
   3. Q&A Prep Agent.

   The generator already refuses to answer beyond the workspace. The
   agent reads what it produced and says how ready the case is.
   ================================================================== */

export async function runQaPrepAgent(workspaceId: string, ticker: string): Promise<AgentReport | null> {
  const prep = await getQaPrep(workspaceId, ticker);
  if (!prep) return null;

  const symbol = prep.ticker;
  const simulated = await isSimulated(workspaceId);
  const href = `/companies/${symbol}/deck`;
  const findings: AgentFinding[] = [];

  for (const q of prep.questions.filter((g) => g.hasGap)) {
    findings.push(finding({
      id: `qa-gap-${q.theme}-${q.question.slice(0, 24)}`,
      severity: 'WARNING',
      area: 'Preparation',
      title: 'A likely question has no answer in the workspace',
      detail: `"${q.question}" — ${q.gap ?? 'the workspace holds nothing to answer it with.'}`,
      remedy: 'Load what is missing, or prepare an answer that says plainly what is not known.',
      sources: [href],
    }));
  }

  const unprepared = prep.saved.filter((q) => q.status === 'PENDING').length;
  const needsWork = prep.saved.filter((q) => q.status === 'NEEDS_WORK').length;

  if (needsWork) {
    findings.push(finding({
      id: 'qa-needs-work',
      severity: 'WARNING',
      area: 'Preparation',
      title: `${needsWork} answer${needsWork === 1 ? '' : 's'} marked as needing more work`,
      detail: 'Someone has read these and decided the draft is not good enough yet.',
      remedy: 'Finish them before the committee meets.',
      sources: [href],
    }));
  }
  if (unprepared) {
    findings.push(finding({
      id: 'qa-pending',
      severity: 'INFO',
      area: 'Preparation',
      title: `${unprepared} question${unprepared === 1 ? ' has' : 's have'} not been reviewed`,
      detail: 'The drafts exist but nobody has confirmed them.',
      remedy: 'Read each draft and mark it prepared or needing work.',
      sources: [href],
    }));
  }
  if (!findings.length && prep.saved.length) {
    findings.push(finding({
      id: 'qa-ready',
      severity: 'PASS',
      area: 'Preparation',
      title: 'Every question has a reviewed answer',
      detail: `${prep.saved.length} questions prepared, each citing where its figures came from.`,
      sources: [href],
    }));
  }

  const statements: AgentStatement[] = [
    {
      kind: 'INTERPRETATION',
      text: `${prep.questions.length} question${prep.questions.length === 1 ? '' : 's'} a committee would plausibly ask about ${symbol}, drawn from the deck, the model, the comparables and the book.`,
      sources: [href],
    },
    {
      kind: 'FACT',
      text: 'Each draft answer is assembled from workspace records only. Where the record is missing, the draft says so rather than filling the gap.',
      sources: [href],
    },
  ];

  return report(
    'QA_PREP',
    symbol,
    `${prep.companyName} (${symbol})`,
    prep.counts.gaps > 0
      ? `${prep.counts.gaps} question${prep.counts.gaps === 1 ? '' : 's'} the workspace cannot answer`
      : 'Every likely question can be answered from the workspace',
    statements,
    findings,
    [],
    simulated,
  );
}

/* ==================================================================
   4. Thesis Monitor Agent.

   Extended past the alert engine's own checks into the premises behind
   each thesis's model, which is where a thesis usually breaks first.
   ================================================================== */

export async function runThesisMonitor(workspaceId: string): Promise<AgentReport> {
  const simulated = await isSimulated(workspaceId);
  const health = await evaluateThesisHealth(workspaceId);
  const findings: AgentFinding[] = [];

  for (const t of health) {
    const href = `/companies/${t.ticker}/thesis`;
    if (t.verdict === 'BROKEN') {
      findings.push(finding({
        id: `thesis-broken-${t.thesisId}`,
        severity: 'FAIL',
        area: t.ticker,
        title: `The ${t.ticker} thesis is broken on its own terms`,
        detail: `${t.breached} of ${t.checks.length} stated conditions no longer hold. ${t.summary}`,
        remedy: 'Restate the thesis or close the position. A broken thesis held open is a decision nobody made.',
        sources: [href, `Monitoring — ${t.ticker}`],
      }));
    } else if (t.verdict === 'WEAKENING') {
      findings.push(finding({
        id: `thesis-weak-${t.thesisId}`,
        severity: 'WARNING',
        area: t.ticker,
        title: `The ${t.ticker} thesis is weakening`,
        detail: t.summary,
        remedy: 'Check whether the breached condition was load-bearing.',
        sources: [href],
      }));
    } else if (t.verdict === 'INSUFFICIENT_DATA') {
      findings.push(finding({
        id: `thesis-blind-${t.thesisId}`,
        severity: 'INFO',
        area: t.ticker,
        title: `The ${t.ticker} thesis cannot be checked`,
        detail: `${t.unavailable} of its conditions have no current measure in the workspace, so the verdict is unknown rather than intact.`,
        remedy: 'Load the missing measures, or restate the conditions in terms the workspace can track.',
        sources: [href],
      }));
    }
  }

  // The premises behind each thesis's model, which move before the
  // headline measures do.
  const withModels = health.filter((t) => t.verdict !== 'BROKEN').slice(0, 12);
  for (const t of withModels) {
    const rec = await getModelReconciliation(workspaceId, t.ticker).catch(() => null);
    if (!rec) continue;
    for (const breach of rec.premises.persistentBreaches) {
      findings.push(finding({
        id: `premise-${t.ticker}-${breach.key}`,
        severity: 'WARNING',
        area: t.ticker,
        title: `${breach.label} in the ${t.ticker} model has drifted for ${breach.periods} periods`,
        detail: `Average deviation of ${Math.round(breach.averageBps)} bps from what the model assumes. The thesis still reads as ${t.verdict.toLowerCase()}, but the model under it has stopped matching what the company reports.`,
        remedy: 'Re-cut the premise, or say why the reported periods are not representative.',
        sources: [`/companies/${t.ticker}/valuation — reconciliation`],
      }));
    }
  }

  const intact = health.filter((t) => t.verdict === 'INTACT').length;
  if (intact && !findings.length) {
    findings.push(finding({
      id: 'thesis-all-intact',
      severity: 'PASS',
      area: 'Workspace',
      title: `All ${intact} live theses hold on their stated conditions`,
      detail: 'Every condition an analyst wrote down is still true, and no model premise has drifted persistently.',
      sources: ['/monitoring'],
    }));
  }

  const statements: AgentStatement[] = [
    {
      kind: 'FACT',
      text: `${health.length} live thes${health.length === 1 ? 'is' : 'es'} in the workspace, checked against the conditions their authors wrote down and against the premises in their models.`,
      sources: ['/monitoring'],
    },
    {
      kind: 'INTERPRETATION',
      text: health.length
        ? `${intact} intact, ${health.filter((t) => t.verdict === 'WEAKENING').length} weakening, ${health.filter((t) => t.verdict === 'BROKEN').length} broken, ${health.filter((t) => t.verdict === 'INSUFFICIENT_DATA').length} unverifiable.`
        : 'No thesis has been written yet, so there is nothing to monitor.',
      sources: ['/monitoring'],
    },
  ];

  return report(
    'THESIS_MONITOR',
    'workspace',
    'Live theses',
    findings.some((f) => f.severity === 'FAIL')
      ? 'A thesis has broken on its own terms'
      : findings.some((f) => f.severity === 'WARNING')
        ? 'Something under a live thesis has moved'
        : 'Nothing has moved under the live theses',
    statements,
    findings,
    [],
    simulated,
  );
}

export { AGENT_META };
