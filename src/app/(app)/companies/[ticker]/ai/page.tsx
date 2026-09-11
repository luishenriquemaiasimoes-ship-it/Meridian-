import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requirePageContext } from '@/server/context';
import { getCompanyDossier } from '@/server/services/company';
import { buildCompanyContext } from '@/server/services/ai';
import { reason } from '@/lib/ai/reasoner';
import { aiProviderInfo } from '@/lib/ai/llm';
import { AiConsole } from '@/components/ai/ai-console';
import { AnswerCard } from '@/components/ai/answer-card';
import { Panel, PanelHeader } from '@/components/ui/primitives';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} — AI analysis` };
}

const STANDING_QUESTIONS = [
  'Is it cheap?',
  'What does the current price already imply?',
  'What happened to the return on capital?',
  'How does it compare with its peers?',
  'What is the biggest risk in the thesis?',
  'Summarise the last result.',
];

export default async function CompanyAiPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const ctx = await requirePageContext();
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) notFound();

  const company = await buildCompanyContext(ctx.workspaceId, dossier.company.ticker);
  const provider = aiProviderInfo();

  // A standing read of the name, computed on the server so the page is useful
  // before the user types anything.
  const context = {
    workspaceName: ctx.workspaceName,
    baseCurrency: ctx.baseCurrency,
    asOf: new Date().toISOString().slice(0, 10),
    company,
    portfolio: null,
    universeSize: 0,
    isDemoData: ctx.isDemo,
  };

  const standing = [
    reason(`Is ${dossier.company.ticker} cheap?`, context),
    reason(`What happened to ${dossier.company.ticker} return on invested capital?`, context),
    reason(`What is the biggest risk in the ${dossier.company.ticker} thesis?`, context),
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
      <div className="space-y-4">
        <Panel>
          <PanelHeader
            title="Standing analysis"
            subtitle={`Computed from this workspace's data for ${dossier.company.ticker}. Every statement is labelled by what kind of claim it is.`}
          />
        </Panel>
        {standing.map((answer, i) => (
          <AnswerCard key={i} answer={answer} />
        ))}
      </div>

      <div className="xl:sticky xl:top-[62px] xl:self-start">
        <AiConsole
          scope={{ type: 'COMPANY', id: dossier.company.ticker, label: dossier.company.name }}
          suggestions={STANDING_QUESTIONS.map((q) => `${q.replace('it', dossier.company.ticker)}`)}
          providerLabel={provider.label}
          usingModel={provider.usingModel}
          height="calc(100vh - 220px)"
        />
      </div>
    </div>
  );
}
