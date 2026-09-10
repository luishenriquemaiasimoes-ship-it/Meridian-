'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Field, InlineNote, Input } from '@/components/ui/primitives';

interface DemoAccount { email: string; name: string; title: string | null; role: string }

export function LoginForm({ demoAccounts }: { demoAccounts: DemoAccount[] }) {
  const router = useRouter();
  const [email, setEmail] = useState(demoAccounts[0]?.email ?? '');
  const [password, setPassword] = useState(demoAccounts.length ? 'meridian2026' : '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Could not sign in.'); return; }
      router.push(data.redirect ?? '/home');
      router.refresh();
    } catch {
      setError('The server did not respond. Check that the application is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-7 space-y-3">
      <Field label="Email">
        <Input
          type="email" value={email} autoComplete="username" required
          onChange={(e) => setEmail(e.target.value)} placeholder="you@firm.com"
        />
      </Field>
      <Field label="Password">
        <Input
          type="password" value={password} autoComplete="current-password" required
          onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
        />
      </Field>

      {error ? <InlineNote tone="neg">{error}</InlineNote> : null}

      <Button type="submit" variant="primary" size="md" className="w-full" loading={loading}>
        Sign in
      </Button>

      {demoAccounts.length ? (
        <div className="pt-3">
          <p className="label mb-2">Demo accounts — password meridian2026</p>
          <div className="space-y-1">
            {demoAccounts.map((a) => (
              <button
                key={a.email} type="button"
                onClick={() => { setEmail(a.email); setPassword('meridian2026'); }}
                className="flex w-full items-center justify-between rounded border border-line px-2.5 py-1.5 text-left transition hover:border-line-strong hover:bg-raised focus-ring"
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs text-ink">{a.name}</span>
                  <span className="block truncate text-2xs text-ink-4">{a.email}</span>
                </span>
                <span className="ml-3 shrink-0 text-2xs uppercase tracking-wider text-ink-3">
                  {a.role.replace('_', ' ').toLowerCase()}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-2xs text-ink-4">
            Each role sees a different set of actions — the viewer account is read-only.
          </p>
        </div>
      ) : null}
    </form>
  );
}
