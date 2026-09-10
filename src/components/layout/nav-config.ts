import type { IconName } from '@/components/ui/icons';

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  /** The decision this section helps the user make. */
  purpose: string;
  match?: (path: string) => boolean;
}

export const PRIMARY_NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Overview',
    items: [
      { href: '/home', label: 'Home', icon: 'Home', purpose: 'What needs my attention today?' },
      { href: '/research', label: 'Research', icon: 'Research', purpose: 'What has the desk published and what changed?' },
    ],
  },
  {
    group: 'Analysis',
    items: [
      { href: '/companies', label: 'Companies', icon: 'Company', purpose: 'What is this business worth and why?' },
      { href: '/screener', label: 'Screener', icon: 'Screener', purpose: 'Which companies deserve work next?' },
      { href: '/watchlists', label: 'Watchlists', icon: 'Watchlist', purpose: 'What am I tracking and what moved?' },
      { href: '/valuation', label: 'Valuation', icon: 'Valuation', purpose: 'What do my models say today?' },
      { href: '/comparables', label: 'Comparables', icon: 'Comps', purpose: 'How is this rated against its peers?' },
      { href: '/earnings', label: 'Earnings', icon: 'Earnings', purpose: 'What did the print change?' },
      { href: '/sectors', label: 'Sectors & themes', icon: 'Layers', purpose: 'Where is the opportunity concentrated?' },
    ],
  },
  {
    group: 'Portfolio',
    items: [
      { href: '/portfolio', label: 'Portfolio', icon: 'Portfolio', purpose: 'What do I own and how is it doing?' },
      { href: '/risk', label: 'Risk', icon: 'Risk', purpose: 'What could go wrong and how much would it cost?' },
      { href: '/monitoring', label: 'Monitoring', icon: 'Monitoring', purpose: 'Which theses are breaking?' },
    ],
  },
  {
    group: 'Output',
    items: [
      { href: '/memos', label: 'Investment memos', icon: 'Memo', purpose: 'What am I asking the committee to approve?' },
      { href: '/committee', label: 'Committee', icon: 'Vote', purpose: 'What is up for decision?' },
      { href: '/library', label: 'Research library', icon: 'Library', purpose: 'Where is that document?' },
      { href: '/ai', label: 'AI Analyst', icon: 'Ai', purpose: 'Ask the workspace a question.' },
      { href: '/workspaces', label: 'Workspaces', icon: 'Workspace', purpose: 'Which book am I working in?' },
    ],
  },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: 'Settings', purpose: 'Configure the workspace.' },
  { href: '/settings/data-sources', label: 'Data sources', icon: 'Database', purpose: 'Where is the data coming from?' },
  { href: '/settings/profile', label: 'Profile', icon: 'User', purpose: 'Your account.' },
  { href: '/settings/organization', label: 'Organization', icon: 'Org', purpose: 'Members and roles.' },
];

export const ALL_NAV_ITEMS: NavItem[] = [
  ...PRIMARY_NAV.flatMap((g) => g.items),
  ...SECONDARY_NAV,
];
