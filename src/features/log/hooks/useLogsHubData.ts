import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { useRefreshKey, useTeamId, useTimeRange } from "@app/store/appStore";

import { useLiveTailStream } from "@/features/explorer-core/hooks/useLiveTailStream";
import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import type { LogEntry } from "@entities/log/model";
import { getTimestampMs, rowKey as logRowKey } from "@shared/utils/logUtils";

import type { StructuredFilter } from "@shared/hooks/useURLFilters";
import { logsExplorerApi } from "../api/logsExplorerApi";
import type { LogAggregateRow, LogFacet, LogVolumeBucket, LogsBackendParams } from "../types";

export interface UseLogsHubDataProps {
  explorerQuery: string;
  filters: StructuredFilter[];
  /** Params derived for live tail (legacy socket payload shape). */
  liveTailParams: LogsBackendParams;
  /** Cursor for the current page; empty string = first page. */
  cursor: string;
  pageSize: number;
}

const DEFAULT_STEP = "5m";

// Ring-buffer size for the logs live tail. Virtualisation in
// ExplorerResultsTable handles render cost, so the cap is chosen to
// survive 5 s of a 50-event/s burst without evicting visible rows.
export const LOGS_LIVE_TAIL_MAX_ROWS = 250;

export function useLogsHubData({
  explorerQuery,
  filters: _filters,
  liveTailParams,
  cursor,
  pageSize,
}: UseLogsHubDataProps) {
  const selectedTeamId = useTeamId();
  const timeRange = useTimeRange();
  const refreshKey = useRefreshKey();
  const [liveTailEnabled, setLiveTailEnabled] = useState(false);

  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);

  const explorerQueryKey = useMemo(
    () => ({
      startTime,
      endTime,
      limit: pageSize,
      step: DEFAULT_STEP,
      query: explorerQuery,
      cursor,
    }),
    [startTime, endTime, pageSize, explorerQuery, cursor]
  );

  const explorerQueryFn = useQuery({
    queryKey: ["logs", "explorer", selectedTeamId, explorerQueryKey, refreshKey],
    queryFn: () => logsExplorerApi.query(explorerQueryKey),
    enabled: Boolean(selectedTeamId),
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    retry: 2,
  });

  const liveTail = useLiveTailStream<LogEntry>({
    enabled: liveTailEnabled && Boolean(selectedTeamId),
    subscribeEvent: "subscribe:logs",
    itemEvent: "log",
    maxItems: LOGS_LIVE_TAIL_MAX_ROWS,
    params: { startMs: startTime, endMs: endTime, ...liveTailParams },
    getItemKey: (log) => logRowKey(log),
    getItemTimestamp: (log) => getTimestampMs(log),
    normalizeItem: (value) => {
      const record = value as LogEntry;
      return {
        ...record,
        level: record.severity_text ?? record.level ?? "",
        message: record.body ?? record.message ?? "",
        service: record.service_name ?? record.service ?? "",
        service_name: record.service_name ?? record.service ?? "",
      };
    },
  });

  const results = explorerQueryFn.data;
  const logs = useMemo(() => {
    if (!liveTailEnabled) return results?.results ?? [];
    return liveTail.items.slice(0, LOGS_LIVE_TAIL_MAX_ROWS);
  }, [liveTailEnabled, results?.results, liveTail.items]);
  const serviceFacets = (results?.facets.service_name ?? []) as LogFacet[];
  const levelFacets = (results?.facets.level ?? []) as LogFacet[];
  const hostFacets = (results?.facets.host ?? []) as LogFacet[];
  const podFacets = (results?.facets.pod ?? []) as LogFacet[];
  const containerFacets = (results?.facets.container ?? []) as LogFacet[];
  const environmentFacets = (results?.facets.environment ?? []) as LogFacet[];
  const scopeNameFacets = (results?.facets.scope_name ?? []) as LogFacet[];
  const aggregateRows = ((
    results?.correlations?.serviceErrorRate as { rows?: LogAggregateRow[] } | undefined
  )?.rows ?? []) as LogAggregateRow[];

  return {
    logs,
    logsLoading: liveTailEnabled
      ? liveTail.status === "connecting" && liveTail.items.length === 0
      : explorerQueryFn.isPending,
    logsError: explorerQueryFn.isError,
    logsErrorDetail: explorerQueryFn.error,
    hasMore: Boolean(results?.pageInfo.hasMore),
    nextCursor: results?.pageInfo.nextCursor ?? "",
    volumeBuckets: (results?.trend.buckets ?? []) as LogVolumeBucket[],
    volumeStep: results?.trend.step ?? DEFAULT_STEP,
    volumeLoading: explorerQueryFn.isPending,
    errorCount: Number(results?.summary.error_logs ?? 0),
    warnCount: Number(results?.summary.warn_logs ?? 0),
    totalCount: Number(results?.summary.total_logs ?? 0),
    serviceFacets,
    levelFacets,
    hostFacets,
    podFacets,
    containerFacets,
    environmentFacets,
    scopeNameFacets,
    statsLoading: explorerQueryFn.isPending,
    aggregateRows,
    aggregateLoading: explorerQueryFn.isPending,
    liveTailEnabled,
    setLiveTailEnabled,
    liveTailStatus: liveTail.status,
    liveTailLagMs: liveTail.lagMs,
    liveTailErrorMessage: liveTail.errorMessage,
    liveTailDroppedCount: liveTail.droppedCount,
  };
}
