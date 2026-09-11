'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, cx, EmptyState, Field, InlineNote, Input, Panel, PanelHeader, Select, useToast } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { AgentReportView } from '@/components/ai/agent-report';
import { AGENT_META, type AgentId, type AgentReport } from '@/lib/ai/agents';

const ORDER: AgentId[] = ['DCF_BUILD', 'MODEL_AUDIT', 'QA_PREP', 'THESIS_MONITOR'];

const AGENT_ICON: Record<AgentId, keyof typeof Icon> = {
  DCF_BUILD: 'Valuation', MODEL_AUDIT: 'Scale', QA_PREP: 'Vote', THESIS_MONITOR: 'Monitoring',
};

function isAgentId(v: string | null): v is AgentId {
  return v !== null && (ORDER as string[]).includes(v);
}

/**
 * Picking an agent, pointing it at something, and reading what came back.
 * The run is a POST rather than a page load because it is a procedure with a
 * cost, not a view: nothing runs until someone asks for it.
 */
export function AgentsWorkbench(props: {
  companies: { ticker: string; name: string; sector: string }[];
  models: { id: string; name: string; ticker: string; status: string }[];
  initialAgent: string | null;
  initialTicker: string | null;
}) {
  const toast = useToast();
  const [agent, setAgent] = useState<AgentId>(isAgentId(props.initialAgent) ? props.initialAgent : 'MODEL_AUDIT');
  const [ticker, setTicker] = useState<string>(props.initialTicker?.toUpperCase() ?? props.companies[0]?.ticker ?? '');
  const [modelId, setModelId] = useState<string>('');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<AgentReport | null>(null);

  const meta = AGENT_META[agent];
  const needsCompany = meta.scope === 'COMPANY';

  const companies = useMemo(() => {
    const q = query.trim().toLowerCase();
    return props.companies.filter((c) => !q || c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }, [props.companies, query]);

  const models = useMemo(
    () => props.models.filter((m) => m.ticker === ticker),
    [props.models, ticker],
  );

  const run = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/agents', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent,
          ticker: needsCompany ? ticker : null,
          modelId: needsCompany && modelId ? modelId : null,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setReport(null);
        toast.push({ tone: 'neg', title: 'The agent could not run', description: d.error });
        return;
      }
      setReport(d.report as AgentReport);
    } finally { setBusy(false); }
  };

  return (
    <div className="grid gap-3 lg:grid-cols-[300px_1fr]">
      <div className="space-y-3">
        <Panel>
          <PanelHeader title="Agents" dense />
          <div className="p-1.5 space-y-0.5">
            {ORDER.map((id) => {
              const m = AGENT_META[id];
              const IconComponent = Icon[AGENT_ICON[id]];
              return (
                <button
                  key={id} type="button"
                  onClick={() => { setAgent(id); setReport(null); }}
                  className={cx(
                    'w-full rounded px-2 py-2 text-left transition focus-ring',
                    id === agent ? 'bg-sunken' : 'hover:bg-sunken/60',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cx(id === agent ? 'text-accent' : 'text-ink-4')}><IconComponent size={13} /></span>
                    <span className={cx('text-xs font-medium', id === agent ? 'text-ink' : 'text-ink-2')}>{m.name}</span>
                    {m.scope === 'WORKSPACE' ? <Badge tone="outline">workspace</Badge> : null}
                  </span>
                  <span className="mt-0.5 block pl-[21px] text-2xs leading-relaxed text-ink-4">{m.purpose}</span>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Run it on" dense />
          <div className="space-y-2.5 p-3">
            {needsCompany ? (
              <>
                <Field label="Company">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search coverage"
                  />
                </Field>
                <div className="flex max-h-[180px] flex-wrap gap-1 overflow-y-auto">
                  {companies.map((c) => (
                    <button
                      key={c.ticker} type="button"
                      onClick={() => { setTicker(c.ticker); setModelId(''); setReport(null); }}
                      className={cx(
                        'h-6 rounded border px-2 text-2xs transition focus-ring',
                        c.ticker === ticker
                          ? 'border-accent/60 bg-accent/10 text-accent'
                          : 'border-line text-ink-3 hover:border-line-strong hover:text-ink-2',
                      )}
                    >
                      <span className="num">{c.ticker}</span>
                    </button>
                  ))}
                  {companies.length === 0 ? <p className="px-1 py-2 text-2xs text-ink-4">Nothing matches.</p> : null}
                </div>

                {agent !== 'QA_PREP' ? (
                  <Field label="Model" hint={models.length ? undefined : 'No saved DCF for this company — the agent will use the model the platform would start from.'}>
                    <Select value={modelId} onChange={(e) => setModelId(e.target.value)} disabled={!models.length}>
                      <option value="">Most recently updated</option>
                      {models.map((m) => (
                        <option key={m.id} value={m.id}>{m.name} · {m.status.toLowerCase()}</option>
                      ))}
                    </Select>
                  </Field>
                ) : null}
              </>
            ) : (
              <p className="text-2xs leading-relaxed text-ink-3">
                This one reads every live thesis in the workspace and the models behind them. There is nothing to pick.
              </p>
            )}

            <Button
              variant="primary"
              onClick={() => void run()}
              loading={busy}
              disabled={needsCompany && !ticker}
              icon={<Icon.Sparkle size={12} />}
              className="w-full"
            >
              Run {meta.name.replace(' Agent', '')}
            </Button>
          </div>
        </Panel>

        <InlineNote tone="info">
          An agent reads the workspace and nothing else. Where a figure is not on file it says so;
          it never fills the gap with a typical value, and it never writes into a model.
        </InlineNote>
      </div>

      <div className="min-w-0">
        {report ? (
          <AgentReportView report={report} />
        ) : (
          <Panel>
            <EmptyState
              icon={<Icon.Sparkle size={22} />}
              title={meta.name}
              description={meta.purpose}
              action={
                <Button variant="primary" onClick={() => void run()} loading={busy} disabled={needsCompany && !ticker}>
                  Run it{needsCompany && ticker ? ` on ${ticker}` : ''}
                </Button>
              }
            />
          </Panel>
        )}
      </div>
    </div>
  );
}
