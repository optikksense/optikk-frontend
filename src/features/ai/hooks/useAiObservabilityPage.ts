import { useRefreshKey, useTeamId, useTimeRange } from "@app/store/appStore";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { useSearchParamsCompat } from "@shared/hooks/useSearchParamsCompat";
import { resolveTimeRangeBounds } from "@/types";
import { useMemo } from "react";

import { useExplorerState } from "@/features/explorer/hooks/useExplorerState";
import type { ExplorerFilter } from "@/features/explorer/types/filters";

import { aiObservabilityApi, hasUnsupportedAiFilters } from "../api/aiObservabilityApi";
import type { AiQueryArgs, AiTabId } from "../types";
import { inferAiSpanType } from "../utils/spanTypes";

const DEFAULT_TAB: AiTabId = "models";
const TAB_PARAM = "tab";

const TAB_IDS: readonly AiTabId[] = ["models", "prompts", "agents", "retrieval", "traces"];

function parseTab(raw: string | null): AiTabId {
  return raw && (TAB_IDS as readonly string[]).includes(raw) ? (raw as AiTabId) : DEFAULT_TAB;
}

export function useAiObservabilityPage() {
  const explorerState = useExplorerState();
  const timeRange = useTimeRange();
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const [searchParams, setSearchParams] = useSearchParamsCompat();
  const activeTab = parseTab(searchParams.get(TAB_PARAM));
  const { startTime, endTime } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);
  const filterKey = useMemo(() => JSON.stringify(explorerState.filters), [explorerState.filters]);

  const args: AiQueryArgs = useMemo(
    () => ({ startTime, endTime, filters: explorerState.filters, limit: 100 }),
    [startTime, endTime, explorerState.filters]
  );

  const querySeed = useMemo(
    () => ["ai", teamId ?? "none", refreshKey, startTime, endTime, filterKey],
    [teamId, refreshKey, startTime, endTime, filterKey]
  );

  const setTab = (tab: AiTabId) => {
    const next = new URLSearchParams(searchParams);
    if (tab === DEFAULT_TAB) next.delete(TAB_PARAM);
    else next.set(TAB_PARAM, tab);
    setSearchParams(next, { replace: true });
  };

  const facetsQuery = useStandardQuery({
    queryKey: [...querySeed, "facets"],
    queryFn: () => aiObservabilityApi.getFacets(args),
  });

  const modelQueries = {
    requestRate: useStandardQuery({
      queryKey: [...querySeed, "llm", "request-rate-by-model"],
      queryFn: () => aiObservabilityApi.getLLMRequestRateByModel(args),
    }),
    latency: useStandardQuery({
      queryKey: [...querySeed, "llm", "latency-by-model"],
      queryFn: () => aiObservabilityApi.getLLMLatencyByModel(args),
    }),
    errorRate: useStandardQuery({
      queryKey: [...querySeed, "llm", "error-rate-by-model"],
      queryFn: () => aiObservabilityApi.getLLMErrorRateByModel(args),
    }),
    tokenUsage: useStandardQuery({
      queryKey: [...querySeed, "llm", "token-usage-by-model"],
      queryFn: () => aiObservabilityApi.getLLMTokenUsageByModel(args),
    }),
    cost: useStandardQuery({
      queryKey: [...querySeed, "llm", "cost-by-model"],
      queryFn: () => aiObservabilityApi.getLLMCostByModel(args),
    }),
    expensiveCalls: useStandardQuery({
      queryKey: [...querySeed, "llm", "top-expensive-calls"],
      queryFn: () => aiObservabilityApi.getTopExpensiveCalls(args),
      enabled: activeTab === "models",
    }),
    slowCalls: useStandardQuery({
      queryKey: [...querySeed, "llm", "top-slow-calls"],
      queryFn: () => aiObservabilityApi.getTopSlowCalls(args),
      enabled: activeTab === "models",
    }),
  };

  const promptQueries = {
    usage: useStandardQuery({
      queryKey: [...querySeed, "prompts", "usage-by-version"],
      queryFn: () => aiObservabilityApi.getPromptUsageByVersion(args),
      enabled: activeTab === "prompts",
    }),
    latency: useStandardQuery({
      queryKey: [...querySeed, "prompts", "latency-by-version"],
      queryFn: () => aiObservabilityApi.getPromptLatencyByVersion(args),
      enabled: activeTab === "prompts",
    }),
    tokenUsage: useStandardQuery({
      queryKey: [...querySeed, "prompts", "token-usage-by-version"],
      queryFn: () => aiObservabilityApi.getPromptTokenUsageByVersion(args),
      enabled: activeTab === "prompts",
    }),
    cost: useStandardQuery({
      queryKey: [...querySeed, "prompts", "cost-by-version"],
      queryFn: () => aiObservabilityApi.getPromptCostByVersion(args),
      enabled: activeTab === "prompts",
    }),
    traces: useStandardQuery({
      queryKey: [...querySeed, "prompts", "traces"],
      queryFn: () => aiObservabilityApi.getPromptTraces(args),
      enabled: activeTab === "prompts",
    }),
  };

  const agentQueries = {
    runs: useStandardQuery({
      queryKey: [...querySeed, "agents", "runs-by-agent"],
      queryFn: () => aiObservabilityApi.getAgentRunsByAgent(args),
      enabled: activeTab === "agents",
    }),
    toolCalls: useStandardQuery({
      queryKey: [...querySeed, "agents", "tool-calls-by-tool"],
      queryFn: () => aiObservabilityApi.getToolCallsByTool(args),
      enabled: activeTab === "agents",
    }),
    toolErrors: useStandardQuery({
      queryKey: [...querySeed, "agents", "tool-errors-by-tool"],
      queryFn: () => aiObservabilityApi.getToolErrorsByTool(args),
      enabled: activeTab === "agents",
    }),
    toolLatency: useStandardQuery({
      queryKey: [...querySeed, "agents", "tool-latency-by-tool"],
      queryFn: () => aiObservabilityApi.getToolLatencyByTool(args),
      enabled: activeTab === "agents",
    }),
  };

  const retrievalQueries = {
    rate: useStandardQuery({
      queryKey: [...querySeed, "retrieval", "request-rate-by-store"],
      queryFn: () => aiObservabilityApi.getRetrievalRequestRateByStore(args),
      enabled: activeTab === "retrieval",
    }),
    latency: useStandardQuery({
      queryKey: [...querySeed, "retrieval", "latency-by-store"],
      queryFn: () => aiObservabilityApi.getRetrievalLatencyByStore(args),
      enabled: activeTab === "retrieval",
    }),
    errors: useStandardQuery({
      queryKey: [...querySeed, "retrieval", "errors-by-store"],
      queryFn: () => aiObservabilityApi.getRetrievalErrorsByStore(args),
      enabled: activeTab === "retrieval",
    }),
  };

  const tracesQuery = useStandardQuery({
    queryKey: [...querySeed, "traces", "query"],
    queryFn: () => aiObservabilityApi.queryTraces(args),
    enabled: activeTab === "traces",
  });

  return {
    activeTab,
    setTab,
    state: explorerState,
    facetsQuery,
    modelQueries,
    promptQueries,
    agentQueries,
    retrievalQueries,
    tracesQuery,
    unsupportedFilters: hasUnsupportedAiFilters(explorerState.filters),
    filterKey,
    filtered: {
      modelRate: applyClientFilters(modelQueries.requestRate.data ?? [], explorerState.filters),
      modelLatency: applyClientFilters(modelQueries.latency.data ?? [], explorerState.filters),
      modelErrors: applyClientFilters(modelQueries.errorRate.data ?? [], explorerState.filters),
      modelTokens: applyClientFilters(modelQueries.tokenUsage.data ?? [], explorerState.filters),
      modelCost: applyClientFilters(modelQueries.cost.data ?? [], explorerState.filters),
      expensiveCalls: applyClientFilters(
        modelQueries.expensiveCalls.data ?? [],
        explorerState.filters
      ),
      slowCalls: applyClientFilters(modelQueries.slowCalls.data ?? [], explorerState.filters),
      promptUsage: applyClientFilters(promptQueries.usage.data ?? [], explorerState.filters),
      promptLatency: applyClientFilters(promptQueries.latency.data ?? [], explorerState.filters),
      promptTokens: applyClientFilters(promptQueries.tokenUsage.data ?? [], explorerState.filters),
      promptCost: applyClientFilters(promptQueries.cost.data ?? [], explorerState.filters),
      promptTraces: applyClientFilters(promptQueries.traces.data ?? [], explorerState.filters),
      agentRuns: applyClientFilters(agentQueries.runs.data ?? [], explorerState.filters),
      toolCalls: applyClientFilters(agentQueries.toolCalls.data ?? [], explorerState.filters),
      toolErrors: applyClientFilters(agentQueries.toolErrors.data ?? [], explorerState.filters),
      toolLatency: applyClientFilters(agentQueries.toolLatency.data ?? [], explorerState.filters),
      retrievalRate: applyClientFilters(retrievalQueries.rate.data ?? [], explorerState.filters),
      retrievalLatency: applyClientFilters(retrievalQueries.latency.data ?? [], explorerState.filters),
      retrievalErrors: applyClientFilters(retrievalQueries.errors.data ?? [], explorerState.filters),
      traces: applyClientFilters(tracesQuery.data ?? [], explorerState.filters),
    },
  };
}

function applyClientFilters<Row extends Record<string, unknown>>(
  rows: readonly Row[],
  filters: readonly ExplorerFilter[]
): readonly Row[] {
  const relevant = filters.filter(
    (filter) =>
      filter.field === "spanType" ||
      filter.op === "neq" ||
      filter.op === "not_in" ||
      filter.op === "eq" ||
      filter.op === "in"
  );
  if (relevant.length === 0) return rows;
  return rows.filter((row) => relevant.every((filter) => rowMatchesFilter(row, filter)));
}

function rowMatchesFilter(row: Record<string, unknown>, filter: ExplorerFilter): boolean {
  const values = filter.value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (values.length === 0) return true;

  const rawValue =
    filter.field === "spanType" ? inferAiSpanType(stringValue(row.operation)) : row[filter.field];
  if (rawValue == null || rawValue === "") return true;

  const value = stringValue(rawValue);
  const matches = values.some((candidate) => candidate.toLowerCase() === value.toLowerCase());
  if (filter.op === "neq" || filter.op === "not_in") return !matches;
  if (filter.op === "eq" || filter.op === "in") return matches;
  return true;
}

function stringValue(value: unknown): string {
  return value == null ? "" : String(value);
}
