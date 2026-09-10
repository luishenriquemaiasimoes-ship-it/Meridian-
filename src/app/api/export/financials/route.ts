import { NextResponse } from 'next/server';
import { requireContext } from '@/server/context';
import { handleError, searchParams } from '@/server/http';
import { getCompanyDossier } from '@/server/services/company';
import { buildFinancialsWorkbook } from '@/server/services/export';
import { recordAudit } from '@/server/services/audit';
import type { Currency } from '@/lib/finance/types';

export async function GET(req: Request) {
  try {
    const ctx = await requireContext();
    const ticker = searchParams(req).get('ticker');
    if (!ticker) return NextResponse.json({ error: 'A ticker is required.' }, { status: 400 });

    const dossier = await getCompanyDossier(ticker);
    if (!dossier) return NextResponse.json({ error: 'Company not found.' }, { status: 404 });

    const buffer = await buildFinancialsWorkbook({
      ticker: dossier.company.ticker,
      companyName: dossier.company.name,
      currency: dossier.company.currency as Currency,
      unit: dossier.company.reportingUnit,
      annuals: dossier.annuals,
      quarters: dossier.quarters,
      ltm: dossier.ltm,
    });

    await recordAudit({
      workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
      action: 'EXPORT', entityType: 'FinancialStatement', entityLabel: dossier.company.ticker,
      summary: `Financial statements for ${dossier.company.ticker} exported to Excel.`,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${dossier.company.ticker}-financials.xlsx"`,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
