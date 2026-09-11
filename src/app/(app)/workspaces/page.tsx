import type { Metadata } from 'next';
import { requirePageContext } from '@/server/context';
import { prisma } from '@/lib/db';
import { PageHeader } from '@/components/ui/primitives';
import { WorkspacesWorkbench } from './workspaces-workbench';

export const metadata: Metadata = { title: 'Workspaces' };
export const dynamic = 'force-dynamic';

export default async function WorkspacesPage() {
  const ctx = await requirePageContext();

  const workspaces = await prisma.workspace.findMany({
    where: { organizationId: ctx.organizationId },
    orderBy: { createdAt: 'asc' },
    include: {
      benchmark: { select: { code: true, name: true } },
      _count: {
        select: {
          theses: true, valuations: true, notes: true, memos: true,
          portfolios: true, watchlists: true, alerts: true, documents: true,
        },
      },
    },
  });

  const benchmarks = await prisma.benchmark.findMany({ select: { code: true, name: true }, orderBy: { code: 'asc' } });

  return (
    <>
      <PageHeader
        title="Workspaces"
        subtitle="A workspace is a book: its own coverage, models, portfolios and cost of capital. Switching changes what every other screen reads."
      />
      <WorkspacesWorkbench
        activeId={ctx.workspaceId}
        canManage={ctx.can('workspace:manage')}
        benchmarks={benchmarks}
        workspaces={workspaces.map((w) => ({
          id: w.id,
          name: w.name,
          slug: w.slug,
          kind: w.kind,
          market: w.market,
          baseCurrency: w.baseCurrency,
          riskFreeRate: w.riskFreeRate,
          equityRiskPremium: w.equityRiskPremium,
          statutoryTaxRate: w.statutoryTaxRate,
          isDemo: w.isDemo,
          benchmarkCode: w.benchmark?.code ?? null,
          benchmarkName: w.benchmark?.name ?? null,
          createdAt: w.createdAt.toISOString(),
          counts: w._count,
        }))}
      />
    </>
  );
}
