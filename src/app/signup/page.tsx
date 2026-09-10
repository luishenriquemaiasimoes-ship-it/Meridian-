import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getRequestContext } from '@/server/context';
import { SignupForm } from './signup-form';
import { MeridianMark } from '@/components/ui/icons';

export const metadata: Metadata = { title: 'Create account' };

export default async function SignupPage() {
  const ctx = await getRequestContext();
  if (ctx) redirect('/home');

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="inline-flex items-center gap-2 text-brass">
          <MeridianMark size={24} />
          <span className="text-lg font-semibold tracking-[0.14em] text-ink">MERIDIAN</span>
        </Link>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">Create your workspace</h1>
        <p className="mt-1 text-base text-ink-3">
          You will be the administrator of a new organization with a research workspace.
        </p>
        <SignupForm />
        <p className="mt-6 text-xs text-ink-3">
          Already have an account? <Link href="/login" className="link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
