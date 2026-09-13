'use client';

import { useEffect, useState } from 'react';
import { EmptyState, InlineNote, Panel, PanelHeader, cx } from '@/components/ui/primitives';
import { Num } from '@/components/ui/values';
import { isNum } from '@/lib/finance/core';
import { formatPercent } from '@/lib/finance/format';
import type { Currency } from '@/lib/finance/types';

interface Analysis {
  currentPrice: number | null;
  sensitivity: {
    waccAxis: number[];
    growthAxis: number[];
    cells: { row: number; col: number; valuePerShare: number | null; upside: number | null }[];
    base: number | null;
  };
  scenarios: { key: string; valuePerShare: number | null; upside: number | null }[];
  reverse: {
    impliedGrowthDelta: number | null;
    impliedWacc: number | null;
    baseValuePerShare: number | null;
    targetPrice: number;
  } | null;
}

const SCENARIO_LABEL: Record<string, string> = { BULL: 'Bull', BASE: 'Base', BEAR: 'Bear' };

/**
 * Sensitivity, scenarios and the reverse solve, all computed on the projection
 * that produces the published value.
 *
 * The point is not that the grid is prettier than the one it replaces. It is
 * that a sensitivity computed on a different model from the published number
 * is not a sensitivity of the published number, and the product used to ship
 * exactly that.
 */
export function ModelAnalysis(props: { ticker: string; modelId: string | null; currency: Currency; view: 'sensitivity' | 'scenarios' | 'reverse' }) {
  const [data, setData] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setData(null);
    setError(null);
    fetch(`/api/valuation/analysis?ticker=${props.ticker}${props.modelId ? `&modelId=${props.modelId}` : ''}`)
      .then((r) => (r.ok ? r.json() : r.json().then((e) => Promise.reject(new Error(e?.error ?? 'Failed')))))
      .then((d) => { if (live) setData(d.data ?? d); })
      .catch((e: Error) => { if (live) setError(e.message); });
    return () => { live = false; };
  }, [props.ticker, props.modelId]);

  if (error) return <EmptyState title="This analysis is unavailable" description={error} />;
  if (!data) return <EmptyState title="Running the projection" description="Each cell is a full three-statement pass, so this takes a moment." />;

  if (props.view === 'scenarios') {
    return (
      <Panel>
        <PanelHeader
          title="Bull / base / bear"
          subtitle="Three runs of the same model. Growth and cost move; the discount rate is held, so the cases differ on the business rather than on the arithmetic."
          dense
        />
        <div className="grid gap-px bg-line sm:grid-cols-3">
          {data.scenarios.map((s) => (
            <div key={s.key} className="bg-panel p-3">
              <div className="text-2xs uppercase tracking-wide text-ink-3">{SCENARIO_LABEL[s.key] ?? s.key}</div>
              <div className="mt-1 text-md font-semibold">
                <Num value={s.valuePerShare} format="currency" currency={props.currency} decimals={2} />
              </div>
              <div className={cx('text-xs', (s.upside ?? 0) >= 0 ? 'text-pos' : 'text-neg')}>
                {formatPercent(s.upside, 1, { signed: true })} to price
              </div>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  if (props.view === 'reverse') {
    const r = data.reverse;
    if (!r) return <EmptyState title="No price to solve against" description="The reverse solve needs a current price." />;
    return (
      <Panel>
        <PanelHeader
          title="What the price already assumes"
          subtitle="Solved by bisection on the full projection: there is no expression to invert when the debt schedule and the tax charge respond to the inputs."
          dense
        />
        <div className="grid gap-px bg-line sm:grid-cols-3">
          <Cell label="Model value" value={<Num value={r.baseValuePerShare} format="currency" currency={props.currency} decimals={2} />} />
          <Cell label="Price" value={<Num value={r.targetPrice} format="currency" currency={props.currency} decimals={2} />} />
          <Cell
            label="Implied revenue growth adjustment"
            value={isNum(r.impliedGrowthDelta)
              ? <span className="font-semibold">{formatPercent(r.impliedGrowthDelta, 2, { signed: true })}</span>
              : <span className="text-ink-3">out of range</span>}
            hint="Added to every revenue growth path to make the model agree with the price."
          />
          <Cell
            label="Implied cost of capital"
            value={isNum(r.impliedWacc)
              ? <span className="font-semibold">{formatPercent(r.impliedWacc, 2)}</span>
              : <span className="text-ink-3">out of range</span>}
            hint="The discount rate that justifies the price at unchanged growth."
          />
        </div>
        <div className="p-3">
          <InlineNote tone="info">
            The price can be justified by either half of the equation, so both are solved. Where one
            reads as plausible and the other does not, that is the disagreement worth writing down.
          </InlineNote>
        </div>
      </Panel>
    );
  }

  const { sensitivity: g } = data;
  return (
    <Panel>
      <PanelHeader
        title="Sensitivity"
        subtitle="Cost of capital against terminal growth. Every cell is a full three-statement run, with the balance sheet closing in each one."
        dense
      />
      <div className="overflow-x-auto">
        <table className="w-full text-xs tabular-nums">
          <thead>
            <tr className="border-b border-line text-ink-3">
              <th className="p-2 text-left font-medium">WACC \ g</th>
              {g.growthAxis.map((x) => <th key={x} className="p-2 text-right font-medium">{formatPercent(x, 2)}</th>)}
            </tr>
          </thead>
          <tbody>
            {g.waccAxis.map((w, r) => (
              <tr key={w} className="border-b border-line/60">
                <td className="p-2 text-ink-2">{formatPercent(w, 2)}</td>
                {g.growthAxis.map((_, c) => {
                  const cell = g.cells.find((x) => x.row === r && x.col === c);
                  const isBase = r === Math.floor(g.waccAxis.length / 2) && c === Math.floor(g.growthAxis.length / 2);
                  return (
                    <td key={c} className={cx('p-2 text-right', isBase && 'bg-sunken font-semibold')}>
                      <Num value={cell?.valuePerShare ?? null} format="currency" currency={props.currency} decimals={2} />
                      <div className={cx('text-2xs', (cell?.upside ?? 0) >= 0 ? 'text-pos' : 'text-neg')}>
                        {formatPercent(cell?.upside ?? null, 0, { signed: true })}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Cell(props: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="bg-panel p-3">
      <div className="text-2xs uppercase tracking-wide text-ink-3">{props.label}</div>
      <div className="mt-1 text-md">{props.value}</div>
      {props.hint ? <div className="mt-1 text-2xs leading-relaxed text-ink-3">{props.hint}</div> : null}
    </div>
  );
}
