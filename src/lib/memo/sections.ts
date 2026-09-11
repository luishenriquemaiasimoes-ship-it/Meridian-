export interface MemoSection { key: string; title: string; body: string }

/**
 * The twelve-section skeleton every memo starts from. The titles are fixed and
 * ordered so that two memos on different names can be read side by side, and so
 * a reader always knows where to find the valuation or the risks.
 */
export const MEMO_SECTIONS: { key: string; title: string; prompt: string }[] = [
  { key: 'executive-summary', title: '1. Executive summary', prompt: 'The recommendation, the target price, the position size being asked for, and the expected value across the cases.' },
  { key: 'investment-thesis', title: '2. Investment thesis', prompt: 'The propositions the investment depends on, each one measurable.' },
  { key: 'business-overview', title: '3. Business overview', prompt: 'What the company sells, to whom, and how the money is made.' },
  { key: 'industry', title: '4. Industry', prompt: 'Structure, growth, and where this company sits inside it.' },
  { key: 'financial-analysis', title: '5. Financial analysis', prompt: 'Growth, margins, returns on capital, working capital, leverage.' },
  { key: 'competitive-position', title: '6. Competitive position', prompt: 'The source of durable advantage and the evidence for it in the numbers.' },
  { key: 'valuation', title: '7. Valuation', prompt: 'DCF, comparables, historical range, and what the current price already assumes.' },
  { key: 'catalysts', title: '8. Catalysts', prompt: 'Dated events, expected impact, probability.' },
  { key: 'risks', title: '9. Risks', prompt: 'Ranked by severity and probability, each with a response.' },
  { key: 'scenarios', title: '10. Bull / base / bear', prompt: 'Three sets of assumptions, three fair values, and the weighting.' },
  { key: 'portfolio-role', title: '11. Portfolio role', prompt: 'How this interacts with what is already owned.' },
  { key: 'conclusion', title: '12. Conclusion', prompt: 'The decision requested and the conditions that would end the thesis.' },
];

export function blankMemoSections(): MemoSection[] {
  return MEMO_SECTIONS.map((s) => ({ key: s.key, title: s.title, body: '' }));
}
