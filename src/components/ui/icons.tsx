import type { SVGProps } from 'react';

/**
 * MERIDIAN icon set — drawn in-house on a 16px grid with a 1.5px stroke so the
 * weight matches the type. No emoji anywhere in the product.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 16, children, ...rest }: IconProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 16 16" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false" {...rest}
    >
      {children}
    </svg>
  );
}

export const Icon = {
  Home: (p: IconProps) => <Svg {...p}><path d="M2.5 6.8 8 2.5l5.5 4.3V13a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5z" /><path d="M6.2 13.5V9h3.6v4.5" /></Svg>,
  Research: (p: IconProps) => <Svg {...p}><path d="M4 2.5h6.2L13 5.3V13a.5.5 0 0 1-.5.5h-8A.5.5 0 0 1 4 13z" /><path d="M9.8 2.5v3h3.2M6 8h4M6 10.5h4" /></Svg>,
  Company: (p: IconProps) => <Svg {...p}><path d="M2.5 13.5h11M4 13.5V3.2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v10.3M9 13.5V6.5h2.5a.5.5 0 0 1 .5.5v6.5" /><path d="M5.6 5.2h1.8M5.6 7.6h1.8M5.6 10h1.8" /></Svg>,
  Screener: (p: IconProps) => <Svg {...p}><path d="M2.5 3.5h11M4.5 8h7M6.5 12.5h3" /></Svg>,
  Watchlist: (p: IconProps) => <Svg {...p}><path d="M2 8s2.2-4 6-4 6 4 6 4-2.2 4-6 4-6-4-6-4z" /><circle cx="8" cy="8" r="1.6" /></Svg>,
  Valuation: (p: IconProps) => <Svg {...p}><path d="M8 2.2v11.6M5 4.6h4.4a1.7 1.7 0 0 1 0 3.4H6.6a1.7 1.7 0 0 0 0 3.4H11" /></Svg>,
  Comps: (p: IconProps) => <Svg {...p}><path d="M3 13V6.5M6.3 13V3.5M9.7 13V8.5M13 13V5" /></Svg>,
  Earnings: (p: IconProps) => <Svg {...p}><rect x="2.5" y="3" width="11" height="10.5" rx="1" /><path d="M2.5 6h11M5.5 2v2M10.5 2v2M5.5 9h2M9 9h1.5M5.5 11.2h4" /></Svg>,
  Portfolio: (p: IconProps) => <Svg {...p}><path d="M2.5 5.5h11v8a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5z" /><path d="M6 5.5V3.4a.9.9 0 0 1 .9-.9h2.2a.9.9 0 0 1 .9.9v2.1M2.5 9h11" /></Svg>,
  Risk: (p: IconProps) => <Svg {...p}><path d="M8 2.2 14 13H2z" /><path d="M8 6.4v3M8 11.2v.1" /></Svg>,
  Monitoring: (p: IconProps) => <Svg {...p}><path d="M1.8 8.6h3L6.6 4l2.9 8.4 1.6-3.8h3.1" /></Svg>,
  Memo: (p: IconProps) => <Svg {...p}><rect x="3" y="2.2" width="10" height="11.6" rx="1" /><path d="M5.5 5.4h5M5.5 8h5M5.5 10.6h3" /></Svg>,
  Library: (p: IconProps) => <Svg {...p}><path d="M3 2.8h2.6v10.4H3zM6.6 2.8h2.6v10.4H6.6z" /><path d="m10.4 3.4 2.4.7-2.6 9.4-2.2-.7" /></Svg>,
  Ai: (p: IconProps) => <Svg {...p}><path d="M8 2.2 9.5 6l3.8 1.5-3.8 1.5L8 12.8 6.5 9 2.7 7.5 6.5 6z" /></Svg>,
  Workspace: (p: IconProps) => <Svg {...p}><rect x="2.3" y="2.3" width="5" height="5" rx="1" /><rect x="8.7" y="2.3" width="5" height="5" rx="1" /><rect x="2.3" y="8.7" width="5" height="5" rx="1" /><rect x="8.7" y="8.7" width="5" height="5" rx="1" /></Svg>,
  Settings: (p: IconProps) => <Svg {...p}><circle cx="8" cy="8" r="2.2" /><path d="M8 1.6v1.6M8 12.8v1.6M14.4 8h-1.6M3.2 8H1.6M12.5 3.5l-1.1 1.1M4.6 11.4l-1.1 1.1M12.5 12.5l-1.1-1.1M4.6 4.6 3.5 3.5" /></Svg>,
  Database: (p: IconProps) => <Svg {...p}><ellipse cx="8" cy="4" rx="5" ry="2" /><path d="M3 4v8c0 1.1 2.2 2 5 2s5-.9 5-2V4M3 8c0 1.1 2.2 2 5 2s5-.9 5-2" /></Svg>,
  User: (p: IconProps) => <Svg {...p}><circle cx="8" cy="5.5" r="2.6" /><path d="M2.8 13.6c.6-2.6 2.7-4 5.2-4s4.6 1.4 5.2 4" /></Svg>,
  Org: (p: IconProps) => <Svg {...p}><rect x="2.5" y="6" width="4" height="7.5" rx=".5" /><rect x="9.5" y="2.5" width="4" height="11" rx=".5" /><path d="M4 8.2h1M4 10.4h1M11 4.7h1M11 7h1M11 9.3h1" /></Svg>,
  Search: (p: IconProps) => <Svg {...p}><circle cx="7.2" cy="7.2" r="4.2" /><path d="m10.4 10.4 3 3" /></Svg>,
  Command: (p: IconProps) => <Svg {...p}><path d="M5.5 3.5a1.7 1.7 0 1 0 1.7 1.7v5.6a1.7 1.7 0 1 0 1.7-1.7H5.2a1.7 1.7 0 1 0 1.7 1.7V5.2a1.7 1.7 0 1 0-1.7 1.7h5.6a1.7 1.7 0 1 0-1.7-1.7" /></Svg>,
  Plus: (p: IconProps) => <Svg {...p}><path d="M8 3.2v9.6M3.2 8h9.6" /></Svg>,
  Bell: (p: IconProps) => <Svg {...p}><path d="M4 6.6a4 4 0 0 1 8 0c0 3.2 1 4 1 4H3s1-.8 1-4z" /><path d="M6.6 13a1.6 1.6 0 0 0 2.8 0" /></Svg>,
  Chevron: (p: IconProps) => <Svg {...p}><path d="m4.5 6 3.5 3.5L11.5 6" /></Svg>,
  ChevronRight: (p: IconProps) => <Svg {...p}><path d="m6 4.5 3.5 3.5L6 11.5" /></Svg>,
  ChevronLeft: (p: IconProps) => <Svg {...p}><path d="M10 4.5 6.5 8l3.5 3.5" /></Svg>,
  ArrowUp: (p: IconProps) => <Svg {...p}><path d="M8 12.5v-9M4.5 7 8 3.5 11.5 7" /></Svg>,
  ArrowDown: (p: IconProps) => <Svg {...p}><path d="M8 3.5v9M4.5 9 8 12.5 11.5 9" /></Svg>,
  ArrowRight: (p: IconProps) => <Svg {...p}><path d="M3 8h10M9.5 4.5 13 8l-3.5 3.5" /></Svg>,
  External: (p: IconProps) => <Svg {...p}><path d="M9.5 3h3.5v3.5M12.5 3.5 7.5 8.5" /><path d="M12 9.8V12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h2.3" /></Svg>,
  Check: (p: IconProps) => <Svg {...p}><path d="m3.5 8.4 3 3 6-6.8" /></Svg>,
  Close: (p: IconProps) => <Svg {...p}><path d="m4 4 8 8M12 4l-8 8" /></Svg>,
  Warning: (p: IconProps) => <Svg {...p}><circle cx="8" cy="8" r="5.8" /><path d="M8 4.9v3.6M8 10.8v.1" /></Svg>,
  Info: (p: IconProps) => <Svg {...p}><circle cx="8" cy="8" r="5.8" /><path d="M8 7.3v3.8M8 5.1v.1" /></Svg>,
  Download: (p: IconProps) => <Svg {...p}><path d="M8 2.6v7.2M5 7l3 3 3-3M3 12.8h10" /></Svg>,
  Upload: (p: IconProps) => <Svg {...p}><path d="M8 10.4V3.2M5 6.2l3-3 3 3M3 12.8h10" /></Svg>,
  Filter: (p: IconProps) => <Svg {...p}><path d="M2.6 3.6h10.8L9.4 8.2v4.2l-2.8 1.4V8.2z" /></Svg>,
  Refresh: (p: IconProps) => <Svg {...p}><path d="M13.2 7.2a5.3 5.3 0 1 0-.4 3.4" /><path d="M13.4 3.6v3.6h-3.6" /></Svg>,
  Edit: (p: IconProps) => <Svg {...p}><path d="M9.6 3.2 12.8 6.4 6 13.2l-3.6.4.4-3.6z" /><path d="m8.4 4.4 3.2 3.2" /></Svg>,
  Trash: (p: IconProps) => <Svg {...p}><path d="M2.8 4.4h10.4M6 4.4V3a.6.6 0 0 1 .6-.6h2.8A.6.6 0 0 1 10 3v1.4M4.2 4.4l.5 8.4a.6.6 0 0 0 .6.6h5.4a.6.6 0 0 0 .6-.6l.5-8.4" /></Svg>,
  Save: (p: IconProps) => <Svg {...p}><path d="M3 3.6a.6.6 0 0 1 .6-.6h7.2L13 5.2v7.2a.6.6 0 0 1-.6.6H3.6a.6.6 0 0 1-.6-.6z" /><path d="M5.4 3v3.2h5.2V3M5.4 13V9.4h5.2V13" /></Svg>,
  Copy: (p: IconProps) => <Svg {...p}><rect x="5.4" y="5.4" width="7.6" height="7.6" rx="1" /><path d="M10.6 5.4V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v5.6a1 1 0 0 0 1 1h1.4" /></Svg>,
  Grid: (p: IconProps) => <Svg {...p}><rect x="2.5" y="2.5" width="11" height="11" rx="1" /><path d="M2.5 6.2h11M2.5 9.9h11M6.2 2.5v11M9.9 2.5v11" /></Svg>,
  Sparkle: (p: IconProps) => <Svg {...p}><path d="M6 2.4 7 5l2.6 1-2.6 1-1 2.6L5 7 2.4 6 5 5z" /><path d="M11.6 8.2l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z" /></Svg>,
  Target: (p: IconProps) => <Svg {...p}><circle cx="8" cy="8" r="5.6" /><circle cx="8" cy="8" r="2.6" /><path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1" /></Svg>,
  Calendar: (p: IconProps) => <Svg {...p}><rect x="2.5" y="3.2" width="11" height="10.3" rx="1" /><path d="M2.5 6.4h11M5.4 1.8v2.6M10.6 1.8v2.6" /></Svg>,
  Flag: (p: IconProps) => <Svg {...p}><path d="M3.6 14V2.4M3.6 3.2h8.2l-1.6 2.8 1.6 2.8H3.6" /></Svg>,
  Layers: (p: IconProps) => <Svg {...p}><path d="m8 2.2 5.6 2.9L8 8 2.4 5.1z" /><path d="m2.4 8 5.6 2.9L13.6 8M2.4 10.9l5.6 2.9 5.6-2.9" /></Svg>,
  Scale: (p: IconProps) => <Svg {...p}><path d="M8 2.6v10.8M4 4.6h8M2 10c0-1.2 1.2-3.6 2-5.2C4.8 6.4 6 8.8 6 10a2 2 0 0 1-4 0zM10 10c0-1.2 1.2-3.6 2-5.2 .8 1.6 2 4 2 5.2a2 2 0 0 1-4 0zM5.6 13.4h4.8" /></Svg>,
  Book: (p: IconProps) => <Svg {...p}><path d="M2.8 3.4c1.8-.9 3.6-.9 5.2 0v9.2c-1.6-.9-3.4-.9-5.2 0z" /><path d="M13.2 3.4c-1.8-.9-3.6-.9-5.2 0v9.2c1.6-.9 3.4-.9 5.2 0z" /></Svg>,
  Vote: (p: IconProps) => <Svg {...p}><path d="M2.6 9.6 8 12.4l5.4-2.8M2.6 6.8 8 9.6l5.4-2.8M8 2 2.6 4.8 8 7.6l5.4-2.8z" /></Svg>,
  Menu: (p: IconProps) => <Svg {...p}><path d="M2.6 4.4h10.8M2.6 8h10.8M2.6 11.6h10.8" /></Svg>,
  Sun: (p: IconProps) => <Svg {...p}><circle cx="8" cy="8" r="3" /><path d="M8 1.4v1.4M8 13.2v1.4M14.6 8h-1.4M2.8 8H1.4M12.7 3.3l-1 1M4.3 11.7l-1 1M12.7 12.7l-1-1M4.3 4.3l-1-1" /></Svg>,
  Moon: (p: IconProps) => <Svg {...p}><path d="M13 9.4A5.6 5.6 0 0 1 6.6 3a5.6 5.6 0 1 0 6.4 6.4z" /></Svg>,
  Dot: (p: IconProps) => <Svg {...p}><circle cx="8" cy="8" r="2.6" fill="currentColor" stroke="none" /></Svg>,
  Drag: (p: IconProps) => <Svg {...p}><circle cx="6" cy="4" r=".9" fill="currentColor" stroke="none" /><circle cx="10" cy="4" r=".9" fill="currentColor" stroke="none" /><circle cx="6" cy="8" r=".9" fill="currentColor" stroke="none" /><circle cx="10" cy="8" r=".9" fill="currentColor" stroke="none" /><circle cx="6" cy="12" r=".9" fill="currentColor" stroke="none" /><circle cx="10" cy="12" r=".9" fill="currentColor" stroke="none" /></Svg>,
};

export type IconName = keyof typeof Icon;

/** The Meridian mark: a meridian line crossing a sphere. */
export function MeridianMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.6" />
      <ellipse cx="12" cy="12" rx="4.1" ry="9.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.8 12h18.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.9" fill="currentColor" />
    </svg>
  );
}
