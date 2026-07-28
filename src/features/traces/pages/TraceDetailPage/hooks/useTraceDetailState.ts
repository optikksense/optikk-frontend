import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

import { useAppStore } from "@app/store/appStore";

import { useTraceDetailData } from "../../../hooks/useTraceDetailData";
import { useTraceServiceMap } from "../../../hooks/useTraceServiceMap";
import { type VisualizationTab, useTracesStore } from "../../../store/tracesStore";

export function useTraceDetailState() {
  const { traceId } = useParams({ strict: false });
  const traceIdParam = traceId ?? "";
  const selectedTenantId = useAppStore((state) => state.selectedTenantId);

  const rawActiveTab = useTracesStore((s) => s.visualizationTab);

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

  const serviceMap = useTraceServiceMap(
    selectedTenantId,
    data.serviceMap,
    data.traceTimeBounds,
    activeTab === "servicemap"
  );

  return {
    traceIdParam,
    resolvedTraceId,
    traceTimeBounds: data.traceTimeBounds,
    activeTab,
    setActiveTab,
    data,
    serviceMap,
  };
}
