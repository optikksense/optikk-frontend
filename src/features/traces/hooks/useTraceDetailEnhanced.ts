import { tracesService } from "@shared/api/tracesService";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type {
  CriticalPathSpan,
  ErrorPathSpan,
  RelatedTrace,
  SpanAttributes,
  SpanEvent,
  SpanKindDuration,
  SpanSelfTime,
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
  const { data: criticalPathData } = useQuery({
    queryKey: ["trace-critical-path", traceId],
    queryFn: () => tracesService.getCriticalPath(traceId),
    enabled,
  });

  const { data: errorPathData } = useQuery({
    queryKey: ["trace-error-path", traceId],
    queryFn: () => tracesService.getErrorPath(traceId),
    enabled,
  });

  // Span kind breakdown — only when detail drawer is open
  const { data: spanKindData } = useQuery({
    queryKey: ["trace-span-kind-breakdown", traceId],
    queryFn: () => tracesService.getSpanKindBreakdown(traceId),
    enabled: enabled && !!selectedSpanId,
  });

  // Events — only when events tab is active
  const { data: spanEventsData } = useQuery({
    queryKey: ["trace-span-events", traceId],
    queryFn: () => tracesService.getSpanEvents(traceId),
    enabled: enabled && activeDetailTab === "events",
  });

  // Self-times — only when self-time tab is active
  const { data: spanSelfTimesData } = useQuery({
    queryKey: ["trace-span-self-times", traceId],
    queryFn: () => tracesService.getSpanSelfTimes(traceId),
    enabled: enabled && activeDetailTab === "selftime",
  });

  const { data: relatedTracesData } = useQuery({
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

  const { data: spanAttributesData, isLoading: spanAttributesLoading } = useQuery({
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

  const spanKindBreakdown = useMemo<SpanKindDuration[]>(
    () =>
      spanKindData?.map((item) => ({
        spanKind: item.span_kind,
        totalDurationMs: item.total_duration_ms,
        spanCount: item.span_count,
        pctOfTrace: item.pct_of_trace,
      })) ?? [],
    [spanKindData]
  );

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

  const spanSelfTimes = useMemo<SpanSelfTime[]>(
    () =>
      spanSelfTimesData?.map((item) => ({
        spanId: item.span_id,
        operationName: item.operation_name,
        totalDurationMs: item.total_duration_ms,
        selfTimeMs: item.self_time_ms,
        childTimeMs: item.child_time_ms,
      })) ?? [],
    [spanSelfTimesData]
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
    };
  }, [spanAttributesData]);

  return {
    criticalPathSpanIds,
    errorPathSpanIds,
    spanKindBreakdown,
    spanEvents,
    spanSelfTimes,
    relatedTraces,
    spanAttributes,
    spanAttributesLoading,
  };
}
