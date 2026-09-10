import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getRequestContext } from '@/server/context';
import { prisma } from '@/lib/db';
import { LoginForm } from './login-form';
import { MeridianMark } from '@/components/ui/icons';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage() {
  const ctx = await getRequestContext();
  if (ctx) redirect('/home');

  // Demo accounts are offered only when the seeded demo workspace exists.
  const demoWorkspace = await prisma.workspace.findFirst({ where: { isDemo: true } });
  const demoUsers = demoWorkspace
    ? await prisma.user.findMany({
        where: { email: { endsWith: '@meridian.app' } },
        select: { email: true, name: true, title: true, memberships: { select: { role: true } } },
        orderBy: { createdAt: 'asc' },
      })
    : [];

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-[52%] xl:px-20">
        <div className="mx-auto w-full max-w-[400px]">
          <Link href="/" className="inline-flex items-center gap-2 text-brass">
            <MeridianMark size={24} />
            <span className="text-lg font-semibold tracking-[0.14em] text-ink">MERIDIAN</span>
          </Link>

          <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">Sign in</h1>
          <p className="mt-1 text-base text-ink-3">
            Research, valuation and portfolio intelligence for the desk.
          </p>

          <LoginForm
            demoAccounts={demoUsers.map((u) => ({
              email: u.email, name: u.name, title: u.title,
              role: u.memberships[0]?.role ?? 'ANALYST',
            }))}
          />

          <p className="mt-6 text-xs text-ink-3">
            No account?{' '}
            <Link href="/signup" className="link">Create one</Link>
            {' · '}
            <Link href="/" className="link">Back to overview</Link>
          </p>
        </div>
      </div>

      <aside className="relative hidden lg:flex lg:w-[48%] flex-col justify-between border-l border-line bg-panel p-12">
        <div className="absolute inset-0 opacity-[0.05]" aria-hidden="true"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '22px 22px' }} />
        <div className="relative">
          <p className="label">The workflow</p>
          <ol className="mt-4 space-y-3">
            {[
              ['Company', 'Statements, fundamentals and returns on capital in one place.'],
              ['Valuation', 'DCF, comparables and a reverse DCF that states what the price already requires.'],
              ['Thesis', 'Assumptions written down as measurable thresholds.'],
              ['Portfolio', 'Position, attribution, exposure and look-through valuation.'],
              ['Monitoring', 'The platform tells you when an assumption breaks.'],
            ].map(([step, description], i) => (
              <li key={step} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line-strong text-2xs num text-ink-3">
                  {i + 1}
                </span>
                <span>
                  <span className="block text-base font-medium text-ink">{step}</span>
                  <span className="block text-xs text-ink-3">{description}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <p className="relative max-w-[46ch] text-xs leading-relaxed text-ink-3">
          Every figure in MERIDIAN carries its source and period. Where the workspace does not hold a
          value, the platform says so rather than estimating one.
        </p>
      </aside>
    </div>
  );
}
