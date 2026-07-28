import { tracesService } from "@shared/api/traces/tracesApi";
import { toApiErrorShape } from "@shared/api/utils/errorNormalization";
import { useImmutableQuery as useStandardQuery } from "@shared/hooks/useImmutableQuery";
import { useTimeRange } from "@shared/hooks/useTimeRangeQuery";
import { getTraceLogs } from "@shared/logs/api/traceLogsApi";
import { useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { calculateTraceStats, normalizeSpan, normalizeTraceLog } from "../utils/traceCalculations";

export function useTraceDetailData(selectedTenantId: number | null, traceIdParam: string) {
  const { span } = useSearch({ from: "/_app/traces/$traceId" });
  const { getTimeRange } = useTimeRange();
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(() => span || null);

  useEffect(() => {
    if (span) setSelectedSpanId(span);
  }, [span]);

  const { startTime, endTime } = getTimeRange();
  const startMs = Number(startTime);
  const endMs = Number(endTime);

  const {
    data: detailData,
    isPending: spansLoading,
    isError: spansIsError,
    error: spansError,
  } = useStandardQuery({
    queryKey: ["trace-detail", selectedTenantId, traceIdParam, startMs, endMs],
    queryFn: ({ signal }) => tracesService.getTraceDetail(traceIdParam, startMs, endMs, signal),
    enabled: !!selectedTenantId && !!traceIdParam,
  });

  const spans = useMemo(() => (detailData?.spans ?? []).map(normalizeSpan), [detailData]);

  const {
    data: logsData,
    isPending: logsLoading,
    isError: logsIsError,
    error: logsError,
  } = useStandardQuery({
    queryKey: ["trace-logs", selectedTenantId, traceIdParam, startMs, endMs],
    queryFn: ({ signal }) => getTraceLogs(traceIdParam, startMs, endMs, undefined, signal),
    enabled: !!selectedTenantId && !!traceIdParam,
  });

  const traceLogs = useMemo(() => (logsData?.logs ?? []).map(normalizeTraceLog), [logsData]);

  const stats = useMemo(() => calculateTraceStats(spans), [spans]);
  const selectedSpan = useMemo(
    () => spans.find((s) => s.spanId === selectedSpanId),
    [spans, selectedSpanId]
  );

  return {
    spans,
    summary: detailData?.summary ?? null,
    criticalPath: detailData?.criticalPath ?? [],
    serviceMap: detailData?.serviceMap,
    errorGroups: detailData?.errors ?? [],
    traceLogs,
    traceLogsIsSpeculative: logsData?.isSpeculative ?? false,
    stats,
    selectedSpan,
    selectedSpanId,
    setSelectedSpanId,
    isPending: spansLoading,
    isError: spansIsError || logsIsError,
    error: spansIsError
      ? toApiErrorShape(spansError)
      : logsIsError
        ? toApiErrorShape(logsError)
        : null,
    logsLoading,
  };
}
