'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge, Button, cx, Field, InlineNote, Input, Modal, NumberInput, Panel, PanelHeader,
  Select, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { StatRow } from '@/components/ui/values';
import { formatDate, formatPercent } from '@/lib/finance/format';

interface WorkspaceRow {
  id: string; name: string; slug: string; kind: string; market: string; baseCurrency: string;
  riskFreeRate: number; equityRiskPremium: number; statutoryTaxRate: number;
  isDemo: boolean; benchmarkCode: string | null; benchmarkName: string | null; createdAt: string;
  counts: {
    theses: number; valuations: number; notes: number; memos: number;
    portfolios: number; watchlists: number; alerts: number; documents: number;
  };
}

const KIND_LABEL: Record<string, string> = {
  PERSONAL: 'Personal', RESEARCH: 'Research', PORTFOLIO: 'Portfolio', TEAM: 'Team',
};

export function WorkspacesWorkbench(props: {
  activeId: string;
  canManage: boolean;
  benchmarks: { code: string; name: string }[];
  workspaces: WorkspaceRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<WorkspaceRow | null>(null);
  const [form, setForm] = useState({ name: '', kind: 'RESEARCH', market: 'BRAZIL', baseCurrency: 'BRL' });
  const [edit, setEdit] = useState({
    name: '', riskFreeRate: 0, equityRiskPremium: 0, statutoryTaxRate: 0, benchmarkCode: '',
  });

  const openEdit = (w: WorkspaceRow) => {
    setEditing(w);
    setEdit({
      name: w.name,
      riskFreeRate: w.riskFreeRate * 100,
      equityRiskPremium: w.equityRiskPremium * 100,
      statutoryTaxRate: w.statutoryTaxRate * 100,
      benchmarkCode: w.benchmarkCode ?? '',
    });
  };

  const switchTo = async (id: string, name: string) => {
    setBusy(id);
    try {
      const res = await fetch('/api/workspace/switch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: id }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Could not switch', description: data.error }); return; }
      toast.push({ tone: 'pos', title: `Working in ${name}` });
      router.refresh();
    } finally { setBusy(null); }
  };

  const create = async () => {
    setBusy('new');
    try {
      const res = await fetch('/api/workspace', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Not created', description: data.error }); return; }
      toast.push({ tone: 'pos', title: 'Workspace created', description: `${form.name} is empty until you add coverage.` });
      setCreateOpen(false);
      setForm({ name: '', kind: 'RESEARCH', market: 'BRAZIL', baseCurrency: 'BRL' });
      router.refresh();
    } finally { setBusy(null); }
  };

  const save = async () => {
    if (!editing) return;
    setBusy(editing.id);
    try {
      const res = await fetch('/api/workspace', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: editing.id,
          name: edit.name,
          riskFreeRate: edit.riskFreeRate / 100,
          equityRiskPremium: edit.equityRiskPremium / 100,
          statutoryTaxRate: edit.statutoryTaxRate / 100,
          benchmarkCode: edit.benchmarkCode || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Not saved', description: data.error }); return; }
      toast.push({
        tone: 'pos', title: 'Workspace updated',
        description: 'The cost of capital changed, so every model that uses the workspace default will recompute.',
      });
      setEditing(null);
      router.refresh();
    } finally { setBusy(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-ink-3">
          {props.workspaces.length} workspace{props.workspaces.length === 1 ? '' : 's'} in this organisation.
        </p>
        {props.canManage ? (
          <Button variant="primary" icon={<Icon.Plus size={13} />} onClick={() => setCreateOpen(true)}>New workspace</Button>
        ) : null}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {props.workspaces.map((w) => {
          const active = w.id === props.activeId;
          return (
            <Panel key={w.id} className={cx(active && 'border-accent/50')}>
              <PanelHeader
                title={
                  <span className="flex items-center gap-2">
                    {w.name}
                    {active ? <Badge tone="pos">active</Badge> : null}
                    {w.isDemo ? <Badge tone="warn">demo data</Badge> : null}
                  </span>
                }
                subtitle={`${KIND_LABEL[w.kind] ?? w.kind} · ${w.market.toLowerCase()} · ${w.baseCurrency} · created ${formatDate(w.createdAt)}`}
                actions={
                  <div className="flex items-center gap-2">
                    {!active ? (
                      <Button loading={busy === w.id} onClick={() => switchTo(w.id, w.name)}>Switch to</Button>
                    ) : null}
                    {props.canManage ? (
                      <Button icon={<Icon.Edit size={13} />} onClick={() => openEdit(w)} title="Edit settings" />
                    ) : null}
                  </div>
                }
              />
              <div className="grid gap-4 px-3 pb-3 sm:grid-cols-2">
                <div className="divide-y divide-line">
                  <StatRow label="Benchmark" value={<span className="text-xs text-ink-2">{w.benchmarkCode ?? 'Not set'}</span>} />
                  <StatRow
                    label="Risk-free rate"
                    hint="Feeds the cost of equity in every model that uses the workspace default."
                    value={<span className="num text-xs text-ink-2">{formatPercent(w.riskFreeRate, 2)}</span>}
                  />
                  <StatRow label="Equity risk premium" value={<span className="num text-xs text-ink-2">{formatPercent(w.equityRiskPremium, 2)}</span>} />
                  <StatRow label="Statutory tax rate" value={<span className="num text-xs text-ink-2">{formatPercent(w.statutoryTaxRate, 1)}</span>} />
                </div>
                <div className="divide-y divide-line">
                  <StatRow label="Theses" value={<span className="num text-xs text-ink-2">{w.counts.theses}</span>} />
                  <StatRow label="Valuation models" value={<span className="num text-xs text-ink-2">{w.counts.valuations}</span>} />
                  <StatRow label="Notes and memos" value={<span className="num text-xs text-ink-2">{w.counts.notes + w.counts.memos}</span>} />
                  <StatRow label="Portfolios" value={<span className="num text-xs text-ink-2">{w.counts.portfolios}</span>} />
                  <StatRow label="Watchlists and alerts" value={<span className="num text-xs text-ink-2">{w.counts.watchlists + w.counts.alerts}</span>} />
                  <StatRow label="Documents" value={<span className="num text-xs text-ink-2">{w.counts.documents}</span>} />
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      <InlineNote tone="info">
        Companies, statements and prices are shared across the organisation. What belongs to a workspace is the work done
        on them: theses, models, notes, memos, portfolios, watchlists, alerts and documents.
      </InlineNote>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New workspace"
        subtitle="It starts empty. Coverage is shared; the work is not."
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={create} loading={busy === 'new'} disabled={form.name.trim().length < 2}>
              Create
            </Button>
          </div>
        }
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Name" required className="sm:col-span-2">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Offshore sleeve" />
          </Field>
          <Field label="Kind">
            <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              {Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Market">
            <Select value={form.market} onChange={(e) => setForm({ ...form, market: e.target.value })}>
              <option value="BRAZIL">Brazil</option>
              <option value="US">United States</option>
              <option value="GLOBAL">Global</option>
            </Select>
          </Field>
          <Field label="Base currency" className="sm:col-span-2">
            <Select value={form.baseCurrency} onChange={(e) => setForm({ ...form, baseCurrency: e.target.value })}>
              <option value="BRL">BRL — Brazilian real</option>
              <option value="USD">USD — US dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — Pound sterling</option>
            </Select>
          </Field>
        </div>
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={`Settings — ${editing?.name ?? ''}`}
        subtitle="The rates below are the workspace defaults. A model can override them, and shows when it has."
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" onClick={save} loading={busy === editing?.id}>Save</Button>
          </div>
        }
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Field label="Name" required className="sm:col-span-2">
            <Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
          </Field>
          <Field label="Benchmark" className="sm:col-span-2">
            <Select value={edit.benchmarkCode} onChange={(e) => setEdit({ ...edit, benchmarkCode: e.target.value })}>
              <option value="">Not set</option>
              {props.benchmarks.map((b) => <option key={b.code} value={b.code}>{b.code} — {b.name}</option>)}
            </Select>
          </Field>
          <Field label="Risk-free rate" hint="The rate every cost of equity starts from.">
            <NumberInput value={edit.riskFreeRate} onValueChange={(v) => setEdit({ ...edit, riskFreeRate: v })} suffix="%" step="0.05" />
          </Field>
          <Field label="Equity risk premium">
            <NumberInput value={edit.equityRiskPremium} onValueChange={(v) => setEdit({ ...edit, equityRiskPremium: v })} suffix="%" step="0.05" />
          </Field>
          <Field label="Statutory tax rate" className="sm:col-span-2" hint="Used where the effective rate is unusable — a loss year, or a rate outside a plausible band.">
            <NumberInput value={edit.statutoryTaxRate} onValueChange={(v) => setEdit({ ...edit, statutoryTaxRate: v })} suffix="%" step="0.5" />
          </Field>
          <InlineNote tone="warn">
            Changing these re-prices every model that uses the workspace default. Models with their own assumptions are
            untouched.
          </InlineNote>
        </div>
      </Modal>
    </div>
  );
}
