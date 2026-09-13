'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Badge, Button, cx, EmptyState, InlineNote, Input, NumberInput, Panel, PanelHeader,
  PercentInput, Segmented, Tooltip, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { Num } from '@/components/ui/values';
import { DASH, formatPercent } from '@/lib/finance/format';
import { isNum } from '@/lib/finance/core';
import type { Currency } from '@/lib/finance/types';
import type { DcfAssumptions } from '@/lib/finance/dcf';
import type { UnitModelContext, UnitModelRun, UnitModelState } from '@/server/services/units';
import type { SegmentInput } from '@/lib/finance/extensions/segmentUnits';

/* ==================================================================
   Valuing the company as a set of units.

   The company's own segment disclosure is the starting split, not the
   answer: every field is editable, units can be added and removed, and
   whether the units consolidate or stand alone is the analyst's
   decision rather than a property of the industry.
   ================================================================== */

export function UnitModel(props: {
  ticker: string;
  modelId: string | null;
  currency: Currency;
  canEdit: boolean;
  assumptions: DcfAssumptions;
  /** Value per share the single-stream DCF produces, for comparison. */
  /**
   * The published valuation. The unit build is a cross-check against it: if
   * summing the driver streams lands somewhere else, one of the two has a
   * driver wrong, and the gap is the thing worth looking at.
   */
  singleStreamValue: number | null;
}) {
  const toast = useToast();
  const [context, setContext] = useState<UnitModelContext | null>(null);
  const [state, setState] = useState<UnitModelState | null>(null);
  const [run, setRun] = useState<UnitModelRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let live = true;
    setLoading(true);
    fetch(`/api/valuation/units?ticker=${props.ticker}${props.modelId ? `&modelId=${props.modelId}` : ''}`)
      .then((r) => r.json())
      .then((d) => {
        if (!live || d.error) return;
        setContext(d.context as UnitModelContext);
        setState((d.context.saved ?? d.context.suggested) as UnitModelState);
        setRun(d.run as UnitModelRun);
      })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [props.ticker, props.modelId]);

  /* --- recompute as the analyst edits, on the live DCF premises ----- */
  const recompute = useCallback(async (next: UnitModelState) => {
    setBusy(true);
    try {
      const res = await fetch('/api/valuation/units', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: props.ticker, modelId: props.modelId, state: next,
          assumptions: props.assumptions as unknown as Record<string, unknown>,
        }),
      });
      const d = await res.json();
      if (res.ok) setRun(d.run as UnitModelRun);
    } finally { setBusy(false); }
  }, [props.ticker, props.modelId, props.assumptions]);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const key = state ? JSON.stringify(state) : '';
  const assumptionsKey = JSON.stringify(props.assumptions);
  useEffect(() => {
    if (!state) return;
    if (timer.current) clearTimeout(timer.current);
    const next = state;
    timer.current = setTimeout(() => { void recompute(next); }, 350);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // Serialised: the state object is rebuilt on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, assumptionsKey, recompute]);

  const patchSegment = (index: number, patch: Partial<SegmentInput>) => {
    setState((s) => (s ? { ...s, segments: s.segments.map((x, i) => (i === index ? { ...x, ...patch } : x)) } : s));
    setDirty(true);
  };

  const addSegment = () => {
    setState((s) => (s ? {
      ...s,
      segments: [...s.segments, {
        name: '', revenueShare: 0, ebitdaMargin: null, revenueGrowth: null,
        capexPctRevenue: null, endYear: null, ownership: 1, netDebt: null, wacc: null,
        source: 'Entered by the analyst',
      }],
    } : s));
    setDirty(true);
  };

  const removeSegment = (index: number) => {
    setState((s) => (s ? { ...s, segments: s.segments.filter((_, i) => i !== index) } : s));
    setDirty(true);
  };

  const reset = () => {
    if (!context) return;
    setState(context.suggested);
    setDirty(true);
    toast.push({ tone: 'info', title: 'Back to the reported split', description: `Shares and margins as disclosed for FY${context.segmentYear ?? ''}.` });
  };

  const save = async () => {
    if (!state) return;
    setBusy(true);
    try {
      const res = await fetch('/api/valuation/units', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: props.ticker, modelId: props.modelId, state, save: true,
          assumptions: props.assumptions as unknown as Record<string, unknown>,
        }),
      });
      const d = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Not saved', description: d.error }); return; }
      setRun(d.run as UnitModelRun);
      setDirty(false);
      toast.push({ tone: 'pos', title: 'Unit model saved' });
    } finally { setBusy(false); }
  };

  if (loading) return <Panel><div className="p-6 text-center text-xs text-ink-3">Reading the segment disclosure…</div></Panel>;

  if (!context || !state) {
    return (
      <Panel>
        <EmptyState
          icon={<Icon.Layers size={22} />}
          title="No unit model available"
          description="A unit model needs a DCF to stand on. Build and save the model first."
        />
      </Panel>
    );
  }

  if (!state.segments.length) {
    return (
      <Panel>
        <EmptyState
          icon={<Icon.Layers size={22} />}
          title={`${context.ticker} reports no business segments`}
          description="The reported split is the starting point for a unit model. Add units by hand if the company should be valued in pieces anyway — a partial stake, a ring-fenced project, an asset with a life of its own."
          action={props.canEdit ? <Button variant="primary" onClick={addSegment} icon={<Icon.Plus size={13} />}>Add a unit</Button> : undefined}
        />
      </Panel>
    );
  }

  const agg = run?.aggregated ?? null;
  const gapToSingle = isNum(agg?.fairValuePerShare) && isNum(props.singleStreamValue) && (props.singleStreamValue as number) !== 0
    ? (agg!.fairValuePerShare as number) / (props.singleStreamValue as number) - 1
    : null;

  return (
    <div className="space-y-4">
      <InlineNote tone="info">
        The split below comes from {context.ticker}&rsquo;s own segment disclosure
        {context.segmentYear ? ` for FY${context.segmentYear}` : ''}, projected on this model&rsquo;s premises.
        Every field is yours to change, and how the units come back together is a decision, not a property of
        the industry: consolidating discounts one stream against one balance sheet, a sum of the parts values
        each unit on its own and nets its own debt.
      </InlineNote>

      <Panel>
        <PanelHeader
          title="Units"
          subtitle={`${state.segments.length} units · ${formatPercent(run?.coverage.total ?? null, 1)} of base-year revenue`}
          actions={
            <div className="flex flex-wrap items-center gap-1.5">
              {busy ? <span className="text-2xs text-ink-4">recomputing…</span> : null}
              <Segmented
                value={state.method}
                onChange={(v) => { setState((s) => (s ? { ...s, method: v } : s)); setDirty(true); }}
                options={[
                  { value: 'CONSOLIDATED', label: 'Consolidated' },
                  { value: 'SOTP', label: 'Sum of the parts' },
                ]}
              />
              {props.canEdit ? (
                <>
                  <Button size="xs" variant="ghost" onClick={reset}>Reported split</Button>
                  <Button size="xs" variant="ghost" onClick={addSegment} icon={<Icon.Plus size={12} />}>Unit</Button>
                  <Button size="xs" onClick={() => void save()} disabled={busy || !dirty || !context.modelId}>Save</Button>
                </>
              ) : null}
            </div>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line text-2xs text-ink-3">
                <th className="px-3 py-2 text-left font-medium min-w-[180px]">Unit</th>
                <th className="px-2 py-2 text-right font-medium">Revenue share</th>
                <th className="px-2 py-2 text-right font-medium">EBITDA margin</th>
                <th className="px-2 py-2 text-right font-medium">Growth</th>
                <th className="px-2 py-2 text-right font-medium">Capex %</th>
                <th className="px-2 py-2 text-right font-medium">
                  <Tooltip content="The last year this unit produces cash. A unit with an end year gets no terminal value.">
                    <span className="cursor-help border-b border-dotted border-line-strong">Final year</span>
                  </Tooltip>
                </th>
                <th className="px-2 py-2 text-right font-medium">Own %</th>
                <th className="px-2 py-2 text-right font-medium">
                  <Tooltip content="Only deducted under a sum of the parts, where each unit nets its own debt.">
                    <span className="cursor-help border-b border-dotted border-line-strong">Unit net debt</span>
                  </Tooltip>
                </th>
                <th className="px-2 py-2 text-right font-medium">Value</th>
                <th className="px-2 py-2 text-right font-medium">Share</th>
                {props.canEdit ? <th className="w-8" /> : null}
              </tr>
            </thead>
            <tbody>
              {state.segments.map((seg, i) => {
                const valued = agg?.units.find((u) => u.unit.name === seg.name) ?? null;
                const contribution = agg?.contributions.find((c) => c.name === seg.name) ?? null;
                return (
                  <tr key={`${seg.name}-${i}`} className="border-b border-line/60 group hover:bg-sunken/40">
                    <td className="px-3 py-1.5">
                      {props.canEdit ? (
                        <Input
                          value={seg.name}
                          onChange={(e) => patchSegment(i, { name: e.target.value })}
                          className="h-6 text-2xs"
                          placeholder="What this unit is"
                        />
                      ) : <span className="text-ink-2">{seg.name}</span>}
                      {seg.source ? <span className="mt-0.5 block text-2xs text-ink-4">{seg.source}</span> : null}
                    </td>
                    <Cell>
                      <PercentInput value={seg.revenueShare} onValueChange={(v) => patchSegment(i, { revenueShare: v })} disabled={!props.canEdit} />
                    </Cell>
                    <Cell>
                      <PercentInput value={seg.ebitdaMargin ?? null} onValueChange={(v) => patchSegment(i, { ebitdaMargin: v })} disabled={!props.canEdit} placeholder="model" />
                    </Cell>
                    <Cell>
                      <PercentInput value={seg.revenueGrowth ?? null} onValueChange={(v) => patchSegment(i, { revenueGrowth: v })} disabled={!props.canEdit} placeholder="model" />
                    </Cell>
                    <Cell>
                      <PercentInput value={seg.capexPctRevenue ?? null} onValueChange={(v) => patchSegment(i, { capexPctRevenue: v })} disabled={!props.canEdit} placeholder="model" />
                    </Cell>
                    <Cell>
                      <NumberInput value={seg.endYear ?? ''} onValueChange={(v) => patchSegment(i, { endYear: v > 0 ? Math.round(v) : null })} disabled={!props.canEdit} placeholder="∞" />
                    </Cell>
                    <Cell>
                      <PercentInput value={seg.ownership ?? 1} decimals={0} onValueChange={(v) => patchSegment(i, { ownership: v })} disabled={!props.canEdit} />
                    </Cell>
                    <Cell>
                      <NumberInput
                        value={seg.netDebt ?? ''}
                        onValueChange={(v) => patchSegment(i, { netDebt: v })}
                        disabled={!props.canEdit || state.method !== 'SOTP'}
                        placeholder={state.method === 'SOTP' ? '0' : 'group'}
                      />
                    </Cell>
                    <td className="px-2 py-1.5 text-right">
                      <Num value={valued?.enterpriseValue ?? null} format="currencyMillions" currency={props.currency} />
                      {valued && valued.unit.endYear !== null ? (
                        <span className="block text-2xs text-ink-4">no terminal value</span>
                      ) : null}
                    </td>
                    <td className="px-2 py-1.5 text-right text-ink-3 num">
                      {contribution?.share !== null && contribution?.share !== undefined ? formatPercent(contribution.share, 1) : DASH}
                    </td>
                    {props.canEdit ? (
                      <td className="px-2 py-1.5">
                        <button
                          type="button" onClick={() => removeSegment(i)} aria-label={`Remove ${seg.name || 'unit'}`}
                          className="text-ink-4 opacity-0 transition hover:text-neg group-hover:opacity-100 focus-ring rounded"
                        >
                          <Icon.Trash size={11} />
                        </button>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel>
          <PanelHeader
            title={state.method === 'SOTP' ? 'Sum of the parts' : 'Consolidated'}
            subtitle={
              state.method === 'SOTP'
                ? 'Each unit valued on its own terms, netting its own debt.'
                : 'Units summed, then the group balance sheet applied once.'
            }
          />
          <div className="divide-y divide-line">
            <Row label="Enterprise value" value={agg?.enterpriseValue ?? null} currency={props.currency} />
            {state.method === 'CONSOLIDATED' ? (
              <>
                <Row label="Less group net debt" value={agg ? -agg.netDebt : null} currency={props.currency} />
                <Row label="Less minorities" value={agg ? -agg.minorityInterest : null} currency={props.currency} />
              </>
            ) : (
              <Row label="Less minorities" value={agg ? -agg.minorityInterest : null} currency={props.currency} />
            )}
            <Row label="Equity value" value={agg?.equityValue ?? null} currency={props.currency} strong />
            <div className="flex items-baseline justify-between gap-3 px-3 py-2">
              <span className="text-xs text-ink-2">Value per share</span>
              <span className="flex items-baseline gap-2">
                <Num value={agg?.fairValuePerShare ?? null} format="currency" currency={props.currency} decimals={2} className="text-md font-semibold" />
                {isNum(agg?.upside) ? (
                  <Badge tone={(agg!.upside as number) >= 0 ? 'pos' : 'neg'}>{formatPercent(agg!.upside, 1)}</Badge>
                ) : null}
              </span>
            </div>
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel>
            <PanelHeader title="Against the single stream" dense />
            <div className="space-y-2 p-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-2xs text-ink-3">One-stream DCF</span>
                <Num value={props.singleStreamValue} format="currency" currency={props.currency} decimals={2} />
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-2xs text-ink-3">Unit model</span>
                <Num value={agg?.fairValuePerShare ?? null} format="currency" currency={props.currency} decimals={2} />
              </div>
              <p className="pt-1 text-2xs leading-relaxed text-ink-3">
                {gapToSingle === null
                  ? 'Both methods need a value before they can be compared.'
                  : Math.abs(gapToSingle) < 0.02
                    ? 'The two agree. Splitting the company into units has not changed what it is worth, which is the usual result when the units share economics.'
                    : `The unit model is ${formatPercent(Math.abs(gapToSingle), 1)} ${gapToSingle > 0 ? 'above' : 'below'} the single stream. The difference is what the split is saying — which unit carries the value, or which one runs out.`}
              </p>
            </div>
          </Panel>

          {isNum(run?.expiringWithin10y) && (run!.expiringWithin10y as number) > 0 ? (
            <Panel>
              <PanelHeader title="Value that runs out" dense />
              <div className="p-3">
                <p className="text-2xs leading-relaxed text-ink-2">
                  {formatPercent(run!.expiringWithin10y, 1)} of unit value sits in units that end within ten years
                  of {context.baseYear}. Those units carry no terminal value, which is the point of giving them an end year.
                </p>
              </div>
            </Panel>
          ) : null}

          <Panel>
            <PanelHeader title="Extensions" dense subtitle="Plug-ins for shapes the generic split cannot reach." />
            <div className="p-3">
              {context.extensions.length === 0 ? (
                <p className="text-2xs leading-relaxed text-ink-3">
                  None registered. The registry ships empty on purpose: an extension built in for one industry
                  would make that industry a first-class citizen and everything else an afterthought. The
                  segment split above needs no extension at all.
                </p>
              ) : (
                <ul className="space-y-1">
                  {context.extensions.map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-2 text-2xs">
                      <span className="text-ink-2">{e.label}</span>
                      <Badge tone={e.applies ? 'accent' : 'outline'}>{e.applies ? 'offered' : 'not offered'}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>
        </div>
      </div>

      {run?.coverage.warning || agg?.warnings.length ? (
        <Panel>
          <PanelHeader title="What the aggregation is telling you" dense />
          <div className="space-y-1.5 p-3">
            {run?.coverage.warning ? <InlineNote tone="warn">{run.coverage.warning}</InlineNote> : null}
            {(agg?.warnings ?? []).map((w) => <InlineNote key={w} tone="warn">{w}</InlineNote>)}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return <td className="px-1 py-1.5 text-right"><div className="ml-auto w-[100px]">{children}</div></td>;
}

function Row({
  label, value, currency, strong,
}: { label: string; value: number | null; currency: Currency; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-3 py-1.5">
      <span className={cx('text-xs', strong ? 'font-medium text-ink' : 'text-ink-2')}>{label}</span>
      <Num value={value} format="currencyMillions" currency={currency} className={strong ? 'font-medium' : undefined} />
    </div>
  );
}
