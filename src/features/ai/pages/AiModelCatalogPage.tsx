/**
 * Model Catalog — Grid of all models with health, cost, and performance.
 */
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTimeRange, useTeamId, useRefreshKey } from "@app/store/appStore";
import { resolveTimeRangeBounds } from "@/types";
import { aiService } from "../api/aiService";
import styles from "./AiOverviewPage.module.css";

export default function AiModelCatalogPage() {
  const timeRange = useTimeRange();
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const { startTime: startMs, endTime: endMs } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);
  const navigate = useNavigate();

  const queryKeyBase = [teamId, startMs, endMs, refreshKey];

  const catalog = useQuery({
    queryKey: ["ai-model-catalog", ...queryKeyBase],
    queryFn: () => aiService.getModelCatalog(startMs, endMs),
  });

  const costSummary = useQuery({
    queryKey: ["ai-cost-summary", ...queryKeyBase],
    queryFn: () => aiService.getCostSummary(startMs, endMs),
  });

  return (
    <div className={styles.page}>
      {/* Cost overview cards */}
      {costSummary.data && (
        <div className={styles.statGrid}>
          <StatCard label="Est. Total Cost" value={`$${costSummary.data.totalEstimatedCost.toFixed(2)}`} />
          <StatCard label="Total Input Tok" value={formatNumber(costSummary.data.totalInputTokens)} />
          <StatCard label="Total Output Tok" value={formatNumber(costSummary.data.totalOutputTokens)} />
          <StatCard label="Models" value={catalog.data?.length ?? 0} />
        </div>
      )}

      {/* Model Grid */}
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Model Catalog</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Model</th>
                <th>Provider</th>
                <th>Health</th>
                <th>Requests</th>
                <th>Avg Latency</th>
                <th>P95</th>
                <th>Error %</th>
                <th>Total Tokens</th>
                <th>Tok/s</th>
                <th>Est. Cost</th>
                <th>Top Operations</th>
              </tr>
            </thead>
            <tbody>
              {(catalog.data ?? []).map((m) => (
                <tr key={m.model} className={styles.clickRow} onClick={() => navigate({ to: `/ai-models/${encodeURIComponent(m.model)}` as any })}>
                  <td className={styles.mono}>{m.model}</td>
                  <td>{m.provider}</td>
                  <td><span className={`${styles.badge} ${styles[m.health]}`}>{m.health}</span></td>
                  <td>{formatNumber(m.requestCount)}</td>
                  <td>{m.avgLatencyMs.toFixed(0)}ms</td>
                  <td>{m.p95Ms.toFixed(0)}ms</td>
                  <td>{m.errorRate.toFixed(2)}%</td>
                  <td>{formatNumber(m.totalTokens)}</td>
                  <td>{m.tokensPerSec.toFixed(1)}</td>
                  <td>${m.estimatedCost.toFixed(4)}</td>
                  <td style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{m.topOperations}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {catalog.data?.length === 0 && <div className={styles.emptyState}>No models found for this time range.</div>}
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
