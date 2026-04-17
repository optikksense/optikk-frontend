import type { LogRecord } from "@/features/log/types";
import { tracesService } from "@shared/api/tracesService";
import { toApiErrorShape } from "@shared/api/utils/errorNormalization";
import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { useEffect, useMemo, useState } from "react";
import { calculateTraceStats, normalizeSpan, normalizeTraceLog } from "../utils/traceCalculations";

export function useTraceDetailData(selectedTeamId: number | null, traceIdParam: string) {
  const [searchParams] = useSearchParams();
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(
    () => searchParams.get("span") || null
  );

  // Sync span from URL on mount
  useEffect(() => {
    const spanFromUrl = searchParams.get("span");
    if (spanFromUrl) setSelectedSpanId(spanFromUrl);
  }, [searchParams]);

  const {
    data: spansData,
    isPending: spansLoading,
    isError: spansIsError,
    error: spansError,
  } = useStandardQuery({
    queryKey: ["trace-spans", selectedTeamId, traceIdParam],
    queryFn: () => tracesService.getTraceSpans(selectedTeamId, traceIdParam),
    enabled: !!selectedTeamId && !!traceIdParam,
  });

  const spans = useMemo(
    () => (Array.isArray(spansData) ? spansData : []).map(normalizeSpan),
    [spansData]
  );

  // Resolve actual trace_id
  const resolvedTraceId = spans.length > 0 ? spans[0].trace_id || traceIdParam : traceIdParam;

  // Fetch logs
  const {
    data: logsData,
    isPending: logsLoading,
    isError: logsIsError,
    error: logsError,
  } = useStandardQuery({
    queryKey: ["trace-logs", selectedTeamId, resolvedTraceId],
    queryFn: () => tracesService.getTraceLogs(selectedTeamId, resolvedTraceId),
    enabled: !!selectedTeamId && !!resolvedTraceId,
  });

  const traceLogs = useMemo(
    () => (logsData?.logs ?? []).map((log) => normalizeTraceLog(log) as LogRecord),
    [logsData]
  );

  const stats = useMemo(() => calculateTraceStats(spans), [spans]);
  const selectedSpan = useMemo(
    () => spans.find((s) => s.span_id === selectedSpanId),
    [spans, selectedSpanId]
  );

  return {
    spans,
    traceLogs,
    traceLogsIsSpeculative: logsData?.is_speculative ?? false,
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
