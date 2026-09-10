import { formatBps, formatCompact, formatMoney, formatMultiple, formatPercent, DASH } from '@/lib/finance/format';
import { isNum } from '@/lib/finance/core';
import type { AiAnswer, AnswerBlock } from './types';
import type { AiContext, CompanyContext, PortfolioContext } from './context';
import { detectIntent, type Intent } from './intent';

/* ================================================================
   Deterministic reasoning engine.

   This is not a language model. It reads the context pack, applies the
   analyst logic the platform already encodes, and writes the answer in
   typed blocks. Because it can only reference values present in the
   pack, it cannot fabricate a number; where a value is absent it says so.
   ================================================================ */

const fmtMoney = (v: number | null, c: CompanyContext) => formatMoney(v, c.currency, 2);
const fmtBig = (v: number | null, c: CompanyContext) => formatCompact(v, { currency: c.currency });

function block(kind: AnswerBlock['kind'], text: string, sources: string[] = []): AnswerBlock {
  return { kind, text, sources };
}

function missingCompany(question: string): AiAnswer {
  return {
    intent: 'OVERVIEW',
    headline: 'No company in context',
    blocks: [
      block('MISSING',
        'This question is about a specific company, but no company is open and none was named. Open a company page or include a ticker in the question.',
        []),
    ],
    followUps: ['Open VALE3', 'Compare ITUB4 with its peers', 'Review the portfolio'],
    provider: 'deterministic',
    contextSummary: question,
  };
}

/* ------------------------------ Valuation ------------------------------ */

function answerValuation(c: CompanyContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  const m = c.metrics;

  if (isNum(c.price)) {
    blocks.push(block('FACT',
      `${c.ticker} last traded at ${fmtMoney(c.price, c)}, a market capitalisation of ${fmtBig(c.marketCap, c)} and an enterprise value of ${fmtBig(c.enterpriseValue, c)}.`,
      ['Security.lastPrice', `FinancialStatement ${c.basisLabel}`]));
  } else {
    blocks.push(block('MISSING', `No price is recorded for ${c.ticker}, so no valuation multiple can be computed.`, []));
    return { intent: 'VALUATION', headline: 'Price unavailable', blocks, followUps: [], provider: 'deterministic', contextSummary: c.ticker };
  }

  const multiples: string[] = [];
  if (isNum(m.evEbitda)) multiples.push(`EV/EBITDA ${formatMultiple(m.evEbitda)}`);
  if (isNum(m.pe)) multiples.push(`P/E ${formatMultiple(m.pe)}`);
  if (isNum(m.pb)) multiples.push(`P/B ${formatMultiple(m.pb)}`);
  if (isNum(m.fcfYield)) multiples.push(`FCF yield ${formatPercent(m.fcfYield)}`);
  if (multiples.length) {
    blocks.push(block('CALCULATION',
      `On ${c.basisLabel} figures the shares trade at ${multiples.join(', ')}.`,
      [`FinancialStatement ${c.basisLabel}`, 'Security.lastPrice']));
  }
  if (c.bankLike) {
    blocks.push(block('INTERPRETATION',
      'Enterprise-value multiples are withheld for a deposit-funded institution: its debt is an input to the business rather than a financing choice, so P/E and P/B are the comparable measures.',
      []));
  }

  const hist = c.historicalMultiples.find((h) => h.metric === (c.bankLike ? 'pe' : 'evEbitda'));
  if (hist && isNum(hist.current) && isNum(hist.median5y)) {
    const gap = (hist.current as number) / (hist.median5y as number) - 1;
    blocks.push(block('CALCULATION',
      `${hist.label} of ${formatMultiple(hist.current)} sits ${formatPercent(Math.abs(gap))} ${gap < 0 ? 'below' : 'above'} its five-year median of ${formatMultiple(hist.median5y)}` +
      (isNum(hist.percentileIn5y) ? `, in the ${Math.round((hist.percentileIn5y as number) * 100)}th percentile of its own five-year range.` : '.'),
      ['PriceBar series', 'FinancialStatement history']));
  } else {
    blocks.push(block('MISSING', 'There is not enough price and statement history in the workspace to place the current multiple in its own historical range.', []));
  }

  const peerKey = c.bankLike ? 'pe' : 'evEbitda';
  const peerStat = c.peerStats[peerKey];
  const own = m[peerKey];
  if (peerStat && isNum(peerStat.median) && isNum(own)) {
    const gap = (own as number) / (peerStat.median as number) - 1;
    blocks.push(block('CALCULATION',
      `Against the peer group (${peerStat.count} companies) the median ${peerKey === 'pe' ? 'P/E' : 'EV/EBITDA'} is ${formatMultiple(peerStat.median)}; ${c.ticker} trades at a ${formatPercent(Math.abs(gap))} ${gap < 0 ? 'discount' : 'premium'}.`,
      ['Comparables module']));
  }

  if (c.dcf && isNum(c.dcf.fairValuePerShare)) {
    blocks.push(block('CALCULATION',
      `The workspace discounted cash flow returns a fair value of ${fmtMoney(c.dcf.fairValuePerShare, c)} per share on a WACC of ${formatPercent(c.dcf.wacc)} and terminal growth of ${formatPercent(c.dcf.terminalGrowth)}, implying ${formatPercent(c.dcf.upside, 1, { signed: true })} against the current price.`,
      [`ValuationModel ${c.dcf.name}`]));
    if (isNum(c.dcf.terminalValuePctOfEv) && (c.dcf.terminalValuePctOfEv as number) > 0.75) {
      blocks.push(block('INTERPRETATION',
        `${formatPercent(c.dcf.terminalValuePctOfEv, 0)} of the enterprise value in that model comes from the terminal value, so the conclusion is driven by the perpetuity assumptions more than by the explicit forecast.`,
        [`ValuationModel ${c.dcf.name}`]));
    }
  } else {
    blocks.push(block('MISSING', 'No discounted cash flow model exists for this company in this workspace. Build one from the valuation tab to add an intrinsic anchor to the multiple comparison.', []));
  }

  if (c.reverseDcf && isNum(c.reverseDcf.impliedRevenueCagr)) {
    blocks.push(block('CALCULATION',
      `Holding every other assumption constant, the current price implies a revenue CAGR of ${formatPercent(c.reverseDcf.impliedRevenueCagr)} over the forecast window.`,
      ['Reverse DCF solver']));
  }

  // The judgement, explicitly separated from the figures.
  const signals: string[] = [];
  if (hist && isNum(hist.percentileIn5y)) signals.push((hist.percentileIn5y as number) < 0.35 ? 'cheap' : (hist.percentileIn5y as number) > 0.7 ? 'rich' : 'mid');
  if (c.dcf && isNum(c.dcf.upside)) signals.push((c.dcf.upside as number) > 0.15 ? 'cheap' : (c.dcf.upside as number) < -0.05 ? 'rich' : 'mid');
  const peerSignal = peerStat && isNum(peerStat.median) && isNum(own)
    ? ((own as number) / (peerStat.median as number) - 1 < -0.1 ? 'cheap' : (own as number) / (peerStat.median as number) - 1 > 0.15 ? 'rich' : 'mid')
    : null;
  if (peerSignal) signals.push(peerSignal);

  const cheapCount = signals.filter((s) => s === 'cheap').length;
  const richCount = signals.filter((s) => s === 'rich').length;
  if (signals.length) {
    const verdict =
      cheapCount > richCount
        ? `${cheapCount} of the ${signals.length} valuation anchors point to the shares being undervalued`
        : richCount > cheapCount
          ? `${richCount} of the ${signals.length} valuation anchors point to the shares being expensive`
          : 'the valuation anchors disagree with each other';
    blocks.push(block('OPINION',
      `Taken together, ${verdict}. This is a judgement built on the assumptions above — change the WACC, the terminal growth or the peer set and the conclusion can change.`,
      []));
  }

  return {
    intent: 'VALUATION',
    headline: `${c.ticker} — valuation`,
    blocks,
    followUps: [
      `What does the current ${c.ticker} price already imply?`,
      `Compare ${c.ticker} with its peers`,
      `What is the biggest risk in the ${c.ticker} thesis?`,
    ],
    provider: 'deterministic',
    contextSummary: `${c.ticker} valuation on ${c.basisLabel}`,
  };
}

/* -------------------------------- ROIC -------------------------------- */

function answerRoic(c: CompanyContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  const m = c.metrics;

  if (c.bankLike) {
    blocks.push(block('INTERPRETATION',
      'Return on invested capital is not a meaningful measure for a deposit-funded institution — the loan book is funded by liabilities that are part of the operating model. Return on equity is used instead.',
      []));
    if (isNum(m.roe)) {
      blocks.push(block('CALCULATION', `${c.ticker} earned a return on equity of ${formatPercent(m.roe)} on ${c.basisLabel} figures.`, [`FinancialStatement ${c.basisLabel}`]));
    }
    return { intent: 'ROIC', headline: `${c.ticker} — returns`, blocks, followUps: [`How has ${c.ticker} ROE moved over time?`], provider: 'deterministic', contextSummary: c.ticker };
  }

  if (!isNum(m.roic)) {
    blocks.push(block('MISSING', `Return on invested capital cannot be computed for ${c.ticker}: ${c.dataQuality.missingFields.length ? `the workspace is missing ${c.dataQuality.missingFields.join(', ')}.` : 'the statement set is incomplete.'}`, []));
    return { intent: 'ROIC', headline: `${c.ticker} — ROIC`, blocks, followUps: [], provider: 'deterministic', contextSummary: c.ticker };
  }

  blocks.push(block('CALCULATION',
    `ROIC on ${c.basisLabel} is ${formatPercent(m.roic)}, computed as NOPAT over average invested capital of ${fmtBig(m.investedCapital, c)}.`,
    [`FinancialStatement ${c.basisLabel}`, 'ROIC engine']));

  if (isNum(m.nopatMargin) && isNum(m.capitalTurnover)) {
    blocks.push(block('CALCULATION',
      `It decomposes into a NOPAT margin of ${formatPercent(m.nopatMargin)} multiplied by invested-capital turnover of ${formatMultiple(m.capitalTurnover, 2)}.`,
      ['ROIC engine']));
  }

  if (isNum(m.wacc)) {
    const spread = m.roicSpread;
    if (isNum(spread)) {
      blocks.push(block('CALCULATION',
        `Against a WACC of ${formatPercent(m.wacc)} the spread is ${formatBps(spread)}${isNum(m.investedCapital) ? `, an economic profit of ${fmtBig((spread as number) * (m.investedCapital as number), c)} on the capital employed` : ''}.`,
        ['WACC engine (CAPM)']));
      blocks.push(block('INTERPRETATION',
        (spread as number) > 0
          ? 'The business earns more on incremental capital than that capital costs, so growth adds value.'
          : 'The business earns less on capital than that capital costs, so growth destroys value until the spread turns positive.',
        []));
    }
  }

  const roicHistory = c.history.filter((h) => isNum(h.roic));
  if (roicHistory.length >= 3) {
    const first = roicHistory[0];
    const last = roicHistory[roicHistory.length - 1];
    const delta = (last.roic as number) - (first.roic as number);
    const consecutiveDecline = (() => {
      let n = 0;
      for (let i = roicHistory.length - 1; i > 0; i--) {
        if ((roicHistory[i].roic as number) < (roicHistory[i - 1].roic as number)) n++;
        else break;
      }
      return n;
    })();
    blocks.push(block('FACT',
      `Over the reported history ROIC moved from ${formatPercent(first.roic)} in ${first.label} to ${formatPercent(last.roic)} in ${last.label}, a change of ${formatBps(delta)}.`,
      ['FinancialStatement history']));
    if (consecutiveDecline >= 2) {
      blocks.push(block('INTERPRETATION',
        `ROIC has fallen for ${consecutiveDecline} consecutive reported periods. Check whether the driver is the NOPAT margin or capital turnover — the decomposition above separates the two.`,
        []));
    }
  }

  return {
    intent: 'ROIC',
    headline: `${c.ticker} — return on invested capital`,
    blocks,
    followUps: [`Why did ${c.ticker} margins change?`, `Is ${c.ticker} cheap?`, `How does ${c.ticker} compare with its peers on ROIC?`],
    provider: 'deterministic',
    contextSummary: `${c.ticker} ROIC`,
  };
}

/* ------------------------------ Margins ------------------------------- */

function answerMargins(c: CompanyContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  const m = c.metrics;
  const parts: string[] = [];
  if (isNum(m.grossMargin)) parts.push(`gross ${formatPercent(m.grossMargin)}`);
  if (isNum(m.ebitdaMargin)) parts.push(`EBITDA ${formatPercent(m.ebitdaMargin)}`);
  if (isNum(m.ebitMargin)) parts.push(`EBIT ${formatPercent(m.ebitMargin)}`);
  if (isNum(m.netMargin)) parts.push(`net ${formatPercent(m.netMargin)}`);
  if (isNum(m.fcfMargin)) parts.push(`free cash flow ${formatPercent(m.fcfMargin)}`);

  if (parts.length) {
    blocks.push(block('CALCULATION', `On ${c.basisLabel}, margins are ${parts.join(', ')}.`, [`FinancialStatement ${c.basisLabel}`]));
  } else {
    blocks.push(block('MISSING', 'No margin can be computed: revenue or the corresponding profit line is missing.', []));
  }

  const series = c.history.filter((h) => isNum(h.ebitdaMargin));
  if (series.length >= 2) {
    const first = series[0];
    const last = series[series.length - 1];
    const delta = (last.ebitdaMargin as number) - (first.ebitdaMargin as number);
    blocks.push(block('FACT',
      `EBITDA margin moved from ${formatPercent(first.ebitdaMargin)} in ${first.label} to ${formatPercent(last.ebitdaMargin)} in ${last.label}, ${formatBps(delta)}.`,
      ['FinancialStatement history']));
    const recent = series.slice(-3);
    const declining = recent.length === 3 &&
      (recent[2].ebitdaMargin as number) < (recent[1].ebitdaMargin as number) &&
      (recent[1].ebitdaMargin as number) < (recent[0].ebitdaMargin as number);
    if (declining) {
      blocks.push(block('INTERPRETATION', 'The margin has compressed in each of the last three reported periods, which is a trend rather than a single weak print.', []));
    }
  }

  const stat = c.peerStats.ebitdaMargin;
  if (stat && isNum(stat.median) && isNum(m.ebitdaMargin)) {
    const gap = (m.ebitdaMargin as number) - (stat.median as number);
    blocks.push(block('CALCULATION',
      `The peer median EBITDA margin is ${formatPercent(stat.median)}; ${c.ticker} runs ${formatBps(gap)} ${gap > 0 ? 'above' : 'below'} it.`,
      ['Comparables module']));
  }

  return {
    intent: 'MARGINS', headline: `${c.ticker} — margins`, blocks,
    followUps: [`What happened to ${c.ticker} ROIC?`, `Summarise the last ${c.ticker} result`],
    provider: 'deterministic', contextSummary: `${c.ticker} margins`,
  };
}

/* ------------------------------- Growth ------------------------------- */

function answerGrowth(c: CompanyContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  const m = c.metrics;
  const parts: string[] = [];
  if (isNum(m.revenueGrowth)) parts.push(`revenue ${formatPercent(m.revenueGrowth, 1, { signed: true })}`);
  if (isNum(m.ebitdaGrowth)) parts.push(`EBITDA ${formatPercent(m.ebitdaGrowth, 1, { signed: true })}`);
  if (isNum(m.epsGrowth)) parts.push(`EPS ${formatPercent(m.epsGrowth, 1, { signed: true })}`);
  if (isNum(m.fcfGrowth)) parts.push(`free cash flow ${formatPercent(m.fcfGrowth, 1, { signed: true })}`);

  if (parts.length) {
    blocks.push(block('CALCULATION', `Year on year, ${parts.join(', ')}.`, [`FinancialStatement ${c.basisLabel}`]));
  } else {
    blocks.push(block('MISSING', 'Year-on-year growth cannot be computed: the comparable prior period is not in the workspace.', []));
  }
  if (isNum(m.revenueCagr3y)) {
    blocks.push(block('CALCULATION', `The three-year revenue CAGR is ${formatPercent(m.revenueCagr3y)}${isNum(m.revenueCagr5y) ? ` and the five-year CAGR is ${formatPercent(m.revenueCagr5y)}` : ''}.`, ['FinancialStatement history']));
  }
  const stat = c.peerStats.revenueGrowth;
  if (stat && isNum(stat.median) && isNum(m.revenueGrowth)) {
    blocks.push(block('CALCULATION',
      `Peer median revenue growth is ${formatPercent(stat.median)}, against ${formatPercent(m.revenueGrowth)} for ${c.ticker}.`,
      ['Comparables module']));
  }
  if (c.reverseDcf && isNum(c.reverseDcf.impliedRevenueCagr) && isNum(m.revenueCagr3y)) {
    const implied = c.reverseDcf.impliedRevenueCagr as number;
    const historical = m.revenueCagr3y as number;
    blocks.push(block('INTERPRETATION',
      implied > historical
        ? `The price requires a revenue CAGR of ${formatPercent(implied)}, above the ${formatPercent(historical)} the company actually delivered over the last three years — the market is paying for an acceleration.`
        : `The price requires a revenue CAGR of ${formatPercent(implied)}, below the ${formatPercent(historical)} delivered over the last three years — the market is discounting a slowdown.`,
      ['Reverse DCF solver']));
  }
  return {
    intent: 'GROWTH', headline: `${c.ticker} — growth`, blocks,
    followUps: [`Is ${c.ticker} cheap?`, `What does the ${c.ticker} price already imply?`],
    provider: 'deterministic', contextSummary: `${c.ticker} growth`,
  };
}

/* ------------------------------ Leverage ------------------------------ */

function answerLeverage(c: CompanyContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  const m = c.metrics;
  if (isNum(m.netDebt)) {
    blocks.push(block('CALCULATION',
      (m.netDebt as number) < 0
        ? `${c.ticker} holds a net cash position of ${fmtBig(Math.abs(m.netDebt as number), c)} on ${c.basisLabel} figures.`
        : `Net debt is ${fmtBig(m.netDebt, c)} on ${c.basisLabel} figures, against gross debt of ${fmtBig(m.totalDebt, c)}.`,
      [`FinancialStatement ${c.basisLabel}`]));
  } else {
    blocks.push(block('MISSING', 'Net debt cannot be computed: the debt or cash lines are missing.', []));
  }
  if (isNum(m.netDebtToEbitda)) {
    blocks.push(block('CALCULATION', `Net debt/EBITDA is ${formatMultiple(m.netDebtToEbitda, 2)}${isNum(m.interestCoverage) ? ` and interest cover is ${formatMultiple(m.interestCoverage, 1)}` : ''}.`, [`FinancialStatement ${c.basisLabel}`]));
    const lev = m.netDebtToEbitda as number;
    blocks.push(block('INTERPRETATION',
      lev < 0 ? 'The balance sheet is in net cash, so leverage is not a constraint on capital allocation.'
        : lev < 1.5 ? 'Leverage is conservative and leaves room for both investment and distributions.'
        : lev < 3 ? 'Leverage is moderate; the balance sheet is not yet a constraint but it limits the size of any large acquisition.'
        : 'Leverage is elevated. At this level the cost and availability of refinancing becomes a driver of equity value in its own right.',
      []));
  }
  const stat = c.peerStats.netDebtToEbitda;
  if (stat && isNum(stat.median)) {
    blocks.push(block('CALCULATION', `The peer median is ${formatMultiple(stat.median, 2)}.`, ['Comparables module']));
  }
  return {
    intent: 'LEVERAGE', headline: `${c.ticker} — balance sheet`, blocks,
    followUps: [`How is ${c.ticker} allocating capital?`, `What is the biggest risk in the ${c.ticker} thesis?`],
    provider: 'deterministic', contextSummary: `${c.ticker} leverage`,
  };
}

/* ------------------------------ Cash flow ----------------------------- */

function answerCashFlow(c: CompanyContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  const m = c.metrics;
  if (isNum(m.cfo)) {
    blocks.push(block('FACT',
      `Cash from operations was ${fmtBig(m.cfo, c)} on ${c.basisLabel}, with capital expenditure of ${fmtBig(isNum(m.capex) ? Math.abs(m.capex as number) : null, c)}.`,
      [`FinancialStatement ${c.basisLabel}`]));
  }
  if (isNum(m.fcf)) {
    blocks.push(block('CALCULATION',
      `Free cash flow is ${fmtBig(m.fcf, c)}${isNum(m.fcfYield) ? `, a yield of ${formatPercent(m.fcfYield)} on the current market capitalisation` : ''}${isNum(m.fcfConversion) ? ` and a conversion of ${formatPercent(m.fcfConversion)} of EBITDA` : ''}.`,
      [`FinancialStatement ${c.basisLabel}`, 'Security.lastPrice']));
  } else {
    blocks.push(block('MISSING', 'Free cash flow cannot be computed: cash from operations is not in the workspace for this period.', []));
  }
  if (isNum(m.fcfConversion)) {
    const conv = m.fcfConversion as number;
    blocks.push(block('INTERPRETATION',
      conv > 0.6 ? 'Reported profit is converting into cash at a high rate, which supports the quality of the earnings.'
        : conv > 0.3 ? 'Conversion is moderate; the gap between EBITDA and cash is worth attributing to working capital or capital expenditure.'
        : 'Conversion is low. Either the company is investing heavily or working capital is absorbing the profit — the cash-flow statement separates the two.',
      []));
  }
  if (isNum(m.capexToRevenue)) {
    blocks.push(block('CALCULATION', `Capital expenditure runs at ${formatPercent(m.capexToRevenue)} of revenue.`, [`FinancialStatement ${c.basisLabel}`]));
  }
  return {
    intent: 'CASH_FLOW', headline: `${c.ticker} — cash generation`, blocks,
    followUps: [`How is ${c.ticker} allocating capital?`, `Is ${c.ticker} cheap?`],
    provider: 'deterministic', contextSummary: `${c.ticker} cash flow`,
  };
}

/* --------------------------- Peer comparison --------------------------- */

function answerPeers(c: CompanyContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  if (!c.peers.length) {
    blocks.push(block('MISSING', `No peer group is defined for ${c.ticker} in this workspace.`, []));
    return { intent: 'PEER_COMPARISON', headline: `${c.ticker} — peers`, blocks, followUps: [], provider: 'deterministic', contextSummary: c.ticker };
  }

  blocks.push(block('FACT',
    `The peer group holds ${c.peers.length} companies: ${c.peers.map((p) => p.ticker).join(', ')}.`,
    ['PeerLink table']));

  const rows: string[] = [];
  const key = c.bankLike ? 'pe' : 'evEbitda';
  const label = c.bankLike ? 'P/E' : 'EV/EBITDA';
  const ownMultiple = c.metrics[key];
  const stat = c.peerStats[key];
  if (isNum(ownMultiple) && stat && isNum(stat.median)) {
    const gap = (ownMultiple as number) / (stat.median as number) - 1;
    rows.push(`${label}: ${formatMultiple(ownMultiple)} against a peer median of ${formatMultiple(stat.median)} (${formatPercent(Math.abs(gap))} ${gap < 0 ? 'discount' : 'premium'})`);
  }
  for (const [metric, name, fmt] of [
    ['ebitdaMargin', 'EBITDA margin', 'pct'],
    ['roic', 'ROIC', 'pct'],
    ['revenueGrowth', 'Revenue growth', 'pct'],
    ['netDebtToEbitda', 'Net debt/EBITDA', 'mult'],
  ] as const) {
    const own = c.metrics[metric];
    const s = c.peerStats[metric];
    if (isNum(own) && s && isNum(s.median)) {
      const f = fmt === 'pct' ? formatPercent : (v: number | null) => formatMultiple(v, 2);
      rows.push(`${name}: ${f(own)} against a peer median of ${f(s.median)}`);
    }
  }
  if (rows.length) blocks.push(block('CALCULATION', rows.join('. ') + '.', ['Comparables module']));

  const better: string[] = [];
  const worse: string[] = [];
  if (isNum(c.metrics.roic) && isNum(c.peerStats.roic?.median)) {
    ((c.metrics.roic as number) > (c.peerStats.roic!.median as number) ? better : worse).push('return on capital');
  }
  if (isNum(c.metrics.ebitdaMargin) && isNum(c.peerStats.ebitdaMargin?.median)) {
    ((c.metrics.ebitdaMargin as number) > (c.peerStats.ebitdaMargin!.median as number) ? better : worse).push('operating margin');
  }
  if (isNum(c.metrics.revenueGrowth) && isNum(c.peerStats.revenueGrowth?.median)) {
    ((c.metrics.revenueGrowth as number) > (c.peerStats.revenueGrowth!.median as number) ? better : worse).push('growth');
  }
  if (better.length || worse.length) {
    blocks.push(block('INTERPRETATION',
      `${c.ticker} screens better than the group on ${better.length ? better.join(' and ') : 'none of the operating measures'}, and worse on ${worse.length ? worse.join(' and ') : 'none'}.`,
      []));
    if (isNum(ownMultiple) && stat && isNum(stat.median)) {
      const cheaper = (ownMultiple as number) < (stat.median as number);
      blocks.push(block('OPINION',
        cheaper && better.length
          ? 'A discount alongside better operating metrics is the configuration worth investigating: either the market is discounting something the metrics do not yet show, or the discount is unwarranted.'
          : !cheaper && worse.length
            ? 'A premium alongside weaker operating metrics needs an explanation that the comparables table alone does not provide.'
            : 'The rating and the operating metrics are broadly consistent with each other.',
        []));
    }
  }

  return {
    intent: 'PEER_COMPARISON', headline: `${c.ticker} versus peers`, blocks,
    followUps: [`Is ${c.ticker} cheap?`, `What is the implied valuation on the peer median multiple?`],
    provider: 'deterministic', contextSummary: `${c.ticker} peers`,
  };
}

/* --------------------------------- DCF --------------------------------- */

function answerDcf(c: CompanyContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  if (!c.dcf) {
    blocks.push(block('MISSING',
      `No discounted cash flow model exists for ${c.ticker} in this workspace. The valuation tab will build one from the company's own reported history — base revenue, historical margins, the observed effective tax rate and a WACC from the workspace risk-free rate and equity risk premium.`,
      []));
    return { intent: 'DCF', headline: `${c.ticker} — no model yet`, blocks, followUps: [`Open the ${c.ticker} valuation tab`], provider: 'deterministic', contextSummary: c.ticker };
  }
  const d = c.dcf;
  blocks.push(block('FACT',
    `Model "${d.name}" runs a ${d.revenueGrowth.length}-year forecast at a WACC of ${formatPercent(d.wacc)} and terminal growth of ${formatPercent(d.terminalGrowth)}.`,
    [`ValuationModel ${d.name}`]));
  blocks.push(block('CALCULATION',
    `Revenue growth is assumed at ${d.revenueGrowth.map((g) => formatPercent(g, 1)).join(', ')} and EBITDA margin at ${d.ebitdaMargin.map((m) => formatPercent(m, 1)).join(', ')}.`,
    [`ValuationModel ${d.name}`]));
  if (isNum(d.fairValuePerShare)) {
    blocks.push(block('CALCULATION',
      `That produces a fair value of ${fmtMoney(d.fairValuePerShare, c)} per share against a market price of ${fmtMoney(c.price, c)}, ${formatPercent(d.upside, 1, { signed: true })}.`,
      [`ValuationModel ${d.name}`, 'Security.lastPrice']));
  }
  if (isNum(d.terminalValuePctOfEv)) {
    blocks.push(block('INTERPRETATION',
      `${formatPercent(d.terminalValuePctOfEv, 0)} of enterprise value comes from the terminal value. ${(d.terminalValuePctOfEv as number) > 0.75 ? 'That concentration means the sensitivity table matters more than the explicit forecast.' : 'The explicit forecast carries a meaningful share of the value.'}`,
      []));
  }
  for (const w of d.warnings) blocks.push(block('INTERPRETATION', w, ['DCF engine']));
  blocks.push(block('OPINION',
    'Every output above is a function of the assumptions. The reverse DCF is the more honest framing of the debate: it states what the market is already paying for rather than what the model believes.',
    []));

  return {
    intent: 'DCF', headline: `${c.ticker} — discounted cash flow`, blocks,
    followUps: [`What does the ${c.ticker} price already imply?`, `What would ${c.ticker} be worth on the peer median multiple?`],
    provider: 'deterministic', contextSummary: `${c.ticker} DCF`,
  };
}

function answerReverseDcf(c: CompanyContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  if (!c.reverseDcf) {
    blocks.push(block('MISSING', `A reverse DCF needs a base model. None exists for ${c.ticker} in this workspace.`, []));
    return { intent: 'REVERSE_DCF', headline: `${c.ticker} — reverse DCF`, blocks, followUps: [], provider: 'deterministic', contextSummary: c.ticker };
  }
  const r = c.reverseDcf;
  blocks.push(block('FACT', `The current price is ${fmtMoney(c.price, c)}.`, ['Security.lastPrice']));
  const lines: string[] = [];
  if (isNum(r.impliedRevenueCagr)) lines.push(`a revenue CAGR of ${formatPercent(r.impliedRevenueCagr)}`);
  if (isNum(r.impliedEbitdaMargin)) lines.push(`an EBITDA margin of ${formatPercent(r.impliedEbitdaMargin)}`);
  if (isNum(r.impliedTerminalGrowth)) lines.push(`terminal growth of ${formatPercent(r.impliedTerminalGrowth)}`);
  if (isNum(r.impliedExitMultiple)) lines.push(`an exit multiple of ${formatMultiple(r.impliedExitMultiple)}`);
  if (lines.length) {
    blocks.push(block('CALCULATION',
      `Solving the model back from that price, holding every other assumption constant, the market is paying for ${lines.join(', or alternatively ')}.`,
      ['Reverse DCF solver']));
  } else {
    blocks.push(block('MISSING', 'No assumption inside the searched range reproduces the current price — the price cannot be explained by changing one input alone.', []));
  }
  const hist3y = c.metrics.revenueCagr3y;
  if (isNum(r.impliedRevenueCagr) && isNum(hist3y)) {
    const gap = (r.impliedRevenueCagr as number) - (hist3y as number);
    blocks.push(block('INTERPRETATION',
      `That is ${formatBps(gap)} ${gap > 0 ? 'above' : 'below'} the ${formatPercent(hist3y)} the company actually compounded over the last three years.`,
      ['FinancialStatement history']));
  }
  blocks.push(block('OPINION',
    'The useful question is not whether the model is right, but whether the operating performance the price requires is achievable given the company competitive position.',
    []));
  return {
    intent: 'REVERSE_DCF', headline: `${c.ticker} — what the price implies`, blocks,
    followUps: [`Is ${c.ticker} cheap?`, `What is the biggest risk in the ${c.ticker} thesis?`],
    provider: 'deterministic', contextSummary: `${c.ticker} reverse DCF`,
  };
}

/* ------------------------------- Thesis -------------------------------- */

function answerThesis(c: CompanyContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  if (!c.thesis) {
    blocks.push(block('MISSING', `No investment thesis has been written for ${c.ticker} in this workspace.`, []));
    return { intent: 'THESIS', headline: `${c.ticker} — no thesis`, blocks, followUps: [`Open the ${c.ticker} thesis tab`], provider: 'deterministic', contextSummary: c.ticker };
  }
  const t = c.thesis;
  blocks.push(block('FACT',
    `The workspace holds a ${t.recommendation.replace('_', ' ').toLowerCase()} recommendation with ${t.conviction.replace('_', ' ').toLowerCase()} conviction, a target price of ${fmtMoney(t.targetPrice, c)}${isNum(t.upside) ? ` (${formatPercent(t.upside, 1, { signed: true })} against the current price)` : ''}, status ${t.status.replace('_', ' ').toLowerCase()}.`,
    ['InvestmentThesis']));
  blocks.push(block('FACT', t.coreThesis, ['InvestmentThesis.coreThesis']));

  if (t.assumptionChecks.length) {
    const breached = t.assumptionChecks.filter((a) => a.status === 'BREACHED');
    const holding = t.assumptionChecks.filter((a) => a.status === 'HOLDING');
    blocks.push(block('CALCULATION',
      `Of ${t.assumptionChecks.length} tracked assumptions, ${holding.length} are holding and ${breached.length} have been breached.` +
      (breached.length ? ` Breached: ${breached.map((b) => `${b.metricLabel} at ${b.currentFormatted} against ${b.targetFormatted}`).join('; ')}.` : ''),
      ['Thesis monitor']));
    blocks.push(block('INTERPRETATION',
      t.verdict === 'INTACT' ? 'The measurable core of the thesis is intact.'
        : t.verdict === 'WEAKENING' ? 'Part of the measurable core has broken. The thesis is not dead, but the case now rests on fewer supports than when it was written.'
        : t.verdict === 'BROKEN' ? 'Every measurable assumption has failed. This thesis needs to be rewritten or closed rather than defended.'
        : 'None of the assumptions can be evaluated with the data in the workspace.',
      []));
  }
  if (t.catalysts.length) {
    blocks.push(block('FACT',
      `Tracked catalysts: ${t.catalysts.slice(0, 4).map((x) => `${x.title}${x.expectedDate ? ` (${x.expectedDate})` : ''} — ${x.impact.toLowerCase()} impact, ${formatPercent(x.probability, 0)} probability`).join('; ')}.`,
      ['Catalyst timeline']));
  }
  return {
    intent: 'THESIS', headline: `${c.ticker} — investment thesis`, blocks,
    followUps: [`What is the biggest risk in the ${c.ticker} thesis?`, `Is ${c.ticker} cheap?`],
    provider: 'deterministic', contextSummary: `${c.ticker} thesis`,
  };
}

function answerThesisRisk(c: CompanyContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  if (!c.thesis || !c.thesis.risks.length) {
    blocks.push(block('MISSING', `No risks have been recorded against a ${c.ticker} thesis in this workspace.`, []));
  } else {
    const ranked = c.thesis.risks
      .slice()
      .sort((a, b) => severityRank(b.severity) * b.probability - severityRank(a.severity) * a.probability);
    const top = ranked[0];
    blocks.push(block('FACT',
      `The highest-ranked risk is "${top.title}" — ${top.category.toLowerCase()} category, ${top.severity.toLowerCase()} severity, ${formatPercent(top.probability, 0)} probability.`,
      ['RiskItem']));
    if (ranked.length > 1) {
      blocks.push(block('FACT',
        `Others tracked: ${ranked.slice(1, 4).map((r) => `${r.title} (${r.severity.toLowerCase()}, ${formatPercent(r.probability, 0)})`).join('; ')}.`,
        ['RiskItem']));
    }
    const breached = c.thesis.assumptionChecks.filter((a) => a.status === 'BREACHED');
    if (breached.length) {
      blocks.push(block('INTERPRETATION',
        `Separately from the recorded risk list, ${breached.length} tracked assumption${breached.length > 1 ? 's have' : ' has'} already been breached: ${breached.map((b) => b.metricLabel).join(', ')}. A breached assumption is a realised risk, not a potential one.`,
        ['Thesis monitor']));
    }
  }
  const m = c.metrics;
  if (isNum(m.netDebtToEbitda) && (m.netDebtToEbitda as number) > 3) {
    blocks.push(block('CALCULATION', `Leverage of ${formatMultiple(m.netDebtToEbitda, 2)} net debt/EBITDA is itself a risk to the equity in a downturn.`, [`FinancialStatement ${c.basisLabel}`]));
  }
  if (isNum(m.roicSpread) && (m.roicSpread as number) < 0) {
    blocks.push(block('CALCULATION', `Return on invested capital is ${formatBps(m.roicSpread)} below the cost of capital, so the business is currently consuming value as it grows.`, ['ROIC engine']));
  }
  return {
    intent: 'THESIS_RISK', headline: `${c.ticker} — risks`, blocks,
    followUps: [`What would have to happen for ${c.ticker} to reach the target price?`, `Is ${c.ticker} cheap?`],
    provider: 'deterministic', contextSummary: `${c.ticker} risks`,
  };
}

function severityRank(s: string): number {
  return s === 'HIGH' ? 3 : s === 'MEDIUM' ? 2 : 1;
}

/* ----------------------------- Target price ---------------------------- */

function answerTargetPrice(c: CompanyContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  const target = c.thesis?.targetPrice ?? c.dcf?.fairValuePerShare ?? null;
  if (!isNum(target) || !isNum(c.price)) {
    blocks.push(block('MISSING', `No target price is recorded for ${c.ticker}, and no model fair value is available to stand in for one.`, []));
    return { intent: 'TARGET_PRICE', headline: `${c.ticker} — target price`, blocks, followUps: [], provider: 'deterministic', contextSummary: c.ticker };
  }
  const upside = (target as number) / (c.price as number) - 1;
  blocks.push(block('FACT',
    `The target is ${fmtMoney(target, c)} against a market price of ${fmtMoney(c.price, c)}, ${formatPercent(upside, 1, { signed: true })}.`,
    [c.thesis ? 'InvestmentThesis.targetPrice' : 'ValuationModel']));

  const currentMultiple = c.bankLike ? c.metrics.pe : c.metrics.evEbitda;
  if (isNum(currentMultiple)) {
    const requiredMultiple = (currentMultiple as number) * (1 + upside);
    const hist = c.historicalMultiples.find((h) => h.metric === (c.bankLike ? 'pe' : 'evEbitda'));
    blocks.push(block('CALCULATION',
      `Holding earnings flat, reaching that target requires the ${c.bankLike ? 'P/E' : 'EV/EBITDA'} multiple to move from ${formatMultiple(currentMultiple)} to roughly ${formatMultiple(requiredMultiple)}.` +
      (hist && isNum(hist.median5y) ? ` The five-year median is ${formatMultiple(hist.median5y)}${(requiredMultiple <= (hist.median5y as number)) ? ', so the target is reachable through a re-rating back to the historical average alone.' : ', so a re-rating to the historical average is not enough on its own — earnings have to grow as well.'}` : ''),
      ['Historical multiple series']));
  }
  if (c.dcf) {
    blocks.push(block('CALCULATION',
      `Inside the DCF the same outcome can be reached by raising revenue growth or the EBITDA margin, or by lowering the WACC from ${formatPercent(c.dcf.wacc)}. The sensitivity grid on the valuation tab prices each of those paths.`,
      [`ValuationModel ${c.dcf.name}`]));
  }
  if (c.thesis?.catalysts.length) {
    blocks.push(block('FACT',
      `The catalysts the workspace expects to close that gap: ${c.thesis.catalysts.slice(0, 3).map((x) => x.title).join('; ')}.`,
      ['Catalyst timeline']));
  }
  blocks.push(block('OPINION',
    'A target price is an output of assumptions, not a forecast of the market. It is most useful as a statement of what has to be true, which is exactly what the assumptions above set out.',
    []));
  return {
    intent: 'TARGET_PRICE', headline: `${c.ticker} — path to target`, blocks,
    followUps: [`What is the biggest risk in the ${c.ticker} thesis?`, `What does the ${c.ticker} price already imply?`],
    provider: 'deterministic', contextSummary: `${c.ticker} target`,
  };
}

/* ------------------------------ Earnings ------------------------------- */

function answerEarnings(c: CompanyContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  if (!c.latestEarnings) {
    blocks.push(block('MISSING', `No quarterly result is recorded for ${c.ticker} in this workspace.`, []));
    return { intent: 'EARNINGS', headline: `${c.ticker} — earnings`, blocks, followUps: [], provider: 'deterministic', contextSummary: c.ticker };
  }
  const e = c.latestEarnings;
  blocks.push(block('FACT',
    `${e.label}, reported ${e.reportDate}: revenue ${fmtBig(e.revenue, c)}, EBITDA ${fmtBig(e.ebitda, c)}, EPS ${isNum(e.eps) ? fmtMoney(e.eps, c) : DASH}.`,
    ['EarningsEvent']));

  const variance = (actual: number | null, consensus: number | null, label: string) => {
    if (!isNum(actual) || !isNum(consensus) || consensus === 0) return null;
    const diff = (actual as number) / (consensus as number) - 1;
    return `${label} came in ${formatPercent(Math.abs(diff))} ${diff >= 0 ? 'above' : 'below'} the consensus recorded here`;
  };
  const variances = [
    variance(e.revenue, e.consensusRevenue, 'Revenue'),
    variance(e.ebitda, e.consensusEbitda, 'EBITDA'),
    variance(e.eps, e.consensusEps, 'EPS'),
  ].filter(Boolean);
  if (variances.length) {
    blocks.push(block('CALCULATION', `${variances.join('; ')}.`, ['EarningsEvent', 'MockConsensusProvider']));
  } else {
    blocks.push(block('MISSING', 'No consensus figures are stored for this period, so the print cannot be compared with expectations.', []));
  }

  if (c.priorEarnings) {
    const p = c.priorEarnings;
    const rev = isNum(e.revenue) && isNum(p.revenue) && (p.revenue as number) !== 0 ? (e.revenue as number) / (p.revenue as number) - 1 : null;
    const eb = isNum(e.ebitda) && isNum(p.ebitda) && (p.ebitda as number) !== 0 ? (e.ebitda as number) / (p.ebitda as number) - 1 : null;
    if (isNum(rev) || isNum(eb)) {
      blocks.push(block('CALCULATION',
        `Against ${p.label}: revenue ${isNum(rev) ? formatPercent(rev, 1, { signed: true }) : DASH}, EBITDA ${isNum(eb) ? formatPercent(eb, 1, { signed: true }) : DASH}.`,
        ['EarningsEvent history']));
    }
    const marginNow = isNum(e.revenue) && isNum(e.ebitda) && (e.revenue as number) !== 0 ? (e.ebitda as number) / (e.revenue as number) : null;
    const marginPrior = isNum(p.revenue) && isNum(p.ebitda) && (p.revenue as number) !== 0 ? (p.ebitda as number) / (p.revenue as number) : null;
    if (isNum(marginNow) && isNum(marginPrior)) {
      const delta = (marginNow as number) - (marginPrior as number);
      blocks.push(block('CALCULATION',
        `EBITDA margin moved ${formatBps(delta)} to ${formatPercent(marginNow)}.`,
        ['EarningsEvent history']));
      blocks.push(block('INTERPRETATION',
        Math.abs(delta) < 0.005
          ? 'The margin is effectively unchanged, so the print does not on its own change the operating picture.'
          : delta > 0
            ? 'Margin expansion is the kind of change that feeds directly into the valuation if it proves structural rather than seasonal.'
            : 'Margin compression of this size is worth splitting between price, mix and cost before treating it as structural.',
        []));
    }
  }
  if (e.guidance && Object.keys(e.guidance).length) {
    blocks.push(block('FACT',
      `Guidance recorded with the release: ${Object.entries(e.guidance).map(([k, v]) => `${k} — ${v}`).join('; ')}.`,
      ['EarningsEvent.guidance']));
  }
  if (c.thesis?.assumptionChecks.length) {
    const breached = c.thesis.assumptionChecks.filter((a) => a.status === 'BREACHED');
    blocks.push(block('INTERPRETATION',
      breached.length
        ? `Against the thesis, ${breached.length} assumption${breached.length > 1 ? 's are' : ' is'} now breached (${breached.map((b) => b.metricLabel).join(', ')}). The result weakens the case as written.`
        : 'Every tracked thesis assumption still holds after this print, so the case is unchanged.',
      ['Thesis monitor']));
  }
  return {
    intent: 'EARNINGS', headline: `${c.ticker} — ${e.label}`, blocks,
    followUps: [`Does this change the ${c.ticker} thesis?`, `Is ${c.ticker} cheap after the print?`],
    provider: 'deterministic', contextSummary: `${c.ticker} ${e.label}`,
  };
}

/* -------------------------- Capital allocation ------------------------- */

function answerCapitalAllocation(c: CompanyContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  const ca = c.capitalAllocation;
  if (!ca || !isNum(ca.cfo)) {
    blocks.push(block('MISSING', `The cash-flow statement needed to analyse capital allocation is not available for ${c.ticker}.`, []));
    return { intent: 'CAPITAL_ALLOCATION', headline: `${c.ticker} — capital allocation`, blocks, followUps: [], provider: 'deterministic', contextSummary: c.ticker };
  }
  const cfo = ca.cfo as number;
  const uses: { label: string; amount: number }[] = [];
  if (isNum(ca.capex)) uses.push({ label: 'capital expenditure', amount: Math.abs(ca.capex as number) });
  if (isNum(ca.acquisitions) && Math.abs(ca.acquisitions as number) > 0) uses.push({ label: 'acquisitions', amount: Math.abs(ca.acquisitions as number) });
  if (isNum(ca.dividends)) uses.push({ label: 'dividends', amount: Math.abs(ca.dividends as number) });
  if (isNum(ca.buybacks) && Math.abs(ca.buybacks as number) > 0) uses.push({ label: 'buybacks', amount: Math.abs(ca.buybacks as number) });

  blocks.push(block('FACT',
    `Cash from operations of ${fmtBig(cfo, c)} was deployed into ${uses.map((u) => `${u.label} ${fmtBig(u.amount, c)}`).join(', ')}.`,
    [`FinancialStatement ${c.basisLabel}`]));
  blocks.push(block('CALCULATION',
    `As a share of operating cash flow: ${uses.map((u) => `${u.label} ${formatPercent(u.amount / cfo, 0)}`).join(', ')}.`,
    [`FinancialStatement ${c.basisLabel}`]));

  const spread = c.metrics.roicSpread;
  const capexShare = isNum(ca.capex) ? Math.abs(ca.capex as number) / cfo : null;
  if (isNum(spread) && isNum(capexShare)) {
    blocks.push(block('INTERPRETATION',
      (spread as number) > 0
        ? `Return on invested capital is ${formatBps(spread)} above the cost of capital, so reinvesting ${formatPercent(capexShare, 0)} of operating cash flow adds value at the margin.`
        : `Return on invested capital is ${formatBps(spread)} below the cost of capital, so reinvesting ${formatPercent(capexShare, 0)} of operating cash flow is currently value-destructive; distributions or debt reduction would be the higher-return use.`,
      ['ROIC engine']));
  }
  blocks.push(block('OPINION',
    'Whether management is allocating capital well is a judgement about the return on the *next* unit of capital, which no historical statement can settle on its own. The ROIC spread above is the closest observable proxy.',
    []));
  return {
    intent: 'CAPITAL_ALLOCATION', headline: `${c.ticker} — capital allocation`, blocks,
    followUps: [`What is ${c.ticker} ROIC?`, `How leveraged is ${c.ticker}?`],
    provider: 'deterministic', contextSummary: `${c.ticker} capital allocation`,
  };
}

/* ----------------------------- What changed ---------------------------- */

function answerWhatChanged(c: CompanyContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  const changes: string[] = [];
  const m = c.metrics;
  if (isNum(m.revenueGrowth)) changes.push(`revenue ${formatPercent(m.revenueGrowth, 1, { signed: true })} year on year`);
  if (isNum(m.ebitdaGrowth)) changes.push(`EBITDA ${formatPercent(m.ebitdaGrowth, 1, { signed: true })}`);

  const marginSeries = c.history.filter((h) => isNum(h.ebitdaMargin));
  if (marginSeries.length >= 2) {
    const delta = (marginSeries[marginSeries.length - 1].ebitdaMargin as number) - (marginSeries[marginSeries.length - 2].ebitdaMargin as number);
    changes.push(`EBITDA margin ${formatBps(delta)}`);
  }
  const roicSeries = c.history.filter((h) => isNum(h.roic));
  if (roicSeries.length >= 2) {
    const delta = (roicSeries[roicSeries.length - 1].roic as number) - (roicSeries[roicSeries.length - 2].roic as number);
    changes.push(`ROIC ${formatBps(delta)}`);
  }
  const levSeries = c.history.filter((h) => isNum(h.netDebtToEbitda));
  if (levSeries.length >= 2) {
    const from = levSeries[levSeries.length - 2].netDebtToEbitda as number;
    const to = levSeries[levSeries.length - 1].netDebtToEbitda as number;
    changes.push(`net debt/EBITDA from ${formatMultiple(from, 2)} to ${formatMultiple(to, 2)}`);
  }

  if (changes.length) {
    blocks.push(block('CALCULATION', `Between the last two reported periods: ${changes.join(', ')}.`, ['FinancialStatement history']));
  } else {
    blocks.push(block('MISSING', 'There are not enough comparable periods in the workspace to say what changed.', []));
  }

  const marginRecent = marginSeries.slice(-3);
  if (marginRecent.length === 3) {
    const monotone = (marginRecent[2].ebitdaMargin as number) < (marginRecent[1].ebitdaMargin as number) && (marginRecent[1].ebitdaMargin as number) < (marginRecent[0].ebitdaMargin as number);
    blocks.push(block('INTERPRETATION',
      monotone
        ? 'The margin has fallen in each of the last three reported periods. A three-period run is more consistent with a structural change than with a one-off.'
        : 'The margin path is not monotonic across the last three periods, which is more consistent with a cyclical or mix effect than with a structural break.',
      []));
  }
  if (c.thesis?.assumptionChecks.length) {
    const breached = c.thesis.assumptionChecks.filter((a) => a.status === 'BREACHED');
    blocks.push(block('INTERPRETATION',
      breached.length
        ? `The change matters to the thesis: ${breached.map((b) => `${b.metricLabel} is at ${b.currentFormatted} against a threshold of ${b.targetFormatted}`).join('; ')}.`
        : 'None of the tracked thesis assumptions has been breached by these changes.',
      ['Thesis monitor']));
  }
  return {
    intent: 'WHAT_CHANGED', headline: `${c.ticker} — what changed`, blocks,
    followUps: [`Does this change the ${c.ticker} valuation?`, `What is the biggest risk in the ${c.ticker} thesis?`],
    provider: 'deterministic', contextSummary: `${c.ticker} change analysis`,
  };
}

/* ------------------------------ Overview ------------------------------- */

function answerOverview(c: CompanyContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  const m = c.metrics;
  blocks.push(block('FACT',
    `${c.name} (${c.ticker}) — ${c.industry}, ${c.country}. Market capitalisation ${fmtBig(c.marketCap, c)}, enterprise value ${fmtBig(c.enterpriseValue, c)}, priced at ${fmtMoney(c.price, c)}.`,
    ['Company record', 'Security.lastPrice']));
  const key: string[] = [];
  if (isNum(m.revenue)) key.push(`revenue ${fmtBig(m.revenue, c)}`);
  if (isNum(m.ebitdaMargin)) key.push(`EBITDA margin ${formatPercent(m.ebitdaMargin)}`);
  if (isNum(m.roic)) key.push(`ROIC ${formatPercent(m.roic)}`);
  else if (isNum(m.roe)) key.push(`ROE ${formatPercent(m.roe)}`);
  if (isNum(m.netDebtToEbitda)) key.push(`net debt/EBITDA ${formatMultiple(m.netDebtToEbitda, 2)}`);
  if (isNum(m.fcfYield)) key.push(`FCF yield ${formatPercent(m.fcfYield)}`);
  if (key.length) blocks.push(block('CALCULATION', `On ${c.basisLabel}: ${key.join(', ')}.`, [`FinancialStatement ${c.basisLabel}`]));

  if (c.thesis) {
    blocks.push(block('FACT',
      `Workspace view: ${c.thesis.recommendation.replace('_', ' ').toLowerCase()}, ${c.thesis.conviction.replace('_', ' ').toLowerCase()} conviction, target ${fmtMoney(c.thesis.targetPrice, c)}. Thesis monitor: ${c.thesis.verdict.replace('_', ' ').toLowerCase()}.`,
      ['InvestmentThesis', 'Thesis monitor']));
  } else {
    blocks.push(block('MISSING', 'No investment thesis has been written for this company in this workspace.', []));
  }
  if (c.portfolioPosition) {
    blocks.push(block('FACT',
      `Held in ${c.portfolioPosition.portfolioName} at ${formatPercent(c.portfolioPosition.weight)} of the book, ${formatPercent(c.portfolioPosition.unrealizedPnlPct, 1, { signed: true })} on cost.`,
      ['PortfolioPosition']));
  }
  if (c.dataQuality.missingFields.length) {
    blocks.push(block('MISSING', `The workspace is missing: ${c.dataQuality.missingFields.join(', ')}. Any measure depending on those fields is withheld rather than estimated.`, []));
  }
  return {
    intent: 'OVERVIEW', headline: `${c.ticker} — overview`, blocks,
    followUps: [`Is ${c.ticker} cheap?`, `What is ${c.ticker} ROIC?`, `Compare ${c.ticker} with its peers`],
    provider: 'deterministic', contextSummary: c.ticker,
  };
}

/* ------------------------------ Portfolio ------------------------------ */

function answerPortfolioReview(p: PortfolioContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  blocks.push(block('FACT',
    `${p.name} holds ${p.positionCount} positions with a total value of ${formatCompact(p.totalValue, { currency: p.baseCurrency as 'BRL' })} including ${formatCompact(p.cash, { currency: p.baseCurrency as 'BRL' })} of cash.`,
    ['Portfolio']));

  if (p.topContributors.length) {
    blocks.push(block('CALCULATION',
      `Largest contributors to return: ${p.topContributors.slice(0, 3).map((x) => `${x.ticker} ${formatPercent(x.contribution, 2, { signed: true })}`).join(', ')}.`,
      ['Attribution engine']));
  }
  if (p.topDetractors.length) {
    blocks.push(block('CALCULATION',
      `Largest detractors: ${p.topDetractors.slice(0, 3).map((x) => `${x.ticker} ${formatPercent(x.contribution, 2, { signed: true })}`).join(', ')}.`,
      ['Attribution engine']));
  }

  const destroyers = p.holdings.filter((h) => isNum(h.roicSpread) && (h.roicSpread as number) < 0);
  if (destroyers.length) {
    blocks.push(block('CALCULATION',
      `${destroyers.length} holding${destroyers.length > 1 ? 's earn' : ' earns'} a return on capital below the cost of capital: ${destroyers.map((h) => `${h.ticker} (${formatBps(h.roicSpread)})`).join(', ')}.`,
      ['ROIC engine']));
  } else {
    blocks.push(block('CALCULATION', 'Every holding for which ROIC can be computed earns above its cost of capital.', ['ROIC engine']));
  }

  const deteriorating = p.holdings.filter((h) => h.thesisVerdict === 'WEAKENING' || h.thesisVerdict === 'BROKEN');
  if (deteriorating.length) {
    blocks.push(block('INTERPRETATION',
      `Theses no longer fully supported by the data: ${deteriorating.map((h) => `${h.ticker} (${(h.thesisVerdict ?? '').toLowerCase()})`).join(', ')}. These are the positions to review first.`,
      ['Thesis monitor']));
  }

  const expensive = p.holdings
    .filter((h) => isNum(h.evEbitda))
    .sort((a, b) => (b.evEbitda as number) - (a.evEbitda as number))
    .slice(0, 3);
  if (expensive.length) {
    blocks.push(block('CALCULATION',
      `Most highly rated holdings on EV/EBITDA: ${expensive.map((h) => `${h.ticker} ${formatMultiple(h.evEbitda)}`).join(', ')}.`,
      ['Comparables module']));
  }
  const worstDownside = p.holdings
    .filter((h) => isNum(h.upsideToTarget))
    .sort((a, b) => (a.upsideToTarget as number) - (b.upsideToTarget as number))[0];
  if (worstDownside) {
    blocks.push(block('CALCULATION',
      `The position with the least upside to its own target price is ${worstDownside.ticker} at ${formatPercent(worstDownside.upsideToTarget, 1, { signed: true })}.`,
      ['InvestmentThesis.targetPrice']));
  }

  blocks.push(block('OPINION',
    'The review points to the positions where the recorded case and the observed data have diverged. Whether to act on that divergence is a portfolio-construction decision, not one the data settles.',
    []));

  return {
    intent: 'PORTFOLIO_REVIEW', headline: `${p.name} — review`, blocks,
    followUps: ['What is the risk profile of the portfolio?', 'Which holdings are most expensive?', 'Show the rebalancing plan'],
    provider: 'deterministic', contextSummary: p.name,
  };
}

function answerPortfolioRisk(p: PortfolioContext): AiAnswer {
  const blocks: AnswerBlock[] = [];
  const perf = p.performance;
  blocks.push(block('CALCULATION',
    `Annualised volatility ${formatPercent(perf.volatility)}, Sharpe ${isNum(perf.sharpe) ? (perf.sharpe as number).toFixed(2) : DASH}, maximum drawdown ${formatPercent(perf.maxDrawdown)}, one-day 95% VaR ${formatPercent(perf.var95)}.`,
    ['Risk engine']));
  blocks.push(block('CALCULATION',
    `Concentration: the top five positions are ${formatPercent(p.concentration.top5)} of the book, an effective number of positions of ${isNum(p.concentration.effectiveNumberOfPositions) ? (p.concentration.effectiveNumberOfPositions as number).toFixed(1) : DASH}.`,
    ['Concentration analysis']));
  const topExposure = p.exposures.slice(0, 3);
  if (topExposure.length) {
    blocks.push(block('CALCULATION',
      `Largest sector exposures: ${topExposure.map((e) => `${e.key} ${formatPercent(e.weight)}`).join(', ')}.`,
      ['Exposure analysis']));
  }
  const topRisk = p.riskContribution
    .filter((r) => isNum(r.contributionPct))
    .sort((a, b) => (b.contributionPct as number) - (a.contributionPct as number))
    .slice(0, 3);
  if (topRisk.length) {
    blocks.push(block('CALCULATION',
      `Largest contributors to portfolio volatility: ${topRisk.map((r) => `${r.key} ${formatPercent(r.contributionPct)}`).join(', ')}.`,
      ['Risk contribution engine']));
    blocks.push(block('INTERPRETATION',
      'Risk contribution and portfolio weight are not the same thing: a smaller position in a volatile, highly correlated name can carry more risk than a larger position in a defensive one.',
      []));
  }
  if (isNum(p.concentration.top5) && (p.concentration.top5 as number) > 0.5) {
    blocks.push(block('INTERPRETATION',
      `With ${formatPercent(p.concentration.top5)} in five names the book is concentrated. That is a deliberate choice in a conviction portfolio, but it means single-name research errors are not diversified away.`,
      []));
  }
  return {
    intent: 'PORTFOLIO_RISK', headline: `${p.name} — risk`, blocks,
    followUps: ['Which positions are destroying value?', 'Run the scenario analysis'],
    provider: 'deterministic', contextSummary: `${p.name} risk`,
  };
}

/* ------------------------------- Router -------------------------------- */

const COMPANY_INTENTS: Intent[] = [
  'VALUATION', 'ROIC', 'MARGINS', 'GROWTH', 'LEVERAGE', 'CASH_FLOW',
  'PEER_COMPARISON', 'DCF', 'REVERSE_DCF', 'TARGET_PRICE', 'THESIS',
  'THESIS_RISK', 'EARNINGS', 'WHAT_CHANGED', 'CAPITAL_ALLOCATION', 'OVERVIEW',
];

export function reason(question: string, context: AiContext): AiAnswer {
  const { intent } = detectIntent(question);

  if (intent === 'PORTFOLIO_REVIEW' || intent === 'PORTFOLIO_RISK') {
    if (!context.portfolio) {
      return {
        intent,
        headline: 'No portfolio in context',
        blocks: [block('MISSING', 'This workspace has no portfolio, so portfolio questions cannot be answered here.', [])],
        followUps: ['Create a portfolio'],
        provider: 'deterministic',
        contextSummary: question,
      };
    }
    return intent === 'PORTFOLIO_RISK'
      ? answerPortfolioRisk(context.portfolio)
      : answerPortfolioReview(context.portfolio);
  }

  if (COMPANY_INTENTS.includes(intent)) {
    if (!context.company) return missingCompany(question);
    const c = context.company;
    switch (intent) {
      case 'VALUATION': return answerValuation(c);
      case 'ROIC': return answerRoic(c);
      case 'MARGINS': return answerMargins(c);
      case 'GROWTH': return answerGrowth(c);
      case 'LEVERAGE': return answerLeverage(c);
      case 'CASH_FLOW': return answerCashFlow(c);
      case 'PEER_COMPARISON': return answerPeers(c);
      case 'DCF': return answerDcf(c);
      case 'REVERSE_DCF': return answerReverseDcf(c);
      case 'TARGET_PRICE': return answerTargetPrice(c);
      case 'THESIS': return answerThesis(c);
      case 'THESIS_RISK': return answerThesisRisk(c);
      case 'EARNINGS': return answerEarnings(c);
      case 'WHAT_CHANGED': return answerWhatChanged(c);
      case 'CAPITAL_ALLOCATION': return answerCapitalAllocation(c);
      default: return answerOverview(c);
    }
  }

  if (context.company) return answerOverview(context.company);
  if (context.portfolio) return answerPortfolioReview(context.portfolio);

  return {
    intent: 'OVERVIEW',
    headline: 'Nothing in context',
    blocks: [block('MISSING', 'No company or portfolio is in context. Open a company, or name a ticker in the question.', [])],
    followUps: ['Open VALE3', 'Review the portfolio'],
    provider: 'deterministic',
    contextSummary: question,
  };
}
