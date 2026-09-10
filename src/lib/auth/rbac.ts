/**
 * Role-based access control.
 *
 * Roles are ordered; a role inherits every permission of the roles beneath it,
 * plus the permissions listed against it. Every mutating API route resolves a
 * permission through `can()` before touching the database.
 */

export const ROLES = ['VIEWER', 'RESEARCHER', 'ANALYST', 'PORTFOLIO_MANAGER', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  PORTFOLIO_MANAGER: 'Portfolio Manager',
  ANALYST: 'Analyst',
  RESEARCHER: 'Researcher',
  VIEWER: 'Viewer',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN: 'Full control of the organization, members, workspaces and data sources.',
  PORTFOLIO_MANAGER: 'Everything an analyst can do, plus portfolios, rebalancing and committee decisions.',
  ANALYST: 'Builds valuations, theses, notes, memos, screens, watchlists and alerts.',
  RESEARCHER: 'Writes research notes and comments; cannot change valuations or theses.',
  VIEWER: 'Read-only access to the workspace.',
};

export const PERMISSIONS = [
  'workspace:read',
  'research:read',
  'research:write',
  'thesis:write',
  'valuation:write',
  'note:write',
  'memo:write',
  'screen:write',
  'watchlist:write',
  'alert:write',
  'document:upload',
  'ai:query',
  'portfolio:read',
  'portfolio:write',
  'portfolio:rebalance',
  'committee:vote',
  'committee:decide',
  'export:data',
  'org:manage',
  'member:manage',
  'workspace:manage',
  'datasource:manage',
  'audit:read',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const GRANTS: Record<Role, Permission[]> = {
  VIEWER: ['workspace:read', 'research:read', 'portfolio:read', 'export:data'],
  RESEARCHER: ['note:write', 'ai:query', 'document:upload', 'watchlist:write'],
  ANALYST: [
    'research:write', 'thesis:write', 'valuation:write', 'memo:write',
    'screen:write', 'alert:write',
  ],
  PORTFOLIO_MANAGER: ['portfolio:write', 'portfolio:rebalance', 'committee:vote', 'committee:decide', 'audit:read'],
  ADMIN: ['org:manage', 'member:manage', 'workspace:manage', 'datasource:manage'],
};

function inheritedPermissions(role: Role): Set<Permission> {
  const idx = ROLES.indexOf(role);
  const out = new Set<Permission>();
  for (let i = 0; i <= idx; i++) {
    for (const p of GRANTS[ROLES[i]]) out.add(p);
  }
  return out;
}

const CACHE = new Map<Role, Set<Permission>>();

export function permissionsFor(role: Role): Set<Permission> {
  const cached = CACHE.get(role);
  if (cached) return cached;
  const set = inheritedPermissions(role);
  CACHE.set(role, set);
  return set;
}

export function can(role: Role | string | null | undefined, permission: Permission): boolean {
  if (!role || !ROLES.includes(role as Role)) return false;
  return permissionsFor(role as Role).has(permission);
}

export function isRole(value: string | null | undefined): value is Role {
  return !!value && (ROLES as readonly string[]).includes(value);
}

export function assertCan(role: Role | string | null | undefined, permission: Permission): void {
  if (!can(role, permission)) {
    const err = new Error(`Your role does not allow this action (${permission}).`);
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
}
