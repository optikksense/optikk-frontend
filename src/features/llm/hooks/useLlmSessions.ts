import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { useRefreshKey, useTeamId, useTimeRange } from "@app/store/appStore";
import { useURLFilters } from "@shared/hooks/useURLFilters";

import { llmExplorerApi } from "../api/llmExplorerApi";
import { buildLlmExplorerQuery } from "../utils/llmExplorerQuery";

const LLM_SESSIONS_URL_FILTER_CONFIG = {
  params: [
    { key: "provider", type: "string" as const, defaultValue: "" },
    { key: "model", type: "string" as const, defaultValue: "" },
    { key: "session", type: "string" as const, defaultValue: "" },
    { key: "errorsOnly", type: "boolean" as const, defaultValue: false },
  ],
  syncStructuredFilters: true,
  stripParams: ["view", "search"],
};

export function useLlmSessions() {
  const selectedTeamId = useTeamId();
  const timeRange = useTimeRange();
  const refreshKey = useRefreshKey();

  const {
    values: urlValues,
    setters: urlSetters,
    structuredFilters: filters,
    setStructuredFilters: setFilters,
    clearAll: clearURLFilters,
  } = useURLFilters(LLM_SESSIONS_URL_FILTER_CONFIG);

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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);

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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "llm",
      "sessions",
      selectedTeamId,
      startTime,
      endTime,
      page,
      pageSize,
      explorerQuery,
      refreshKey,
    ],
    queryFn: () =>
      llmExplorerApi.sessionsQuery({
        startTime,
        endTime,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        query: explorerQuery,
      }),
    enabled: Boolean(selectedTeamId),
    placeholderData: (previous) => previous,
    retry: false,
  });

  const sessions = useMemo(() => data?.results ?? [], [data?.results]);
  const total = Number(data?.pageInfo?.total ?? 0);

  const clearAll = useCallback((): void => {
    clearURLFilters();
    setPage(1);
  }, [clearURLFilters]);

  return {
    isLoading,
    isError,
    error,
    sessions,
    total,
    selectedProvider,
    selectedModel,
    selectedSession,
    errorsOnly,
    page,
    pageSize,
    filters,
    startTime,
    endTime,
    explorerQuery,
    setSelectedProvider,
    setSelectedModel,
    setSelectedSession,
    setErrorsOnly,
    setPage,
    setPageSize,
    setFilters,
    clearAll,
  };
}
