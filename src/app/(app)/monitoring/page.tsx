import type { Metadata } from 'next';
import { requireContext } from '@/server/context';
import { prisma } from '@/lib/db';
import { ALERT_METRICS, evaluateAlerts, evaluateThesisHealth } from '@/server/services/alerts';
import { PageHeader } from '@/components/ui/primitives';
import { MonitoringWorkbench } from './monitoring-workbench';

export const metadata: Metadata = { title: 'Monitoring' };
export const dynamic = 'force-dynamic';

export default async function MonitoringPage({
  searchParams,
}: { searchParams: Promise<{ tab?: string }> }) {
  const ctx = await requireContext();
  const { tab } = await searchParams;

  const [alerts, health, events, notifications, companies] = await Promise.all([
    evaluateAlerts(ctx.workspaceId),
    evaluateThesisHealth(ctx.workspaceId),
    prisma.alertEvent.findMany({
      where: { alert: { workspaceId: ctx.workspaceId } },
      orderBy: { createdAt: 'desc' }, take: 60,
      include: { alert: { include: { company: true } } },
    }),
    prisma.notification.findMany({
      where: { workspaceId: ctx.workspaceId },
      orderBy: { createdAt: 'desc' }, take: 40,
    }),
    prisma.company.findMany({ select: { ticker: true, name: true }, orderBy: { ticker: 'asc' } }),
  ]);

  const triggered = alerts.filter((a) => a.isTriggered).length;
  const broken = health.filter((h) => h.verdict === 'BROKEN' || h.verdict === 'WEAKENING').length;

  return (
    <>
      <PageHeader
        title="Monitoring"
        subtitle={
          triggered || broken
            ? `${triggered} alert${triggered === 1 ? '' : 's'} triggered and ${broken} thesis${broken === 1 ? '' : 'es'} showing strain.`
            : 'Which theses are breaking? Nothing is triggered right now.'
        }
      />
      <MonitoringWorkbench
        initialTab={tab ?? 'alerts'}
        canWrite={ctx.can('alert:write')}
        alerts={alerts}
        health={health}
        metrics={Object.entries(ALERT_METRICS).map(([key, def]) => ({
          key, label: def.label, category: def.category, format: def.format,
        }))}
        companies={companies}
        events={events.map((e) => ({
          id: e.id,
          alertName: e.alert.name,
          ticker: e.alert.company?.ticker ?? null,
          severity: e.alert.severity,
          value: e.value,
          message: e.message,
          createdAt: e.createdAt.toISOString(),
        }))}
        notifications={notifications.map((n) => ({
          id: n.id, severity: n.severity, category: n.category, title: n.title,
          body: n.body, ticker: n.ticker, href: n.href,
          readAt: n.readAt?.toISOString() ?? null, createdAt: n.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
