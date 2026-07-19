import { useCallback, useMemo } from "react";

import { useTracesStore } from "../../../store/tracesStore";

import { useTraceDetailActions } from "./useTraceDetailActions";
import { useTraceDetailHotkeys } from "./useTraceDetailHotkeys";
import { useTraceDetailState } from "./useTraceDetailState";

import type { TraceDetailLayoutProps } from "../components/TraceDetailLayout";

export function useTraceDetailPage() {
  const state = useTraceDetailState();
  const actions = useTraceDetailActions({
    resolvedTraceId: state.resolvedTraceId,
    traceTimeBounds: state.traceTimeBounds,
    setSelectedSpanId: state.data.setSelectedSpanId,
    selectedSpanId: state.data.selectedSpanId,
  });

  const setVisualizationTab = useTracesStore((s) => s.setVisualizationTab);

  const errorSpanIds = useMemo(
    () => Array.from(state.enhanced.errorPathSpanIds),
    [state.enhanced.errorPathSpanIds]
  );
  const onSelectSpan = useCallback(
    (id: string) => actions.handleSpanClick({ spanId: id }),
    [actions]
  );

  useTraceDetailHotkeys({
    traceId: state.resolvedTraceId,
    spans: state.data.spans,
    errorSpanIds,
    selectedSpanId: state.data.selectedSpanId,
    onSelectSpan,
    onCloseSpan: actions.closeSpan,
    onSetViz: setVisualizationTab,
  });

  const layoutProps: Omit<TraceDetailLayoutProps, "traceId" | "errorCount"> = useMemo(
    () => ({
      activeTab: state.activeTab,
      onActiveTabChange: state.setActiveTab,
      spans: state.data.spans,
      selectedSpanId: state.data.selectedSpanId,
      selectedSpan: state.data.selectedSpan ?? null,
      onSpanClick: actions.handleSpanClick,
      onCloseSpan: actions.closeSpan,
      criticalPathSpanIds: state.enhanced.criticalPathSpanIds,
      errorPathSpanIds: state.enhanced.errorPathSpanIds,
      serviceMap: state.serviceMap.data ?? null,
      errorGroups: state.traceErrors.data ?? [],
      spanAttributes: state.enhanced.spanAttributes,
      spanAttributesLoading: state.enhanced.spanAttributesLoading,
      spanEvents: state.enhanced.spanEvents,
      traceLogs: state.data.traceLogs,
      relatedTraces: state.enhanced.relatedTraces,
      onAddFilter: actions.addFilter,
      onOpenSpanInLogs: actions.openInLogs,
    }),
    [state, actions]
  );

  return {
    traceIdParam: state.traceIdParam,
    data: state.data,
    stats: state.data.stats,
    resolvedTraceId: state.resolvedTraceId,
    traceTimeBounds: state.traceTimeBounds,
    actions,
    layoutProps,
  };
}
