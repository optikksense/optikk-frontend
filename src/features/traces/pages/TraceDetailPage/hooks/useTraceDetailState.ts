import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

import { Route } from "@/routes/_app/traces/$traceId";
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
  const { startTime, endTime } = Route.useSearch();
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

  const data = useTraceDetailData(selectedTenantId, traceIdParam, startTime, endTime);

  const resolvedTraceId = useMemo(
    () => (data.spans.length > 0 ? data.spans[0].trace_id || traceIdParam : traceIdParam),
    [data.spans, traceIdParam]
  );

  const traceTimeBounds = useMemo(() => computeTraceTimeBounds(data.spans), [data.spans]);

  const serviceMap = useTraceServiceMap(
    traceIdParam,
    traceTimeBounds.startMs ?? 0,
    traceTimeBounds.endMs ?? 0,
    activeTab === "servicemap",
    startTime,
    endTime
  );

  const traceErrors = useTraceErrors(traceIdParam, startTime, endTime, activeTab === "errors");

  const enhancedTab = data.selectedSpanId ? "related" : "attributes";

  const enhanced = useTraceDetailEnhanced(
    traceIdParam,
    data.selectedSpanId,
    data.selectedSpan ?? data.spans[0] ?? null,
    startTime,
    endTime,
    enhancedTab
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
