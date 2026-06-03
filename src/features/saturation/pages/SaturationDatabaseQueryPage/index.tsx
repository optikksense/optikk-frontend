import { useParams } from "@tanstack/react-router";

import { PageShell } from "@shared/components/ui";

import { QueryDetailHeader } from "./QueryDetailHeader";
import { QueryDetailKpiStrip } from "./QueryDetailKpiStrip";
import { useDatabaseQueryDetail } from "./hooks/useDatabaseQueryDetail";

// Real-data-only drill-in for one normalized query fingerprint. The design's
// execution plan, rows/call, cache-hit, latency/calls charts, and recent-
// executions table are omitted — no backend source exists for them.
export default function SaturationDatabaseQueryPage(): JSX.Element {
  const params = useParams({ strict: false });
  const queryId = typeof params.queryId === "string" ? params.queryId : "";
  const { row, isPending } = useDatabaseQueryDetail(queryId);

  return (
    <PageShell>
      {row ? (
        <div className="flex flex-col gap-4">
          <QueryDetailHeader row={row} />
          <QueryDetailKpiStrip row={row} />
        </div>
      ) : (
        <div className="rounded-md border border-border bg-card p-4 text-[12px] text-foreground-muted">
          {isPending
            ? "Loading…"
            : "This query is not among the top patterns in the current time range."}
        </div>
      )}
    </PageShell>
  );
}
