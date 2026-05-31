import { tracesService } from "../api/tracesApi";
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
  relatedContext?: { service_name?: string; operation_name?: string } | null,
  startMs?: number,
  endMs?: number,
  activeDetailTab = "attributes"
) {
  const enabled = !!traceId;

  // Critical path + error path always load — used for waterfall span highlighting
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

  // Events — load eagerly when any span is selected (unified scroll panel)
  const { data: spanEventsData } = useStandardQuery({
    queryKey: ["trace-span-events", traceId],
    queryFn: () => tracesService.getSpanEvents(traceId),
    enabled: enabled && !!selectedSpanId,
  });

  const { data: relatedTracesData } = useStandardQuery({
    queryKey: [
      "trace-related",
      traceId,
      relatedContext?.service_name,
      relatedContext?.operation_name,
      startMs,
      endMs,
    ],
    queryFn: () =>
      tracesService.getRelatedTraces(
        traceId,
        relatedContext?.service_name,
        relatedContext?.operation_name,
        startMs,
        endMs
      ),
    enabled:
      enabled &&
      activeDetailTab === "related" &&
      !!relatedContext?.service_name &&
      !!relatedContext?.operation_name &&
      startMs != null &&
      endMs != null,
  });

  const { data: spanAttributesData, isPending: spanAttributesPending } = useStandardQuery({
    queryKey: ["span-attributes", traceId, selectedSpanId],
    queryFn: () => tracesService.getSpanAttributes(traceId, selectedSpanId!),
    enabled: !!selectedSpanId,
  });

  const criticalPathSpanIds = useMemo<Set<string>>(() => {
    const arr: CriticalPathSpan[] =
      criticalPathData?.map((item) => ({
        spanId: item.span_id,
        operationName: item.operation_name,
        serviceName: item.service_name,
        durationMs: item.duration_ms,
      })) ?? [];
    return new Set(arr.map((s) => s.spanId));
  }, [criticalPathData]);

  const errorPathSpanIds = useMemo<Set<string>>(() => {
    const arr: ErrorPathSpan[] =
      errorPathData?.map((item) => ({
        spanId: item.span_id,
        parentSpanId: item.parent_span_id,
        operationName: item.operation_name,
        serviceName: item.service_name,
        status: item.status,
        statusMessage: item.status_message,
        startTime: item.start_time,
        durationMs: item.duration_ms,
      })) ?? [];
    return new Set(arr.map((s) => s.spanId));
  }, [errorPathData]);

  const spanEvents = useMemo<SpanEvent[]>(
    () =>
      spanEventsData?.map((item) => ({
        spanId: item.span_id,
        traceId: item.trace_id,
        eventName: item.event_name,
        timestamp: item.timestamp,
        attributes: item.attributes,
      })) ?? [],
    [spanEventsData]
  );

  const relatedTraces = useMemo<RelatedTrace[]>(
    () =>
      relatedTracesData?.map((item) => ({
        traceId: item.trace_id,
        spanId: item.span_id,
        operationName: item.operation_name,
        serviceName: item.service_name,
        durationMs: item.duration_ms,
        status: item.status,
        startTime: item.start_time,
      })) ?? [],
    [relatedTracesData]
  );

  const spanAttributes = useMemo<SpanAttributes | null>(() => {
    if (!spanAttributesData) return null;
    return {
      spanId: spanAttributesData.span_id,
      traceId: spanAttributesData.trace_id,
      operationName: spanAttributesData.operation_name,
      serviceName: spanAttributesData.service_name,
      attributesString: spanAttributesData.attributes_string,
      resourceAttributes: spanAttributesData.resource_attributes,
      exceptionType: spanAttributesData.exception_type,
      exceptionMessage: spanAttributesData.exception_message,
      exceptionStacktrace: spanAttributesData.exception_stacktrace,
      dbSystem: spanAttributesData.db_system,
      dbName: spanAttributesData.db_name,
      dbStatement: spanAttributesData.db_statement,
      dbStatementNormalized: spanAttributesData.db_statement_normalized,
      attributes: spanAttributesData.attributes,
      links: spanAttributesData.links?.map((l) => ({
        traceId: l.trace_id,
        spanId: l.span_id,
        traceState: l.trace_state,
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
