import { useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useAppStore } from "@store/appStore";

import { useTraceBundle } from "../../../hooks/useTraceBundle";
import { useTraceDetailData } from "../../../hooks/useTraceDetailData";
import { useTraceDetailEnhanced } from "../../../hooks/useTraceDetailEnhanced";
import { useTraceFlamegraph } from "../../../hooks/useTraceFlamegraph";
import { computeTraceTimeBounds } from "../utils";

import { useTraceDetailTabs } from "./useTraceDetailTabs";

export function useTraceDetailState() {
  const { traceId } = useParams({ strict: false });
  const traceIdParam = traceId ?? "";
  const selectedTeamId = useAppStore((state) => state.selectedTeamId);

  const tabs = useTraceDetailTabs();
  // Fire /bundle in parallel with the per-endpoint hooks. When it resolves
  // first it seeds the individual React Query caches so the five sibling
  // hooks return data without their own network round-trip.
  useTraceBundle(selectedTeamId, traceIdParam);
  const data = useTraceDetailData(selectedTeamId, traceIdParam);

  const resolvedTraceId = useMemo(
    () => (data.spans.length > 0 ? data.spans[0].trace_id || traceIdParam : traceIdParam),
    [data.spans, traceIdParam]
  );

  const traceTimeBounds = useMemo(() => computeTraceTimeBounds(data.spans), [data.spans]);

  const flamegraph = useTraceFlamegraph(traceIdParam, tabs.activeTab === "flamegraph");

  const enhanced = useTraceDetailEnhanced(
    traceIdParam,
    data.selectedSpanId,
    data.selectedSpan ?? data.spans[0] ?? null,
    traceTimeBounds.startMs,
    traceTimeBounds.endMs,
    tabs.activeDetailTab
  );

  return { traceIdParam, resolvedTraceId, traceTimeBounds, ...tabs, data, enhanced, flamegraph };
}
