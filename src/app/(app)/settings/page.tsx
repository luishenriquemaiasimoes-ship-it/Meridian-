import type { Metadata } from 'next';
import Link from 'next/link';
import { requireContext } from '@/server/context';
import { prisma } from '@/lib/db';
import { PageHeader, Panel, PanelHeader, Badge, InlineNote } from '@/components/ui/primitives';
import { Icon, type IconName } from '@/components/ui/icons';
import { StatRow } from '@/components/ui/values';
import { formatPercent } from '@/lib/finance/format';

export const metadata: Metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

const SECTIONS: { href: string; icon: IconName; title: string; description: string }[] = [
  { href: '/settings/data-sources', icon: 'Database', title: 'Data sources', description: 'Where every figure comes from, when it last refreshed, and what is simulated.' },
  { href: '/settings/data-quality', icon: 'Scale', title: 'Data quality', description: 'Where the inputs are weak, which company, which field, and what it means for the numbers.' },
  { href: '/settings/profile', icon: 'User', title: 'Profile', description: 'Your name, title, theme and password.' },
  { href: '/settings/organization', icon: 'Org', title: 'Organization', description: 'Members, roles and what each role may do.' },
  { href: '/workspaces', icon: 'Workspace', title: 'Workspaces', description: 'Books, their benchmarks and their cost of capital.' },
  { href: '/audit', icon: 'Book', title: 'Audit trail', description: 'Every change made in this workspace, by whom and when.' },
];

export default async function SettingsPage() {
  const ctx = await requireContext();

  const [workspace, sources, members] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: ctx.workspaceId },
      include: { benchmark: { select: { code: true } }, organization: true },
    }),
    prisma.dataSource.findMany({ where: { workspaceId: ctx.workspaceId } }),
    prisma.membership.count({ where: { organizationId: ctx.organizationId } }),
  ]);

  const degraded = sources.filter((s) => s.status !== 'CONNECTED').length;

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle={`${workspace?.organization.name ?? 'Organisation'} · working in ${ctx.workspaceName} as ${ctx.role.replace('_', ' ').toLowerCase()}.`}
      />

      {ctx.isDemo ? (
        <InlineNote tone="warn">
          This workspace is marked as demo data. Every price, statement and estimate in it is produced by
          MockMarketDataProvider — it is internally consistent and useful for exercising the platform, but it is not
          market data and must not be treated as such.
        </InlineNote>
      ) : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-3 sm:grid-cols-2">
          {SECTIONS.map((s) => {
            const IconComponent = Icon[s.icon];
            return (
              <Link
                key={s.href}
                href={s.href}
                className="panel flex gap-3 px-3 py-3 transition hover:border-line-strong"
              >
                <span className="mt-0.5 shrink-0 text-ink-3"><IconComponent size={16} /></span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{s.title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-3">{s.description}</span>
                </span>
              </Link>
            );
          })}
        </div>

        <Panel>
          <PanelHeader title="This workspace" dense />
          <div className="px-3 pb-3 divide-y divide-line">
            <StatRow label="Name" value={<span className="text-xs text-ink-2">{ctx.workspaceName}</span>} />
            <StatRow label="Base currency" value={<span className="text-xs text-ink-2">{ctx.baseCurrency}</span>} />
            <StatRow label="Benchmark" value={<span className="text-xs text-ink-2">{workspace?.benchmark?.code ?? 'Not set'}</span>} />
            <StatRow label="Risk-free rate" value={<span className="num text-xs text-ink-2">{formatPercent(workspace?.riskFreeRate ?? null, 2)}</span>} />
            <StatRow label="Equity risk premium" value={<span className="num text-xs text-ink-2">{formatPercent(workspace?.equityRiskPremium ?? null, 2)}</span>} />
            <StatRow label="Statutory tax rate" value={<span className="num text-xs text-ink-2">{formatPercent(workspace?.statutoryTaxRate ?? null, 1)}</span>} />
            <StatRow label="Members" value={<span className="num text-xs text-ink-2">{members}</span>} />
            <StatRow
              label="Data sources"
              value={
                degraded
                  ? <Badge tone="warn">{degraded} of {sources.length} degraded</Badge>
                  : <Badge tone="pos">{sources.length} connected</Badge>
              }
            />
          </div>
        </Panel>
      </div>
    </>
  );
}
