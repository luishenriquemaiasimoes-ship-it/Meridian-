import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { getCompanyDossier } from '@/server/services/company';
import { getComps } from '@/server/services/comps';
import { getSectorAggregates } from '@/server/services/screener';
import { Grid, InlineNote, Panel, PanelHeader } from '@/components/ui/primitives';
import { Bps, MetricCard, Num, StatRow } from '@/components/ui/values';
import { BarLineChart, LineSeriesChart } from '@/components/charts';
import { RatioSection, type RatioRow } from './ratio-table';
import { fundamentalSnapshot, freeCashFlow, netDebt } from '@/lib/finance/ratios';
import { calculateRoic, roicSeries } from '@/lib/finance/roic';
import { formatBps, formatPercent } from '@/lib/finance/format';
import { growth } from '@/lib/finance/core';
import type { Currency } from '@/lib/finance/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} — Fundamentals` };
}

export default async function FundamentalsPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const ctx = await requireContext();
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) notFound();

  const { company, annuals, metrics: m } = dossier;
  const currency = company.currency as Currency;
  const taxRate = ctx.statutoryTaxRate;

  const roicHistory = roicSeries(annuals, taxRate);
  const roicNow = calculateRoic(dossier.ltm ?? annuals[annuals.length - 1], annuals[annuals.length - 2] ?? null, taxRate);

  const [comps, sectors] = await Promise.all([getComps(company.ticker), getSectorAggregates()]);
  const sectorRow = sectors.find((s) => s.sector === company.sector) ?? null;
  const peerStat = (key: string) => (comps?.stats[key]?.median ?? null);

  const snapshots = annuals.map((p, i) => ({
    period: p,
    snap: fundamentalSnapshot(p, annuals[i - 1] ?? null),
    roic: roicHistory.find((r) => r.label === p.label) ?? null,
  }));
  const labels = annuals.map((p) => p.label);

  const rowsFrom = (
    defs: { key: string; label: string; format: RatioRow['format']; pick: (s: (typeof snapshots)[number]) => number | null; formula?: string; peerKey?: string; sectorKey?: keyof NonNullable<typeof sectorRow> }[],
  ): RatioRow[] =>
    defs.map((d) => ({
      key: d.key,
      label: d.label,
      format: d.format,
      formula: d.formula,
      values: Object.fromEntries(snapshots.map((s) => [s.period.label, d.pick(s)])),
      peer: d.peerKey ? peerStat(d.peerKey) : null,
      sector: d.sectorKey && sectorRow ? (sectorRow[d.sectorKey] as number | null) : null,
    }));

  const growthRows = rowsFrom([
    { key: 'revenueGrowth', label: 'Revenue growth', format: 'percent', pick: (s) => growth(s.period.income.revenue, snapshots[snapshots.indexOf(s) - 1]?.period.income.revenue ?? null), peerKey: 'revenueGrowth', sectorKey: 'medianRevenueGrowth' },
    { key: 'ebitdaGrowth', label: 'EBITDA growth', format: 'percent', pick: (s) => growth(s.period.income.ebitda, snapshots[snapshots.indexOf(s) - 1]?.period.income.ebitda ?? null), peerKey: 'ebitdaGrowth' },
    { key: 'ebitGrowth', label: 'EBIT growth', format: 'percent', pick: (s) => growth(s.period.income.ebit, snapshots[snapshots.indexOf(s) - 1]?.period.income.ebit ?? null) },
    { key: 'epsGrowth', label: 'EPS growth', format: 'percent', pick: (s) => growth(s.period.income.eps, snapshots[snapshots.indexOf(s) - 1]?.period.income.eps ?? null) },
    { key: 'fcfGrowth', label: 'FCF growth', format: 'percent', pick: (s) => growth(freeCashFlow(s.period), snapshots[snapshots.indexOf(s) - 1] ? freeCashFlow(snapshots[snapshots.indexOf(s) - 1].period) : null) },
  ]);

  const marginRows = rowsFrom([
    { key: 'grossMargin', label: 'Gross margin', format: 'percent', pick: (s) => s.snap.grossMargin, formula: 'Gross profit ÷ revenue' },
    { key: 'ebitdaMargin', label: 'EBITDA margin', format: 'percent', pick: (s) => s.snap.ebitdaMargin, formula: 'EBITDA ÷ revenue', peerKey: 'ebitdaMargin', sectorKey: 'medianEbitdaMargin' },
    { key: 'ebitMargin', label: 'EBIT margin', format: 'percent', pick: (s) => s.snap.ebitMargin, formula: 'EBIT ÷ revenue' },
    { key: 'netMargin', label: 'Net margin', format: 'percent', pick: (s) => s.snap.netMargin, formula: 'Net income ÷ revenue' },
    { key: 'fcfMargin', label: 'FCF margin', format: 'percent', pick: (s) => s.snap.fcfMargin, formula: 'Free cash flow ÷ revenue' },
  ]);

  const returnRows = rowsFrom([
    { key: 'roic', label: 'ROIC', format: 'percent', pick: (s) => (m.bankLike ? null : s.roic?.roic ?? null), formula: 'NOPAT ÷ average invested capital', peerKey: 'roic', sectorKey: 'medianRoic' },
    { key: 'roe', label: 'ROE', format: 'percent', pick: (s) => s.snap.roe, formula: 'Net income ÷ average equity', peerKey: 'roe', sectorKey: 'medianRoe' },
    { key: 'roa', label: 'ROA', format: 'percent', pick: (s) => s.snap.roa, formula: 'Net income ÷ average assets' },
    { key: 'roce', label: 'ROCE', format: 'percent', pick: (s) => (m.bankLike ? null : s.snap.roce), formula: 'EBIT ÷ average capital employed' },
  ]);

  const efficiencyRows = rowsFrom([
    { key: 'assetTurnover', label: 'Asset turnover', format: 'ratio', pick: (s) => s.snap.assetTurnover, formula: 'Revenue ÷ average assets' },
    { key: 'inventoryTurnover', label: 'Inventory turnover', format: 'ratio', pick: (s) => s.snap.inventoryTurnover, formula: 'COGS ÷ average inventory' },
    { key: 'receivablesTurnover', label: 'Receivables turnover', format: 'ratio', pick: (s) => s.snap.receivablesTurnover, formula: 'Revenue ÷ average receivables' },
  ]);

  const workingCapitalRows = rowsFrom([
    { key: 'dso', label: 'Days sales outstanding', format: 'days', pick: (s) => s.snap.dso, formula: 'Receivables ÷ revenue × 365' },
    { key: 'dio', label: 'Days inventory outstanding', format: 'days', pick: (s) => s.snap.dio, formula: 'Inventory ÷ COGS × 365' },
    { key: 'dpo', label: 'Days payables outstanding', format: 'days', pick: (s) => s.snap.dpo, formula: 'Payables ÷ COGS × 365' },
    { key: 'ccc', label: 'Cash conversion cycle', format: 'days', pick: (s) => s.snap.cashConversionCycle, formula: 'DSO + DIO − DPO' },
    { key: 'nwc', label: 'Net working capital', format: 'currencyCompact', pick: (s) => s.snap.netWorkingCapital },
  ]);

  const leverageRows = rowsFrom([
    { key: 'netDebt', label: 'Net debt', format: 'currencyCompact', pick: (s) => netDebt(s.period.balance), formula: 'Gross debt − cash' },
    { key: 'netDebtToEbitda', label: 'Net debt / EBITDA', format: 'multiple', pick: (s) => s.snap.netDebtToEbitda, peerKey: 'netDebtToEbitda', sectorKey: 'medianNetDebtToEbitda' },
    { key: 'debtToEquity', label: 'Debt / equity', format: 'multiple', pick: (s) => s.snap.debtToEquity },
    { key: 'interestCoverage', label: 'Interest coverage', format: 'multiple', pick: (s) => s.snap.interestCoverage, formula: 'EBIT ÷ net financial expense' },
  ]);

  const cashRows = rowsFrom([
    { key: 'cfo', label: 'Cash from operations', format: 'currencyCompact', pick: (s) => s.snap.cfo },
    { key: 'capex', label: 'Capital expenditure', format: 'currencyCompact', pick: (s) => s.snap.capex },
    { key: 'fcf', label: 'Free cash flow', format: 'currencyCompact', pick: (s) => s.snap.fcf, formula: 'CFO − capex' },
    { key: 'fcfConversion', label: 'FCF conversion', format: 'percent', pick: (s) => s.snap.fcfConversion, formula: 'Free cash flow ÷ EBITDA' },
    { key: 'capexToRevenue', label: 'Capex / revenue', format: 'percent', pick: (s) => s.snap.capexToRevenue },
  ]);

  const roicChart = snapshots.map((s) => ({
    label: s.period.label,
    roic: m.bankLike ? null : s.roic?.roic ?? null,
    nopatMargin: s.roic?.nopatMargin ?? null,
    capitalTurnover: s.roic?.capitalTurnover ?? null,
    wacc: m.wacc,
  }));

  return (
    <div className="space-y-4">
      <Grid cols={6} gap={2}>
        <MetricCard label="ROIC" value={m.roic} format="percent" sublabel={m.roicNote ? 'not applicable' : `spread ${formatBps(m.roicSpread)}`} accent={(m.roicSpread ?? 0) > 0} tooltip={m.roicNote ?? undefined} />
        <MetricCard label="WACC" value={m.wacc} format="percent" sublabel={`Ke ${formatPercent(m.costOfEquity)} · Kd ${formatPercent(m.costOfDebt)}`} />
        <MetricCard label="EBITDA margin" value={m.ebitdaMargin} format="percent" delta={null} />
        <MetricCard label="FCF conversion" value={m.fcfConversion} format="percent" />
        <MetricCard label="Net debt / EBITDA" value={m.netDebtToEbitda} format="multiple" decimals={2} />
        <MetricCard label="Cash conversion cycle" value={m.cashConversionCycle} format="days" />
      </Grid>

      {/* ROIC engine */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <LineSeriesChart
          data={roicChart} xKey="label" height={240} yFormat="percent"
          series={[
            { key: 'roic', label: 'ROIC', format: 'percent' },
            { key: 'wacc', label: 'WACC', format: 'percent', dashed: true },
          ]}
          title="Return on invested capital against the cost of capital"
          subtitle="The spread between the two is where value is created or destroyed"
          footnote={m.roicNote ?? 'NOPAT uses the reported effective tax rate where it is usable, otherwise the workspace statutory rate.'}
        />

        <Panel>
          <PanelHeader title="ROIC decomposition" subtitle="ROIC = NOPAT margin × invested-capital turnover" dense />
          {m.bankLike ? (
            <InlineNote tone="info">{m.roicNote}</InlineNote>
          ) : (
            <>
              <StatRow label="NOPAT" hint="EBIT × (1 − effective tax rate)" value={<Num value={roicNow.nopat} format="currencyCompact" currency={currency} />} />
              <StatRow label="Invested capital" hint="Net working capital + PP&E + intangibles + goodwill + other assets. Cash is excluded." value={<Num value={roicNow.investedCapital} format="currencyCompact" currency={currency} />} />
              <StatRow label="Tax rate used" value={<Num value={roicNow.taxRateUsed} format="percent" />} />
              <div className="my-2 border-t border-line" />
              <StatRow label="NOPAT margin" value={<Num value={roicNow.nopatMargin} format="percent" />} />
              <StatRow label="× Capital turnover" value={<Num value={roicNow.capitalTurnover} format="ratio" decimals={2} />} />
              <StatRow label="= ROIC" value={<Num value={roicNow.roic} format="percent" className="font-semibold" />} />
              <div className="my-2 border-t border-line" />
              <StatRow label="− WACC" value={<Num value={m.wacc} format="percent" />} />
              <StatRow label="= Spread" value={<Bps value={m.roicSpread} />} />
              <StatRow
                label="Economic profit"
                hint="Spread × invested capital — the value created above the cost of the capital employed."
                value={<Num value={m.roicSpread !== null && roicNow.investedCapital !== null ? m.roicSpread * roicNow.investedCapital : null} format="currencyCompact" currency={currency} />}
              />
              <div className="mt-3 rounded border border-line bg-sunken p-2.5">
                <p className="text-xs leading-relaxed text-ink-2">
                  {m.roicSpread === null
                    ? 'The spread cannot be computed: either ROIC or the cost of capital is unavailable.'
                    : m.roicSpread > 0
                      ? `Return on capital exceeds the cost of capital by ${formatBps(m.roicSpread)}, so growth adds value at the margin.`
                      : `Return on capital is ${formatBps(Math.abs(m.roicSpread))} below the cost of capital, so growth destroys value until the spread turns positive.`}
                </p>
              </div>
              {comps ? (
                <div className="mt-3">
                  <p className="label mb-1.5">Against the peer group</p>
                  <StatRow label="Peer median ROIC" value={<Num value={peerStat('roic')} format="percent" muted />} />
                  <StatRow label="Sector median ROIC" value={<Num value={sectorRow?.medianRoic ?? null} format="percent" muted />} />
                </div>
              ) : null}
            </>
          )}
        </Panel>
      </div>

      <BarLineChart
        data={roicChart} xKey="label" height={210}
        bars={[{ key: 'nopatMargin', label: 'NOPAT margin', format: 'percent' }]}
        lines={[{ key: 'capitalTurnover', label: 'Capital turnover', format: 'ratio' }]}
        title="What drives the return"
        subtitle="Margin and turnover shown on one axis; a rising ROIC comes from one or the other"
        footnote="Capital turnover is a ratio and margin a percentage — both are unitless, so they share the axis without distortion."
      />

      <RatioSection title="Growth" subtitle="Year-on-year change in the reported line items, with the peer and sector medians for context." rows={growthRows} labels={labels} currency={currency} />
      <RatioSection title="Margins" subtitle="Each profit line over revenue for the same period." rows={marginRows} labels={labels} currency={currency} />
      <RatioSection title="Returns on capital" subtitle="How much profit each unit of capital produces." rows={returnRows} labels={labels} currency={currency} />
      <RatioSection title="Efficiency" subtitle="How hard the asset base works." rows={efficiencyRows} labels={labels} currency={currency} />
      <RatioSection title="Working capital" subtitle="How long cash is tied up between paying suppliers and collecting from customers." rows={workingCapitalRows} labels={labels} currency={currency} />
      <RatioSection title="Leverage" subtitle="The balance sheet against the earnings that service it." rows={leverageRows} labels={labels} currency={currency} />
      <RatioSection title="Cash generation" subtitle="What converts from reported profit into cash available to owners." rows={cashRows} labels={labels} currency={currency} />

      {m.dataQuality.missingFields.length ? (
        <InlineNote tone="warn">
          The workspace does not hold {m.dataQuality.missingFields.join(', ')} for this company. Measures that
          depend on those fields are shown as unavailable rather than estimated.
        </InlineNote>
      ) : null}
    </div>
  );
}
