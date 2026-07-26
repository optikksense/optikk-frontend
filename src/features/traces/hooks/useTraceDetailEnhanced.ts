import { tracesService } from "@shared/api/traces/tracesApi";
import { useImmutableQuery as useStandardQuery } from "@shared/hooks/useImmutableQuery";
import { useMemo } from "react";

/**
 * @param activeDetailTab - The currently active tab in SpanDetailDrawer.
 *   Queries for events, self-time, and related traces are lazy-loaded —
 *   they only fire when the user opens the corresponding tab.
 *   Critical path and error path always load since they're used for waterfall highlighting.
 */
export function useTraceDetailEnhanced(
  traceId: string,
  selectedSpanId: string | null,
  relatedContext: { serviceName?: string; operationName?: string } | null,
  bounds: { startMs?: number; endMs?: number },
  activeDetailTab = "attributes"
) {
  const enabled = !!traceId;
  const startMs = bounds.startMs ?? 0;
  const endMs = bounds.endMs ?? 0;
  const hasBounds = startMs > 0 && endMs >= startMs;

  const { data: criticalPathData } = useStandardQuery({
    queryKey: ["trace-critical-path", traceId, startMs, endMs],
    queryFn: () => tracesService.getCriticalPath(traceId, startMs, endMs),
    enabled: enabled && hasBounds,
  });

  const { data: errorPathData } = useStandardQuery({
    queryKey: ["trace-error-path", traceId, startMs, endMs],
    queryFn: () => tracesService.getErrorPath(traceId, startMs, endMs),
    enabled: enabled && hasBounds,
  });

  const { data: spanEventsData } = useStandardQuery({
    queryKey: ["trace-span-events", traceId, startMs, endMs],
    queryFn: () => tracesService.getSpanEvents(traceId, startMs, endMs),
    enabled: enabled && !!selectedSpanId,
  });

  const { data: relatedTracesData } = useStandardQuery({
    queryKey: [
      "trace-related",
      traceId,
      relatedContext?.serviceName,
      relatedContext?.operationName,
      startMs,
      endMs,
    ],
    queryFn: () =>
      tracesService.getRelatedTraces(
        traceId,
        relatedContext?.serviceName,
        relatedContext?.operationName,
        startMs,
        endMs
      ),
    enabled:
      enabled &&
      activeDetailTab === "related" &&
      !!relatedContext?.serviceName &&
      !!relatedContext?.operationName &&
      startMs > 0 &&
      endMs > startMs,
  });

  const { data: spanAttributesData, isPending: spanAttributesPending } = useStandardQuery({
    queryKey: ["span-attributes", traceId, selectedSpanId, startMs, endMs],
    queryFn: () => tracesService.getSpanAttributes(traceId, selectedSpanId!, startMs, endMs),
    enabled: !!selectedSpanId,
  });

  const criticalPathSpanIds = useMemo<Set<string>>(() => {
    return new Set(criticalPathData?.map((item) => item.spanId) ?? []);
  }, [criticalPathData]);

  const errorPathSpanIds = useMemo<Set<string>>(() => {
    return new Set(errorPathData?.map((item) => item.spanId) ?? []);
  }, [errorPathData]);

  const spanEvents = spanEventsData ?? [];
  const relatedTraces = relatedTracesData ?? [];
  const spanAttributes = spanAttributesData
    ? { ...spanAttributesData, attributes: spanAttributesData.attributes ?? {} }
    : null;

  return {
    criticalPathSpanIds,
    errorPathSpanIds,
    spanEvents,
    relatedTraces,
    spanAttributes,
    spanAttributesLoading: spanAttributesPending,
  };
}
