'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge, Button, cx, Field, InlineNote, Input, Panel, PanelHeader, PercentInput,
  Segmented, Select, Textarea, Tooltip, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { Num, StatRow } from '@/components/ui/values';
import { DASH, formatDate, formatMetric, formatPercent } from '@/lib/finance/format';
import { isNum } from '@/lib/finance/core';
import type {
  BetaMethod, WaccBuildInput, WaccBuildResult, WaccCheck,
} from '@/lib/finance/waccBuilder';
import type { WaccBuildContext } from '@/server/services/wacc';
import type { Currency } from '@/lib/finance/types';

interface DiffRow {
  key: string; label: string; from: number | null; to: number | null;
  delta: number | null; format: 'percent' | 'ratio' | 'currency';
}

const SEVERITY_TONE: Record<WaccCheck['severity'], 'neg' | 'warn' | 'neutral'> = {
  ERROR: 'neg', WARNING: 'warn', INFO: 'neutral',
};

/**
 * The discount rate as a build. Every component names its instrument and its
 * date; the checks beside it are the ones a senior reviewer would raise, and
 * none of them blocks the analyst from disagreeing.
 */
export function WaccBuilder(props: {
  ticker: string;
  modelId: string | null;
  currency: Currency;
  canEdit: boolean;
  /** Applies the built rate to the model's assumptions. */
  onApply: (wacc: number) => void;
  /** The rate the model is currently discounting at. */
  currentModelWacc: number | null;
}) {
  const toast = useToast();
  const [context, setContext] = useState<WaccBuildContext | null>(null);
  const [input, setInput] = useState<WaccBuildInput | null>(null);
  const [result, setResult] = useState<WaccBuildResult | null>(null);
  const [diff, setDiff] = useState<DiffRow[]>([]);
  const [waccDelta, setWaccDelta] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setLoading(true);
    const params = new URLSearchParams({ ticker: props.ticker });
    if (props.modelId) params.set('modelId', props.modelId);
    fetch(`/api/valuation/wacc?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (!live) return;
        if (data.error) { setError(data.error); return; }
        setContext(data.context);
        setInput(data.context.saved ?? data.context.suggested);
        setResult(data.result);
      })
      .catch(() => live && setError('The WACC build could not be loaded.'))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [props.ticker, props.modelId]);

  const run = useCallback(async (next: WaccBuildInput, save: boolean) => {
    setBusy(true);
    try {
      const res = await fetch('/api/valuation/wacc', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: props.ticker, modelId: props.modelId, save, build: next }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Build failed', description: data.error }); return; }
      setResult(data.result);
      setDiff(data.diff.rows ?? []);
      setWaccDelta(data.diff.waccDelta ?? null);
      if (save) {
        toast.push({
          tone: 'pos',
          title: 'WACC build saved',
          description: `${formatPercent(data.result.wacc, 2)} — every component is recorded with its source.`,
        });
      }
    } finally { setBusy(false); }
  }, [props.ticker, props.modelId, toast]);

  // Recompute as the analyst types, debounced so each keystroke is not a request.
  useEffect(() => {
    if (!input) return;
    const t = setTimeout(() => { void run(input, false); }, 350);
    return () => clearTimeout(t);
  }, [input, run]);

  const patch = (over: Partial<WaccBuildInput>) => setInput((i) => (i ? { ...i, ...over } : i));

  const rateInstruments = useMemo(
    () => (context?.instruments ?? []).filter((i) => i.category === 'RATE'),
    [context],
  );
  const macroInstruments = useMemo(
    () => (context?.instruments ?? []).filter((i) => i.category === 'MACRO'),
    [context],
  );

  if (loading) {
    return <Panel className="p-6"><p className="text-xs text-ink-3">Assembling the build from the workspace…</p></Panel>;
  }
  if (error || !input || !context) {
    return <InlineNote tone="neg">{error ?? 'The WACC build is unavailable for this company.'}</InlineNote>;
  }

  const errors = result?.checks.filter((c) => c.severity === 'ERROR') ?? [];
  const warnings = result?.checks.filter((c) => c.severity === 'WARNING') ?? [];
  const notes = result?.checks.filter((c) => c.severity === 'INFO') ?? [];
  const applicable = isNum(result?.wacc);
  const differsFromModel = applicable && isNum(props.currentModelWacc)
    && Math.abs((result!.wacc as number) - (props.currentModelWacc as number)) > 1e-6;

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
      {/* ------------------------------ Inputs ------------------------------ */}
      <div className="space-y-3">
        <Panel>
          <PanelHeader
            title="Risk-free rate"
            subtitle="Nominal cash flows need a nominal rate"
            dense
          />
          <div className="space-y-2.5 p-3 pt-0">
            <Field label="Instrument" hint="Pick the instrument, not just the number.">
              <Select
                value={input.riskFree.instrument ?? ''}
                disabled={!props.canEdit}
                onChange={(e) => {
                  const inst = rateInstruments.find((x) => x.name === e.target.value);
                  if (!inst) { patch({ riskFree: { ...input.riskFree, instrument: null } }); return; }
                  const isReal = /NTN-B|real yield|TIPS/i.test(inst.name);
                  patch({
                    riskFree: {
                      ...input.riskFree,
                      value: inst.value,
                      instrument: inst.name,
                      source: `${inst.name} (MockMarketDataProvider)`,
                      asOf: inst.asOf,
                      basis: isReal ? 'REAL' : 'NOMINAL',
                      inflation: isReal
                        ? context.instruments.find((x) => x.code === 'IPCA')?.value ?? null
                        : null,
                    },
                  });
                }}
              >
                <option value="">Custom</option>
                {rateInstruments.map((i) => <option key={i.code} value={i.name}>{i.name}</option>)}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Quoted yield">
                <PercentInput
                  value={input.riskFree.value}
                  decimals={2}
                  disabled={!props.canEdit}
                  onValueChange={(v) => patch({ riskFree: { ...input.riskFree, value: v } })}
                />
              </Field>
              <Field label="Basis">
                <Select
                  value={input.riskFree.basis}
                  disabled={!props.canEdit}
                  onChange={(e) => patch({ riskFree: { ...input.riskFree, basis: e.target.value as 'NOMINAL' | 'REAL' } })}
                >
                  <option value="NOMINAL">Nominal</option>
                  <option value="REAL">Real (inflation-linked)</option>
                </Select>
              </Field>
            </div>
            {input.riskFree.basis === 'REAL' ? (
              <Field label="Expected inflation" hint="Used to convert the real rate through Fisher.">
                <PercentInput
                  value={input.riskFree.inflation ?? 0}
                  decimals={2}
                  disabled={!props.canEdit}
                  onValueChange={(v) => patch({ riskFree: { ...input.riskFree, inflation: v } })}
                />
              </Field>
            ) : null}
            {result?.riskFreeConverted ? (
              <InlineNote tone="info">
                {formatPercent(result.riskFreeAsSupplied, 2)} real becomes{' '}
                <strong>{formatPercent(result.riskFreeNominal, 2)}</strong> nominal.
              </InlineNote>
            ) : null}
            <Field label="Source">
              <Input
                value={input.riskFree.source}
                disabled={!props.canEdit}
                onChange={(e) => patch({ riskFree: { ...input.riskFree, source: e.target.value } })}
              />
            </Field>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Premia" dense />
          <div className="space-y-2.5 p-3 pt-0">
            <Field label="Equity risk premium">
              <PercentInput
                value={input.equityRiskPremium.value}
                decimals={2}
                disabled={!props.canEdit}
                onValueChange={(v) => patch({ equityRiskPremium: { ...input.equityRiskPremium, value: v } })}
              />
            </Field>
            <Field label="ERP is quoted for">
              <Select
                value={input.erpIsDevelopedMarket === false ? 'LOCAL' : 'DEVELOPED'}
                disabled={!props.canEdit}
                onChange={(e) => patch({ erpIsDevelopedMarket: e.target.value === 'DEVELOPED' })}
              >
                <option value="DEVELOPED">A mature market</option>
                <option value="LOCAL">This market, already</option>
              </Select>
            </Field>
            <Field
              label="Country risk premium"
              hint={macroInstruments.length || rateInstruments.find((i) => i.code === 'EMBIBR')
                ? 'A sovereign spread is the usual source.'
                : undefined}
            >
              <div className="flex gap-2">
                <PercentInput
                  value={input.countryRiskPremium?.value ?? 0}
                  decimals={2}
                  disabled={!props.canEdit}
                  className="flex-1"
                  onValueChange={(v) => patch({
                    countryRiskPremium: {
                      value: v,
                      source: input.countryRiskPremium?.source ?? 'Analyst input',
                      asOf: input.countryRiskPremium?.asOf ?? null,
                    },
                  })}
                />
                {props.canEdit ? (
                  <Button
                    size="sm"
                    onClick={() => patch({ countryRiskPremium: input.countryRiskPremium ? null : context.suggested.countryRiskPremium })}
                  >
                    {input.countryRiskPremium ? 'Omit' : 'Restore'}
                  </Button>
                ) : null}
              </div>
            </Field>
            {input.countryRiskPremium ? (
              <p className="text-2xs text-ink-4">{input.countryRiskPremium.source}</p>
            ) : (
              <p className="text-2xs text-warn">Omitted. The reason belongs in the rationale below.</p>
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Beta"
            subtitle="Both methods, computed side by side"
            dense
            actions={
              <Segmented
                value={input.betaMethod}
                onChange={(v) => patch({ betaMethod: v as BetaMethod })}
                size="xs"
                options={[
                  { value: 'OBSERVED' as BetaMethod, label: 'Observed' },
                  { value: 'BOTTOM_UP' as BetaMethod, label: 'Bottom-up' },
                ]}
              />
            }
          />
          <div className="p-3 pt-0">
            <div className="grid grid-cols-2 gap-2">
              <div className={cx('rounded border p-2', input.betaMethod === 'OBSERVED' ? 'border-accent/45 bg-accent/[0.05]' : 'border-line')}>
                <div className="label">Observed</div>
                <Num value={result?.beta.observed ?? null} format="ratio" decimals={2} className="text-base font-semibold" />
                <p className="mt-0.5 text-2xs text-ink-4">
                  {input.observedBeta?.window ?? 'window unstated'} against {input.observedBeta?.benchmark ?? '—'}
                </p>
              </div>
              <div className={cx('rounded border p-2', input.betaMethod === 'BOTTOM_UP' ? 'border-accent/45 bg-accent/[0.05]' : 'border-line')}>
                <div className="label">Bottom-up</div>
                <Num value={result?.beta.bottomUp ?? null} format="ratio" decimals={2} className="text-base font-semibold" />
                <p className="mt-0.5 text-2xs text-ink-4">
                  {result?.beta.peerCount ?? 0} peers, re-levered at D/E{' '}
                  {isNum(result?.beta.releveredAt) ? (result!.beta.releveredAt as number).toFixed(2) : DASH}
                </p>
              </div>
            </div>

            {isNum(result?.beta.spread) ? (
              <p className="mt-2 text-2xs text-ink-3">
                The two methods differ by {Math.abs(result!.beta.spread as number).toFixed(2)}. Median unlevered peer
                beta {isNum(result?.beta.peerMedianUnlevered) ? (result!.beta.peerMedianUnlevered as number).toFixed(2) : DASH}.
              </p>
            ) : null}

            <Field label="Re-lever at D/E" className="mt-2.5" hint="Defaults to the company's current market structure.">
              <PercentInput
                value={input.targetDebtToEquity ?? 0}
                decimals={1}
                disabled={!props.canEdit}
                onValueChange={(v) => patch({ targetDebtToEquity: v })}
              />
            </Field>

            {context.peers.length ? (
              <div className="mt-2.5">
                <div className="label mb-1">Peer set</div>
                <table className="w-full text-2xs">
                  <thead>
                    <tr className="uppercase tracking-wide text-ink-4">
                      <th className="py-0.5 text-left font-semibold">Peer</th>
                      <th className="py-0.5 text-right font-semibold">Levered</th>
                      <th className="py-0.5 text-right font-semibold">D/E</th>
                      <th className="py-0.5 text-right font-semibold">Unlevered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {context.peers.map((p) => {
                      const unlev = p.leveredBeta / (1 + (1 - p.taxRate) * p.debtToEquity);
                      return (
                        <tr key={p.ticker}>
                          <td className="py-0.5 text-ink-2">{p.ticker}</td>
                          <td className="py-0.5 text-right num text-ink-3">{p.leveredBeta.toFixed(2)}</td>
                          <td className="py-0.5 text-right num text-ink-3">{p.debtToEquity.toFixed(2)}</td>
                          <td className="py-0.5 text-right num text-ink">{unlev.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-2 text-2xs text-ink-4">
                No peer carries the beta, market cap and net debt needed to unlever. The bottom-up method is unavailable
                rather than approximated.
              </p>
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Debt and capital structure" dense />
          <div className="space-y-2.5 p-3 pt-0">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Cost of debt (pre-tax)">
                <PercentInput
                  value={input.costOfDebt.value}
                  decimals={2}
                  disabled={!props.canEdit}
                  onValueChange={(v) => patch({ costOfDebt: { ...input.costOfDebt, value: v } })}
                />
              </Field>
              <Field label="Basis">
                <Select
                  value={input.costOfDebt.basis ?? 'REPORTED'}
                  disabled={!props.canEdit}
                  onChange={(e) => patch({ costOfDebt: { ...input.costOfDebt, basis: e.target.value as 'REPORTED' | 'SPREAD' | 'YTM' } })}
                >
                  <option value="REPORTED">Reported average</option>
                  <option value="SPREAD">Spread over policy rate</option>
                  <option value="YTM">Yield on own bonds</option>
                </Select>
              </Field>
            </div>
            <Field label="Tax rate">
              <PercentInput
                value={input.taxRate.value}
                decimals={1}
                disabled={!props.canEdit}
                onValueChange={(v) => patch({ taxRate: { ...input.taxRate, value: v } })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label={`Market equity (${props.currency} mn)`} hint="Price x shares.">
                <Input
                  type="number"
                  value={input.marketValueEquity.value}
                  disabled={!props.canEdit}
                  onChange={(e) => patch({ marketValueEquity: { ...input.marketValueEquity, value: Number(e.target.value) } })}
                  className="num text-right"
                />
              </Field>
              <Field label="Debt basis">
                <Select
                  value={input.debt.basis}
                  disabled={!props.canEdit}
                  onChange={(e) => patch({ debt: { ...input.debt, basis: e.target.value as 'NET_DEBT' | 'GROSS_DEBT' } })}
                >
                  <option value="NET_DEBT">Net debt</option>
                  <option value="GROSS_DEBT">Gross debt</option>
                </Select>
              </Field>
            </div>
            <Field label={`Debt (${props.currency} mn)`}>
              <Input
                type="number"
                value={input.debt.value}
                disabled={!props.canEdit}
                onChange={(e) => patch({ debt: { ...input.debt, value: Number(e.target.value) } })}
                className="num text-right"
              />
            </Field>
            <Field label="Long-run equity weight" hint="Leave at zero to skip the drift check.">
              <PercentInput
                value={input.targetEquityWeight ?? 0}
                decimals={0}
                disabled={!props.canEdit}
                onValueChange={(v) => patch({ targetEquityWeight: v || null })}
              />
            </Field>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Rationale" subtitle="What makes this build defensible at committee" dense />
          <div className="p-3 pt-0">
            <Textarea
              rows={3}
              value={input.rationale ?? ''}
              disabled={!props.canEdit}
              onChange={(e) => patch({ rationale: e.target.value })}
              placeholder="Observed beta over three years covers a full cycle; country premium from the sovereign spread because the revenue is domestic."
            />
          </div>
        </Panel>
      </div>

      {/* ------------------------------ Output ------------------------------ */}
      <div className="min-w-0 space-y-3">
        <Panel>
          <PanelHeader
            title="WACC build summary"
            subtitle={`${context.companyName} · every component with its source`}
            actions={
              <div className="flex items-center gap-2">
                {props.canEdit && props.modelId ? (
                  <Button size="sm" onClick={() => void run(input, true)} loading={busy} disabled={!applicable}>
                    Save build
                  </Button>
                ) : null}
                {differsFromModel ? (
                  <Button
                    size="sm" variant="primary" icon={<Icon.Check size={12} />}
                    onClick={() => {
                      props.onApply(result!.wacc as number);
                      toast.push({
                        tone: 'pos',
                        title: 'Applied to the model',
                        description: `Discounting at ${formatPercent(result!.wacc, 2)}.`,
                      });
                    }}
                  >
                    Apply to model
                  </Button>
                ) : null}
              </div>
            }
          />
          <div className="px-3 pb-3">
            <div className="mb-3 grid gap-2 sm:grid-cols-3">
              <div className="panel px-3 py-2.5">
                <div className="label">Cost of equity</div>
                <Num value={result?.costOfEquity ?? null} format="percent" decimals={2} className="text-lg font-semibold" />
                <p className="mt-0.5 text-2xs text-ink-4">Rf + β × ERP + CRP</p>
              </div>
              <div className="panel px-3 py-2.5">
                <div className="label">Cost of debt, after tax</div>
                <Num value={result?.costOfDebtAfterTax ?? null} format="percent" decimals={2} className="text-lg font-semibold" />
                <p className="mt-0.5 text-2xs text-ink-4">
                  {formatPercent(result?.costOfDebtPreTax ?? null, 2)} × (1 − {formatPercent(result?.taxRate ?? null, 0)})
                </p>
              </div>
              <div className="panel border-accent/40 px-3 py-2.5">
                <div className="label">WACC</div>
                <div className="flex items-baseline gap-2">
                  <Num value={result?.wacc ?? null} format="percent" decimals={2} className="text-lg font-semibold" />
                  {isNum(waccDelta) && (waccDelta as number) !== 0 ? (
                    <span className={cx('num text-2xs', (waccDelta as number) > 0 ? 'text-neg' : 'text-pos')}>
                      {(waccDelta as number) > 0 ? '+' : ''}{((waccDelta as number) * 10_000).toFixed(0)} bps
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-2xs text-ink-4">
                  {formatPercent(result?.equityWeight ?? null, 0)} equity / {formatPercent(result?.debtWeight ?? null, 0)} debt
                </p>
              </div>
            </div>

            <table className="w-full text-xs">
              <thead>
                <tr className="text-2xs uppercase tracking-wide text-ink-4">
                  <th className="py-1 text-left font-semibold">Component</th>
                  <th className="py-1 text-right font-semibold">Value</th>
                  <th className="py-1 text-left font-semibold pl-4">Source</th>
                  <th className="py-1 text-right font-semibold">As of</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {(result?.components ?? []).map((c) => (
                  <tr key={c.key} className={c.key === 'wacc' ? 'font-semibold text-ink' : ''}>
                    <td className="py-1.5 text-ink-2">
                      {c.label}
                      {c.note ? <span className="ml-2 text-2xs text-ink-4">{c.note}</span> : null}
                    </td>
                    <td className="py-1.5 text-right">
                      {c.value === null ? (
                        <span className="text-2xs text-ink-4">{DASH}</span>
                      ) : (
                        <span className="num">
                          {c.format === 'percent'
                            ? formatPercent(c.value, 2)
                            : c.format === 'ratio'
                              ? c.value.toFixed(2)
                              : formatMetric(c.value, 'currencyMillions', { currency: props.currency })}
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 pl-4 text-2xs text-ink-3">
                      {c.source || <span className="text-warn">no source</span>}
                    </td>
                    <td className="py-1.5 text-right text-2xs text-ink-4">
                      {c.asOf ? formatDate(c.asOf) : DASH}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {diff.length ? (
          <Panel>
            <PanelHeader
              title="What moved since the saved build"
              subtitle={isNum(waccDelta)
                ? `WACC ${(waccDelta as number) >= 0 ? 'up' : 'down'} ${Math.abs((waccDelta as number) * 10_000).toFixed(0)} bps`
                : undefined}
              dense
            />
            <div className="px-3 pb-3 divide-y divide-line">
              {diff.map((r) => (
                <StatRow
                  key={r.key}
                  label={r.label}
                  value={
                    <span className="num text-xs">
                      <span className="text-ink-4">
                        {r.from === null ? DASH : r.format === 'percent' ? formatPercent(r.from, 2) : r.from.toFixed(2)}
                      </span>
                      <span className="mx-1.5 text-ink-4">→</span>
                      <span className="text-ink">
                        {r.to === null ? DASH : r.format === 'percent' ? formatPercent(r.to, 2) : r.to.toFixed(2)}
                      </span>
                    </span>
                  }
                />
              ))}
            </div>
          </Panel>
        ) : null}

        {errors.length || warnings.length || notes.length ? (
          <Panel>
            <PanelHeader
              title="Review"
              subtitle="What a senior reviewer would raise. None of it blocks you."
              actions={
                <div className="flex items-center gap-1.5">
                  {errors.length ? <Badge tone="neg">{errors.length} blocking</Badge> : null}
                  {warnings.length ? <Badge tone="warn">{warnings.length} to check</Badge> : null}
                  {notes.length ? <Badge tone="neutral">{notes.length} note{notes.length === 1 ? '' : 's'}</Badge> : null}
                </div>
              }
            />
            <div className="divide-y divide-line">
              {[...errors, ...warnings, ...notes].map((c) => (
                <div key={c.id} className="flex items-start gap-3 px-3 py-2.5">
                  <Badge tone={SEVERITY_TONE[c.severity]}>
                    {c.severity === 'ERROR' ? 'blocking' : c.severity === 'WARNING' ? 'check' : 'note'}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-ink">{c.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-ink-2">{c.detail}</p>
                    <p className="mt-1 text-2xs leading-relaxed text-ink-4">{c.remedy}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ) : (
          <InlineNote tone="pos">Nothing to raise on this build.</InlineNote>
        )}

        <Panel>
          <PanelHeader title="Against the model" dense />
          <div className="px-3 pb-3 divide-y divide-line">
            <StatRow label="Rate this build produces" value={<Num value={result?.wacc ?? null} format="percent" decimals={2} />} />
            <StatRow label="Rate the model is discounting at" value={<Num value={props.currentModelWacc} format="percent" decimals={2} />} />
            <StatRow
              label="Difference"
              hint="Applying the build re-runs the forecast at the new rate."
              value={
                isNum(result?.wacc) && isNum(props.currentModelWacc) ? (
                  <span className="num text-xs">
                    {(((result!.wacc as number) - (props.currentModelWacc as number)) * 10_000).toFixed(0)} bps
                  </span>
                ) : <span className="text-ink-4">{DASH}</span>
              }
            />
          </div>
        </Panel>

        <p className="text-2xs leading-relaxed text-ink-4">
          <Tooltip content="Every check here is advisory. The analyst decides; the decision is recorded in the audit trail with the rationale.">
            <span className="cursor-help border-b border-dotted border-ink-4">Why nothing here blocks you</span>
          </Tooltip>
          {' '}— there is no single right way to build a discount rate. The product will tell you what a reviewer would
          ask, and then record the answer you gave.
        </p>
      </div>
    </div>
  );
}
