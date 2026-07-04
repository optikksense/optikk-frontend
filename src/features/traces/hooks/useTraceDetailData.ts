import { getTraceLogs } from "@/features/log/api/traceLogsApi";
import { toApiErrorShape } from "@shared/api/utils/errorNormalization";
import { useImmutableQuery as useStandardQuery } from "@shared/hooks/useImmutableQuery";
import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { useEffect, useMemo, useState } from "react";
import { tracesService } from "../api/tracesApi";
import { calculateTraceStats, normalizeSpan, normalizeTraceLog } from "../utils/traceCalculations";

export function useTraceDetailData(selectedTenantId: number | null, traceIdParam: string) {
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
    queryKey: ["trace-spans", selectedTenantId, traceIdParam],
    queryFn: () => tracesService.getTraceSpans(selectedTenantId, traceIdParam),
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
