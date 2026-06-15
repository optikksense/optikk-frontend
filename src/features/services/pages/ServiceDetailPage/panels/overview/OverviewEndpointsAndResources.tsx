import { ENDPOINT_HEALTH_THRESHOLDS, classifyHealth } from "@shared/constants/healthThresholds";
import { useEffect, useMemo, useState } from "react";
import { fmtNum } from "../../formatters";
import { useServiceHosts } from "../../hooks/useServiceHosts";
import { useTopEndpoints } from "../../hooks/useTopEndpoints";

export function OverviewEndpointsAndResources({ serviceName }: { serviceName: string }) {
  const [page, setPage] = useState(0);
  const [cursors, setCursors] = useState<Record<number, string>>({});
  const cursor = page > 0 ? cursors[page - 1] : undefined;

  const endpointsQ = useTopEndpoints(serviceName, 12, cursor);
  const hostsQ = useServiceHosts(serviceName);

  const loading = endpointsQ.isPending || hostsQ.isPending;

  const results = endpointsQ.data?.results ?? [];
  const hasMore = endpointsQ.data?.pageInfo?.hasMore ?? false;
  const nextCursor = endpointsQ.data?.pageInfo?.nextCursor;

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

  // Compute maximum resource utilization across the fleet of hosts/pods
  const resourceMetrics = useMemo(() => {
    const list = hostsQ.data ?? [];
    if (list.length === 0) {
      return { maxCpu: 0, maxMem: 0, totalPods: 0 };
    }

    const cpuPcts = list.map((h) => h.cpu);
    const memPcts = list.map((h) => h.mem);

    return {
      maxCpu: Math.max(...cpuPcts),
      maxMem: Math.max(...memPcts),
      totalPods: list.length,
    };
  }, [hostsQ.data]);

  const renderLatencyDelta = (val: number | null) => {
    if (val == null || Number.isNaN(val) || val === 0) {
      return <span className="font-mono text-[11.5px] text-foreground-muted">0%</span>;
    }
    const pct = val * 100;
    const sign = pct > 0 ? "+" : "";
    const color = pct > 0 ? "text-[var(--err)]" : "text-[var(--ok)]";
    return (
      <span className={`font-mono font-semibold text-[11.5px] ${color}`}>
        {sign}
        {pct.toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="h-6 w-36 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-[220px] animate-pulse rounded bg-muted" />
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="h-6 w-36 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-[220px] animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  const endpoints = results;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Top Endpoints */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm lg:col-span-2">
        <div className="mb-4">
          <h3 className="font-semibold text-[14px] text-foreground">Top endpoints</h3>
          <p className="mt-0.5 text-[12px] text-foreground-muted">
            Emitted HTTP endpoints, sorted by request volume
          </p>
        </div>

        {endpoints.length === 0 ? (
          <div className="py-8 text-center text-[12.5px] text-foreground-muted">
            No endpoints captured for this service.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-border/60 border-b font-semibold text-[10px] text-foreground-muted uppercase tracking-wider">
                  <th className="px-3 py-2 pl-0">Endpoint</th>
                  <th className="px-3 py-2 text-right">Hits</th>
                  <th className="px-3 py-2 text-right">Errors</th>
                  <th className="px-3 py-2 text-right">P99</th>
                  <th className="px-3 py-2 text-right">Latency vs 1h ago</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((r, i) => {
                  const method = r.http_route ? (r.operation_name.split(" ")[0] ?? "HTTP") : "RPC";
                  const route = r.http_route || r.operation_name;

                  return (
                    <tr
                      key={i}
                      className="border-border/40 border-b last:border-b-0 hover:bg-muted/10"
                    >
                      <td className="px-3 py-3 pl-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-1.5 py-0.5 font-bold font-mono text-[9px] ${
                              method === "POST" || method === "PUT"
                                ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                                : "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                            }`}
                          >
                            {method}
                          </span>
                          <span className="max-w-[200px] truncate font-mono font-semibold text-[12px] text-foreground">
                            {route}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-[12.5px] tabular-nums">
                        {fmtNum(r.total_count)}
                      </td>
                      <td
                        className={`px-3 py-3 text-right font-mono font-semibold text-[12.5px] tabular-nums ${
                          classifyHealth(r.error_rate, ENDPOINT_HEALTH_THRESHOLDS) === "unhealthy"
                            ? "text-[var(--err)]"
                            : classifyHealth(r.error_rate, ENDPOINT_HEALTH_THRESHOLDS) ===
                                "degraded"
                              ? "text-[var(--warn)]"
                              : "text-foreground-muted"
                        }`}
                      >
                        {r.error_rate.toFixed(2)}%
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-semibold text-[12.5px] tabular-nums">
                        {Math.round(r.p99_ms)}ms
                      </td>
                      <td className="px-3 py-3 text-right">
                        {renderLatencyDelta(r.p99_delta_pct)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

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
        )}
      </div>

      {/* Resource Consumption */}
      <div className="flex flex-col rounded-lg border border-border bg-card p-5 shadow-sm">
        <h3 className="font-semibold text-[14px] text-foreground">Resource use · max fleet</h3>
        <p className="mt-0.5 mb-4 text-[12px] text-foreground-muted">
          Utilization across {resourceMetrics.totalPods} containers/pods
        </p>

        {resourceMetrics.totalPods === 0 ? (
          <div className="my-auto text-center text-[12.5px] text-foreground-muted">
            No resource statistics available.
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-center gap-5">
            {/* CPU */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-[var(--warn)]" />
                  <span className="font-medium text-foreground">CPU</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="font-bold font-mono text-[14px] text-foreground">
                    {Math.round(resourceMetrics.maxCpu)}
                  </span>
                  <span className="font-medium text-[11px] text-foreground-muted">%</span>
                </div>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-muted">
                <div
                  className="h-full rounded transition-all duration-300"
                  style={{
                    width: `${Math.round(resourceMetrics.maxCpu)}%`,
                    backgroundColor:
                      resourceMetrics.maxCpu >= 90
                        ? "var(--err)"
                        : resourceMetrics.maxCpu >= 70
                          ? "var(--warn)"
                          : "var(--ok)",
                  }}
                />
              </div>
            </div>

            {/* Memory */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-[var(--chart-1)]" />
                  <span className="font-medium text-foreground">Memory</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="font-bold font-mono text-[14px] text-foreground">
                    {Math.round(resourceMetrics.maxMem)}
                  </span>
                  <span className="font-medium text-[11px] text-foreground-muted">%</span>
                </div>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-muted">
                <div
                  className="h-full rounded transition-all duration-300"
                  style={{
                    width: `${Math.round(resourceMetrics.maxMem)}%`,
                    backgroundColor:
                      resourceMetrics.maxMem >= 90
                        ? "var(--err)"
                        : resourceMetrics.maxMem >= 70
                          ? "var(--warn)"
                          : "var(--chart-1)",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
