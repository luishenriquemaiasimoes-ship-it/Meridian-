import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requirePageContext } from '@/server/context';
import { getCompanyDossier } from '@/server/services/company';
import { getEarningsDetail } from '@/server/services/earnings';
import { prisma } from '@/lib/db';
import { EarningsWorkbench } from './earnings-workbench';
import type { Currency } from '@/lib/finance/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} — Earnings` };
}

export default async function CompanyEarningsPage({
  params, searchParams,
}: { params: Promise<{ ticker: string }>; searchParams: Promise<{ id?: string }> }) {
  const { ticker } = await params;
  const { id } = await searchParams;
  const ctx = await requirePageContext();
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) notFound();

  const events = dossier.earnings;
  const selectedId = id && events.some((e) => e.id === id) ? id : events[0]?.id;
  const detail = selectedId ? await getEarningsDetail(ctx.workspaceId, selectedId) : null;

  const documents = await prisma.document.findMany({
    where: { workspaceId: ctx.workspaceId, companyId: dossier.company.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <EarningsWorkbench
      ticker={dossier.company.ticker}
      companyId={dossier.company.id}
      currency={dossier.company.currency as Currency}
      events={events.map((e) => ({
        id: e.id, label: e.label, reportDate: e.reportDate, status: e.status,
        revenue: e.revenue, ebitda: e.ebitda, eps: e.eps,
      }))}
      selectedId={selectedId ?? null}
      detail={detail}
      canWrite={ctx.can('research:write')}
      documents={documents.map((d) => ({
        id: d.id, name: d.name, kind: d.kind, sizeBytes: d.sizeBytes,
        createdAt: d.createdAt.toISOString(), uploadedBy: d.uploadedBy,
      }))}
    />
  );
}
