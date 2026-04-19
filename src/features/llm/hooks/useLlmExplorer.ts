import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useCursorPagination } from "@/features/explorer-core/hooks/useCursorPagination";
import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { useRefreshKey, useTeamId, useTimeRange } from "@app/store/appStore";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { useURLFilters } from "@shared/hooks/useURLFilters";

import { llmExplorerApi } from "../api/llmExplorerApi";
import { llmHubApi } from "../api/llmHubApi";
import { EMPTY_LLM_FACETS, EMPTY_LLM_SUMMARY } from "../constants";
import type { LlmExplorerFacets, LlmSummary } from "../types";
import { buildLlmExplorerQuery } from "../utils/llmExplorerQuery";

const LLM_URL_FILTER_CONFIG = {
  params: [
    { key: "provider", type: "string" as const, defaultValue: "" },
    { key: "model", type: "string" as const, defaultValue: "" },
    { key: "session", type: "string" as const, defaultValue: "" },
    { key: "errorsOnly", type: "boolean" as const, defaultValue: false },
  ],
  syncStructuredFilters: true,
  stripParams: ["view", "search"],
};

export function useLlmExplorer() {
  const selectedTeamId = useTeamId();
  const timeRange = useTimeRange();
  const refreshKey = useRefreshKey();

  const {
    values: urlValues,
    setters: urlSetters,
    structuredFilters: filters,
    setStructuredFilters: setFilters,
    clearAll: clearURLFilters,
  } = useURLFilters(LLM_URL_FILTER_CONFIG);

  const selectedProvider =
    typeof urlValues.provider === "string" && urlValues.provider.length > 0
      ? urlValues.provider
      : null;
  const selectedModel =
    typeof urlValues.model === "string" && urlValues.model.length > 0 ? urlValues.model : null;
  const selectedSession =
    typeof urlValues.session === "string" && urlValues.session.length > 0
      ? urlValues.session
      : null;
  const errorsOnly = urlValues.errorsOnly === true;

  const setSelectedProvider = (value: string | null): void => {
    urlSetters.provider?.(value || "");
  };

  const setSelectedModel = (value: string | null): void => {
    urlSetters.model?.(value || "");
  };

  const setSelectedSession = (value: string | null): void => {
    urlSetters.session?.(value || "");
  };

  const setErrorsOnly = (value: boolean): void => {
    urlSetters.errorsOnly?.(value);
  };

  const { cursor, goNext, goPrev, reset: resetCursor, hasPrev } = useCursorPagination();
  const [pageSize, setPageSize] = useState(20);

  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);

  const { data: hubSettings } = useStandardQuery({
    queryKey: ["llm", "hub", "settings", selectedTeamId],
    queryFn: () => llmHubApi.getSettings(),
    enabled: Boolean(selectedTeamId),
    staleTime: 60_000,
  });

  const costCtx = useMemo(
    () => ({
      teamId: selectedTeamId,
      serverOverrides: hubSettings?.pricing_overrides,
    }),
    [hubSettings?.pricing_overrides, selectedTeamId]
  );

  const explorerQuery = useMemo(
    () =>
      buildLlmExplorerQuery({
        filters,
        errorsOnly,
        selectedProvider,
        selectedModel,
        selectedSession,
      }),
    [filters, errorsOnly, selectedProvider, selectedModel, selectedSession]
  );

  useEffect(() => {
    resetCursor();
  }, [explorerQuery, startTime, endTime, pageSize, selectedTeamId, resetCursor]);

  const { data, isPending, isError, error } = useQuery({
    queryKey: [
      "llm",
      "explorer",
      selectedTeamId,
      startTime,
      endTime,
      cursor,
      pageSize,
      explorerQuery,
      refreshKey,
      hubSettings?.pricing_overrides,
    ],
    queryFn: () =>
      llmExplorerApi.query(
        {
          startTime,
          endTime,
          limit: pageSize,
          cursor: cursor || undefined,
          step: "5m",
          query: explorerQuery,
        },
        costCtx
      ),
    enabled: Boolean(selectedTeamId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    retry: 2,
  });

  const generations = useMemo(() => data?.results ?? [], [data?.results]);
  const summary: LlmSummary = data?.summary ?? EMPTY_LLM_SUMMARY;
  const facets: LlmExplorerFacets = data?.facets ?? EMPTY_LLM_FACETS;
  const trend = data?.trend ?? [];

  const errorRate = summary.total_calls > 0 ? (summary.error_calls * 100) / summary.total_calls : 0;

  const clearAll = useCallback((): void => {
    clearURLFilters();
    resetCursor();
  }, [clearURLFilters, resetCursor]);

  const onNext = useCallback(
    () => goNext(data?.pageInfo?.nextCursor ?? ""),
    [goNext, data?.pageInfo?.nextCursor]
  );

  return {
    isPending,
    isError,
    error,
    generations,
    summary,
    facets,
    trend,
    errorRate,
    selectedProvider,
    selectedModel,
    selectedSession,
    errorsOnly,
    pageSize,
    hasMore: Boolean(data?.pageInfo?.hasMore),
    hasPrev,
    onNext,
    onPrev: goPrev,
    filters,
    startTime,
    endTime,
    explorerQuery,
    setSelectedProvider,
    setSelectedModel,
    setSelectedSession,
    setErrorsOnly,
    setPageSize: (size: number) => {
      setPageSize(size);
      resetCursor();
    },
    resetCursor,
    setFilters,
    clearAll,
  };
}
