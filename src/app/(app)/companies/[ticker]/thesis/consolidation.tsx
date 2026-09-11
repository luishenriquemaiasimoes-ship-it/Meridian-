'use client';

import Link from 'next/link';
import { Badge, InlineNote, Panel, PanelHeader, Tooltip, cx } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { Num } from '@/components/ui/values';
import { DASH, formatPercent } from '@/lib/finance/format';
import { isNum } from '@/lib/finance/core';
import type { Currency } from '@/lib/finance/types';
import type { OpenItem, ThesisConsolidation } from '@/server/services/thesisConsolidation';

/* ==================================================================
   The case, pulled together from the work that produced it.

   Nothing on this panel is typed twice. The scenarios are the model's,
   the multiples the comparables', the points the deck's, and the open
   items the questions nobody has closed — each linking back to where
   it is actually maintained.
   ================================================================== */

const WEIGHT_TONE = { CORE: 'accent', SUPPORTING: 'neutral', OPTIONAL: 'outline' } as const;

const KIND_META: Record<OpenItem['kind'], { label: string; tone: 'warn' | 'neg' | 'neutral'; icon: keyof typeof Icon }> = {
  QUESTION: { label: 'Question', tone: 'warn', icon: 'Vote' },
  RISK: { label: 'Thesis', tone: 'warn', icon: 'Target' },
  STRESS: { label: 'Stress test', tone: 'warn', icon: 'Risk' },
  PREMISE: { label: 'Premise', tone: 'neg', icon: 'Valuation' },
  SOURCE: { label: 'Source', tone: 'neg', icon: 'Database' },
};

const VERDICT_TONE = { SURVIVES: 'pos', WEAKENED: 'warn', BROKEN: 'neg', UNTESTED: 'neutral' } as const;

export function ConsolidationPanel({
  data, currency,
}: { data: ThesisConsolidation; currency: Currency }) {
  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="The case, consolidated"
          subtitle="Assembled from the model, the comparables, the deck and the questions still open. Each line links to where it is maintained."
          actions={
            data.openItems.length
              ? <Badge tone="warn">{data.openItems.length} open</Badge>
              : <Badge tone="pos">nothing outstanding</Badge>
          }
        />

        <div className="grid gap-px border-y border-line bg-line sm:grid-cols-4">
          <Stat label="Price" value={data.currentPrice} currency={currency} />
          <Stat label="Probability-weighted value" value={data.expectedValue} currency={currency} strong />
          <div className="bg-panel px-3 py-2">
            <span className="label">Expected upside</span>
            <span className={cx(
              'block num text-lg font-semibold',
              !isNum(data.expectedUpside) ? 'text-ink-4' : (data.expectedUpside as number) >= 0 ? 'text-pos' : 'text-neg',
            )}>
              {isNum(data.expectedUpside) ? formatPercent(data.expectedUpside, 1) : DASH}
            </span>
          </div>
          <div className="bg-panel px-3 py-2">
            <span className="label">Core points</span>
            <span className="block num text-lg font-semibold text-ink">
              {data.points.filter((p) => p.weight === 'CORE').length}
              <span className="ml-1 text-2xs font-normal text-ink-4">of {data.points.length}</span>
            </span>
          </div>
        </div>

        {data.gaps.length ? (
          <div className="space-y-1.5 p-3">
            {data.gaps.map((g) => <InlineNote key={g} tone="warn">{g}</InlineNote>)}
          </div>
        ) : null}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ------------------------------ cases ------------------------------ */}
        <Panel>
          <PanelHeader
            title="What each case is worth"
            subtitle="From the model's own scenario set."
            actions={<Link href={`/companies/${data.ticker}/valuation`} className="text-2xs text-accent hover:underline focus-ring rounded">Open the model</Link>}
          />
          {data.scenarios.length ? (
            <div className="divide-y divide-line">
              {data.scenarios.map((s) => (
                <div key={s.key} className="px-3 py-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="flex items-baseline gap-2">
                      <Badge tone={s.key === 'BULL' ? 'pos' : s.key === 'BEAR' ? 'neg' : 'neutral'}>{s.label}</Badge>
                      <span className="num text-2xs text-ink-4">{formatPercent(s.probability, 0)}</span>
                    </span>
                    <span className="flex items-baseline gap-2">
                      <Num value={s.fairValue} format="currency" currency={currency} decimals={2} className="font-medium" />
                      <Num value={s.upside} format="percentSigned" className="text-2xs" />
                    </span>
                  </div>
                  {s.drivers.length ? (
                    <p className="mt-0.5 text-2xs text-ink-4">{s.drivers.join(' · ')}</p>
                  ) : (
                    <p className="mt-0.5 text-2xs text-ink-4">The base premises, unchanged.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="p-3 text-2xs text-ink-3">Data unavailable: no model to derive cases from.</p>
          )}
        </Panel>

        {/* ---------------------------- multiples ---------------------------- */}
        <Panel>
          <PanelHeader
            title="Where it trades against its peers"
            subtitle="From the comparables screen."
            actions={<Link href={`/companies/${data.ticker}/comps`} className="text-2xs text-accent hover:underline focus-ring rounded">Open the comps</Link>}
          />
          {data.multiples.length ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-line text-2xs text-ink-4">
                  <th className="px-3 py-1.5 text-left font-medium">Multiple</th>
                  <th className="px-2 py-1.5 text-right font-medium">{data.ticker}</th>
                  <th className="px-2 py-1.5 text-right font-medium">Peer median</th>
                  <th className="px-3 py-1.5 text-right font-medium">Percentile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.multiples.map((m) => (
                  <tr key={m.key}>
                    <td className="px-3 py-1.5 text-ink-2">{m.label}</td>
                    <td className="px-2 py-1.5 text-right"><Num value={m.company} format={m.format} /></td>
                    <td className="px-2 py-1.5 text-right text-ink-3"><Num value={m.peerMedian} format={m.format} muted /></td>
                    <td className="px-3 py-1.5 text-right">
                      {isNum(m.percentile) ? (
                        <Tooltip content="Percentile within the peer set.">
                          <span className="num cursor-help text-2xs text-ink-4">{formatPercent(m.percentile, 0)}</span>
                        </Tooltip>
                      ) : <span className="text-2xs text-ink-4">{DASH}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-3 text-2xs text-ink-3">Data unavailable: no peer set for this company.</p>
          )}
        </Panel>
      </div>

      {/* ------------------------------ the points ------------------------------ */}
      {data.points.length || data.topRisks.length || data.stressTests.length ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Panel>
            <PanelHeader
              title="What the case rests on"
              subtitle="From the qualitative deck, core points first."
              actions={<Link href={`/companies/${data.ticker}/deck`} className="text-2xs text-accent hover:underline focus-ring rounded">Open the deck</Link>}
            />
            {data.points.length ? (
              <div className="divide-y divide-line">
                {data.points.map((p) => (
                  <div key={p.id} className="px-3 py-2">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <Badge tone={WEIGHT_TONE[p.weight]}>{p.weight.toLowerCase()}</Badge>
                      <span className="text-xs font-medium text-ink">{p.title || 'Untitled'}</span>
                      <span className="text-2xs text-ink-4">{p.conviction.toLowerCase().replace('_', ' ')} conviction</span>
                    </div>
                    {p.breaks.length ? (
                      <p className="mt-0.5 text-2xs leading-relaxed text-ink-3">
                        <span className="text-ink-4">Breaks if: </span>{p.breaks.join('; ')}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-2xs text-warn">Nothing written that would disprove it.</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="p-3 text-2xs text-ink-3">No deck written. The case rests on the model alone.</p>
            )}
          </Panel>

          <div className="space-y-4">
            {data.topRisks.length ? (
              <Panel>
                <PanelHeader title="Risks to manage" dense subtitle="Likely and damaging, from the deck's grid." />
                <div className="divide-y divide-line">
                  {data.topRisks.map((r) => (
                    <div key={r.id} className="flex items-baseline justify-between gap-2 px-3 py-1.5">
                      <span className="min-w-0 truncate text-2xs text-ink-2">{r.title}</span>
                      <span className="num shrink-0 text-2xs text-ink-4">
                        {formatPercent(r.probability, 0)} × {formatPercent(r.impact, 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            ) : null}

            {data.stressTests.length ? (
              <Panel>
                <PanelHeader title="Stress tests" dense />
                <div className="divide-y divide-line">
                  {data.stressTests.map((t) => (
                    <div key={t.id} className="flex items-baseline justify-between gap-2 px-3 py-1.5">
                      <span className="min-w-0 truncate text-2xs text-ink-2">{t.title}</span>
                      <Badge tone={VERDICT_TONE[t.verdict]}>{t.verdict.toLowerCase()}</Badge>
                    </div>
                  ))}
                </div>
              </Panel>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ------------------------------ open items ------------------------------ */}
      <Panel>
        <PanelHeader
          title="Open before this goes to committee"
          subtitle="Questions without answers, tests without verdicts, premises that have drifted, figures without a source."
        />
        {data.openItems.length ? (
          <div className="divide-y divide-line">
            {data.openItems.map((item) => {
              const meta = KIND_META[item.kind];
              const IconComponent = Icon[meta.icon];
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-start gap-2.5 px-3 py-2 transition hover:bg-sunken/50 focus-ring"
                >
                  <span className="mt-0.5 shrink-0 text-ink-4"><IconComponent size={12} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium text-ink">{item.title}</span>
                    <span className="block text-2xs leading-relaxed text-ink-3">{item.detail}</span>
                  </span>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="p-3 text-xs text-ink-2">
            Nothing outstanding. Every committee question has a reviewed answer, every stress test has a verdict,
            no premise has drifted, and every load-bearing figure traces to a source.
          </p>
        )}
      </Panel>
    </div>
  );
}

function Stat({
  label, value, currency, strong,
}: { label: string; value: number | null; currency: Currency; strong?: boolean }) {
  return (
    <div className="bg-panel px-3 py-2">
      <span className="label">{label}</span>
      <Num
        value={value} format="currency" currency={currency} decimals={2}
        className={cx('block text-lg', strong ? 'font-semibold' : 'font-medium')}
      />
    </div>
  );
}
