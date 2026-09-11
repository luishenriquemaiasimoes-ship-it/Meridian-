import { notFound } from 'next/navigation';
import Link from 'next/link';
import { requireContext } from '@/server/context';
import { getCompanyDossier } from '@/server/services/company';
import { prisma } from '@/lib/db';
import { evaluateThesisHealth } from '@/server/services/alerts';
import { Badge, Panel } from '@/components/ui/primitives';
import { Delta, Num, RecommendationBadge, ConvictionBadge, SimulatedBadge, ThesisVerdictBadge } from '@/components/ui/values';
import { CompanyTabs } from './company-tabs';
import { formatDate } from '@/lib/finance/format';
import type { Currency } from '@/lib/finance/types';

export default async function CompanyLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const ctx = await requireContext();
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) notFound();

  const m = dossier.metrics;
  const currency = dossier.company.currency as Currency;

  const [thesis, health, position] = await Promise.all([
    prisma.investmentThesis.findFirst({
      where: { workspaceId: ctx.workspaceId, companyId: dossier.company.id },
    }),
    evaluateThesisHealth(ctx.workspaceId),
    prisma.portfolioPosition.findFirst({
      where: { companyId: dossier.company.id, portfolio: { workspaceId: ctx.workspaceId } },
      include: { portfolio: true },
    }),
  ]);
  const thesisHealth = health.find((h) => h.ticker === dossier.company.ticker) ?? null;

  return (
    <>
      <header className="mb-4">
        <div className="mb-2 flex items-center gap-2 text-xs text-ink-3">
          <Link href="/companies" className="hover:text-ink">Companies</Link>
          <span className="text-ink-4">/</span>
          <span className="text-ink">{dossier.company.ticker}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-ink">{dossier.company.name}</h1>
              <span className="num text-md text-ink-3">{dossier.company.ticker}</span>
              <Badge tone="outline">{dossier.company.exchange}</Badge>
              {m.dataQuality.isSimulated ? <SimulatedBadge source={m.dataQuality.source} /> : null}
            </div>
            <p className="mt-1 text-xs text-ink-3">
              {dossier.company.sector} · {dossier.company.industry} · {dossier.company.country}
              {dossier.company.employees ? ` · ${dossier.company.employees.toLocaleString('pt-BR')} employees` : ''}
              {' · '}{dossier.company.accountingStandard.replace('_', ' ')}
              {' · reporting in '}{dossier.company.currency}
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
            <div>
              <div className="label">Price</div>
              <div className="flex items-baseline gap-2">
                <Num value={m.price} format="currency" currency={currency} className="text-xl font-semibold" />
                <Delta value={m.dailyChangePct} showIcon />
              </div>
              <div className="mt-0.5 text-2xs text-ink-4">
                as of {m.priceAsOf ? formatDate(m.priceAsOf) : '—'}
              </div>
            </div>
            <div>
              <div className="label">Market cap</div>
              <Num value={m.marketCap} format="currencyMillions" currency={currency} className="text-md" />
              <div className="mt-0.5 text-2xs text-ink-4">EV <Num value={m.enterpriseValue} format="currencyMillions" currency={currency} className="text-2xs" /></div>
            </div>
            <div>
              <div className="label">Target</div>
              <Num value={thesis?.targetPrice ?? null} format="currency" currency={currency} className="text-md" />
              <div className="mt-0.5"><Delta value={thesisHealth?.upside ?? null} className="text-2xs" /></div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="label">View</div>
              <div className="flex items-center gap-2">
                <RecommendationBadge value={thesis?.recommendation} />
                {thesis ? <ConvictionBadge value={thesis.conviction} /> : null}
              </div>
              {thesisHealth ? <ThesisVerdictBadge verdict={thesisHealth.verdict} /> : null}
            </div>
          </div>
        </div>

        {position ? (
          <Panel className="mt-3 !py-2 !px-3">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
              <span className="label">In portfolio</span>
              <span className="text-ink-2">{position.portfolio.name}</span>
              <span className="text-ink-3">
                {position.quantity.toLocaleString('pt-BR')} shares at an average of{' '}
                <Num value={position.averagePrice} format="currency" currency={currency} className="text-xs" />
              </span>
              <Link href="/portfolio" className="ml-auto text-accent hover:underline">Open portfolio</Link>
            </div>
          </Panel>
        ) : null}
      </header>

      <CompanyTabs ticker={dossier.company.ticker} />

      <div className="mt-4">{children}</div>
    </>
  );
}
