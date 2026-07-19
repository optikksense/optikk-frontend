import { tracesService } from "@shared/api/traces/tracesApi";
import { useImmutableQuery as useStandardQuery } from "@shared/hooks/useImmutableQuery";
import { useMemo } from "react";
import type {
  CriticalPathSpan,
  ErrorPathSpan,
  RelatedTrace,
  SpanAttributes,
  SpanEvent,
} from "../types";

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

  const { data: criticalPathData } = useStandardQuery({
    queryKey: ["trace-critical-path", traceId],
    queryFn: () => tracesService.getCriticalPath(traceId),
    enabled,
  });

  const { data: errorPathData } = useStandardQuery({
    queryKey: ["trace-error-path", traceId],
    queryFn: () => tracesService.getErrorPath(traceId),
    enabled,
  });

  const { data: spanEventsData } = useStandardQuery({
    queryKey: ["trace-span-events", traceId],
    queryFn: () => tracesService.getSpanEvents(traceId),
    enabled: enabled && !!selectedSpanId,
  });

  // Related traces stay range-scoped: "other recent traces like this one" is a
  // range query, not a lookup by trace identity.
  const startMs = bounds.startMs ?? 0;
  const endMs = bounds.endMs ?? 0;

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
    queryKey: ["span-attributes", traceId, selectedSpanId],
    queryFn: () => tracesService.getSpanAttributes(traceId, selectedSpanId!),
    enabled: !!selectedSpanId,
  });

  const criticalPathSpanIds = useMemo<Set<string>>(() => {
    const arr: CriticalPathSpan[] =
      criticalPathData?.map((item) => ({
        spanId: item.spanId,
        operationName: item.operationName,
        serviceName: item.serviceName,
        durationMs: item.durationMs,
      })) ?? [];
    return new Set(arr.map((s) => s.spanId));
  }, [criticalPathData]);

  const errorPathSpanIds = useMemo<Set<string>>(() => {
    const arr: ErrorPathSpan[] =
      errorPathData?.map((item) => ({
        spanId: item.spanId,
        parentSpanId: item.parentSpanId,
        operationName: item.operationName,
        serviceName: item.serviceName,
        status: item.status,
        statusMessage: item.statusMessage,
        startTime: item.startTime,
        durationMs: item.durationMs,
      })) ?? [];
    return new Set(arr.map((s) => s.spanId));
  }, [errorPathData]);

  const spanEvents = useMemo<SpanEvent[]>(
    () =>
      spanEventsData?.map((item) => ({
        spanId: item.spanId,
        traceId: item.traceId,
        eventName: item.eventName,
        timestamp: item.timestamp,
        attributes: item.attributes,
      })) ?? [],
    [spanEventsData]
  );

  const relatedTraces = useMemo<RelatedTrace[]>(
    () =>
      relatedTracesData?.map((item) => ({
        traceId: item.traceId,
        spanId: item.spanId,
        operationName: item.operationName,
        serviceName: item.serviceName,
        durationMs: item.durationMs,
        status: item.status,
        startTime: item.startTime,
      })) ?? [],
    [relatedTracesData]
  );

  const spanAttributes = useMemo<SpanAttributes | null>(() => {
    if (!spanAttributesData) return null;
    return {
      spanId: spanAttributesData.spanId,
      traceId: spanAttributesData.traceId,
      operationName: spanAttributesData.operationName,
      serviceName: spanAttributesData.serviceName,
      attributesString: spanAttributesData.attributesString,
      resourceAttributes: spanAttributesData.resourceAttributes,
      exceptionType: spanAttributesData.exceptionType,
      exceptionMessage: spanAttributesData.exceptionMessage,
      exceptionStacktrace: spanAttributesData.exceptionStacktrace,
      dbSystem: spanAttributesData.dbSystem,
      dbName: spanAttributesData.dbName,
      dbStatement: spanAttributesData.dbStatement,
      dbStatementNormalized: spanAttributesData.dbStatementNormalized,
      // `attributes` is omitempty on the wire; the domain model always has one.
      attributes: spanAttributesData.attributes ?? {},
      links: spanAttributesData.links?.map((l) => ({
        traceId: l.traceId,
        spanId: l.spanId,
        traceState: l.traceState,
        attributes: l.attributes,
      })),
    };
  }, [spanAttributesData]);

  return {
    criticalPathSpanIds,
    errorPathSpanIds,
    spanEvents,
    relatedTraces,
    spanAttributes,
    spanAttributesLoading: spanAttributesPending,
  };
}
