import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { requirePageContext } from '@/server/context';
import { getCompanyDossier } from '@/server/services/company';
import {
  Badge, EmptyState, Grid, Panel, PanelHeader, SectionLabel,
} from '@/components/ui/primitives';
import { findCompanyQualitative } from '@/lib/research/qualitative/companies';
import { findSectorDossier } from '@/lib/research/qualitative/sectors';
import { BasisChip, Bullets, KeyValue, NoteList, SourceFooter } from '@/components/research/basis';
import type { ResearchThesis } from '@/lib/research/qualitative/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ ticker: string }> }): Promise<Metadata> {
  const { ticker } = await params;
  return { title: `${ticker.toUpperCase()} — Business & governance` };
}

const SIDE_TONE = { BULL: 'pos', BEAR: 'neg', STRUCTURAL: 'outline' } as const;
const SIDE_LABEL = { BULL: 'Bull', BEAR: 'Bear', STRUCTURAL: 'Structural' } as const;
const CONVICTION_TONE = { LOW: 'outline', MEDIUM: 'warn', HIGH: 'accent' } as const;

function Thesis({ thesis, ticker }: { thesis: ResearchThesis; ticker: string }) {
  return (
    <article className="rounded border border-line p-3">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-ink">{thesis.title}</h4>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge tone={SIDE_TONE[thesis.side]}>{SIDE_LABEL[thesis.side]}</Badge>
          {thesis.weight === 'CORE' ? <Badge tone="brass">Core</Badge> : null}
          <Badge tone={CONVICTION_TONE[thesis.conviction]} title="How sure the research is, stated rather than implied">
            {thesis.conviction} conviction
          </Badge>
        </div>
      </div>

      <p className="mt-1.5 text-xs leading-relaxed text-ink-2">{thesis.rationale}</p>

      <Grid cols={2} gap={3} className="mt-3">
        <Bullets label="What has to be true" items={thesis.requires} tone="pos" />
        <Bullets label="What would prove it wrong" items={thesis.breaks} tone="neg" />
      </Grid>

      {thesis.modelLink.length ? (
        <div className="mt-3 border-t border-line pt-2">
          <SectionLabel className="mb-1.5">
            Where this touches the model
          </SectionLabel>
          <ul className="space-y-1.5">
            {thesis.modelLink.map((m) => (
              <li key={m.assumption} className="text-xs leading-relaxed">
                <span className="font-medium text-ink">{m.assumption}</span>
                <span className="text-ink-3"> — {m.note}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-2xs text-ink-4">
            A qualitative view that moves no assumption cannot be tested against the numbers.{' '}
            <Link href={`/companies/${ticker}/valuation`} className="text-accent hover:underline focus-ring">
              Open the model
            </Link>{' '}
            to change one and see what it does.
          </p>
        </div>
      ) : null}
    </article>
  );
}

export default async function BusinessPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  await requirePageContext();
  const dossier = await getCompanyDossier(ticker);
  if (!dossier) notFound();

  const c = dossier.company;
  const q = findCompanyQualitative(c.ticker);
  const sector = findSectorDossier(c.sector, c.country, c.industry);

  if (!q) {
    return (
      <Panel>
        <PanelHeader title="Business & governance" />
        <EmptyState
          title={`${c.ticker} has not been researched yet`}
          description={
            <>
              Qualitative research is written company by company, and this one is not done. Nothing is
              shown rather than a page of generic statements that would read like research without being
              any.
              {sector ? (
                <>
                  {' '}The{' '}
                  <Link href={`/companies/${c.ticker}/sector`} className="text-accent hover:underline focus-ring">
                    {sector.sector} sector dossier
                  </Link>{' '}
                  does cover this company&apos;s industry.
                </>
              ) : null}
            </>
          }
        />
      </Panel>
    );
  }

  return (
    <div className="space-y-3">
      <Panel>
        <PanelHeader
          title={`${c.name} — the business, honestly`}
          subtitle="What it earns from, who controls it, and what would have to go wrong"
          actions={
            sector ? (
              <Link
                href={`/companies/${c.ticker}/sector`}
                className="text-xs text-accent hover:underline focus-ring"
              >
                Sector dossier →
              </Link>
            ) : null
          }
        />
        <p className="text-sm leading-relaxed text-ink">{q.headline}</p>
      </Panel>

      <Panel>
        <PanelHeader title="How it actually earns" subtitle="Past the marketing" />
        <NoteList notes={q.howItEarns} />
      </Panel>

      <Panel>
        <PanelHeader
          title="Control and what protects a minority holder"
          subtitle="A controlled company can be run superbly; the protection comes from the structure, not from goodwill"
          actions={<BasisChip basis={q.control.basis} />}
        />
        <div className="space-y-4">
          <Grid cols={2} gap={4}>
            <KeyValue label="Form of control">{q.control.form}</KeyValue>
            <KeyValue label="Voting">{q.control.voting}</KeyValue>
          </Grid>
          <Grid cols={2} gap={4}>
            <Bullets label="Where interests can diverge" items={q.control.relatedPartyExposure} tone="neg" />
            <Bullets label="What actually protects the minority" items={q.control.minorityProtections} tone="pos" />
          </Grid>
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Governance" subtitle="The parts that change a valuation rather than a score" />
        <NoteList notes={q.governance} />
      </Panel>

      <Panel>
        <PanelHeader
          title="Moat"
          subtitle="Stated so it can be checked: the mechanism, what it is worth, and what would take it away"
        />
        {q.moat.length ? (
          <div className="space-y-3">
            {q.moat.map((m) => (
              <div key={m.label} className="rounded border border-line p-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-ink">{m.label}</h4>
                  <BasisChip basis={m.basis} />
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-2">{m.mechanism}</p>
                <div className="mt-2 grid gap-2 border-t border-line pt-2 md:grid-cols-2">
                  <div>
                    <SectionLabel className="mb-1">What it is worth</SectionLabel>
                    <p className="text-xs leading-relaxed text-ink-2">{m.evidence}</p>
                  </div>
                  <div>
                    <SectionLabel className="mb-1">Eroded by</SectionLabel>
                    <p className="text-xs leading-relaxed text-ink-2">{m.erodedBy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-ink-3">No durable advantage identified. For many businesses that is the correct answer.</p>
        )}
      </Panel>

      <Panel>
        <PanelHeader
          title="Capital allocation"
          subtitle="What management has done with the cash — the only evidence that counts"
          actions={<BasisChip basis={q.capitalAllocation.basis} />}
        />
        <p className="text-xs leading-relaxed text-ink-2">{q.capitalAllocation.summary}</p>
        <Grid cols={2} gap={4} className="mt-3">
          <Bullets label="Went well" items={q.capitalAllocation.good} tone="pos" />
          <Bullets label="Did not" items={q.capitalAllocation.bad} tone="neg" />
        </Grid>
      </Panel>

      <Grid cols={2} gap={3}>
        <Panel>
          <PanelHeader title="Where it sits in the sector" subtitle="The sector drivers, specific to this company" />
          <NoteList notes={q.sectorPosition} />
        </Panel>
        <Panel>
          <PanelHeader title="Key risks" subtitle="Ranked by how much they would actually hurt" />
          <NoteList notes={q.keyRisks} />
        </Panel>
      </Grid>

      <Panel>
        <PanelHeader
          title="Research theses"
          subtitle="Starting points drawn from the research, each with what would falsify it — not the analyst's own thesis"
          actions={
            <Link href={`/companies/${c.ticker}/thesis`} className="text-xs text-accent hover:underline focus-ring">
              Your thesis workbench →
            </Link>
          }
        />
        <div className="space-y-3">
          {q.theses.map((t) => <Thesis key={t.id} thesis={t} ticker={c.ticker} />)}
        </div>
        <SourceFooter asOf={q.asOf} sources={q.sources} />
      </Panel>
    </div>
  );
}
