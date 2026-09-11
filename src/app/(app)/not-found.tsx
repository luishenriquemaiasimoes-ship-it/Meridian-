import Link from 'next/link';
import { EmptyState, PageHeader, Panel } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';

/**
 * Reached by a link to something that no longer exists — a note or memo that
 * was deleted, a ticker that is not covered. It keeps the shell, so the reader
 * is still inside the application rather than dropped onto a bare error page.
 */
export default function NotFound() {
  return (
    <>
      <PageHeader
        title="Not here"
        subtitle="This page does not exist, or what it pointed at has been deleted."
      />
      <Panel>
        <EmptyState
          icon={<Icon.Search size={22} />}
          title="Nothing at this address"
          description="A note, memo or model that has been deleted keeps its record in the audit trail, but no longer has a page. If you followed a link from somewhere in the application, that is the likely reason."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/home" className="btn-primary text-xs">Back to home</Link>
              <Link href="/companies" className="btn-secondary text-xs">Browse companies</Link>
              <Link href="/audit" className="btn-secondary text-xs">Audit trail</Link>
            </div>
          }
        />
      </Panel>
    </>
  );
}
