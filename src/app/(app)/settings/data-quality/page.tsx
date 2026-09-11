import type { Metadata } from 'next';
import Link from 'next/link';
import { requireContext } from '@/server/context';
import { getQualityReport, getStatementChecks } from '@/server/services/quality';
import { getWorkspaceVerificationGaps } from '@/server/services/reconciliation';
import { PageHeader } from '@/components/ui/primitives';
import { QualityWorkbench } from './quality-workbench';

export const metadata: Metadata = { title: 'Data quality' };
export const dynamic = 'force-dynamic';

export default async function DataQualityPage({
  searchParams,
}: { searchParams: Promise<{ ticker?: string }> }) {
  const ctx = await requireContext();
  const { ticker } = await searchParams;

  const [report, checks, models] = await Promise.all([
    getQualityReport(ctx.workspaceId),
    ticker ? getStatementChecks(ticker) : Promise.resolve(null),
    getWorkspaceVerificationGaps(ctx.workspaceId),
  ]);

  return (
    <>
      <PageHeader
        title="Data quality"
        subtitle="What the platform knows about how trustworthy its own inputs are. A weak datum is named, not hidden — which company, which field, how old, and what to do about it."
        breadcrumb={
          <span className="flex items-center gap-1.5">
            <Link href="/settings" className="hover:text-accent">Settings</Link>
            <span className="text-ink-4">/</span>
            <Link href="/settings/data-sources" className="hover:text-accent">Data sources</Link>
          </span>
        }
      />
      <QualityWorkbench
        report={report}
        selectedTicker={ticker ?? null}
        statementChecks={checks}
        models={models}
      />
    </>
  );
}
