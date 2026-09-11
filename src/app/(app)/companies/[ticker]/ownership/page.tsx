import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requirePageContext } from '@/server/context';
import { getCompanyDossier } from '@/server/services/company';
import { Badge, Grid, InlineNote, Panel, PanelHeader } from '@/components/ui/primitives';
import { Bps, MetricCard, Num, StatRow } from '@/components/ui/values';
import { BarSeriesChart, WaterfallChart } from '@/components/charts';
import { freeCashFlow } from '@/lib/finance/ratios';
import { formatPercent } from '@/lib/finance/format';
import { isNum, safeDiv } from '@/lib/finance/core';
import type { Currency } from '@/lib/finance/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} — Ownership & management` };
}

const OWNERSHIP_LABELS: Record<string, string> = {
  CONTROLLING: 'Controlling', INSTITUTIONAL: 'Institutional', RETAIL: 'Free float / retail',
  TREASURY: 'Treasury', INSIDER: 'Insider',
};

export default async function OwnershipPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  await requirePageContext();
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) notFound();

  const currency = dossier.company.currency as Currency;
  const { annuals, metrics: m } = dossier;
  const latest = annuals[annuals.length - 1];

  const capitalAllocation = annuals.slice(-5).map((p) => ({
    label: p.label,
    capex: isNum(p.cashFlow.capex) ? Math.abs(p.cashFlow.capex as number) : null,
    acquisitions: isNum(p.cashFlow.acquisitions) ? Math.abs(p.cashFlow.acquisitions as number) : null,
    dividends: isNum(p.cashFlow.dividendsPaid) ? Math.abs(p.cashFlow.dividendsPaid as number) : null,
    buybacks: isNum(p.cashFlow.buybacks) ? Math.abs(p.cashFlow.buybacks as number) : null,
    debtRepaid: isNum(p.cashFlow.debtRepaid) ? Math.abs(p.cashFlow.debtRepaid as number) : null,
  }));

  const cfo = latest?.cashFlow.cfo ?? null;
  const uses = latest
    ? [
        { label: 'Capital expenditure', value: isNum(latest.cashFlow.capex) ? Math.abs(latest.cashFlow.capex as number) : null },
        { label: 'Acquisitions', value: isNum(latest.cashFlow.acquisitions) ? Math.abs(latest.cashFlow.acquisitions as number) : null },
        { label: 'Dividends', value: isNum(latest.cashFlow.dividendsPaid) ? Math.abs(latest.cashFlow.dividendsPaid as number) : null },
        { label: 'Buybacks', value: isNum(latest.cashFlow.buybacks) ? Math.abs(latest.cashFlow.buybacks as number) : null },
        { label: 'Debt repayment', value: isNum(latest.cashFlow.debtRepaid) ? Math.abs(latest.cashFlow.debtRepaid as number) : null },
      ]
    : [];

  const byKind = dossier.ownership.reduce<Record<string, number>>((acc, o) => {
    acc[o.kind] = (acc[o.kind] ?? 0) + o.stake;
    return acc;
  }, {});

  const payoutRatio = safeDiv(
    isNum(latest?.cashFlow.dividendsPaid) ? Math.abs(latest!.cashFlow.dividendsPaid as number) : null,
    latest?.income.netIncome ?? null,
  );
  const fcfPayout = safeDiv(
    isNum(latest?.cashFlow.dividendsPaid) ? Math.abs(latest!.cashFlow.dividendsPaid as number) : null,
    latest ? freeCashFlow(latest) : null,
  );

  return (
    <div className="space-y-4">
      <Grid cols={4} gap={2}>
        <MetricCard label="Dividend yield" value={m.dividendYield} format="percent" />
        <MetricCard label="Payout of net income" value={payoutRatio} format="percent" />
        <MetricCard label="Payout of free cash flow" value={fcfPayout} format="percent"
          tooltip="A payout above 100% of free cash flow is funded by the balance sheet, not by the business." />
        <MetricCard label="Capex / revenue" value={m.capexToRevenue} format="percent" />
      </Grid>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel padded={false}>
          <div className="p-3 pb-2">
            <PanelHeader title="Shareholder register" subtitle="As recorded in the workspace." dense />
          </div>
          <table className="w-full border-collapse text-base">
            <thead>
              <tr className="bg-raised">
                <th className="label border-b border-line px-2.5 py-1.5 text-left">Holder</th>
                <th className="label border-b border-line px-2.5 py-1.5 text-left">Type</th>
                <th className="label border-b border-line px-2.5 py-1.5 text-right">Stake</th>
              </tr>
            </thead>
            <tbody>
              {dossier.ownership.map((o) => (
                <tr key={o.holder} className="border-b border-line/50">
                  <td className="px-2.5 py-1 text-ink-2">{o.holder}</td>
                  <td className="px-2.5 py-1"><Badge tone="outline">{OWNERSHIP_LABELS[o.kind] ?? o.kind}</Badge></td>
                  <td className="px-2.5 py-1 text-right"><Num value={o.stake} format="percent" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-line p-3">
            {Object.entries(byKind).map(([kind, stake]) => (
              <StatRow key={kind} label={OWNERSHIP_LABELS[kind] ?? kind} value={<Num value={stake} format="percent" />} />
            ))}
            {byKind.CONTROLLING && byKind.CONTROLLING > 0.5 ? (
              <div className="mt-2">
                <InlineNote tone="warn">
                  A controlling holder above 50% means minority shareholders do not decide outcomes. Governance
                  belongs in the risk section of the thesis, not only in the valuation discount.
                </InlineNote>
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Management" subtitle="Tenure and background as recorded." dense />
          {dossier.management.map((p) => (
            <div key={p.name} className="border-b border-line/60 py-2.5 last:border-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-base font-medium text-ink">{p.name}</span>
                <span className="num text-2xs text-ink-4">{p.since ? `since ${p.since}` : ''}</span>
              </div>
              <div className="text-xs text-ink-3">{p.role}</div>
              {p.background ? <p className="mt-1 text-xs leading-relaxed text-ink-4">{p.background}</p> : null}
            </div>
          ))}
          <div className="mt-3 border-t border-line pt-3">
            <p className="label mb-1.5">Promised against delivered</p>
            <p className="text-xs leading-relaxed text-ink-3">
              Guidance recorded with each release is compared against the reported figure in the earnings tab.
              The comparison is only as good as the guidance the workspace holds — where no guidance was recorded,
              nothing is inferred.
            </p>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <BarSeriesChart
          data={capitalAllocation} xKey="label" stacked height={250}
          series={[
            { key: 'capex', label: 'Capex', format: 'currencyMillions', currency },
            { key: 'acquisitions', label: 'Acquisitions', format: 'currencyMillions', currency },
            { key: 'dividends', label: 'Dividends', format: 'currencyMillions', currency },
            { key: 'buybacks', label: 'Buybacks', format: 'currencyMillions', currency },
            { key: 'debtRepaid', label: 'Debt repayment', format: 'currencyMillions', currency },
          ]}
          title="Where the cash went"
          subtitle="Uses of cash by year, in reported currency"
          yFormat="currencyMillions" currency={currency}
          footnote="All figures shown as positive magnitudes of cash outflow."
        />

        <Panel>
          <PanelHeader title="Is capital being allocated well?" dense />
          {isNum(cfo) ? (
            <>
              <StatRow label="Cash from operations" value={<Num value={cfo} format="currencyMillions" currency={currency} />} />
              {uses.map((u) => (
                <StatRow
                  key={u.label}
                  label={u.label}
                  value={
                    <span className="flex items-baseline gap-3">
                      <Num value={u.value} format="currencyMillions" currency={currency} className="text-2xs" />
                      <span className="num w-11 text-right text-2xs text-ink-3">
                        {isNum(u.value) ? formatPercent((u.value as number) / (cfo as number), 0) : '—'}
                      </span>
                    </span>
                  }
                />
              ))}
              <div className="mt-3 border-t border-line pt-3">
                <StatRow label="ROIC" value={<Num value={m.roic} format="percent" />} />
                <StatRow label="WACC" value={<Num value={m.wacc} format="percent" />} />
                <StatRow label="Spread" value={<Bps value={m.roicSpread} />} />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-2">
                {m.bankLike
                  ? 'Return on invested capital is not the right test for a bank. Return on equity against the cost of equity is the comparable measure.'
                  : !isNum(m.roicSpread)
                    ? 'The spread cannot be computed, so reinvestment cannot be judged against the cost of capital.'
                    : (m.roicSpread as number) > 0
                      ? `Return on capital exceeds the cost of capital by ${formatPercent(Math.abs(m.roicSpread as number))}. Reinvestment adds value at the margin, so a high capex share is defensible.`
                      : `Return on capital is ${formatPercent(Math.abs(m.roicSpread as number))} below the cost of capital. On this measure distributions or debt reduction would be a higher-return use than reinvestment.`}
              </p>
              <p className="mt-2 text-2xs leading-relaxed text-ink-4">
                This is a judgement about the return on the next unit of capital, which no historical statement can
                settle. The spread is the closest observable proxy.
              </p>
            </>
          ) : (
            <InlineNote tone="info">The cash-flow statement for the latest period is not available.</InlineNote>
          )}
        </Panel>
      </div>

      {latest ? (
        <WaterfallChart
          steps={[
            { label: 'Cash from operations', value: cfo ?? 0, kind: 'total' },
            ...uses.filter((u) => isNum(u.value)).map((u) => ({ label: u.label, value: -(u.value as number) })),
            { label: 'Residual', value: (cfo ?? 0) - uses.reduce((s, u) => s + (isNum(u.value) ? (u.value as number) : 0), 0), kind: 'total' as const },
          ]}
          title={`Capital allocation — ${latest.label}`}
          subtitle="Operating cash flow through each use to the residual"
          format="currencyMillions" currency={currency} height={280}
        />
      ) : null}
    </div>
  );
}
