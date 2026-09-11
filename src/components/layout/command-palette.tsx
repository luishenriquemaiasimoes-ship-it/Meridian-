'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icons';
import { cx, Spinner } from '@/components/ui/primitives';
import { ALL_NAV_ITEMS } from './nav-config';

interface SearchHit {
  kind: string; id: string; title: string; subtitle: string; href: string; ticker?: string | null; score: number;
}

interface Command {
  id: string;
  label: string;
  hint?: string;
  group: string;
  action: () => void;
  keywords?: string;
}

const KIND_LABEL: Record<string, string> = {
  COMPANY: 'Company', RESEARCH_NOTE: 'Note', INVESTMENT_MEMO: 'Memo', PORTFOLIO: 'Portfolio',
  WATCHLIST: 'Watchlist', VALUATION_MODEL: 'Model', THESIS: 'Thesis', EARNINGS: 'Earnings',
  DOCUMENT: 'Document', SCREEN: 'Screen',
};

/**
 * Command palette. Opens on Cmd/Ctrl-K anywhere in the product and searches
 * companies, notes, memos, models, portfolios, watchlists and documents in the
 * active workspace, alongside the actions the user can take.
 */
export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const go = useCallback((href: string) => {
    onOpenChange(false);
    setQuery('');
    router.push(href);
  }, [onOpenChange, router]);

  const commands = useMemo<Command[]>(() => [
    ...ALL_NAV_ITEMS.map((n) => ({
      id: `nav-${n.href}`, label: `Go to ${n.label}`, hint: n.purpose,
      group: 'Navigate', action: () => go(n.href), keywords: n.label,
    })),
    { id: 'cmd-note', label: 'Create research note', group: 'Create', action: () => go('/research?new=note') },
    { id: 'cmd-memo', label: 'Create investment memo', group: 'Create', action: () => go('/memos?new=memo') },
    { id: 'cmd-watchlist', label: 'Create watchlist', group: 'Create', action: () => go('/watchlists?new=watchlist') },
    { id: 'cmd-alert', label: 'Create alert', group: 'Create', action: () => go('/monitoring?new=alert') },
    { id: 'cmd-screen', label: 'Run a screen', group: 'Analyse', action: () => go('/screener') },
    { id: 'cmd-ai', label: 'Ask the AI analyst', group: 'Analyse', action: () => go('/ai') },
    { id: 'cmd-agents', label: 'Run an AI agent', group: 'Analyse', action: () => go('/ai/agents') },
    { id: 'cmd-portfolio', label: 'Open portfolio', group: 'Analyse', action: () => go('/portfolio') },
    { id: 'cmd-rebalance', label: 'Open rebalancing plan', group: 'Analyse', action: () => go('/portfolio?tab=rebalance') },
  ], [go]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open || query.trim().length < 1) { setHits([]); return; }
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}&limit=18`, { signal: controller.signal })
        .then((r) => r.json())
        .then((d) => setHits(d.hits ?? []))
        .catch(() => { /* aborted or offline — the command list still works */ })
        .finally(() => setLoading(false));
    }, 120);
    return () => { clearTimeout(t); controller.abort(); };
  }, [query, open]);

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands.slice(0, 8);
    return commands.filter((c) => `${c.label} ${c.keywords ?? ''} ${c.group}`.toLowerCase().includes(q)).slice(0, 6);
  }, [commands, query]);

  const rows = useMemo(() => [
    ...hits.map((h) => ({ type: 'hit' as const, hit: h })),
    ...filteredCommands.map((c) => ({ type: 'command' as const, command: c })),
  ], [hits, filteredCommands]);

  useEffect(() => { setCursor(0); }, [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, rows.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      const row = rows[cursor];
      if (!row) return;
      if (row.type === 'hit') go(row.hit.href);
      else row.command.action();
    } else if (e.key === 'Escape') { onOpenChange(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center p-4 pt-[10vh] no-print">
      <div className="fixed inset-0 bg-black/50 animate-fade-in" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-[620px] panel shadow-pop animate-slide-up overflow-hidden" role="dialog" aria-modal="true" aria-label="Command palette">
        <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
          <Icon.Search size={15} className="text-ink-4" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search companies, notes, models, portfolios — or type a command"
            className="w-full bg-transparent text-md text-ink placeholder:text-ink-4 focus:outline-none"
          />
          {loading ? <Spinner size={13} /> : null}
          <kbd className="rounded border border-line px-1.5 py-0.5 text-2xs text-ink-4">ESC</kbd>
        </div>

        <div className="max-h-[52vh] overflow-y-auto py-1">
          {rows.length === 0 ? (
            <div className="px-4 py-8 text-center text-base text-ink-3">
              {query ? `Nothing in this workspace matches “${query}”.` : 'Start typing to search the workspace.'}
            </div>
          ) : null}

          {hits.length ? <div className="label px-3 py-1.5">Workspace</div> : null}
          {rows.map((row, i) => {
            const active = i === cursor;
            if (row.type === 'hit') {
              const h = row.hit;
              return (
                <button
                  key={`hit-${h.kind}-${h.id}`}
                  type="button"
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => go(h.href)}
                  className={cx('flex w-full items-center gap-3 px-3 py-2 text-left transition', active ? 'bg-accent/[0.10]' : 'hover:bg-raised')}
                >
                  <span className="w-[76px] shrink-0 text-2xs uppercase tracking-wider text-ink-4">{KIND_LABEL[h.kind] ?? h.kind}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base text-ink">{h.title}</span>
                    <span className="block truncate text-2xs text-ink-3">{h.subtitle}</span>
                  </span>
                  <Icon.ArrowRight size={13} className={cx('shrink-0', active ? 'text-accent' : 'text-ink-4')} />
                </button>
              );
            }
            const c = row.command;
            const isFirstCommand = i === hits.length;
            return (
              <div key={c.id}>
                {isFirstCommand ? <div className="label px-3 py-1.5">Commands</div> : null}
                <button
                  type="button"
                  onMouseEnter={() => setCursor(i)}
                  onClick={c.action}
                  className={cx('flex w-full items-center gap-3 px-3 py-2 text-left transition', active ? 'bg-accent/[0.10]' : 'hover:bg-raised')}
                >
                  <Icon.Command size={13} className="shrink-0 text-ink-4" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base text-ink">{c.label}</span>
                    {c.hint ? <span className="block truncate text-2xs text-ink-3">{c.hint}</span> : null}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-line px-3 py-1.5 text-2xs text-ink-4">
          <span>↑↓ to move · ↵ to open</span>
          <span>Everything shown is scoped to the active workspace.</span>
        </div>
      </div>
    </div>
  );
}

/** Registers the global Cmd/Ctrl-K shortcut. */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  return { open, setOpen };
}
