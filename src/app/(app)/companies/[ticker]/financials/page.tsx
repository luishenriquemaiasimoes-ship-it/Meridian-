import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { getCompanyDossier, getNormalizationAdjustments } from '@/server/services/company';
import { FinancialsWorkbench } from './financials-workbench';
import type { Currency } from '@/lib/finance/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} — Financial statements` };
}

export default async function FinancialsPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const ctx = await requireContext();
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) notFound();

  const adjustments = await getNormalizationAdjustments(ctx.workspaceId, dossier.company.id);

  return (
    <FinancialsWorkbench
      ticker={dossier.company.ticker}
      companyId={dossier.company.id}
      currency={dossier.company.currency as Currency}
      unit={dossier.company.reportingUnit}
      standard={dossier.company.accountingStandard}
      annuals={dossier.annuals}
      quarters={dossier.quarters}
      ltm={dossier.ltm}
      adjustments={adjustments}
      canEdit={ctx.can('valuation:write')}
      statutoryTaxRate={ctx.statutoryTaxRate}
    />
  );
}
