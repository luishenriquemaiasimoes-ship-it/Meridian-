import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getRequestContext } from '@/server/context';
import { OnboardingFlow } from './onboarding-flow';
import { MeridianMark } from '@/components/ui/icons';

export const metadata: Metadata = { title: 'Set up your workspace' };

export default async function OnboardingPage() {
  const ctx = await getRequestContext();
  if (!ctx) redirect('/login');

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-[720px]">
        <div className="flex items-center gap-2 text-brass">
          <MeridianMark size={22} />
          <span className="text-md font-semibold tracking-[0.14em] text-ink">MERIDIAN</span>
        </div>
        <OnboardingFlow userName={ctx.name} organizationName={ctx.organizationName} />
      </div>
    </div>
  );
}
