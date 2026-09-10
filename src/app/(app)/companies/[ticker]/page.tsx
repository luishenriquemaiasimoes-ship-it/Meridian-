import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { getCompanyDossier } from '@/server/services/company';
import { Badge, Grid, Panel, PanelHeader } from '@/components/ui/primitives';
import { MetricCard, Num, StatRow } from '@/components/ui/values';
import { BarLineChart, LineSeriesChart } from '@/components/charts';
import { freeCashFlow, netDebt } from '@/lib/finance/ratios';
import { roicSeries } from '@/lib/finance/roic';
import { formatPercent } from '@/lib/finance/format';
import type { Currency } from '@/lib/finance/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} — Overview` };
}

export default async function CompanyOverviewPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  await requireContext();
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) notFound();

  const { company, metrics: m, annuals } = dossier;
  const currency = company.currency as Currency;
  const roicHistory = roicSeries(annuals, 0.34);

  const history = annuals.map((p, i) => {
    const r = roicHistory.find((x) => x.label === p.label);
    return {
      label: p.label,
      revenue: p.income.revenue,
      ebitda: p.income.ebitda,
      ebit: p.income.ebit,
      netIncome: p.income.netIncome,
      fcf: freeCashFlow(p),
      eps: p.income.eps,
      ebitdaMargin: p.income.revenue ? (p.income.ebitda ?? 0) / p.income.revenue : null,
      grossMargin: p.income.revenue ? (p.income.grossProfit ?? 0) / p.income.revenue : null,
      netMargin: p.income.revenue ? (p.income.netIncome ?? 0) / p.income.revenue : null,
      fcfMargin: p.income.revenue ? (freeCashFlow(p) ?? 0) / p.income.revenue : null,
      roic: r?.roic ?? null,
      roe: p.balance.totalEquity ? (p.income.netIncome ?? 0) / p.balance.totalEquity : null,
      netDebt: netDebt(p.balance),
      netDebtToEbitda: p.income.ebitda ? (netDebt(p.balance) ?? 0) / p.income.ebitda : null,
      index: i,
    };
  });

  const latestSegmentYear = Math.max(...dossier.segments.map((s) => s.fiscalYear), 0);
  const businessSegments = dossier.segments.filter((s) => s.kind === 'BUSINESS' && s.fiscalYear === latestSegmentYear);
  const geographies = dossier.segments.filter((s) => s.kind === 'GEOGRAPHY' && s.fiscalYear === latestSegmentYear);
  const segmentTotal = businessSegments.reduce((s, x) => s + (x.revenue ?? 0), 0);
  const geoTotal = geographies.reduce((s, x) => s + (x.revenue ?? 0), 0);

  const latest = annuals[annuals.length - 1];
  const capitalStructure = latest
    ? [
        { label: 'Cash and equivalents', value: latest.balance.cash },
        { label: 'Short-term debt', value: latest.balance.shortTermDebt },
        { label: 'Long-term debt', value: latest.balance.longTermDebt },
        { label: 'Lease liabilities', value: latest.balance.leaseLiabilities },
        { label: 'Net debt', value: netDebt(latest.balance) },
        { label: 'Total equity', value: latest.balance.totalEquity },
        { label: 'Minority interest', value: latest.balance.minorityInterestEquity },
      ]
    : [];

  return (
    <div className="space-y-4">
      <Grid cols={6} gap={2}>
        <MetricCard label="Revenue" value={m.revenue} format="currencyCompact" currency={currency} delta={m.revenueGrowth} sublabel={m.basisLabel} />
        <MetricCard label="EBITDA" value={m.ebitda} format="currencyCompact" currency={currency} delta={m.ebitdaGrowth} sublabel={formatPercent(m.ebitdaMargin) + ' margin'} />
        <MetricCard label="EBIT" value={m.ebit} format="currencyCompact" currency={currency} delta={m.ebitGrowth} sublabel={formatPercent(m.ebitMargin) + ' margin'} />
        <MetricCard label="Net income" value={m.netIncome} format="currencyCompact" currency={currency} sublabel={formatPercent(m.netMargin) + ' margin'} />
        <MetricCard label="Free cash flow" value={m.fcf} format="currencyCompact" currency={currency} delta={m.fcfGrowth} sublabel={formatPercent(m.fcfMargin) + ' margin'} />
        <MetricCard label="EPS" value={m.eps} format="currency" currency={currency} decimals={2} delta={m.epsGrowth} sublabel="diluted" />
      </Grid>

      <Grid cols={6} gap={2}>
        <MetricCard
          label="ROIC" value={m.roic} format="percent"
          sublabel={m.roicNote ? 'not applicable' : `WACC ${formatPercent(m.wacc)}`}
          tooltip={m.roicNote ?? 'NOPAT divided by average invested capital. Invested capital excludes cash.'}
          accent={!!m.roicSpread && m.roicSpread > 0}
        />
        <MetricCard label="ROE" value={m.roe} format="percent" tooltip="Net income over average equity." />
        <MetricCard label="ROA" value={m.roa} format="percent" />
        <MetricCard label="Net debt" value={m.netDebt} format="currencyCompact" currency={currency} sublabel={m.netDebt !== null && m.netDebt < 0 ? 'net cash position' : undefined} />
        <MetricCard label="Net debt / EBITDA" value={m.netDebtToEbitda} format="multiple" decimals={2} />
        <MetricCard label="Gross margin" value={m.grossMargin} format="percent" />
      </Grid>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Business" subtitle={`${company.legalName ?? company.name} · founded ${company.foundedYear ?? '—'} · ${company.headquarters ?? '—'}`} />
            <p className="text-base leading-relaxed text-ink-2">{company.description}</p>
            {company.businessModel ? (
              <>
                <p className="label mt-4 mb-1.5">How it makes money</p>
                <p className="text-base leading-relaxed text-ink-2">{company.businessModel}</p>
              </>
            ) : null}
            {company.competitiveAdvantages.length ? (
              <>
                <p className="label mt-4 mb-2">Sources of advantage</p>
                <div className="flex flex-wrap gap-1.5">
                  {company.competitiveAdvantages.map((a) => <Badge key={a} tone="brass">{a}</Badge>)}
                </div>
              </>
            ) : null}
          </Panel>

          <BarLineChart
            data={history}
            xKey="label"
            bars={[{ key: 'revenue', label: 'Revenue', format: 'currencyCompact', currency }]}
            lines={[{ key: 'ebitda', label: 'EBITDA', format: 'currencyCompact', currency }]}
            title="Revenue and EBITDA"
            subtitle={`Reported annual history in ${currency} millions`}
            currency={currency}
            yFormat="currencyCompact"
            height={230}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <LineSeriesChart
              data={history} xKey="label" height={200}
              series={[
                { key: 'grossMargin', label: 'Gross', format: 'percent' },
                { key: 'ebitdaMargin', label: 'EBITDA', format: 'percent' },
                { key: 'netMargin', label: 'Net', format: 'percent' },
                { key: 'fcfMargin', label: 'FCF', format: 'percent' },
              ]}
              yFormat="percent"
              title="Margin history"
              subtitle="Each margin over reported revenue"
            />
            <LineSeriesChart
              data={history} xKey="label" height={200}
              series={[
                { key: 'roic', label: 'ROIC', format: 'percent' },
                { key: 'roe', label: 'ROE', format: 'percent' },
              ]}
              yFormat="percent"
              referenceValue={m.wacc}
              referenceLabel={`WACC ${formatPercent(m.wacc)}`}
              title="Returns on capital"
              subtitle={m.roicNote ? 'ROIC withheld for a deposit-funded institution' : 'Against the estimated cost of capital'}
            />
          </div>

          {businessSegments.length ? (
            <Panel>
              <PanelHeader
                title="Revenue by segment"
                subtitle={`Reported for FY${latestSegmentYear}`}
                actions={<Link href={`/companies/${company.ticker}/segments`} className="text-xs text-accent hover:underline">Segment analysis</Link>}
              />
              <div className="space-y-2">
                {businessSegments.map((s) => {
                  const share = segmentTotal ? (s.revenue ?? 0) / segmentTotal : 0;
                  const margin = s.revenue && s.ebitda !== null ? s.ebitda / s.revenue : null;
                  return (
                    <div key={s.segment}>
                      <div className="flex items-baseline justify-between gap-3 text-xs">
                        <span className="min-w-0 truncate text-ink-2">{s.segment}</span>
                        <span className="flex shrink-0 items-baseline gap-3">
                          <Num value={s.revenue} format="currencyCompact" currency={currency} className="text-2xs" />
                          <span className="num w-11 text-right text-2xs text-ink-3">{formatPercent(share, 0)}</span>
                          <span className="num w-14 text-right text-2xs text-ink-4">{margin === null ? '—' : `${formatPercent(margin, 0)} mg`}</span>
                        </span>
                      </div>
                      <div className="mt-1 h-[5px] rounded-full bg-sunken">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${share * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Capital structure" subtitle={latest ? `As reported at ${latest.label}` : undefined} dense />
            {capitalStructure.map((row) => (
              <StatRow
                key={row.label}
                label={row.label}
                value={<Num value={row.value} format="currencyCompact" currency={currency} />}
              />
            ))}
            <div className="mt-2 border-t border-line pt-2">
              <StatRow label="Shares outstanding" value={<Num value={m.sharesOutstanding} format="shares" />} />
              <StatRow label="Book value per share" value={<Num value={m.bookValuePerShare} format="currency" currency={currency} decimals={2} />} />
              <StatRow label="Beta" value={<Num value={m.beta} format="ratio" />} />
              <StatRow label="52-week range" value={
                <span className="num text-xs">
                  <Num value={m.week52Low} format="currency" currency={currency} className="text-xs" />
                  <span className="text-ink-4"> — </span>
                  <Num value={m.week52High} format="currency" currency={currency} className="text-xs" />
                </span>
              } />
            </div>
          </Panel>

          {geographies.length ? (
            <Panel>
              <PanelHeader title="Revenue by geography" dense subtitle={`FY${latestSegmentYear}`} />
              {geographies.map((g) => (
                <StatRow
                  key={g.segment}
                  label={g.segment}
                  value={
                    <span className="flex items-baseline gap-3">
                      <Num value={g.revenue} format="currencyCompact" currency={currency} className="text-2xs" />
                      <span className="num w-10 text-right text-2xs text-ink-3">
                        {geoTotal ? formatPercent((g.revenue ?? 0) / geoTotal, 0) : '—'}
                      </span>
                    </span>
                  }
                />
              ))}
            </Panel>
          ) : null}

          <Panel>
            <PanelHeader title="Management" dense />
            {dossier.management.length === 0 ? (
              <p className="py-3 text-center text-xs text-ink-3">No management record in the workspace.</p>
            ) : dossier.management.map((p) => (
              <div key={p.name} className="border-b border-line/60 py-2 last:border-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-medium text-ink">{p.name}</span>
                  <span className="num text-2xs text-ink-4">{p.since ? `since ${p.since}` : ''}</span>
                </div>
                <div className="text-2xs text-ink-3">{p.role}</div>
                {p.background ? <div className="mt-0.5 text-2xs text-ink-4">{p.background}</div> : null}
              </div>
            ))}
          </Panel>

          <Panel>
            <PanelHeader title="Ownership" dense actions={<Link href={`/companies/${company.ticker}/ownership`} className="text-xs text-accent hover:underline">Detail</Link>} />
            {dossier.ownership.length === 0 ? (
              <p className="py-3 text-center text-xs text-ink-3">No ownership record.</p>
            ) : dossier.ownership.slice(0, 6).map((o) => (
              <StatRow
                key={o.holder}
                label={<span className="truncate">{o.holder}</span>}
                value={<Num value={o.stake} format="percent" />}
              />
            ))}
          </Panel>

          <Panel>
            <PanelHeader title="Data quality" dense />
            <StatRow label="Basis period" value={<span className="num text-xs text-ink">{m.basisLabel}</span>} />
            <StatRow label="Annual periods" value={<span className="num text-xs text-ink">{m.dataQuality.annualPeriods}</span>} />
            <StatRow label="Quarterly periods" value={<span className="num text-xs text-ink">{m.dataQuality.quarterlyPeriods}</span>} />
            <StatRow
              label="Balance sheet"
              value={m.dataQuality.balanceSheetBalances
                ? <Badge tone="pos">Balances</Badge>
                : <Badge tone="neg">Does not balance</Badge>}
            />
            <StatRow
              label="Missing fields"
              value={m.dataQuality.missingFields.length
                ? <span className="text-2xs text-warn">{m.dataQuality.missingFields.join(', ')}</span>
                : <Badge tone="pos">None</Badge>}
            />
            <StatRow label="Source" value={<span className="text-2xs text-ink-3">{m.dataQuality.source}</span>} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
