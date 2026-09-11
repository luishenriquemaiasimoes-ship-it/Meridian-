'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button, EmptyState, PageHeader, Panel } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';

/**
 * A screen that failed to render. It says so plainly and offers a retry rather
 * than showing a half-built page, because a partially rendered financial screen
 * is worse than no screen at all.
 */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[meridian:render]', error);
  }, [error]);

  return (
    <>
      <PageHeader title="This screen did not load" subtitle="Nothing was changed. The error has been logged on the server." />
      <Panel>
        <EmptyState
          icon={<Icon.Warning size={22} />}
          title="Something went wrong building this page"
          description={
            error.digest
              ? `The server recorded this as ${error.digest}. Retrying is safe — no data was written.`
              : 'Retrying is safe — no data was written.'
          }
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="primary" icon={<Icon.Refresh size={13} />} onClick={reset}>Try again</Button>
              <Link href="/home" className="btn-secondary text-xs">Back to home</Link>
            </div>
          }
        />
      </Panel>
    </>
  );
}
