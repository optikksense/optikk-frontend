import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

import { useAppStore } from "@store/appStore";

import { useTraceDetailData } from "../../../hooks/useTraceDetailData";
import { useTraceDetailEnhanced } from "../../../hooks/useTraceDetailEnhanced";
import { useTraceErrors } from "../../../hooks/useTraceErrors";
import { useTraceFlamegraph } from "../../../hooks/useTraceFlamegraph";
import { useTraceHotSpans } from "../../../hooks/useTraceHotSpans";
import { useTracePhaseBreakdown } from "../../../hooks/useTracePhaseBreakdown";
import { useTraceServiceMap } from "../../../hooks/useTraceServiceMap";
import { useTracesStore } from "../../../store/tracesStore";
import { computeTraceTimeBounds } from "../utils";

export function useTraceDetailState() {
  const { traceId } = useParams({ strict: false });
  const traceIdParam = traceId ?? "";
  const selectedTeamId = useAppStore((state) => state.selectedTeamId);

  const activeTab = useTracesStore((s) => s.visualizationTab);
  const setActiveTab = useTracesStore((s) => s.setVisualizationTab);
  const spanDetailTab = useTracesStore((s) => s.spanDetailTab);

  const data = useTraceDetailData(selectedTeamId, traceIdParam);

  const resolvedTraceId = useMemo(
    () => (data.spans.length > 0 ? data.spans[0].trace_id || traceIdParam : traceIdParam),
    [data.spans, traceIdParam]
  );

  const traceTimeBounds = useMemo(() => computeTraceTimeBounds(data.spans), [data.spans]);

  // Lazy: only fetch flamegraph when its viz tab is selected.
  const flamegraph = useTraceFlamegraph(traceIdParam, activeTab === "flamegraph");

  // Service-time breakdown + per-trace error groups (previously-unused endpoints).
  const serviceMap = useTraceServiceMap(traceIdParam);
  // Error groups only matter when the errors tab is open.
  const traceErrors = useTraceErrors(traceIdParam, activeTab === "errors");
  // Top-3 hot spans by self-time, derived from flamegraph frames (eager, cached).
  const hotSpans = useTraceHotSpans(traceIdParam);
  // Self-time grouped by execution phase, from the same cached frames.
  const phaseBreakdown = useTracePhaseBreakdown(traceIdParam);

  // The enhanced data hook gates `related-traces` on activeDetailTab === "related".
  // Our Links tab folds in related traces, so map "links" → "related" for that one switch.
  const enhancedTab = spanDetailTab === "links" ? "related" : "attributes";

  const enhanced = useTraceDetailEnhanced(
    traceIdParam,
    data.selectedSpanId,
    data.selectedSpan ?? data.spans[0] ?? null,
    traceTimeBounds.startMs,
    traceTimeBounds.endMs,
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
    flamegraph,
    serviceMap,
    traceErrors,
    hotSpans,
    phaseBreakdown,
  };
}
