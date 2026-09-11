'use client';

import { Badge, cx, Panel, Tooltip } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { BLOCK_DESCRIPTIONS, BLOCK_LABELS, type AiAnswer, type AnswerBlock, type BlockKind } from '@/lib/ai/types';

const TONE: Record<BlockKind, 'neutral' | 'accent' | 'brass' | 'outline' | 'warn'> = {
  FACT: 'neutral',
  CALCULATION: 'accent',
  INTERPRETATION: 'brass',
  OPINION: 'outline',
  MISSING: 'warn',
};

const ICON: Record<BlockKind, React.ReactNode> = {
  FACT: <Icon.Database size={11} />,
  CALCULATION: <Icon.Valuation size={11} />,
  INTERPRETATION: <Icon.Sparkle size={11} />,
  OPINION: <Icon.Flag size={11} />,
  MISSING: <Icon.Warning size={11} />,
};

/**
 * Renders one answer. The block type is not decoration: it tells the reader
 * whether a sentence is something the workspace observed, something the engine
 * computed, an inference, or a judgement — and where to verify it.
 */
export function AnswerCard({ answer, compact = false }: { answer: AiAnswer; compact?: boolean }) {
  return (
    <Panel className={compact ? '!p-3' : undefined}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className={cx('font-semibold text-ink', compact ? 'text-sm' : 'text-md')}>{answer.headline}</h3>
        <span className="text-2xs text-ink-4">{answer.provider}</span>
      </div>

      <div className="space-y-2.5">
        {answer.blocks.map((block, i) => (
          <AnswerBlockRow key={i} block={block} />
        ))}
      </div>

      {answer.followUps.length ? (
        <div className="mt-3 border-t border-line pt-2.5">
          <p className="label mb-1.5">Next questions</p>
          <div className="flex flex-wrap gap-1.5">
            {answer.followUps.map((f) => (
              <span key={f} className="rounded border border-line px-2 py-0.5 text-2xs text-ink-3">{f}</span>
            ))}
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

export function AnswerBlockRow({ block }: { block: AnswerBlock }) {
  return (
    <div className="flex gap-2.5">
      <Tooltip content={BLOCK_DESCRIPTIONS[block.kind]} side="right">
        <Badge tone={TONE[block.kind]} className="mt-0.5 shrink-0 cursor-help">
          <span className="mr-0.5">{ICON[block.kind]}</span>
          {BLOCK_LABELS[block.kind]}
        </Badge>
      </Tooltip>
      <div className="min-w-0 flex-1">
        <p className={cx('text-base leading-relaxed', block.kind === 'MISSING' ? 'text-ink-3' : 'text-ink-2')}>
          {block.text}
        </p>
        {block.sources.length ? (
          <p className="mt-1 text-2xs text-ink-4">
            {block.sources.join(' · ')}
          </p>
        ) : null}
      </div>
    </div>
  );
}
