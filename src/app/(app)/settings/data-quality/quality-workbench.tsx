'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, cx, InlineNote, Panel, PanelHeader, Segmented, Tabs, Tooltip,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { DataTable, type Column } from '@/components/ui/table';
import { BarCell, MetricCard, Num } from '@/components/ui/values';
import { DASH, formatDate } from '@/lib/finance/format';
import { downloadText, toCsv } from '@/lib/import/csv';
import { isNum } from '@/lib/finance/core';
import type { QualityReport, CompanyQuality, QualityIssue, StatementCheck } from '@/server/services/quality';

type Tab = 'companies' | 'issues' | 'statements';

const SEVERITY_TONE: Record<string, 'neg' | 'warn' | 'neutral'> = {
  BLOCKING: 'neg', IMPORTANT: 'warn', INFORMATIONAL: 'neutral',
};

const SEVERITY_LABEL: Record<string, string> = {
  BLOCKING: 'Blocking', IMPORTANT: 'Important', INFORMATIONAL: 'For information',
};

export function QualityWorkbench(props: {
  report: QualityReport;
  selectedTicker: string | null;
  statementChecks: StatementCheck[] | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(props.selectedTicker ? 'statements' : 'companies');
  const [severity, setSeverity] = useState<'all' | 'BLOCKING' | 'IMPORTANT'>('all');

  const { summary, companies, issues } = props.report;

  const shownIssues = useMemo(
    () => (severity === 'all' ? issues : issues.filter((i) => i.severity === severity)),
    [issues, severity],
  );

  const issueColumns: Column<QualityIssue>[] = [
    {
      key: 'severity', header: 'Severity', width: '120px', sortable: true,
      value: (i) => (i.severity === 'BLOCKING' ? 0 : i.severity === 'IMPORTANT' ? 1 : 2),
      render: (i) => <Badge tone={SEVERITY_TONE[i.severity]}>{SEVERITY_LABEL[i.severity]}</Badge>,
    },
    {
      key: 'ticker', header: 'Ticker', sticky: true, width: '96px', sortable: true, value: (i) => i.ticker,
      render: (i) => <Link href={`/companies/${i.ticker}`} className="font-semibold text-ink hover:text-accent">{i.ticker}</Link>,
    },
    { key: 'kind', header: 'Issue', value: (i) => i.kind, sortable: true, className: 'text-ink-2' },
    { key: 'detail', header: 'Detail', value: (i) => i.detail, className: 'text-2xs text-ink-3' },
    { key: 'remedy', header: 'What it means', value: (i) => i.remedy, className: 'text-2xs text-ink-3' },
  ];

  const companyColumns: Column<CompanyQuality>[] = [
    {
      key: 'ticker', header: 'Ticker', sticky: true, width: '96px', sortable: true, value: (c) => c.ticker,
      render: (c) => <Link href={`/companies/${c.ticker}`} className="font-semibold text-ink hover:text-accent">{c.ticker}</Link>,
    },
    { key: 'name', header: 'Company', value: (c) => c.companyName, sortable: true, className: 'text-ink-2' },
    { key: 'sector', header: 'Sector', value: (c) => c.sector, sortable: true, className: 'text-2xs text-ink-3' },
    {
      key: 'score', header: 'Score', align: 'right', sortable: true, value: (c) => c.score,
      tooltip: 'Starts at 100. A blocking defect costs 30 points, an important one 12, and a note costs nothing.',
      render: (c) => (
        <BarCell
          value={c.score / 100}
          max={1}
          tone={c.score >= 90 ? 'pos' : c.score >= 70 ? 'brass' : 'neg'}
          format="number"
          showValue={false}
        />
      ),
    },
    {
      key: 'scoreNum', header: '', align: 'right', width: '46px', sortable: false,
      render: (c) => <span className="num text-2xs text-ink-2">{c.score}</span>,
    },
    {
      key: 'balance', header: 'Balance sheet', align: 'center', sortable: true,
      value: (c) => (c.balanceSheetBalances ? 1 : 0),
      render: (c) => c.balanceSheetBalances
        ? <Icon.Check size={13} className="inline text-pos" />
        : <Tooltip content="Assets do not equal liabilities plus equity on the latest period."><Icon.Warning size={13} className="inline text-neg" /></Tooltip>,
    },
    {
      key: 'ltm', header: 'LTM', align: 'center', sortable: true, value: (c) => (c.hasLtm ? 1 : 0),
      tooltip: 'A trailing twelve months is built only from four consecutive quarters. It is never approximated.',
      render: (c) => c.hasLtm
        ? <Icon.Check size={13} className="inline text-pos" />
        : <span className="text-2xs text-ink-4">no</span>,
    },
    { key: 'annuals', header: 'Annual periods', value: (c) => c.annualPeriods, format: 'number', align: 'right', sortable: true },
    { key: 'quarters', header: 'Quarters', value: (c) => c.quarterlyPeriods, format: 'number', align: 'right', sortable: true },
    {
      key: 'stale', header: 'Days since report', align: 'right', sortable: true, value: (c) => c.staleDays,
      render: (c) => isNum(c.staleDays)
        ? <span className={cx('num text-2xs', (c.staleDays as number) > 120 ? 'text-warn' : 'text-ink-2')}>{c.staleDays}</span>
        : <span className="text-ink-4">{DASH}</span>,
    },
    {
      key: 'missing', header: 'Missing fields', value: (c) => c.missingFields.length, sortable: true, align: 'right',
      render: (c) => c.missingFields.length
        ? <Tooltip content={c.missingFields.join(', ')}><span className="num text-2xs text-warn">{c.missingFields.length}</span></Tooltip>
        : <span className="text-2xs text-ink-4">none</span>,
    },
    {
      key: 'source', header: 'Source', value: (c) => c.source, sortable: true,
      render: (c) => (
        <span className="flex items-center gap-1.5 text-2xs text-ink-3">
          {c.source}
          {c.isSimulated ? <Badge tone="warn">simulated</Badge> : null}
        </span>
      ),
    },
    {
      key: 'inspect', header: '', width: '80px', align: 'right',
      render: (c) => (
        <button
          type="button"
          onClick={() => router.push(`/settings/data-quality?ticker=${c.ticker}`)}
          className="text-2xs text-accent hover:underline focus-ring rounded"
        >
          Inspect
        </button>
      ),
    },
  ];

  const checkColumns: Column<StatementCheck>[] = [
    { key: 'label', header: 'Period', sticky: true, width: '110px', sortable: true, value: (c) => c.label, className: 'font-medium text-ink' },
    { key: 'type', header: 'Type', value: (c) => c.periodType, sortable: true, className: 'text-2xs text-ink-3' },
    { key: 'end', header: 'Ends', value: (c) => c.endDate, sortable: true, align: 'right', render: (c) => <span className="text-2xs text-ink-3">{formatDate(c.endDate)}</span> },
    { key: 'assets', header: 'Total assets', value: (c) => c.assets, format: 'currencyMillions', align: 'right', sortable: true },
    { key: 'le', header: 'Liabilities + equity', value: (c) => c.liabilitiesAndEquity, format: 'currencyMillions', align: 'right', sortable: true },
    {
      key: 'diff', header: 'Difference', value: (c) => c.difference, align: 'right', sortable: true,
      render: (c) => (
        <span className={cx('num', c.balances ? 'text-ink-3' : 'text-neg font-semibold')}>
          <Num value={c.difference} format="currencyMillions" />
        </span>
      ),
    },
    {
      key: 'balances', header: 'Balances', align: 'center', sortable: true, value: (c) => (c.balances ? 1 : 0),
      render: (c) => c.balances
        ? <Icon.Check size={13} className="inline text-pos" />
        : <Icon.Warning size={13} className="inline text-neg" />,
    },
    { key: 'flows', header: 'CFO + CFI + CFF', value: (c) => c.sumOfFlows, format: 'currencyMillions', align: 'right', sortable: true },
    { key: 'netChange', header: 'Change in cash', value: (c) => c.netChangeInCash, format: 'currencyMillions', align: 'right', sortable: true },
    {
      key: 'articulates', header: 'Articulates', align: 'center', sortable: true,
      value: (c) => (c.cashFlowArticulates === null ? -1 : c.cashFlowArticulates ? 1 : 0),
      tooltip: 'The three cash-flow sections should sum to the reported change in cash.',
      render: (c) => c.cashFlowArticulates === null
        ? <span className="text-2xs text-ink-4">no data</span>
        : c.cashFlowArticulates
          ? <Icon.Check size={13} className="inline text-pos" />
          : <Icon.Warning size={13} className="inline text-neg" />,
    },
  ];

  const exportIssues = () => {
    downloadText(
      'meridian-data-quality.csv',
      toCsv(
        ['Ticker', 'Company', 'Severity', 'Issue', 'Detail', 'What it means'],
        issues.map((i) => [i.ticker, i.companyName, i.severity, i.kind, i.detail, i.remedy]),
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Companies with nothing to fix" value={summary.clean} format="number" decimals={0}
          sublabel={`of ${summary.covered} covered`}
          tooltip="Counts companies with no blocking or important defect. An informational note — a bank, or simulated data — describes the company rather than faulting its data."
        />
        <MetricCard label="Blocking defects" value={summary.blocking} format="number" decimals={0} accent={summary.blocking > 0} sublabel="A figure that depends on one is unavailable, never estimated" />
        <MetricCard label="Important defects" value={summary.important} format="number" decimals={0} />
        <MetricCard label="Median quality score" value={summary.medianScore} format="number" decimals={0} sublabel="0 to 100" />
      </div>

      {summary.simulated > 0 ? (
        <InlineNote tone="warn">
          {summary.simulated} of {summary.covered} companies carry simulated data. It is internally consistent — every
          balance sheet balances and every cash-flow statement articulates with the change in cash — which is what makes
          it usable for exercising the platform. It is not market data and is labelled as such wherever it appears.
        </InlineNote>
      ) : null}

      {summary.blocking > 0 ? (
        <InlineNote tone="neg">
          {summary.blocking} blocking defect{summary.blocking === 1 ? '' : 's'} across the universe. Anything that
          depends on the affected field is reported as unavailable rather than filled in with a substitute, so a defect
          here shows up as a dash on the company screen, not as a wrong number.
        </InlineNote>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          tabs={[
            { value: 'companies', label: 'By company', count: companies.length },
            { value: 'issues', label: 'Issues', count: issues.length },
            { value: 'statements', label: 'Statement integrity' },
          ]}
          className="flex-1"
        />
        <Button icon={<Icon.Download size={13} />} onClick={exportIssues} disabled={!issues.length}>Export CSV</Button>
      </div>

      {tab === 'companies' ? (
        <Panel>
          <PanelHeader
            title="Coverage quality"
            subtitle="One row per covered company, worst first"
          />
          <DataTable
            columns={companyColumns}
            rows={companies}
            rowKey={(c) => c.ticker}
            initialSort={{ key: 'score', direction: 'asc' }}
            dense
            searchable
            searchValue={(c) => `${c.ticker} ${c.companyName} ${c.sector}`}
            emptyTitle="No coverage"
          />
        </Panel>
      ) : null}

      {tab === 'issues' ? (
        <div className="space-y-3">
          <Segmented
            value={severity}
            onChange={setSeverity}
            options={[
              { value: 'all', label: `All (${issues.length})` },
              { value: 'BLOCKING', label: `Blocking (${summary.blocking})` },
              { value: 'IMPORTANT', label: `Important (${summary.important})` },
            ]}
          />
          <Panel>
            <DataTable
              columns={issueColumns}
              rows={shownIssues}
              rowKey={(i) => `${i.ticker}-${i.kind}`}
              initialSort={{ key: 'severity', direction: 'asc' }}
              dense
              searchable
              searchValue={(i) => `${i.ticker} ${i.kind} ${i.detail}`}
              emptyTitle="Nothing at this severity"
              emptyDescription="Every covered company passes the checks at this level."
            />
          </Panel>
        </div>
      ) : null}

      {tab === 'statements' ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label">Company</span>
            <div className="flex flex-wrap gap-1">
              {companies.map((c) => (
                <button
                  key={c.ticker}
                  type="button"
                  onClick={() => router.push(`/settings/data-quality?ticker=${c.ticker}`)}
                  className={cx(
                    'rounded border px-1.5 py-0.5 text-2xs transition focus-ring',
                    c.ticker === props.selectedTicker
                      ? 'border-accent/50 bg-accent/[0.06] text-accent'
                      : 'border-line text-ink-3 hover:text-ink-2',
                  )}
                >
                  {c.ticker}
                </button>
              ))}
            </div>
          </div>

          {props.statementChecks ? (
            <>
              <Panel>
                <PanelHeader
                  title={`${props.selectedTicker} — period by period`}
                  subtitle="Assets against liabilities plus equity, and the three cash-flow sections against the reported change in cash"
                />
                <DataTable
                  columns={checkColumns}
                  rows={props.statementChecks}
                  rowKey={(c) => `${c.periodType}-${c.label}`}
                  initialSort={{ key: 'end', direction: 'desc' }}
                  dense
                  emptyTitle="No statements on record"
                />
              </Panel>
              <InlineNote tone="info">
                These are the two checks that catch a corrupted statement before it reaches a model: the balance sheet
                must balance within half a percent of total assets, and the cash-flow statement must articulate with the
                change in cash within one percent. A period that fails either is flagged here and everything derived from
                it should be treated as suspect.
              </InlineNote>
            </>
          ) : (
            <InlineNote tone="info">Pick a company above to check its statements period by period.</InlineNote>
          )}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Workspace inputs" dense />
          <div className="px-3 pb-3">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-line">
                <tr>
                  <td className="py-1.5 text-ink-2">Latest price observation</td>
                  <td className="py-1.5 text-right num text-ink">{summary.lastPriceDate ? formatDate(summary.lastPriceDate) : DASH}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-ink-2">Latest statement period</td>
                  <td className="py-1.5 text-right num text-ink">{summary.lastStatementLabel ?? DASH}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-ink-2">
                    Normalization adjustments
                    <span className="ml-2 text-2xs text-ink-4">Manual, attributed, reversible</span>
                  </td>
                  <td className="py-1.5 text-right num text-ink">{summary.adjustments}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-ink-2">
                    Documents with no extracted text
                    <span className="ml-2 text-2xs text-ink-4">Not searchable</span>
                  </td>
                  <td className="py-1.5 text-right num text-ink">{summary.documentsWithoutText}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="What the platform does with a defect" />
          <ul className="space-y-2 px-3 pb-3 text-xs leading-relaxed text-ink-2">
            <li className="flex gap-2">
              <Icon.Check size={13} className="mt-0.5 shrink-0 text-pos" />
              <span>A missing input produces <code className="text-ink">null</code> through the whole engine, and a dash on the screen. It is never coerced to zero.</span>
            </li>
            <li className="flex gap-2">
              <Icon.Check size={13} className="mt-0.5 shrink-0 text-pos" />
              <span>A measure that is not meaningful for a kind of company reads &ldquo;n/m&rdquo; with the reason on hover, rather than a number nobody should use.</span>
            </li>
            <li className="flex gap-2">
              <Icon.Check size={13} className="mt-0.5 shrink-0 text-pos" />
              <span>A screen filter never passes a company whose value is missing; the screener reports how many were excluded for that reason.</span>
            </li>
            <li className="flex gap-2">
              <Icon.Check size={13} className="mt-0.5 shrink-0 text-pos" />
              <span>The AI analyst answers &ldquo;data unavailable&rdquo; instead of estimating, and labels every statement by what kind of claim it is.</span>
            </li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
