import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { ROUTES } from "@/shared/constants/routes";

import type { ErrorGroup } from "@shared/api/errors";

import { PanelCard } from "@shared/components/ui/PanelCard";
import { fmtNum, relativeTimeFromIso } from "@shared/utils/metricFormatters";
import { useServiceErrors } from "../hooks/useServiceErrors";

function ErrorRow({ row }: { row: ErrorGroup }) {
  const detail = ROUTES.errorGroupDetail.replace("$groupId", encodeURIComponent(row.groupId));
  return (
    <li className="flex items-start justify-between gap-3 border-border border-t px-4 py-3 first:border-t-0">
      <div className="min-w-0 flex-1">
        <Link
          to={detail}
          className="block truncate font-medium font-mono text-[12px] text-[var(--color-error,#ef4444)] hover:underline"
        >
          {row.operationName || row.statusMessage || row.groupId}
        </Link>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 text-[11px] text-foreground-muted">
          {row.statusMessage && (
            <span className="truncate text-foreground-secondary">{row.statusMessage}</span>
          )}
          {row.httpStatusCode > 0 && <span>http {row.httpStatusCode}</span>}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="font-semibold text-[15px] text-foreground tabular-nums">
          {fmtNum(row.errorCount)}
        </div>
        <div className="text-[10px] text-foreground-muted">
          last {relativeTimeFromIso(row.lastOccurrence)}
        </div>
      </div>
    </li>
  );
}

interface ErrorsListPanelProps {
  readonly serviceName: string;
  readonly title?: string;
}

export function ErrorsListPanel({ serviceName, title = "Error catalog" }: ErrorsListPanelProps) {
  const [page, setPage] = useState(0);
  const [cursors, setCursors] = useState<Record<number, string>>({});
  const cursor = page > 0 ? cursors[page - 1] : undefined;

  const errorsQ = useServiceErrors(serviceName, 12, cursor);
  const results = errorsQ.data?.results ?? [];
  const hasMore = errorsQ.data?.pageInfo?.hasMore ?? false;
  const nextCursor = errorsQ.data?.pageInfo?.nextCursor;

  useEffect(() => {
    if (nextCursor) {
      setCursors((prev) => ({ ...prev, [page]: nextCursor }));
    }
  }, [nextCursor, page]);

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
    <PanelCard
      title={title}
      subtitle={errorsQ.data ? `${results.length} unique · last 60m` : undefined}
      padded={false}
    >
      {results.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12px] text-foreground-muted">
          {errorsQ.isPending ? "Loading…" : "No errors in selected range."}
        </div>
      ) : (
        <div className="flex flex-col">
          <ul>
            {results.map((row) => (
              <ErrorRow key={row.groupId} row={row} />
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between border-border/40 border-t bg-muted/10 px-4 py-3">
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
      )}
    </PanelCard>
  );
}
