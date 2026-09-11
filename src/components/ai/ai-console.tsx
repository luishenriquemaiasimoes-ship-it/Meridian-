'use client';

import { useEffect, useRef, useState } from 'react';
import { Badge, Button, cx, Panel, Spinner, Tooltip } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { AnswerBlockRow } from './answer-card';
import type { AiAnswer, AiContextScope } from '@/lib/ai/types';

interface Turn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  answer?: AiAnswer;
}

/**
 * The analyst console. It carries the page the user is on as context, so
 * "is it cheap?" on a company page is about that company.
 */
export function AiConsole({
  scope, suggestions, providerLabel, usingModel, height = '520px', conversationId: initialConversationId,
}: {
  scope: AiContextScope;
  suggestions: string[];
  providerLabel: string;
  usingModel: boolean;
  height?: string;
  conversationId?: string | null;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId ?? null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, loading]);

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    setInput('');
    setTurns((t) => [...t, { id: `u-${Date.now()}`, role: 'user', text: trimmed }]);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, scope, conversationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTurns((t) => [...t, {
          id: `a-${Date.now()}`, role: 'assistant', text: data.error ?? 'The request failed.',
          answer: {
            intent: 'ERROR', headline: 'Could not answer',
            blocks: [{ kind: 'MISSING', text: data.error ?? 'The request failed.', sources: [] }],
            followUps: [], provider: 'system', contextSummary: '',
          },
        }]);
        return;
      }
      setConversationId(data.conversationId);
      setTurns((t) => [...t, { id: `a-${Date.now()}`, role: 'assistant', text: data.answer.headline, answer: data.answer }]);
    } catch {
      setTurns((t) => [...t, {
        id: `a-${Date.now()}`, role: 'assistant', text: 'The server did not respond.',
        answer: {
          intent: 'ERROR', headline: 'No response',
          blocks: [{ kind: 'MISSING', text: 'The server did not respond. The answer could not be produced.', sources: [] }],
          followUps: [], provider: 'system', contextSummary: '',
        },
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel padded={false} className="flex flex-col overflow-hidden" >
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <div className="flex items-center gap-2">
          <Icon.Ai size={14} className="text-brass" />
          <span className="text-xs font-semibold text-ink">AI analyst</span>
          {scope.label ? <Badge tone="outline">{scope.label}</Badge> : null}
        </div>
        <Tooltip
          content={
            usingModel
              ? 'A language model is configured. It receives only this workspace’s data and is constrained to label every statement.'
              : 'No external model is configured. Answers come from the built-in reasoning engine, which derives every statement from workspace data.'
          }
        >
          <Badge tone={usingModel ? 'accent' : 'neutral'}>{providerLabel}</Badge>
        </Tooltip>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3" style={{ height }}>
        {turns.length === 0 ? (
          <div className="py-4">
            <p className="text-xs leading-relaxed text-ink-3">
              Ask about what this workspace holds. Every answer labels each statement as observed, calculated,
              an interpretation or an opinion — and says so plainly when a figure is not available.
            </p>
            <div className="mt-3 space-y-1.5">
              {suggestions.map((s) => (
                <button
                  key={s} type="button" onClick={() => ask(s)}
                  className="flex w-full items-center gap-2 rounded border border-line px-2.5 py-1.5 text-left text-xs text-ink-2 transition hover:border-line-strong hover:bg-raised"
                >
                  <Icon.ArrowRight size={11} className="shrink-0 text-ink-4" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {turns.map((t) =>
            t.role === 'user' ? (
              <div key={t.id} className="flex justify-end">
                <div className="max-w-[85%] rounded border border-accent/30 bg-accent/[0.08] px-2.5 py-1.5 text-xs text-ink">
                  {t.text}
                </div>
              </div>
            ) : (
              <div key={t.id} className="rounded border border-line bg-raised p-2.5">
                {t.answer ? (
                  <>
                    <p className="mb-2 text-xs font-semibold text-ink">{t.answer.headline}</p>
                    <div className="space-y-2">
                      {t.answer.blocks.map((b, i) => <AnswerBlockRow key={i} block={b} />)}
                    </div>
                    {t.answer.followUps.length ? (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-line pt-2">
                        {t.answer.followUps.map((f) => (
                          <button
                            key={f} type="button" onClick={() => ask(f)}
                            className="rounded border border-line px-2 py-0.5 text-2xs text-ink-3 transition hover:border-accent hover:text-ink"
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="text-xs text-ink-2">{t.text}</p>
                )}
              </div>
            ),
          )}
          {loading ? (
            <div className="flex items-center gap-2 rounded border border-line bg-raised px-2.5 py-2 text-xs text-ink-3">
              <Spinner size={12} /> Reading the workspace…
            </div>
          ) : null}
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); ask(input); }}
        className="flex items-end gap-2 border-t border-line p-2.5"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input); }
          }}
          rows={2}
          placeholder="Ask about valuation, returns, the thesis, the portfolio…"
          className={cx(
            'min-h-[38px] w-full resize-none rounded border border-line bg-panel px-2.5 py-1.5',
            'text-base text-ink placeholder:text-ink-4 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25',
          )}
        />
        <Button type="submit" variant="primary" size="md" disabled={!input.trim() || loading}>
          <Icon.ArrowRight size={14} />
        </Button>
      </form>
    </Panel>
  );
}
