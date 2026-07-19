import type { TraceRecord } from "@shared/api/traces/schemas";
import { PaginationFooter } from "@shared/components/table/PaginationFooter";
import { buildTraceDetailHref } from "@shared/observability/deepLinks";
import { relativeTimeFromIso } from "@shared/utils/metricFormatters";
import { useNavigate } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { useRecentTraces } from "../../hooks/useRecentTraces";

const FILTER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "errors", label: "Errors" },
  { id: "p95", label: "> p95" },
  { id: "p99", label: "> p99" },
] as const;
export function OverviewRecentTraces({ serviceName }: { serviceName: string }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [cursors, setCursors] = useState<Record<number, string>>({});
  const cursor = page > 0 ? cursors[page - 1] : undefined;

  const tracesQ = useRecentTraces(serviceName, 12, cursor);
  const [filter, setFilter] = useState<"all" | "errors" | "p95" | "p99">("all");

  const loading = tracesQ.isPending;
  const traces = tracesQ.data?.traces ?? [];
  const hasMore = tracesQ.data?.hasMore ?? false;
  const nextCursor = tracesQ.data?.nextCursor;

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

  // Calculate p95 and p99 dynamically from the traces dataset
  const { p95Threshold, p99Threshold, maxDuration } = useMemo(() => {
    if (traces.length === 0) {
      return { p95Threshold: 0, p99Threshold: 0, maxDuration: 1 };
    }

    const sortedDurations = [...traces].map((t) => t.durationMs).sort((a, b) => a - b);
    const maxDur = Math.max(...sortedDurations, 1);

    const p95Idx = Math.min(sortedDurations.length - 1, Math.floor(sortedDurations.length * 0.95));
    const p99Idx = Math.min(sortedDurations.length - 1, Math.floor(sortedDurations.length * 0.99));

    return {
      p95Threshold: sortedDurations[p95Idx] ?? 0,
      p99Threshold: sortedDurations[p99Idx] ?? 0,
      maxDuration: maxDur,
    };
  }, [traces]);

  const filteredTraces = useMemo(() => {
    return traces.filter((t) => {
      if (filter === "errors") {
        return t.status === "error";
      }
      if (filter === "p95") {
        return t.durationMs >= p95Threshold;
      }
      if (filter === "p99") {
        return t.durationMs >= p99Threshold;
      }
      return true;
    });
  }, [traces, filter, p95Threshold, p99Threshold]);

  const handleRowClick = (trace: TraceRecord) => {
    navigate({ to: buildTraceDetailHref(trace.traceId) as never });
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="h-6 w-36 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-[220px] animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-[14px] text-foreground">Recent traces</h3>
          <p className="mt-0.5 text-[12px] text-foreground-muted">
            Slow and failed operations in the last 15 minutes
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md bg-muted/60 p-0.5">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilter(opt.id as "all" | "errors" | "p95" | "p99")}
                className={`rounded px-2.5 py-1 font-semibold text-[11px] capitalize ${
                  filter === opt.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: "/traces" })}
            className="inline-flex h-[26px] items-center gap-1 rounded-md border border-border bg-card px-2.5 font-medium text-[11.5px] text-foreground-secondary transition-colors hover:bg-muted/50"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Open Trace Explorer</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-border/60 border-b font-semibold text-[10px] text-foreground-muted uppercase tracking-wider">
              <th className="px-3 py-2.5 pl-0">Operation</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5 text-right">Duration</th>
              <th className="px-3 py-2.5">Latency</th>
              <th className="px-3 py-2.5 text-right">Started</th>
            </tr>
          </thead>
          <tbody>
            {filteredTraces.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[12.5px] text-foreground-muted">
                  No recent traces match the selected filter.
                </td>
              </tr>
            ) : (
              filteredTraces.map((t, i) => {
                const method = t.httpMethod ?? "POST";
                const route = t.operationName;
                const barPercent = Math.max(1, Math.min(100, (t.durationMs / maxDuration) * 100));

                return (
                  <tr
                    key={i}
                    onClick={() => handleRowClick(t)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleRowClick(t);
                      }
                    }}
                    tabIndex={0}
                    className="cursor-pointer border-border/40 border-b last:border-b-0 hover:bg-muted/10"
                  >
                    <td className="px-3 py-3 pl-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[var(--brand-soft)] px-1.5 py-0.5 font-bold font-mono text-[9px] text-[var(--brand)]">
                          {method}
                        </span>
                        <span className="font-mono font-semibold text-[12px] text-foreground">
                          {route}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-[9.5px] uppercase tracking-wider ${
                          t.status === "error"
                            ? "bg-[var(--color-error-bg)] text-[var(--color-error)]"
                            : "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            t.status === "error"
                              ? "bg-[var(--color-error)]"
                              : "bg-[var(--color-success)]"
                          }`}
                        />
                        {t.status}
                      </span>
                    </td>
                    <td
                      className={`px-3 py-3 text-right font-bold font-mono text-[12px] tabular-nums ${
                        t.durationMs > p95Threshold
                          ? "text-[var(--err)]"
                          : t.durationMs > 100
                            ? "text-[var(--warn)]"
                            : "text-foreground-secondary"
                      }`}
                    >
                      {t.durationMs >= 1000
                        ? `${(t.durationMs / 1000).toFixed(2)}s`
                        : `${Math.round(t.durationMs)}ms`}
                    </td>
                    <td className="w-[140px] px-3 py-3">
                      <div className="h-1.5 w-full overflow-hidden rounded bg-muted">
                        <div
                          className="h-full rounded opacity-80"
                          style={{
                            width: `${barPercent}%`,
                            backgroundColor: t.status === "error" ? "var(--err)" : "var(--chart-1)",
                          }}
                        />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-[12px] text-foreground-muted">
                      {relativeTimeFromIso(t.startTime)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <PaginationFooter page={page} hasMore={hasMore} onPrev={handlePrev} onNext={handleNext} />
    </div>
  );
}
