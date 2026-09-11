import type { Metadata } from 'next';
import Link from 'next/link';
import { requirePageContext } from '@/server/context';
import { prisma, parseJson } from '@/lib/db';
import { Badge, InlineNote, PageHeader, Panel, PanelHeader } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { MetricCard } from '@/components/ui/values';
import { formatDateTime } from '@/lib/finance/format';

export const metadata: Metadata = { title: 'Data sources' };
export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<string, 'pos' | 'warn' | 'neg'> = {
  CONNECTED: 'pos', DEGRADED: 'warn', DISCONNECTED: 'neg',
};

const KIND_LABEL: Record<string, string> = {
  MARKET_DATA: 'Market data', FUNDAMENTALS: 'Fundamentals', CONSENSUS: 'Consensus',
  NEWS: 'News', USER_UPLOAD: 'User uploads', MANUAL: 'Manual entry',
};

export default async function DataSourcesPage() {
  const ctx = await requirePageContext();

  const [sources, counts, latestPrice, latestStatement] = await Promise.all([
    prisma.dataSource.findMany({ where: { workspaceId: ctx.workspaceId }, orderBy: { kind: 'asc' } }),
    Promise.all([
      prisma.company.count(),
      prisma.financialStatement.count(),
      prisma.priceBar.count(),
      prisma.estimate.count(),
      prisma.newsItem.count(),
      prisma.document.count({ where: { workspaceId: ctx.workspaceId } }),
      prisma.normalizationAdjustment.count({ where: { workspaceId: ctx.workspaceId } }),
    ]),
    prisma.priceBar.findFirst({ orderBy: { date: 'desc' }, select: { date: true } }),
    prisma.financialStatement.findFirst({ orderBy: { endDate: 'desc' }, select: { endDate: true, label: true } }),
  ]);

  const [companies, statements, bars, estimates, news, documents, adjustments] = counts;
  const simulated = sources.filter((s) => s.isMock).length;

  return (
    <>
      <PageHeader
        title="Data sources"
        subtitle="Where every figure on the screen comes from. Nothing in MERIDIAN is presented without a source, and simulated data is labelled as such everywhere it appears."
        breadcrumb={<Link href="/settings" className="hover:text-accent">Settings</Link>}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Companies covered" value={companies} format="number" decimals={0} />
        <MetricCard label="Statement periods" value={statements} format="number" decimals={0} sublabel={latestStatement ? `Latest ${latestStatement.label}` : undefined} />
        <MetricCard label="Price observations" value={bars} format="number" decimals={0} sublabel={latestPrice ? `To ${latestPrice.date.toISOString().slice(0, 10)}` : undefined} />
        <MetricCard label="Estimates on record" value={estimates} format="number" decimals={0} sublabel="Consensus lines" />
      </div>

      {simulated > 0 ? (
        <InlineNote tone="warn">
          {simulated} of {sources.length} sources are simulated. MockMarketDataProvider generates an internally
          consistent universe — the balance sheet balances and the cash-flow statement articulates with the change in
          cash — so the platform&apos;s calculations can be exercised end to end. It is not market data, it is never
          presented as market data, and every screen that shows it says so.
        </InlineNote>
      ) : null}

      <div className="mt-4 space-y-3">
        {sources.map((s) => {
          const coverage = parseJson<Record<string, unknown>>(s.coverage, {});
          const stale = s.lastSyncAt ? Date.now() - s.lastSyncAt.getTime() > 5 * 86400000 : false;
          return (
            <Panel key={s.id}>
              <PanelHeader
                title={
                  <span className="flex items-center gap-2">
                    {s.name}
                    {s.isMock ? <Badge tone="warn">simulated</Badge> : null}
                  </span>
                }
                subtitle={s.notes ?? undefined}
                actions={
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral">{KIND_LABEL[s.kind] ?? s.kind}</Badge>
                    <Badge tone={STATUS_TONE[s.status] ?? 'neutral'}>{s.status.toLowerCase()}</Badge>
                  </div>
                }
              />
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-3 pb-3 text-2xs text-ink-3">
                <span className="font-mono text-ink-4">{s.code}</span>
                <span>
                  Last refresh{' '}
                  <span className={stale ? 'text-warn' : 'text-ink-2'}>
                    {s.lastSyncAt ? formatDateTime(s.lastSyncAt) : 'never'}
                  </span>
                  {stale ? ' — more than five days old' : ''}
                </span>
                {Object.entries(coverage).map(([k, v]) => (
                  <span key={k}>
                    {k}: <span className="text-ink-2">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                  </span>
                ))}
              </div>
            </Panel>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="What the platform holds" subtitle="Counted across this workspace" />
          <div className="px-3 pb-3">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-line">
                <Row label="Companies" value={companies} note="Shared across the organisation" />
                <Row label="Statement periods" value={statements} note="Annual and quarterly, as reported" />
                <Row label="Price observations" value={bars} note="One row per trading day per security" />
                <Row label="Consensus estimates" value={estimates} note="Simulated; no consensus vendor is connected" />
                <Row label="News items" value={news} note="Simulated; no news wire is connected" />
                <Row label="Uploaded documents" value={documents} note="Extracted text only; binaries are not stored" />
                <Row label="Normalization adjustments" value={adjustments} note="Manual, each one attributed and reversible" />
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="How a figure reaches the screen" />
          <ol className="space-y-2.5 px-3 pb-3 text-xs leading-relaxed text-ink-2">
            <li className="flex gap-2">
              <span className="num shrink-0 text-ink-4">1</span>
              <span>A provider supplies statements, prices and reference data through one interface, so the source can be swapped without touching anything downstream.</span>
            </li>
            <li className="flex gap-2">
              <span className="num shrink-0 text-ink-4">2</span>
              <span>The statements are stored as reported. Any change to them is a normalization adjustment, recorded separately with its reason and its author.</span>
            </li>
            <li className="flex gap-2">
              <span className="num shrink-0 text-ink-4">3</span>
              <span>The financial engine computes every ratio, return and valuation from those statements. It is pure TypeScript with no database access, and it returns <code className="text-ink">null</code> where a figure cannot be computed — never zero.</span>
            </li>
            <li className="flex gap-2">
              <span className="num shrink-0 text-ink-4">4</span>
              <span>The screen renders that result. A dash means the datum does not exist; &ldquo;n/m&rdquo; means the measure is not meaningful for that kind of company, with the reason on hover.</span>
            </li>
          </ol>
          <p className="px-3 pb-3 text-2xs text-ink-4">
            No calculation happens inside a React component, and no figure is invented to fill a gap.
          </p>
        </Panel>
      </div>
    </>
  );
}

function Row({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <tr>
      <td className="py-1.5 text-ink-2">
        {label}
        <span className="ml-2 text-2xs text-ink-4">{note}</span>
      </td>
      <td className="py-1.5 text-right num text-ink">{value.toLocaleString('pt-BR')}</td>
    </tr>
  );
}
