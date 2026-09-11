'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, cx, InlineNote, Panel, PanelHeader, Select, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { MetricCard } from '@/components/ui/values';
import { formatDate } from '@/lib/finance/format';

interface Member {
  userId: string; name: string; email: string; title: string | null;
  role: string; avatarColor: string; joinedAt: string; changes: number;
}

const ROLES = ['VIEWER', 'RESEARCHER', 'ANALYST', 'PORTFOLIO_MANAGER', 'ADMIN'] as const;

const ROLE_LABEL: Record<string, string> = {
  VIEWER: 'Viewer', RESEARCHER: 'Researcher', ANALYST: 'Analyst',
  PORTFOLIO_MANAGER: 'Portfolio manager', ADMIN: 'Administrator',
};

const ROLE_DESCRIPTION: Record<string, string> = {
  VIEWER: 'Reads research and portfolios, and exports data. Changes nothing.',
  RESEARCHER: 'Also writes notes, uploads documents, keeps watchlists and asks the AI analyst.',
  ANALYST: 'Also writes theses, builds valuation models, writes memos, saves screens and sets alerts.',
  PORTFOLIO_MANAGER: 'Also records trades, sets rebalancing targets, votes at committee and closes decisions.',
  ADMIN: 'Also manages the organisation, its members, its workspaces and its data sources.',
};

export function OrganizationPanel(props: {
  canManage: boolean;
  currentUserId: string;
  plan: string;
  members: Member[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const setRole = async (userId: string, role: string, name: string) => {
    setBusy(userId);
    try {
      const res = await fetch('/api/organization', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Role not changed', description: data.error }); return; }
      toast.push({ tone: 'pos', title: 'Role changed', description: `${name} is now ${ROLE_LABEL[role].toLowerCase()}.` });
      router.refresh();
    } finally { setBusy(null); }
  };

  const countByRole = (role: string) => props.members.filter((m) => m.role === role).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Members" value={props.members.length} format="number" decimals={0} />
        <MetricCard label="Administrators" value={countByRole('ADMIN')} format="number" decimals={0} />
        <MetricCard label="Can decide at committee" value={countByRole('PORTFOLIO_MANAGER') + countByRole('ADMIN')} format="number" decimals={0} />
        <MetricCard label="Plan" value={null} format="text" sublabel={props.plan.toLowerCase()} />
      </div>

      <Panel>
        <PanelHeader
          title="Members"
          subtitle={props.canManage ? 'Change a role and it takes effect on the next request.' : 'Only an administrator can change a role.'}
        />
        <div className="divide-y divide-line">
          {props.members.map((m) => (
            <div key={m.userId} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-2xs font-semibold text-white"
                style={{ backgroundColor: m.avatarColor }}
                aria-hidden
              >
                {initials(m.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-ink">{m.name}</span>
                  {m.userId === props.currentUserId ? <Badge tone="neutral">you</Badge> : null}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 text-2xs text-ink-4">
                  <span>{m.email}</span>
                  {m.title ? <span>{m.title}</span> : null}
                  <span>joined {formatDate(m.joinedAt)}</span>
                  <span>{m.changes} change{m.changes === 1 ? '' : 's'} in this workspace</span>
                </div>
              </div>
              {props.canManage && m.userId !== props.currentUserId ? (
                <Select
                  value={m.role}
                  disabled={busy === m.userId}
                  onChange={(e) => setRole(m.userId, e.target.value, m.name)}
                  className="w-[180px]"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                </Select>
              ) : (
                <Badge tone="neutral">{ROLE_LABEL[m.role] ?? m.role}</Badge>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="What each role may do" subtitle="Roles are inherited: each one adds to the one above it." />
        <div className="divide-y divide-line">
          {ROLES.map((r, i) => (
            <div key={r} className="flex items-start gap-3 px-3 py-2.5">
              <span className={cx('num mt-0.5 w-4 shrink-0 text-2xs', i === ROLES.length - 1 ? 'text-accent' : 'text-ink-4')}>
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-ink">{ROLE_LABEL[r]}</span>
                  <span className="num text-2xs text-ink-4">{countByRole(r)} member{countByRole(r) === 1 ? '' : 's'}</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-3">{ROLE_DESCRIPTION[r]}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <InlineNote tone="info">
        Every change anyone makes is attributed and kept — see the{' '}
        <a href="/audit" className="text-accent hover:underline">audit trail</a>. The organisation must always keep at
        least one administrator, so the last one cannot be demoted.
      </InlineNote>

      {!props.canManage ? (
        <p className="flex items-center gap-1.5 text-2xs text-ink-4">
          <Icon.Info size={11} /> Your role does not include member management.
        </p>
      ) : null}
    </div>
  );
}

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
}
