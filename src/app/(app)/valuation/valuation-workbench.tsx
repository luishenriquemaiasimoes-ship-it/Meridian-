'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Badge, EmptyState, InlineNote, Panel, PanelHeader, Segmented, Tooltip,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { DataTable, type Column } from '@/components/ui/table';
import { MetricCard, Num } from '@/components/ui/values';
import { BarSeriesChart } from '@/components/charts';
import { DASH, formatDate } from '@/lib/finance/format';
import { downloadText, toCsv } from '@/lib/import/csv';
import { isNum } from '@/lib/finance/core';
import type { Currency } from '@/lib/finance/types';

interface ModelRow {
  id: string; ticker: string; companyName: string; currency: Currency;
  name: string; kind: string; status: string; authorName: string; notes: string | null;
  updatedAt: string; computedAt: string | null;
  price: number | null; fairValue: number | null; upside: number | null;
  expectedValue: number | null; enterpriseValue: number | null; equityValue: number | null;
  wacc: number | null; terminalGrowth: number | null; thesisTarget: number | null;
  marketCap: number | null; evEbitda: number | null; pe: number | null; bankLike: boolean;
}

const KIND_LABEL: Record<string, string> = {
  DCF: 'Discounted cash flow', SOTP: 'Sum of the parts',
  COMPS: 'Trading comparables', REVERSE_DCF: 'Reverse DCF',
};

export function ValuationWorkbench(props: {
  models: ModelRow[];
  uncovered: { ticker: string; name: string; sector: string; price: number | null; currency: Currency }[];
}) {
  const [kind, setKind] = useState<'all' | 'DCF' | 'SOTP' | 'COMPS'>('all');

  const models = useMemo(
    () => (kind === 'all' ? props.models : props.models.filter((m) => m.kind === kind)),
    [props.models, kind],
  );

  const withValue = props.models.filter((m) => isNum(m.fairValue));
  const upsides = withValue.map((m) => m.upside).filter(isNum) as number[];
  const medianUpside = upsides.length
    ? upsides.slice().sort((a, b) => a - b)[Math.floor(upsides.length / 2)]
    : null;
  const undervalued = withValue.filter((m) => (m.upside ?? 0) > 0.15).length;
  const overvalued = withValue.filter((m) => (m.upside ?? 0) < -0.15).length;

  const columns: Column<ModelRow>[] = [
    {
      key: 'ticker', header: 'Ticker', sticky: true, width: '96px', sortable: true, value: (m) => m.ticker,
      render: (m) => <Link href={`/companies/${m.ticker}/valuation?model=${m.id}`} className="font-semibold text-ink hover:text-accent">{m.ticker}</Link>,
    },
    {
      key: 'name', header: 'Model', value: (m) => m.name, sortable: true,
      render: (m) => (
        <div className="min-w-0">
          <Link href={`/companies/${m.ticker}/valuation?model=${m.id}`} className="block truncate text-ink-2 hover:text-accent">{m.name}</Link>
          <span className="text-2xs text-ink-4">{m.companyName}</span>
        </div>
      ),
    },
    {
      key: 'kind', header: 'Kind', value: (m) => m.kind, sortable: true, width: '110px',
      render: (m) => <Badge tone="neutral">{KIND_LABEL[m.kind] ?? m.kind}</Badge>,
    },
    {
      key: 'status', header: 'Status', value: (m) => m.status, sortable: true, width: '90px',
      render: (m) => <Badge tone={m.status === 'ACTIVE' ? 'pos' : 'neutral'}>{m.status.toLowerCase()}</Badge>,
    },
    { key: 'price', header: 'Price', value: (m) => m.price, format: 'currency', currency: (m) => m.currency, align: 'right', sortable: true },
    {
      key: 'fair', header: 'Fair value', align: 'right', sortable: true, value: (m) => m.fairValue,
      tooltip: 'The value produced by the last run of this model. A model that has never been run shows nothing here rather than zero.',
      render: (m) => isNum(m.fairValue)
        ? <Num value={m.fairValue} format="currency" currency={m.currency} />
        : <Tooltip content="This model has not been run since it was saved."><span className="text-2xs text-ink-4">not run</span></Tooltip>,
    },
    { key: 'upside', header: 'Upside', value: (m) => m.upside, format: 'percentSigned', align: 'right', sortable: true },
    {
      key: 'expected', header: 'Expected value', value: (m) => m.expectedValue, format: 'currency',
      currency: (m) => m.currency, align: 'right', sortable: true,
      tooltip: 'Probability-weighted across the bull, base and bear cases stored with the model.',
    },
    { key: 'wacc', header: 'WACC', value: (m) => m.wacc, format: 'percent', align: 'right', sortable: true },
    { key: 'g', header: 'Terminal g', value: (m) => m.terminalGrowth, format: 'percent', align: 'right', sortable: true },
    {
      key: 'target', header: 'Thesis target', value: (m) => m.thesisTarget, format: 'currency',
      currency: (m) => m.currency, align: 'right', sortable: true,
      tooltip: 'The target price recorded on the thesis, for comparison with what the model produces.',
    },
    {
      key: 'gap', header: 'Model vs thesis', align: 'right', sortable: true,
      tooltip: 'How far the model sits from the target the desk has published. A large gap means one of the two needs revisiting.',
      value: (m) => (isNum(m.fairValue) && isNum(m.thesisTarget) && (m.thesisTarget as number) > 0
        ? (m.fairValue as number) / (m.thesisTarget as number) - 1
        : null),
      format: 'percentSigned',
    },
    {
      key: 'updated', header: 'Updated', value: (m) => m.updatedAt, sortable: true, align: 'right',
      render: (m) => <span className="text-2xs text-ink-3">{formatDate(m.updatedAt)}</span>,
    },
  ];

  const exportCsv = () => {
    downloadText(
      'meridian-valuation-models.csv',
      toCsv(
        ['Ticker', 'Model', 'Kind', 'Status', 'Price', 'Fair value', 'Upside', 'Expected value', 'WACC', 'Terminal growth', 'Thesis target', 'Author', 'Updated'],
        props.models.map((m) => [
          m.ticker, m.name, m.kind, m.status, m.price, m.fairValue, m.upside,
          m.expectedValue, m.wacc, m.terminalGrowth, m.thesisTarget, m.authorName, m.updatedAt.slice(0, 10),
        ]),
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Models" value={props.models.length} format="number" decimals={0} sublabel={`${withValue.length} with a computed value`} />
        <MetricCard label="Median upside" value={medianUpside} format="percentSigned" sublabel="Across models that have been run" />
        <MetricCard label="More than 15% undervalued" value={undervalued} format="number" decimals={0} />
        <MetricCard label="More than 15% overvalued" value={overvalued} format="number" decimals={0} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={kind}
          onChange={setKind}
          options={[
            { value: 'all', label: `All (${props.models.length})` },
            { value: 'DCF', label: `DCF (${props.models.filter((m) => m.kind === 'DCF').length})` },
            { value: 'SOTP', label: `SOTP (${props.models.filter((m) => m.kind === 'SOTP').length})` },
            { value: 'COMPS', label: `Comps (${props.models.filter((m) => m.kind === 'COMPS').length})` },
          ]}
        />
        <button type="button" onClick={exportCsv} className="btn-ghost text-xs">
          <Icon.Download size={13} /> Export CSV
        </button>
      </div>

      {props.models.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<Icon.Valuation size={22} />}
            title="No valuation models yet"
            description="Open a company and build a discounted cash flow from its own reported history. Every assumption starts anchored to what the company has actually done."
            action={<Link href="/companies" className="btn-primary text-xs">Browse companies</Link>}
          />
        </Panel>
      ) : (
        <>
          <Panel>
            <DataTable
              columns={columns}
              rows={models}
              rowKey={(m) => m.id}
              initialSort={{ key: 'upside', direction: 'desc' }}
              dense
              searchable
              searchValue={(m) => `${m.ticker} ${m.name} ${m.companyName} ${m.authorName}`}
              emptyTitle="No models of this kind"
            />
          </Panel>

          {withValue.length ? (
            <BarSeriesChart
              title="Upside by model"
              subtitle="Fair value against the current price"
              data={withValue
                .slice()
                .sort((a, b) => (b.upside ?? 0) - (a.upside ?? 0))
                .map((m) => ({ label: `${m.ticker} ${m.kind}`, upside: m.upside }))}
              xKey="label"
              series={[{ key: 'upside', label: 'Upside', format: 'percentSigned' }]}
              yFormat="percent"
              colorBySign
              referenceValue={0}
              height={300}
              footnote="A model that has never been run is omitted rather than shown at zero upside."
            />
          ) : (
            <InlineNote tone="warn">
              None of the saved models has a stored result. Open one and run it to see a fair value here.
            </InlineNote>
          )}
        </>
      )}

      {props.uncovered.length ? (
        <Panel>
          <PanelHeader
            title="Covered but not modelled"
            subtitle={`${props.uncovered.length} compan${props.uncovered.length === 1 ? 'y has' : 'ies have'} data in this workspace and no valuation model`}
          />
          <div className="flex flex-wrap gap-1.5 px-3 pb-3">
            {props.uncovered.map((c) => (
              <Link
                key={c.ticker}
                href={`/companies/${c.ticker}/valuation`}
                className="rounded border border-line px-2 py-1 text-2xs text-ink-2 transition hover:border-accent/50 hover:text-accent"
                title={`${c.name} · ${c.sector}`}
              >
                {c.ticker}
              </Link>
            ))}
          </div>
        </Panel>
      ) : null}

      <p className="text-2xs text-ink-4">
        Fair values are the output of assumptions recorded in this workspace, not a market view. Where a cell reads{' '}
        {DASH} or &ldquo;not run&rdquo;, the model has produced no value and nothing has been substituted for it.
      </p>
    </div>
  );
}
