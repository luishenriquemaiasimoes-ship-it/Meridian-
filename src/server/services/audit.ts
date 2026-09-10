import { prisma } from '@/lib/db';

export interface AuditEntry {
  workspaceId: string;
  userId?: string | null;
  actorName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'LOGIN' | 'AI_QUERY';
  entityType: string;
  entityId?: string | null;
  entityLabel?: string | null;
  field?: string | null;
  previousValue?: string | null;
  newValue?: string | null;
  summary: string;
}

/**
 * Every change a user makes to a model, thesis, portfolio or target price is
 * recorded here. The audit trail is written on the same request that performs
 * the change so that a mutation can never land without its record.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  await prisma.auditLog.create({
    data: {
      workspaceId: entry.workspaceId,
      userId: entry.userId ?? null,
      actorName: entry.actorName,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      entityLabel: entry.entityLabel ?? null,
      field: entry.field ?? null,
      previousValue: entry.previousValue ?? null,
      newValue: entry.newValue ?? null,
      summary: entry.summary,
    },
  });
}

/** Diffs two objects and writes one audit row per changed field. */
export async function recordFieldChanges(
  base: Omit<AuditEntry, 'field' | 'previousValue' | 'newValue' | 'summary' | 'action'>,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  describe: (field: string, from: unknown, to: unknown) => string,
  fields?: string[],
): Promise<number> {
  const keys = fields ?? Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
  let count = 0;
  for (const key of keys) {
    const from = before[key];
    const to = after[key];
    if (JSON.stringify(from ?? null) === JSON.stringify(to ?? null)) continue;
    await recordAudit({
      ...base,
      action: 'UPDATE',
      field: key,
      previousValue: from === null || from === undefined ? null : String(typeof from === 'object' ? JSON.stringify(from) : from),
      newValue: to === null || to === undefined ? null : String(typeof to === 'object' ? JSON.stringify(to) : to),
      summary: describe(key, from, to),
    });
    count++;
  }
  return count;
}

export async function listAudit(workspaceId: string, limit = 100, entityType?: string) {
  const rows = await prisma.auditLog.findMany({
    where: { workspaceId, ...(entityType ? { entityType } : {}) },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return rows.map((r) => ({
    id: r.id, actorName: r.actorName, action: r.action, entityType: r.entityType,
    entityLabel: r.entityLabel, field: r.field, previousValue: r.previousValue,
    newValue: r.newValue, summary: r.summary, createdAt: r.createdAt.toISOString(),
  }));
}
