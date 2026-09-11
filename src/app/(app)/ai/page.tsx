import type { Metadata } from 'next';
import Link from 'next/link';
import { requirePageContext } from '@/server/context';
import { prisma } from '@/lib/db';
import { aiProviderInfo } from '@/lib/ai/llm';
import { AiConsole } from '@/components/ai/ai-console';
import { Badge, InlineNote, PageHeader, Panel, PanelHeader } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { formatDateTime } from '@/lib/finance/format';

export const metadata: Metadata = { title: 'AI Analyst' };
export const dynamic = 'force-dynamic';

const SUGGESTIONS = [
  'How is the portfolio positioned?',
  'What is the biggest risk in the book right now?',
  'Which holding has the weakest thesis?',
  'Is VALE3 cheap?',
  'What does the ITUB4 price already imply?',
  'Compare WEGE3 with its peers.',
];

export default async function AiPage() {
  const ctx = await requirePageContext();
  const provider = aiProviderInfo();

  const [conversations, universeSize] = await Promise.all([
    prisma.aiConversation.findMany({
      where: { workspaceId: ctx.workspaceId },
      orderBy: { updatedAt: 'desc' },
      take: 12,
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 1 }, _count: { select: { messages: true } } },
    }),
    prisma.company.count(),
  ]);

  return (
    <>
      <PageHeader
        title="AI Analyst"
        subtitle="Ask the workspace a question. Every answer is built from the data this workspace holds, and each statement says what kind of claim it is."
        actions={
          <Badge tone={provider.usingModel ? 'pos' : 'neutral'}>
            {provider.label}
          </Badge>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <AiConsole
          scope={{ type: 'GLOBAL', id: null, label: ctx.workspaceName }}
          suggestions={SUGGESTIONS}
          providerLabel={provider.label}
          usingModel={provider.usingModel}
          height="calc(100vh - 230px)"
        />

        <aside className="space-y-3">
          <Panel>
            <PanelHeader title="What it will and will not do" dense />
            <ul className="space-y-2 px-3 pb-3 text-xs leading-relaxed text-ink-2">
              <li className="flex gap-2">
                <Icon.Check size={13} className="mt-0.5 shrink-0 text-pos" />
                <span>Reads the {universeSize} companies, the statements, the models, the theses and the portfolios in this workspace.</span>
              </li>
              <li className="flex gap-2">
                <Icon.Check size={13} className="mt-0.5 shrink-0 text-pos" />
                <span>Labels every statement: observed, calculated, interpreted, opinion, or unavailable.</span>
              </li>
              <li className="flex gap-2">
                <Icon.Check size={13} className="mt-0.5 shrink-0 text-pos" />
                <span>Shows the source of each figure so you can check it on the company screen.</span>
              </li>
              <li className="flex gap-2">
                <Icon.Close size={13} className="mt-0.5 shrink-0 text-neg" />
                <span>Never invents a number. When a datum is missing it says &ldquo;data unavailable&rdquo; instead of estimating.</span>
              </li>
              <li className="flex gap-2">
                <Icon.Close size={13} className="mt-0.5 shrink-0 text-neg" />
                <span>Has no market feed, no news wire and no consensus service. It cannot tell you what happened today.</span>
              </li>
              <li className="flex gap-2">
                <Icon.Close size={13} className="mt-0.5 shrink-0 text-neg" />
                <span>Does not place orders or change a position.</span>
              </li>
            </ul>
          </Panel>

          {!provider.usingModel ? (
            <InlineNote tone="info">
              Running on the deterministic reasoner: answers are produced by the platform&apos;s own calculations rather than
              a language model. Set <code className="text-ink">ANTHROPIC_API_KEY</code> to have a model write the prose on
              top of the same figures — it never replaces them.
            </InlineNote>
          ) : (
            <InlineNote tone="info">
              A language model is writing the prose, but the figures are supplied by the platform and the model is
              constrained to the typed blocks. If it cannot support a statement from the data it is given, the answer falls
              back to the deterministic draft.
            </InlineNote>
          )}

          <Panel>
            <PanelHeader title="Recent conversations" subtitle={`${conversations.length} in this workspace`} dense />
            {conversations.length ? (
              <ul className="divide-y divide-line">
                {conversations.map((c) => (
                  <li key={c.id} className="px-3 py-2">
                    <p className="line-clamp-2 text-xs text-ink-2">
                      {c.messages[0]?.content ?? c.title ?? 'Untitled conversation'}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-2xs text-ink-4">
                      <Badge tone="neutral">{(c.contextType ?? 'global').toLowerCase()}</Badge>
                      {c.contextId && c.contextType === 'COMPANY' ? (
                        <Link href={`/companies/${c.contextId}`} className="text-accent hover:underline">{c.contextId}</Link>
                      ) : null}
                      <span>{c._count.messages} messages</span>
                      <span>{formatDateTime(c.updatedAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 pb-3 text-xs text-ink-4">Nothing asked yet in this workspace.</p>
            )}
          </Panel>
        </aside>
      </div>
    </>
  );
}
