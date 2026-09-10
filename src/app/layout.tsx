import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import '@/styles/globals.css';
import { ToastProvider } from '@/components/ui/primitives';

export const metadata: Metadata = {
  title: {
    default: 'MERIDIAN — Investment Intelligence',
    template: '%s · MERIDIAN',
  },
  description:
    'AI-powered investment intelligence for equity research and asset management. Research companies, build valuations, monitor theses and manage portfolios from one institutional-grade workspace.',
  applicationName: 'MERIDIAN',
  authors: [{ name: 'MERIDIAN' }],
  keywords: ['equity research', 'valuation', 'DCF', 'portfolio management', 'investment intelligence'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f6f4' },
    { media: '(prefers-color-scheme: dark)', color: '#090b0f' },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const theme = jar.get('meridian_theme')?.value === 'light' ? 'light' : 'dark';

  return (
    <html lang="pt-BR" data-theme={theme} suppressHydrationWarning>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
