import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { listValuationModels } from '@/server/services/valuation';
import { getMetricsMap } from '@/server/services/metrics';
import { prisma } from '@/lib/db';
import { PageHeader } from '@/components/ui/primitives';
import { ValuationWorkbench } from './valuation-workbench';
import { isNum } from '@/lib/finance/core';
import type { Currency } from '@/lib/finance/types';

export const metadata: Metadata = { title: 'Valuation' };
export const dynamic = 'force-dynamic';

function num(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

export default async function ValuationPage() {
  const ctx = await requireContext();

  const [models, metrics, theses] = await Promise.all([
    listValuationModels(ctx.workspaceId),
    getMetricsMap(),
    prisma.investmentThesis.findMany({
      where: { workspaceId: ctx.workspaceId },
      include: { company: true },
    }),
  ]);

  const targetByTicker = new Map(
    theses.filter((t) => t.targetPrice !== null).map((t) => [t.company.ticker, t.targetPrice as number]),
  );

  const rows = models.map((m) => {
    const o = m.outputs ?? {};
    const metric = metrics.get(m.companyTicker);
    const price = metric?.price ?? null;
    const fairValue = num(o.fairValuePerShare) ?? num(o.valuePerShare);
    return {
      id: m.id,
      ticker: m.companyTicker,
      companyName: m.companyName,
      currency: (metric?.currency ?? 'BRL') as Currency,
      name: m.name,
      kind: m.kind,
      status: m.status,
      authorName: m.authorName,
      notes: m.notes,
      updatedAt: m.updatedAt,
      computedAt: typeof o.computedAt === 'string' ? o.computedAt : null,
      price,
      fairValue,
      upside: isNum(fairValue) && isNum(price) && (price as number) > 0
        ? (fairValue as number) / (price as number) - 1
        : null,
      expectedValue: num(o.expectedValue),
      enterpriseValue: num(o.enterpriseValue),
      equityValue: num(o.equityValue),
      wacc: num(o.wacc),
      terminalGrowth: num(o.terminalGrowth),
      thesisTarget: targetByTicker.get(m.companyTicker) ?? null,
      marketCap: metric?.marketCap ?? null,
      evEbitda: metric?.evEbitda ?? null,
      pe: metric?.pe ?? null,
      bankLike: metric?.bankLike ?? false,
    };
  });

  const covered = new Set(rows.map((r) => r.ticker));
  const uncovered = Array.from(metrics.values())
    .filter((m) => !covered.has(m.ticker))
    .map((m) => ({ ticker: m.ticker, name: m.name, sector: m.sector, price: m.price, currency: m.currency as Currency }));

  return (
    <>
      <PageHeader
        title="Valuation"
        subtitle={`${rows.length} model${rows.length === 1 ? '' : 's'} across ${covered.size} compan${covered.size === 1 ? 'y' : 'ies'}. A model's fair value is the one its last run produced — never a placeholder.`}
      />
      <ValuationWorkbench models={rows} uncovered={uncovered} />
    </>
  );
}
