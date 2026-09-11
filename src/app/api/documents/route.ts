import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireContext } from '@/server/context';
import { handleError, route, searchParams } from '@/server/http';
import { assertCan } from '@/lib/auth/rbac';
import { documentKindFromName, processUpload } from '@/server/services/documents';
import { recordAudit } from '@/server/services/audit';

const MAX_BYTES = 12 * 1024 * 1024;

export const GET = route(async (ctx, req) => {
  const companyId = searchParams(req).get('companyId') ?? undefined;
  const q = searchParams(req).get('q')?.toLowerCase() ?? '';
  const rows = await prisma.document.findMany({
    where: { workspaceId: ctx.workspaceId, ...(companyId ? { companyId } : {}) },
    orderBy: { createdAt: 'desc' },
    include: { company: true },
    take: 200,
  });
  const filtered = q
    ? rows.filter((d) => `${d.name} ${d.content ?? ''}`.toLowerCase().includes(q))
    : rows;
  return {
    documents: filtered.map((d) => ({
      id: d.id, name: d.name, kind: d.kind, mimeType: d.mimeType, sizeBytes: d.sizeBytes,
      ticker: d.company?.ticker ?? null, uploadedBy: d.uploadedBy,
      createdAt: d.createdAt.toISOString(),
      excerpt: (d.content ?? '').slice(0, 220),
    })),
  };
});

export async function POST(req: Request) {
  try {
    const ctx = await requireContext();
    assertCan(ctx.role, 'document:upload');

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'No file was received.' }, { status: 400 });
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'The file is larger than 12 MB.' }, { status: 413 });
    }

    const companyId = (form.get('companyId') as string | null) || null;
    const kind = (form.get('kind') as string | null) || documentKindFromName(file.name);

    const buffer = Buffer.from(await file.arrayBuffer());
    const processed = await processUpload(file.name, file.type, buffer);

    const document = await prisma.document.create({
      data: {
        workspaceId: ctx.workspaceId,
        companyId,
        name: file.name,
        kind,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        // Only the extracted text is retained; the binary is not stored.
        content: processed.text.slice(0, 400_000) || null,
        extraction: JSON.stringify({
          method: processed.method,
          warning: processed.warning,
          ...processed.extraction,
        }),
        tags: JSON.stringify([kind]),
        uploadedBy: ctx.name,
      },
    });

    await recordAudit({
      workspaceId: ctx.workspaceId, userId: ctx.userId, actorName: ctx.name,
      action: 'CREATE', entityType: 'Document', entityId: document.id, entityLabel: file.name,
      summary: `Document ${file.name} uploaded (${(file.size / 1024).toFixed(0)} KB); ${processed.extraction.metrics.length} figures located.`,
    });

    return NextResponse.json({
      document: { id: document.id, name: document.name },
      extracted: processed.extraction.metrics.length,
      warning: processed.warning,
      metrics: processed.extraction.metrics,
    });
  } catch (e) {
    return handleError(e);
  }
}
