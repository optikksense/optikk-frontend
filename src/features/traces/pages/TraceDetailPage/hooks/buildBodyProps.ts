import type { useTraceDetailActions } from "./useTraceDetailActions";
import type { useTraceDetailState } from "./useTraceDetailState";

type State = ReturnType<typeof useTraceDetailState>;
type Actions = ReturnType<typeof useTraceDetailActions>;

/**
 * Assembles the prop bundles the page passes to TraceDetailBody. Pulled out of
 * useTraceDetailPage so the hook stays small and the prop-shaping logic is
 * unit-testable in isolation.
 */
export function buildBodyProps(state: State, actions: Actions) {
  const rootSpan = state.data.spans[0];
  return {
    meta: {
      traceId: state.resolvedTraceId,
      stats: state.data.stats,
      criticalPathCount: state.enhanced.criticalPathSpanIds.size,
      linkedLogsCount: state.data.traceLogs.length,
      startMs: state.traceTimeBounds.startMs,
      rootService: rootSpan?.service_name,
      rootOperation: rootSpan?.operation_name,
    },
    serviceBar: {
      spans: state.data.spans,
      spanKindBreakdown: state.enhanced.spanKindBreakdown,
    },
    visualization: {
      activeTab: state.activeTab,
      onActiveTabChange: state.setActiveTab,
      spans: state.data.spans,
      selectedSpanId: state.data.selectedSpanId,
      onSpanClick: actions.handleSpanClick,
      criticalPathSpanIds: state.enhanced.criticalPathSpanIds,
      errorPathSpanIds: state.enhanced.errorPathSpanIds,
      flamegraphData: state.flamegraph.data ?? null,
      flamegraphLoading: state.flamegraph.isLoading,
      flamegraphError: state.flamegraph.isError,
    },
    drawer: {
      traceId: state.resolvedTraceId,
      selectedSpanId: state.data.selectedSpanId,
      selectedSpan: state.data.selectedSpan ?? null,
      spanAttributes: state.enhanced.spanAttributes,
      spanAttributesLoading: state.enhanced.spanAttributesLoading,
      spanEvents: state.enhanced.spanEvents,
      spanSelfTimes: state.enhanced.spanSelfTimes,
      relatedTraces: state.enhanced.relatedTraces,
      activeTab: state.activeDetailTab,
      onActiveTabChange: state.setActiveDetailTab,
    },
  };
}
