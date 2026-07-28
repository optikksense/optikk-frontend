import type { CriticalPathSpanRecord, TraceRecord } from "@shared/api/traces/schemas";
import { tracesService } from "@shared/api/traces/tracesApi";
import { useImmutableQuery as useStandardQuery } from "@shared/hooks/useImmutableQuery";
import { useCallback, useMemo, useState } from "react";
import { deriveErrorSpanIds } from "../utils/tracePaths";

export function useTraceDetailEnhanced(
  tenantId: number | null,
  traceId: string,
  spans: readonly TraceRecord[],
  criticalPath: readonly CriticalPathSpanRecord[],
  selectedSpanId: string | null,
  relatedContext: { serviceName?: string; operationName?: string } | null,
  bounds: { startMs?: number; endMs?: number }
) {
  const enabled = !!traceId;
  const startMs = bounds.startMs ?? 0;
  const endMs = bounds.endMs ?? 0;
  const hasBounds = startMs > 0 && endMs >= startMs;

  const { data: spanEventsData } = useStandardQuery({
    queryKey: ["trace-span-events", tenantId, traceId, startMs, endMs],
    queryFn: ({ signal }) => tracesService.getSpanEvents(traceId, startMs, endMs, signal),
    enabled: !!tenantId && enabled && !!selectedSpanId && hasBounds,
  });

  const relatedKey = `${selectedSpanId ?? ""}|${relatedContext?.serviceName ?? ""}|${relatedContext?.operationName ?? ""}`;
  const [requestedRelatedKey, setRequestedRelatedKey] = useState<string | null>(null);
  const relatedTracesRequested = requestedRelatedKey === relatedKey;
  const loadRelatedTraces = useCallback(() => setRequestedRelatedKey(relatedKey), [relatedKey]);

  const { data: relatedTracesData, isPending: relatedTracesLoading } = useStandardQuery({
    queryKey: [
      "trace-related",
      tenantId,
      traceId,
      relatedContext?.serviceName,
      relatedContext?.operationName,
      startMs,
      endMs,
    ],
    queryFn: ({ signal }) =>
      tracesService.getRelatedTraces(
        traceId,
        relatedContext?.serviceName,
        relatedContext?.operationName,
        startMs,
        endMs,
        signal
      ),
    enabled:
      enabled &&
      !!tenantId &&
      relatedTracesRequested &&
      !!relatedContext?.serviceName &&
      !!relatedContext?.operationName &&
      startMs > 0 &&
      endMs > startMs,
  });

  const { data: spanAttributesData, isPending: spanAttributesPending } = useStandardQuery({
    queryKey: ["span-attributes", tenantId, traceId, selectedSpanId, startMs, endMs],
    queryFn: ({ signal }) =>
      tracesService.getSpanAttributes(traceId, selectedSpanId!, startMs, endMs, signal),
    enabled: !!tenantId && !!selectedSpanId && hasBounds,
  });

  const criticalPathSpanIds = useMemo(
    () => new Set(criticalPath.map((s) => s.spanId)),
    [criticalPath]
  );
  const errorPathSpanIds = useMemo(() => deriveErrorSpanIds(spans), [spans]);

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
    relatedTracesRequested,
    relatedTracesLoading,
    loadRelatedTraces,
    spanAttributes,
    spanAttributesLoading: spanAttributesPending,
  };
}
