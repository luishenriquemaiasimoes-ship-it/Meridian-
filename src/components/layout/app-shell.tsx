'use client';

import { useState, type ReactNode } from 'react';
import { CommandPalette, useCommandPalette } from './command-palette';
import { MobileNav, Sidebar, useSidebarState } from './sidebar';
import { TopBar } from './topbar';

export interface ShellUser {
  name: string; email: string; title: string | null; avatarColor: string;
}

export function AppShell({
  children, user, workspaces, activeWorkspaceId, workspaceName, organizationName, theme,
}: {
  children: ReactNode;
  user: ShellUser;
  workspaces: { id: string; name: string; kind: string }[];
  activeWorkspaceId: string;
  workspaceName: string;
  organizationName: string;
  theme: string;
}) {
  const { collapsed, toggle } = useSidebarState();
  const { open, setOpen } = useCommandPalette();
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <div className="hidden lg:block shrink-0">
        <Sidebar
          collapsed={collapsed} onToggle={toggle}
          workspaceName={workspaceName} organizationName={organizationName}
        />
      </div>
      <MobileNav
        open={mobileNav} onClose={() => setMobileNav(false)}
        workspaceName={workspaceName} organizationName={organizationName}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          onOpenCommand={() => setOpen(true)}
          onOpenMobileNav={() => setMobileNav(true)}
          user={user}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          theme={theme}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1680px] px-4 py-5 sm:px-6">{children}</div>
        </main>
      </div>

      <CommandPalette open={open} onOpenChange={setOpen} />
    </div>
  );
}
