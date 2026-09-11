import type { Metadata } from 'next';
import { requirePageContext } from '@/server/context';
import { getUniverseMetrics } from '@/server/services/metrics';
import { PageHeader } from '@/components/ui/primitives';
import { UniverseTable } from './universe-table';

export const metadata: Metadata = { title: 'Companies' };
export const dynamic = 'force-dynamic';

export default async function CompaniesPage() {
  await requirePageContext();
  const metrics = await getUniverseMetrics();

  const rows = metrics.map((m) => ({
    ticker: m.ticker, name: m.name, sector: m.sector, industry: m.industry, country: m.country,
    currency: m.currency, exchange: m.exchange, price: m.price, dailyChangePct: m.dailyChangePct,
    marketCap: m.marketCap, evEbitda: m.evEbitda, pe: m.pe, fcfYield: m.fcfYield,
    revenueGrowth: m.revenueGrowth, ebitdaMargin: m.ebitdaMargin, roic: m.roic, roe: m.roe,
    netDebtToEbitda: m.netDebtToEbitda, return12m: m.return12m, basisLabel: m.basisLabel,
    bankLike: m.bankLike,
  }));

  const sectors = Array.from(new Set(metrics.map((m) => m.sector))).sort();
  const countries = Array.from(new Set(metrics.map((m) => m.country))).sort();

  return (
    <>
      <PageHeader
        title="Companies"
        subtitle={`${rows.length} companies with full statements, prices and peer groups. Open one to work through its financials, valuation and thesis.`}
      />
      <UniverseTable rows={rows} sectors={sectors} countries={countries} />
    </>
  );
}
