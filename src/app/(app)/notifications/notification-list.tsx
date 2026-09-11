'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, Button, cx, EmptyState, Panel, Segmented, useToast } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { MetricCard, SeverityBadge } from '@/components/ui/values';
import { formatDateTime } from '@/lib/finance/format';

interface NotificationRow {
  id: string; severity: string; category: string; title: string; body: string;
  ticker: string | null; href: string | null; readAt: string | null; createdAt: string;
}

export function NotificationList(props: { notifications: NotificationRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState<'unread' | 'all' | 'critical'>('unread');
  const [busy, setBusy] = useState(false);

  const unread = props.notifications.filter((n) => !n.readAt);
  const critical = props.notifications.filter((n) => n.severity === 'CRITICAL');

  const shown = useMemo(() => {
    if (filter === 'unread') return unread;
    if (filter === 'critical') return critical;
    return props.notifications;
  }, [filter, props.notifications, unread, critical]);

  const mark = async (body: Record<string, unknown>, successTitle: string) => {
    setBusy(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Not updated', description: data.error }); return; }
      toast.push({ tone: 'pos', title: successTitle, description: `${data.updated} marked read.` });
      router.refresh();
    } finally { setBusy(false); }
  };

  const byCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of props.notifications) counts.set(n.category, (counts.get(n.category) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [props.notifications]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Unread" value={unread.length} format="number" decimals={0} accent={unread.length > 0} />
        <MetricCard label="Critical" value={critical.length} format="number" decimals={0} />
        <MetricCard label="Total" value={props.notifications.length} format="number" decimals={0} sublabel={props.notifications.length >= 200 ? 'Most recent 200' : undefined} />
        <MetricCard
          label="Most common source" value={null} format="text"
          sublabel={byCategory[0] ? `${byCategory[0][0].toLowerCase()} — ${byCategory[0][1]}` : 'Nothing yet'}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'unread', label: `Unread (${unread.length})` },
            { value: 'critical', label: `Critical (${critical.length})` },
            { value: 'all', label: `All (${props.notifications.length})` },
          ]}
        />
        {unread.length ? (
          <Button icon={<Icon.Check size={13} />} onClick={() => mark({ all: true }, 'All marked read')} loading={busy}>
            Mark all read
          </Button>
        ) : null}
      </div>

      {shown.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<Icon.Bell size={22} />}
            title={filter === 'unread' ? 'Nothing unread' : filter === 'critical' ? 'Nothing critical' : 'No notifications'}
            description={
              filter === 'unread'
                ? 'Everything here has been read. Alerts write a notification when they fire — run an evaluation from monitoring to check the current set.'
                : 'Alerts, earnings and thesis changes write here as they happen.'
            }
            action={<Link href="/monitoring" className="btn-secondary text-xs">Open monitoring</Link>}
          />
        </Panel>
      ) : (
        <Panel>
          <ol className="divide-y divide-line">
            {shown.map((n) => (
              <li key={n.id} className={cx('flex items-start gap-3 px-3 py-2.5', !n.readAt && 'bg-accent/[0.03]')}>
                <SeverityBadge value={n.severity} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className={cx('text-xs', n.readAt ? 'font-medium text-ink-2' : 'font-semibold text-ink')}>
                      {n.title}
                    </span>
                    <Badge tone="neutral">{n.category.toLowerCase()}</Badge>
                    {n.ticker ? (
                      <Link href={`/companies/${n.ticker}`} className="text-2xs font-semibold text-accent hover:underline">
                        {n.ticker}
                      </Link>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-2">{n.body}</p>
                  <div className="mt-1 flex items-center gap-3">
                    {n.href ? (
                      <Link href={n.href} className="inline-flex items-center gap-1 text-2xs text-accent hover:underline">
                        Open <Icon.ArrowRight size={11} />
                      </Link>
                    ) : null}
                    {!n.readAt ? (
                      <button
                        type="button"
                        onClick={() => mark({ ids: [n.id] }, 'Marked read')}
                        className="text-2xs text-ink-4 hover:text-accent focus-ring rounded"
                      >
                        Mark read
                      </button>
                    ) : null}
                  </div>
                </div>
                <span className="shrink-0 text-2xs text-ink-4">{formatDateTime(n.createdAt)}</span>
              </li>
            ))}
          </ol>
        </Panel>
      )}
    </div>
  );
}
