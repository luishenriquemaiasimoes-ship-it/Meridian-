import Anthropic from '@anthropic-ai/sdk';
import type { AiAnswer, AnswerBlock, BlockKind } from './types';
import type { AiContext } from './context';
import { reason } from './reasoner';

/**
 * The AI layer sits behind a provider interface.
 *
 * The deterministic reasoner is the default and the floor: it always runs, and
 * its answer is what the user sees when no language model is configured. When
 * an API key is present the language model is given exactly the same context
 * pack plus the deterministic answer, and is constrained to a schema whose
 * block types force it to say which statements are observed, which are
 * calculated, and which are opinion. It is never given the ability to invent a
 * figure, because it is never given anything except the pack.
 */
export interface AiProvider {
  readonly id: string;
  readonly label: string;
  readonly requiresKey: boolean;
  answer(question: string, context: AiContext, history: { role: 'user' | 'assistant'; content: string }[]): Promise<AiAnswer>;
}

export class DeterministicProvider implements AiProvider {
  readonly id = 'deterministic';
  readonly label = 'MERIDIAN reasoning engine';
  readonly requiresKey = false;

  async answer(question: string, context: AiContext): Promise<AiAnswer> {
    return reason(question, context);
  }
}

const BLOCK_KINDS: BlockKind[] = ['FACT', 'CALCULATION', 'INTERPRETATION', 'OPINION', 'MISSING'];

const ANSWER_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['headline', 'blocks', 'followUps'],
  properties: {
    headline: { type: 'string', description: 'Six words or fewer naming the subject of the answer.' },
    blocks: {
      type: 'array',
      minItems: 1,
      maxItems: 10,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['kind', 'text', 'sources'],
        properties: {
          kind: { type: 'string', enum: BLOCK_KINDS },
          text: { type: 'string' },
          sources: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    followUps: { type: 'array', maxItems: 4, items: { type: 'string' } },
  },
} as const;

const SYSTEM_PROMPT = `You are the research analyst inside MERIDIAN, an institutional equity research and asset management platform.

You are given a CONTEXT PACK: the complete set of figures the user's workspace holds about the subject of their question. It is the only information you may use.

Hard rules:
1. Never state a number that is not in the context pack. Do not estimate, interpolate, or recall figures from anywhere else.
2. If the pack does not contain what the question needs, emit a MISSING block saying exactly which datum is absent. "Data unavailable" is a complete and correct answer.
3. Never present market data, news, consensus or guidance as real-world fact. The pack marks whether the workspace is running on simulated data; if it is, say so when the answer depends on prices or consensus.
4. Classify every statement:
   FACT - reported in the pack.
   CALCULATION - arithmetic on pack figures. State the inputs.
   INTERPRETATION - a reading of those figures.
   OPINION - a judgement that depends on assumptions. Name the assumption it rests on.
   MISSING - the pack does not hold it.
5. Cite the pack fields each block draws on in "sources" (e.g. "FinancialStatement FY2025", "ValuationModel VALE3 DCF", "Thesis monitor").
6. Write the way a senior analyst writes to a portfolio manager: specific, quantified, no hedging filler, no marketing language, no emoji, no bullet-point padding.
7. A draft answer from the platform's deterministic engine is supplied. It is already correct. Improve its structure and directness; do not contradict its arithmetic. If you cannot improve it, return it.`;

export class AnthropicProvider implements AiProvider {
  readonly id = 'anthropic';
  readonly label = 'Claude';
  readonly requiresKey = true;

  private client: Anthropic;
  private model: string;
  private fallback = new DeterministicProvider();

  constructor(apiKey: string, model = process.env.MERIDIAN_AI_MODEL || 'claude-opus-5') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async answer(
    question: string,
    context: AiContext,
    history: { role: 'user' | 'assistant'; content: string }[] = [],
  ): Promise<AiAnswer> {
    const draft = reason(question, context);

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        thinking: { type: 'adaptive' },
        output_config: {
          effort: 'medium',
          format: { type: 'json_schema', schema: ANSWER_SCHEMA as unknown as Record<string, unknown> },
        },
        messages: [
          ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
          {
            role: 'user' as const,
            content: [
              '<context_pack>',
              JSON.stringify(context, null, 1),
              '</context_pack>',
              '',
              '<deterministic_draft>',
              JSON.stringify({ headline: draft.headline, blocks: draft.blocks }, null, 1),
              '</deterministic_draft>',
              '',
              `<question>${question}</question>`,
            ].join('\n'),
          },
        ],
      });

      if (response.stop_reason === 'refusal') return draft;

      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('');
      const parsed = JSON.parse(text) as { headline: string; blocks: AnswerBlock[]; followUps: string[] };

      const blocks = (parsed.blocks ?? [])
        .filter((b) => BLOCK_KINDS.includes(b.kind))
        .map((b) => ({ kind: b.kind, text: String(b.text), sources: Array.isArray(b.sources) ? b.sources.map(String) : [] }));
      if (!blocks.length) return draft;

      return {
        intent: draft.intent,
        headline: parsed.headline || draft.headline,
        blocks,
        followUps: Array.isArray(parsed.followUps) && parsed.followUps.length ? parsed.followUps.map(String) : draft.followUps,
        provider: 'claude',
        contextSummary: draft.contextSummary,
      };
    } catch {
      // A model failure must never cost the user their answer.
      return { ...draft, provider: 'deterministic (model unavailable)' };
    }
  }
}

let cached: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (cached) return cached;
  const key = process.env.ANTHROPIC_API_KEY;
  cached = key && key.trim().length > 10 ? new AnthropicProvider(key) : new DeterministicProvider();
  return cached;
}

export function aiProviderInfo(): { id: string; label: string; grounded: true; usingModel: boolean } {
  const p = getAiProvider();
  return { id: p.id, label: p.label, grounded: true, usingModel: p.id !== 'deterministic' };
}
