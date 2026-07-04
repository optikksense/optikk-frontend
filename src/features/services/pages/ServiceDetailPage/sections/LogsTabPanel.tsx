import { LogDetailDrawer } from "@/features/log/components/detail/LogDetailDrawer";
import { LogsTable } from "@/features/log/components/table/LogsTable";
import { useEffect, useState } from "react";
import { useServiceLogs } from "../hooks/useServiceLogs";

export function LogsTabPanel({ serviceName }: { serviceName: string }) {
  const [page, setPage] = useState(0);
  const [cursors, setCursors] = useState<Record<number, string>>({});
  const cursor = page > 0 ? cursors[page - 1] : undefined;

  const logsQ = useServiceLogs(serviceName, 12, cursor);
  const results = logsQ.data?.results ?? [];
  const hasMore = logsQ.data?.hasMore ?? false;
  const nextCursor = logsQ.data?.cursor;

  useEffect(() => {
    if (nextCursor) {
      setCursors((prev) => ({ ...prev, [page]: nextCursor }));
    }
  }, [nextCursor, page]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleRowClick = (row: { id: string }) => {
    setSelectedId((prev) => (prev === row.id ? null : row.id));
  };

  const handleNext = () => {
    if (hasMore) {
      setPage((p) => p + 1);
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      setPage((p) => p - 1);
    }
  };

  return (
    <div className="flex min-h-[500px] flex-1 flex-col overflow-hidden">
      <div className="flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
        <div>
          <h3 className="font-semibold text-[14px] text-foreground">Service Logs</h3>
          <p className="mt-0.5 text-[12px] text-foreground-muted">
            Recent logs emitted by the {serviceName} service
          </p>
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <LogsTable
            rows={results}
            loading={logsQ.isPending}
            selectedId={selectedId}
            onRowClick={handleRowClick}
          />
        </div>

        <div className="mt-4 flex items-center justify-between border-border/40 border-t pt-4">
          <div className="text-[11.5px] text-foreground-muted">Showing page {page + 1}</div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={handlePrev}
              className="inline-flex h-[26px] items-center gap-1 rounded-md border border-border bg-card px-3 font-semibold text-[11px] text-foreground-secondary hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!hasMore}
              onClick={handleNext}
              className="inline-flex h-[26px] items-center gap-1 rounded-md border border-border bg-card px-3 font-semibold text-[11px] text-foreground-secondary hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <LogDetailDrawer
        logId={selectedId ?? ""}
        open={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
