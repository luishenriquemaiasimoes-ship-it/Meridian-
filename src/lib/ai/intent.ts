export type Intent =
  | 'VALUATION'
  | 'ROIC'
  | 'MARGINS'
  | 'GROWTH'
  | 'LEVERAGE'
  | 'CASH_FLOW'
  | 'PEER_COMPARISON'
  | 'DCF'
  | 'REVERSE_DCF'
  | 'TARGET_PRICE'
  | 'THESIS'
  | 'THESIS_RISK'
  | 'EARNINGS'
  | 'PORTFOLIO_REVIEW'
  | 'PORTFOLIO_RISK'
  | 'WHAT_CHANGED'
  | 'CAPITAL_ALLOCATION'
  | 'OVERVIEW';

interface Rule { intent: Intent; patterns: RegExp[]; weight: number }

/**
 * Bilingual intent matching (Portuguese and English) — the product is used by
 * Brazilian desks that switch between the two mid-sentence.
 */
const RULES: Rule[] = [
  { intent: 'VALUATION', weight: 3, patterns: [/\bbarat[oa]\b/i, /\bcar[oa]\b/i, /valuation/i, /\bcheap\b/i, /\bexpensive\b/i, /m[úu]ltiplo/i, /multiple/i, /\bev\/ebitda\b/i, /\bp\/?e\b/i, /pre[çc]o justo/i, /fair value/i] },
  { intent: 'ROIC', weight: 4, patterns: [/\broic\b/i, /retorno sobre.*capital/i, /return on.*capital/i, /cria(ç|c)[ãa]o de valor/i, /value creation/i, /\bwacc\b/i, /custo de capital/i, /cost of capital/i] },
  { intent: 'MARGINS', weight: 3, patterns: [/margem/i, /margin/i, /rentabilidade operacional/i] },
  { intent: 'GROWTH', weight: 3, patterns: [/crescimento/i, /growth/i, /\bcagr\b/i, /receita cresce/i] },
  { intent: 'LEVERAGE', weight: 3, patterns: [/alavancagem/i, /leverage/i, /d[íi]vida/i, /\bdebt\b/i, /endivida/i] },
  { intent: 'CASH_FLOW', weight: 3, patterns: [/fluxo de caixa/i, /cash flow/i, /\bfcf\b/i, /gera[çc][ãa]o de caixa/i, /\bcapex\b/i] },
  { intent: 'PEER_COMPARISON', weight: 5, patterns: [/compar(e|ar|a[çc][ãa]o)/i, /\bcompare\b/i, /\bpeers?\b/i, /\bvs\b/i, /concorrent/i, /competitors?/i] },
  { intent: 'REVERSE_DCF', weight: 6, patterns: [/reverse dcf/i, /dcf reverso/i, /impl[íi]cit/i, /implied/i, /o que o pre[çc]o.*(implica|embute)/i, /what does the (current )?price/i, /precifica/i, /priced in/i] },
  { intent: 'DCF', weight: 5, patterns: [/\bdcf\b/i, /fluxo de caixa descontado/i, /discounted cash flow/i, /monte um modelo/i, /build a model/i] },
  { intent: 'TARGET_PRICE', weight: 5, patterns: [/target price/i, /pre[çc]o[- ]alvo/i, /atingir.*(alvo|target)/i, /reach.*target/i, /upside/i] },
  // Naming the book beats naming a risk: "o risco da carteira" is a question
  // about the portfolio even though it contains the word risk.
  { intent: 'PORTFOLIO_RISK', weight: 7, patterns: [/risco[s]? d[ao] (carteira|fundo|livro|book)/i, /risks? in the (book|fund|portfolio)/i, /portfolio risk/i, /risco da carteira/i] },
  { intent: 'THESIS_RISK', weight: 6, patterns: [/maior risco/i, /biggest risk/i, /principais riscos/i, /main risks?/i, /risco.*(tese|thesis)/i, /risks? (to|in) the thesis/i] },
  // The bare word alone is weak evidence: it loses to anything more specific.
  { intent: 'THESIS_RISK', weight: 2, patterns: [/\brisco[s]?\b/i, /\brisks?\b/i] },
  { intent: 'THESIS', weight: 4, patterns: [/\btese\b/i, /\bthesis\b/i, /recomenda[çc][ãa]o/i, /recommendation/i, /convic[çc][ãa]o/i, /conviction/i] },
  { intent: 'EARNINGS', weight: 5, patterns: [/resultado/i, /earnings/i, /trimestre/i, /quarter/i, /\b\dq\d\d\b/i, /balan[çc]o/i, /consenso/i, /consensus/i] },
  { intent: 'PORTFOLIO_RISK', weight: 6, patterns: [/\bvar\b/i, /drawdown/i, /volatilidade da carteira/i, /concentra[çc][ãa]o/i, /concentration/i, /\bbeta da carteira\b/i, /tracking error/i] },
  { intent: 'PORTFOLIO_REVIEW', weight: 5, patterns: [/carteira/i, /portf[óo]lio/i, /posi[çc][õo]es/i, /positions/i, /contribu/i, /atribui[çc][ãa]o/i, /attribution/i, /holdings/i, /\bthe book\b/i, /\bo livro\b/i] },
  { intent: 'WHAT_CHANGED', weight: 5, patterns: [/o que mudou/i, /what changed/i, /por que.*(caiu|subiu|piorou|melhorou)/i, /why did.*(fall|drop|rise|improve)/i, /mudan[çc]a/i] },
  { intent: 'CAPITAL_ALLOCATION', weight: 5, patterns: [/aloca[çc][ãa]o de capital/i, /capital allocation/i, /dividendo/i, /dividend/i, /recompra/i, /buyback/i, /\bm&a\b/i] },
];

/**
 * Company intents that have a portfolio equivalent. Asked on a portfolio screen,
 * "what is the biggest risk" is a question about the book, not about a company
 * nobody named — so the scope decides which of the two the question meant.
 */
const PORTFOLIO_EQUIVALENT: Partial<Record<Intent, Intent>> = {
  THESIS_RISK: 'PORTFOLIO_RISK',
  LEVERAGE: 'PORTFOLIO_RISK',
  OVERVIEW: 'PORTFOLIO_REVIEW',
  THESIS: 'PORTFOLIO_REVIEW',
  VALUATION: 'PORTFOLIO_REVIEW',
  WHAT_CHANGED: 'PORTFOLIO_REVIEW',
};

export function detectIntent(
  question: string,
  scope?: { type?: string; id?: string | null },
): { intent: Intent; confidence: number } {
  // A rule scores its weight if any of its patterns matches, not the sum over
  // matches: two synonyms for the same idea are one piece of evidence, and
  // summing them would let a vague rule with many spellings beat a precise one.
  let best: Intent = 'OVERVIEW';
  let bestScore = 0;
  for (const rule of RULES) {
    if (!rule.patterns.some((p) => p.test(question))) continue;
    if (rule.weight > bestScore) { bestScore = rule.weight; best = rule.intent; }
  }

  // On a portfolio scope with no company named, read a company-shaped question
  // as the portfolio question it must have meant.
  if (scope?.type === 'PORTFOLIO' && !scope.id) {
    const redirected = PORTFOLIO_EQUIVALENT[best];
    if (redirected) best = redirected;
  }

  return { intent: best, confidence: Math.min(1, bestScore / 8) };
}

/** Pulls an explicit ticker out of the question, if the user named one. */
export function extractTicker(question: string, universe: string[]): string | null {
  const upper = question.toUpperCase();
  const found = universe
    .filter((t) => new RegExp(`\\b${t}\\b`).test(upper))
    .sort((a, b) => b.length - a.length);
  return found[0] ?? null;
}
