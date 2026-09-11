'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge, cx, InlineNote, Panel, PanelHeader, Segmented, Select, Tabs, Tooltip,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { DataTable, type Column } from '@/components/ui/table';
import { BarCell, MetricCard, Num, StatRow, Unavailable } from '@/components/ui/values';
import {
  AreaSeriesChart, BarSeriesChart, CorrelationMatrix, ScatterPlot,
} from '@/components/charts';
import { DASH, formatDate, formatPercent } from '@/lib/finance/format';
import { downloadText, toCsv } from '@/lib/import/csv';
import { isNum } from '@/lib/finance/core';
import type { Currency } from '@/lib/finance/types';

type Tab = 'overview' | 'contribution' | 'correlation' | 'drawdown' | 'factors' | 'scenarios' | 'concentration';

interface Stats {
  totalReturn: number | null; annualizedReturn: number | null; volatility: number | null;
  sharpe: number | null; sortino: number | null; maxDrawdown: number | null;
  var95: number | null; cvar95: number | null; bestPeriod: number | null;
  worstPeriod: number | null; positivePeriodsPct: number | null; observations: number;
}

interface RiskRow {
  ticker: string; name: string; weight: number; volatility: number | null;
  marginalContribution: number | null; contribution: number | null; contributionPct: number | null;
}

interface FactorRow {
  factor: string; label: string; description: string;
  portfolio: number | null; benchmark: number | null; active: number | null; coverage: number;
  leaders: { ticker: string; name: string; weight: number; score: number }[];
  laggards: { ticker: string; name: string; weight: number; score: number }[];
}

interface ScenarioRow {
  id: string; name: string; description: string; marketMove: number;
  portfolioImpact: number; valueImpact: number | null;
  rows: { ticker: string; name: string; sector: string | null; weight: number; impact: number; contribution: number }[];
  worst: { ticker: string; impact: number } | null;
  best: { ticker: string; impact: number } | null;
}

interface ExposureRow { key: string; label: string; marketValue: number; weight: number; count: number }

export function RiskWorkbench(props: {
  portfolios: { id: string; name: string }[];
  selectedId: string;
  initialTab: string;
  currency: Currency;
  benchmarkCode: string;
  totalMarketValue: number | null;
  performance: Stats;
  benchmarkPerformance: Stats;
  tracking: { trackingError: number | null; informationRatio: number | null; correlation: number | null };
  concentration: { top1: number | null; top5: number | null; top10: number | null; hhi: number | null; effectiveNumberOfPositions: number | null; positionCount: number };
  exposures: { sector: ExposureRow[]; country: ExposureRow[]; currency: ExposureRow[]; marketCap: ExposureRow[] };
  riskContribution: { portfolioVolatility: number | null; rows: RiskRow[] };
  correlation: { labels: string[]; values: (number | null)[][] };
  drawdown: {
    series: { date: string; portfolio: number; benchmark: number }[];
    worst: { depth: number | null; peakDate: string | null; troughDate: string | null; recoveryDate: string | null; lengthDays: number | null; recoveryDays: number | null };
    current: number | null;
  };
  valueAtRisk: { horizon: string; confidence: number; historical: number | null; parametric: number | null; conditional: number | null; historicalValue: number | null; conditionalValue: number | null }[];
  factorExposure: FactorRow[];
  scenarios: ScenarioRow[];
  stressByPosition: { ticker: string; name: string; sector: string; weight: number; worstScenario: string; worstImpact: number; worstContribution: number; valueAtRisk: number | null }[];
  betaByTicker: { ticker: string; name: string; beta: number | null; weight: number | null }[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>((props.initialTab as Tab) ?? 'overview');
  const [scenarioId, setScenarioId] = useState(props.scenarios[2]?.id ?? props.scenarios[0]?.id ?? '');
  const [exposureKey, setExposureKey] = useState<'sector' | 'country' | 'currency' | 'marketCap'>('sector');

  const { currency } = props;
  const scenario = props.scenarios.find((s) => s.id === scenarioId) ?? props.scenarios[0];

  const ddSampled = useMemo(() => {
    const s = props.drawdown.series;
    if (s.length < 2) return [];
    const step = Math.max(1, Math.floor(s.length / 220));
    return s.filter((_, i) => i % step === 0 || i === s.length - 1);
  }, [props.drawdown.series]);

  const portfolioBeta = useMemo(() => {
    let covered = 0;
    let sum = 0;
    for (const p of props.betaByTicker) {
      if (isNum(p.beta) && isNum(p.weight)) {
        covered += p.weight as number;
        sum += (p.weight as number) * (p.beta as number);
      }
    }
    return covered > 0 ? { value: sum / covered, coverage: covered } : { value: null, coverage: 0 };
  }, [props.betaByTicker]);

  const maxContribution = Math.max(
    0.0001,
    ...props.riskContribution.rows.map((r) => Math.abs(r.contributionPct ?? 0)),
  );

  const riskColumns: Column<RiskRow>[] = [
    {
      key: 'ticker', header: 'Ticker', sticky: true, width: '104px', sortable: true,
      value: (r) => r.ticker,
      render: (r) => (
        <Link href={`/companies/${r.ticker}`} className="font-semibold text-ink hover:text-accent">{r.ticker}</Link>
      ),
    },
    { key: 'name', header: 'Company', value: (r) => r.name, sortable: true, className: 'text-ink-2' },
    { key: 'weight', header: 'Weight', value: (r) => r.weight, format: 'percent', align: 'right', sortable: true },
    {
      key: 'volatility', header: 'Volatility', tooltip: 'Annualised standard deviation of daily returns.',
      value: (r) => r.volatility, format: 'percent', align: 'right', sortable: true,
    },
    {
      key: 'mcr', header: 'Marginal', tooltip: 'Marginal contribution to risk: the change in portfolio volatility per unit of extra weight.',
      value: (r) => r.marginalContribution, format: 'percent', align: 'right', sortable: true,
    },
    {
      key: 'contribution', header: 'Risk contribution', tooltip: 'Weight × marginal contribution. These sum to portfolio volatility.',
      value: (r) => r.contribution, format: 'percent', align: 'right', sortable: true,
    },
    {
      key: 'share', header: 'Share of risk', align: 'right', sortable: true,
      value: (r) => r.contributionPct,
      render: (r) => <BarCell value={r.contributionPct} max={maxContribution} tone="brass" format="percent" />,
    },
    {
      key: 'ratio', header: 'Risk / weight', align: 'right', sortable: true,
      tooltip: 'Share of risk divided by share of capital. Above 1.0 means the position carries more risk than its weight suggests.',
      value: (r) => (isNum(r.contributionPct) && r.weight > 0 ? (r.contributionPct as number) / r.weight : null),
      format: 'multiple',
    },
  ];

  const stressColumns: Column<(typeof props.stressByPosition)[number]>[] = [
    {
      key: 'ticker', header: 'Ticker', sticky: true, width: '104px', sortable: true, value: (r) => r.ticker,
      render: (r) => <Link href={`/companies/${r.ticker}`} className="font-semibold text-ink hover:text-accent">{r.ticker}</Link>,
    },
    { key: 'sector', header: 'Sector', value: (r) => r.sector, sortable: true, className: 'text-ink-2' },
    { key: 'weight', header: 'Weight', value: (r) => r.weight, format: 'percent', align: 'right', sortable: true },
    { key: 'scenario', header: 'Worst scenario', value: (r) => r.worstScenario, sortable: true, className: 'text-ink-2' },
    { key: 'impact', header: 'Price impact', value: (r) => r.worstImpact, format: 'percentSigned', align: 'right', sortable: true },
    { key: 'contribution', header: 'Portfolio impact', value: (r) => r.worstContribution, format: 'percentSigned', align: 'right', sortable: true },
    { key: 'value', header: 'Value at risk', value: (r) => r.valueAtRisk, format: 'currencyCompact', currency: () => currency, align: 'right', sortable: true },
  ];

  const scenarioColumns: Column<ScenarioRow['rows'][number]>[] = [
    {
      key: 'ticker', header: 'Ticker', sticky: true, width: '104px', sortable: true, value: (r) => r.ticker,
      render: (r) => <Link href={`/companies/${r.ticker}`} className="font-semibold text-ink hover:text-accent">{r.ticker}</Link>,
    },
    { key: 'name', header: 'Company', value: (r) => r.name, sortable: true, className: 'text-ink-2' },
    { key: 'sector', header: 'Sector', value: (r) => r.sector ?? DASH, sortable: true, className: 'text-ink-2' },
    { key: 'weight', header: 'Weight', value: (r) => r.weight, format: 'percent', align: 'right', sortable: true },
    { key: 'impact', header: 'Price impact', value: (r) => r.impact, format: 'percentSigned', align: 'right', sortable: true },
    {
      key: 'contribution', header: 'Contribution to portfolio', value: (r) => r.contribution,
      format: 'percentSigned', align: 'right', sortable: true,
    },
    {
      key: 'value', header: 'Value impact', align: 'right', sortable: true,
      value: (r) => (isNum(props.totalMarketValue) ? (props.totalMarketValue as number) * r.contribution : null),
      format: 'currencyCompact', currency: () => currency,
    },
  ];

  const exportRisk = () => {
    downloadText(
      `meridian-risk-contribution.csv`,
      toCsv(
        ['Ticker', 'Company', 'Weight', 'Volatility', 'Marginal contribution', 'Risk contribution', 'Share of risk'],
        props.riskContribution.rows.map((r) => [
          r.ticker, r.name, r.weight, r.volatility, r.marginalContribution, r.contribution, r.contributionPct,
        ]),
      ),
    );
  };

  const exposures = props.exposures[exposureKey];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {props.portfolios.length > 1 ? (
            <Select
              value={props.selectedId}
              onChange={(e) => router.push(`/risk?id=${e.target.value}&tab=${tab}`)}
            >
              {props.portfolios.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          ) : (
            <Badge tone="neutral">{props.portfolios[0]?.name}</Badge>
          )}
          <Badge tone="neutral">vs {props.benchmarkCode}</Badge>
          <Badge tone="neutral">{props.performance.observations} daily observations</Badge>
        </div>
        <button type="button" onClick={exportRisk} className="btn-ghost text-xs">
          <Icon.Download size={13} /> Export risk contribution
        </button>
      </div>

      <Tabs
        value={tab}
        onChange={(v) => setTab(v as Tab)}
        tabs={[
          { value: 'overview', label: 'Overview' },
          { value: 'contribution', label: 'Risk contribution', count: props.riskContribution.rows.length },
          { value: 'correlation', label: 'Correlation' },
          { value: 'drawdown', label: 'Drawdown' },
          { value: 'factors', label: 'Factor exposure' },
          { value: 'scenarios', label: 'Scenarios', count: props.scenarios.length },
          { value: 'concentration', label: 'Concentration' },
        ]}
      />

      {tab === 'overview' ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Volatility (annualised)" value={props.performance.volatility} format="percent"
              sublabel={`Benchmark ${formatPercent(props.benchmarkPerformance.volatility)}`}
              tooltip="Standard deviation of daily NAV returns, scaled by the square root of 252 trading days."
            />
            <MetricCard
              label="Beta to benchmark" value={portfolioBeta.value} format="ratio" decimals={2}
              sublabel={`Weighted across ${formatPercent(portfolioBeta.coverage)} of the book`}
              tooltip="Position betas weighted by portfolio weight. Positions without a beta are excluded and the weights renormalised."
            />
            <MetricCard
              label="Sharpe" value={props.performance.sharpe} format="ratio" decimals={2}
              sublabel="Risk-free 10.65% (Selic)"
              tooltip="Excess return over the risk-free rate divided by volatility."
            />
            <MetricCard
              label="Sortino" value={props.performance.sortino} format="ratio" decimals={2}
              sublabel="Downside deviation only"
              tooltip="Excess return divided by the deviation of returns below the risk-free rate."
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <Panel>
              <PanelHeader title="Return and risk" subtitle={`Portfolio versus ${props.benchmarkCode}`} />
              <div className="px-3 pb-3 divide-y divide-line">
                <StatRow label="Total return" value={<Num value={props.performance.totalReturn} format="percentSigned" />} />
                <StatRow label="Annualised return" value={<Num value={props.performance.annualizedReturn} format="percentSigned" />} />
                <StatRow label={`${props.benchmarkCode} annualised`} value={<Num value={props.benchmarkPerformance.annualizedReturn} format="percentSigned" />} />
                <StatRow
                  label="Excess return"
                  hint="Portfolio annualised return less benchmark annualised return."
                  value={
                    <Num
                      value={isNum(props.performance.annualizedReturn) && isNum(props.benchmarkPerformance.annualizedReturn)
                        ? (props.performance.annualizedReturn as number) - (props.benchmarkPerformance.annualizedReturn as number)
                        : null}
                      format="percentSigned"
                    />
                  }
                />
                <StatRow label="Tracking error" hint="Annualised volatility of the active return series." value={<Num value={props.tracking.trackingError} format="percent" />} />
                <StatRow label="Information ratio" hint="Active return divided by tracking error." value={<Num value={props.tracking.informationRatio} format="ratio" decimals={2} />} />
                <StatRow label="Correlation to benchmark" value={<Num value={props.tracking.correlation} format="ratio" decimals={2} />} />
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Loss profile" subtitle="Measured on realised daily returns" />
              <div className="px-3 pb-3 divide-y divide-line">
                <StatRow label="Maximum drawdown" value={<Num value={props.performance.maxDrawdown} format="percent" />} />
                <StatRow label="Current drawdown" value={<Num value={props.drawdown.current} format="percent" />} />
                <StatRow label="Worst day" value={<Num value={props.performance.worstPeriod} format="percentSigned" />} />
                <StatRow label="Best day" value={<Num value={props.performance.bestPeriod} format="percentSigned" />} />
                <StatRow label="Positive days" value={<Num value={props.performance.positivePeriodsPct} format="percent" />} />
                <StatRow
                  label="Portfolio volatility (covariance)"
                  hint="Volatility rebuilt from the position covariance matrix. It differs from the NAV volatility above because the weights are today's, not the historical ones."
                  value={<Num value={props.riskContribution.portfolioVolatility} format="percent" />}
                />
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="Value at risk"
                subtitle="95% confidence"
                actions={<Badge tone="neutral">√t scaled</Badge>}
              />
              <div className="px-3 pb-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-2xs uppercase tracking-wide text-ink-4">
                      <th className="py-1 text-left font-semibold">Horizon</th>
                      <th className="py-1 text-right font-semibold">Historical</th>
                      <th className="py-1 text-right font-semibold">Parametric</th>
                      <th className="py-1 text-right font-semibold">CVaR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {props.valueAtRisk.map((v) => (
                      <tr key={v.horizon}>
                        <td className="py-1.5 text-ink-2">{v.horizon}</td>
                        <td className="py-1.5 text-right"><Num value={v.historical} format="percent" /></td>
                        <td className="py-1.5 text-right"><Num value={v.parametric} format="percent" /></td>
                        <td className="py-1.5 text-right"><Num value={v.conditional} format="percent" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-3">
                <InlineNote tone="info">
                  On the current book of{' '}
                  <Num value={props.totalMarketValue} format="currencyCompact" currency={currency} className="font-semibold" />
                  , a one-day 95% historical VaR of {formatPercent(props.valueAtRisk[0]?.historical)} is{' '}
                  <Num value={props.valueAtRisk[0]?.historicalValue ?? null} format="currencyCompact" currency={currency} className="font-semibold" />
                  ; the conditional VaR — the average loss on the days that breach it — is{' '}
                  <Num value={props.valueAtRisk[0]?.conditionalValue ?? null} format="currencyCompact" currency={currency} className="font-semibold" />.
                  Multi-day figures scale the daily number by √t, which assumes returns are independent across days.
                </InlineNote>
                </div>
              </div>
            </Panel>
          </div>

          <Panel>
            <PanelHeader
              title="Worst case by position"
              subtitle="The most damaging of the six scenarios for each holding, ranked by what it costs the portfolio"
            />
            <DataTable
              columns={stressColumns}
              rows={props.stressByPosition}
              rowKey={(r) => r.ticker}
              initialSort={{ key: 'contribution', direction: 'asc' }}
              dense
              emptyTitle="No positions to stress"
            />
          </Panel>
        </div>
      ) : null}

      {tab === 'contribution' ? (
        <div className="space-y-4">
          <InlineNote tone="info">
            Risk contribution decomposes portfolio volatility of{' '}
            <strong>{formatPercent(props.riskContribution.portfolioVolatility)}</strong> across holdings using the full
            covariance matrix: MCR<sub>i</sub> = (Σw)<sub>i</sub> / σ<sub>p</sub>, RC<sub>i</sub> = w<sub>i</sub> × MCR<sub>i</sub>,
            and the contributions sum to σ<sub>p</sub>. A position whose share of risk exceeds its weight is doing more
            damage than its size implies.
          </InlineNote>
          <Panel>
            <PanelHeader title="Contribution to portfolio volatility" subtitle={`${props.riskContribution.rows.length} holdings with sufficient price history`} />
            <DataTable
              columns={riskColumns}
              rows={props.riskContribution.rows}
              rowKey={(r) => r.ticker}
              initialSort={{ key: 'share', direction: 'desc' }}
              searchable
              searchValue={(r) => `${r.ticker} ${r.name}`}
              dense
              emptyTitle="Not enough price history"
              emptyDescription="Risk contribution needs at least three overlapping observations per holding."
            />
          </Panel>
          <div className="grid gap-3 lg:grid-cols-2">
            <BarSeriesChart
              title="Share of risk versus share of capital"
              subtitle="Above the diagonal means the position is risk-dense"
              data={props.riskContribution.rows
                .slice()
                .sort((a, b) => (b.contributionPct ?? 0) - (a.contributionPct ?? 0))
                .slice(0, 12)
                .map((r) => ({ ticker: r.ticker, weight: r.weight, risk: r.contributionPct }))}
              xKey="ticker"
              series={[
                { key: 'weight', label: 'Weight', format: 'percent' },
                { key: 'risk', label: 'Share of risk', format: 'percent' },
              ]}
              yFormat="percent"
              height={260}
            />
            <ScatterPlot
              title="Volatility versus weight"
              subtitle="Where concentration meets volatility"
              points={props.riskContribution.rows.map((r) => ({
                key: r.ticker, label: r.ticker, x: r.weight, y: r.volatility,
              }))}
              xLabel="Weight"
              yLabel="Volatility"
              xFormat="percent"
              yFormat="percent"
              height={260}
              footnote="Holdings without enough price history to compute a volatility are omitted."
            />
          </div>
        </div>
      ) : null}

      {tab === 'correlation' ? (
        <div className="space-y-4">
          <InlineNote tone="info">
            Pearson correlation of daily returns over the common window. Diversification is only real where the
            off-diagonal numbers are low — two holdings correlated at 0.85 are close to one position for risk purposes.
            Blank cells mean one of the two series is too short to correlate.
          </InlineNote>
          {props.correlation.labels.length > 1 ? (
            <CorrelationMatrix
              labels={props.correlation.labels}
              values={props.correlation.values}
              title="Position correlation matrix"
              subtitle="Daily returns, common window"
            />
          ) : (
            <Panel className="p-6">
              <Unavailable reason="At least two holdings with overlapping price history are required." />
            </Panel>
          )}
          <div className="grid gap-3 lg:grid-cols-2">
            <Panel>
              <PanelHeader title="Most correlated pairs" subtitle="Where diversification is weakest" />
              <PairList correlation={props.correlation} direction="high" />
            </Panel>
            <Panel>
              <PanelHeader title="Least correlated pairs" subtitle="Where diversification is doing work" />
              <PairList correlation={props.correlation} direction="low" />
            </Panel>
          </div>
        </div>
      ) : null}

      {tab === 'drawdown' ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Maximum drawdown" value={props.drawdown.worst.depth} format="percent" sublabel={props.drawdown.worst.peakDate ? `Peak ${formatDate(props.drawdown.worst.peakDate)}` : undefined} />
            <MetricCard label="Current drawdown" value={props.drawdown.current} format="percent" sublabel="Distance from the running high-water mark" />
            <MetricCard
              label="Days peak to trough" value={props.drawdown.worst.lengthDays} format="number" decimals={0}
              sublabel={props.drawdown.worst.troughDate ? `Trough ${formatDate(props.drawdown.worst.troughDate)}` : undefined}
            />
            <MetricCard
              label="Days to recover" value={props.drawdown.worst.recoveryDays} format="number" decimals={0}
              sublabel={props.drawdown.worst.recoveryDate ? `Recovered ${formatDate(props.drawdown.worst.recoveryDate)}` : 'Not yet recovered'}
            />
          </div>
          {ddSampled.length > 1 ? (
            <AreaSeriesChart
              title="Underwater curve"
              subtitle={`Percentage below the running high-water mark — portfolio versus ${props.benchmarkCode}`}
              data={ddSampled}
              xKey="date"
              series={[
                { key: 'portfolio', label: 'Portfolio', format: 'percent' },
                { key: 'benchmark', label: props.benchmarkCode, format: 'percent' },
              ]}
              yFormat="percent"
              height={300}
              footnote="A drawdown is measured from the highest NAV reached to date, so the curve is zero at every new high."
            />
          ) : (
            <Panel className="p-6"><Unavailable reason="A NAV history of at least two points is required." /></Panel>
          )}
          {props.drawdown.worst.depth !== null ? (
            <InlineNote tone={(props.drawdown.worst.depth ?? 0) < -0.2 ? 'warn' : 'info'}>
              The worst peak-to-trough loss was {formatPercent(props.drawdown.worst.depth)}
              {props.drawdown.worst.peakDate && props.drawdown.worst.troughDate
                ? `, from ${formatDate(props.drawdown.worst.peakDate)} to ${formatDate(props.drawdown.worst.troughDate)}`
                : ''}
              {props.drawdown.worst.recoveryDate
                ? `, recovered on ${formatDate(props.drawdown.worst.recoveryDate)} after ${props.drawdown.worst.recoveryDays} days.`
                : '. The high-water mark has not been recovered.'}
            </InlineNote>
          ) : null}
        </div>
      ) : null}

      {tab === 'factors' ? (
        <div className="space-y-4">
          <InlineNote tone="info">
            Every company in the universe is scored 0–10 on each factor by cross-sectional rank, then the book&apos;s
            exposure is the weight-weighted average of its holdings&apos; scores. The benchmark column is the
            equal-weighted average of the same scores across the {props.benchmarkCode} universe. Coverage says how much
            of the book the score actually describes — holdings missing the underlying metrics are excluded rather than
            counted as average.
          </InlineNote>
          <BarSeriesChart
            title="Factor exposure versus benchmark"
            subtitle="0–10 cross-sectional score"
            data={props.factorExposure.map((f) => ({ factor: f.label, portfolio: f.portfolio, benchmark: f.benchmark }))}
            xKey="factor"
            series={[
              { key: 'portfolio', label: 'Portfolio', format: 'number' },
              { key: 'benchmark', label: props.benchmarkCode, format: 'number' },
            ]}
            yFormat="number"
            height={280}
          />
          <div className="grid gap-3 lg:grid-cols-2">
            {props.factorExposure.map((f) => (
              <Panel key={f.factor}>
                <PanelHeader
                  title={f.label}
                  subtitle={f.description}
                  actions={
                    <div className="flex items-center gap-2">
                      <Tooltip content="Share of portfolio weight with enough data to score this factor.">
                        <Badge tone={f.coverage > 0.8 ? 'neutral' : 'warn'}>{formatPercent(f.coverage, 0)} covered</Badge>
                      </Tooltip>
                      <Num value={f.active} format="number" decimals={1} className="text-sm font-semibold" />
                    </div>
                  }
                />
                <div className="px-3 pb-3">
                  <div className="flex items-baseline gap-4">
                    <div>
                      <div className="label">Portfolio</div>
                      <Num value={f.portfolio} format="number" decimals={1} className="text-lg font-semibold" />
                    </div>
                    <div>
                      <div className="label">{props.benchmarkCode}</div>
                      <Num value={f.benchmark} format="number" decimals={1} className="text-lg text-ink-2" />
                    </div>
                    <div className="flex-1">
                      <BarCell value={f.portfolio} max={10} tone={(f.active ?? 0) >= 0 ? 'pos' : 'neg'} format="number" showValue={false} />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 text-2xs">
                    <div>
                      <div className="label mb-1">Strongest</div>
                      {f.leaders.map((l) => (
                        <div key={l.ticker} className="flex justify-between py-0.5">
                          <Link href={`/companies/${l.ticker}`} className="text-ink-2 hover:text-accent">{l.ticker}</Link>
                          <span className="num text-ink-3">{l.score.toFixed(1)}</span>
                        </div>
                      ))}
                      {f.leaders.length === 0 ? <span className="text-ink-4">{DASH}</span> : null}
                    </div>
                    <div>
                      <div className="label mb-1">Weakest</div>
                      {f.laggards.map((l) => (
                        <div key={l.ticker} className="flex justify-between py-0.5">
                          <Link href={`/companies/${l.ticker}`} className="text-ink-2 hover:text-accent">{l.ticker}</Link>
                          <span className="num text-ink-3">{l.score.toFixed(1)}</span>
                        </div>
                      ))}
                      {f.laggards.length === 0 ? <span className="text-ink-4">{DASH}</span> : null}
                    </div>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      ) : null}

      {tab === 'scenarios' && scenario ? (
        <div className="space-y-4">
          <InlineNote tone="warn">
            Scenario impacts are <strong>assumptions</strong>, not forecasts. Each scenario applies a stated sector shock
            plus a beta-weighted market move to today&apos;s weights. They show the shape of the exposure, not a
            prediction of what will happen.
          </InlineNote>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {props.scenarios.map((s) => (
              <button
                key={s.id} type="button" onClick={() => setScenarioId(s.id)}
                className={cx(
                  'panel px-3 py-2.5 text-left transition focus-ring',
                  s.id === scenarioId ? 'border-accent/50' : 'hover:border-line-strong',
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-ink">{s.name}</span>
                  <Num value={s.portfolioImpact} format="percentSigned" className="num text-base font-semibold" />
                </div>
                <div className="mt-0.5 text-2xs text-ink-3">{s.description}</div>
                <div className="mt-2 border-t border-line pt-1.5 text-2xs text-ink-3">
                  Book impact{' '}
                  <Num value={s.valueImpact} format="currencyCompact" currency={currency} className="font-semibold" />
                </div>
              </button>
            ))}
          </div>

          <Panel>
            <PanelHeader
              title={scenario.name}
              subtitle={scenario.description}
              actions={
                <div className="flex items-center gap-3 text-2xs text-ink-3">
                  <span>Market move {formatPercent(scenario.marketMove, 1, { signed: true })}</span>
                  <Num value={scenario.portfolioImpact} format="percentSigned" className="text-sm font-semibold" />
                </div>
              }
            />
            <DataTable
              columns={scenarioColumns}
              rows={scenario.rows}
              rowKey={(r) => r.ticker}
              initialSort={{ key: 'contribution', direction: 'asc' }}
              dense
              searchable
              searchValue={(r) => `${r.ticker} ${r.name}`}
              emptyTitle="No positions in this scenario"
            />
          </Panel>

          <BarSeriesChart
            title="Portfolio impact by scenario"
            subtitle="Weighted sum of position impacts"
            data={props.scenarios.map((s) => ({ scenario: s.name, impact: s.portfolioImpact }))}
            xKey="scenario"
            series={[{ key: 'impact', label: 'Portfolio impact', format: 'percentSigned' }]}
            yFormat="percent"
            colorBySign
            referenceValue={0}
            height={260}
            footnote="Impacts assume the stated sector shocks apply in full and instantly, with no rebalancing."
          />
        </div>
      ) : null}

      {tab === 'concentration' ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="Largest position" value={props.concentration.top1} format="percent" />
            <MetricCard label="Top 5" value={props.concentration.top5} format="percent" />
            <MetricCard label="Top 10" value={props.concentration.top10} format="percent" />
            <MetricCard
              label="Herfindahl index" value={props.concentration.hhi} format="number" decimals={3}
              tooltip="Sum of squared weights. 1.0 is a single position; lower is more diversified."
            />
            <MetricCard
              label="Effective positions" value={props.concentration.effectiveNumberOfPositions}
              format="number" decimals={1}
              sublabel={`${props.concentration.positionCount} actually held`}
              tooltip="1 / HHI — the number of equally-weighted positions that would carry the same concentration."
            />
          </div>

          {isNum(props.concentration.top5) && (props.concentration.top5 as number) > 0.6 ? (
            <InlineNote tone="warn">
              The top five positions are {formatPercent(props.concentration.top5)} of the book. At that level, single-name
              risk dominates: the scenario and risk-contribution tabs will be driven by a handful of holdings.
            </InlineNote>
          ) : null}

          <div className="flex items-center gap-2">
            <span className="label">Exposure by</span>
            <Segmented
              value={exposureKey}
              onChange={setExposureKey}
              options={[
                { value: 'sector', label: 'Sector' },
                { value: 'country', label: 'Country' },
                { value: 'currency', label: 'Currency' },
                { value: 'marketCap', label: 'Market cap' },
              ]}
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <Panel>
              <PanelHeader title="Concentration by group" subtitle="Weight and number of holdings" />
              <div className="px-3 pb-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-2xs uppercase tracking-wide text-ink-4">
                      <th className="py-1 text-left font-semibold">Group</th>
                      <th className="py-1 text-right font-semibold">Holdings</th>
                      <th className="py-1 text-right font-semibold">Value</th>
                      <th className="py-1 text-right font-semibold w-[34%]">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {exposures.map((e) => (
                      <tr key={e.key}>
                        <td className="py-1.5 text-ink-2">{e.label}</td>
                        <td className="py-1.5 text-right num text-ink-3">{e.count}</td>
                        <td className="py-1.5 text-right"><Num value={e.marketValue} format="currencyCompact" currency={currency} /></td>
                        <td className="py-1.5 pl-3"><BarCell value={e.weight} max={Math.max(...exposures.map((x) => x.weight), 0.01)} format="percent" /></td>
                      </tr>
                    ))}
                    {exposures.length === 0 ? (
                      <tr><td colSpan={4} className="py-3 text-center text-ink-4">{DASH}</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Position betas" subtitle="Sensitivity of each holding to the market" />
              <div className="max-h-[420px] overflow-auto px-3 pb-3">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-panel">
                    <tr className="text-2xs uppercase tracking-wide text-ink-4">
                      <th className="py-1 text-left font-semibold">Ticker</th>
                      <th className="py-1 text-right font-semibold">Weight</th>
                      <th className="py-1 text-right font-semibold">Beta</th>
                      <th className="py-1 text-right font-semibold">Weighted beta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {props.betaByTicker
                      .slice()
                      .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
                      .map((p) => (
                        <tr key={p.ticker}>
                          <td className="py-1.5">
                            <Link href={`/companies/${p.ticker}`} className="font-semibold text-ink hover:text-accent">{p.ticker}</Link>
                          </td>
                          <td className="py-1.5 text-right"><Num value={p.weight} format="percent" /></td>
                          <td className="py-1.5 text-right"><Num value={p.beta} format="ratio" decimals={2} /></td>
                          <td className="py-1.5 text-right">
                            <Num
                              value={isNum(p.beta) && isNum(p.weight) ? (p.beta as number) * (p.weight as number) : null}
                              format="ratio" decimals={3}
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Ranked off-diagonal correlation pairs, highest or lowest first. */
function PairList({
  correlation, direction,
}: { correlation: { labels: string[]; values: (number | null)[][] }; direction: 'high' | 'low' }) {
  const pairs = useMemo(() => {
    const out: { a: string; b: string; v: number }[] = [];
    for (let i = 0; i < correlation.labels.length; i++) {
      for (let j = i + 1; j < correlation.labels.length; j++) {
        const v = correlation.values[i]?.[j];
        if (isNum(v)) out.push({ a: correlation.labels[i], b: correlation.labels[j], v: v as number });
      }
    }
    out.sort((x, y) => (direction === 'high' ? y.v - x.v : x.v - y.v));
    return out.slice(0, 8);
  }, [correlation, direction]);

  if (!pairs.length) {
    return <div className="px-3 pb-3"><Unavailable reason="Not enough overlapping price history." /></div>;
  }
  return (
    <div className="px-3 pb-3 divide-y divide-line">
      {pairs.map((p) => (
        <StatRow
          key={`${p.a}-${p.b}`}
          label={<span className="text-ink-2">{p.a} <span className="text-ink-4">/</span> {p.b}</span>}
          value={<span className="num text-xs font-semibold text-ink">{p.v.toFixed(2)}</span>}
        />
      ))}
    </div>
  );
}
