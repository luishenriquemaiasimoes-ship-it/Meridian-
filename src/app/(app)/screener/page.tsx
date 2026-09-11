import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { getUniverseMetrics } from '@/server/services/metrics';
import { SCREEN_METRIC_LIST, THEMES } from '@/server/services/screener';
import { prisma, parseJson } from '@/lib/db';
import { PageHeader } from '@/components/ui/primitives';
import { ScreenerWorkbench } from './screener-workbench';

export const metadata: Metadata = { title: 'Screener' };
export const dynamic = 'force-dynamic';

export default async function ScreenerPage({ searchParams }: { searchParams: Promise<{ screen?: string }> }) {
  const ctx = await requireContext();
  const { screen } = await searchParams;

  const [metrics, screens] = await Promise.all([
    getUniverseMetrics(),
    prisma.savedScreen.findMany({ where: { workspaceId: ctx.workspaceId }, orderBy: { updatedAt: 'desc' } }),
  ]);

  return (
    <>
      <PageHeader
        title="Screener"
        subtitle="Narrow the universe to the names that deserve work next. A company missing the datum a filter tests is excluded and counted separately, never treated as a pass."
      />
      <ScreenerWorkbench
        metricDefinitions={SCREEN_METRIC_LIST.map((m) => ({ key: m.key, label: m.label, format: m.format, group: m.group }))}
        sectors={Array.from(new Set(metrics.map((m) => m.sector))).sort()}
        countries={Array.from(new Set(metrics.map((m) => m.country))).sort()}
        themes={THEMES}
        universeSize={metrics.length}
        savedScreens={screens.map((s) => ({
          id: s.id, name: s.name, sortBy: s.sortBy,
          filters: parseJson<{ metric: string; comparator: string; value: number }[]>(s.filters, []),
        }))}
        initialScreenId={screen ?? null}
        canSave={ctx.can('screen:write')}
      />
    </>
  );
}
