import { tracesService } from "@shared/api/tracesService";
import { toApiErrorShape } from "@shared/api/utils/errorNormalization";
import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { useImmutableQuery as useStandardQuery } from "@shared/hooks/useImmutableQuery";
import { useEffect, useMemo, useState } from "react";
import { getTraceLogs } from "@/features/log/api/traceLogsApi";
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

  // Fetch logs in parallel with spans — both key off traceIdParam, not the
  // resolved id. The backend tolerates either form (see traceidmatch helper).
  // Fixes the spans→logs waterfall that was costing one full RTT on every mount.
  const {
    data: logsData,
    isPending: logsLoading,
    isError: logsIsError,
    error: logsError,
  } = useStandardQuery({
    queryKey: ["trace-logs", selectedTeamId, traceIdParam],
    queryFn: () => getTraceLogs(traceIdParam),
    enabled: !!selectedTeamId && !!traceIdParam,
  });

  const traceLogs = useMemo(
    () => (logsData?.logs ?? []).map(normalizeTraceLog),
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
