'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, cx, EmptyState, Field, InlineNote, Input, Modal, NumberInput,
  Panel, PanelHeader, Segmented, Select, Tabs, Toggle, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { DataTable, type Column } from '@/components/ui/table';
import { MetricCard, Num, SeverityBadge, StatRow, ThesisVerdictBadge } from '@/components/ui/values';
import { DASH, formatDateTime } from '@/lib/finance/format';
import type { MetricFormat } from '@/lib/finance/format';

type Tab = 'alerts' | 'thesis' | 'events' | 'notifications';

interface AlertRow {
  id: string; name: string; category: string; metric: string; metricLabel: string;
  comparator: string; comparatorLabel: string; threshold: number; thresholdFormatted: string;
  severity: string; enabled: boolean; ticker: string | null; companyName: string | null;
  currentValue: number | null; currentFormatted: string; isTriggered: boolean;
  distance: number | null; lastTriggeredAt: string | null; message: string; dataAvailable: boolean;
}

interface ThesisCheck {
  label: string; metric: string; metricLabel: string; comparator: 'GTE' | 'LTE';
  target: number; current: number | null; currentFormatted: string; targetFormatted: string;
  status: 'HOLDING' | 'BREACHED' | 'UNAVAILABLE'; gap: number | null;
}

interface HealthRow {
  ticker: string; companyName: string; thesisId: string; recommendation: string;
  conviction: string; status: string; targetPrice: number | null; currentPrice: number | null;
  upside: number | null; checks: ThesisCheck[]; holding: number; breached: number;
  unavailable: number; verdict: string; summary: string;
}

const CATEGORIES = ['PRICE', 'VALUATION', 'FUNDAMENTAL', 'EARNINGS', 'THESIS', 'PORTFOLIO'] as const;
const COMPARATORS = [
  { value: 'GT', label: 'is above' },
  { value: 'GTE', label: 'is at or above' },
  { value: 'LT', label: 'is below' },
  { value: 'LTE', label: 'is at or below' },
  { value: 'CROSSES_ABOVE', label: 'crosses above' },
  { value: 'CROSSES_BELOW', label: 'crosses below' },
] as const;

export function MonitoringWorkbench(props: {
  initialTab: string;
  canWrite: boolean;
  alerts: AlertRow[];
  health: HealthRow[];
  metrics: { key: string; label: string; category: string; format: MetricFormat }[];
  companies: { ticker: string; name: string }[];
  events: { id: string; alertName: string; ticker: string | null; severity: string; value: number; message: string; createdAt: string }[];
  notifications: { id: string; severity: string; category: string; title: string; body: string; ticker: string | null; href: string | null; readAt: string | null; createdAt: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>((props.initialTab as Tab) ?? 'alerts');
  const [filter, setFilter] = useState<'all' | 'triggered' | 'unavailable'>('all');
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '', ticker: '', metric: 'price', comparator: 'LT' as string,
    threshold: 0, severity: 'IMPORTANT' as string,
  });

  const metricDef = props.metrics.find((m) => m.key === form.metric);

  const filtered = useMemo(() => {
    if (filter === 'triggered') return props.alerts.filter((a) => a.isTriggered);
    if (filter === 'unavailable') return props.alerts.filter((a) => !a.dataAvailable);
    return props.alerts;
  }, [props.alerts, filter]);

  const triggeredCount = props.alerts.filter((a) => a.isTriggered).length;
  const unavailableCount = props.alerts.filter((a) => !a.dataAvailable).length;
  const brokenCount = props.health.filter((h) => h.verdict === 'BROKEN').length;
  const weakeningCount = props.health.filter((h) => h.verdict === 'WEAKENING').length;

  const createAlert = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          ticker: form.ticker ? form.ticker.toUpperCase() : null,
          category: metricDef?.category ?? 'FUNDAMENTAL',
          metric: form.metric,
          comparator: form.comparator,
          threshold: form.threshold,
          severity: form.severity,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.push({ tone: 'neg', title: 'Alert not created', description: data.error ?? 'Check the form.' });
        return;
      }
      toast.push({ tone: 'pos', title: 'Alert created', description: `${form.name} is now being evaluated.` });
      setModal(false);
      setForm({ name: '', ticker: '', metric: 'price', comparator: 'LT', threshold: 0, severity: 'IMPORTANT' });
      router.refresh();
    } finally { setBusy(false); }
  };

  const toggleAlert = async (id: string, enabled: boolean) => {
    const res = await fetch(`/api/alerts/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    if (!res.ok) {
      const data = await res.json();
      toast.push({ tone: 'neg', title: 'Not updated', description: data.error });
      return;
    }
    router.refresh();
  };

  const removeAlert = async (id: string, name: string) => {
    const res = await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      toast.push({ tone: 'neg', title: 'Not deleted', description: data.error });
      return;
    }
    toast.push({ tone: 'pos', title: 'Alert deleted', description: name });
    router.refresh();
  };

  const runEvaluation = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/alerts/evaluate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast.push({ tone: 'neg', title: 'Evaluation failed', description: data.error });
        return;
      }
      toast.push({
        tone: data.triggered > 0 ? 'warn' : 'pos',
        title: `${data.evaluated} alerts evaluated`,
        description: `${data.triggered} triggered, ${data.unavailable} could not be evaluated for missing data, ${data.notificationsWritten} notification${data.notificationsWritten === 1 ? '' : 's'} written.`,
      });
      router.refresh();
    } finally { setBusy(false); }
  };

  const alertColumns: Column<AlertRow>[] = [
    {
      key: 'state', header: '', width: '28px', align: 'center',
      render: (a) => (
        <span
          className={cx(
            'inline-block h-2 w-2 rounded-full',
            !a.enabled ? 'bg-ink-4/40' : a.isTriggered ? 'bg-neg' : a.dataAvailable ? 'bg-pos' : 'bg-warn',
          )}
          title={!a.enabled ? 'Disabled' : a.isTriggered ? 'Triggered' : a.dataAvailable ? 'Within threshold' : 'Data unavailable'}
        />
      ),
    },
    { key: 'name', header: 'Alert', value: (a) => a.name, sortable: true, sticky: true, width: '200px', className: 'font-medium text-ink' },
    {
      key: 'ticker', header: 'Ticker', value: (a) => a.ticker ?? '', sortable: true, width: '90px',
      render: (a) => a.ticker
        ? <Link href={`/companies/${a.ticker}`} className="font-semibold text-ink hover:text-accent">{a.ticker}</Link>
        : <span className="text-ink-4">Workspace</span>,
    },
    {
      key: 'condition', header: 'Condition', value: (a) => `${a.metricLabel} ${a.comparatorLabel}`,
      render: (a) => (
        <span className="text-ink-2">
          {a.metricLabel} <span className="text-ink-4">{a.comparatorLabel}</span>{' '}
          <span className="num text-ink">{a.thresholdFormatted}</span>
        </span>
      ),
    },
    {
      key: 'current', header: 'Current', align: 'right', value: (a) => a.currentValue, sortable: true,
      render: (a) => a.dataAvailable
        ? <span className={cx('num', a.isTriggered ? 'text-neg font-semibold' : 'text-ink')}>{a.currentFormatted}</span>
        : <span className="text-2xs text-warn">Data unavailable</span>,
    },
    { key: 'severity', header: 'Severity', value: (a) => a.severity, sortable: true, render: (a) => <SeverityBadge value={a.severity} /> },
    {
      key: 'last', header: 'Last triggered', align: 'right', value: (a) => a.lastTriggeredAt ?? '',
      render: (a) => <span className="text-2xs text-ink-3">{a.lastTriggeredAt ? formatDateTime(a.lastTriggeredAt) : DASH}</span>,
    },
    {
      key: 'actions', header: '', width: '110px', align: 'right',
      render: (a) => props.canWrite ? (
        <div className="flex items-center justify-end gap-2">
          <Toggle checked={a.enabled} onChange={(v) => toggleAlert(a.id, v)} />
          <button
            type="button" title="Delete alert"
            className="text-ink-4 hover:text-neg focus-ring rounded"
            onClick={() => removeAlert(a.id, a.name)}
          >
            <Icon.Trash size={13} />
          </button>
        </div>
      ) : null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Alerts triggered" value={triggeredCount} format="number" decimals={0} accent={triggeredCount > 0} sublabel={`${props.alerts.length} configured`} />
        <MetricCard label="Cannot be evaluated" value={unavailableCount} format="number" decimals={0} sublabel="Underlying metric unavailable" />
        <MetricCard label="Theses broken" value={brokenCount} format="number" decimals={0} sublabel={`${props.health.length} tracked`} />
        <MetricCard label="Theses weakening" value={weakeningCount} format="number" decimals={0} sublabel="At least one assumption breached" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          tabs={[
            { value: 'alerts', label: 'Alerts', count: props.alerts.length },
            { value: 'thesis', label: 'Thesis health', count: props.health.length },
            { value: 'events', label: 'Alert history', count: props.events.length },
            { value: 'notifications', label: 'Notifications', count: props.notifications.length },
          ]}
          className="flex-1"
        />
        {props.canWrite ? (
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={<Icon.Refresh size={13} />} onClick={runEvaluation} loading={busy}>
              Evaluate now
            </Button>
            <Button variant="primary" icon={<Icon.Plus size={13} />} onClick={() => setModal(true)}>
              New alert
            </Button>
          </div>
        ) : null}
      </div>

      {tab === 'alerts' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Segmented
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: `All (${props.alerts.length})` },
                { value: 'triggered', label: `Triggered (${triggeredCount})` },
                { value: 'unavailable', label: `Unavailable (${unavailableCount})` },
              ]}
            />
          </div>
          {unavailableCount > 0 ? (
            <InlineNote tone="warn">
              {unavailableCount} alert{unavailableCount === 1 ? '' : 's'} cannot be evaluated because the underlying
              metric is unavailable for that company. They are reported here rather than treated as not triggered — a
              silent alert on missing data is a false negative.
            </InlineNote>
          ) : null}
          <Panel>
            <DataTable
              columns={alertColumns}
              rows={filtered}
              rowKey={(a) => a.id}
              initialSort={{ key: 'severity', direction: 'asc' }}
              dense
              searchable
              searchValue={(a) => `${a.name} ${a.ticker ?? ''} ${a.metricLabel}`}
              emptyTitle="No alerts"
              emptyDescription="Create an alert to be told when a price, multiple or fundamental crosses a level you care about."
            />
          </Panel>
        </div>
      ) : null}

      {tab === 'thesis' ? (
        <div className="space-y-3">
          {props.health.length === 0 ? (
            <Panel>
              <EmptyState
                icon={<Icon.Target size={22} />}
                title="No thesis is being tracked"
                description="Write a thesis on a company and add measurable assumptions to it — each one becomes a check on this page."
                action={<Link href="/companies" className="btn-primary text-xs">Browse companies</Link>}
              />
            </Panel>
          ) : (
            props.health
              .slice()
              .sort((a, b) => rank(a.verdict) - rank(b.verdict))
              .map((h) => (
                <Panel key={h.thesisId}>
                  <PanelHeader
                    title={
                      <span className="flex items-center gap-2">
                        <Link href={`/companies/${h.ticker}/thesis`} className="font-semibold text-ink hover:text-accent">{h.ticker}</Link>
                        <span className="text-ink-3 font-normal">{h.companyName}</span>
                      </span>
                    }
                    subtitle={h.summary}
                    actions={
                      <div className="flex items-center gap-2">
                        <Badge tone="neutral">{h.recommendation.replace('_', ' ')}</Badge>
                        <ThesisVerdictBadge verdict={h.verdict} />
                      </div>
                    }
                  />
                  <div className="grid gap-3 px-3 pb-3 lg:grid-cols-[240px_1fr]">
                    <div className="divide-y divide-line">
                      <StatRow label="Price" value={<Num value={h.currentPrice} format="currency" />} />
                      <StatRow label="Target" value={<Num value={h.targetPrice} format="currency" />} />
                      <StatRow label="Upside" value={<Num value={h.upside} format="percentSigned" />} />
                      <StatRow label="Assumptions holding" value={<span className="num text-xs">{h.holding} / {h.holding + h.breached}</span>} />
                    </div>
                    <div>
                      {h.checks.length === 0 ? (
                        <div className="py-6 text-center text-xs text-ink-4">
                          This thesis has no measurable assumptions. Add them on the thesis tab so the desk can tell when it breaks.
                        </div>
                      ) : (
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-2xs uppercase tracking-wide text-ink-4">
                              <th className="py-1 text-left font-semibold">Assumption</th>
                              <th className="py-1 text-right font-semibold">Target</th>
                              <th className="py-1 text-right font-semibold">Current</th>
                              <th className="py-1 text-right font-semibold">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-line">
                            {h.checks.map((c) => (
                              <tr key={`${h.thesisId}-${c.metric}-${c.label}`}>
                                <td className="py-1.5 text-ink-2">
                                  {c.label}
                                  <span className="ml-1.5 text-2xs text-ink-4">
                                    {c.metricLabel} {c.comparator === 'GTE' ? '≥' : '≤'}
                                  </span>
                                </td>
                                <td className="py-1.5 text-right num text-ink-3">{c.targetFormatted}</td>
                                <td className={cx('py-1.5 text-right num', c.status === 'BREACHED' ? 'text-neg font-semibold' : 'text-ink')}>
                                  {c.status === 'UNAVAILABLE' ? <span className="text-2xs text-warn">Data unavailable</span> : c.currentFormatted}
                                </td>
                                <td className="py-1.5 text-right">
                                  <Badge tone={c.status === 'HOLDING' ? 'pos' : c.status === 'BREACHED' ? 'neg' : 'warn'}>
                                    {c.status === 'HOLDING' ? 'Holding' : c.status === 'BREACHED' ? 'Breached' : 'No data'}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </Panel>
              ))
          )}
        </div>
      ) : null}

      {tab === 'events' ? (
        <Panel>
          <PanelHeader title="Alert history" subtitle="Every time an alert fired, with the value that fired it" />
          {props.events.length === 0 ? (
            <EmptyState
              icon={<Icon.Bell size={22} />}
              title="Nothing has fired yet"
              description="Run an evaluation to check the current alert set against today's data."
            />
          ) : (
            <ol className="divide-y divide-line">
              {props.events.map((e) => (
                <li key={e.id} className="flex items-start gap-3 px-3 py-2.5">
                  <SeverityBadge value={e.severity} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-ink">{e.alertName}</span>
                      {e.ticker ? (
                        <Link href={`/companies/${e.ticker}`} className="text-2xs text-accent hover:underline">{e.ticker}</Link>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-2">{e.message}</p>
                  </div>
                  <span className="shrink-0 text-2xs text-ink-4">{formatDateTime(e.createdAt)}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      ) : null}

      {tab === 'notifications' ? (
        <Panel>
          <PanelHeader title="Notifications" subtitle="What the workspace has been told, newest first" />
          {props.notifications.length === 0 ? (
            <EmptyState icon={<Icon.Bell size={22} />} title="No notifications" description="Alerts, earnings and thesis changes write here." />
          ) : (
            <ol className="divide-y divide-line">
              {props.notifications.map((n) => (
                <li key={n.id} className={cx('flex items-start gap-3 px-3 py-2.5', !n.readAt && 'bg-accent/[0.03]')}>
                  <SeverityBadge value={n.severity} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-ink">{n.title}</span>
                      <Badge tone="neutral">{n.category}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-2">{n.body}</p>
                    {n.href ? (
                      <Link href={n.href} className="mt-1 inline-flex items-center gap-1 text-2xs text-accent hover:underline">
                        Open <Icon.ArrowRight size={11} />
                      </Link>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-2xs text-ink-4">{formatDateTime(n.createdAt)}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      ) : null}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="New alert"
        subtitle="Alerts are evaluated against the same metric set the rest of the product uses."
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={createAlert} loading={busy} disabled={form.name.trim().length < 2}>
              Create alert
            </Button>
          </div>
        }
      >
        <div className="space-y-3 p-4">
          <Field label="Name" required hint="What you want to be told, in your own words.">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VALE3 below R$ 55"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Company" hint="Leave blank for a workspace-wide alert.">
              <Select value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value })}>
                <option value="">Workspace</option>
                {props.companies.map((c) => (
                  <option key={c.ticker} value={c.ticker}>{c.ticker} — {c.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Severity">
              <Select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <option value="CRITICAL">Critical</option>
                <option value="IMPORTANT">Important</option>
                <option value="INFORMATIONAL">Informational</option>
              </Select>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Metric">
              <Select value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })}>
                {CATEGORIES.map((cat) => {
                  const inCat = props.metrics.filter((m) => m.category === cat);
                  if (!inCat.length) return null;
                  return (
                    <optgroup key={cat} label={cat.charAt(0) + cat.slice(1).toLowerCase()}>
                      {inCat.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
                    </optgroup>
                  );
                })}
              </Select>
            </Field>
            <Field label="Condition">
              <Select value={form.comparator} onChange={(e) => setForm({ ...form, comparator: e.target.value })}>
                {COMPARATORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </Field>
            <Field
              label="Threshold"
              hint={metricDef?.format === 'percent' ? 'As a ratio: 0.15 is 15%.' : undefined}
            >
              <NumberInput value={form.threshold} onValueChange={(v) => setForm({ ...form, threshold: v })} />
            </Field>
          </div>
          <InlineNote tone="info">
            This alert will read <strong>{metricDef?.label ?? form.metric}</strong> from the same computation the
            company and portfolio screens use. If that metric is unavailable for the company, the alert reports
            &ldquo;data unavailable&rdquo; instead of quietly passing.
          </InlineNote>
        </div>
      </Modal>
    </div>
  );
}

function rank(verdict: string): number {
  return verdict === 'BROKEN' ? 0 : verdict === 'WEAKENING' ? 1 : verdict === 'INSUFFICIENT_DATA' ? 2 : 3;
}
