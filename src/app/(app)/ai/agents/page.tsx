import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { getUniverseMetrics } from '@/server/services/metrics';
import { listValuationModels } from '@/server/services/valuation';
import { PageHeader } from '@/components/ui/primitives';
import { AgentsWorkbench } from './agents-workbench';

export const metadata: Metadata = { title: 'AI agents' };
export const dynamic = 'force-dynamic';

export default async function AgentsPage({
  searchParams,
}: { searchParams: Promise<{ agent?: string; ticker?: string }> }) {
  const ctx = await requireContext();
  const { agent, ticker } = await searchParams;

  const [universe, models] = await Promise.all([
    getUniverseMetrics(),
    listValuationModels(ctx.workspaceId),
  ]);

  return (
    <>
      <PageHeader
        title="AI agents"
        subtitle="Four procedures over this workspace. Each reads only what the workspace holds, says what kind of claim every statement is, and names the screen you can check it on."
      />
      <AgentsWorkbench
        companies={universe.map((m) => ({ ticker: m.ticker, name: m.name, sector: m.sector }))}
        models={models.filter((m) => m.kind === 'DCF').map((m) => ({
          id: m.id, name: m.name, ticker: m.companyTicker, status: m.status,
        }))}
        initialAgent={agent ?? null}
        initialTicker={ticker ?? null}
      />
    </>
  );
}
