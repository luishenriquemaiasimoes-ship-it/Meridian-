import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { COOKIE_OPTIONS, WORKSPACE_COOKIE, sessionExpiry } from '@/lib/auth/session';
import { requireContext } from '@/server/context';
import { handleError, parseBody } from '@/server/http';
import { invalidateAll } from '@/server/cache';

const schema = z.object({ workspaceId: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const ctx = await requireContext();
    const { workspaceId } = await parseBody(req, schema);
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, organizationId: ctx.organizationId },
    });
    if (!workspace) return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });

    invalidateAll();
    const res = NextResponse.json({ ok: true, workspace: { id: workspace.id, name: workspace.name } });
    res.cookies.set(WORKSPACE_COOKIE, workspace.id, { ...COOKIE_OPTIONS, expires: sessionExpiry() });
    return res;
  } catch (e) {
    return handleError(e);
  }
}
