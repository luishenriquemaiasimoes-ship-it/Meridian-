'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge, cx, Panel, PanelHeader, Tooltip } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { AnswerBlockRow } from './answer-card';
import { AGENT_META, type AgentFinding, type AgentReport, type AgentStep, type FindingSeverity } from '@/lib/ai/agents';
import { formatDateTime } from '@/lib/finance/format';

/* ==================================================================
   An agent report, rendered so every line can be checked.

   The severity badge says how seriously to take a finding; the source
   list says where to go and look. A finding with nothing to look at
   cannot be constructed, so there is no empty case to render.
   ================================================================== */

const SEVERITY_TONE: Record<FindingSeverity, 'pos' | 'neg' | 'warn' | 'neutral'> = {
  PASS: 'pos', FAIL: 'neg', WARNING: 'warn', INFO: 'neutral',
};

const SEVERITY_LABEL: Record<FindingSeverity, string> = {
  PASS: 'Pass', FAIL: 'Fail', WARNING: 'Warning', INFO: 'Note',
};

/** Explicit, because Tailwind cannot see a class name built at runtime. */
const SEVERITY_TEXT: Record<FindingSeverity, string> = {
  PASS: 'text-pos', FAIL: 'text-neg', WARNING: 'text-warn', INFO: 'text-ink-2',
};

const STEP_TONE: Record<AgentStep['status'], 'pos' | 'warn' | 'neg'> = {
  DONE: 'pos', NEEDS_INPUT: 'warn', BLOCKED: 'neg',
};

const STEP_LABEL: Record<AgentStep['status'], string> = {
  DONE: 'Answered', NEEDS_INPUT: 'Needs a premise', BLOCKED: 'Blocked',
};

export function AgentReportView({ report }: { report: AgentReport }) {
  const meta = AGENT_META[report.agent];
  const areas = Array.from(new Set(report.findings.map((f) => f.area)));

  return (
    <div className="space-y-3">
      <Panel>
        <PanelHeader
          title={report.headline}
          subtitle={`${meta.name} · ${report.subjectLabel} · ${formatDateTime(report.generatedAt)}`}
          actions={
            <div className="flex flex-wrap items-center gap-1.5">
              {report.simulated ? <Badge tone="warn">Simulated data</Badge> : null}
              {report.verdict ? <Badge tone={SEVERITY_TONE[report.verdict]}>{SEVERITY_LABEL[report.verdict]}</Badge> : null}
            </div>
          }
        />

        <div className="grid grid-cols-4 gap-px border-y border-line bg-line">
          {(['FAIL', 'WARNING', 'INFO', 'PASS'] as FindingSeverity[]).map((s) => (
            <div key={s} className="bg-panel px-3 py-2">
              <span className="label">{SEVERITY_LABEL[s]}</span>
              <span className={cx('block num text-lg font-semibold', report.counts[s] ? SEVERITY_TEXT[s] : 'text-ink-4')}>
                {report.counts[s]}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2.5 p-3">
          {report.statements.map((s, i) => (
            <AnswerBlockRow key={i} block={s} />
          ))}
        </div>
      </Panel>

      {report.steps.length ? (
        <Panel>
          <PanelHeader
            title="The build, layer by layer"
            subtitle="Each layer asks before it is used. What the workspace can offer is shown with its source; nothing is written into the model."
          />
          <div className="divide-y divide-line">
            {report.steps.map((step) => <StepRow key={step.id} step={step} />)}
          </div>
        </Panel>
      ) : null}

      {report.findings.length ? (
        <Panel>
          <PanelHeader title="Findings" subtitle="Worst first. Every one names where it can be checked." />
          <div className="divide-y divide-line">
            {areas.map((area) => (
              <div key={area}>
                <div className="bg-sunken/50 px-3 py-1.5">
                  <span className="label">{area}</span>
                </div>
                {report.findings.filter((f) => f.area === area).map((f) => <FindingRow key={f.id} finding={f} />)}
              </div>
            ))}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}

function FindingRow({ finding }: { finding: AgentFinding }) {
  return (
    <div className="flex gap-2.5 px-3 py-2.5">
      <Badge tone={SEVERITY_TONE[finding.severity]} className="mt-0.5 shrink-0">
        {SEVERITY_LABEL[finding.severity]}
      </Badge>
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-medium text-ink">{finding.title}</p>
        <p className="text-xs leading-relaxed text-ink-2">{finding.detail}</p>
        {finding.remedy ? (
          <p className="text-2xs leading-relaxed text-ink-3">
            <span className="text-ink-4">What to do: </span>{finding.remedy}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {finding.sources.map((s) => <SourceChip key={s} source={s} />)}
        </div>
      </div>
    </div>
  );
}

function StepRow({ step }: { step: AgentStep }) {
  const [open, setOpen] = useState(step.status !== 'DONE');
  const body = step.offered.length || step.findings.length;

  return (
    <div className="px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        <span className="num mt-0.5 w-5 shrink-0 text-2xs text-ink-4">{String(step.order).padStart(2, '0')}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-ink">{step.title}</span>
            <Badge tone={STEP_TONE[step.status]}>{STEP_LABEL[step.status]}</Badge>
            {step.href ? (
              <Link href={step.href} className="text-2xs text-accent hover:underline focus-ring rounded">
                Open
              </Link>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-2">{step.question}</p>

          {body ? (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="mt-1 inline-flex items-center gap-1 text-2xs text-ink-3 hover:text-ink-2 focus-ring rounded"
            >
              <Icon.Chevron size={10} className={cx('transition', open ? '' : '-rotate-90')} />
              {open ? 'Hide' : `${step.offered.length} offer${step.offered.length === 1 ? '' : 's'}${step.findings.length ? `, ${step.findings.length} check${step.findings.length === 1 ? '' : 's'}` : ''}`}
            </button>
          ) : null}

          {open && step.offered.length ? (
            <table className="mt-1.5 w-full text-2xs">
              <tbody>
                {step.offered.map((o) => (
                  <tr key={o.label} className="align-baseline">
                    <td className="py-0.5 pr-3 text-ink-3">{o.label}</td>
                    <td className="num py-0.5 pr-3 text-right font-medium text-ink">{o.value}</td>
                    <td className="py-0.5 text-ink-4">{o.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          {open && step.findings.length ? (
            <div className="mt-1.5 space-y-1.5">
              {step.findings.map((f) => (
                <div key={f.id} className="flex items-start gap-2">
                  <Badge tone={SEVERITY_TONE[f.severity]} className="mt-0.5 shrink-0">{SEVERITY_LABEL[f.severity]}</Badge>
                  <p className="text-2xs leading-relaxed text-ink-2">
                    <span className="font-medium text-ink">{f.title}.</span> {f.detail}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** A source is a link when it points at a screen, and a label when it names one. */
function SourceChip({ source }: { source: string }) {
  const href = source.startsWith('/') ? source.split(' — ')[0] : null;
  const chip = (
    <span className="inline-flex items-center gap-1 rounded border border-line px-1.5 py-0.5 text-2xs text-ink-4">
      <Icon.Research size={9} />
      {source}
    </span>
  );
  return href ? (
    <Tooltip content="Open where this can be checked">
      <Link href={href} className="focus-ring rounded hover:text-ink-2">{chip}</Link>
    </Tooltip>
  ) : chip;
}
