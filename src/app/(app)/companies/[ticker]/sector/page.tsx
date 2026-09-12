import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requirePageContext } from '@/server/context';
import { getCompanyDossier } from '@/server/services/company';
import { EmptyState, Grid, Panel, PanelHeader, SectionLabel } from '@/components/ui/primitives';
import { findSectorDossier } from '@/lib/research/qualitative/sectors';
import {
  BasisChip, Bullets, DirectionBadge, KeyValue, NoteList, SourceFooter,
} from '@/components/research/basis';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} — Sector` };
}

const SCOPE_LABEL = { GLOBAL: 'Global', BRAZIL: 'Brazil', UNITED_STATES: 'United States' } as const;

export default async function SectorPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  await requirePageContext();
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) notFound();

  const c = dossier.company;
  const d = findSectorDossier(c.sector, c.country, c.industry);

  if (!d) {
    return (
      <Panel>
        <PanelHeader title="Sector research" />
        <EmptyState
          title={`No dossier covers ${c.sector} in ${c.country}`}
          description="Sector research is written per sector and geography, because a regulator in one country tells you nothing about another. This combination has not been written yet."
        />
      </Panel>
    );
  }

  return (
    <div className="space-y-3">
      <Panel>
        <PanelHeader
          title={`${d.sector} — ${SCOPE_LABEL[d.scope]}`}
          subtitle={
            d.industries
              ? `Scoped to ${d.industries.join(', ')} — the sector label is broader than the economics.`
              : `The industry ${c.name} competes in, and how it decides who earns what.`
          }
        />
        <p className="text-sm leading-relaxed text-ink">{d.headline}</p>
      </Panel>

      <Panel>
        <PanelHeader
          title="Industry structure"
          subtitle="How the industry is put together, which is what decides who earns what"
          actions={<BasisChip basis={d.structure.basis} />}
        />
        <div className="space-y-4">
          <KeyValue label="Shape">{d.structure.shape}</KeyValue>
          <Grid cols={2} gap={4}>
            <KeyValue label="Pricing power">{d.structure.pricingPower}</KeyValue>
            <KeyValue label="Where the cycle is">{d.structure.cyclePosition}</KeyValue>
          </Grid>
          <Bullets label="What keeps entrants out" items={d.structure.entryBarriers} />
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          title="Sector drivers"
          subtitle="Each one names its transmission mechanism and the measure that tracks it"
        />
        <div className="space-y-4">
          {d.drivers.map((driver) => (
            <div key={driver.key} className="rounded border border-line p-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-ink">{driver.label}</h4>
                <div className="flex shrink-0 items-center gap-1.5">
                  <DirectionBadge direction={driver.direction} />
                  <BasisChip basis={driver.basis} />
                </div>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-2">{driver.mechanism}</p>
              <div className="mt-2 border-t border-line pt-2">
                <SectionLabel className="mb-1">What to watch</SectionLabel>
                <p className="text-xs leading-relaxed text-ink-3">{driver.watch}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Grid cols={2} gap={3}>
        <Panel>
          <PanelHeader title="Regulation" subtitle="The rules that decide outcomes, and who writes them" />
          <NoteList notes={d.regulation} />
        </Panel>
        <Panel>
          <PanelHeader title="Live debates" subtitle="What analysts covering this sector actually argue about" />
          <NoteList notes={d.debates} />
        </Panel>
      </Grid>

      <Panel>
        <PanelHeader
          title="How this sector destroys capital"
          subtitle="Every industry has its own way, and it recurs"
        />
        <NoteList notes={d.failureModes} />
        <SourceFooter asOf={d.asOf} sources={d.sources} />
      </Panel>
    </div>
  );
}
