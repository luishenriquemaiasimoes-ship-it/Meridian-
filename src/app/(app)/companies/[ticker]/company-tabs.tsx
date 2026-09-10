'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from '@/components/ui/primitives';

const TABS = [
  { slug: '', label: 'Overview' },
  { slug: 'financials', label: 'Financials' },
  { slug: 'fundamentals', label: 'Fundamentals' },
  { slug: 'valuation', label: 'Valuation' },
  { slug: 'comps', label: 'Comps' },
  { slug: 'earnings', label: 'Earnings' },
  { slug: 'segments', label: 'Segments' },
  { slug: 'ownership', label: 'Ownership' },
  { slug: 'thesis', label: 'Thesis' },
  { slug: 'research', label: 'Research' },
  { slug: 'news', label: 'News' },
  { slug: 'charts', label: 'Charts' },
  { slug: 'ai', label: 'AI analysis' },
];

export function CompanyTabs({ ticker }: { ticker: string }) {
  const pathname = usePathname();
  const base = `/companies/${ticker}`;

  return (
    <nav className="flex items-end gap-0.5 overflow-x-auto border-b border-line" aria-label="Company sections">
      {TABS.map((t) => {
        const href = t.slug ? `${base}/${t.slug}` : base;
        const active = pathname === href;
        return (
          <Link
            key={t.slug} href={href}
            className={cx(
              'relative whitespace-nowrap px-3 py-2 text-xs font-medium transition focus-ring',
              active ? 'text-ink' : 'text-ink-3 hover:text-ink-2',
            )}
            aria-current={active ? 'page' : undefined}
          >
            {t.label}
            {active ? <span className="absolute inset-x-0 -bottom-px h-[2px] bg-accent" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
