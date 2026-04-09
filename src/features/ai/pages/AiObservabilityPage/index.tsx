import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  Bot,
  Brain,
  Database,
  FlaskConical,
  Gauge,
  MessageSquare,
  ScrollText,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import { resolveTimeRangeBounds } from "@/types";
import { useRefreshKey, useTeamId, useTimeRange } from "@app/store/appStore";
import { Badge, Button, Input, Select } from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";
import { formatDuration, formatNumber, formatTimestamp } from "@shared/utils/formatters";

import { ROUTES } from "@/shared/constants/routes";

import { aiInsightsApi, buildModelInsights } from "../../api/aiInsightsApi";
import { aiPlatformQueries } from "../../api/aiPlatformQueryOptions";
import { aiConversationQueries, aiRunsQueries } from "../../api/queryOptions";
import { AiSparkline } from "../../components/AiSparkline";
import { AiWorkspaceLayout } from "../../components/AiWorkspaceLayout";
import { buildAiDrawerSearch } from "../../components/aiDrawerState";
import type { AiSavedView } from "../../types";

const SAVED_VIEWS: AiSavedView[] = [
  {
    id: "all-traffic",
    label: "All AI traffic",
    description: "Full platform health across all models and workflows.",
  },
  {
    id: "latency-watch",
    label: "Latency watch",
    description: "Prioritize slow models and long-tail regressions.",
  },
  {
    id: "safety-ops",
    label: "Safety ops",
    description: "Focus on PII, guardrails, and risky prompts.",
  },
];

function aggregateSeries<T>(items: readonly T[], getTimestamp: (item: T) => string, getValue: (item: T) => number) {
  const buckets = new Map<string, number>();

  for (const item of items) {
    const timestamp = getTimestamp(item);
    buckets.set(timestamp, (buckets.get(timestamp) ?? 0) + getValue(item));
  }

  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => value);
}

function SummaryStat({
  label,
  value,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  tone?: "default" | "danger" | "warning" | "success";
  icon: React.ReactNode;
}) {
  const toneClass =
    tone === "danger"
      ? "border-[rgba(240,68,56,0.2)] bg-[rgba(240,68,56,0.08)]"
      : tone === "warning"
        ? "border-[rgba(247,144,9,0.2)] bg-[rgba(247,144,9,0.08)]"
        : tone === "success"
          ? "border-[rgba(16,185,129,0.2)] bg-[rgba(16,185,129,0.08)]"
          : "border-[var(--border-color)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))]";

  return (
    <div className={`rounded-2xl border px-4 py-4 ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
            {label}
          </div>
          <div className="mt-3 font-semibold text-[28px] text-[var(--text-primary)] leading-none">
            {value}
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border-color)] bg-white/[0.04] p-2 text-[var(--text-secondary)]">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AiObservabilityPage(): JSX.Element {
  const selectedTeamId = useTeamId();
  const timeRange = useTimeRange();
  const refreshKey = useRefreshKey();
  const navigate = useNavigate();
  const location = useLocation();
  const [savedView, setSavedView] = useState(SAVED_VIEWS[0]?.id ?? "all-traffic");
  const [compareMode, setCompareMode] = useState(false);
  const [modelFilter, setModelFilter] = useState("");

  const { startMs, endMs } = useMemo(() => {
    void refreshKey;
    const { startTime, endTime } = resolveTimeRangeBounds(timeRange);
    return { startMs: startTime, endMs: endTime };
  }, [refreshKey, timeRange]);

  const summaryQuery = useQuery({
    queryKey: ["ai-insights", "summary", selectedTeamId, startMs, endMs],
    queryFn: () => aiInsightsApi.getSummary(startMs, endMs),
    enabled: Boolean(selectedTeamId),
  });
  const performanceQuery = useQuery({
    queryKey: ["ai-insights", "performance", selectedTeamId, startMs, endMs],
    queryFn: () => aiInsightsApi.getPerformanceMetrics(startMs, endMs),
    enabled: Boolean(selectedTeamId),
  });
  const performanceSeriesQuery = useQuery({
    queryKey: ["ai-insights", "performance-series", selectedTeamId, startMs, endMs],
    queryFn: () => aiInsightsApi.getPerformanceTimeSeries(startMs, endMs),
    enabled: Boolean(selectedTeamId),
  });
  const costMetricsQuery = useQuery({
    queryKey: ["ai-insights", "cost-metrics", selectedTeamId, startMs, endMs],
    queryFn: () => aiInsightsApi.getCostMetrics(startMs, endMs),
    enabled: Boolean(selectedTeamId),
  });
  const costSeriesQuery = useQuery({
    queryKey: ["ai-insights", "cost-series", selectedTeamId, startMs, endMs],
    queryFn: () => aiInsightsApi.getCostTimeSeries(startMs, endMs),
    enabled: Boolean(selectedTeamId),
  });
  const tokenBreakdownQuery = useQuery({
    queryKey: ["ai-insights", "token-breakdown", selectedTeamId, startMs, endMs],
    queryFn: () => aiInsightsApi.getTokenBreakdown(startMs, endMs),
    enabled: Boolean(selectedTeamId),
  });
  const securityMetricsQuery = useQuery({
    queryKey: ["ai-insights", "security-metrics", selectedTeamId, startMs, endMs],
    queryFn: () => aiInsightsApi.getSecurityMetrics(startMs, endMs),
    enabled: Boolean(selectedTeamId),
  });
  const securitySeriesQuery = useQuery({
    queryKey: ["ai-insights", "security-series", selectedTeamId, startMs, endMs],
    queryFn: () => aiInsightsApi.getSecurityTimeSeries(startMs, endMs),
    enabled: Boolean(selectedTeamId),
  });
  const piiQuery = useQuery({
    queryKey: ["ai-insights", "pii", selectedTeamId, startMs, endMs],
    queryFn: () => aiInsightsApi.getPiiCategories(startMs, endMs),
    enabled: Boolean(selectedTeamId),
  });

  const runsQuery = useQuery({
    ...aiRunsQueries.list(selectedTeamId, startMs, endMs, { limit: 8 }, refreshKey),
    placeholderData: (previous) => previous,
  });
  const conversationsQuery = useQuery(aiConversationQueries.list(selectedTeamId, startMs, endMs));
  const promptsQuery = useQuery(aiPlatformQueries.prompts());
  const evalsQuery = useQuery(aiPlatformQueries.evals());
  const experimentsQuery = useQuery(aiPlatformQueries.experiments());

  const summary = summaryQuery.data;
  const performanceMetrics = performanceQuery.data ?? [];
  const performanceSeries = performanceSeriesQuery.data ?? [];
  const costMetrics = costMetricsQuery.data ?? [];
  const costSeries = costSeriesQuery.data ?? [];
  const tokenBreakdown = tokenBreakdownQuery.data ?? [];
  const securityMetrics = securityMetricsQuery.data ?? [];
  const securitySeries = securitySeriesQuery.data ?? [];
  const piiCategories = piiQuery.data ?? [];
  const prompts = promptsQuery.data ?? [];
  const evals = evalsQuery.data ?? [];
  const experiments = experimentsQuery.data ?? [];
  const runs = runsQuery.data ?? [];
  const conversations = conversationsQuery.data ?? [];

  const modelInsights = useMemo(
    () => buildModelInsights(performanceMetrics, costMetrics, securityMetrics),
    [costMetrics, performanceMetrics, securityMetrics]
  );

  const filteredModelInsights = useMemo(() => {
    if (!modelFilter.trim()) {
      return modelInsights;
    }
    const search = modelFilter.toLowerCase();
    return modelInsights.filter(
      (entry) =>
        entry.modelName.toLowerCase().includes(search) ||
        entry.modelProvider.toLowerCase().includes(search)
    );
  }, [modelFilter, modelInsights]);

  const anomalies = useMemo(() => {
    return [...filteredModelInsights]
      .sort(
        (left, right) =>
          right.errorRate +
            right.guardrailBlockRate +
            right.piiDetectionRate +
            right.avgLatencyMs / 1000 -
          (left.errorRate + left.guardrailBlockRate + left.piiDetectionRate + left.avgLatencyMs / 1000)
      )
      .slice(0, 5);
  }, [filteredModelInsights]);

  const latencySparkline = useMemo(
    () => aggregateSeries(performanceSeries, (item) => item.timestamp, (item) => item.p95LatencyMs),
    [performanceSeries]
  );
  const costSparkline = useMemo(
    () => aggregateSeries(costSeries, (item) => item.timestamp, (item) => item.costPerInterval),
    [costSeries]
  );
  const safetySparkline = useMemo(
    () => aggregateSeries(securitySeries, (item) => item.timestamp, (item) => item.guardrailCount + item.piiCount),
    [securitySeries]
  );

  const openDrawer = (
    entity: "model" | "run" | "conversation" | "prompt" | "eval" | "experiment",
    id: string,
    title: string,
    data: Record<string, unknown>
  ) => {
    navigate({
      to: (location.pathname + buildAiDrawerSearch(location.search, entity, id, { title, data })) as any,
    });
  };

  const topRail = (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info">{summary?.activeModels ?? 0} active models</Badge>
        <Badge variant={summary && summary.errorCount > 0 ? "warning" : "success"}>
          {summary?.errorCount ?? 0} errors
        </Badge>
        <Badge variant={summary && summary.guardrailBlockRate > 0 ? "warning" : "default"}>
          {((summary?.guardrailBlockRate ?? 0) * 100).toFixed(1)}% guardrail rate
        </Badge>
        <Badge variant="default">View: {SAVED_VIEWS.find((view) => view.id === savedView)?.label}</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          size="sm"
          value={savedView}
          onChange={(value: string) => setSavedView(value)}
          options={SAVED_VIEWS.map((view) => ({ label: view.label, value: view.id }))}
          className="min-w-[180px]"
        />
        <Input
          value={modelFilter}
          onChange={(event) => setModelFilter(event.target.value)}
          placeholder="Filter models or providers"
          className="min-w-[220px]"
        />
        <Button
          type="button"
          size="sm"
          variant={compareMode ? "primary" : "secondary"}
          onClick={() => setCompareMode((value) => !value)}
        >
          {compareMode ? "Compare mode on" : "Compare mode"}
        </Button>
        <Button type="button" size="sm" onClick={() => navigate({ to: ROUTES.aiRuns })}>
          Open Runs
        </Button>
      </div>
    </div>
  );

  return (
    <AiWorkspaceLayout
      title="AI Observability"
      subtitle="Operate the AI platform with Datadog-density scanning, LangSmith-style drilldowns, and a right-side investigation workflow."
      icon={<Brain size={24} />}
      topRail={topRail}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" onClick={() => navigate({ to: ROUTES.aiPrompts })}>
            Prompts
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => navigate({ to: ROUTES.aiEvals })}>
            Evaluations
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => navigate({ to: ROUTES.aiExperiments })}>
            Experiments
          </Button>
        </div>
      }
    >
      <div className="grid gap-3 xl:grid-cols-6">
        <SummaryStat label="Requests" value={formatNumber(summary?.totalRequests ?? 0)} icon={<Bot size={16} />} />
        <SummaryStat label="P95 Latency" value={formatDuration(summary?.p95LatencyMs ?? 0)} tone="warning" icon={<Gauge size={16} />} />
        <SummaryStat label="Error Count" value={formatNumber(summary?.errorCount ?? 0)} tone={(summary?.errorCount ?? 0) > 0 ? "danger" : "success"} icon={<ShieldAlert size={16} />} />
        <SummaryStat label="Total Tokens" value={formatNumber(summary?.totalTokens ?? 0)} icon={<Sparkles size={16} />} />
        <SummaryStat label="Cost (USD)" value={`$${(summary?.totalCostUsd ?? 0).toFixed(2)}`} icon={<Database size={16} />} />
        <SummaryStat label="Active Models" value={formatNumber(summary?.activeModels ?? 0)} tone="success" icon={<Brain size={16} />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1.5fr]">
        <PageSurface padding="lg" className="min-h-[420px]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-[16px] text-[var(--text-primary)]">Live anomalies</div>
              <div className="text-[12px] text-[var(--text-muted)]">
                Prioritized models with the sharpest combined latency, safety, and failure signals.
              </div>
            </div>
            <Badge variant="warning">{anomalies.length} in focus</Badge>
          </div>
          <div className="space-y-3">
            {anomalies.map((entry) => (
              <button
                key={entry.modelName}
                type="button"
                onClick={() =>
                  openDrawer("model", entry.modelName, entry.modelName, {
                    ...entry,
                    anomalyScore:
                      entry.errorRate + entry.guardrailBlockRate + entry.piiDetectionRate + entry.avgLatencyMs / 1000,
                  })
                }
                className="w-full rounded-2xl border border-[var(--border-color)] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] px-4 py-4 text-left transition-colors hover:border-[var(--color-primary-subtle-35)] hover:bg-[var(--color-primary-subtle-08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[15px] text-[var(--text-primary)]">
                      {entry.modelName}
                    </div>
                    <div className="mt-1 text-[12px] text-[var(--text-muted)]">{entry.modelProvider}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="warning">{(entry.errorRate * 100).toFixed(1)}% error</Badge>
                    <Badge variant="default">${entry.totalCostUsd.toFixed(2)}</Badge>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-3 text-[12px]">
                  <div>
                    <div className="text-[var(--text-muted)]">P95</div>
                    <div className="mt-1 font-mono text-[var(--text-primary)]">
                      {formatDuration(entry.p95LatencyMs)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--text-muted)]">Guardrails</div>
                    <div className="mt-1 font-mono text-[var(--text-primary)]">
                      {(entry.guardrailBlockRate * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--text-muted)]">PII</div>
                    <div className="mt-1 font-mono text-[var(--text-primary)]">
                      {(entry.piiDetectionRate * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--text-muted)]">Tokens/sec</div>
                    <div className="mt-1 font-mono text-[var(--text-primary)]">
                      {entry.avgTokensPerSec.toFixed(1)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </PageSurface>

        <PageSurface padding="lg">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-[16px] text-[var(--text-primary)]">Model leaderboard</div>
              <div className="text-[12px] text-[var(--text-muted)]">
                Compare throughput, cost, latency, and safety on a single grid.
              </div>
            </div>
            <Badge variant="info">{filteredModelInsights.length} models</Badge>
          </div>
          <div className="grid grid-cols-[1.4fr_repeat(5,minmax(0,1fr))] gap-3 border-[var(--border-color)] border-b pb-2 text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
            <span>Model</span>
            <span>Requests</span>
            <span>P95</span>
            <span>Error</span>
            <span>Cost</span>
            <span>Safety</span>
          </div>
          <div className="divide-y divide-[var(--border-color)]">
            {filteredModelInsights.slice(0, compareMode ? 12 : 8).map((entry) => (
              <button
                key={entry.modelName}
                type="button"
                className="grid w-full grid-cols-[1.4fr_repeat(5,minmax(0,1fr))] gap-3 py-3 text-left text-[12px] transition-colors hover:bg-white/[0.02]"
                onClick={() => openDrawer("model", entry.modelName, entry.modelName, entry as unknown as Record<string, unknown>)}
              >
                <span className="truncate font-medium text-[var(--text-primary)]">
                  {entry.modelName}
                  <span className="ml-2 text-[var(--text-muted)]">{entry.modelProvider}</span>
                </span>
                <span className="font-mono">{formatNumber(entry.totalRequests)}</span>
                <span className="font-mono">{formatDuration(entry.p95LatencyMs)}</span>
                <span className="font-mono">{(entry.errorRate * 100).toFixed(1)}%</span>
                <span className="font-mono">${entry.totalCostUsd.toFixed(2)}</span>
                <span className="font-mono">
                  {((entry.guardrailBlockRate + entry.piiDetectionRate) * 100).toFixed(1)}%
                </span>
              </button>
            ))}
          </div>
        </PageSurface>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <PageSurface padding="lg">
          <div className="font-semibold text-[15px] text-[var(--text-primary)]">Latency trend</div>
          <div className="mt-1 text-[12px] text-[var(--text-muted)]">
            P95 latency aggregated across models.
          </div>
          <div className="mt-4">
            <AiSparkline values={latencySparkline} stroke="#f59e0b" fill="rgba(245,158,11,0.12)" />
          </div>
        </PageSurface>
        <PageSurface padding="lg">
          <div className="font-semibold text-[15px] text-[var(--text-primary)]">Cost trend</div>
          <div className="mt-1 text-[12px] text-[var(--text-muted)]">
            Spend growth over the selected period.
          </div>
          <div className="mt-4">
            <AiSparkline values={costSparkline} stroke="#436dff" fill="rgba(67,109,255,0.12)" />
          </div>
        </PageSurface>
        <PageSurface padding="lg">
          <div className="font-semibold text-[15px] text-[var(--text-primary)]">Safety trend</div>
          <div className="mt-1 text-[12px] text-[var(--text-muted)]">
            Guardrails plus PII events over time.
          </div>
          <div className="mt-4">
            <AiSparkline values={safetySparkline} stroke="#ef4444" fill="rgba(239,68,68,0.12)" />
          </div>
        </PageSurface>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <PageSurface padding="lg">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-[15px] text-[var(--text-primary)]">Prompt and safety insights</div>
              <div className="text-[12px] text-[var(--text-muted)]">
                Connect authored prompts with token usage and privacy hot spots.
              </div>
            </div>
            <Button type="button" size="sm" variant="secondary" onClick={() => navigate({ to: ROUTES.aiPrompts })}>
              Open prompt library
            </Button>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <div>
              <div className="mb-2 text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Recent prompts
              </div>
              <div className="space-y-2">
                {prompts.slice(0, 4).map((prompt) => (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => openDrawer("prompt", prompt.id, prompt.name, prompt as unknown as Record<string, unknown>)}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-3 text-left transition-colors hover:border-[var(--color-primary-subtle-35)]"
                  >
                    <div className="font-medium text-[var(--text-primary)]">{prompt.name}</div>
                    <div className="mt-1 text-[12px] text-[var(--text-muted)]">
                      {prompt.modelProvider} / {prompt.modelName}
                    </div>
                    <div className="mt-2 text-[11px] text-[var(--text-muted)]">
                      Updated {formatTimestamp(prompt.updatedAt)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                PII categories
              </div>
              <div className="space-y-2">
                {piiCategories.slice(0, 4).map((entry) => (
                  <button
                    key={`${entry.modelName}-${entry.piiCategories}`}
                    type="button"
                    onClick={() =>
                      openDrawer("model", entry.modelName, entry.modelName, entry as unknown as Record<string, unknown>)
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-3 text-left transition-colors hover:border-[var(--color-primary-subtle-35)]"
                  >
                    <span>
                      <span className="block font-medium text-[var(--text-primary)]">{entry.piiCategories}</span>
                      <span className="block text-[12px] text-[var(--text-muted)]">{entry.modelName}</span>
                    </span>
                    <span className="font-mono text-[13px] text-[var(--text-primary)]">
                      {formatNumber(entry.detectionCount)}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Token leaders
              </div>
              <div className="mt-2 space-y-2">
                {tokenBreakdown.slice(0, 3).map((entry) => (
                  <button
                    key={entry.modelName}
                    type="button"
                    onClick={() =>
                      openDrawer("model", entry.modelName, entry.modelName, entry as unknown as Record<string, unknown>)
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-3 text-left"
                  >
                    <span className="font-medium text-[var(--text-primary)]">{entry.modelName}</span>
                    <span className="font-mono text-[12px] text-[var(--text-primary)]">
                      {formatNumber(
                        entry.promptTokens + entry.completionTokens + entry.systemTokens + entry.cacheTokens
                      )}{" "}
                      tokens
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PageSurface>

        <PageSurface padding="lg">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-[15px] text-[var(--text-primary)]">Platform status</div>
              <div className="text-[12px] text-[var(--text-muted)]">
                Track authored assets and currently active evaluation work.
              </div>
            </div>
            <Badge variant="info">{evals.length + experiments.length} active workflows</Badge>
          </div>
          <div className="grid gap-3">
            <button
              type="button"
              className="rounded-2xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-4 text-left"
              onClick={() => navigate({ to: ROUTES.aiEvals })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                  <MessageSquare size={15} />
                  Evaluations
                </div>
                <Badge variant="default">{evals.length}</Badge>
              </div>
              <div className="mt-2 text-[12px] text-[var(--text-muted)]">
                {evals.filter((entry) => entry.status === "active").length} active suites
              </div>
            </button>
            <button
              type="button"
              className="rounded-2xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-4 text-left"
              onClick={() => navigate({ to: ROUTES.aiExperiments })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                  <FlaskConical size={15} />
                  Experiments
                </div>
                <Badge variant="default">{experiments.length}</Badge>
              </div>
              <div className="mt-2 text-[12px] text-[var(--text-muted)]">
                {experiments.filter((entry) => entry.status === "running").length} running experiments
              </div>
            </button>
            <button
              type="button"
              className="rounded-2xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-4 text-left"
              onClick={() => navigate({ to: ROUTES.aiDatasets })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-[var(--text-primary)]">
                  <Database size={15} />
                  Datasets
                </div>
                <Badge variant="default">{prompts.length}</Badge>
              </div>
              <div className="mt-2 text-[12px] text-[var(--text-muted)]">
                Keep fresh replay sets for regressions, safety, and product scenarios.
              </div>
            </button>
          </div>
        </PageSurface>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <PageSurface padding="lg">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-[15px] text-[var(--text-primary)]">Recent runs</div>
              <div className="text-[12px] text-[var(--text-muted)]">
                Jump from anomalies straight into run-level evidence.
              </div>
            </div>
            <Button type="button" size="sm" variant="secondary" onClick={() => navigate({ to: ROUTES.aiRuns })}>
              Open explorer
            </Button>
          </div>
          <div className="space-y-2">
            {runs.slice(0, 6).map((run) => (
              <button
                key={run.spanId}
                type="button"
                onClick={() => openDrawer("run", run.spanId, run.model || run.spanId, run as unknown as Record<string, unknown>)}
                className="grid w-full grid-cols-[1.4fr_90px_80px_90px] gap-3 rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-3 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-[var(--text-primary)]">{run.model}</span>
                  <span className="block truncate text-[12px] text-[var(--text-muted)]">
                    {run.serviceName} · {run.operationName}
                  </span>
                </span>
                <span className="font-mono text-[12px] text-[var(--text-primary)]">
                  {formatDuration(run.durationMs)}
                </span>
                <span className="font-mono text-[12px] text-[var(--text-primary)]">
                  {formatNumber(run.totalTokens)}
                </span>
                <span className="text-[12px] text-[var(--text-muted)]">
                  {run.hasError ? "Error" : "OK"}
                </span>
              </button>
            ))}
          </div>
        </PageSurface>

        <PageSurface padding="lg">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-[15px] text-[var(--text-primary)]">Recent conversations</div>
              <div className="text-[12px] text-[var(--text-muted)]">
                Review multi-turn activity and jump into high-token threads.
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => navigate({ to: ROUTES.aiConversations })}
            >
              Open conversations
            </Button>
          </div>
          <div className="space-y-2">
            {conversations.slice(0, 6).map((conversation) => (
              <button
                key={conversation.conversationId}
                type="button"
                onClick={() =>
                  openDrawer(
                    "conversation",
                    conversation.conversationId,
                    conversation.conversationId,
                    conversation as unknown as Record<string, unknown>
                  )
                }
                className="grid w-full grid-cols-[1.3fr_120px_90px_90px] gap-3 rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-4 py-3 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-[var(--text-primary)]">
                    {conversation.conversationId}
                  </span>
                  <span className="block truncate text-[12px] text-[var(--text-muted)]">
                    {conversation.serviceName}
                  </span>
                </span>
                <span className="text-[12px] text-[var(--text-primary)]">{conversation.model}</span>
                <span className="font-mono text-[12px] text-[var(--text-primary)]">
                  {conversation.turnCount} turns
                </span>
                <span className="font-mono text-[12px] text-[var(--text-primary)]">
                  {formatNumber(conversation.totalTokens)}
                </span>
              </button>
            ))}
          </div>
        </PageSurface>
      </div>
    </AiWorkspaceLayout>
  );
}
