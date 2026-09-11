import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requirePageContext } from '@/server/context';
import { getCompanyDossier } from '@/server/services/company';
import { InlineNote, Panel, PanelHeader } from '@/components/ui/primitives';
import { Num } from '@/components/ui/values';
import { AreaSeriesChart, BarSeriesChart, LineSeriesChart } from '@/components/charts';
import { formatPercent } from '@/lib/finance/format';
import { growth, safeDiv } from '@/lib/finance/core';
import type { Currency } from '@/lib/finance/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} — Segments` };
}

export default async function SegmentsPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  await requirePageContext();
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) notFound();

  const currency = dossier.company.currency as Currency;
  const business = dossier.segments.filter((s) => s.kind === 'BUSINESS');
  const geography = dossier.segments.filter((s) => s.kind === 'GEOGRAPHY');

  if (!business.length) {
    return (
      <Panel>
        <PanelHeader title="Segment analysis" />
        <InlineNote tone="info">
          {dossier.company.ticker} does not disclose segment figures in this workspace. Upload a filing with a
          segment table, or connect a fundamentals provider that supplies them.
        </InlineNote>
      </Panel>
    );
  }

  const years = Array.from(new Set(business.map((s) => s.fiscalYear))).sort();
  const names = Array.from(new Set(business.map((s) => s.segment)));
  const latestYear = years[years.length - 1];
  const priorYear = years[years.length - 2] ?? null;

  const revenueByYear = years.map((y) => {
    const row: Record<string, string | number | null> = { label: `FY${y}` };
    for (const n of names) {
      row[n] = business.find((s) => s.fiscalYear === y && s.segment === n)?.revenue ?? null;
    }
    return row;
  });

  const marginByYear = years.map((y) => {
    const row: Record<string, string | number | null> = { label: `FY${y}` };
    for (const n of names) {
      const seg = business.find((s) => s.fiscalYear === y && s.segment === n);
      row[n] = safeDiv(seg?.ebitda ?? null, seg?.revenue ?? null);
    }
    return row;
  });

  const totalRevenueLatest = business
    .filter((s) => s.fiscalYear === latestYear)
    .reduce((sum, s) => sum + (s.revenue ?? 0), 0);
  const totalRevenuePrior = priorYear
    ? business.filter((s) => s.fiscalYear === priorYear).reduce((sum, s) => sum + (s.revenue ?? 0), 0)
    : null;

  const contribution = names.map((n) => {
    const now = business.find((s) => s.fiscalYear === latestYear && s.segment === n);
    const before = priorYear ? business.find((s) => s.fiscalYear === priorYear && s.segment === n) : null;
    const delta = (now?.revenue ?? 0) - (before?.revenue ?? 0);
    return {
      label: n,
      contribution: totalRevenuePrior ? delta / totalRevenuePrior : null,
      revenueGrowth: growth(now?.revenue ?? null, before?.revenue ?? null),
    };
  });

  const geoYears = Array.from(new Set(geography.map((g) => g.fiscalYear))).sort();
  const geoNames = Array.from(new Set(geography.map((g) => g.segment)));
  const geoByYear = geoYears.map((y) => {
    const row: Record<string, string | number | null> = { label: `FY${y}` };
    for (const n of geoNames) {
      row[n] = geography.find((g) => g.fiscalYear === y && g.segment === n)?.revenue ?? null;
    }
    return row;
  });

  return (
    <div className="space-y-4">
      <Panel padded={false}>
        <div className="p-3 pb-2">
          <PanelHeader
            title={`Segment detail — FY${latestYear}`}
            subtitle="Revenue, EBITDA, margin and market share as disclosed. A blank cell means the company does not break the figure out."
            dense
          />
        </div>
        <div className="overflow-auto">
          <table className="w-full border-collapse text-base">
            <thead>
              <tr className="bg-raised">
                <th className="label border-b border-line px-2.5 py-1.5 text-left">Segment</th>
                <th className="label border-b border-line px-2.5 py-1.5 text-right">Revenue</th>
                <th className="label border-b border-line px-2.5 py-1.5 text-right">% of total</th>
                <th className="label border-b border-line px-2.5 py-1.5 text-right">EBITDA</th>
                <th className="label border-b border-line px-2.5 py-1.5 text-right">Margin</th>
                <th className="label border-b border-line px-2.5 py-1.5 text-right">Growth</th>
                <th className="label border-b border-line px-2.5 py-1.5 text-right">Capex</th>
                <th className="label border-b border-line px-2.5 py-1.5 text-right">Market share</th>
              </tr>
            </thead>
            <tbody>
              {names.map((n) => {
                const now = business.find((s) => s.fiscalYear === latestYear && s.segment === n);
                const before = priorYear ? business.find((s) => s.fiscalYear === priorYear && s.segment === n) : null;
                return (
                  <tr key={n} className="border-b border-line/50 hover:bg-raised">
                    <td className="px-2.5 py-1 text-ink-2">{n}</td>
                    <td className="px-2.5 py-1 text-right"><Num value={now?.revenue ?? null} format="currencyMillions" currency={currency} /></td>
                    <td className="px-2.5 py-1 text-right"><Num value={totalRevenueLatest ? (now?.revenue ?? 0) / totalRevenueLatest : null} format="percent" /></td>
                    <td className="px-2.5 py-1 text-right"><Num value={now?.ebitda ?? null} format="currencyMillions" currency={currency} /></td>
                    <td className="px-2.5 py-1 text-right"><Num value={safeDiv(now?.ebitda ?? null, now?.revenue ?? null)} format="percent" /></td>
                    <td className="px-2.5 py-1 text-right"><Num value={growth(now?.revenue ?? null, before?.revenue ?? null)} format="percentSigned" /></td>
                    <td className="px-2.5 py-1 text-right"><Num value={now?.capex ?? null} format="currencyMillions" currency={currency} /></td>
                    <td className="px-2.5 py-1 text-right"><Num value={now?.marketShare ?? null} format="percent" /></td>
                  </tr>
                );
              })}
              <tr className="border-t border-line-strong font-medium">
                <td className="px-2.5 py-1 text-ink">Total</td>
                <td className="px-2.5 py-1 text-right"><Num value={totalRevenueLatest} format="currencyMillions" currency={currency} /></td>
                <td className="px-2.5 py-1 text-right"><Num value={1} format="percent" /></td>
                <td className="px-2.5 py-1 text-right">
                  <Num value={business.filter((s) => s.fiscalYear === latestYear).reduce((sum, s) => sum + (s.ebitda ?? 0), 0)} format="currencyMillions" currency={currency} />
                </td>
                <td colSpan={4} />
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <AreaSeriesChart
          data={revenueByYear} xKey="label" stacked height={250}
          series={names.map((n) => ({ key: n, label: n, format: 'currencyMillions', currency }))}
          title="Revenue by segment"
          subtitle="Stacked, in reported currency"
          yFormat="currencyMillions" currency={currency}
        />
        <LineSeriesChart
          data={marginByYear} xKey="label" height={250}
          series={names.map((n) => ({ key: n, label: n, format: 'percent' }))}
          yFormat="percent"
          title="EBITDA margin by segment"
          subtitle="Where the mix effect on group margin comes from"
        />
      </div>

      {priorYear ? (
        <BarSeriesChart
          data={contribution} xKey="label" horizontal height={220} colorBySign
          series={[{ key: 'contribution', label: 'Contribution to group revenue growth', format: 'percent' }]}
          title={`Contribution to revenue growth — FY${priorYear} to FY${latestYear}`}
          subtitle="Each segment's revenue change as a share of the prior-year group total; the bars sum to group growth"
          yFormat="percent"
        />
      ) : null}

      {geoByYear.length ? (
        <AreaSeriesChart
          data={geoByYear} xKey="label" stacked height={240}
          series={geoNames.map((n) => ({ key: n, label: n, format: 'currencyMillions', currency }))}
          title="Revenue by geography"
          subtitle="As disclosed by the company"
          yFormat="currencyMillions" currency={currency}
        />
      ) : null}

      <Panel>
        <PanelHeader title="What the mix says" dense />
        <ul className="space-y-2 text-base leading-relaxed text-ink-2">
          {(() => {
            const latest = business.filter((s) => s.fiscalYear === latestYear);
            const withMargin = latest.filter((s) => s.revenue && s.ebitda !== null);
            const best = withMargin.slice().sort((a, b) => (b.ebitda! / b.revenue!) - (a.ebitda! / a.revenue!))[0];
            const biggest = latest.slice().sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))[0];
            const fastest = contribution.filter((c) => c.revenueGrowth !== null).sort((a, b) => (b.revenueGrowth ?? 0) - (a.revenueGrowth ?? 0))[0];
            const items: string[] = [];
            if (biggest) items.push(`${biggest.segment} is the largest segment at ${formatPercent((biggest.revenue ?? 0) / totalRevenueLatest)} of group revenue.`);
            if (best && best !== biggest) items.push(`${best.segment} runs the highest margin at ${formatPercent(best.ebitda! / best.revenue!)}, so mix shifts toward it lift the group margin.`);
            if (fastest?.revenueGrowth) items.push(`${fastest.label} grew fastest at ${formatPercent(fastest.revenueGrowth, 1, { signed: true })} year on year.`);
            return items.map((t) => <li key={t}>{t}</li>);
          })()}
        </ul>
      </Panel>
    </div>
  );
}
