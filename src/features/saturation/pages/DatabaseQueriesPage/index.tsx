import { Database } from "lucide-react";

import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";

import { QueryDetailDrawer } from "./QueryDetailDrawer";
import { QueryListTable } from "./QueryListTable";
import { useDatabaseQueriesPage } from "./useDatabaseQueriesPage";

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="rounded-md border border-[color-mix(in_oklch,var(--color-error),transparent_65%)] bg-[var(--color-error-subtle)] px-3 py-2 text-[var(--color-error)] text-sm"
      role="alert"
    >
      Could not load slow queries: {message}
    </div>
  );
}

function LoadingHint() {
  return (
    <div className="px-3 py-6 text-center text-[12px] text-[var(--text-muted)]">
      Querying ClickHouse…
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="px-3 py-6 text-center text-[12px] text-[var(--text-muted)]">
      No slow queries in this window.
    </div>
  );
}

export default function DatabaseQueriesPage(): JSX.Element {
  const model = useDatabaseQueriesPage();
  const { patternsQuery, selectedQuery, selectQuery } = model;
  const rows = patternsQuery.data ?? [];

  return (
    <PageShell>
      <PageHeader
        title="Top queries"
        subtitle="Slow patterns ranked by p99 latency. Click a row to inspect calls, errors, and percentile breakdown."
        icon={<Database size={24} />}
      />

      {patternsQuery.error ? (
        <ErrorBanner message={(patternsQuery.error as Error).message ?? "unknown"} />
      ) : null}

      <PageSurface padding="lg">
        {patternsQuery.isPending && rows.length === 0 ? (
          <LoadingHint />
        ) : rows.length === 0 ? (
          <EmptyHint />
        ) : (
          <QueryListTable rows={rows} onSelect={selectQuery} />
        )}
      </PageSurface>

      <QueryDetailDrawer query={selectedQuery} onClose={() => selectQuery(null)} />
    </PageShell>
  );
}
