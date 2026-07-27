import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

import { useAppStore } from "@app/store/appStore";

import { useTraceDetailData } from "../../../hooks/useTraceDetailData";
import { useTraceDetailEnhanced } from "../../../hooks/useTraceDetailEnhanced";
import { useTraceErrors } from "../../../hooks/useTraceErrors";
import { useTraceServiceMap } from "../../../hooks/useTraceServiceMap";
import { type VisualizationTab, useTracesStore } from "../../../store/tracesStore";
import { computeTraceTimeBounds } from "../utils";

export function useTraceDetailState() {
  const { traceId } = useParams({ strict: false });
  const traceIdParam = traceId ?? "";
  const selectedTenantId = useAppStore((state) => state.selectedTenantId);

  const rawActiveTab = useTracesStore((s) => s.visualizationTab);
  // Coerce any stale persisted tab (e.g. the removed "flamegraph") to a valid one.
  const activeTab: VisualizationTab =
    rawActiveTab === "servicemap" ||
    rawActiveTab === "timeline" ||
    rawActiveTab === "errors" ||
    rawActiveTab === "raw"
      ? rawActiveTab
      : "timeline";
  const setActiveTab = useTracesStore((s) => s.setVisualizationTab);

  const data = useTraceDetailData(selectedTenantId, traceIdParam);

  const resolvedTraceId = useMemo(
    () => (data.spans.length > 0 ? data.spans[0].traceId || traceIdParam : traceIdParam),
    [data.spans, traceIdParam]
  );

  const traceTimeBounds = useMemo(() => {
    const bounds = computeTraceTimeBounds(data.spans);
    if (bounds.startMs !== undefined && bounds.endMs !== undefined) return bounds;
    if (data.traceLogs.length > 0) {
      let minStart = Number.POSITIVE_INFINITY;
      let maxEnd = Number.NEGATIVE_INFINITY;
      for (const log of data.traceLogs) {
        const t = log.timestamp ? new Date(log.timestamp).getTime() : Number.NaN;
        if (Number.isFinite(t)) {
          if (t < minStart) minStart = t;
          if (t > maxEnd) maxEnd = t;
        }
      }
      if (Number.isFinite(minStart) && Number.isFinite(maxEnd)) {
        return { startMs: minStart, endMs: maxEnd };
      }
    }
    return bounds;
  }, [data.spans, data.traceLogs]);

  const serviceMap = useTraceServiceMap(
    selectedTenantId,
    traceIdParam,
    traceTimeBounds,
    activeTab === "servicemap"
  );

  const traceErrors = useTraceErrors(
    selectedTenantId,
    traceIdParam,
    traceTimeBounds,
    activeTab === "errors"
  );

  const enhanced = useTraceDetailEnhanced(
    selectedTenantId,
    traceIdParam,
    data.spans,
    data.selectedSpanId,
    data.selectedSpan ?? data.spans[0] ?? null,
    traceTimeBounds
  );

  return {
    traceIdParam,
    resolvedTraceId,
    traceTimeBounds,
    activeTab,
    setActiveTab,
    data,
    enhanced,
    serviceMap,
    traceErrors,
  };
}
