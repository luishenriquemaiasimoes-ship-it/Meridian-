import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getRequestContext } from '@/server/context';
import { AppShell } from '@/components/layout/app-shell';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getRequestContext();
  if (!ctx) redirect('/login');

  const jar = await cookies();
  const theme = jar.get('meridian_theme')?.value === 'light' ? 'light' : 'dark';

  return (
    <AppShell
      user={{ name: ctx.name, email: ctx.email, title: ctx.title, avatarColor: ctx.avatarColor }}
      workspaces={ctx.workspaces.map((w) => ({ id: w.id, name: w.name, kind: w.kind }))}
      activeWorkspaceId={ctx.workspaceId}
      workspaceName={ctx.workspaceName}
      organizationName={ctx.organizationName}
      theme={theme}
    >
      {children}
    </AppShell>
  );
}
