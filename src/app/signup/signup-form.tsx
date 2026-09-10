'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Field, InlineNote, Input } from '@/components/ui/primitives';
import { checkPasswordStrength } from '@/lib/auth/password';

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', organizationName: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = checkPasswordStrength(form.password);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!strength.ok) { setError(strength.problems.join(' ')); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Could not create the account.'); return; }
      router.push(data.redirect ?? '/onboarding');
      router.refresh();
    } catch {
      setError('The server did not respond.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-7 space-y-3">
      <Field label="Your name" required>
        <Input value={form.name} onChange={set('name')} required autoComplete="name" placeholder="Camila Prado" />
      </Field>
      <Field label="Work email" required>
        <Input type="email" value={form.email} onChange={set('email')} required autoComplete="username" placeholder="you@firm.com" />
      </Field>
      <Field label="Organization" required hint="The firm or fund this workspace belongs to.">
        <Input value={form.organizationName} onChange={set('organizationName')} required placeholder="Meridian Capital" />
      </Field>
      <Field
        label="Password" required
        hint={form.password && !strength.ok ? undefined : 'At least 8 characters, with a letter and a number.'}
        error={form.password && !strength.ok ? strength.problems.join(' ') : null}
      >
        <Input type="password" value={form.password} onChange={set('password')} required autoComplete="new-password" />
      </Field>

      {error ? <InlineNote tone="neg">{error}</InlineNote> : null}

      <Button type="submit" variant="primary" size="md" className="w-full" loading={loading}>
        Create workspace
      </Button>
    </form>
  );
}
