import { getErrorGroupLatestOccurrence } from "@shared/api/errors";
import { PaginationFooter } from "@shared/components/table/PaginationFooter";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { parseStackFrames } from "@shared/utils/errorParsers";
import { fmtNum, relativeTimeFromIso } from "@shared/utils/metricFormatters";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServiceErrors } from "../../hooks/useServiceErrors";

export function OverviewErrors({ serviceName }: { serviceName: string }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [cursors, setCursors] = useState<Record<number, string>>({});
  const cursor = page > 0 ? cursors[page - 1] : undefined;

  const errorsQ = useServiceErrors(serviceName, 12, cursor);

  const results = errorsQ.data?.results ?? [];
  const hasMore = errorsQ.data?.pageInfo?.hasMore ?? false;
  const nextCursor = errorsQ.data?.pageInfo?.nextCursor;

  const handleNext = () => {
    if (hasMore) {
      if (nextCursor) {
        setCursors((prev) => ({ ...prev, [page]: nextCursor }));
      }
      setPage((p) => p + 1);
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      setPage((p) => p - 1);
    }
  };

  const errorsList = results;
  const topGroupId = errorsList[0]?.group_id ?? "";

  // Latest occurrence of the top error group (to get its real stacktrace)
  const detailQ = useTimeRangeQuery(
    "service-detail.error-group-top-latest",
    (_tenant, start, end) => getErrorGroupLatestOccurrence(topGroupId, start, end),
    { extraKeys: [topGroupId], enabled: Boolean(topGroupId) }
  );

  const totalErrors = useMemo(() => {
    return errorsList.reduce((sum, e) => sum + e.error_count, 0);
  }, [errorsList]);

  const stackFrames = useMemo(() => {
    return parseStackFrames(detailQ.data?.stacktrace);
  }, [detailQ.data]);

  const handleRowClick = (groupId: string) => {
    navigate({ to: `/errors/${encodeURIComponent(groupId)}` });
  };

  if (errorsQ.isPending) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-44 animate-pulse rounded bg-muted lg:col-span-2" />
          <div className="h-44 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-[14px] text-foreground">Errors · breakdown</h3>
        <p className="mt-0.5 text-[12px] text-foreground-muted">
          Emitted exception events, grouped by signature
        </p>
      </div>

      {errorsList.length === 0 ? (
        <div className="py-8 text-center text-[12.5px] text-foreground-muted">
          No error exceptions logged in this window.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Error Groups Table */}
          <div className="flex flex-col justify-between overflow-x-auto lg:col-span-2">
            <div>
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-border/60 border-b font-semibold text-[10px] text-foreground-muted uppercase tracking-wider">
                    <th className="px-3 py-2 pl-0">Error type</th>
                    <th className="px-3 py-2 text-right">Events</th>
                    <th className="px-3 py-2 text-right">%</th>
                    <th className="px-3 py-2 text-right">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {errorsList.map((e) => {
                    const pct = totalErrors > 0 ? (e.error_count / totalErrors) * 100 : 0;
                    return (
                      <tr
                        key={e.group_id}
                        onClick={() => handleRowClick(e.group_id)}
                        className="cursor-pointer border-border/40 border-b last:border-b-0 hover:bg-muted/10"
                      >
                        <td className="px-3 py-3 pl-0">
                          <div>
                            <div className="font-mono font-semibold text-[12.5px] text-foreground leading-tight">
                              {e.group_id}
                            </div>
                            <div className="mt-0.5 font-mono text-[10.5px] text-foreground-muted">
                              {e.operation_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-semibold text-foreground tabular-nums">
                          {fmtNum(e.error_count)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-2 text-right">
                            <div className="h-1.5 w-12 shrink-0 overflow-hidden rounded bg-muted">
                              <div
                                className="h-full rounded bg-[var(--err)]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-8 shrink-0 font-mono text-[11px] text-foreground-muted">
                              {pct.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-[11px] text-foreground-muted">
                          {relativeTimeFromIso(e.last_occurrence)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <PaginationFooter
              page={page}
              hasMore={hasMore}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </div>

          {/* Stacktrace card */}
          <div className="flex flex-col justify-center rounded-md border border-border/40 bg-muted/20 p-4 shadow-inner">
            <h4 className="mb-3 font-mono font-semibold text-[9.5px] text-foreground-muted uppercase tracking-wider">
              Top stack frames · {topGroupId}
            </h4>

            {detailQ.isPending && (
              <div className="flex flex-1 flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 animate-pulse rounded bg-muted" />
                ))}
              </div>
            )}

            {!detailQ.isPending && stackFrames.length === 0 && (
              <div className="my-auto text-center text-[11px] text-foreground-muted">
                Stacktrace details are empty or not captured.
              </div>
            )}

            {!detailQ.isPending && stackFrames.length > 0 && (
              <div className="flex flex-col gap-2.5">
                {stackFrames.map((f, i, arr) => (
                  <div
                    key={i}
                    className={`flex flex-col gap-0.5 pb-2 last:pb-0 ${
                      i < arr.length - 1 ? "border-border/30 border-b" : ""
                    }`}
                  >
                    <span className="block truncate font-mono font-semibold text-[11.5px] text-foreground">
                      {f.method}
                    </span>
                    {f.file && (
                      <div className="truncate font-mono text-[10px] text-foreground-muted">
                        {f.file}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
