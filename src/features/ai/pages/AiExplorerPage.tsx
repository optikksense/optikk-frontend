/**
 * LLM Traces Explorer — Faceted span list with filters.
 */
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useTimeRange, useTeamId, useRefreshKey } from "@app/store/appStore";
import { resolveTimeRangeBounds } from "@/types";
import { aiService } from "../api/aiService";
import type { AiExplorerFilterParams } from "../types";
import styles from "./AiOverviewPage.module.css";

export default function AiExplorerPage() {
  const timeRange = useTimeRange();
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const { startTime: startMs, endTime: endMs } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AiExplorerFilterParams>({ limit: 50, offset: 0, sort: "timestamp", sortDir: "desc" });

  const queryKeyBase = [teamId, startMs, endMs, refreshKey, filters];

  const spans = useQuery({
    queryKey: ["ai-explorer-spans", ...queryKeyBase],
    queryFn: () => aiService.getSpans(startMs, endMs, filters),
  });

  const summary = useQuery({
    queryKey: ["ai-explorer-summary", ...queryKeyBase],
    queryFn: () => aiService.getExplorerSummary(startMs, endMs, filters),
  });

  const facets = useQuery({
    queryKey: ["ai-explorer-facets", teamId, startMs, endMs, refreshKey],
    queryFn: () => aiService.getFacets(startMs, endMs),
  });

  const histogram = useQuery({
    queryKey: ["ai-explorer-histogram", ...queryKeyBase],
    queryFn: () => aiService.getHistogram(startMs, endMs, filters),
  });

  const s = summary.data;

  return (
    <div className={styles.page}>
      {/* Summary Bar */}
      <div className={styles.statGrid}>
        <StatCard label="Spans" value={s?.totalSpans ?? 0} />
        <StatCard label="Errors" value={s?.errorCount ?? 0} />
        <StatCard label="Avg Latency" value={`${(s?.avgLatencyMs ?? 0).toFixed(0)}ms`} />
        <StatCard label="P95" value={`${(s?.p95Ms ?? 0).toFixed(0)}ms`} />
        <StatCard label="Total Tokens" value={formatNumber(s?.totalTokens ?? 0)} />
        <StatCard label="Models" value={s?.uniqueModels ?? 0} />
      </div>

      {/* Histogram */}
      {histogram.data && histogram.data.length > 0 && (
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Request Volume</h3>
          <div style={{ display: "flex", gap: "1px", height: 48, alignItems: "flex-end" }}>
            {histogram.data.map((h, i) => {
              const max = Math.max(...histogram.data!.map((p) => p.count), 1);
              return <div key={i} style={{ flex: 1, height: `${(h.count / max) * 100}%`, background: "#6366f1", borderRadius: "2px 2px 0 0", minWidth: 2 }} title={`${h.count} spans`} />;
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="Filter by trace ID..."
          value={filters.traceId ?? ""}
          onChange={(e) => setFilters((p) => ({ ...p, traceId: e.target.value || undefined }))}
        />
        {facets.data?.models.values.slice(0, 5).map((f) => (
          <button
            key={f.value}
            className={`${styles.filterChip} ${filters.model === f.value ? styles.filterChipActive : ""}`}
            onClick={() => setFilters((p) => ({ ...p, model: p.model === f.value ? undefined : f.value }))}
          >
            {f.value} ({f.count})
          </button>
        ))}
        <button
          className={`${styles.filterChip} ${filters.status === "error" ? styles.filterChipActive : ""}`}
          onClick={() => setFilters((p) => ({ ...p, status: p.status === "error" ? undefined : "error" }))}
        >
          Errors only
        </button>
      </div>

      {/* Span Table */}
      <div className={styles.panel}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Service</th>
                <th>Model</th>
                <th>Operation</th>
                <th>Duration</th>
                <th>In Tok</th>
                <th>Out Tok</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(spans.data ?? []).map((span) => (
                <tr key={span.spanId} className={styles.clickRow} onClick={() => navigate({ to: `/ai-explorer/${span.spanId}` as any })}>
                  <td style={{ fontSize: 11, fontVariantNumeric: "tabular-nums" }}>{new Date(span.timestamp).toLocaleTimeString()}</td>
                  <td>{span.serviceName}</td>
                  <td className={styles.mono}>{span.model}</td>
                  <td>{span.operationType || span.operationName}</td>
                  <td>{span.durationMs.toFixed(0)}ms</td>
                  <td>{formatNumber(span.inputTokens)}</td>
                  <td>{formatNumber(span.outputTokens)}</td>
                  <td>{span.hasError ? <span className={styles.errorText}>Error</span> : <span style={{ color: "#22c55e" }}>OK</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {spans.data?.length === 0 && <div className={styles.emptyState}>No LLM spans found for this time range.</div>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
