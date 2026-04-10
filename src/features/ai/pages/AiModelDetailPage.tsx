/**
 * AI Model Detail — Deep-dive into a single model's performance.
 *
 * Improvements over previous version:
 * - Timeseries rendered as charts (not raw tables)
 * - Latency distribution as horizontal bar chart
 * - Cost panel with model-specific breakdown
 * - Error patterns for this specific model
 */
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTimeRange, useTeamId, useRefreshKey } from "@app/store/appStore";
import { resolveTimeRangeBounds } from "@/types";
import { aiService } from "../api/aiService";
import { AiStatCard } from "../components/AiStatCard";
import { AiMiniChart, AiMultiSeriesChart } from "../components/AiMiniChart";
import { formatNumber, formatMs, formatCost, formatPercent } from "../utils/formatters";
import styles from "./AiOverviewPage.module.css";

export default function AiModelDetailPage() {
  const { model = "" } = useParams({ strict: false });
  const decodedModel = decodeURIComponent(model);
  const timeRange = useTimeRange();
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const { startTime: startMs, endTime: endMs } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);

  const queryBase = [teamId, decodedModel, startMs, endMs, refreshKey];

  const timeseries = useQuery({
    queryKey: ["ai-model-ts", ...queryBase],
    queryFn: () => aiService.getModelTimeseries(decodedModel, startMs, endMs),
    enabled: !!decodedModel,
  });

  const latencyDist = useQuery({
    queryKey: ["ai-model-latency-dist", ...queryBase],
    queryFn: () => aiService.getLatencyDistribution(decodedModel, startMs, endMs),
    enabled: !!decodedModel,
  });

  const costSummary = useQuery({
    queryKey: ["ai-model-cost", ...queryBase],
    queryFn: () => aiService.getCostSummary(startMs, endMs, { model: decodedModel }),
    enabled: !!decodedModel,
  });

  const errorPatterns = useQuery({
    queryKey: ["ai-model-errors", ...queryBase],
    queryFn: () => aiService.getErrorPatterns(startMs, endMs, { model: decodedModel }),
    enabled: !!decodedModel,
  });

  const paramImpact = useQuery({
    queryKey: ["ai-model-params", ...queryBase],
    queryFn: () => aiService.getParameterImpact(decodedModel, startMs, endMs),
    enabled: !!decodedModel,
  });

  // Transform timeseries for charts
  const requestChartData = useMemo(
    () => (timeseries.data ?? []).map((t) => ({ timestamp: t.timestamp, value: t.requestCount })),
    [timeseries.data],
  );
  const latencyChartSeries = useMemo(() => [
    { label: "Avg", data: (timeseries.data ?? []).map((t) => ({ timestamp: t.timestamp, value: t.avgLatencyMs })), color: "#6366f1" },
    { label: "P95", data: (timeseries.data ?? []).map((t) => ({ timestamp: t.timestamp, value: t.p95LatencyMs })), color: "#f59e0b" },
  ], [timeseries.data]);
  const tokenChartSeries = useMemo(() => [
    { label: "Input", data: (timeseries.data ?? []).map((t) => ({ timestamp: t.timestamp, value: t.inputTokens })), color: "#3b82f6" },
    { label: "Output", data: (timeseries.data ?? []).map((t) => ({ timestamp: t.timestamp, value: t.outputTokens })), color: "#22c55e" },
  ], [timeseries.data]);
  const errorChartData = useMemo(
    () => (timeseries.data ?? []).map((t) => ({ timestamp: t.timestamp, value: t.errorCount })),
    [timeseries.data],
  );

  // Latency distribution histogram
  const latencyBars = latencyDist.data ?? [];
  const maxBucket = Math.max(...latencyBars.map((b) => b.count), 1);

  // Cost summary
  const cost = costSummary.data;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.panel} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, color: "var(--text-primary, #e8eaf0)" }}>{decodedModel}</h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted, #8b8fa3)" }}>
            Model-level observability: performance, cost, and error analysis.
          </p>
        </div>
      </div>

      {/* Cost stat cards */}
      {cost && (
        <div className={styles.statGrid}>
          <AiStatCard label="Total Cost" value={formatCost(cost.totalCost)} />
          <AiStatCard label="Avg Cost/Req" value={formatCost(cost.avgCostPerRequest)} />
          <AiStatCard label="Total Requests" value={formatNumber(cost.requestCount)} />
          <AiStatCard label="Input Cost" value={formatCost(cost.inputCost)} />
          <AiStatCard label="Output Cost" value={formatCost(cost.outputCost)} />
        </div>
      )}

      {/* Timeseries Charts */}
      <div className={styles.gridTwo}>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Request Rate</h3>
          <AiMiniChart data={requestChartData} color="#6366f1" height={96} label="Requests" formatValue={formatNumber} />
        </div>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Latency Trend</h3>
          <AiMultiSeriesChart series={latencyChartSeries} height={96} />
        </div>
      </div>

      <div className={styles.gridTwo}>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Token Usage</h3>
          <AiMultiSeriesChart series={tokenChartSeries} height={96} />
        </div>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Error Volume</h3>
          <AiMiniChart data={errorChartData} color="#ef4444" height={96} label="Errors" formatValue={formatNumber} />
        </div>
      </div>

      {/* Latency Distribution */}
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Latency Distribution</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {latencyBars.map((bucket) => (
            <div key={bucket.bucketMs} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 80, textAlign: "right", fontSize: 11, color: "var(--text-muted, #8b8fa3)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                {formatMs(bucket.bucketMs)}
              </span>
              <div style={{ flex: 1, height: 10, borderRadius: 3, background: "var(--surface-2, #23263a)", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${(bucket.count / maxBucket) * 100}%`,
                    height: "100%",
                    borderRadius: 3,
                    background: "linear-gradient(90deg, #6366f1, #818cf8)",
                  }}
                />
              </div>
              <span style={{ width: 50, fontSize: 11, color: "var(--text-secondary, #c0c4d4)", fontVariantNumeric: "tabular-nums" }}>
                {formatNumber(bucket.count)}
              </span>
            </div>
          ))}
          {latencyBars.length === 0 && <div className={styles.emptyState} style={{ padding: 24 }}>No latency data available.</div>}
        </div>
      </div>

      {/* Parameter Impact */}
      {(paramImpact.data ?? []).length > 0 && (
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Parameter Impact</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Temperature</th><th>Top P</th><th>Avg Latency</th><th>Avg Tokens</th><th>Error %</th><th>Requests</th></tr></thead>
              <tbody>
                {(paramImpact.data ?? []).map((p, i) => (
                  <tr key={i}>
                    <td className={styles.mono}>{p.temperature.toFixed(2)}</td>
                    <td className={styles.mono}>{p.topP.toFixed(2)}</td>
                    <td>{formatMs(p.avgLatencyMs)}</td>
                    <td>{formatNumber(p.avgTokens)}</td>
                    <td>{formatPercent(p.errorRate)}</td>
                    <td>{formatNumber(p.requestCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Error Patterns for this model */}
      {(errorPatterns.data ?? []).length > 0 && (
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Error Patterns</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Operation</th><th>Message</th><th>Count</th><th>First Seen</th><th>Last Seen</th></tr></thead>
              <tbody>
                {(errorPatterns.data ?? []).map((e, i) => (
                  <tr key={i}>
                    <td>{e.operation}</td>
                    <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis" }}>{e.statusMessage || "—"}</td>
                    <td className={styles.errorText}>{formatNumber(e.errorCount)}</td>
                    <td style={{ fontSize: 11 }}>{new Date(e.firstSeen).toLocaleString()}</td>
                    <td style={{ fontSize: 11 }}>{new Date(e.lastSeen).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
