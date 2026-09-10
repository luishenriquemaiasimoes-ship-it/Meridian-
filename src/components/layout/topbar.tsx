'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/icons';
import { Badge, Button, cx, IconButton, Tooltip, useToast } from '@/components/ui/primitives';
import { formatDateTime } from '@/lib/finance/format';

interface NotificationRow {
  id: string; severity: string; category: string; title: string; body: string;
  ticker: string | null; href: string | null; readAt: string | null; createdAt: string;
}

export function TopBar({
  onOpenCommand, onOpenMobileNav, user, workspaces, activeWorkspaceId, theme,
}: {
  onOpenCommand: () => void;
  onOpenMobileNav: () => void;
  user: { name: string; email: string; title: string | null; avatarColor: string };
  workspaces: { id: string; name: string; kind: string }[];
  activeWorkspaceId: string;
  theme: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unread, setUnread] = useState(0);
  const [panel, setPanel] = useState<'none' | 'notifications' | 'user' | 'workspace' | 'add'>('none');
  const [currentTheme, setCurrentTheme] = useState(theme);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setNotifications(d.notifications ?? []);
        setUnread(d.unread ?? 0);
      })
      .catch(() => { /* the bell simply stays empty if the request fails */ });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const close = () => setPanel('none');
    if (panel !== 'none') {
      document.addEventListener('click', close);
      return () => document.removeEventListener('click', close);
    }
  }, [panel]);

  const toggleTheme = () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    document.cookie = `meridian_theme=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
  };

  const switchWorkspace = async (id: string) => {
    const res = await fetch('/api/workspace/switch', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: id }),
    });
    if (res.ok) { setPanel('none'); router.refresh(); }
    else toast.push({ tone: 'neg', title: 'Could not switch workspace' });
  };

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
    setUnread(0);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const active = workspaces.find((w) => w.id === activeWorkspaceId);
  const severityTone = (s: string): 'neg' | 'warn' | 'neutral' =>
    s === 'CRITICAL' ? 'neg' : s === 'IMPORTANT' ? 'warn' : 'neutral';

  return (
    <header className="sticky top-0 z-40 flex h-[46px] items-center gap-2 border-b border-line bg-panel px-2.5 no-print">
      <IconButton label="Open navigation" className="lg:hidden" onClick={onOpenMobileNav}>
        <Icon.Menu size={16} />
      </IconButton>

      <button
        type="button"
        onClick={onOpenCommand}
        className="group flex h-7 min-w-0 flex-1 max-w-[520px] items-center gap-2 rounded border border-line bg-sunken px-2.5 text-left transition hover:border-line-strong focus-ring"
      >
        <Icon.Search size={13} className="shrink-0 text-ink-4" />
        <span className="truncate text-xs text-ink-4 group-hover:text-ink-3">
          Search companies, notes, models, portfolios…
        </span>
        <kbd className="ml-auto hidden shrink-0 rounded border border-line px-1 py-px text-2xs text-ink-4 sm:block">⌘K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        {/* Quick add */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <Tooltip content="Quick add">
            <IconButton label="Quick add" onClick={() => setPanel(panel === 'add' ? 'none' : 'add')}>
              <Icon.Plus size={16} />
            </IconButton>
          </Tooltip>
          {panel === 'add' ? (
            <div className="absolute right-0 top-full mt-1 w-[210px] panel shadow-pop py-1 animate-slide-up">
              {[
                { label: 'Research note', href: '/research?new=note' },
                { label: 'Investment memo', href: '/memos?new=memo' },
                { label: 'Valuation model', href: '/valuation?new=model' },
                { label: 'Watchlist', href: '/watchlists?new=watchlist' },
                { label: 'Alert', href: '/monitoring?new=alert' },
                { label: 'Saved screen', href: '/screener' },
                { label: 'Committee item', href: '/committee?new=item' },
              ].map((i) => (
                <Link
                  key={i.href} href={i.href} onClick={() => setPanel('none')}
                  className="block px-3 py-1.5 text-base text-ink-2 hover:bg-raised hover:text-ink"
                >
                  {i.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {/* Notifications */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <Tooltip content="Notifications">
            <IconButton label="Notifications" onClick={() => setPanel(panel === 'notifications' ? 'none' : 'notifications')}>
              <span className="relative">
                <Icon.Bell size={16} />
                {unread > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-[13px] min-w-[13px] items-center justify-center rounded-full bg-neg px-[3px] text-[9px] font-semibold text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                ) : null}
              </span>
            </IconButton>
          </Tooltip>
          {panel === 'notifications' ? (
            <div className="absolute right-0 top-full mt-1 w-[360px] panel shadow-pop animate-slide-up">
              <div className="flex items-center justify-between border-b border-line px-3 py-2">
                <span className="text-xs font-semibold text-ink">Notifications</span>
                <Button size="xs" variant="ghost" onClick={markAllRead} disabled={unread === 0}>Mark all read</Button>
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-3 py-6 text-center text-xs text-ink-3">Nothing yet.</p>
                ) : notifications.slice(0, 12).map((n) => (
                  <Link
                    key={n.id} href={n.href ?? '/monitoring'} onClick={() => setPanel('none')}
                    className={cx('block border-b border-line/60 px-3 py-2 transition hover:bg-raised', !n.readAt && 'bg-accent/[0.04]')}
                  >
                    <div className="flex items-start gap-2">
                      <Badge tone={severityTone(n.severity)}>{n.severity.slice(0, 4)}</Badge>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-ink">{n.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-2xs text-ink-3">{n.body}</p>
                        <p className="mt-1 text-2xs text-ink-4">{formatDateTime(n.createdAt)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/monitoring" onClick={() => setPanel('none')} className="block border-t border-line px-3 py-2 text-center text-xs text-accent hover:bg-raised">
                Open monitoring
              </Link>
            </div>
          ) : null}
        </div>

        <Tooltip content={currentTheme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
          <IconButton label="Toggle theme" onClick={toggleTheme}>
            {currentTheme === 'dark' ? <Icon.Sun size={15} /> : <Icon.Moon size={15} />}
          </IconButton>
        </Tooltip>

        {/* Workspace selector */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setPanel(panel === 'workspace' ? 'none' : 'workspace')}
            className="flex h-7 items-center gap-1.5 rounded border border-line px-2 text-xs text-ink-2 transition hover:border-line-strong hover:text-ink focus-ring"
          >
            <Icon.Workspace size={13} className="text-ink-3" />
            <span className="hidden max-w-[110px] truncate sm:block">{active?.name ?? 'Workspace'}</span>
            <Icon.Chevron size={12} className="text-ink-4" />
          </button>
          {panel === 'workspace' ? (
            <div className="absolute right-0 top-full mt-1 w-[230px] panel shadow-pop py-1 animate-slide-up">
              <div className="label px-3 py-1.5">Switch workspace</div>
              {workspaces.map((w) => (
                <button
                  key={w.id} type="button" onClick={() => switchWorkspace(w.id)}
                  className={cx(
                    'flex w-full items-center justify-between px-3 py-1.5 text-left text-base transition hover:bg-raised',
                    w.id === activeWorkspaceId ? 'text-ink' : 'text-ink-2',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{w.name}</span>
                    <span className="block text-2xs text-ink-4">{w.kind.toLowerCase()}</span>
                  </span>
                  {w.id === activeWorkspaceId ? <Icon.Check size={13} className="text-accent shrink-0" /> : null}
                </button>
              ))}
              <div className="mt-1 border-t border-line pt-1">
                <Link href="/workspaces" onClick={() => setPanel('none')} className="block px-3 py-1.5 text-base text-accent hover:bg-raised">
                  Manage workspaces
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        {/* User */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setPanel(panel === 'user' ? 'none' : 'user')}
            className="flex h-7 w-7 items-center justify-center rounded-full text-2xs font-semibold text-white focus-ring"
            style={{ backgroundColor: user.avatarColor }}
            aria-label="Account"
          >
            {user.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </button>
          {panel === 'user' ? (
            <div className="absolute right-0 top-full mt-1 w-[230px] panel shadow-pop animate-slide-up">
              <div className="border-b border-line px-3 py-2.5">
                <p className="text-base font-medium text-ink">{user.name}</p>
                <p className="text-2xs text-ink-3">{user.title ?? user.email}</p>
              </div>
              <div className="py-1">
                <Link href="/settings/profile" onClick={() => setPanel('none')} className="block px-3 py-1.5 text-base text-ink-2 hover:bg-raised hover:text-ink">Profile</Link>
                <Link href="/settings" onClick={() => setPanel('none')} className="block px-3 py-1.5 text-base text-ink-2 hover:bg-raised hover:text-ink">Settings</Link>
                <Link href="/settings/organization" onClick={() => setPanel('none')} className="block px-3 py-1.5 text-base text-ink-2 hover:bg-raised hover:text-ink">Organization</Link>
                <Link href="/audit" onClick={() => setPanel('none')} className="block px-3 py-1.5 text-base text-ink-2 hover:bg-raised hover:text-ink">Audit trail</Link>
              </div>
              <div className="border-t border-line py-1">
                <button type="button" onClick={logout} className="block w-full px-3 py-1.5 text-left text-base text-neg hover:bg-raised">
                  Sign out
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
