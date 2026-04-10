/**
 * Model Detail — Single model deep-dive with timeseries, latency distribution, and parameter impact.
 */
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTimeRange, useTeamId, useRefreshKey } from "@app/store/appStore";
import { resolveTimeRangeBounds } from "@/types";
import { aiService } from "../api/aiService";
import styles from "./AiOverviewPage.module.css";

export default function AiModelDetailPage() {
  const { modelName } = useParams({ strict: false }) as { modelName: string };
  const model = decodeURIComponent(modelName || "");
  const timeRange = useTimeRange();
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const { startTime: startMs, endTime: endMs } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);
  const navigate = useNavigate();

  const queryKeyBase = [teamId, startMs, endMs, refreshKey, model];

  const timeseries = useQuery({
    queryKey: ["ai-model-ts", ...queryKeyBase],
    queryFn: () => aiService.getModelTimeseries(startMs, endMs, model),
    enabled: !!model,
  });

  const latencyDist = useQuery({
    queryKey: ["ai-latency-dist", ...queryKeyBase],
    queryFn: () => aiService.getLatencyDistribution(startMs, endMs, { model }),
    enabled: !!model,
  });

  const paramImpact = useQuery({
    queryKey: ["ai-param-impact", ...queryKeyBase],
    queryFn: () => aiService.getParameterImpact(startMs, endMs, { model }),
    enabled: !!model,
  });

  if (!model) return <div className={styles.emptyState}>No model specified.</div>;

  return (
    <div className={styles.page}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate({ to: "/ai-models" as any })} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13 }}>
          ← Back to Catalog
        </button>
        <h2 style={{ color: "var(--text-primary, #e8eaf0)", fontSize: 16, fontWeight: 600, margin: 0 }}>
          {model}
        </h2>
      </div>

      {/* Timeseries overview */}
      {timeseries.data && timeseries.data.length > 0 && (
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Performance Over Time</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Time</th><th>Requests</th><th>Avg Latency</th><th>P95</th><th>Error %</th><th>In Tok</th><th>Out Tok</th></tr></thead>
              <tbody>
                {timeseries.data.slice(-20).map((t, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 11 }}>{new Date(t.timestamp).toLocaleTimeString()}</td>
                    <td>{t.requestCount}</td>
                    <td>{t.avgLatencyMs.toFixed(0)}ms</td>
                    <td>{t.p95Ms.toFixed(0)}ms</td>
                    <td>{t.errorRate.toFixed(2)}%</td>
                    <td>{formatNumber(t.inputTokens)}</td>
                    <td>{formatNumber(t.outputTokens)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className={styles.gridTwo}>
        {/* Latency Distribution */}
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Latency Distribution</h3>
          {latencyDist.data && latencyDist.data.length > 0 ? (
            <div style={{ display: "flex", gap: 1, height: 80, alignItems: "flex-end" }}>
              {latencyDist.data.filter((b) => b.model === model).map((b, i) => {
                const max = Math.max(...latencyDist.data!.filter((x) => x.model === model).map((x) => x.count), 1);
                return <div key={i} style={{ flex: 1, height: `${(b.count / max) * 100}%`, background: "#6366f1", borderRadius: "2px 2px 0 0", minWidth: 3 }} title={`${b.bucketMs}ms: ${b.count}`} />;
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>No data</div>
          )}
        </div>

        {/* Parameter Impact */}
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Temperature Impact</h3>
          {paramImpact.data && paramImpact.data.length > 0 ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Temperature</th><th>Avg Latency</th><th>Error %</th><th>Count</th></tr></thead>
                <tbody>
                  {paramImpact.data.map((p, i) => (
                    <tr key={i}>
                      <td>{p.temperature.toFixed(1)}</td>
                      <td>{p.avgLatency.toFixed(0)}ms</td>
                      <td>{p.errorRate.toFixed(2)}%</td>
                      <td>{p.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyState}>No temperature data</div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
