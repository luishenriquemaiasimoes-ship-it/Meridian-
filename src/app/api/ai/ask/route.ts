import { z } from 'zod';
import { parseBody, route } from '@/server/http';
import { ask } from '@/server/services/ai';
import { recordAudit } from '@/server/services/audit';

const schema = z.object({
  question: z.string().min(2, 'Ask a question.').max(1000),
  scope: z.object({
    type: z.enum(['COMPANY', 'PORTFOLIO', 'DCF', 'SCREEN', 'GLOBAL']),
    id: z.string().nullable().optional(),
    label: z.string().nullable().optional(),
  }),
  conversationId: z.string().nullable().optional(),
});

export const POST = route(async (ctx, req) => {
  const body = await parseBody(req, schema);
  const result = await ask({
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    question: body.question,
    scope: body.scope,
    conversationId: body.conversationId ?? null,
  });

  await recordAudit({
    workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
    action: 'AI_QUERY', entityType: 'AiConversation', entityId: result.conversationId,
    entityLabel: body.scope.label ?? body.scope.type,
    summary: `AI analyst asked: "${body.question.slice(0, 160)}"`,
  });

  return { answer: result.answer, conversationId: result.conversationId };
}, 'ai:query');
