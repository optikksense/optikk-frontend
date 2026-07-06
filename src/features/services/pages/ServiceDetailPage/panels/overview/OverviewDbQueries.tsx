import { useState } from "react";
import { useTopDBQueries } from "../../hooks/useTopDBQueries";
import { type TopOpRow, TopOpsTable } from "./TopOpsTable";

export function OverviewDbQueries({ serviceName }: { serviceName: string }) {
  const [page, setPage] = useState(0);
  const [cursors, setCursors] = useState<Record<number, string>>({});
  const cursor = page > 0 ? cursors[page - 1] : undefined;

  const queriesQ = useTopDBQueries(serviceName, 12, cursor);

  const results = queriesQ.data?.results ?? [];
  const hasMore = queriesQ.data?.pageInfo?.hasMore ?? false;
  const nextCursor = queriesQ.data?.pageInfo?.nextCursor;

  const handleNext = () => {
    if (hasMore) {
      if (nextCursor) {
        setCursors((prev) => ({ ...prev, [page]: nextCursor }));
      }
      setPage((p) => p + 1);
    }
  };
  const handlePrev = () => {
    if (page > 0) setPage((p) => p - 1);
  };

  if (queriesQ.isPending) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="h-6 w-36 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-[220px] animate-pulse rounded bg-muted" />
      </div>
    );
  }

  const rows: TopOpRow[] = results.map((r, i) => ({
    key: `${r.operation_name}-${i}`,
    badge: (r.db_system || "DB").toUpperCase(),
    badgeVariant: "brand",
    label: r.operation_name,
    total_count: r.total_count,
    error_rate: r.error_rate,
    p99_ms: r.p99_ms,
    p99_delta_pct: r.p99_delta_pct,
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-[14px] text-foreground">Top DB queries</h3>
        <p className="mt-0.5 text-[12px] text-foreground-muted">
          Outbound database calls, sorted by request volume
        </p>
      </div>

      <TopOpsTable
        rows={rows}
        labelHeader="Query"
        emptyText="No database queries captured for this service."
        page={page}
        hasMore={hasMore}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}
