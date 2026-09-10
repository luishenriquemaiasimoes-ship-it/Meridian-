/**
 * MERIDIAN AI contract.
 *
 * Every answer is a list of typed blocks. The type is not decoration: it tells
 * the reader whether a statement is something the workspace observed, something
 * the engine computed, an inference, or an opinion. A number that is not in the
 * workspace is reported as MISSING — the layer has no other way to express it.
 */

export type BlockKind = 'FACT' | 'CALCULATION' | 'INTERPRETATION' | 'OPINION' | 'MISSING';

export const BLOCK_LABELS: Record<BlockKind, string> = {
  FACT: 'Observed',
  CALCULATION: 'Calculated',
  INTERPRETATION: 'Interpretation',
  OPINION: 'Opinion',
  MISSING: 'Data unavailable',
};

export const BLOCK_DESCRIPTIONS: Record<BlockKind, string> = {
  FACT: 'Reported in the workspace dataset.',
  CALCULATION: 'Derived by the financial engine from reported figures.',
  INTERPRETATION: 'A reading of the figures above, not a figure itself.',
  OPINION: 'A judgement. It depends on assumptions that can be changed.',
  MISSING: 'The workspace does not hold this datum.',
};

export interface AnswerBlock {
  kind: BlockKind;
  text: string;
  /** Where each statement can be verified inside the product. */
  sources: string[];
}

export interface AiAnswer {
  intent: string;
  headline: string;
  blocks: AnswerBlock[];
  followUps: string[];
  provider: string;
  contextSummary: string;
}

export interface AiContextScope {
  type: 'COMPANY' | 'PORTFOLIO' | 'DCF' | 'SCREEN' | 'GLOBAL';
  id?: string | null;
  label?: string | null;
}
