'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, cx, Field, InlineNote, Input, Modal, NumberInput, Panel, PanelHeader,
  Segmented, Select, Textarea, Tooltip, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { Num, RecommendationBadge, SeverityBadge, StatRow, ThesisVerdictBadge } from '@/components/ui/values';
import { DASH, formatDate, formatMetric, formatPercent, ordinal } from '@/lib/finance/format';
import { downloadText } from '@/lib/import/csv';
import { downloadResearchPdf, slugify } from '@/lib/export/pdf';
import { MEMO_SECTIONS, type MemoSection } from '@/lib/memo/sections';
import { isNum } from '@/lib/finance/core';
import type { MemoEvidence } from '@/server/services/memo';

type Mode = 'read' | 'edit';

const STATUS_TONE: Record<string, 'pos' | 'neutral' | 'warn' | 'neg'> = {
  APPROVED: 'pos', DRAFT: 'neutral', UNDER_REVIEW: 'warn', ARCHIVED: 'neutral', REJECTED: 'neg',
};

export function MemoEditor(props: {
  id: string;
  title: string;
  status: string;
  recommendation: string | null;
  targetPrice: number | null;
  portfolioRole: string | null;
  sections: MemoSection[];
  author: string;
  updatedAt: string;
  canWrite: boolean;
  canDecide: boolean;
  evidence: MemoEvidence | null;
  committeeItems: {
    id: string; title: string; status: string; proposal: string; meetingDate: string | null;
    votes: { user: string; vote: string; rationale: string | null }[];
  }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>('read');
  const [busy, setBusy] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [draft, setDraft] = useState({
    title: props.title,
    recommendation: props.recommendation ?? '',
    targetPrice: props.targetPrice,
    portfolioRole: props.portfolioRole ?? '',
    sections: props.sections.length ? props.sections : MEMO_SECTIONS.map((s) => ({ key: s.key, title: s.title, body: '' })),
  });

  const e = props.evidence;
  const currency = e?.currency ?? 'BRL';
  const written = draft.sections.filter((s) => s.body.trim()).length;
  const upside = props.targetPrice !== null && e?.price ? props.targetPrice / e.price - 1 : null;

  const setSection = (index: number, body: string) => {
    setDraft((d) => ({ ...d, sections: d.sections.map((s, i) => (i === index ? { ...s, body } : s)) }));
    setDirty(true);
  };

  const save = async (statusOverride?: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/memos/${props.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title,
          recommendation: draft.recommendation || null,
          targetPrice: draft.targetPrice,
          portfolioRole: draft.portfolioRole || null,
          sections: draft.sections,
          ...(statusOverride ? { status: statusOverride } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Not saved', description: data.error }); return; }
      toast.push({
        tone: 'pos',
        title: statusOverride ? `Memo moved to ${statusOverride.replace('_', ' ').toLowerCase()}` : 'Memo saved',
      });
      setDirty(false);
      setMode('read');
      router.refresh();
    } finally { setBusy(false); }
  };

  const setStatus = async (status: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/memos/${props.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Not updated', description: data.error }); return; }
      toast.push({ tone: 'pos', title: `Memo ${status.replace('_', ' ').toLowerCase()}` });
      router.refresh();
    } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/memos/${props.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        toast.push({ tone: 'neg', title: 'Not deleted', description: data.error });
        return;
      }
      toast.push({ tone: 'pos', title: 'Memo deleted' });
      router.push('/memos');
    } finally { setBusy(false); }
  };

  const exportPdf = () => {
    const figures: string[][] = e
      ? [
          ['Price', formatMetric(e.price, 'currency', { currency })],
          ['Market capitalisation', formatMetric(e.marketCap, 'currencyMillions', { currency })],
          ['Revenue growth', formatMetric(e.fundamentals.revenueGrowth, 'percent')],
          ['EBITDA margin', formatMetric(e.fundamentals.ebitdaMargin, 'percent')],
          ['ROIC', e.bankLike ? 'n/m for a bank' : formatMetric(e.fundamentals.roic, 'percent')],
          ['ROE', formatMetric(e.fundamentals.roe, 'percent')],
          ['WACC', formatMetric(e.fundamentals.wacc, 'percent')],
          ['ROIC less WACC', e.bankLike ? 'n/m for a bank' : formatMetric(e.fundamentals.roicSpread, 'percentSigned')],
          ['Net debt / EBITDA', formatMetric(e.fundamentals.netDebtToEbitda, 'multiple')],
          ['Interest coverage', formatMetric(e.fundamentals.interestCoverage, 'multiple')],
          ['FCF yield', formatMetric(e.fundamentals.fcfYield, 'percent')],
          ['P / E', formatMetric(e.multiples.pe, 'multiple')],
          ['EV / EBITDA', e.bankLike ? 'n/m for a bank' : formatMetric(e.multiples.evEbitda, 'multiple')],
        ]
      : [];

    downloadResearchPdf({
      kicker: 'Investment memo',
      title: props.title,
      subtitle: e ? `${e.ticker} — ${e.name} · ${e.sector}` : undefined,
      meta: [
        { label: 'Author', value: props.author },
        { label: 'Status', value: props.status.replace('_', ' ').toLowerCase() },
        { label: 'Last updated', value: props.updatedAt.slice(0, 10) },
        ...(props.recommendation ? [{ label: 'Recommendation', value: props.recommendation.replace('_', ' ') }] : []),
        ...(props.targetPrice !== null
          ? [{ label: 'Target price', value: formatMetric(props.targetPrice, 'currency', { currency }) }]
          : []),
        ...(isNum(upside) ? [{ label: 'Upside', value: formatMetric(upside, 'percentSigned') }] : []),
        ...(e ? [{ label: 'Basis', value: e.basisLabel }] : []),
        ...(props.portfolioRole ? [{ label: 'Portfolio role', value: props.portfolioRole }] : []),
      ],
      sections: props.sections.map((s) => ({ title: s.title, body: s.body })),
      tables: [
        ...(figures.length
          ? [{
              title: 'Appendix A — figures as computed by MERIDIAN',
              columns: ['Measure', 'Value'],
              rows: figures,
              note: 'Every figure is computed by the platform from the statements loaded into this workspace. A dash means the datum is unavailable and "n/m" that the measure is not meaningful for this kind of company. Nothing has been substituted for a missing value.',
            }]
          : []),
        ...(e && e.peerMedians.length
          ? [{
              title: 'Appendix B — against the peer set',
              columns: ['Multiple', 'Company', 'Peer median'],
              rows: e.peerMedians.map((p) => [
                p.label,
                formatMetric(p.company, formatFor(p.key)),
                formatMetric(p.median, formatFor(p.key)),
              ]),
              note: 'Medians are computed only over the peers that report the measure.',
            }]
          : []),
        ...(e && e.models.length
          ? [{
              title: 'Appendix C — valuation models on record',
              columns: ['Model', 'Fair value', 'Upside'],
              rows: e.models.map((m) => [
                `${m.name} (${m.kind})`,
                m.fairValue === null ? 'not run' : formatMetric(m.fairValue, 'currency', { currency }),
                formatMetric(m.upside, 'percentSigned'),
              ]),
              note: 'A model that has not been run since it was saved is reported as such rather than given a value.',
            }]
          : []),
      ],
      provenance: 'Produced in MERIDIAN. Recommendations only — the platform does not route, place or execute orders.',
      fileName: `${slugify(props.title)}.pdf`,
    });
  };

  const exportMarkdown = () => {
    const lines: string[] = [
      `# ${props.title}`,
      '',
      e ? `**Company:** ${e.ticker} — ${e.name} (${e.sector})` : '',
      `**Author:** ${props.author}`,
      `**Status:** ${props.status.replace('_', ' ')}`,
      props.recommendation ? `**Recommendation:** ${props.recommendation.replace('_', ' ')}` : '',
      props.targetPrice !== null ? `**Target price:** ${formatMetric(props.targetPrice, 'currency', { currency })}` : '',
      e?.price !== null && e ? `**Price at export:** ${formatMetric(e.price, 'currency', { currency })}` : '',
      props.portfolioRole ? `**Portfolio role:** ${props.portfolioRole}` : '',
      '',
      ...props.sections.flatMap((s) => [`## ${s.title}`, '', s.body || '_Not written yet._', '']),
    ];
    if (e) {
      lines.push('## Appendix — figures as computed by MERIDIAN', '');
      lines.push(`Basis: ${e.basisLabel}.`, '');
      lines.push('| Measure | Value |', '| --- | --- |');
      const rows: [string, string][] = [
        ['Revenue growth', formatMetric(e.fundamentals.revenueGrowth, 'percent')],
        ['EBITDA margin', formatMetric(e.fundamentals.ebitdaMargin, 'percent')],
        ['ROIC', e.bankLike ? 'n/m for a bank' : formatMetric(e.fundamentals.roic, 'percent')],
        ['WACC', formatMetric(e.fundamentals.wacc, 'percent')],
        ['ROIC − WACC', e.bankLike ? 'n/m for a bank' : formatMetric(e.fundamentals.roicSpread, 'percent')],
        ['Net debt / EBITDA', formatMetric(e.fundamentals.netDebtToEbitda, 'multiple')],
        ['P / E', formatMetric(e.multiples.pe, 'multiple')],
        ['EV / EBITDA', e.bankLike ? 'n/m for a bank' : formatMetric(e.multiples.evEbitda, 'multiple')],
        ['FCF yield', formatMetric(e.fundamentals.fcfYield, 'percent')],
      ];
      for (const [k, v] of rows) lines.push(`| ${k} | ${v} |`);
      lines.push('');
      lines.push('Every figure above is computed by the platform from the statements loaded into this workspace. A blank or "n/m" means the datum is unavailable or not meaningful for this kind of company, never zero.');
    }
    downloadText(`${slugify(props.title)}.md`, lines.filter((l) => l !== '').join('\n'));
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Segmented
              value={mode}
              onChange={(v) => setMode(v)}
              options={[
                { value: 'read' as Mode, label: 'Read' },
                ...(props.canWrite ? [{ value: 'edit' as Mode, label: 'Write' }] : []),
              ]}
            />
            <Badge tone={STATUS_TONE[props.status] ?? 'neutral'}>{props.status.replace('_', ' ').toLowerCase()}</Badge>
            <span className="text-2xs text-ink-4">{written} of {draft.sections.length} sections written</span>
          </div>
          <div className="flex items-center gap-2">
            <Button icon={<Icon.Download size={13} />} onClick={exportPdf}>PDF</Button>
            <Button icon={<Icon.Download size={13} />} onClick={exportMarkdown}>Markdown</Button>
            {props.canWrite && mode === 'edit' ? (
              <Button variant="primary" onClick={() => save()} loading={busy} disabled={!dirty}>Save</Button>
            ) : null}
            {props.canWrite && mode === 'read' && props.status === 'DRAFT' ? (
              <Button variant="primary" icon={<Icon.Vote size={13} />} onClick={() => setStatus('UNDER_REVIEW')} loading={busy}>
                Submit for review
              </Button>
            ) : null}
            {props.canDecide && props.status === 'UNDER_REVIEW' ? (
              <>
                <Button variant="primary" icon={<Icon.Check size={13} />} onClick={() => setStatus('APPROVED')} loading={busy}>Approve</Button>
                <Button variant="danger" icon={<Icon.Close size={13} />} onClick={() => setStatus('REJECTED')} loading={busy}>Reject</Button>
              </>
            ) : null}
            {props.canWrite ? (
              <Button icon={<Icon.Trash size={13} />} onClick={() => setDeleteModal(true)} title="Delete this memo" />
            ) : null}
          </div>
        </div>

        {dirty ? <InlineNote tone="warn">Unsaved changes.</InlineNote> : null}

        {mode === 'read' ? (
          <Panel>
            <div className="space-y-5 p-4">
              {props.sections.map((s) => {
                const prompt = MEMO_SECTIONS.find((t) => t.key === s.key)?.prompt;
                return (
                  <section key={s.key}>
                    <h2 className="text-sm font-semibold text-ink">{s.title}</h2>
                    {s.body.trim() ? (
                      <div className="mt-1.5 space-y-2 text-[13px] leading-relaxed text-ink-2">
                        {s.body.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
                      </div>
                    ) : (
                      <p className="mt-1.5 text-xs text-ink-4">{prompt ? `Not written. ${prompt}` : 'Not written yet.'}</p>
                    )}
                  </section>
                );
              })}
            </div>
          </Panel>
        ) : (
          <div className="space-y-3">
            <Panel>
              <div className="grid gap-3 p-3 sm:grid-cols-2">
                <Field label="Title" required className="sm:col-span-2">
                  <Input value={draft.title} onChange={(ev) => { setDraft({ ...draft, title: ev.target.value }); setDirty(true); }} />
                </Field>
                <Field label="Recommendation">
                  <Select value={draft.recommendation} onChange={(ev) => { setDraft({ ...draft, recommendation: ev.target.value }); setDirty(true); }}>
                    <option value="">None</option>
                    <option value="STRONG_BUY">Strong buy</option>
                    <option value="BUY">Buy</option>
                    <option value="HOLD">Hold</option>
                    <option value="SELL">Sell</option>
                    <option value="STRONG_SELL">Strong sell</option>
                  </Select>
                </Field>
                <Field label={`Target price (${currency})`}>
                  <NumberInput
                    value={draft.targetPrice ?? 0}
                    onValueChange={(v) => { setDraft({ ...draft, targetPrice: v || null }); setDirty(true); }}
                  />
                </Field>
                <Field label="Portfolio role" className="sm:col-span-2" hint="The size being asked for and why it fits the book.">
                  <Input value={draft.portfolioRole} onChange={(ev) => { setDraft({ ...draft, portfolioRole: ev.target.value }); setDirty(true); }} />
                </Field>
              </div>
            </Panel>

            {draft.sections.map((s, i) => {
              const prompt = MEMO_SECTIONS.find((t) => t.key === s.key)?.prompt;
              return (
                <Panel key={s.key}>
                  <PanelHeader title={s.title} subtitle={prompt} dense />
                  <Textarea
                    rows={7}
                    value={s.body}
                    onChange={(ev) => setSection(i, ev.target.value)}
                    className="rounded-none border-0 border-t border-line focus:ring-0"
                    placeholder={prompt}
                  />
                </Panel>
              );
            })}
          </div>
        )}
      </div>

      <aside className="space-y-3">
        {e ? (
          <>
            <Panel>
              <PanelHeader
                title={<Link href={`/companies/${e.ticker}`} className="font-semibold text-ink hover:text-accent">{e.ticker}</Link>}
                subtitle={`${e.name} · basis ${e.basisLabel}`}
                dense
              />
              <div className="px-3 pb-3 divide-y divide-line">
                <StatRow label="Price" value={<Num value={e.price} format="currency" currency={currency} />} />
                <StatRow label="Market cap" value={<Num value={e.marketCap} format="currencyMillions" currency={currency} />} />
                <StatRow label="Target in this memo" value={<Num value={props.targetPrice} format="currency" currency={currency} />} />
                <StatRow label="Upside" value={<Num value={upside} format="percentSigned" />} />
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Fundamentals" subtitle="As computed by the platform" dense />
              <div className="px-3 pb-3 divide-y divide-line">
                <StatRow label="Revenue growth" value={<Num value={e.fundamentals.revenueGrowth} format="percent" />} />
                <StatRow label="EBITDA margin" value={<Num value={e.fundamentals.ebitdaMargin} format="percent" />} />
                <StatRow
                  label="ROIC"
                  value={e.bankLike
                    ? <Tooltip content="Invested capital is not a meaningful denominator for a bank. Use ROE."><span className="text-2xs text-ink-4">n/m</span></Tooltip>
                    : <Num value={e.fundamentals.roic} format="percent" />}
                />
                <StatRow label="ROE" value={<Num value={e.fundamentals.roe} format="percent" />} />
                <StatRow label="WACC" value={<Num value={e.fundamentals.wacc} format="percent" />} />
                <StatRow
                  label="ROIC − WACC"
                  hint="Value is created only while this spread is positive."
                  value={e.bankLike
                    ? <span className="text-2xs text-ink-4">n/m</span>
                    : <Num value={e.fundamentals.roicSpread} format="percentSigned" />}
                />
                <StatRow label="Net debt / EBITDA" value={<Num value={e.fundamentals.netDebtToEbitda} format="multiple" />} />
                <StatRow label="FCF yield" value={<Num value={e.fundamentals.fcfYield} format="percent" />} />
              </div>
            </Panel>

            {e.peerMedians.length ? (
              <Panel>
                <PanelHeader title="Against the peer set" subtitle="Company, peer median, and where it ranks" dense />
                <div className="px-3 pb-3">
                  <table className="w-full text-2xs">
                    <thead>
                      <tr className="uppercase tracking-wide text-ink-4">
                        <th className="py-1 text-left font-semibold">Multiple</th>
                        <th className="py-1 text-right font-semibold">Company</th>
                        <th className="py-1 text-right font-semibold">Median</th>
                        <th className="py-1 text-right font-semibold">Rank</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {e.peerMedians.map((p) => (
                        <tr key={p.key}>
                          <td className="py-1 text-ink-2">{p.label}</td>
                          <td className="py-1 text-right num text-ink">{formatMetric(p.company, formatFor(p.key))}</td>
                          <td className="py-1 text-right num text-ink-3">{formatMetric(p.median, formatFor(p.key))}</td>
                          <td className="py-1 text-right num text-ink-3">
                            {isNum(p.percentile) ? ordinal(Math.round((p.percentile as number) * 100)) : DASH}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            ) : null}

            {e.models.length ? (
              <Panel>
                <PanelHeader title="Valuation models" subtitle="Saved in this workspace" dense />
                <div className="px-3 pb-3 divide-y divide-line">
                  {e.models.map((m) => (
                    <div key={m.id} className="flex items-baseline justify-between gap-2 py-1.5">
                      <div className="min-w-0">
                        <Link href={`/companies/${e.ticker}/valuation?model=${m.id}`} className="block truncate text-xs text-ink-2 hover:text-accent">
                          {m.name}
                        </Link>
                        <span className="text-2xs text-ink-4">{m.kind} · {formatDate(m.updatedAt)}</span>
                      </div>
                      <div className="shrink-0 text-right">
                        <Num value={m.fairValue} format="currency" currency={currency} className="block text-xs" />
                        <Num value={m.upside} format="percentSigned" className="block text-2xs" />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            ) : null}

            {e.thesis ? (
              <Panel>
                <PanelHeader
                  title="Thesis health"
                  subtitle={e.thesis.summary}
                  actions={<ThesisVerdictBadge verdict={e.thesis.verdict} />}
                  dense
                />
                <div className="px-3 pb-3 divide-y divide-line">
                  {e.thesis.checks.map((c) => (
                    <div key={`${c.metric}-${c.label}`} className="flex items-baseline justify-between gap-2 py-1.5">
                      <span className="min-w-0 truncate text-2xs text-ink-2">{c.label}</span>
                      <span className={cx('num shrink-0 text-2xs', c.status === 'BREACHED' ? 'text-neg' : c.status === 'HOLDING' ? 'text-pos' : 'text-ink-4')}>
                        {c.status === 'UNAVAILABLE' ? 'no data' : `${c.currentFormatted} / ${c.targetFormatted}`}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>
            ) : null}

            {e.catalysts.length ? (
              <Panel>
                <PanelHeader title="Catalysts" dense />
                <div className="px-3 pb-3 divide-y divide-line">
                  {e.catalysts.map((c) => (
                    <div key={c.title} className="py-1.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="min-w-0 text-2xs text-ink-2">{c.title}</span>
                        <span className="shrink-0 text-2xs text-ink-4">{c.expectedDate ? formatDate(c.expectedDate) : 'undated'}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-2xs text-ink-4">
                        <Badge tone="neutral">{c.impact.toLowerCase()} impact</Badge>
                        <span>{formatPercent(c.probability, 0)} likely</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            ) : null}

            {e.risks.length ? (
              <Panel>
                <PanelHeader title="Risks" dense />
                <div className="px-3 pb-3 divide-y divide-line">
                  {e.risks.map((r) => (
                    <div key={r.title} className="py-1.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="min-w-0 text-2xs text-ink-2">{r.title}</span>
                        <SeverityBadge value={r.severity === 'HIGH' ? 'CRITICAL' : r.severity === 'MEDIUM' ? 'IMPORTANT' : 'INFORMATIONAL'} />
                      </div>
                      {r.mitigation ? <p className="mt-0.5 text-2xs text-ink-4">{r.mitigation}</p> : null}
                    </div>
                  ))}
                </div>
              </Panel>
            ) : null}

            {e.consensus ? (
              <Panel>
                <PanelHeader
                  title="Against the contributed range"
                  subtitle={`${e.consensus.count} targets on record`}
                  dense
                />
                <div className="px-3 pb-3">
                  <p className="text-2xs leading-relaxed text-ink-2">{e.consensus.summary}</p>
                  {e.consensus.rationale ? (
                    <blockquote className="mt-2 border-l-2 border-accent/40 pl-2 text-2xs leading-relaxed text-ink-2">
                      {e.consensus.rationale.text}
                      <span className="mt-0.5 block text-ink-4">
                        {e.consensus.rationale.recordedBy} · {formatDate(e.consensus.rationale.recordedAt)}
                      </span>
                    </blockquote>
                  ) : (
                    <p className="mt-1.5 text-2xs text-ink-4">
                      No reason recorded for the difference. It is recorded on the valuation tab, under
                      reconciliation, and shows up here once it is.
                    </p>
                  )}
                </div>
              </Panel>
            ) : null}

            {e.deckPoints.length ? (
              <Panel>
                <PanelHeader title="What the case rests on" subtitle="From the qualitative deck" dense />
                <div className="divide-y divide-line px-3 pb-3">
                  {e.deckPoints.map((d) => (
                    <div key={d.title} className="py-1.5">
                      <div className="flex items-baseline gap-2">
                        <Badge tone={d.weight === 'CORE' ? 'accent' : 'outline'}>{d.weight.toLowerCase()}</Badge>
                        <span className="text-2xs font-medium text-ink">{d.title}</span>
                      </div>
                      {d.breaks.length ? (
                        <p className="mt-0.5 text-2xs text-ink-4">Breaks if: {d.breaks.join('; ')}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </Panel>
            ) : null}

            {e.openQuestions.length ? (
              <Panel>
                <PanelHeader
                  title="Open committee questions"
                  subtitle="Worth answering in the memo rather than at the meeting"
                  dense
                />
                <div className="divide-y divide-line px-3 pb-3">
                  {e.openQuestions.map((q) => (
                    <div key={q.question} className="flex items-start justify-between gap-2 py-1.5">
                      <span className="text-2xs leading-relaxed text-ink-2">{q.question}</span>
                      <Badge tone={q.hasGap ? 'warn' : 'neutral'}>{q.hasGap ? 'gap' : q.status.toLowerCase()}</Badge>
                    </div>
                  ))}
                </div>
              </Panel>
            ) : null}
          </>
        ) : (
          <InlineNote tone="warn">
            The evidence pack could not be loaded for this company, so nothing is shown rather than showing figures that
            might not be current.
          </InlineNote>
        )}

        {props.committeeItems.length ? (
          <Panel>
            <PanelHeader title="Committee" dense />
            <div className="px-3 pb-3 divide-y divide-line">
              {props.committeeItems.map((c) => (
                <div key={c.id} className="py-2">
                  <Link href="/committee" className="text-xs font-medium text-ink hover:text-accent">{c.title}</Link>
                  <div className="mt-0.5 flex items-center gap-2 text-2xs text-ink-4">
                    <Badge tone={STATUS_TONE[c.status] ?? 'neutral'}>{c.status.replace('_', ' ').toLowerCase()}</Badge>
                    <span>{c.meetingDate ? formatDate(c.meetingDate) : 'no meeting date'}</span>
                  </div>
                  {c.votes.length ? (
                    <div className="mt-1 space-y-0.5">
                      {c.votes.map((v) => (
                        <div key={v.user} className="flex items-baseline justify-between gap-2 text-2xs">
                          <span className="text-ink-3">{v.user}</span>
                          <Badge tone={v.vote === 'APPROVE' ? 'pos' : v.vote === 'REJECT' ? 'neg' : 'neutral'}>
                            {v.vote.toLowerCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Panel>
        ) : null}
      </aside>

      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete this memo?"
        width="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={remove} loading={busy}>Delete memo</Button>
          </div>
        }
      >
        <p className="p-4 text-xs text-ink-2">
          &ldquo;{props.title}&rdquo; will be removed. Any committee item that references it keeps its own record.
        </p>
      </Modal>
    </div>
  );
}

function formatFor(key: string): 'multiple' | 'percent' {
  return ['fcfYield', 'dividendYield', 'revenueGrowth', 'ebitdaGrowth', 'ebitdaMargin', 'roic', 'roe'].includes(key)
    ? 'percent'
    : 'multiple';
}

