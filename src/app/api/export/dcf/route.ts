import { NextResponse } from 'next/server';
import { requireContext } from '@/server/context';
import { handleError, searchParams } from '@/server/http';
import { getCompanyDossier } from '@/server/services/company';
import { defaultAssumptionsFor } from '@/server/services/valuation';
import { buildDcfWorkbook } from '@/server/services/export';
import { calculateDcf, normalizeAssumptions } from '@/lib/finance/dcf';
import { recordAudit } from '@/server/services/audit';
import type { Currency } from '@/lib/finance/types';

export async function GET(req: Request) {
  try {
    const ctx = await requireContext();
    const params = searchParams(req);
    const ticker = params.get('ticker');
    if (!ticker) return NextResponse.json({ error: 'A ticker is required.' }, { status: 400 });

    const dossier = await getCompanyDossier(ticker);
    if (!dossier) return NextResponse.json({ error: 'Company not found.' }, { status: 404 });

    const raw = params.get('assumptions');
    let assumptions = raw ? JSON.parse(raw) : null;
    if (!assumptions) assumptions = await defaultAssumptionsFor(ticker);
    const result = calculateDcf(normalizeAssumptions(assumptions ?? {}));

    const buffer = await buildDcfWorkbook({
      ticker: dossier.company.ticker,
      companyName: dossier.company.name,
      currency: dossier.company.currency as Currency,
      modelName: `DCF ${new Date().getFullYear()}`,
      result,
    });

    await recordAudit({
      workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
      action: 'EXPORT', entityType: 'ValuationModel', entityLabel: dossier.company.ticker,
      summary: `DCF model for ${dossier.company.ticker} exported to Excel with live formulas.`,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${dossier.company.ticker}-dcf.xlsx"`,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
