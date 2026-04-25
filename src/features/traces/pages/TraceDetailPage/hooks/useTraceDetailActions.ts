import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

import { useTimeRange } from "@shared/hooks/useTimeRangeQuery";
import { buildLogsHubHref, traceIdEqualsFilter } from "@shared/observability/deepLinks";

import type { useTraceDetailData } from "../../../hooks/useTraceDetailData";

type State = {
  resolvedTraceId: string;
  traceTimeBounds: { startMs?: number; endMs?: number };
  setSelectedSpanId: ReturnType<typeof useTraceDetailData>["setSelectedSpanId"];
};

/** Writes `?span=<id>` to the URL so deep-links round-trip (B16). */
function writeSpanQueryParam(spanId: string | null) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (spanId) url.searchParams.set("span", spanId);
  else url.searchParams.delete("span");
  window.history.replaceState(window.history.state, "", url.toString());
}

export function useTraceDetailActions({
  resolvedTraceId,
  traceTimeBounds,
  setSelectedSpanId,
}: State) {
  const navigate = useNavigate();
  const { getTimeRange } = useTimeRange();

  const handleSpanClick = useCallback(
    (span: { span_id?: string }) => {
      const id = span.span_id ?? null;
      setSelectedSpanId(id);
      writeSpanQueryParam(id);
    },
    [setSelectedSpanId],
  );

  const openInLogs = useCallback(() => {
    const { startTime, endTime } = getTimeRange();
    const fromMs = traceTimeBounds.startMs ?? Number(startTime);
    const toMs = traceTimeBounds.endMs ?? Number(endTime);
    navigate({
      to: buildLogsHubHref({
        filters: [traceIdEqualsFilter(resolvedTraceId)],
        fromMs,
        toMs,
      }) as never,
    });
  }, [getTimeRange, navigate, resolvedTraceId, traceTimeBounds.endMs, traceTimeBounds.startMs]);

  const goBack = useCallback(() => navigate({ to: "/traces" }), [navigate]);

  return { handleSpanClick, openInLogs, goBack };
}
