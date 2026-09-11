'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge, Button, EmptyState, Field, Panel, PanelHeader, Select } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { MetricCard } from '@/components/ui/values';
import { formatDateTime } from '@/lib/finance/format';
import { downloadText, toCsv } from '@/lib/import/csv';

interface Entry {
  id: string; actorName: string; action: string; entityType: string;
  entityId: string | null; entityLabel: string | null; field: string | null;
  previousValue: string | null; newValue: string | null; summary: string; createdAt: string;
  /** False when the entity the entry refers to has since been deleted. */
  linkable: boolean;
}

const ACTION_TONE: Record<string, 'pos' | 'neutral' | 'warn' | 'neg'> = {
  CREATE: 'pos', UPDATE: 'warn', DELETE: 'neg', EXPORT: 'neutral', LOGIN: 'neutral', AI_QUERY: 'neutral',
};

/** Where an entity can be opened, when the record points at something reachable. */
function hrefFor(entry: Entry): string | null {
  // The record of a change outlives the thing it changed. A deletion, or an
  // entity deleted later, has no page to link to.
  if (entry.action === 'DELETE' || !entry.linkable) return null;
  switch (entry.entityType) {
    case 'InvestmentThesis':
    case 'TargetPriceRecord':
      return entry.entityLabel ? `/companies/${entry.entityLabel.split(' ')[0]}/thesis` : null;
    case 'ValuationModel':
      return entry.entityId ? `/valuation` : null;
    case 'ResearchNote':
      return entry.entityId ? `/research/notes/${entry.entityId}` : null;
    case 'InvestmentMemo':
      return entry.entityId ? `/memos/${entry.entityId}` : null;
    case 'CommitteeItem':
      return '/committee';
    case 'Document':
      return entry.entityId ? `/library/${entry.entityId}` : null;
    case 'Alert':
      return '/monitoring';
    case 'Watchlist':
      return '/watchlists';
    case 'PortfolioPosition':
    case 'PortfolioTransaction':
    case 'RebalanceTargetRecord':
      return '/portfolio';
    case 'Workspace':
      return '/workspaces';
    case 'Membership':
      return '/settings/organization';
    default:
      return null;
  }
}

export function AuditTrail(props: {
  entries: Entry[];
  entityTypes: string[];
  actions: string[];
  actors: string[];
  filters: { entity: string; action: string; actor: string };
  total: number;
}) {
  const router = useRouter();

  const apply = (patch: Partial<typeof props.filters>) => {
    const next = { ...props.filters, ...patch };
    const params = new URLSearchParams();
    if (next.entity) params.set('entity', next.entity);
    if (next.action) params.set('action', next.action);
    if (next.actor) params.set('actor', next.actor);
    router.push(`/audit${params.toString() ? `?${params}` : ''}`);
  };

  const grouped = useMemo(() => {
    const out: { day: string; entries: Entry[] }[] = [];
    for (const e of props.entries) {
      const day = e.createdAt.slice(0, 10);
      const last = out[out.length - 1];
      if (last && last.day === day) last.entries.push(e);
      else out.push({ day, entries: [e] });
    }
    return out;
  }, [props.entries]);

  const exportCsv = () => {
    downloadText(
      'meridian-audit-trail.csv',
      toCsv(
        ['When', 'Who', 'Action', 'Entity type', 'Entity', 'Field', 'From', 'To', 'Summary'],
        props.entries.map((e) => [
          e.createdAt, e.actorName, e.action, e.entityType, e.entityLabel ?? '',
          e.field ?? '', e.previousValue ?? '', e.newValue ?? '', e.summary,
        ]),
      ),
    );
  };

  const filtered = props.filters.entity || props.filters.action || props.filters.actor;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Entries in this workspace" value={props.total} format="number" decimals={0} />
        <MetricCard label="Shown" value={props.entries.length} format="number" decimals={0} sublabel={props.entries.length >= 400 ? 'Most recent 400' : undefined} />
        <MetricCard label="People with activity" value={props.actors.length} format="number" decimals={0} />
        <MetricCard label="Kinds of record" value={props.entityTypes.length} format="number" decimals={0} />
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <Field label="Entity" className="min-w-[170px]">
          <Select value={props.filters.entity} onChange={(e) => apply({ entity: e.target.value })}>
            <option value="">Everything</option>
            {props.entityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Action" className="min-w-[140px]">
          <Select value={props.filters.action} onChange={(e) => apply({ action: e.target.value })}>
            <option value="">Every action</option>
            {props.actions.map((a) => <option key={a} value={a}>{a.replace('_', ' ').toLowerCase()}</option>)}
          </Select>
        </Field>
        <Field label="Person" className="min-w-[170px]">
          <Select value={props.filters.actor} onChange={(e) => apply({ actor: e.target.value })}>
            <option value="">Anyone</option>
            {props.actors.map((a) => <option key={a} value={a}>{a}</option>)}
          </Select>
        </Field>
        {filtered ? <Button onClick={() => router.push('/audit')}>Clear</Button> : null}
        <Button icon={<Icon.Download size={13} />} onClick={exportCsv} className="ml-auto" disabled={!props.entries.length}>
          Export CSV
        </Button>
      </div>

      {props.entries.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<Icon.Book size={22} />}
            title="Nothing recorded"
            description={filtered ? 'No entry matches those filters.' : 'Changes made in this workspace will appear here as they happen.'}
          />
        </Panel>
      ) : (
        <div className="space-y-3">
          {grouped.map((g) => (
            <Panel key={g.day}>
              <PanelHeader title={formatDateTime(`${g.day}T12:00:00Z`).split(' ')[0]} subtitle={`${g.entries.length} change${g.entries.length === 1 ? '' : 's'}`} dense />
              <ol className="divide-y divide-line">
                {g.entries.map((e) => {
                  const href = hrefFor(e);
                  return (
                    <li key={e.id} className="flex items-start gap-3 px-3 py-2">
                      <Badge tone={ACTION_TONE[e.action] ?? 'neutral'}>{e.action.replace('_', ' ').toLowerCase()}</Badge>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-relaxed text-ink-2">{e.summary}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-2xs text-ink-4">
                          <span className="text-ink-3">{e.actorName}</span>
                          <span>{e.entityType}</span>
                          {e.entityLabel ? (
                            href
                              ? <Link href={href} className="text-accent hover:underline">{e.entityLabel}</Link>
                              : <span>{e.entityLabel}</span>
                          ) : null}
                          {e.field ? (
                            <span>
                              {e.field}: <span className="text-ink-3">{e.previousValue ?? 'unset'}</span>
                              {' → '}
                              <span className="text-ink-2">{e.newValue ?? 'unset'}</span>
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <span className="shrink-0 text-2xs text-ink-4">{e.createdAt.slice(11, 16)}</span>
                    </li>
                  );
                })}
              </ol>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
