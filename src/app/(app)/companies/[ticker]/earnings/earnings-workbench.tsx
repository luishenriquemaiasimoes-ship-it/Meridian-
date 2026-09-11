'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Badge, Button, cx, EmptyState, InlineNote, Panel, PanelHeader, useToast } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { Delta, Num, StatRow } from '@/components/ui/values';
import { BarSeriesChart } from '@/components/charts';
import { formatDate, formatPercent } from '@/lib/finance/format';
import type { EarningsDetail } from '@/server/services/earnings';
import type { Currency } from '@/lib/finance/types';

export function EarningsWorkbench({
  ticker, companyId, currency, events, selectedId, detail, canWrite, documents,
}: {
  ticker: string;
  companyId: string;
  currency: Currency;
  events: { id: string; label: string; reportDate: string; status: string; revenue: number | null; ebitda: number | null; eps: number | null }[];
  selectedId: string | null;
  detail: EarningsDetail | null;
  canWrite: boolean;
  documents: { id: string; name: string; kind: string; sizeBytes: number; createdAt: string; uploadedBy: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [savingReview, setSavingReview] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('companyId', companyId);
      body.append('kind', 'EARNINGS_RELEASE');
      const res = await fetch('/api/documents', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Upload failed', description: data.error }); return; }
      toast.push({
        tone: 'pos',
        title: 'Document stored',
        description: data.extracted
          ? `${data.extracted} figures were located in the file and linked to their source line.`
          : 'The text was stored. No financial figures could be located automatically.',
      });
      router.refresh();
    } finally {
      setUploading(false);
    }
  };

  const saveReview = async () => {
    if (!detail) return;
    setSavingReview(true);
    try {
      const res = await fetch('/api/earnings/review', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId, earningsId: detail.id,
          headline: detail.analysis.headline,
          analysis: detail.analysis,
          thesisImpact: detail.analysis.thesisImpact.verdict,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Could not save the review', description: data.error }); return; }
      toast.push({ tone: 'pos', title: 'Review saved to the workspace' });
      router.refresh();
    } finally {
      setSavingReview(false);
    }
  };

  const chartData = events.slice(0, 8).reverse().map((e) => ({
    label: e.label, revenue: e.revenue, ebitda: e.ebitda,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
      <div className="space-y-4">
        <Panel padded={false}>
          <div className="p-3 pb-1"><PanelHeader title="Reported periods" dense /></div>
          <div className="max-h-[420px] overflow-y-auto">
            {events.map((e) => (
              <Link
                key={e.id}
                href={`/companies/${ticker}/earnings?id=${e.id}`}
                className={cx(
                  'block border-b border-line/60 px-3 py-2 transition last:border-0',
                  e.id === selectedId ? 'bg-accent/[0.08]' : 'hover:bg-raised',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="num text-xs font-medium text-ink">{e.label}</span>
                  <Badge tone={e.status === 'REPORTED' ? 'neutral' : 'outline'}>{e.status.toLowerCase()}</Badge>
                </div>
                <span className="block text-2xs text-ink-4">{formatDate(e.reportDate)}</span>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Upload a release" subtitle="PDF, Excel, CSV or text." dense />
          <label className={cx(
            'flex cursor-pointer items-center justify-center gap-2 rounded border border-dashed border-line-strong px-3 py-4 text-xs text-ink-3 transition',
            uploading ? 'opacity-50' : 'hover:border-accent hover:text-ink-2',
          )}>
            {uploading ? <Icon.Refresh size={14} className="animate-spin" /> : <Icon.Upload size={14} />}
            {uploading ? 'Reading…' : 'Choose a file'}
            <input
              type="file" className="hidden" disabled={uploading}
              accept=".pdf,.csv,.tsv,.txt,.xlsx,.xls"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
            />
          </label>
          <p className="mt-2 text-2xs leading-relaxed text-ink-4">
            The extractor reads figures out of the file and keeps a reference to the line it came from.
            Nothing is written into the statements automatically — extracted values are shown for review.
          </p>
          {documents.length ? (
            <div className="mt-3 border-t border-line pt-2">
              <p className="label mb-1.5">Documents on file</p>
              {documents.map((d) => (
                <Link key={d.id} href={`/library/${d.id}`} className="block truncate py-0.5 text-2xs text-ink-3 hover:text-ink">
                  {d.name}
                </Link>
              ))}
            </div>
          ) : null}
        </Panel>
      </div>

      <div className="space-y-4">
        {!detail ? (
          <Panel>
            <EmptyState
              title="No reported period selected"
              description="Pick a quarter on the left, or upload a release to add one."
              icon={<Icon.Earnings size={22} />}
            />
          </Panel>
        ) : (
          <>
            <Panel>
              <PanelHeader
                title={`${detail.label} — reported ${formatDate(detail.reportDate)}`}
                subtitle={detail.analysis.headline}
                actions={
                  canWrite ? (
                    <Button size="sm" icon={<Icon.Save size={12} />} onClick={saveReview} loading={savingReview}>
                      {detail.savedReview ? 'Update review' : 'Save review'}
                    </Button>
                  ) : null
                }
              />
              {detail.savedReview ? (
                <p className="mb-3 text-2xs text-ink-4">
                  Review saved by {detail.savedReview.author} on {formatDate(detail.savedReview.createdAt)}.
                </p>
              ) : null}

              <div className="overflow-auto">
                <table className="w-full border-collapse text-base">
                  <thead>
                    <tr className="bg-raised">
                      <th className="label border-b border-line px-2.5 py-1.5 text-left">Metric</th>
                      <th className="label border-b border-line px-2.5 py-1.5 text-right">Reported</th>
                      <th className="label border-b border-line px-2.5 py-1.5 text-right">Consensus</th>
                      <th className="label border-b border-line px-2.5 py-1.5 text-right">vs cons.</th>
                      <th className="label border-b border-line px-2.5 py-1.5 text-right">Prior year</th>
                      <th className="label border-b border-line px-2.5 py-1.5 text-right">YoY</th>
                      <th className="label border-b border-line px-2.5 py-1.5 text-right">Prior quarter</th>
                      <th className="label border-b border-line px-2.5 py-1.5 text-right">QoQ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.comparisons.map((c) => (
                      <tr key={c.metric} className="border-b border-line/50">
                        <td className="px-2.5 py-1 text-ink-2">{c.label}</td>
                        <td className="px-2.5 py-1 text-right"><Num value={c.actual} format={c.format} currency={currency} decimals={c.format === 'currency' ? 2 : undefined} className="font-medium" /></td>
                        <td className="px-2.5 py-1 text-right"><Num value={c.consensus} format={c.format} currency={currency} decimals={c.format === 'currency' ? 2 : undefined} muted /></td>
                        <td className="px-2.5 py-1 text-right"><Delta value={c.vsConsensus} /></td>
                        <td className="px-2.5 py-1 text-right"><Num value={c.priorYear} format={c.format} currency={currency} decimals={c.format === 'currency' ? 2 : undefined} muted /></td>
                        <td className="px-2.5 py-1 text-right"><Delta value={c.vsPriorYear} /></td>
                        <td className="px-2.5 py-1 text-right"><Num value={c.priorQuarter} format={c.format} currency={currency} decimals={c.format === 'currency' ? 2 : undefined} muted /></td>
                        <td className="px-2.5 py-1 text-right"><Delta value={c.vsPriorQuarter} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-2xs text-ink-4">
                Consensus figures come from MockConsensusProvider and are simulated. They are stored per period, so
                the comparison is against what was recorded before the print, not a figure rebuilt afterwards.
              </p>
            </Panel>

            <BarSeriesChart
              data={chartData} xKey="label" height={220}
              series={[
                { key: 'revenue', label: 'Revenue', format: 'currencyMillions', currency },
                { key: 'ebitda', label: 'EBITDA', format: 'currencyMillions', currency },
              ]}
              title="Quarterly trajectory"
              subtitle="The last eight reported quarters"
              yFormat="currencyMillions" currency={currency}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <Panel>
                <PanelHeader title="What the print says" dense />
                <p className="label mb-1.5">Positives</p>
                {detail.analysis.keyPositives.length ? (
                  <ul className="mb-3 space-y-1">
                    {detail.analysis.keyPositives.map((p) => (
                      <li key={p} className="flex gap-2 text-xs leading-relaxed text-ink-2">
                        <Icon.ArrowUp size={11} className="mt-1 shrink-0 text-pos" />{p}
                      </li>
                    ))}
                  </ul>
                ) : <p className="mb-3 text-xs text-ink-3">Nothing in the comparison reads as a positive.</p>}

                <p className="label mb-1.5">Negatives</p>
                {detail.analysis.keyNegatives.length ? (
                  <ul className="space-y-1">
                    {detail.analysis.keyNegatives.map((p) => (
                      <li key={p} className="flex gap-2 text-xs leading-relaxed text-ink-2">
                        <Icon.ArrowDown size={11} className="mt-1 shrink-0 text-neg" />{p}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-ink-3">Nothing in the comparison reads as a negative.</p>}
              </Panel>

              <Panel>
                <PanelHeader title="Surprises and guidance" dense />
                {detail.analysis.surprises.length ? (
                  <ul className="mb-3 space-y-1">
                    {detail.analysis.surprises.map((s) => (
                      <li key={s} className="flex gap-2 text-xs leading-relaxed text-ink-2">
                        <Icon.Sparkle size={11} className="mt-1 shrink-0 text-brass" />{s}
                      </li>
                    ))}
                  </ul>
                ) : <p className="mb-3 text-xs text-ink-3">No line moved more than two percent against consensus.</p>}

                <p className="label mb-1.5">Guidance recorded with the release</p>
                {detail.analysis.guidance.length ? (
                  detail.analysis.guidance.map((g) => <StatRow key={g.label} label={g.label} value={<span className="text-xs text-ink-2">{g.value}</span>} />)
                ) : <p className="text-xs text-ink-3">No guidance recorded for this period.</p>}
              </Panel>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Panel>
                <PanelHeader title="Margins" dense />
                {detail.analysis.marginAnalysis.map((m) => (
                  <p key={m} className="mb-1.5 text-xs leading-relaxed text-ink-2">{m}</p>
                ))}
              </Panel>
              <Panel>
                <PanelHeader title="Cash flow" dense />
                {detail.analysis.cashFlowAnalysis.map((m) => (
                  <p key={m} className="mb-1.5 text-xs leading-relaxed text-ink-2">{m}</p>
                ))}
              </Panel>
              <Panel>
                <PanelHeader title="Balance sheet" dense />
                {detail.analysis.balanceSheetAnalysis.map((m) => (
                  <p key={m} className="mb-1.5 text-xs leading-relaxed text-ink-2">{m}</p>
                ))}
              </Panel>
            </div>

            <Panel>
              <PanelHeader title="Does this change the thesis?" subtitle="The four questions the desk asks after every print." />
              <div className="space-y-3">
                <div>
                  <p className="label mb-1">What changed</p>
                  <p className="text-base leading-relaxed text-ink-2">{detail.analysis.whatChanged}</p>
                </div>
                <div>
                  <p className="label mb-1">Temporary or structural</p>
                  <p className="text-base leading-relaxed text-ink-2">{detail.analysis.temporaryOrStructural}</p>
                </div>
                <div>
                  <p className="label mb-1 flex items-center gap-2">
                    Thesis impact
                    <Badge tone={detail.analysis.thesisImpact.verdict === 'SUPPORTS' ? 'pos' : detail.analysis.thesisImpact.verdict === 'WEAKENS' ? 'neg' : 'neutral'}>
                      {detail.analysis.thesisImpact.verdict.toLowerCase()}
                    </Badge>
                  </p>
                  <p className="text-base leading-relaxed text-ink-2">{detail.analysis.thesisImpact.text}</p>
                </div>
                <div>
                  <p className="label mb-1">Valuation impact</p>
                  <p className="text-base leading-relaxed text-ink-2">{detail.analysis.valuationImpact}</p>
                </div>
              </div>
              {detail.analysis.managementCommentary ? (
                <div className="mt-4 border-t border-line pt-3">
                  <p className="label mb-1">Management commentary as recorded</p>
                  <p className="text-xs leading-relaxed text-ink-3">{detail.analysis.managementCommentary}</p>
                </div>
              ) : null}
              <div className="mt-3">
                <InlineNote tone="info">
                  Every sentence above is derived from the comparison table on this page and the thesis thresholds
                  recorded in the workspace. Nothing here is drawn from outside the workspace.
                </InlineNote>
              </div>
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}
