import { tracesService } from "@shared/api/traces/tracesApi";
import { toApiErrorShape } from "@shared/api/utils/errorNormalization";
import { useTimeRange } from "@shared/hooks/useTimeRangeQuery";
import { getTraceLogs } from "@shared/logs/api/traceLogsApi";
import { useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { computeTraceTimeBounds } from "../pages/TraceDetailPage/utils";
import { calculateTraceStats, normalizeSpan, normalizeTraceLog } from "../utils/traceCalculations";
import { deriveErrorSpanIds } from "../utils/tracePaths";
import { useImmutableQuery } from "./useImmutableQuery";

// One data path for the trace detail page: the base trace payload, trace
// logs, and the span-scoped queries (events, attributes, related traces).
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
  } = useImmutableQuery({
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
  } = useImmutableQuery({
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

  // Trace bounds come from the spans; sparse traces fall back to log times.
  const traceTimeBounds = useMemo(() => {
    const bounds = computeTraceTimeBounds(spans);
    if (bounds.startMs !== undefined && bounds.endMs !== undefined) return bounds;
    let minStart = Number.POSITIVE_INFINITY;
    let maxEnd = Number.NEGATIVE_INFINITY;
    for (const log of traceLogs) {
      const t = log.timestamp ? new Date(log.timestamp).getTime() : Number.NaN;
      if (Number.isFinite(t)) {
        if (t < minStart) minStart = t;
        if (t > maxEnd) maxEnd = t;
      }
    }
    if (Number.isFinite(minStart) && Number.isFinite(maxEnd)) {
      return { startMs: minStart, endMs: maxEnd };
    }
    return bounds;
  }, [spans, traceLogs]);

  const boundsStartMs = traceTimeBounds.startMs ?? 0;
  const boundsEndMs = traceTimeBounds.endMs ?? 0;
  const hasBounds = boundsStartMs > 0 && boundsEndMs >= boundsStartMs;

  const { data: spanEventsData } = useImmutableQuery({
    queryKey: ["trace-span-events", selectedTenantId, traceIdParam, boundsStartMs, boundsEndMs],
    queryFn: ({ signal }) =>
      tracesService.getSpanEvents(traceIdParam, boundsStartMs, boundsEndMs, signal),
    enabled: !!selectedTenantId && !!traceIdParam && !!selectedSpanId && hasBounds,
  });

  const { data: spanAttributesData, isPending: spanAttributesPending } = useImmutableQuery({
    queryKey: [
      "span-attributes",
      selectedTenantId,
      traceIdParam,
      selectedSpanId,
      boundsStartMs,
      boundsEndMs,
    ],
    queryFn: ({ signal }) =>
      tracesService.getSpanAttributes(
        traceIdParam,
        selectedSpanId!,
        boundsStartMs,
        boundsEndMs,
        signal
      ),
    enabled: !!selectedTenantId && !!selectedSpanId && hasBounds,
  });

  // Related traces load on demand only.
  const relatedContext = selectedSpan ?? spans[0] ?? null;
  const relatedKey = `${selectedSpanId ?? ""}|${relatedContext?.serviceName ?? ""}|${relatedContext?.operationName ?? ""}`;
  const [requestedRelatedKey, setRequestedRelatedKey] = useState<string | null>(null);
  const relatedTracesRequested = requestedRelatedKey === relatedKey;
  const loadRelatedTraces = () => setRequestedRelatedKey(relatedKey);

  const { data: relatedTracesData, isPending: relatedTracesLoading } = useImmutableQuery({
    queryKey: [
      "trace-related",
      selectedTenantId,
      traceIdParam,
      relatedContext?.serviceName,
      relatedContext?.operationName,
      boundsStartMs,
      boundsEndMs,
    ],
    queryFn: ({ signal }) =>
      tracesService.getRelatedTraces(
        traceIdParam,
        relatedContext?.serviceName,
        relatedContext?.operationName,
        boundsStartMs,
        boundsEndMs,
        signal
      ),
    enabled:
      !!selectedTenantId &&
      !!traceIdParam &&
      relatedTracesRequested &&
      !!relatedContext?.serviceName &&
      !!relatedContext?.operationName &&
      boundsStartMs > 0 &&
      boundsEndMs > boundsStartMs,
  });

  const criticalPath = detailData?.criticalPath ?? [];
  const criticalPathSpanIds = useMemo(
    () => new Set((detailData?.criticalPath ?? []).map((s) => s.spanId)),
    [detailData]
  );
  const errorPathSpanIds = useMemo(() => deriveErrorSpanIds(spans), [spans]);

  return {
    spans,
    summary: detailData?.summary ?? null,
    criticalPath,
    serviceMap: detailData?.serviceMap,
    errorGroups: detailData?.errors ?? [],
    traceLogs,
    traceLogsIsSpeculative: logsData?.isSpeculative ?? false,
    stats,
    selectedSpan,
    selectedSpanId,
    setSelectedSpanId,
    traceTimeBounds,
    criticalPathSpanIds,
    errorPathSpanIds,
    spanEvents: spanEventsData ?? [],
    spanAttributes: spanAttributesData
      ? { ...spanAttributesData, attributes: spanAttributesData.attributes ?? {} }
      : null,
    spanAttributesLoading: spanAttributesPending,
    relatedTraces: relatedTracesData ?? [],
    relatedTracesRequested,
    relatedTracesLoading,
    loadRelatedTraces,
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
