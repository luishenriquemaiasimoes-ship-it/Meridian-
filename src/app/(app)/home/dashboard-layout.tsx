'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Checkbox, cx, InlineNote, Modal, useToast } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';

export interface DashboardSection {
  id: string;
  label: string;
  /** Sections that carry nothing are offered but marked as empty. */
  empty?: boolean;
  node: ReactNode;
}

/**
 * The home dashboard is arranged by the desk, not fixed by the product: each
 * section can be hidden or moved, and the arrangement is stored on the
 * workspace so everyone working in that book opens the same page.
 */
export function DashboardLayout(props: {
  main: DashboardSection[];
  rail: DashboardSection[];
  hidden: string[];
  order: string[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hidden, setHidden] = useState<string[]>(props.hidden);
  const [order, setOrder] = useState<string[]>(props.order);

  const arrange = useCallback(
    (sections: DashboardSection[], visibleOnly: boolean) => {
      const index = new Map(order.map((id, i) => [id, i]));
      return sections
        .filter((s) => !visibleOnly || !hidden.includes(s.id))
        .slice()
        .sort((a, b) => (index.get(a.id) ?? 999) - (index.get(b.id) ?? 999));
    },
    [hidden, order],
  );

  const mainVisible = useMemo(() => arrange(props.main, true), [props.main, arrange]);
  const railVisible = useMemo(() => arrange(props.rail, true), [props.rail, arrange]);

  const all = useMemo(() => [...props.main, ...props.rail], [props.main, props.rail]);
  const ordered = useMemo(() => arrange(all, false), [all, arrange]);

  const move = (id: string, direction: -1 | 1) => {
    const ids = ordered.map((s) => s.id);
    const from = ids.indexOf(id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    setOrder(ids);
  };

  const toggle = (id: string) => {
    setHidden((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
  };

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/workspace/layout', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden, order: ordered.map((s) => s.id) }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Layout not saved', description: data.error }); return; }
      toast.push({
        tone: 'pos',
        title: 'Layout saved',
        description: `${all.length - hidden.length} of ${all.length} sections shown to everyone working in this workspace.`,
      });
      setOpen(false);
      router.refresh();
    } finally { setBusy(false); }
  };

  const reset = () => {
    setHidden([]);
    setOrder(all.map((s) => s.id));
  };

  return (
    <>
      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-2xs text-ink-4">
          {mainVisible.length + railVisible.length} of {all.length} sections shown.
        </p>
        <Button size="xs" icon={<Icon.Grid size={12} />} onClick={() => setOpen(true)}>Arrange</Button>
      </div>

      <div className="mt-2 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {mainVisible.map((s) => <div key={s.id}>{s.node}</div>)}
          {mainVisible.length === 0 ? (
            <InlineNote tone="info">Every section in this column is hidden. Use Arrange to bring one back.</InlineNote>
          ) : null}
        </div>
        <div className="space-y-4">
          {railVisible.map((s) => <div key={s.id}>{s.node}</div>)}
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Arrange the dashboard"
        subtitle="Hide what the desk does not look at, and put what it does at the top. Saved for everyone working in this workspace."
        footer={
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={reset} className="text-2xs text-ink-3 hover:text-accent focus-ring rounded">
              Reset to the default arrangement
            </button>
            <div className="flex gap-2">
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={save} loading={busy}>Save layout</Button>
            </div>
          </div>
        }
      >
        <div className="p-4">
          <ul className="space-y-1">
            {ordered.map((s, i) => {
              const isHidden = hidden.includes(s.id);
              return (
                <li
                  key={s.id}
                  className={cx(
                    'flex items-center gap-2 rounded border px-2 py-1.5 transition',
                    isHidden ? 'border-line bg-sunken opacity-60' : 'border-line',
                  )}
                >
                  <Checkbox checked={!isHidden} onChange={() => toggle(s.id)} />
                  <span className="min-w-0 flex-1 truncate text-xs text-ink-2">
                    {s.label}
                    {s.empty ? <span className="ml-2 text-2xs text-ink-4">nothing to show right now</span> : null}
                  </span>
                  <span className="shrink-0 text-2xs text-ink-4">
                    {props.rail.some((r) => r.id === s.id) ? 'side' : 'main'}
                  </span>
                  <button
                    type="button" title="Move up" disabled={i === 0} onClick={() => move(s.id, -1)}
                    className="rounded p-0.5 text-ink-4 hover:text-ink-2 disabled:opacity-30 focus-ring"
                  >
                    <Icon.ArrowUp size={12} />
                  </button>
                  <button
                    type="button" title="Move down" disabled={i === ordered.length - 1} onClick={() => move(s.id, 1)}
                    className="rounded p-0.5 text-ink-4 hover:text-ink-2 disabled:opacity-30 focus-ring"
                  >
                    <Icon.ArrowDown size={12} />
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-2xs text-ink-4">
            A section keeps its column; ordering applies within it. Hiding a section removes it from the page but changes
            nothing about the data behind it.
          </p>
        </div>
      </Modal>
    </>
  );
}
