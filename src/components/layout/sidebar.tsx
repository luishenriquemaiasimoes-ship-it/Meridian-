'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Icon, MeridianMark } from '@/components/ui/icons';
import { cx, Tooltip } from '@/components/ui/primitives';
import { PRIMARY_NAV, SECONDARY_NAV } from './nav-config';

export function Sidebar({
  collapsed, onToggle, workspaceName, organizationName, onNavigate,
}: {
  collapsed: boolean;
  onToggle: () => void;
  workspaceName: string;
  organizationName: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/home' ? pathname === '/home' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      className={cx(
        'flex h-full flex-col border-r border-line bg-panel transition-[width] duration-150',
        collapsed ? 'w-[52px]' : 'w-[212px]',
      )}
      aria-label="Primary"
    >
      <div className={cx('flex items-center gap-2 border-b border-line h-[46px]', collapsed ? 'justify-center px-2' : 'px-3')}>
        <Link href="/home" className="flex items-center gap-2 text-brass focus-ring rounded" onClick={onNavigate}>
          <MeridianMark size={20} />
          {!collapsed ? (
            <span className="text-md font-semibold tracking-[0.12em] text-ink">MERIDIAN</span>
          ) : null}
        </Link>
      </div>

      {!collapsed ? (
        <div className="border-b border-line px-3 py-2">
          <div className="label">Workspace</div>
          <div className="mt-0.5 truncate text-xs font-medium text-ink">{workspaceName}</div>
          <div className="truncate text-2xs text-ink-4">{organizationName}</div>
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto py-2">
        {PRIMARY_NAV.map((group) => (
          <div key={group.group} className="mb-1">
            {!collapsed ? <div className="label px-3 py-1.5">{group.group}</div> : null}
            {group.items.map((item) => {
              const Ico = Icon[item.icon];
              const active = isActive(item.href);
              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cx(
                    'relative mx-1.5 flex items-center gap-2.5 rounded px-2 py-[6px] text-xs transition focus-ring',
                    collapsed && 'justify-center px-0',
                    active ? 'bg-accent/[0.10] text-ink font-medium' : 'text-ink-2 hover:bg-raised hover:text-ink',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  {active ? <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r bg-accent" /> : null}
                  <Ico size={15} className={active ? 'text-accent' : 'text-ink-3'} />
                  {!collapsed ? <span className="truncate">{item.label}</span> : null}
                </Link>
              );
              return collapsed ? (
                <Tooltip key={item.href} content={item.label} side="right">{link}</Tooltip>
              ) : link;
            })}
          </div>
        ))}
      </div>

      <div className="border-t border-line py-2">
        {SECONDARY_NAV.map((item) => {
          const Ico = Icon[item.icon];
          const active = pathname === item.href;
          const link = (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cx(
                'mx-1.5 flex items-center gap-2.5 rounded px-2 py-[6px] text-xs transition focus-ring',
                collapsed && 'justify-center px-0',
                active ? 'bg-raised text-ink font-medium' : 'text-ink-3 hover:bg-raised hover:text-ink-2',
              )}
            >
              <Ico size={15} />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );
          return collapsed ? <Tooltip key={item.href} content={item.label} side="right">{link}</Tooltip> : link;
        })}
        <button
          type="button"
          onClick={onToggle}
          className={cx(
            'mx-1.5 mt-1 flex items-center gap-2.5 rounded px-2 py-[6px] text-xs text-ink-4 transition hover:bg-raised hover:text-ink-2 focus-ring',
            collapsed ? 'justify-center px-0 w-[calc(100%-12px)]' : 'w-[calc(100%-12px)]',
          )}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {collapsed ? <Icon.ChevronRight size={15} /> : <><Icon.ChevronLeft size={15} /><span>Collapse</span></>}
        </button>
      </div>
    </nav>
  );
}

export function MobileNav({ open, onClose, workspaceName, organizationName }: {
  open: boolean; onClose: () => void; workspaceName: string; organizationName: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-[212px] animate-slide-up">
        <Sidebar collapsed={false} onToggle={onClose} workspaceName={workspaceName} organizationName={organizationName} onNavigate={onClose} />
      </div>
    </div>
  );
}

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(false);
  return { collapsed, toggle: () => setCollapsed((v) => !v) };
}
