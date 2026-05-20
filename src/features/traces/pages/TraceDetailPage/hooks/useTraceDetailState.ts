import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

import { useAppStore } from "@store/appStore";

import { useTraceDetailData } from "../../../hooks/useTraceDetailData";
import { useTraceDetailEnhanced } from "../../../hooks/useTraceDetailEnhanced";
import { useTraceFlamegraph } from "../../../hooks/useTraceFlamegraph";
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
  };
}
