'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, Field, InlineNote, Input, Panel, PanelHeader, Segmented, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { StatRow } from '@/components/ui/values';
import { formatDate } from '@/lib/finance/format';

const PERMISSION_LABEL: Record<string, string> = {
  'workspace:read': 'Read the workspace',
  'research:read': 'Read research',
  'research:write': 'Write research',
  'thesis:write': 'Write and edit theses',
  'valuation:write': 'Build valuation models',
  'note:write': 'Write research notes',
  'memo:write': 'Write investment memos',
  'screen:write': 'Save screens',
  'watchlist:write': 'Manage watchlists',
  'alert:write': 'Manage alerts',
  'document:upload': 'Upload documents',
  'ai:query': 'Ask the AI analyst',
  'portfolio:read': 'Read portfolios',
  'portfolio:write': 'Record trades and cash',
  'portfolio:rebalance': 'Set rebalancing targets',
  'committee:vote': 'Vote at committee',
  'committee:decide': 'Close a committee decision',
  'export:data': 'Export data',
  'org:manage': 'Manage the organisation',
  'member:manage': 'Manage members and roles',
  'workspace:manage': 'Create and configure workspaces',
  'datasource:manage': 'Manage data sources',
  'audit:read': 'Read the audit trail',
};

export function ProfileForm(props: {
  name: string;
  email: string;
  title: string | null;
  theme: string;
  role: string;
  organizationName: string;
  workspaceName: string;
  createdAt: string;
  activityCount: number;
  activeSessions: number;
  permissions: readonly string[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState({ name: props.name, title: props.title ?? '' });
  const [theme, setTheme] = useState(props.theme);
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });

  const saveProfile = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, title: profile.title || null }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Not saved', description: data.error }); return; }
      toast.push({ tone: 'pos', title: 'Profile saved' });
      router.refresh();
    } finally { setBusy(false); }
  };

  const saveTheme = async (next: string) => {
    setTheme(next);
    const applied = next === 'system'
      ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      : next;
    document.documentElement.setAttribute('data-theme', applied);
    document.cookie = `meridian_theme=${applied}; path=/; max-age=${60 * 60 * 24 * 365}`;
    await fetch('/api/profile', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: next }),
    });
  };

  const changePassword = async () => {
    if (password.next !== password.confirm) {
      toast.push({ tone: 'neg', title: 'Passwords do not match' });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: password.current, newPassword: password.next }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Password not changed', description: data.error }); return; }
      toast.push({ tone: 'pos', title: 'Password changed', description: 'Existing sessions stay signed in.' });
      setPassword({ current: '', next: '', confirm: '' });
    } finally { setBusy(false); }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <Panel>
          <PanelHeader title="Your details" />
          <div className="grid gap-3 p-3 sm:grid-cols-2">
            <Field label="Name" required>
              <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </Field>
            <Field label="Title" hint="Appears beside your name on notes, memos and votes.">
              <Input value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} placeholder="Senior analyst" />
            </Field>
            <Field label="Email" className="sm:col-span-2" hint="Your sign-in address cannot be changed here.">
              <Input value={props.email} disabled readOnly />
            </Field>
            <div className="sm:col-span-2">
              <Button variant="primary" onClick={saveProfile} loading={busy}>Save details</Button>
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Appearance" subtitle="MERIDIAN is built for long sessions in both themes." />
          <div className="p-3">
            <Segmented
              value={theme}
              onChange={saveTheme}
              options={[
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
                { value: 'system', label: 'Match the system' },
              ]}
            />
            <p className="mt-2 text-2xs text-ink-4">
              Applied immediately and remembered on this device and on your account.
            </p>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Password" subtitle="At least eight characters." />
          <div className="grid gap-3 p-3 sm:grid-cols-3">
            <Field label="Current password">
              <Input type="password" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} autoComplete="current-password" />
            </Field>
            <Field label="New password">
              <Input type="password" value={password.next} onChange={(e) => setPassword({ ...password, next: e.target.value })} autoComplete="new-password" />
            </Field>
            <Field label="Confirm new password" error={password.confirm && password.next !== password.confirm ? 'These do not match.' : null}>
              <Input type="password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} autoComplete="new-password" />
            </Field>
            <div className="sm:col-span-3">
              <Button
                onClick={changePassword}
                loading={busy}
                disabled={!password.current || password.next.length < 8 || password.next !== password.confirm}
              >
                Change password
              </Button>
            </div>
          </div>
        </Panel>
      </div>

      <aside className="space-y-3">
        <Panel>
          <PanelHeader title="Account" dense />
          <div className="px-3 pb-3 divide-y divide-line">
            <StatRow label="Role" value={<Badge tone="neutral">{props.role.replace('_', ' ').toLowerCase()}</Badge>} />
            <StatRow label="Organisation" value={<span className="text-xs text-ink-2">{props.organizationName}</span>} />
            <StatRow label="Working in" value={<span className="text-xs text-ink-2">{props.workspaceName}</span>} />
            <StatRow label="Member since" value={<span className="text-xs text-ink-2">{formatDate(props.createdAt)}</span>} />
            <StatRow label="Changes you have made" value={<span className="num text-xs text-ink-2">{props.activityCount}</span>} />
            <StatRow label="Active sessions" value={<span className="num text-xs text-ink-2">{props.activeSessions}</span>} />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="What your role allows" subtitle={`${props.permissions.length} permissions`} dense />
          <ul className="px-3 pb-3">
            {props.permissions.map((p) => (
              <li key={p} className="flex items-start gap-1.5 py-0.5 text-2xs text-ink-2">
                <Icon.Check size={11} className="mt-0.5 shrink-0 text-pos" />
                <span>{PERMISSION_LABEL[p] ?? p}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <InlineNote tone="info">
          Roles are inherited: an analyst can do everything a researcher can, a portfolio manager everything an analyst
          can. Ask an administrator to change yours.
        </InlineNote>
      </aside>
    </div>
  );
}
