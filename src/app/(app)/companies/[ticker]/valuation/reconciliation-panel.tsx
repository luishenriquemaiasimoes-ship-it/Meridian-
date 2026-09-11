'use client';

import { useEffect, useState } from 'react';
import {
  Badge, Button, cx, InlineNote, Panel, PanelHeader, Textarea, Tooltip, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { Num, StatRow } from '@/components/ui/values';
import { DASH, formatDate, formatMetric, formatPercent } from '@/lib/finance/format';
import { isNum } from '@/lib/finance/core';
import type { ModelReconciliation } from '@/server/services/reconciliation';
import type { DcfAssumptions } from '@/lib/finance/dcf';
import type { Currency } from '@/lib/finance/types';

const STATUS_TONE: Record<string, 'pos' | 'warn' | 'neg' | 'neutral'> = {
  ON_TRACK: 'pos', ABOVE: 'warn', BELOW: 'warn', UNAVAILABLE: 'neutral',
  VERIFIED: 'pos', ASSERTED: 'neutral', SIMULATED: 'warn', STALE: 'warn', UNVERIFIED: 'neg',
};

/**
 * Everything that checks this model against something outside it: the
 * contributed range, the other terminal method, what the company actually
 * reported, and whether each input traces to a source.
 */
export function ReconciliationPanel(props: {
  ticker: string;
  modelId: string | null;
  currency: Currency;
  canEdit: boolean;
  /** The live assumptions, so an unsaved edit is checked too. */
  assumptions: DcfAssumptions;
}) {
  const toast = useToast();
  const [data, setData] = useState<ModelReconciliation | null>(null);
  const [loading, setLoading] = useState(true);
  const [rationale, setRationale] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    setLoading(true);
    const params = new URLSearchParams({
      ticker: props.ticker,
      assumptions: JSON.stringify(props.assumptions),
    });
    if (props.modelId) params.set('modelId', props.modelId);
    fetch(`/api/valuation/reconcile?${params}`)
      .then((r) => r.json())
      .then((d) => { if (live && !d.error) { setData(d); setRationale(d.consensusNote?.rationale ?? ''); } })
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [props.ticker, props.modelId, props.assumptions]);

  const saveNote = async () => {
    if (!props.modelId) return;
    setBusy(true);
    try {
      const res = await fetch('/api/valuation/reconcile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: props.modelId, rationale }),
      });
      const d = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Not recorded', description: d.error }); return; }
      toast.push({ tone: 'pos', title: 'Recorded', description: 'The reason travels with the model into the memo.' });
    } finally { setBusy(false); }
  };

  if (loading) {
    return <Panel className="p-6"><p className="text-xs text-ink-3">Checking the model against the record…</p></Panel>;
  }
  if (!data) return <InlineNote tone="warn">The reconciliation could not be loaded.</InlineNote>;

  const { consensus, terminal, premises, verification } = data;
  const cur = props.currency;

  return (
    <div className="space-y-4">
      {/* ------------------------------ Consensus ----------------------------- */}
      <Panel>
        <PanelHeader
          title="Against the sell-side range"
          subtitle={consensus.count ? `${consensus.count} contributed targets on record` : undefined}
          actions={
            consensus.position !== 'UNAVAILABLE' ? (
              <Badge tone={consensus.position === 'WITHIN' ? 'neutral' : 'warn'}>
                {consensus.position === 'WITHIN' ? 'inside the range' : consensus.position === 'ABOVE' ? 'above every target' : 'below every target'}
              </Badge>
            ) : null
          }
        />
        <div className="px-3 pb-3">
          {consensus.position === 'UNAVAILABLE' ? (
            <InlineNote tone="info">{consensus.summary}</InlineNote>
          ) : (
            <>
              <div className="grid gap-2 sm:grid-cols-4">
                <div className="panel px-3 py-2">
                  <div className="label">This model</div>
                  <Num value={consensus.targetPrice} format="currency" currency={cur} className="text-base font-semibold" />
                  <p className="mt-0.5 text-2xs text-ink-4">{formatPercent(consensus.modelUpside, 1)} upside</p>
                </div>
                <div className="panel px-3 py-2">
                  <div className="label">Contributed median</div>
                  <Num value={consensus.median} format="currency" currency={cur} className="text-base" />
                  <p className="mt-0.5 text-2xs text-ink-4">{formatPercent(consensus.consensusUpside, 1)} upside</p>
                </div>
                <div className="panel px-3 py-2">
                  <div className="label">Range</div>
                  <span className="num text-base text-ink">
                    {formatMetric(consensus.low, 'currency', { currency: cur })} – {formatMetric(consensus.high, 'currency', { currency: cur })}
                  </span>
                </div>
                <div className="panel px-3 py-2">
                  <div className="label">Against the median</div>
                  <Num value={consensus.vsMedian} format="percentSigned" className="text-base font-semibold" />
                </div>
              </div>

              {/* Where the model sits on the contributed range. */}
              <div className="mt-3">
                <div className="relative h-8">
                  <div className="absolute inset-x-0 top-3.5 h-[3px] rounded-full bg-sunken" />
                  {data.contributors.map((c) => {
                    const span = (consensus.high ?? 0) - (consensus.low ?? 0);
                    const pos = span === 0 ? 50 : (((c.targetPrice - (consensus.low as number)) / span) * 100);
                    return (
                      <Tooltip key={c.contributor} content={`${c.contributor} · ${formatMetric(c.targetPrice, 'currency', { currency: cur })} · ${c.recommendation ?? '—'} · ${formatDate(c.asOf)}`}>
                        <span
                          className="absolute top-2.5 h-2 w-2 -translate-x-1/2 rounded-full bg-ink-4"
                          style={{ left: `${Math.max(0, Math.min(100, pos))}%` }}
                        />
                      </Tooltip>
                    );
                  })}
                  {isNum(consensus.targetPrice) ? (
                    <Tooltip content={`This model · ${formatMetric(consensus.targetPrice, 'currency', { currency: cur })}`}>
                      <span
                        className="absolute top-0.5 h-6 w-[3px] -translate-x-1/2 rounded bg-accent"
                        style={{
                          left: `${Math.max(0, Math.min(100, (((consensus.targetPrice as number) - (consensus.low as number)) / Math.max(1e-9, (consensus.high as number) - (consensus.low as number))) * 100))}%`,
                        }}
                      />
                    </Tooltip>
                  ) : null}
                </div>
                <div className="flex justify-between text-2xs text-ink-4">
                  <span>{formatMetric(consensus.low, 'currency', { currency: cur })}</span>
                  <span>{formatMetric(consensus.high, 'currency', { currency: cur })}</span>
                </div>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-ink-2">{consensus.summary}</p>

              {consensus.needsRationale ? (
                <div className="mt-3 rounded border border-warn/30 bg-warn/[0.05] p-2.5">
                  <div className="label mb-1">Why the model differs</div>
                  <p className="mb-2 text-2xs leading-relaxed text-ink-3">
                    Not a requirement — a target away from the range is the point of doing the work. But the reason
                    belongs with the model, so it is there at committee rather than reconstructed.
                  </p>
                  <Textarea
                    rows={2}
                    value={rationale}
                    disabled={!props.canEdit}
                    onChange={(e) => setRationale(e.target.value)}
                    placeholder="Above the range because the model assumes the capex cycle rolls over in 2027 and the sell-side has it flat."
                  />
                  {props.canEdit && props.modelId ? (
                    <Button size="sm" className="mt-2" onClick={saveNote} loading={busy} disabled={rationale.trim().length < 10}>
                      Record the reason
                    </Button>
                  ) : null}
                </div>
              ) : null}

              {data.consensusNote ? (
                <p className="mt-2 text-2xs text-ink-4">
                  Recorded by {data.consensusNote.recordedBy} on {formatDate(data.consensusNote.recordedAt)}.
                </p>
              ) : null}
            </>
          )}
        </div>
      </Panel>

      {/* --------------------------- Terminal methods -------------------------- */}
      <Panel>
        <PanelHeader
          title="The two terminal methods against each other"
          subtitle="Whichever the model uses, the other is implied"
        />
        <div className="grid gap-4 px-3 pb-3 lg:grid-cols-[1fr_1fr]">
          <div className="divide-y divide-line">
            <StatRow label="Gordon growth value" value={<Num value={terminal.gordonValue} format="currencyMillions" currency={cur} />} />
            <StatRow label="Exit multiple value" value={<Num value={terminal.exitMultipleValue} format="currencyMillions" currency={cur} />} />
            <StatRow
              label="Gap between them"
              hint="As a share of the larger of the two."
              value={<Num value={terminal.divergence} format="percent" />}
            />
            <StatRow
              label="Multiple the perpetuity implies"
              value={<Num value={terminal.impliedMultipleFromGordon} format="multiple" />}
            />
            <StatRow
              label="Growth the exit multiple implies"
              value={<Num value={terminal.impliedGrowthFromMultiple} format="percent" decimals={2} />}
            />
          </div>
          <div className="space-y-2">
            {terminal.findings.length ? (
              terminal.findings.map((f, i) => (
                <div key={i} className="rounded border border-line p-2.5">
                  <div className="flex items-baseline gap-2">
                    <Badge tone={f.severity === 'ERROR' ? 'neg' : f.severity === 'WARNING' ? 'warn' : 'neutral'}>
                      {f.severity.toLowerCase()}
                    </Badge>
                    <span className="text-xs font-medium text-ink">{f.title}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-2">{f.detail}</p>
                </div>
              ))
            ) : (
              <InlineNote tone="pos">The two methods describe the same company.</InlineNote>
            )}
          </div>
        </div>
      </Panel>

      {/* ------------------------ Premises against reported --------------------- */}
      <Panel>
        <PanelHeader
          title="Premises against what was reported"
          subtitle={premises.summary}
          actions={
            premises.persistentBreaches.length
              ? <Badge tone="warn">{premises.persistentBreaches.length} persistent</Badge>
              : null
          }
        />
        <div className="px-3 pb-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-2xs uppercase tracking-wide text-ink-4">
                <th className="py-1 text-left font-semibold">Premise</th>
                <th className="py-1 text-right font-semibold">Model assumes</th>
                <th className="py-1 text-right font-semibold">Reported</th>
                <th className="py-1 text-right font-semibold">Deviation</th>
                <th className="py-1 text-right font-semibold">Period</th>
                <th className="py-1 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {premises.checks.map((c) => (
                <tr key={c.key}>
                  <td className="py-1.5 text-ink-2">{c.label}</td>
                  <td className="py-1.5 text-right"><Num value={c.assumed} format="percent" decimals={2} /></td>
                  <td className="py-1.5 text-right"><Num value={c.actual} format="percent" decimals={2} /></td>
                  <td className={cx('py-1.5 text-right num', c.status === 'BELOW' ? 'text-neg' : c.status === 'ABOVE' ? 'text-warn' : 'text-ink-3')}>
                    {isNum(c.deviationBps) ? `${(c.deviationBps as number) >= 0 ? '+' : ''}${(c.deviationBps as number).toFixed(0)} bps` : DASH}
                  </td>
                  <td className="py-1.5 text-right text-2xs text-ink-4">{c.period}</td>
                  <td className="py-1.5 text-right">
                    <Badge tone={STATUS_TONE[c.status] ?? 'neutral'}>
                      {c.status === 'ON_TRACK' ? 'on track' : c.status === 'UNAVAILABLE' ? 'no data' : c.status.toLowerCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {premises.persistentBreaches.length ? (
            <InlineNote tone="warn">
              <div className="space-y-1">
                {premises.persistentBreaches.map((b) => (
                  <p key={b.key}>
                    <strong>{b.label}</strong> has missed in the same direction for {b.periods} periods, by{' '}
                    {b.averageBps >= 0 ? '+' : ''}{b.averageBps.toFixed(0)} bps on average. One quarter is noise; a run
                    is the forecast being wrong.
                  </p>
                ))}
              </div>
            </InlineNote>
          ) : null}
        </div>
      </Panel>

      {/* ------------------------------ Provenance ----------------------------- */}
      <Panel>
        <PanelHeader
          title="Where each input came from"
          subtitle={verification.summary}
          actions={
            <div className="flex items-center gap-2">
              <span className="num text-sm font-semibold text-ink">{verification.score}</span>
              <span className="text-2xs text-ink-4">/ 100</span>
            </div>
          }
        />
        <div className="px-3 pb-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <Badge tone="pos">{verification.counts.verified} verified</Badge>
            {verification.counts.asserted ? <Badge tone="neutral">{verification.counts.asserted} analyst estimate</Badge> : null}
            {verification.counts.simulated ? <Badge tone="warn">{verification.counts.simulated} simulated</Badge> : null}
            {verification.counts.stale ? <Badge tone="warn">{verification.counts.stale} stale</Badge> : null}
            {verification.counts.unverified ? <Badge tone="neg">{verification.counts.unverified} unsourced</Badge> : null}
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-2xs uppercase tracking-wide text-ink-4">
                <th className="py-1 text-left font-semibold">Input</th>
                <th className="py-1 text-left font-semibold">Group</th>
                <th className="py-1 text-left font-semibold">Source</th>
                <th className="py-1 text-right font-semibold">As of</th>
                <th className="py-1 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {verification.rows.map((r) => (
                <tr key={r.path}>
                  <td className="py-1.5 text-ink-2">
                    {r.label}
                    {r.critical ? <Tooltip content="The model cannot produce a number without this."><span className="ml-1.5 text-2xs text-ink-4">load-bearing</span></Tooltip> : null}
                  </td>
                  <td className="py-1.5 text-2xs text-ink-4">{r.group}</td>
                  <td className="py-1.5 text-2xs text-ink-3">
                    {r.source?.reference ?? <span className="text-neg">nothing recorded</span>}
                  </td>
                  <td className="py-1.5 text-right text-2xs text-ink-4">
                    {r.source?.asOf ? formatDate(r.source.asOf) : DASH}
                    {isNum(r.ageDays) && (r.ageDays as number) > 90 ? (
                      <span className="ml-1 text-warn">({r.ageDays}d)</span>
                    ) : null}
                  </td>
                  <td className="py-1.5 text-right">
                    <Badge tone={STATUS_TONE[r.status] ?? 'neutral'}>{r.status.toLowerCase()}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-2xs leading-relaxed text-ink-4">
            An analyst&apos;s own estimate is a legitimate input and is recorded as one. What the product will not do is
            let an estimate wear the clothes of a filing.{' '}
            <a href="/settings/data-quality" className="text-accent hover:underline">
              Every model in the workspace <Icon.ArrowRight size={10} className="inline" />
            </a>
          </p>
        </div>
      </Panel>
    </div>
  );
}
