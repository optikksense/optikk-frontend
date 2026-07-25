import type { TraceRecord } from "@shared/api/traces/schemas";
import { useCallback, useMemo, useState } from "react";
import type { SpanAttributes, VisualizationTab } from "../types/detail";

interface UseTraceDetailViewerStateProps {
  readonly spans: readonly TraceRecord[];
  readonly getSpanAttributes?: (spanId: string) => SpanAttributes | null;
}

export function useTraceDetailViewerState({
  spans,
  getSpanAttributes,
}: UseTraceDetailViewerStateProps) {
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<VisualizationTab>("waterfall");
  const [activeService, setActiveService] = useState<string | null>(null);

  const selectedSpan = useMemo(() => {
    if (!selectedSpanId) return null;
    const s = spans.find((sp) => sp.spanId === selectedSpanId);
    if (!s) return null;
    return {
      spanId: s.spanId,
      operationName: s.operationName,
      serviceName: s.serviceName,
      status: s.status,
      spanKind: s.spanKind,
      durationMs: s.durationMs,
      httpMethod: s.httpMethod,
      responseStatusCode: s.httpStatusCode ? String(s.httpStatusCode) : undefined,
      startTime: s.startTime,
      endTime: s.endTime,
    };
  }, [spans, selectedSpanId]);

  const currentAttributes = useMemo(() => {
    if (!selectedSpanId) return null;
    return getSpanAttributes ? getSpanAttributes(selectedSpanId) : null;
  }, [selectedSpanId, getSpanAttributes]);

  const handleSpanClick = useCallback(({ spanId }: { spanId: string }) => {
    setSelectedSpanId(spanId);
  }, []);

  const handleCloseSpan = useCallback(() => {
    setSelectedSpanId(null);
  }, []);

  const handleServiceChange = useCallback(
    (svc: string | null) => {
      setActiveService(svc);
      if (svc) {
        const first = spans.find((s) => s.serviceName === svc);
        if (first?.spanId) setSelectedSpanId(first.spanId);
      }
    },
    [spans]
  );

  return {
    selectedSpanId,
    selectedSpan,
    activeTab,
    setActiveTab,
    activeService,
    currentAttributes,
    handleSpanClick,
    handleCloseSpan,
    handleServiceChange,
  };
}
