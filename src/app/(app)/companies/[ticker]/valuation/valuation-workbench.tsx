'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, cx, Field, InlineNote, NumberInput, PercentInput, Panel, PanelHeader,
  Segmented, Select, Tooltip, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { WaccBuilder } from './wacc-builder';
import { ReconciliationPanel } from './reconciliation-panel';
import { UnitModel } from './unit-model';
import { HeatmapTable } from '@/components/ui/table';
import { Bps, MetricCard, Num, StatRow } from '@/components/ui/values';
import { BarSeriesChart, WaterfallChart } from '@/components/charts';
import {
  axisRange, buildSensitivity, calculateDcf, normalizeAssumptions, reverseDcf,
  type DcfAssumptions, type SensitivityAxis,
} from '@/lib/finance/dcf';
import { deriveScenarioSet, runScenarios, type ScenarioDefinition } from '@/lib/finance/scenarios';
import { calculateSotp, type SotpInput } from '@/lib/finance/sotp';
import { expectedReturn, valuationBridge } from '@/lib/finance/expectedReturn';
import { formatDateTime, formatMultiple, formatPercent, DASH } from '@/lib/finance/format';
import { downloadText, toCsv } from '@/lib/import/csv';
import type { Currency } from '@/lib/finance/types';
import { isNum } from '@/lib/finance/core';

type Tab = 'model' | 'wacc' | 'units' | 'reconcile' | 'sensitivity' | 'reverse' | 'scenarios' | 'sotp' | 'bridge';

const AXIS_LABELS: Record<SensitivityAxis, string> = {
  WACC: 'WACC', TERMINAL_GROWTH: 'Terminal growth', EXIT_MULTIPLE: 'Exit multiple',
  REVENUE_GROWTH: 'Revenue growth', EBITDA_MARGIN: 'EBITDA margin',
  TAX_RATE: 'Tax rate', CAPEX_PCT: 'Capex % of revenue',
};

export function ValuationWorkbench(props: {
  ticker: string;
  companyName: string;
  companyId: string;
  currency: Currency;
  assumptions: DcfAssumptions | null;
  isSaved: boolean;
  modelId: string | null;
  modelName: string;
  modelUpdatedAt: string | null;
  modelAuthor: string;
  savedScenarios: ScenarioDefinition[] | null;
  sotpInput: SotpInput | null;
  sotpModelId: string | null;
  peerMedianEvEbitda: number | null;
  peerMedianPe: number | null;
  targetPrice: number | null;
  dividendYield: number;
  currentEvEbitda: number | null;
  canEdit: boolean;
  bankLike: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const { currency } = props;

  const [tab, setTab] = useState<Tab>('model');
  const [assumptions, setAssumptions] = useState<DcfAssumptions>(
    () => normalizeAssumptions(props.assumptions ?? {}),
  );
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [probabilities, setProbabilities] = useState({ bull: 0.25, base: 0.5, bear: 0.25 });
  const [sotp, setSotp] = useState<SotpInput | null>(props.sotpInput);
  const [exitMultipleBridge, setExitMultipleBridge] = useState<number>(props.peerMedianEvEbitda ?? props.currentEvEbitda ?? 7);

  const result = useMemo(() => calculateDcf(assumptions), [assumptions]);

  const patch = (next: Partial<DcfAssumptions>) => {
    setAssumptions((a) => normalizeAssumptions({ ...a, ...next }));
    setDirty(true);
  };
  const patchArray = (key: 'revenueGrowth' | 'ebitdaMargin', index: number, value: number) => {
    setAssumptions((a) => {
      const arr = [...a[key]];
      arr[index] = value;
      return normalizeAssumptions({ ...a, [key]: arr });
    });
    setDirty(true);
  };
  /**
   * Capex is a path, not a level: a company in an investment cycle spends more
   * than it depreciates now and cannot do so forever. Editing either end
   * rebuilds the fade between them rather than flattening it.
   */
  const patchCapexFade = (first: number | null, last: number | null) => {
    setAssumptions((a) => {
      const n = Math.max(a.revenueGrowth.length, 1);
      const start = first ?? a.capexPctRevenue[0] ?? 0;
      const end = last ?? a.capexPctRevenue[a.capexPctRevenue.length - 1] ?? start;
      const path = Array.from({ length: n }, (_, i) =>
        Math.round((start + (end - start) * ((i + 1) / n)) * 10000) / 10000);
      return normalizeAssumptions({ ...a, capexPctRevenue: path });
    });
    setDirty(true);
  };

  const patchSingle = (key: 'daPctRevenue' | 'capexPctRevenue' | 'nwcPctRevenue', value: number) => {
    setAssumptions((a) => normalizeAssumptions({ ...a, [key]: [value] }));
    setDirty(true);
  };

  const addYear = () => {
    setAssumptions((a) => normalizeAssumptions({
      ...a,
      revenueGrowth: [...a.revenueGrowth, a.revenueGrowth[a.revenueGrowth.length - 1] ?? 0.03],
      ebitdaMargin: [...a.ebitdaMargin, a.ebitdaMargin[a.ebitdaMargin.length - 1] ?? 0.2],
    }));
    setDirty(true);
  };
  const removeYear = () => {
    if (assumptions.revenueGrowth.length <= 3) return;
    setAssumptions((a) => normalizeAssumptions({
      ...a,
      revenueGrowth: a.revenueGrowth.slice(0, -1),
      ebitdaMargin: a.ebitdaMargin.slice(0, -1),
    }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/valuation/models', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: props.modelId, companyId: props.companyId, name: props.modelName,
          kind: 'DCF', assumptions,
          outputs: {
            fairValuePerShare: result.fairValuePerShare, upside: result.upside,
            enterpriseValue: result.enterpriseValue, equityValue: result.equityValue,
            wacc: assumptions.wacc, terminalGrowth: assumptions.terminalGrowth,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Could not save the model', description: data.error }); return; }
      toast.push({ tone: 'pos', title: 'Model saved', description: 'Assumption changes are recorded in the audit trail.' });
      setDirty(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setAssumptions(normalizeAssumptions(props.assumptions ?? {}));
    setDirty(false);
  };

  /* ------------------------------ Sensitivity ------------------------------ */

  const waccSteps = axisRange(assumptions.wacc, 0.005, 2);
  const growthSteps = axisRange(assumptions.terminalGrowth, 0.005, 2);
  const exitSteps = axisRange(assumptions.exitMultiple, Math.max(0.5, assumptions.exitMultiple * 0.1), 2);
  const revSteps = axisRange(assumptions.revenueGrowth[0] ?? 0.05, 0.02, 2);
  const marginSteps = axisRange(assumptions.ebitdaMargin[0] ?? 0.2, 0.02, 2);

  const gridWaccGrowth = useMemo(() => buildSensitivity(assumptions, 'WACC', waccSteps, 'TERMINAL_GROWTH', growthSteps), [assumptions, waccSteps, growthSteps]);
  const gridWaccExit = useMemo(() => buildSensitivity(assumptions, 'WACC', waccSteps, 'EXIT_MULTIPLE', exitSteps), [assumptions, waccSteps, exitSteps]);
  const gridGrowthMargin = useMemo(() => buildSensitivity(assumptions, 'REVENUE_GROWTH', revSteps, 'EBITDA_MARGIN', marginSteps), [assumptions, revSteps, marginSteps]);

  /* ------------------------------- Reverse DCF ------------------------------ */

  const [reversePrice, setReversePrice] = useState<number>(assumptions.currentPrice ?? 0);
  const reverse = useMemo(() => reverseDcf(assumptions, reversePrice), [assumptions, reversePrice]);

  /* ------------------------------- Scenarios ------------------------------- */

  const scenarioDefs = useMemo(() => {
    const base = props.savedScenarios?.length
      ? props.savedScenarios.map((s) => ({ ...s, assumptions: s.key === 'BASE' ? assumptions : s.assumptions }))
      : deriveScenarioSet(assumptions, { probabilities });
    return base.map((s) => ({
      ...s,
      probability: s.key === 'BULL' ? probabilities.bull : s.key === 'BEAR' ? probabilities.bear : probabilities.base,
    }));
  }, [assumptions, probabilities, props.savedScenarios]);

  const scenarioAnalysis = useMemo(
    () => runScenarios(scenarioDefs, assumptions.currentPrice ?? null),
    [scenarioDefs, assumptions.currentPrice],
  );

  /* ---------------------------------- SOTP --------------------------------- */

  const sotpResult = useMemo(() => (sotp ? calculateSotp(sotp) : null), [sotp]);

  /* --------------------------------- Bridge -------------------------------- */

  const bridge = useMemo(
    () => valuationBridge({
      currentPrice: assumptions.currentPrice ?? 0,
      earningsGrowth: assumptions.revenueGrowth[0] ?? 0.05,
      currentMultiple: props.currentEvEbitda,
      exitMultiple: exitMultipleBridge,
      dividendYield: props.dividendYield,
      shareCountChange: 0,
      years: 3,
    }),
    [assumptions, props.currentEvEbitda, exitMultipleBridge, props.dividendYield],
  );

  const expected = useMemo(
    () => expectedReturn({
      currentPrice: assumptions.currentPrice ?? 0,
      targetPrice: props.targetPrice ?? result.fairValuePerShare,
      dividendYield: props.dividendYield,
      years: 1,
    }),
    [assumptions.currentPrice, props.targetPrice, props.dividendYield, result.fairValuePerShare],
  );

  const exportForecastCsv = () => {
    downloadText(
      `${props.ticker}-dcf-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(
        ['Line', ...result.years.map((y) => String(y.year))],
        [
          ['Revenue', ...result.years.map((y) => y.revenue)],
          ['Revenue growth', ...result.years.map((y) => y.revenueGrowth)],
          ['EBITDA margin', ...result.years.map((y) => y.ebitdaMargin)],
          ['EBITDA', ...result.years.map((y) => y.ebitda)],
          ['D&A', ...result.years.map((y) => y.da)],
          ['EBIT', ...result.years.map((y) => y.ebit)],
          ['Taxes', ...result.years.map((y) => y.taxes)],
          ['NOPAT', ...result.years.map((y) => y.nopat)],
          ['Capex', ...result.years.map((y) => y.capex)],
          ['Change in NWC', ...result.years.map((y) => y.nwcChange)],
          ['FCFF', ...result.years.map((y) => y.fcff)],
          ['Discount factor', ...result.years.map((y) => y.discountFactor)],
          ['PV of FCFF', ...result.years.map((y) => y.presentValue)],
        ],
      ),
    );
  };

  const heat = (grid: typeof gridWaccGrowth, rowFmt: (v: number) => string, colFmt: (v: number) => string, rowAxis: SensitivityAxis, colAxis: SensitivityAxis) => (
    <HeatmapTable
      rowTitle={AXIS_LABELS[rowAxis]}
      colTitle={AXIS_LABELS[colAxis]}
      rowLabels={grid.rowValues.map(rowFmt)}
      colLabels={grid.colValues.map(colFmt)}
      cells={grid.cells.map((row) => row.map((c) => c.fairValue))}
      centerValue={result.fairValuePerShare}
      formatCell={(v) => (isNum(v) ? (v as number).toFixed(2) : DASH)}
    />
  );

  const tabs: { value: Tab; label: string }[] = [
    { value: 'model', label: 'Model' },
    { value: 'wacc', label: 'WACC build' },
    { value: 'units', label: 'Unit model' },
    { value: 'reconcile', label: 'Reconciliation' },
    { value: 'sensitivity', label: 'Sensitivity' },
    { value: 'reverse', label: 'Reverse DCF' },
    { value: 'scenarios', label: 'Bull / base / bear' },
    { value: 'sotp', label: 'SOTP by multiples' },
    { value: 'bridge', label: 'Expected return' },
  ];

  return (
    <div className="space-y-4">
      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented value={tab} onChange={(v) => setTab(v as Tab)} options={tabs} />
          {props.isSaved ? (
            <Tooltip content={`Last saved by ${props.modelAuthor}${props.modelUpdatedAt ? ` on ${formatDateTime(props.modelUpdatedAt)}` : ''}`}>
              <Badge tone="outline">Saved model</Badge>
            </Tooltip>
          ) : (
            <Tooltip content="These assumptions were initialised from the company's own reported history. Save to keep them.">
              <Badge tone="warn">Unsaved draft</Badge>
            </Tooltip>
          )}
          {dirty ? <Badge tone="accent">Unsaved changes</Badge> : null}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" icon={<Icon.Download size={12} />} onClick={exportForecastCsv}>CSV</Button>
          <Button size="sm" icon={<Icon.Download size={12} />} onClick={() => window.open(`/api/export/dcf?ticker=${props.ticker}&assumptions=${encodeURIComponent(JSON.stringify(assumptions))}`, '_blank')}>
            Excel
          </Button>
          {props.canEdit ? (
            <>
              {dirty ? <Button size="sm" variant="ghost" onClick={reset}>Reset</Button> : null}
              <Button size="sm" variant="primary" icon={<Icon.Save size={12} />} onClick={save} loading={saving} disabled={!dirty && props.isSaved}>
                Save model
              </Button>
            </>
          ) : (
            <Badge tone="outline">Read-only role</Badge>
          )}
        </div>
      </div>

      {/* Headline outputs — always visible */}
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="Fair value / share" value={result.fairValuePerShare} format="currency" currency={currency} decimals={2} accent
          sublabel={`vs ${formatPercent(result.upside, 1, { signed: true })} to price`} />
        <MetricCard label="Enterprise value" value={result.enterpriseValue} format="currencyMillions" currency={currency} />
        <MetricCard label="Equity value" value={result.equityValue} format="currencyMillions" currency={currency}
          sublabel="after net debt and minority interest" />
        <MetricCard label="Terminal value share" value={result.terminalValuePctOfEv} format="percent"
          sublabel="of enterprise value" tooltip="A high share means the valuation rests on perpetuity assumptions rather than the explicit forecast." />
        <MetricCard label="Implied exit multiple" value={result.impliedExitMultiple} format="multiple"
          sublabel={props.peerMedianEvEbitda ? `peer median ${formatMultiple(props.peerMedianEvEbitda)}` : undefined} />
        <MetricCard label="Expected return" value={expected.totalReturn} format="percentSigned"
          sublabel={`incl. ${formatPercent(props.dividendYield)} dividend`} />
      </div>

      {result.warnings.length ? (
        <div className="space-y-2">
          {result.warnings.map((w) => <InlineNote key={w} tone="warn">{w}</InlineNote>)}
        </div>
      ) : null}

      {props.bankLike ? (
        <InlineNote tone="info">
          This is a deposit-funded institution. A free-cash-flow-to-firm model is not the standard approach for
          a bank — a dividend discount or excess-return model is. The model below still runs, but read its
          output as an approximation and lean on the P/E and P/B comparison in the comps tab.
        </InlineNote>
      ) : null}

      {tab === 'model' ? (
        <ModelTab
          assumptions={assumptions} result={result} currency={currency}
          canEdit={props.canEdit}
          patch={patch} patchArray={patchArray} patchSingle={patchSingle} patchCapexFade={patchCapexFade}
          addYear={addYear} removeYear={removeYear}
          peerMedianEvEbitda={props.peerMedianEvEbitda}
        />
      ) : null}

      {tab === 'sensitivity' ? (
        <div className="space-y-4">
          <InlineNote tone="info">
            Each grid re-runs the whole model for every cell. The centre cell is the current model; colour is
            relative to it, and the numbers are fair value per share in {currency}.
          </InlineNote>
          <div className="grid gap-4 xl:grid-cols-2">
            <Panel padded={false}>
              <div className="p-3 pb-2"><PanelHeader title="WACC × terminal growth" subtitle="The two assumptions the terminal value is most sensitive to" dense /></div>
              {heat(gridWaccGrowth, (v) => formatPercent(v, 2), (v) => formatPercent(v, 2), 'WACC', 'TERMINAL_GROWTH')}
            </Panel>
            <Panel padded={false}>
              <div className="p-3 pb-2"><PanelHeader title="WACC × exit multiple" subtitle="Terminal value on an exit multiple rather than a perpetuity" dense /></div>
              {heat(gridWaccExit, (v) => formatPercent(v, 2), (v) => formatMultiple(v), 'WACC', 'EXIT_MULTIPLE')}
            </Panel>
          </div>
          <Panel padded={false}>
            <div className="p-3 pb-2"><PanelHeader title="Revenue growth × EBITDA margin" subtitle="Operating assumptions held flat across the forecast" dense /></div>
            {heat(gridGrowthMargin, (v) => formatPercent(v, 1), (v) => formatPercent(v, 1), 'REVENUE_GROWTH', 'EBITDA_MARGIN')}
          </Panel>
          <Panel>
            <PanelHeader title="Upside grid" subtitle="The same WACC × terminal growth grid expressed as upside against the current price" dense />
            <HeatmapTable
              rowTitle="WACC" colTitle="Terminal growth"
              rowLabels={gridWaccGrowth.rowValues.map((v) => formatPercent(v, 2))}
              colLabels={gridWaccGrowth.colValues.map((v) => formatPercent(v, 2))}
              cells={gridWaccGrowth.cells.map((row) => row.map((c) => c.upside))}
              centerValue={0}
              formatCell={(v) => (isNum(v) ? formatPercent(v, 0, { signed: true }) : DASH)}
            />
          </Panel>
        </div>
      ) : null}

      {tab === 'reverse' ? (
        <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <Panel>
            <PanelHeader title="What does the price imply?" subtitle="Solve the model backwards from a price you choose." dense />
            <Field label={`Price (${currency})`} hint="Defaults to the current market price.">
              <NumberInput value={reversePrice} onValueChange={setReversePrice} step="0.01" />
            </Field>
            <div className="mt-2 flex gap-2">
              <Button size="xs" onClick={() => setReversePrice(assumptions.currentPrice ?? 0)}>Market price</Button>
              {isNum(result.fairValuePerShare) ? (
                <Button size="xs" onClick={() => setReversePrice(result.fairValuePerShare as number)}>Model fair value</Button>
              ) : null}
              {isNum(props.targetPrice) ? (
                <Button size="xs" onClick={() => setReversePrice(props.targetPrice as number)}>Target price</Button>
              ) : null}
            </div>
            <div className="mt-4 border-t border-line pt-3">
              <p className="text-xs leading-relaxed text-ink-3">{reverse.message}</p>
            </div>
          </Panel>

          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Implied revenue CAGR" value={reverse.impliedRevenueCagr} format="percent"
                sublabel={`model assumes ${formatPercent(assumptions.revenueGrowth[0])}`} accent />
              <MetricCard label="Implied EBITDA margin" value={reverse.impliedEbitdaMargin} format="percent"
                sublabel={`model assumes ${formatPercent(assumptions.ebitdaMargin[0])}`} />
              <MetricCard label="Implied terminal growth" value={reverse.impliedTerminalGrowth} format="percent"
                sublabel={`model assumes ${formatPercent(assumptions.terminalGrowth)}`} />
              <MetricCard label="Implied exit multiple" value={reverse.impliedExitMultiple} format="multiple"
                sublabel={props.peerMedianEvEbitda ? `peer median ${formatMultiple(props.peerMedianEvEbitda)}` : undefined} />
            </div>

            <Panel>
              <PanelHeader title="Reading the result" dense />
              <ul className="space-y-2 text-base leading-relaxed text-ink-2">
                {isNum(reverse.impliedRevenueCagr) ? (
                  <li className="flex gap-2">
                    <Icon.ArrowRight size={13} className="mt-1 shrink-0 text-accent" />
                    <span>
                      Holding every other assumption constant, a price of{' '}
                      <Num value={reversePrice} format="currency" currency={currency} decimals={2} className="text-base" /> requires
                      revenue to compound at <strong className="text-ink">{formatPercent(reverse.impliedRevenueCagr)}</strong> across the forecast window.
                    </span>
                  </li>
                ) : null}
                {isNum(reverse.impliedEbitdaMargin) ? (
                  <li className="flex gap-2">
                    <Icon.ArrowRight size={13} className="mt-1 shrink-0 text-accent" />
                    <span>
                      Alternatively, at the modelled growth rate the same price requires an EBITDA margin of{' '}
                      <strong className="text-ink">{formatPercent(reverse.impliedEbitdaMargin)}</strong>.
                    </span>
                  </li>
                ) : null}
                {isNum(reverse.impliedRoic) ? (
                  <li className="flex gap-2">
                    <Icon.ArrowRight size={13} className="mt-1 shrink-0 text-accent" />
                    <span>
                      The reinvestment implied by the terminal assumptions corresponds to a return on new capital of{' '}
                      <strong className="text-ink">{formatPercent(reverse.impliedRoic)}</strong>.
                    </span>
                  </li>
                ) : null}
                <li className="flex gap-2">
                  <Icon.Info size={13} className="mt-1 shrink-0 text-ink-4" />
                  <span className="text-ink-3">
                    Each figure solves one input at a time. The useful question is not whether the model is right,
                    but whether the operating performance the price requires is achievable.
                  </span>
                </li>
              </ul>
            </Panel>
          </div>
        </div>
      ) : null}

      {tab === 'scenarios' ? (
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {scenarioAnalysis.scenarios.map((s) => (
              <MetricCard
                key={s.key}
                label={s.label}
                value={s.fairValue} format="currency" currency={currency} decimals={2}
                delta={s.upside}
                sublabel={`${formatPercent(s.probability, 0)} probability`}
                accent={s.key === 'BASE'}
              />
            ))}
            <MetricCard
              label="Expected value"
              value={scenarioAnalysis.expectedValue} format="currency" currency={currency} decimals={2}
              delta={scenarioAnalysis.expectedUpside}
              sublabel="probability-weighted"
              accent
            />
          </div>

          {!scenarioAnalysis.probabilitiesValid ? (
            <InlineNote tone="warn">
              The probabilities sum to {formatPercent(scenarioAnalysis.probabilityTotal, 0)}. The expected value
              below is renormalised, but the weights should add to 100%.
            </InlineNote>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <Panel>
              <PanelHeader title="Probabilities" subtitle="How much weight each case carries." dense />
              {(['bull', 'base', 'bear'] as const).map((k) => (
                <Field key={k} label={k === 'bull' ? 'Bull' : k === 'base' ? 'Base' : 'Bear'} className="mb-2">
                  <PercentInput value={probabilities[k]} step={0.5} decimals={0}
                onValueChange={(v) => setProbabilities((p) => ({ ...p, [k]: v }))} />
                </Field>
              ))}
              <div className="mt-3 border-t border-line pt-3">
                <StatRow label="Risk / reward" hint="Upside to the bull case divided by downside to the bear case." value={<Num value={scenarioAnalysis.riskReward} format="ratio" decimals={2} />} />
                <StatRow label="Dispersion" hint="Bull minus bear, as a share of the current price." value={<Num value={scenarioAnalysis.dispersion} format="percent" />} />
              </div>
            </Panel>

            <div className="space-y-4">
              <BarSeriesChart
                data={scenarioAnalysis.scenarios.map((s) => ({ label: s.label, fairValue: s.fairValue }))}
                xKey="label"
                series={[{ key: 'fairValue', label: 'Fair value per share', format: 'currency', currency }]}
                title="Fair value by scenario"
                subtitle="The dashed line marks the current market price"
                referenceValue={assumptions.currentPrice}
                yFormat="currency" currency={currency} height={220}
                footnote="The dashed line is the current market price."
              />
              <Panel padded={false}>
                <div className="p-3 pb-2"><PanelHeader title="Assumptions by scenario" dense /></div>
                <div className="overflow-auto">
                  <table className="w-full border-collapse text-base">
                    <thead>
                      <tr>
                        <th className="label border-b border-line px-2.5 py-1.5 text-left">Assumption</th>
                        {scenarioAnalysis.scenarios.map((s) => (
                          <th key={s.key} className="label border-b border-line px-2.5 py-1.5 text-right">{s.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {([
                        ['Revenue growth (year 1)', (a: DcfAssumptions) => a.revenueGrowth[0], 'percent'],
                        ['EBITDA margin (year 1)', (a: DcfAssumptions) => a.ebitdaMargin[0], 'percent'],
                        ['WACC', (a: DcfAssumptions) => a.wacc, 'percent'],
                        ['Terminal growth', (a: DcfAssumptions) => a.terminalGrowth, 'percent'],
                      ] as const).map(([label, pick, fmt]) => (
                        <tr key={label} className="border-b border-line/50">
                          <td className="px-2.5 py-1 text-ink-2">{label}</td>
                          {scenarioAnalysis.scenarios.map((s) => (
                            <td key={s.key} className="px-2.5 py-1 text-right">
                              <Num value={pick(s.result.assumptions)} format={fmt} />
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="border-b border-line/50 font-medium">
                        <td className="px-2.5 py-1 text-ink">Fair value per share</td>
                        {scenarioAnalysis.scenarios.map((s) => (
                          <td key={s.key} className="px-2.5 py-1 text-right"><Num value={s.fairValue} format="currency" currency={currency} decimals={2} /></td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-2.5 py-1 text-ink">Upside</td>
                        {scenarioAnalysis.scenarios.map((s) => (
                          <td key={s.key} className="px-2.5 py-1 text-right"><Num value={s.upside} format="percentSigned" /></td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'sotp' ? (
        <SotpTab
          sotp={sotp} setSotp={(next) => { setSotp(next); }} result={sotpResult}
          currency={currency} canEdit={props.canEdit} ticker={props.ticker}
        />
      ) : null}

      {tab === 'wacc' ? (
        <WaccBuilder
          ticker={props.ticker}
          modelId={props.modelId}
          currency={currency}
          canEdit={props.canEdit}
          currentModelWacc={assumptions.wacc}
          onApply={(wacc) => { patch({ wacc }); setTab('model'); }}
        />
      ) : null}

      {tab === 'units' ? (
        <UnitModel
          ticker={props.ticker}
          modelId={props.modelId}
          currency={currency}
          canEdit={props.canEdit}
          assumptions={assumptions}
          singleStreamValue={result.fairValuePerShare}
        />
      ) : null}

      {tab === 'reconcile' ? (
        <ReconciliationPanel
          ticker={props.ticker}
          modelId={props.modelId}
          currency={currency}
          canEdit={props.canEdit}
          assumptions={assumptions}
        />
      ) : null}

      {tab === 'bridge' ? (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <Panel>
              <PanelHeader title="Bridge assumptions" subtitle="Three-year horizon" dense />
              <StatRow label="Starting price" value={<Num value={assumptions.currentPrice} format="currency" currency={currency} decimals={2} />} />
              <StatRow label="Earnings growth" value={<Num value={assumptions.revenueGrowth[0]} format="percent" />} />
              <StatRow label="Current EV/EBITDA" value={<Num value={props.currentEvEbitda} format="multiple" />} />
              <Field label="Exit multiple" className="mt-2">
                <NumberInput value={exitMultipleBridge} onValueChange={setExitMultipleBridge} step="0.1" suffix="x" />
              </Field>
              <StatRow label="Dividend yield" value={<Num value={props.dividendYield} format="percent" />} />
              <div className="mt-3 border-t border-line pt-3">
                <StatRow label="Total return (3Y)" value={<Num value={bridge.totalReturn} format="percentSigned" className="font-semibold" />} />
                <StatRow label="Annualised" value={<Num value={bridge.annualizedReturn} format="percentSigned" />} />
              </div>
            </Panel>

            <WaterfallChart
              steps={[
                { label: 'Current price', value: bridge.startPrice, kind: 'total' },
                { label: 'Earnings growth', value: bridge.earningsGrowthContribution ?? 0 },
                { label: 'Multiple change', value: bridge.multipleChangeContribution ?? 0 },
                { label: 'Dividends', value: bridge.dividendContribution ?? 0 },
                { label: 'Dilution', value: bridge.dilutionContribution ?? 0 },
                { label: 'Expected value', value: (bridge.endPrice ?? 0) + (bridge.dividendContribution ?? 0), kind: 'total' },
              ]}
              title="Where the return comes from"
              subtitle="Decomposition of the expected three-year return, in price units"
              format="currency" currency={currency} height={280}
              footnote="Growth and re-rating compound; dividends are additive. A negative multiple bar is a de-rating."
            />
          </div>

          <Panel>
            <PanelHeader title="Expected return against the target price" dense />
            <div className="grid gap-3 sm:grid-cols-4">
              <StatRow label="Target price" value={<Num value={props.targetPrice ?? result.fairValuePerShare} format="currency" currency={currency} decimals={2} />} />
              <StatRow label="Price appreciation" value={<Num value={expected.priceAppreciation} format="percentSigned" />} />
              <StatRow label="Dividend yield" value={<Num value={expected.dividendYield} format="percent" />} />
              <StatRow label="Total return" value={<Num value={expected.totalReturn} format="percentSigned" className="font-semibold" />} />
            </div>
            {!isNum(props.targetPrice) ? (
              <InlineNote tone="info">
                No target price is recorded in the thesis for {props.ticker}, so the model fair value is used instead.
              </InlineNote>
            ) : null}
          </Panel>
        </div>
      ) : null}
    </div>
  );
}

/* ============================ Model tab ============================ */

function ModelTab({
  assumptions, result, currency, canEdit, patch, patchArray, patchSingle, patchCapexFade, addYear, removeYear, peerMedianEvEbitda,
}: {
  assumptions: DcfAssumptions;
  result: ReturnType<typeof calculateDcf>;
  currency: Currency;
  canEdit: boolean;
  patch: (next: Partial<DcfAssumptions>) => void;
  patchArray: (key: 'revenueGrowth' | 'ebitdaMargin', index: number, value: number) => void;
  patchSingle: (key: 'daPctRevenue' | 'capexPctRevenue' | 'nwcPctRevenue', value: number) => void;
  patchCapexFade: (first: number | null, last: number | null) => void;
  addYear: () => void;
  removeYear: () => void;
  peerMedianEvEbitda: number | null;
}) {
  const rows: { label: string; formula?: string; pick: (y: (typeof result.years)[number]) => number | null; format: 'currencyMillions' | 'percent' | 'ratio'; emphasis?: boolean; editable?: 'revenueGrowth' | 'ebitdaMargin' }[] = [
    { label: 'Revenue', pick: (y) => y.revenue, format: 'currencyMillions', emphasis: true },
    { label: 'Revenue growth %', pick: (y) => y.revenueGrowth, format: 'percent', editable: 'revenueGrowth' },
    { label: 'EBITDA margin %', pick: (y) => y.ebitdaMargin, format: 'percent', editable: 'ebitdaMargin' },
    { label: 'EBITDA', formula: 'Revenue × EBITDA margin', pick: (y) => y.ebitda, format: 'currencyMillions', emphasis: true },
    { label: 'D&A', formula: 'Revenue × D&A %', pick: (y) => -y.da, format: 'currencyMillions' },
    { label: 'EBIT', formula: 'EBITDA − D&A', pick: (y) => y.ebit, format: 'currencyMillions', emphasis: true },
    { label: 'Taxes', formula: 'EBIT × tax rate (no benefit on losses)', pick: (y) => -y.taxes, format: 'currencyMillions' },
    { label: 'NOPAT', formula: 'EBIT × (1 − tax rate)', pick: (y) => y.nopat, format: 'currencyMillions', emphasis: true },
    { label: 'Plus D&A', pick: (y) => y.da, format: 'currencyMillions' },
    { label: 'Less capex', formula: 'Revenue × capex %', pick: (y) => -y.capex, format: 'currencyMillions' },
    { label: 'Less change in NWC', formula: 'NWC(t) − NWC(t−1)', pick: (y) => -y.nwcChange, format: 'currencyMillions' },
    { label: 'FCFF', formula: 'EBIT × (1−T) + D&A − capex − ΔNWC', pick: (y) => y.fcff, format: 'currencyMillions', emphasis: true },
    { label: 'Discount factor', formula: '1 ÷ (1 + WACC)^t', pick: (y) => y.discountFactor, format: 'ratio' },
    { label: 'PV of FCFF', formula: 'FCFF × discount factor', pick: (y) => y.presentValue, format: 'currencyMillions', emphasis: true },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-4">
        <Panel>
          <PanelHeader title="Assumptions" subtitle="Change any input; the model re-runs immediately." dense />
          <div className="space-y-2.5">
            <Field label="WACC" hint="Weighted average cost of capital.">
              <PercentInput value={assumptions.wacc} step={0.25} decimals={2} disabled={!canEdit}
                onValueChange={(v) => patch({ wacc: v })} />
            </Field>
            <Field label="Tax rate">
              <PercentInput value={assumptions.taxRate} step={0.5} decimals={1} disabled={!canEdit}
                onValueChange={(v) => patch({ taxRate: v })} />
            </Field>
            <Field label="Terminal method">
              <Select
                value={assumptions.terminalMethod} disabled={!canEdit}
                onChange={(e) => patch({ terminalMethod: e.target.value as DcfAssumptions['terminalMethod'] })}
              >
                <option value="GORDON">Gordon growth (perpetuity)</option>
                <option value="EXIT_MULTIPLE">Exit multiple on EBITDA</option>
              </Select>
            </Field>
            {assumptions.terminalMethod === 'GORDON' ? (
              <Field label="Terminal growth" hint="Must be below the WACC for the perpetuity to be defined.">
                <PercentInput value={assumptions.terminalGrowth} step={0.25} decimals={2} disabled={!canEdit}
                onValueChange={(v) => patch({ terminalGrowth: v })} />
              </Field>
            ) : (
              <Field label="Exit multiple" hint={peerMedianEvEbitda ? `Peer median EV/EBITDA is ${formatMultiple(peerMedianEvEbitda)}.` : undefined}>
                <NumberInput value={assumptions.exitMultiple} step="0.25" disabled={!canEdit}
                  onValueChange={(v) => patch({ exitMultiple: v })} suffix="x" />
              </Field>
            )}
            <Field label="D&A % of revenue">
              <PercentInput value={assumptions.daPctRevenue[0]} step={0.5} decimals={1} disabled={!canEdit}
                onValueChange={(v) => patchSingle('daPctRevenue', v)} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Capex, year 1" hint="% of revenue">
                <PercentInput value={assumptions.capexPctRevenue[0]} step={0.5} decimals={1} disabled={!canEdit}
                  onValueChange={(v) => patchCapexFade(v, null)} />
              </Field>
              <Field
                label="Capex, terminal"
                hint={
                  assumptions.capexPctRevenue[assumptions.capexPctRevenue.length - 1] > assumptions.daPctRevenue[0] * 1.25
                    ? 'Above depreciation forever grows the asset base without bound.'
                    : '% of revenue'
                }
              >
                <PercentInput
                  value={assumptions.capexPctRevenue[assumptions.capexPctRevenue.length - 1]}
                  step={0.5} decimals={1} disabled={!canEdit}
                  onValueChange={(v) => patchCapexFade(null, v)} />
              </Field>
            </div>
            <Field label="NWC % of revenue" hint="Change in this level drives the working-capital cash flow.">
              <PercentInput value={assumptions.nwcPctRevenue[0]} step={0.5} decimals={1} disabled={!canEdit}
                onValueChange={(v) => patchSingle('nwcPctRevenue', v)} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label={`Net debt (${currency} mn)`}>
                <NumberInput value={assumptions.netDebt} step="1" disabled={!canEdit} onValueChange={(v) => patch({ netDebt: v })} />
              </Field>
              <Field label="Minority interest">
                <NumberInput value={assumptions.minorityInterest ?? 0} step="1" disabled={!canEdit} onValueChange={(v) => patch({ minorityInterest: v })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Shares (mn)">
                <NumberInput value={assumptions.sharesOutstanding} step="1" disabled={!canEdit} onValueChange={(v) => patch({ sharesOutstanding: v })} />
              </Field>
              <Field label={`Price (${currency})`}>
                <NumberInput value={assumptions.currentPrice ?? 0} step="0.01" disabled={!canEdit} onValueChange={(v) => patch({ currentPrice: v })} />
              </Field>
            </div>
            <label className="flex items-center gap-2 pt-1 text-xs text-ink-2">
              <input
                type="checkbox" checked={!!assumptions.midYearConvention} disabled={!canEdit}
                onChange={(e) => patch({ midYearConvention: e.target.checked })}
                className="h-3.5 w-3.5 accent-[rgb(var(--m-accent))]"
              />
              Mid-year discounting convention
            </label>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Enterprise to equity bridge" dense />
          <StatRow label="Sum of PV(FCFF)" value={<Num value={result.sumPvFcff} format="currencyMillions" currency={currency} />} />
          <StatRow label="Terminal value" value={<Num value={result.terminalValue} format="currencyMillions" currency={currency} />} />
          <StatRow label="PV of terminal value" value={<Num value={result.pvTerminalValue} format="currencyMillions" currency={currency} />} />
          <StatRow label="Enterprise value" value={<Num value={result.enterpriseValue} format="currencyMillions" currency={currency} className="font-medium" />} />
          <StatRow label="Less net debt" value={<Num value={-result.netDebt} format="currencyMillions" currency={currency} />} />
          <StatRow label="Less minority interest" value={<Num value={-result.minorityInterest} format="currencyMillions" currency={currency} />} />
          <StatRow label="Equity value" value={<Num value={result.equityValue} format="currencyMillions" currency={currency} className="font-medium" />} />
          <StatRow label="÷ shares outstanding" value={<Num value={result.sharesOutstanding} format="shares" />} />
          <div className="mt-1 border-t border-line pt-2">
            <StatRow label="Fair value per share" value={<Num value={result.fairValuePerShare} format="currency" currency={currency} decimals={2} className="text-md font-semibold" />} />
            <StatRow label="Current price" value={<Num value={result.currentPrice} format="currency" currency={currency} decimals={2} />} />
            <StatRow label="Upside" value={<Num value={result.upside} format="percentSigned" className="font-medium" />} />
          </div>
        </Panel>
      </div>

      <Panel padded={false}>
        <div className="flex items-center justify-between gap-2 p-3 pb-2">
          <PanelHeader
            title="Forecast"
            subtitle={`${result.years.length} explicit years in ${currency} millions. Hover a line to see its formula.`}
            dense
          />
          {canEdit ? (
            <div className="flex items-center gap-1">
              <Button size="xs" icon={<Icon.Plus size={11} />} onClick={addYear}>Year</Button>
              <Button size="xs" variant="ghost" onClick={removeYear} disabled={assumptions.revenueGrowth.length <= 3}>Remove</Button>
            </div>
          ) : null}
        </div>
        <div className="overflow-auto">
          <table className="w-full border-collapse text-base">
            <thead className="sticky top-0 z-10">
              <tr className="bg-raised">
                <th className="label sticky left-0 z-20 border-b border-line bg-raised px-2.5 py-1.5 text-left min-w-[190px]">Line</th>
                {result.years.map((y) => (
                  <th key={y.year} className="label border-b border-line bg-raised px-2.5 py-1.5 text-right min-w-[104px]">{y.year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-line/50 hover:bg-raised">
                  <td className={cx('sticky left-0 bg-panel px-2.5 py-1', r.emphasis ? 'font-medium text-ink' : 'text-ink-2')}>
                    {r.formula ? (
                      <Tooltip content={<span className="num">{r.formula}</span>}>
                        <span className="cursor-help border-b border-dotted border-ink-4">{r.label}</span>
                      </Tooltip>
                    ) : r.label}
                  </td>
                  {result.years.map((y, i) => (
                    <td key={y.year} className="px-2.5 py-1 text-right">
                      {r.editable && canEdit ? (
                        <PercentCell
                          value={assumptions[r.editable][Math.min(i, assumptions[r.editable].length - 1)]}
                          onChange={(v) => patchArray(r.editable!, i, v)}
                        />
                      ) : (
                        <Num
                          value={r.pick(y)} format={r.format} currency={currency}
                          decimals={r.format === 'ratio' ? 4 : undefined}
                          className={r.emphasis ? 'font-medium' : undefined}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-3 py-2 text-2xs text-ink-4">
          Editable cells are shown with a hover border. Growth and margin can be set year by year; D&amp;A, capex and
          working capital are held at a constant share of revenue and are edited in the assumptions panel.
        </div>
      </Panel>
    </div>
  );
}

/* ============================= SOTP tab ============================= */

function SotpTab({
  sotp, setSotp, result, currency, canEdit, ticker,
}: {
  sotp: SotpInput | null;
  setSotp: (next: SotpInput) => void;
  result: ReturnType<typeof calculateSotp> | null;
  currency: Currency;
  canEdit: boolean;
  ticker: string;
}) {
  if (!sotp || !result) {
    return (
      <Panel>
        <PanelHeader title="Sum of the parts" dense />
        <InlineNote tone="info">
          {ticker} does not disclose segment revenue and EBITDA in this workspace, so a sum-of-the-parts cannot be
          built from reported data. Add segment figures through the data sources or a document upload to enable it.
        </InlineNote>
      </Panel>
    );
  }

  const update = (index: number, patch: Partial<SotpInput['segments'][number]>) => {
    const segments = sotp.segments.map((s, i) => (i === index ? { ...s, ...patch } : s));
    setSotp({ ...sotp, segments });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Panel padded={false}>
        <div className="p-3 pb-2">
          <PanelHeader title="Segment valuation" subtitle="Each segment valued on its own multiple, then bridged to equity." dense />
        </div>
        <div className="overflow-auto">
          <table className="w-full border-collapse text-base">
            <thead>
              <tr className="bg-raised">
                <th className="label border-b border-line px-2.5 py-1.5 text-left">Segment</th>
                <th className="label border-b border-line px-2.5 py-1.5 text-right">Revenue</th>
                <th className="label border-b border-line px-2.5 py-1.5 text-right">EBITDA</th>
                <th className="label border-b border-line px-2.5 py-1.5 text-right">Margin</th>
                <th className="label border-b border-line px-2.5 py-1.5 text-right">Multiple</th>
                <th className="label border-b border-line px-2.5 py-1.5 text-right">Ownership</th>
                <th className="label border-b border-line px-2.5 py-1.5 text-right">EV</th>
                <th className="label border-b border-line px-2.5 py-1.5 text-right">% of total</th>
                <th className="label border-b border-line px-2.5 py-1.5 text-right">Per share</th>
              </tr>
            </thead>
            <tbody>
              {result.segments.map((s, i) => (
                <tr key={s.id} className="border-b border-line/50 hover:bg-raised">
                  <td className="px-2.5 py-1 text-ink-2">{s.name}</td>
                  <td className="px-2.5 py-1 text-right"><Num value={s.revenue} format="currencyMillions" currency={currency} /></td>
                  <td className="px-2.5 py-1 text-right"><Num value={s.ebitda} format="currencyMillions" currency={currency} /></td>
                  <td className="px-2.5 py-1 text-right"><Num value={s.margin} format="percent" /></td>
                  <td className="px-2.5 py-1 text-right">
                    {canEdit ? (
                      <input
                        type="number" step="0.25" value={s.multiple ?? 0}
                        onChange={(e) => update(i, { multiple: Number(e.target.value) })}
                        className="num w-16 rounded border border-transparent bg-transparent px-1 py-0.5 text-right hover:border-line focus:border-accent focus:bg-panel focus:outline-none"
                      />
                    ) : <Num value={s.multiple} format="multiple" />}
                  </td>
                  <td className="px-2.5 py-1 text-right">
                    {canEdit ? (
                      <input
                        type="number" step="0.05" min="0" max="1" value={s.ownership ?? 1}
                        onChange={(e) => update(i, { ownership: Number(e.target.value) })}
                        className="num w-14 rounded border border-transparent bg-transparent px-1 py-0.5 text-right hover:border-line focus:border-accent focus:bg-panel focus:outline-none"
                      />
                    ) : <Num value={s.ownership ?? 1} format="percent" />}
                  </td>
                  <td className="px-2.5 py-1 text-right"><Num value={s.attributableEv} format="currencyMillions" currency={currency} className="font-medium" /></td>
                  <td className="px-2.5 py-1 text-right"><Num value={s.pctOfTotalEv} format="percent" /></td>
                  <td className="px-2.5 py-1 text-right"><Num value={s.evPerShare} format="currency" currency={currency} decimals={2} /></td>
                </tr>
              ))}
              {result.corporateEv !== null ? (
                <tr className="border-b border-line/50">
                  <td className="px-2.5 py-1 text-ink-3">Unallocated corporate costs</td>
                  <td colSpan={5} />
                  <td className="px-2.5 py-1 text-right"><Num value={result.corporateEv} format="currencyMillions" currency={currency} /></td>
                  <td colSpan={2} />
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Bridge to equity" dense />
        <StatRow label="Total enterprise value" value={<Num value={result.totalEnterpriseValue} format="currencyMillions" currency={currency} className="font-medium" />} />
        <StatRow label="Less net debt" value={<Num value={-result.netDebt} format="currencyMillions" currency={currency} />} />
        <StatRow label="Less minority interest" value={<Num value={-result.minorityInterest} format="currencyMillions" currency={currency} />} />
        <StatRow label="Equity value" value={<Num value={result.equityValue} format="currencyMillions" currency={currency} className="font-medium" />} />
        <div className="mt-1 border-t border-line pt-2">
          <StatRow label="Implied share price" value={<Num value={result.impliedSharePrice} format="currency" currency={currency} decimals={2} className="text-md font-semibold" />} />
          <StatRow label="Current price" value={<Num value={result.currentPrice} format="currency" currency={currency} decimals={2} />} />
          <StatRow label="Upside" value={<Num value={result.upside} format="percentSigned" className="font-medium" />} />
        </div>
        <InlineNote tone="info">
          Segment multiples default to the company&apos;s own EV/EBITDA. The point of the exercise is to give each
          segment the multiple its economics deserve, so change them.
        </InlineNote>
      </Panel>
    </div>
  );
}

/**
 * An editable forecast cell. It reads and writes the ratio the engine uses but
 * shows the percentage an analyst types, and holds the raw keystrokes while the
 * field is focused so a half-typed "3." does not snap back to "3".
 */
function PercentCell({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      type="number"
      step={0.25}
      value={draft ?? (value * 100).toFixed(2)}
      onChange={(e) => {
        setDraft(e.target.value);
        const v = Number(e.target.value);
        if (Number.isFinite(v)) onChange(v / 100);
      }}
      onBlur={() => setDraft(null)}
      className="num w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-right hover:border-line focus:border-accent focus:bg-panel focus:outline-none"
      aria-label="Percentage"
    />
  );
}
