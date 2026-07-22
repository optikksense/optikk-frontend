import { tracesService } from "@shared/api/traces/tracesApi";
import { toApiErrorShape } from "@shared/api/utils/errorNormalization";
import { useImmutableQuery as useStandardQuery } from "@shared/hooks/useImmutableQuery";
import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { useTimeRange } from "@shared/hooks/useTimeRangeQuery";
import { getTraceLogs } from "@shared/logs/api/traceLogsApi";
import { useEffect, useMemo, useState } from "react";
import { calculateTraceStats, normalizeSpan, normalizeTraceLog } from "../utils/traceCalculations";

export function useTraceDetailData(selectedTenantId: number | null, traceIdParam: string) {
  const [searchParams] = useSearchParams();
  const { getTimeRange } = useTimeRange();
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(
    () => searchParams.get("span") || null
  );

  // Sync span from URL on mount
  useEffect(() => {
    const spanFromUrl = searchParams.get("span");
    if (spanFromUrl) setSelectedSpanId(spanFromUrl);
  }, [searchParams]);

  const { startTime, endTime } = getTimeRange();
  const startMs = Number(startTime);
  const endMs = Number(endTime);

  const {
    data: spansData,
    isPending: spansLoading,
    isError: spansIsError,
    error: spansError,
  } = useStandardQuery({
    queryKey: ["trace-spans", selectedTenantId, traceIdParam, startMs, endMs],
    queryFn: () => tracesService.getTraceSpans(selectedTenantId, traceIdParam, startMs, endMs),
    enabled: !!selectedTenantId && !!traceIdParam,
  });

  const spans = useMemo(
    () => (Array.isArray(spansData) ? spansData : []).map(normalizeSpan),
    [spansData]
  );

  const {
    data: logsData,
    isPending: logsLoading,
    isError: logsIsError,
    error: logsError,
  } = useStandardQuery({
    queryKey: ["trace-logs", selectedTenantId, traceIdParam],
    queryFn: () => getTraceLogs(traceIdParam),
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
