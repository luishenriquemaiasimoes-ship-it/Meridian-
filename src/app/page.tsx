import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getRequestContext } from '@/server/context';
import { Icon, MeridianMark } from '@/components/ui/icons';
import { Badge } from '@/components/ui/primitives';

export const metadata: Metadata = {
  title: 'MERIDIAN — Investment intelligence, built for conviction',
  description:
    'Research companies, build valuations, monitor theses and manage portfolios from one institutional-grade workspace.',
};

const CAPABILITIES = [
  {
    icon: 'Company' as const,
    title: 'Company intelligence',
    body: 'Statements, normalized financials, working capital, returns on capital and the spread against the cost of capital — with every figure traceable to the period it came from.',
    points: ['Annual, quarterly and LTM', 'Normalization with rationale and author', 'ROIC decomposed into margin and turnover'],
  },
  {
    icon: 'Valuation' as const,
    title: 'Valuation that shows its work',
    body: 'A spreadsheet-grade DCF with sensitivity grids, an exit-multiple cross-check and a reverse DCF that states what the market price already requires.',
    points: ['FCFF build from EBIT to free cash flow', 'WACC from CAPM with your own rates', 'Bull, base and bear with expected value'],
  },
  {
    icon: 'Comps' as const,
    title: 'Comparables and history',
    body: 'Trading multiples against a peer set you control, and the same multiple reconstructed across its own five-year range so today has context.',
    points: ['Mean, median and quartiles', 'Implied valuation on any multiple', 'Bank-appropriate presentation for banks'],
  },
  {
    icon: 'Ai' as const,
    title: 'An AI analyst that cannot invent',
    body: 'The assistant reads only your workspace. Every statement is labelled observed, calculated, interpretation or opinion — and when a figure is missing it says so.',
    points: ['Context-aware of the page you are on', 'Sources cited on every block', 'Works with no external model configured'],
  },
  {
    icon: 'Portfolio' as const,
    title: 'Portfolio intelligence',
    body: 'Attribution by asset and sector, exposure and concentration, look-through valuation against the benchmark, and a rebalancing plan that recommends but never trades.',
    points: ['Contribution to return', 'Weighted P/E, EV/EBITDA, ROIC', 'Scenario shocks across the book'],
  },
  {
    icon: 'Monitoring' as const,
    title: 'Monitoring that closes the loop',
    body: 'Write the thesis as measurable thresholds. The platform checks them at every reporting date and tells you which assumption broke, not just that the price moved.',
    points: ['Thesis assumption tracking', 'Valuation and fundamental alerts', 'Full audit trail of every change'],
  },
];

const PLANS = [
  {
    name: 'Free trial', price: '—', period: '14 days',
    description: 'The complete product on the demo universe.',
    features: ['Every module', 'Demo data included', 'One workspace', 'One seat'],
    cta: 'Start the trial', highlight: false,
  },
  {
    name: 'Professional', price: 'R$ 890', period: 'per seat / month',
    description: 'For the independent analyst and the small research shop.',
    features: ['Unlimited companies and models', 'Research notes and memos', 'Portfolio and monitoring', 'Excel and PDF export', 'Three workspaces'],
    cta: 'Choose Professional', highlight: true,
  },
  {
    name: 'Team', price: 'R$ 3.400', period: 'per month, up to 8 seats',
    description: 'For a research desk that publishes together.',
    features: ['Everything in Professional', 'Shared workspaces', 'Roles and permissions', 'Investment committee', 'Audit trail'],
    cta: 'Choose Team', highlight: false,
  },
  {
    name: 'Institutional', price: 'Contact us', period: 'annual',
    description: 'For asset managers with their own data and controls.',
    features: ['Everything in Team', 'Bring your own market data', 'Custom benchmarks', 'SSO and data residency', 'Onboarding support'],
    cta: 'Talk to us', highlight: false,
  },
];

export default async function LandingPage() {
  const ctx = await getRequestContext();
  if (ctx) redirect('/home');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between px-5">
          <div className="flex items-center gap-2 text-brass">
            <MeridianMark size={22} />
            <span className="text-md font-semibold tracking-[0.14em] text-ink">MERIDIAN</span>
          </div>
          <nav className="hidden items-center gap-6 text-xs text-ink-2 md:flex">
            <a href="#capabilities" className="hover:text-ink">Product</a>
            <a href="#workflow" className="hover:text-ink">Workflow</a>
            <a href="#pricing" className="hover:text-ink">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded px-3 py-1.5 text-xs text-ink-2 transition hover:bg-raised hover:text-ink">
              Sign in
            </Link>
            <Link href="/signup" className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-white transition hover:brightness-110">
              Start free
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-20 sm:py-28">
          <Badge tone="brass">Research · Valuation · Conviction</Badge>
          <h1 className="mt-5 max-w-[19ch] text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
            Investment intelligence, built for conviction.
          </h1>
          <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-ink-2">
            Research companies, build valuations, monitor theses and manage portfolios from one
            institutional-grade workspace.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="inline-flex h-9 items-center gap-2 rounded bg-accent px-4 text-sm font-medium text-white transition hover:brightness-110">
              Create your workspace <Icon.ArrowRight size={14} />
            </Link>
            <Link href="/login" className="inline-flex h-9 items-center gap-2 rounded border border-line px-4 text-sm text-ink-2 transition hover:border-line-strong hover:text-ink">
              Open the demo workspace
            </Link>
          </div>

          <dl className="mt-14 grid max-w-[820px] grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            {[
              ['26', 'companies with full statements in the demo universe'],
              ['323', 'unit tests over the financial engine'],
              ['6 years', 'of annual history plus ten quarters and LTM'],
              ['0', 'figures invented by the AI layer'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="num text-2xl font-semibold text-ink">{value}</dt>
                <dd className="mt-1 text-xs leading-snug text-ink-3">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="capabilities" className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-20">
          <p className="label">What it does</p>
          <h2 className="mt-2 max-w-[24ch] text-3xl font-semibold tracking-tight text-ink">
            Every screen answers a decision, not just a query.
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((c) => {
              const Ico = Icon[c.icon];
              return (
                <article key={c.title} className="panel p-5">
                  <Ico size={18} className="text-brass" />
                  <h3 className="mt-3 text-md font-semibold text-ink">{c.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-ink-3">{c.body}</p>
                  <ul className="mt-3 space-y-1.5">
                    {c.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-xs text-ink-2">
                        <Icon.Check size={12} className="mt-0.5 shrink-0 text-pos" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="workflow" className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-20">
          <p className="label">The loop</p>
          <h2 className="mt-2 max-w-[26ch] text-3xl font-semibold tracking-tight text-ink">
            From a company to a position, and back again when the facts change.
          </h2>
          <ol className="mt-10 grid gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Research', 'Open a company, read the statements, decompose the returns on capital.'],
              ['Value', 'Build the DCF, cross-check with comparables, run the reverse DCF.'],
              ['Decide', 'Write the thesis as thresholds, size the position, take it to committee.'],
              ['Monitor', 'The platform checks the thresholds each period and tells you what broke.'],
            ].map(([title, body], i) => (
              <li key={title} className="bg-panel p-5">
                <span className="num text-2xs text-ink-4">0{i + 1}</span>
                <h3 className="mt-2 text-md font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-3">{body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-[70ch] text-base leading-relaxed text-ink-3">
            The loop closes because the thesis is written in the same measures the statements produce.
            When margin, return on capital or leverage crosses the threshold you set, the monitoring
            module says which assumption failed — and the memo, the model and the position are one click away.
          </p>
        </div>
      </section>

      <section id="pricing" className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-20">
          <p className="label">Pricing</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Priced per desk, not per query.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => (
              <article key={p.name} className={`panel flex flex-col p-5 ${p.highlight ? 'border-accent' : ''}`}>
                {p.highlight ? <Badge tone="accent" className="mb-3 self-start">Most chosen</Badge> : null}
                <h3 className="text-md font-semibold text-ink">{p.name}</h3>
                <p className="mt-1 text-xs text-ink-3">{p.description}</p>
                <p className="mt-4 num text-2xl font-semibold text-ink">{p.price}</p>
                <p className="text-2xs text-ink-4">{p.period}</p>
                <ul className="mt-4 flex-1 space-y-1.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-ink-2">
                      <Icon.Check size={12} className="mt-0.5 shrink-0 text-pos" />{f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-5 inline-flex h-8 items-center justify-center rounded text-xs font-medium transition ${
                    p.highlight ? 'bg-accent text-white hover:brightness-110' : 'border border-line text-ink-2 hover:border-line-strong hover:text-ink'
                  }`}
                >
                  {p.cta}
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-6 text-xs text-ink-4">
            Billing is not enabled in this deployment. The subscription model is wired through a provider
            interface so a payment processor can be connected without touching the product surface.
          </p>
        </div>
      </section>

      <footer className="mx-auto max-w-[1180px] px-5 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-brass">
            <MeridianMark size={18} />
            <span className="text-sm font-semibold tracking-[0.14em] text-ink">MERIDIAN</span>
          </div>
          <p className="text-2xs text-ink-4">
            Research. Valuation. Conviction. — MERIDIAN is a research tool, not investment advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
