'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, cx, EmptyState, Field, InlineNote, Modal, NumberInput, PercentInput, Panel,
  PanelHeader, Segmented, Select, Textarea, Input, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { Bps, ConvictionBadge, MetricCard, Num, RecommendationBadge, StatRow, SeverityBadge, ThesisVerdictBadge } from '@/components/ui/values';
import { BarSeriesChart } from '@/components/charts';
import { formatDate, formatPercent } from '@/lib/finance/format';
import type { Currency } from '@/lib/finance/types';
import type { ThesisHealth } from '@/server/services/alerts';
import { isNum } from '@/lib/finance/core';

const MOAT_OPTIONS = [
  ['PRICING_POWER', 'Pricing power'], ['NETWORK_EFFECTS', 'Network effects'],
  ['COST_ADVANTAGE', 'Cost advantage'], ['SWITCHING_COSTS', 'Switching costs'],
  ['BRAND', 'Brand'], ['SCALE', 'Scale'],
] as const;

const TRACKABLE_METRICS = [
  ['ebitdaMargin', 'EBITDA margin', 'PERCENT'],
  ['revenueGrowth', 'Revenue growth', 'PERCENT'],
  ['roic', 'ROIC', 'PERCENT'],
  ['roe', 'ROE', 'PERCENT'],
  ['roicSpread', 'ROIC − WACC', 'PERCENT'],
  ['netDebtToEbitda', 'Net debt / EBITDA', 'MULTIPLE'],
  ['fcfYield', 'FCF yield', 'PERCENT'],
  ['interestCoverage', 'Interest coverage', 'MULTIPLE'],
  ['evEbitda', 'EV / EBITDA', 'MULTIPLE'],
  ['pe', 'P / E', 'MULTIPLE'],
  ['capexToRevenue', 'Capex / revenue', 'PERCENT'],
] as const;

const CATALYST_KINDS = [
  ['EARNINGS', 'Earnings'], ['INVESTOR_DAY', 'Investor day'], ['DIVIDEND', 'Dividend'],
  ['M_AND_A', 'M&A'], ['REGULATORY', 'Regulatory'], ['CONTRACT', 'Contract'],
  ['PRODUCT', 'Product'], ['MACRO', 'Macro'], ['CAPITAL_ALLOCATION', 'Capital allocation'],
] as const;

const RISK_CATEGORIES = [
  ['OPERATIONAL', 'Operational'], ['FINANCIAL', 'Financial'], ['REGULATORY', 'Regulatory'],
  ['MACRO', 'Macro'], ['COMPETITIVE', 'Competitive'], ['VALUATION', 'Valuation'], ['GOVERNANCE', 'Governance'],
] as const;

interface ThesisData {
  id: string;
  recommendation: string;
  targetPrice: number | null;
  timeHorizonMonths: number;
  conviction: string;
  status: string;
  coreThesis: string;
  bullCase: string | null;
  baseCase: string | null;
  bearCase: string | null;
  growthDrivers: string[];
  moat: string[];
  assumptions: { label: string; metric: string; comparator: 'GTE' | 'LTE'; target: number; unit?: string }[];
  authorName: string;
  updatedAt: string;
}

export function ThesisWorkbench(props: {
  ticker: string;
  companyId: string;
  companyName: string;
  currency: Currency;
  currentPrice: number | null;
  modelFairValue: number | null;
  canEdit: boolean;
  thesis: ThesisData | null;
  catalysts: { id: string; title: string; kind: string; expectedDate: string | null; expectedImpact: string; direction: string; probability: number; status: string; notes: string | null }[];
  risks: { id: string; title: string; category: string; severity: string; probability: number; mitigation: string | null }[];
  health: ThesisHealth | null;
  targetHistory: { id: string; targetPrice: number; previousTarget: number | null; recommendation: string; previousRecommendation: string | null; reason: string; author: string; createdAt: string }[];
  scenarios: { expectedValue: number | null; expectedUpside: number | null; riskReward: number | null; rows: { key: string; label: string; probability: number; fairValue: number | null; upside: number | null }[] } | null;
  factorScores: { total: number | null; coverage: number; components: { key: string; label: string; score: number | null; weight: number; basis: string }[]; factors: { factor: string; label: string; score: number | null; coverage: number }[] } | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [catalystModal, setCatalystModal] = useState(false);
  const [riskModal, setRiskModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(() => ({
    recommendation: props.thesis?.recommendation ?? 'HOLD',
    targetPrice: props.thesis?.targetPrice ?? props.modelFairValue ?? props.currentPrice ?? 0,
    timeHorizonMonths: props.thesis?.timeHorizonMonths ?? 12,
    conviction: props.thesis?.conviction ?? 'MEDIUM',
    status: props.thesis?.status ?? 'ACTIVE',
    coreThesis: props.thesis?.coreThesis ?? '',
    bullCase: props.thesis?.bullCase ?? '',
    baseCase: props.thesis?.baseCase ?? '',
    bearCase: props.thesis?.bearCase ?? '',
    growthDrivers: props.thesis?.growthDrivers ?? ['', '', ''],
    moat: props.thesis?.moat ?? [],
    assumptions: props.thesis?.assumptions ?? [],
    changeReason: '',
  }));

  const [catalystForm, setCatalystForm] = useState({
    title: '', kind: 'EARNINGS', expectedDate: '', expectedImpact: 'MEDIUM',
    direction: 'POSITIVE', probability: 0.6, notes: '',
  });
  const [riskForm, setRiskForm] = useState({
    title: '', category: 'OPERATIONAL', severity: 'MEDIUM', probability: 0.3, mitigation: '',
  });

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/thesis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: props.companyId,
          recommendation: form.recommendation,
          targetPrice: Number.isFinite(form.targetPrice) ? form.targetPrice : null,
          timeHorizonMonths: form.timeHorizonMonths,
          conviction: form.conviction,
          status: form.status,
          coreThesis: form.coreThesis,
          bullCase: form.bullCase || null,
          baseCase: form.baseCase || null,
          bearCase: form.bearCase || null,
          growthDrivers: form.growthDrivers.filter((d) => d.trim()),
          moat: form.moat,
          assumptions: form.assumptions,
          changeReason: form.changeReason || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.push({ tone: 'neg', title: 'Could not save the thesis', description: data.error ?? Object.values(data.fields ?? {}).flat().join(' ') });
        return;
      }
      toast.push({ tone: 'pos', title: 'Thesis saved', description: 'Target and recommendation changes are recorded in the history.' });
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const addCatalyst = async () => {
    const res = await fetch('/api/thesis/catalysts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: props.companyId, thesisId: props.thesis?.id ?? null,
        title: catalystForm.title, kind: catalystForm.kind,
        expectedDate: catalystForm.expectedDate || null,
        expectedImpact: catalystForm.expectedImpact, direction: catalystForm.direction,
        probability: catalystForm.probability, notes: catalystForm.notes || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) { toast.push({ tone: 'neg', title: 'Could not add the catalyst', description: data.error }); return; }
    setCatalystModal(false);
    setCatalystForm({ title: '', kind: 'EARNINGS', expectedDate: '', expectedImpact: 'MEDIUM', direction: 'POSITIVE', probability: 0.6, notes: '' });
    router.refresh();
  };

  const addRisk = async () => {
    const res = await fetch('/api/thesis/risks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: props.companyId, thesisId: props.thesis?.id ?? null,
        title: riskForm.title, category: riskForm.category, severity: riskForm.severity,
        probability: riskForm.probability, mitigation: riskForm.mitigation || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) { toast.push({ tone: 'neg', title: 'Could not add the risk', description: data.error }); return; }
    setRiskModal(false);
    setRiskForm({ title: '', category: 'OPERATIONAL', severity: 'MEDIUM', probability: 0.3, mitigation: '' });
    router.refresh();
  };

  const removeCatalyst = async (id: string) => {
    const res = await fetch(`/api/thesis/catalysts?id=${id}`, { method: 'DELETE' });
    if (res.ok) router.refresh();
    else toast.push({ tone: 'neg', title: 'Could not remove the catalyst' });
  };

  const removeRisk = async (id: string) => {
    const res = await fetch(`/api/thesis/risks?id=${id}`, { method: 'DELETE' });
    if (res.ok) router.refresh();
    else toast.push({ tone: 'neg', title: 'Could not remove the risk' });
  };

  const upside = isNum(props.thesis?.targetPrice) && isNum(props.currentPrice) && (props.currentPrice as number) > 0
    ? (props.thesis!.targetPrice as number) / (props.currentPrice as number) - 1
    : null;

  if (!props.thesis && !editing) {
    return (
      <Panel>
        <EmptyState
          icon={<Icon.Target size={22} />}
          title={`No thesis written for ${props.ticker}`}
          description="A thesis in MERIDIAN is not prose alone: it records the recommendation, the target, the cases, and the measurable assumptions the platform then checks at every reporting date."
          action={props.canEdit ? <Button variant="primary" icon={<Icon.Plus size={12} />} onClick={() => setEditing(true)}>Write the thesis</Button> : <Badge tone="outline">Your role cannot write a thesis</Badge>}
        />
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      {editing ? (
        <Panel>
          <PanelHeader
            title={props.thesis ? 'Edit thesis' : `Write the ${props.ticker} thesis`}
            subtitle="Assumptions written here are checked against the reported figures at every period."
            actions={
              <>
                <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                <Button variant="primary" onClick={save} loading={saving}>Save thesis</Button>
              </>
            }
          />
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Recommendation">
                <Select value={form.recommendation} onChange={(e) => setForm((f) => ({ ...f, recommendation: e.target.value }))}>
                  <option value="STRONG_BUY">Strong buy</option>
                  <option value="BUY">Buy</option>
                  <option value="HOLD">Hold</option>
                  <option value="SELL">Sell</option>
                  <option value="STRONG_SELL">Strong sell</option>
                </Select>
              </Field>
              <Field label={`Target price (${props.currency})`} hint={isNum(props.modelFairValue) ? `Model fair value ${props.modelFairValue!.toFixed(2)}` : undefined}>
                <NumberInput value={form.targetPrice} onValueChange={(v) => setForm((f) => ({ ...f, targetPrice: v }))} step="0.01" />
              </Field>
              <Field label="Time horizon (months)">
                <NumberInput value={form.timeHorizonMonths} onValueChange={(v) => setForm((f) => ({ ...f, timeHorizonMonths: Math.round(v) }))} step="1" />
              </Field>
              <Field label="Conviction">
                <Select value={form.conviction} onChange={(e) => setForm((f) => ({ ...f, conviction: e.target.value }))}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="VERY_HIGH">Very high</option>
                </Select>
              </Field>
            </div>

            <Field label="Core thesis" required hint="The proposition the investment depends on, in the words you would use to defend it.">
              <Textarea value={form.coreThesis} onChange={(e) => setForm((f) => ({ ...f, coreThesis: e.target.value }))} rows={5} />
            </Field>

            <div className="grid gap-3 lg:grid-cols-3">
              <Field label="Bull case"><Textarea value={form.bullCase} onChange={(e) => setForm((f) => ({ ...f, bullCase: e.target.value }))} rows={4} /></Field>
              <Field label="Base case"><Textarea value={form.baseCase} onChange={(e) => setForm((f) => ({ ...f, baseCase: e.target.value }))} rows={4} /></Field>
              <Field label="Bear case"><Textarea value={form.bearCase} onChange={(e) => setForm((f) => ({ ...f, bearCase: e.target.value }))} rows={4} /></Field>
            </div>

            <div>
              <p className="label mb-2">Growth drivers</p>
              {form.growthDrivers.map((d, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  <span className="num mt-2 w-4 text-2xs text-ink-4">{i + 1}</span>
                  <Input
                    value={d}
                    placeholder="What has to happen for the thesis to work"
                    onChange={(e) => setForm((f) => ({ ...f, growthDrivers: f.growthDrivers.map((x, j) => (j === i ? e.target.value : x)) }))}
                  />
                  <Button size="sm" variant="ghost" onClick={() => setForm((f) => ({ ...f, growthDrivers: f.growthDrivers.filter((_, j) => j !== i) }))}>
                    <Icon.Close size={12} />
                  </Button>
                </div>
              ))}
              <Button size="xs" icon={<Icon.Plus size={11} />} onClick={() => setForm((f) => ({ ...f, growthDrivers: [...f.growthDrivers, ''] }))}>
                Add driver
              </Button>
            </div>

            <div>
              <p className="label mb-2">Sources of advantage</p>
              <div className="flex flex-wrap gap-1.5">
                {MOAT_OPTIONS.map(([value, label]) => (
                  <button
                    key={value} type="button"
                    onClick={() => setForm((f) => ({ ...f, moat: f.moat.includes(value) ? f.moat.filter((m) => m !== value) : [...f.moat, value] }))}
                    className={cx(
                      'rounded border px-2 py-1 text-2xs font-medium transition',
                      form.moat.includes(value) ? 'border-brass bg-brass/15 text-brass' : 'border-line text-ink-3 hover:border-line-strong',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="label mb-2">Measurable assumptions</p>
              <p className="mb-2 text-xs text-ink-3">
                Each row becomes a threshold the platform checks at every reporting date. This is what makes the
                thesis monitorable rather than a paragraph nobody revisits.
              </p>
              {form.assumptions.map((a, i) => (
                <div key={i} className="mb-2 grid grid-cols-[1fr_130px_90px_110px_32px] gap-2">
                  <Input
                    value={a.label} placeholder="EBITDA margin stays above 38%"
                    onChange={(e) => setForm((f) => ({ ...f, assumptions: f.assumptions.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) }))}
                  />
                  <Select
                    value={a.metric}
                    onChange={(e) => setForm((f) => ({ ...f, assumptions: f.assumptions.map((x, j) => (j === i ? { ...x, metric: e.target.value } : x)) }))}
                  >
                    {TRACKABLE_METRICS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </Select>
                  <Select
                    value={a.comparator}
                    onChange={(e) => setForm((f) => ({ ...f, assumptions: f.assumptions.map((x, j) => (j === i ? { ...x, comparator: e.target.value as 'GTE' | 'LTE' } : x)) }))}
                  >
                    <option value="GTE">at least</option>
                    <option value="LTE">at most</option>
                  </Select>
                  <NumberInput
                    value={a.target} step="0.01"
                    onValueChange={(v) => setForm((f) => ({ ...f, assumptions: f.assumptions.map((x, j) => (j === i ? { ...x, target: v } : x)) }))}
                  />
                  <Button size="sm" variant="ghost" onClick={() => setForm((f) => ({ ...f, assumptions: f.assumptions.filter((_, j) => j !== i) }))}>
                    <Icon.Close size={12} />
                  </Button>
                </div>
              ))}
              <Button
                size="xs" icon={<Icon.Plus size={11} />}
                onClick={() => setForm((f) => ({ ...f, assumptions: [...f.assumptions, { label: '', metric: 'ebitdaMargin', comparator: 'GTE' as const, target: 0.2 }] }))}
              >
                Add assumption
              </Button>
              <p className="mt-1.5 text-2xs text-ink-4">
                Percentages are entered as decimals: 0.38 means 38%. Multiples are entered as the multiple itself.
              </p>
            </div>

            {props.thesis ? (
              <Field label="Reason for the change" hint="Recorded against the target price history and the audit trail.">
                <Input value={form.changeReason} onChange={(e) => setForm((f) => ({ ...f, changeReason: e.target.value }))} placeholder="Rolled the DCF forward one year and lowered the WACC." />
              </Field>
            ) : null}

            <div className="flex justify-end gap-2 border-t border-line pt-3">
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              <Button variant="primary" onClick={save} loading={saving}>Save thesis</Button>
            </div>
          </div>
        </Panel>
      ) : null}

      {!editing && props.thesis ? (
        <>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <MetricCard label="Target price" value={props.thesis.targetPrice} format="currency" currency={props.currency} decimals={2} delta={upside} accent />
            <MetricCard label="Current price" value={props.currentPrice} format="currency" currency={props.currency} decimals={2} />
            <MetricCard label="Model fair value" value={props.modelFairValue} format="currency" currency={props.currency} decimals={2} sublabel="from the saved DCF" />
            <MetricCard label="Expected value" value={props.scenarios?.expectedValue ?? null} format="currency" currency={props.currency} decimals={2} delta={props.scenarios?.expectedUpside ?? null} sublabel="probability-weighted" />
            <MetricCard label="Risk / reward" value={props.scenarios?.riskReward ?? null} format="ratio" decimals={2} sublabel="bull upside ÷ bear downside" />
            <MetricCard label="Investment score" value={props.factorScores?.total ?? null} format="ratio" decimals={0} sublabel={props.factorScores ? `${formatPercent(props.factorScores.coverage, 0)} data coverage` : undefined} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <Panel>
                <PanelHeader
                  title="Investment thesis"
                  subtitle={`${props.thesis.authorName} · updated ${formatDate(props.thesis.updatedAt)} · ${props.thesis.timeHorizonMonths}-month horizon`}
                  actions={
                    <>
                      <RecommendationBadge value={props.thesis.recommendation} />
                      <ConvictionBadge value={props.thesis.conviction} />
                      {props.canEdit ? <Button size="xs" icon={<Icon.Edit size={11} />} onClick={() => setEditing(true)}>Edit</Button> : null}
                    </>
                  }
                />
                <p className="whitespace-pre-wrap text-base leading-relaxed text-ink-2">{props.thesis.coreThesis}</p>

                {props.thesis.growthDrivers.length ? (
                  <>
                    <p className="label mb-2 mt-4">Growth drivers</p>
                    <ol className="space-y-1.5">
                      {props.thesis.growthDrivers.map((d, i) => (
                        <li key={d} className="flex gap-2 text-base text-ink-2">
                          <span className="num mt-0.5 text-2xs text-ink-4">{i + 1}</span>{d}
                        </li>
                      ))}
                    </ol>
                  </>
                ) : null}

                {props.thesis.moat.length ? (
                  <>
                    <p className="label mb-2 mt-4">Sources of advantage</p>
                    <div className="flex flex-wrap gap-1.5">
                      {props.thesis.moat.map((m) => (
                        <Badge key={m} tone="brass">{MOAT_OPTIONS.find(([v]) => v === m)?.[1] ?? m}</Badge>
                      ))}
                    </div>
                  </>
                ) : null}
              </Panel>

              <div className="grid gap-3 lg:grid-cols-3">
                {([['Bull', props.thesis.bullCase, 'pos'], ['Base', props.thesis.baseCase, 'neutral'], ['Bear', props.thesis.bearCase, 'neg']] as const).map(([label, body, tone]) => {
                  const scenario = props.scenarios?.rows.find((r) => r.label === label);
                  return (
                    <Panel key={label}>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <Badge tone={tone}>{label} case</Badge>
                        {scenario ? <span className="num text-2xs text-ink-3">{formatPercent(scenario.probability, 0)}</span> : null}
                      </div>
                      {scenario ? (
                        <div className="mb-2 flex items-baseline gap-2">
                          <Num value={scenario.fairValue} format="currency" currency={props.currency} decimals={2} className="text-md font-semibold" />
                          <Num value={scenario.upside} format="percentSigned" className="text-2xs" />
                        </div>
                      ) : null}
                      <p className="text-xs leading-relaxed text-ink-2">{body || 'Not written.'}</p>
                    </Panel>
                  );
                })}
              </div>

              {props.scenarios ? (
                <BarSeriesChart
                  data={props.scenarios.rows.map((r) => ({ label: r.label, fairValue: r.fairValue }))}
                  xKey="label" height={200}
                  series={[{ key: 'fairValue', label: 'Fair value per share', format: 'currency', currency: props.currency }]}
                  referenceValue={props.currentPrice}
                  title="Scenario fair values"
                  subtitle="Derived from the saved DCF by shifting growth, margin, WACC and terminal growth"
                  yFormat="currency" currency={props.currency}
                  footnote="The dashed line is the current market price."
                />
              ) : null}

              <Panel padded={false}>
                <div className="flex items-center justify-between gap-2 p-3 pb-2">
                  <PanelHeader title="Catalyst timeline" subtitle="Dated events that could close the gap to the target." dense />
                  {props.canEdit ? <Button size="xs" icon={<Icon.Plus size={11} />} onClick={() => setCatalystModal(true)}>Add</Button> : null}
                </div>
                {props.catalysts.length === 0 ? (
                  <p className="px-3 pb-4 text-center text-xs text-ink-3">No catalysts recorded.</p>
                ) : (
                  <table className="w-full border-collapse text-base">
                    <thead>
                      <tr className="bg-raised">
                        <th className="label border-b border-line px-2.5 py-1.5 text-left">Date</th>
                        <th className="label border-b border-line px-2.5 py-1.5 text-left">Catalyst</th>
                        <th className="label border-b border-line px-2.5 py-1.5 text-left">Type</th>
                        <th className="label border-b border-line px-2.5 py-1.5 text-center">Impact</th>
                        <th className="label border-b border-line px-2.5 py-1.5 text-right">Probability</th>
                        <th className="label border-b border-line px-2.5 py-1.5 text-center">Status</th>
                        {props.canEdit ? <th className="border-b border-line" /> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {props.catalysts.map((c) => (
                        <tr key={c.id} className="border-b border-line/50">
                          <td className="px-2.5 py-1.5 num text-2xs text-ink-3">{c.expectedDate ? formatDate(c.expectedDate) : '—'}</td>
                          <td className="px-2.5 py-1.5">
                            <span className="block text-xs text-ink">{c.title}</span>
                            {c.notes ? <span className="block text-2xs text-ink-4">{c.notes}</span> : null}
                          </td>
                          <td className="px-2.5 py-1.5 text-2xs text-ink-3">{CATALYST_KINDS.find(([v]) => v === c.kind)?.[1] ?? c.kind}</td>
                          <td className="px-2.5 py-1.5 text-center">
                            <Badge tone={c.direction === 'POSITIVE' ? 'pos' : c.direction === 'NEGATIVE' ? 'neg' : 'warn'}>
                              {c.expectedImpact.toLowerCase()}
                            </Badge>
                          </td>
                          <td className="px-2.5 py-1.5 text-right"><Num value={c.probability} format="percent" decimals={0} /></td>
                          <td className="px-2.5 py-1.5 text-center"><Badge tone="outline">{c.status.toLowerCase()}</Badge></td>
                          {props.canEdit ? (
                            <td className="px-2.5 py-1.5 text-right">
                              <button type="button" onClick={() => removeCatalyst(c.id)} className="text-2xs text-ink-4 hover:text-neg">Remove</button>
                            </td>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Panel>

              <Panel padded={false}>
                <div className="flex items-center justify-between gap-2 p-3 pb-2">
                  <PanelHeader title="Risks" subtitle="Ranked by severity and probability." dense />
                  {props.canEdit ? <Button size="xs" icon={<Icon.Plus size={11} />} onClick={() => setRiskModal(true)}>Add</Button> : null}
                </div>
                {props.risks.length === 0 ? (
                  <p className="px-3 pb-4 text-center text-xs text-ink-3">No risks recorded. A thesis without recorded risks has not been stress-tested.</p>
                ) : (
                  <ul className="divide-y divide-line/60">
                    {props.risks
                      .slice()
                      .sort((a, b) => (b.severity === 'HIGH' ? 3 : b.severity === 'MEDIUM' ? 2 : 1) * b.probability - (a.severity === 'HIGH' ? 3 : a.severity === 'MEDIUM' ? 2 : 1) * a.probability)
                      .map((r) => (
                        <li key={r.id} className="px-3 py-2.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <SeverityBadge value={r.severity} />
                                <span className="text-2xs uppercase tracking-wider text-ink-4">
                                  {RISK_CATEGORIES.find(([v]) => v === r.category)?.[1] ?? r.category}
                                </span>
                                <span className="num text-2xs text-ink-3">{formatPercent(r.probability, 0)}</span>
                              </div>
                              <p className="mt-1 text-base text-ink-2">{r.title}</p>
                              {r.mitigation ? <p className="mt-0.5 text-2xs leading-relaxed text-ink-4">Mitigation: {r.mitigation}</p> : null}
                            </div>
                            {props.canEdit ? (
                              <button type="button" onClick={() => removeRisk(r.id)} className="shrink-0 text-2xs text-ink-4 hover:text-neg">Remove</button>
                            ) : null}
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </Panel>
            </div>

            <div className="space-y-4">
              <Panel>
                <PanelHeader
                  title="Thesis monitor"
                  subtitle="Checked against the reported figures at every period."
                  dense
                  actions={props.health ? <ThesisVerdictBadge verdict={props.health.verdict} /> : null}
                />
                {!props.health?.checks.length ? (
                  <InlineNote tone="warn">
                    No measurable assumptions are recorded, so nothing can be monitored. Edit the thesis and add at
                    least one threshold — that is what turns a written view into something the platform can check.
                  </InlineNote>
                ) : (
                  <>
                    <p className="mb-2 text-xs leading-relaxed text-ink-2">{props.health.summary}</p>
                    <ul className="space-y-2">
                      {props.health.checks.map((c) => (
                        <li key={c.label} className="rounded border border-line p-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <span className="min-w-0 text-xs text-ink-2">{c.label}</span>
                            <Badge tone={c.status === 'HOLDING' ? 'pos' : c.status === 'BREACHED' ? 'neg' : 'neutral'}>
                              {c.status === 'UNAVAILABLE' ? 'no data' : c.status.toLowerCase()}
                            </Badge>
                          </div>
                          <div className="mt-1 flex items-baseline gap-2 text-2xs text-ink-3">
                            <span>{c.metricLabel}</span>
                            <span className="num text-ink">{c.currentFormatted}</span>
                            <span>{c.comparator === 'GTE' ? 'against a floor of' : 'against a ceiling of'}</span>
                            <span className="num">{c.targetFormatted}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Panel>

              {props.factorScores ? (
                <Panel>
                  <PanelHeader title="Investment score" subtitle="Each component states the basis it was computed from." dense />
                  <div className="mb-3 flex items-baseline gap-2">
                    <Num value={props.factorScores.total} format="ratio" decimals={0} className="text-2xl font-semibold" />
                    <span className="text-xs text-ink-3">/ 100</span>
                  </div>
                  {props.factorScores.components.map((c) => (
                    <div key={c.key} className="mb-2">
                      <div className="flex items-baseline justify-between gap-2 text-xs">
                        <span className="text-ink-2" title={c.basis}>{c.label}</span>
                        <span className="flex items-baseline gap-2">
                          <span className="num text-2xs text-ink-4">{formatPercent(c.weight, 0)}</span>
                          <Num value={c.score} format="ratio" decimals={0} className="w-8 text-right" />
                        </span>
                      </div>
                      <div className="mt-1 h-[4px] rounded-full bg-sunken">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(0, Math.min(100, c.score ?? 0))}%` }} />
                      </div>
                    </div>
                  ))}
                  <p className="mt-2 text-2xs leading-relaxed text-ink-4">
                    Components without data are excluded and the remaining weights renormalised — coverage is stated
                    so a thin score is not read as a confident one.
                  </p>
                </Panel>
              ) : null}

              <Panel>
                <PanelHeader title="Target price history" subtitle="Every change with its stated reason." dense />
                {props.targetHistory.length === 0 ? (
                  <p className="py-3 text-center text-xs text-ink-3">No changes recorded yet.</p>
                ) : (
                  <ol className="relative space-y-3 border-l border-line pl-3.5">
                    {props.targetHistory.map((t) => (
                      <li key={t.id} className="relative">
                        <span className={cx(
                          'absolute -left-[19px] top-1.5 h-2 w-2 rounded-full',
                          t.previousTarget === null ? 'bg-accent' : t.targetPrice > t.previousTarget ? 'bg-pos' : 'bg-neg',
                        )} />
                        <div className="flex items-baseline gap-2">
                          <span className="num text-2xs text-ink-4">{formatDate(t.createdAt)}</span>
                          <RecommendationBadge value={t.recommendation} />
                        </div>
                        <p className="mt-0.5 text-xs text-ink">
                          {t.previousTarget === null ? (
                            <>Initiated at <Num value={t.targetPrice} format="currency" currency={props.currency} decimals={2} className="text-xs" /></>
                          ) : (
                            <>
                              <Num value={t.previousTarget} format="currency" currency={props.currency} decimals={2} className="text-xs" />
                              {' → '}
                              <Num value={t.targetPrice} format="currency" currency={props.currency} decimals={2} className="text-xs" />
                            </>
                          )}
                        </p>
                        <p className="mt-0.5 text-2xs leading-relaxed text-ink-3">{t.reason}</p>
                        <p className="text-2xs text-ink-4">{t.author}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </Panel>
            </div>
          </div>
        </>
      ) : null}

      <Modal
        open={catalystModal} onClose={() => setCatalystModal(false)}
        title="Add a catalyst"
        subtitle="A dated event with an expected impact and a probability."
        footer={<><Button variant="ghost" onClick={() => setCatalystModal(false)}>Cancel</Button><Button variant="primary" onClick={addCatalyst} disabled={catalystForm.title.trim().length < 3}>Add catalyst</Button></>}
      >
        <div className="space-y-3">
          <Field label="Title" required><Input value={catalystForm.title} onChange={(e) => setCatalystForm((f) => ({ ...f, title: e.target.value }))} placeholder="Capital markets day and distribution policy review" /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Type">
              <Select value={catalystForm.kind} onChange={(e) => setCatalystForm((f) => ({ ...f, kind: e.target.value }))}>
                {CATALYST_KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </Field>
            <Field label="Expected date"><Input type="date" value={catalystForm.expectedDate} onChange={(e) => setCatalystForm((f) => ({ ...f, expectedDate: e.target.value }))} /></Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Impact">
              <Select value={catalystForm.expectedImpact} onChange={(e) => setCatalystForm((f) => ({ ...f, expectedImpact: e.target.value }))}>
                <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
              </Select>
            </Field>
            <Field label="Direction">
              <Select value={catalystForm.direction} onChange={(e) => setCatalystForm((f) => ({ ...f, direction: e.target.value }))}>
                <option value="POSITIVE">Positive</option><option value="NEGATIVE">Negative</option><option value="UNCERTAIN">Uncertain</option>
              </Select>
            </Field>
            <Field label="Probability">
              <PercentInput value={catalystForm.probability} step={5} decimals={0} onValueChange={(v) => setCatalystForm((f) => ({ ...f, probability: v }))} />
            </Field>
          </div>
          <Field label="Notes"><Textarea value={catalystForm.notes} onChange={(e) => setCatalystForm((f) => ({ ...f, notes: e.target.value }))} rows={2} /></Field>
        </div>
      </Modal>

      <Modal
        open={riskModal} onClose={() => setRiskModal(false)}
        title="Record a risk"
        subtitle="What would break the thesis, how likely it is, and what you would do about it."
        footer={<><Button variant="ghost" onClick={() => setRiskModal(false)}>Cancel</Button><Button variant="primary" onClick={addRisk} disabled={riskForm.title.trim().length < 3}>Record risk</Button></>}
      >
        <div className="space-y-3">
          <Field label="Risk" required><Input value={riskForm.title} onChange={(e) => setRiskForm((f) => ({ ...f, title: e.target.value }))} placeholder="Chinese steel demand contracts faster than modelled" /></Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Category">
              <Select value={riskForm.category} onChange={(e) => setRiskForm((f) => ({ ...f, category: e.target.value }))}>
                {RISK_CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </Field>
            <Field label="Severity">
              <Select value={riskForm.severity} onChange={(e) => setRiskForm((f) => ({ ...f, severity: e.target.value }))}>
                <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
              </Select>
            </Field>
            <Field label="Probability">
              <PercentInput value={riskForm.probability} step={5} decimals={0} onValueChange={(v) => setRiskForm((f) => ({ ...f, probability: v }))} />
            </Field>
          </div>
          <Field label="Mitigation" hint="Position sizing, a hedge, or the indicator you would watch."><Textarea value={riskForm.mitigation} onChange={(e) => setRiskForm((f) => ({ ...f, mitigation: e.target.value }))} rows={2} /></Field>
        </div>
      </Modal>
    </div>
  );
}
