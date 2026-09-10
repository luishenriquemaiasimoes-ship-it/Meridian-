import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { SESSION_COOKIE, WORKSPACE_COOKIE, verifySession } from '@/lib/auth/session';
import { can, isRole, type Permission, type Role } from '@/lib/auth/rbac';

export interface RequestContext {
  userId: string;
  email: string;
  name: string;
  title: string | null;
  avatarColor: string;
  theme: string;
  organizationId: string;
  organizationName: string;
  organizationPlan: string;
  role: Role;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  workspaceKind: string;
  baseCurrency: string;
  market: string;
  riskFreeRate: number;
  equityRiskPremium: number;
  statutoryTaxRate: number;
  isDemo: boolean;
  workspaces: { id: string; name: string; slug: string; kind: string; baseCurrency: string }[];
  can: (permission: Permission) => boolean;
}

/**
 * Resolves the signed-in user, their organization role and the active
 * workspace. Every server component and API route funnels through this, which
 * is what makes workspace isolation a property of the system rather than a
 * convention each query has to remember.
 */
export async function getRequestContext(): Promise<RequestContext | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const claims = await verifySession(token);
  if (!claims) return null;

  const session = await prisma.session.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date()) return null;

  const user = await prisma.user.findUnique({
    where: { id: claims.userId },
    include: { memberships: { include: { organization: true } } },
  });
  if (!user) return null;

  const membership =
    user.memberships.find((m) => m.organizationId === claims.organizationId) ?? user.memberships[0];
  if (!membership) return null;

  const workspaces = await prisma.workspace.findMany({
    where: { organizationId: membership.organizationId },
    orderBy: { createdAt: 'asc' },
  });
  if (!workspaces.length) return null;

  const requested = jar.get(WORKSPACE_COOKIE)?.value;
  const workspace = workspaces.find((w) => w.id === requested) ?? workspaces[0];
  const role: Role = isRole(membership.role) ? membership.role : 'VIEWER';

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    title: user.title,
    avatarColor: user.avatarColor,
    theme: user.theme,
    organizationId: membership.organizationId,
    organizationName: membership.organization.name,
    organizationPlan: membership.organization.plan,
    role,
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    workspaceSlug: workspace.slug,
    workspaceKind: workspace.kind,
    baseCurrency: workspace.baseCurrency,
    market: workspace.market,
    riskFreeRate: workspace.riskFreeRate,
    equityRiskPremium: workspace.equityRiskPremium,
    statutoryTaxRate: workspace.statutoryTaxRate,
    isDemo: workspace.isDemo,
    workspaces: workspaces.map((w) => ({
      id: w.id, name: w.name, slug: w.slug, kind: w.kind, baseCurrency: w.baseCurrency,
    })),
    can: (permission: Permission) => can(role, permission),
  };
}

export async function requireContext(): Promise<RequestContext> {
  const ctx = await getRequestContext();
  if (!ctx) {
    const err = new Error('Not authenticated') as Error & { status?: number };
    err.status = 401;
    throw err;
  }
  return ctx;
}
