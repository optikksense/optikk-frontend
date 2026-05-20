import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

import { useTimeRange } from "@shared/hooks/useTimeRangeQuery";
import { buildLogsHubHref, traceIdEqualsFilter } from "@shared/observability/deepLinks";

import type { useTraceDetailData } from "../../../hooks/useTraceDetailData";
import { useTracesStore } from "../../../store/tracesStore";

type State = {
  resolvedTraceId: string;
  traceTimeBounds: { startMs?: number; endMs?: number };
  setSelectedSpanId: ReturnType<typeof useTraceDetailData>["setSelectedSpanId"];
  selectedSpanId: string | null;
};

/** Writes `?span=<id>` to the URL so deep-links round-trip. */
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
  selectedSpanId,
}: State) {
  const navigate = useNavigate();
  const { getTimeRange } = useTimeRange();
  const setWaterfallSearch = useTracesStore((s) => s.setWaterfallSearch);
  const waterfallSearch = useTracesStore((s) => s.waterfallSearch);

  const handleSpanClick = useCallback(
    (span: { span_id?: string }) => {
      const id = span.span_id ?? null;
      // Re-clicking the open span closes the drawer (toggle behavior).
      const next = id && id === selectedSpanId ? null : id;
      setSelectedSpanId(next);
      writeSpanQueryParam(next);
    },
    [setSelectedSpanId, selectedSpanId]
  );

  const closeSpan = useCallback(() => {
    setSelectedSpanId(null);
    writeSpanQueryParam(null);
  }, [setSelectedSpanId]);

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

  /**
   * Append `key:value` token to the waterfall search bar (local in-trace filter — see plan §5).
   * Spans not matching get dimmed by the existing search highlighter.
   */
  const addFilter = useCallback(
    (key: string, value: string) => {
      const token = `${key}:${value}`;
      const current = waterfallSearch.trim();
      if (current.length === 0) {
        setWaterfallSearch(token);
        return;
      }
      const tokens = current.split(/\s+/);
      if (tokens.includes(token)) return;
      setWaterfallSearch(`${current} ${token}`);
    },
    [setWaterfallSearch, waterfallSearch]
  );

  return { handleSpanClick, closeSpan, openInLogs, goBack, addFilter };
}
