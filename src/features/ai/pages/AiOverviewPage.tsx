/**
 * LLM Overview Dashboard — Multi-tab operational dashboard.
 * Tabs: Operations, Models, Cost, Errors
 */
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTimeRange, useTeamId, useRefreshKey } from "@app/store/appStore";
import { resolveTimeRangeBounds } from "@/types";
import { aiService } from "../api/aiService";
import type { AiFilterParams } from "../types";
import styles from "./AiOverviewPage.module.css";

type TabKey = "operations" | "models" | "cost" | "errors";

export default function AiOverviewPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("operations");
  const timeRange = useTimeRange();
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const { startTime: startMs, endTime: endMs } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);
  const [filters] = useState<AiFilterParams>({});
  const navigate = useNavigate();

  const queryKeyBase = [teamId, startMs, endMs, refreshKey, filters];

  const summary = useQuery({
    queryKey: ["ai-summary", ...queryKeyBase],
    queryFn: () => aiService.getSummary(startMs, endMs, filters),
  });

  const models = useQuery({
    queryKey: ["ai-models", ...queryKeyBase],
    queryFn: () => aiService.getModels(startMs, endMs, filters),
  });

  const modelHealth = useQuery({
    queryKey: ["ai-model-health", ...queryKeyBase],
    queryFn: () => aiService.getModelHealth(startMs, endMs, filters),
  });

  const topSlow = useQuery({
    queryKey: ["ai-top-slow", ...queryKeyBase],
    queryFn: () => aiService.getTopSlow(startMs, endMs, filters),
  });

  const topErrors = useQuery({
    queryKey: ["ai-top-errors", ...queryKeyBase],
    queryFn: () => aiService.getTopErrors(startMs, endMs, filters),
  });

  const finishReasons = useQuery({
    queryKey: ["ai-finish-reasons", ...queryKeyBase],
    queryFn: () => aiService.getFinishReasons(startMs, endMs, filters),
  });

  const s = summary.data;
  const tabs: { key: TabKey; label: string }[] = [
    { key: "operations", label: "Operations" },
    { key: "models", label: "Models" },
    { key: "cost", label: "Cost & Tokens" },
    { key: "errors", label: "Errors" },
  ];

  return (
    <div className={styles.page}>
      {/* ---- Hero Stat Cards ---- */}
      <div className={styles.statGrid}>
        <StatCard label="Total Requests" value={s?.totalRequests ?? 0} />
        <StatCard label="Error Rate" value={`${(s?.errorRate ?? 0).toFixed(2)}%`} accent={s && s.errorRate > 5 ? "red" : undefined} />
        <StatCard label="Avg Latency" value={`${(s?.avgLatencyMs ?? 0).toFixed(0)}ms`} />
        <StatCard label="P95 Latency" value={`${(s?.p95Ms ?? 0).toFixed(0)}ms`} />
        <StatCard label="Total Tokens" value={formatNumber(s?.totalTokens ?? 0)} />
        <StatCard label="Unique Models" value={s?.uniqueModels ?? 0} />
        <StatCard label="Token/sec" value={`${(s?.avgTokensPerSec ?? 0).toFixed(1)}`} />
        <StatCard label="Services" value={s?.uniqueServices ?? 0} />
      </div>

      {/* ---- Tab Bar ---- */}
      <div className={styles.tabBar}>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ---- Tab Content ---- */}
      <div className={styles.tabContent}>
        {activeTab === "operations" && (
          <div className={styles.gridTwo}>
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Model Health</h3>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Model</th><th>Provider</th><th>Requests</th><th>P95 (ms)</th><th>Error %</th><th>Health</th></tr></thead>
                  <tbody>
                    {(modelHealth.data ?? []).map((m) => (
                      <tr key={m.model} className={styles.clickRow} onClick={() => navigate({ to: `/ai-models/${encodeURIComponent(m.model)}` as any })}>
                        <td className={styles.mono}>{m.model}</td>
                        <td>{m.provider}</td>
                        <td>{formatNumber(m.requestCount)}</td>
                        <td>{m.p95Ms.toFixed(0)}</td>
                        <td>{m.errorRate.toFixed(2)}%</td>
                        <td><span className={`${styles.badge} ${styles[m.health]}`}>{m.health}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Top Slow Operations</h3>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Model</th><th>Operation</th><th>P95 (ms)</th><th>Count</th></tr></thead>
                  <tbody>
                    {(topSlow.data ?? []).map((t, i) => (
                      <tr key={i}>
                        <td className={styles.mono}>{t.model}</td>
                        <td>{t.operation}</td>
                        <td>{t.p95Ms.toFixed(0)}</td>
                        <td>{formatNumber(t.requestCount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "models" && (
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Models Overview</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Model</th><th>Provider</th><th>Requests</th><th>Avg Latency</th><th>P95</th><th>Error %</th><th>Input Tok</th><th>Output Tok</th><th>Tok/s</th></tr></thead>
                <tbody>
                  {(models.data ?? []).map((m) => (
                    <tr key={m.model} className={styles.clickRow} onClick={() => navigate({ to: `/ai-models/${encodeURIComponent(m.model)}` as any })}>
                      <td className={styles.mono}>{m.model}</td>
                      <td>{m.provider}</td>
                      <td>{formatNumber(m.requestCount)}</td>
                      <td>{m.avgLatencyMs.toFixed(0)}ms</td>
                      <td>{m.p95Ms.toFixed(0)}ms</td>
                      <td>{m.errorRate.toFixed(2)}%</td>
                      <td>{formatNumber(m.inputTokens)}</td>
                      <td>{formatNumber(m.outputTokens)}</td>
                      <td>{m.tokensPerSec.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "cost" && (
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Finish Reason Distribution</h3>
            <div className={styles.reasonGrid}>
              {(finishReasons.data ?? []).map((r) => (
                <div key={r.finishReason} className={styles.reasonCard}>
                  <div className={styles.reasonLabel}>{r.finishReason || "unknown"}</div>
                  <div className={styles.reasonValue}>{formatNumber(r.count)}</div>
                  <div className={styles.reasonPct}>{r.percentage.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "errors" && (
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Top Error Patterns</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Model</th><th>Operation</th><th>Errors</th><th>Rate</th><th>Total</th></tr></thead>
                <tbody>
                  {(topErrors.data ?? []).map((e, i) => (
                    <tr key={i}>
                      <td className={styles.mono}>{e.model}</td>
                      <td>{e.operation}</td>
                      <td className={styles.errorText}>{formatNumber(e.errorCount)}</td>
                      <td>{e.errorRate.toFixed(2)}%</td>
                      <td>{formatNumber(e.requestCount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className={`${styles.statCard} ${accent === "red" ? styles.statCardDanger : ""}`}>
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
