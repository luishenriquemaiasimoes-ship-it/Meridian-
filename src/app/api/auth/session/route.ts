import { NextResponse } from 'next/server';
import { getRequestContext } from '@/server/context';
import { permissionsFor } from '@/lib/auth/rbac';

export async function GET() {
  const ctx = await getRequestContext();
  if (!ctx) return NextResponse.json({ authenticated: false }, { status: 200 });
  return NextResponse.json({
    authenticated: true,
    user: { id: ctx.userId, name: ctx.name, email: ctx.email, title: ctx.title, avatarColor: ctx.avatarColor },
    organization: { id: ctx.organizationId, name: ctx.organizationName, plan: ctx.organizationPlan },
    workspace: { id: ctx.workspaceId, name: ctx.workspaceName, kind: ctx.workspaceKind, baseCurrency: ctx.baseCurrency },
    workspaces: ctx.workspaces,
    role: ctx.role,
    permissions: Array.from(permissionsFor(ctx.role)),
  });
}
