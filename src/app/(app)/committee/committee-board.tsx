'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, cx, EmptyState, Field, InlineNote, Input, Modal, NumberInput, Panel,
  PanelHeader, Segmented, Select, Textarea, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { MetricCard, Num, RecommendationBadge } from '@/components/ui/values';
import { formatDate, formatDateTime, formatPercent } from '@/lib/finance/format';
import type { Currency } from '@/lib/finance/types';

interface VoteRow { user: string; vote: string; rationale: string | null; createdAt: string; isMe: boolean }
interface CommentRow { id: string; user: string; body: string; createdAt: string }

interface ItemRow {
  id: string; title: string; status: string; proposal: string;
  recommendation: string | null; targetPrice: number | null;
  proposedWeight: number | null; currentWeight: number | null;
  meetingDate: string | null; summary: string; createdBy: string; createdAt: string;
  ticker: string; companyName: string; currency: Currency;
  price: number | null; upside: number | null;
  memo: { id: string; title: string; status: string } | null;
  votes: VoteRow[]; comments: CommentRow[];
}

const STATUS_TONE: Record<string, 'pos' | 'neutral' | 'warn' | 'neg'> = {
  APPROVED: 'pos', DRAFT: 'neutral', UNDER_REVIEW: 'warn', ARCHIVED: 'neutral', REJECTED: 'neg',
};

const PROPOSAL_LABEL: Record<string, string> = {
  BUY: 'Open a position', SELL: 'Exit the position',
  INCREASE: 'Increase', REDUCE: 'Reduce', HOLD: 'Hold',
};

export function CommitteeBoard(props: {
  canVote: boolean;
  canDecide: boolean;
  canTable: boolean;
  currentUser: string;
  votingMembers: number;
  companies: { ticker: string; name: string }[];
  memos: { id: string; title: string; ticker: string }[];
  items: ItemRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState<'open' | 'closed' | 'all'>('open');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [comment, setComment] = useState<Record<string, string>>({});
  const [rationale, setRationale] = useState<Record<string, string>>({});
  const [tableModal, setTableModal] = useState(false);
  const [form, setForm] = useState({
    ticker: props.companies[0]?.ticker ?? '', memoId: '', title: '',
    proposal: 'BUY', recommendation: 'BUY', targetPrice: 0, proposedWeight: 0,
    meetingDate: '', summary: '',
  });

  const items = useMemo(() => {
    if (filter === 'open') return props.items.filter((i) => i.status === 'UNDER_REVIEW' || i.status === 'DRAFT');
    if (filter === 'closed') return props.items.filter((i) => i.status === 'APPROVED' || i.status === 'REJECTED' || i.status === 'ARCHIVED');
    return props.items;
  }, [props.items, filter]);

  const openCount = props.items.filter((i) => i.status === 'UNDER_REVIEW' || i.status === 'DRAFT').length;
  const approved = props.items.filter((i) => i.status === 'APPROVED').length;
  const rejected = props.items.filter((i) => i.status === 'REJECTED').length;
  const awaitingMyVote = props.items.filter(
    (i) => (i.status === 'UNDER_REVIEW') && !i.votes.some((v) => v.isMe),
  ).length;

  const act = async (id: string, body: Record<string, unknown>, successTitle: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/committee/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Not recorded', description: data.error }); return false; }
      toast.push({ tone: 'pos', title: successTitle });
      router.refresh();
      return true;
    } finally { setBusyId(null); }
  };

  const tableItem = async () => {
    setBusyId('new');
    try {
      const company = props.companies.find((c) => c.ticker === form.ticker);
      const res = await fetch('/api/committee', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: form.ticker,
          memoId: form.memoId || null,
          title: form.title.trim() || `${company?.name ?? form.ticker} — ${PROPOSAL_LABEL[form.proposal].toLowerCase()}`,
          proposal: form.proposal,
          recommendation: form.recommendation || null,
          targetPrice: form.targetPrice || null,
          proposedWeight: form.proposedWeight ? form.proposedWeight / 100 : null,
          meetingDate: form.meetingDate || null,
          summary: form.summary,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Not tabled', description: data.error }); return; }
      toast.push({ tone: 'pos', title: 'Item tabled', description: 'It is now open for votes.' });
      setTableModal(false);
      setForm({ ...form, title: '', summary: '', targetPrice: 0, proposedWeight: 0 });
      router.refresh();
    } finally { setBusyId(null); }
  };

  const memosForTicker = props.memos.filter((m) => m.ticker === form.ticker);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Open items" value={openCount} format="number" decimals={0} accent={openCount > 0} />
        <MetricCard
          label="Awaiting your vote" value={awaitingMyVote} format="number" decimals={0}
          sublabel={props.canVote ? undefined : 'Your role does not vote'}
        />
        <MetricCard label="Approved" value={approved} format="number" decimals={0} />
        <MetricCard label="Rejected" value={rejected} format="number" decimals={0} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'open', label: `Open (${openCount})` },
            { value: 'closed', label: `Closed (${approved + rejected})` },
            { value: 'all', label: `All (${props.items.length})` },
          ]}
        />
        {props.canTable ? (
          <Button variant="primary" icon={<Icon.Plus size={13} />} onClick={() => setTableModal(true)}>Table an item</Button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<Icon.Vote size={22} />}
            title={filter === 'open' ? 'Nothing open' : 'Nothing here'}
            description="A committee item asks for a specific decision on a specific name, with a memo behind it."
          />
        </Panel>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const approve = item.votes.filter((v) => v.vote === 'APPROVE').length;
            const reject = item.votes.filter((v) => v.vote === 'REJECT').length;
            const abstain = item.votes.filter((v) => v.vote === 'ABSTAIN').length;
            const cast = item.votes.length;
            const myVote = item.votes.find((v) => v.isMe)?.vote ?? null;
            const decided = item.status === 'APPROVED' || item.status === 'REJECTED';

            return (
              <Panel key={item.id}>
                <PanelHeader
                  title={item.title}
                  subtitle={`${PROPOSAL_LABEL[item.proposal] ?? item.proposal} · tabled by ${item.createdBy} on ${formatDate(item.createdAt)}`}
                  actions={
                    <div className="flex items-center gap-2">
                      {item.meetingDate ? <Badge tone="neutral">Meeting {formatDate(item.meetingDate)}</Badge> : null}
                      <Badge tone={STATUS_TONE[item.status] ?? 'neutral'}>{item.status.replace('_', ' ').toLowerCase()}</Badge>
                    </div>
                  }
                />

                <div className="grid gap-4 px-3 pb-3 lg:grid-cols-[1fr_280px]">
                  <div className="min-w-0 space-y-3">
                    <p className="text-[13px] leading-relaxed text-ink-2">{item.summary}</p>

                    {item.memo ? (
                      <Link href={`/memos/${item.memo.id}`} className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline">
                        <Icon.Memo size={13} /> {item.memo.title}
                      </Link>
                    ) : (
                      <InlineNote tone="warn">
                        No memo is attached to this item. The committee is being asked to decide without the written case.
                      </InlineNote>
                    )}

                    <div>
                      <div className="label mb-1">Votes ({cast} of {props.votingMembers})</div>
                      {cast ? (
                        <div className="divide-y divide-line rounded border border-line">
                          {item.votes.map((v) => (
                            <div key={v.user} className="px-2.5 py-2">
                              <div className="flex items-baseline justify-between gap-2">
                                <span className={cx('text-xs', v.isMe ? 'font-semibold text-ink' : 'text-ink-2')}>
                                  {v.user}{v.isMe ? ' (you)' : ''}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-2xs text-ink-4">{formatDateTime(v.createdAt)}</span>
                                  <Badge tone={v.vote === 'APPROVE' ? 'pos' : v.vote === 'REJECT' ? 'neg' : 'neutral'}>
                                    {v.vote.toLowerCase()}
                                  </Badge>
                                </div>
                              </div>
                              {v.rationale ? <p className="mt-1 text-2xs leading-relaxed text-ink-3">{v.rationale}</p> : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-ink-4">No votes cast yet.</p>
                      )}
                    </div>

                    {props.canVote && !decided ? (
                      <div className="rounded border border-line p-2.5">
                        <div className="label mb-1.5">{myVote ? `Change your vote (currently ${myVote.toLowerCase()})` : 'Cast your vote'}</div>
                        <Textarea
                          rows={2}
                          value={rationale[item.id] ?? ''}
                          onChange={(ev) => setRationale({ ...rationale, [item.id]: ev.target.value })}
                          placeholder="Why. A vote without a reason is not a decision the desk can revisit."
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button
                            variant="primary" icon={<Icon.Check size={13} />} loading={busyId === item.id}
                            onClick={() => act(item.id, { vote: 'APPROVE', rationale: rationale[item.id] || null }, 'Vote recorded')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger" icon={<Icon.Close size={13} />} loading={busyId === item.id}
                            onClick={() => act(item.id, { vote: 'REJECT', rationale: rationale[item.id] || null }, 'Vote recorded')}
                          >
                            Reject
                          </Button>
                          <Button
                            loading={busyId === item.id}
                            onClick={() => act(item.id, { vote: 'ABSTAIN', rationale: rationale[item.id] || null }, 'Vote recorded')}
                          >
                            Abstain
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    <div>
                      <div className="label mb-1">Discussion ({item.comments.length})</div>
                      {item.comments.length ? (
                        <ul className="space-y-2">
                          {item.comments.map((c) => (
                            <li key={c.id} className="rounded border border-line px-2.5 py-2">
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="text-xs font-medium text-ink-2">{c.user}</span>
                                <span className="text-2xs text-ink-4">{formatDateTime(c.createdAt)}</span>
                              </div>
                              <p className="mt-1 text-xs leading-relaxed text-ink-2">{c.body}</p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-ink-4">No discussion recorded.</p>
                      )}
                      <div className="mt-2 flex gap-2">
                        <Input
                          value={comment[item.id] ?? ''}
                          onChange={(ev) => setComment({ ...comment, [item.id]: ev.target.value })}
                          placeholder="Add to the discussion"
                          className="flex-1"
                        />
                        <Button
                          loading={busyId === item.id}
                          disabled={!(comment[item.id] ?? '').trim()}
                          onClick={async () => {
                            const done = await act(item.id, { comment: comment[item.id] }, 'Comment added');
                            if (done) setComment({ ...comment, [item.id]: '' });
                          }}
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>

                  <aside className="space-y-2">
                    <div className="rounded border border-line p-2.5">
                      <Link href={`/companies/${item.ticker}`} className="text-xs font-semibold text-ink hover:text-accent">
                        {item.ticker}
                      </Link>
                      <p className="text-2xs text-ink-4">{item.companyName}</p>
                      <div className="mt-2 space-y-1 text-2xs">
                        <Row label="Price" value={<Num value={item.price} format="currency" currency={item.currency} />} />
                        <Row label="Call" value={item.recommendation ? <RecommendationBadge value={item.recommendation} /> : <span className="text-ink-4">—</span>} />
                        <Row label="Target" value={<Num value={item.targetPrice} format="currency" currency={item.currency} />} />
                        <Row label="Upside" value={<Num value={item.upside} format="percentSigned" />} />
                        <Row label="Current weight" value={<Num value={item.currentWeight} format="percent" />} />
                        <Row label="Proposed weight" value={<Num value={item.proposedWeight} format="percent" />} />
                        <Row
                          label="Change"
                          value={
                            <Num
                              value={item.proposedWeight !== null ? item.proposedWeight - (item.currentWeight ?? 0) : null}
                              format="percentSigned"
                            />
                          }
                        />
                      </div>
                    </div>

                    <div className="rounded border border-line p-2.5">
                      <div className="label mb-1.5">Tally</div>
                      <Tally label="Approve" count={approve} total={props.votingMembers} tone="pos" />
                      <Tally label="Reject" count={reject} total={props.votingMembers} tone="neg" />
                      <Tally label="Abstain" count={abstain} total={props.votingMembers} tone="neutral" />
                      <p className="mt-1.5 text-2xs text-ink-4">
                        {cast >= props.votingMembers
                          ? 'Every voting member has responded.'
                          : `${props.votingMembers - cast} member${props.votingMembers - cast === 1 ? '' : 's'} yet to vote.`}
                      </p>
                    </div>

                    {props.canDecide && !decided ? (
                      <div className="space-y-2">
                        <Button
                          variant="primary" className="w-full" loading={busyId === item.id}
                          onClick={() => act(item.id, { status: 'APPROVED' }, 'Item approved')}
                        >
                          Close as approved
                        </Button>
                        <Button
                          variant="danger" className="w-full" loading={busyId === item.id}
                          onClick={() => act(item.id, { status: 'REJECTED' }, 'Item rejected')}
                        >
                          Close as rejected
                        </Button>
                        <p className="text-2xs text-ink-4">
                          Closing an item records the decision. It does not place an order — MERIDIAN never routes trades.
                        </p>
                      </div>
                    ) : null}
                  </aside>
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      <Modal
        open={tableModal}
        onClose={() => setTableModal(false)}
        title="Table an item for the committee"
        subtitle="Ask for one specific decision on one specific name."
        width="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setTableModal(false)}>Cancel</Button>
            <Button
              variant="primary" onClick={tableItem} loading={busyId === 'new'}
              disabled={form.summary.trim().length < 10}
            >
              Table item
            </Button>
          </div>
        }
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Company" required>
            <Select value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value, memoId: '' })}>
              {props.companies.map((c) => <option key={c.ticker} value={c.ticker}>{c.ticker} — {c.name}</option>)}
            </Select>
          </Field>
          <Field label="Proposal" required>
            <Select value={form.proposal} onChange={(e) => setForm({ ...form, proposal: e.target.value })}>
              {Object.entries(PROPOSAL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Title" className="sm:col-span-2" hint="Left blank, one is written from the company and the proposal.">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Memo" hint={memosForTicker.length ? undefined : 'No memo exists for this company yet.'}>
            <Select value={form.memoId} onChange={(e) => setForm({ ...form, memoId: e.target.value })}>
              <option value="">No memo attached</option>
              {memosForTicker.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </Select>
          </Field>
          <Field label="Meeting date" hint="Optional.">
            <Input type="date" value={form.meetingDate} onChange={(e) => setForm({ ...form, meetingDate: e.target.value })} />
          </Field>
          <Field label="Recommendation">
            <Select value={form.recommendation} onChange={(e) => setForm({ ...form, recommendation: e.target.value })}>
              <option value="">None</option>
              <option value="STRONG_BUY">Strong buy</option>
              <option value="BUY">Buy</option>
              <option value="HOLD">Hold</option>
              <option value="SELL">Sell</option>
              <option value="STRONG_SELL">Strong sell</option>
            </Select>
          </Field>
          <Field label="Target price">
            <NumberInput value={form.targetPrice} onValueChange={(v) => setForm({ ...form, targetPrice: v })} />
          </Field>
          <Field label="Proposed weight" hint="As a percentage of the book." className="sm:col-span-2">
            <NumberInput value={form.proposedWeight} onValueChange={(v) => setForm({ ...form, proposedWeight: v })} suffix="%" />
          </Field>
          <Field label="What is being asked" required className="sm:col-span-2">
            <Textarea
              rows={4}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="The decision, the reason, and what would have to be true for it to be wrong."
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-ink-4">{label}</span>
      <span className="text-right text-ink-2">{value}</span>
    </div>
  );
}

function Tally({ label, count, total, tone }: { label: string; count: number; total: number; tone: 'pos' | 'neg' | 'neutral' }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const bar = { pos: 'bg-pos', neg: 'bg-neg', neutral: 'bg-ink-4' }[tone];
  return (
    <div className="mb-1 flex items-center gap-2">
      <span className="w-14 shrink-0 text-2xs text-ink-3">{label}</span>
      <div className="h-[5px] flex-1 rounded-full bg-sunken">
        <div className={cx('h-full rounded-full', bar)} style={{ width: `${pct}%` }} />
      </div>
      <span className="num w-10 text-right text-2xs text-ink-3">{count}/{total}</span>
    </div>
  );
}

export { formatPercent };
