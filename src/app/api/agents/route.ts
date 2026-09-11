import { z } from 'zod';
import { parseBody, route } from '@/server/http';
import { runDcfBuildAgent, runModelAudit, runQaPrepAgent, runThesisMonitor } from '@/server/services/agents';
import { recordAudit } from '@/server/services/audit';
import type { AgentReport } from '@/lib/ai/agents';

const schema = z.object({
  agent: z.enum(['DCF_BUILD', 'MODEL_AUDIT', 'QA_PREP', 'THESIS_MONITOR']),
  ticker: z.string().max(12).nullable().optional(),
  modelId: z.string().max(60).nullable().optional(),
});

function needsTicker(agent: string, ticker: string | null | undefined): string {
  if (!ticker) {
    const err = new Error(`${agent} runs on one company. Pick a ticker first.`) as Error & { status?: number };
    err.status = 400;
    throw err;
  }
  return ticker.toUpperCase();
}

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);

  let result: AgentReport | null;
  switch (body.agent) {
    case 'DCF_BUILD':
      result = await runDcfBuildAgent(ctx.workspaceId, needsTicker('The DCF build agent', body.ticker), body.modelId ?? null);
      break;
    case 'MODEL_AUDIT':
      result = await runModelAudit(ctx.workspaceId, needsTicker('The model audit agent', body.ticker), body.modelId ?? null);
      break;
    case 'QA_PREP':
      result = await runQaPrepAgent(ctx.workspaceId, needsTicker('The Q&A prep agent', body.ticker));
      break;
    case 'THESIS_MONITOR':
      result = await runThesisMonitor(ctx.workspaceId);
      break;
  }

  if (!result) {
    const err = new Error('Nothing to run against. The company is not in coverage, or it has no model yet.') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'AI_QUERY', entityType: 'AiAgentRun', entityId: null, entityLabel: result.subject,
    summary: `${body.agent} ran on ${result.subjectLabel}: ${result.headline} (${result.counts.FAIL} fail, ${result.counts.WARNING} warning, ${result.counts.PASS} pass).`,
  });

  return { report: result };
}, 'ai:query');
