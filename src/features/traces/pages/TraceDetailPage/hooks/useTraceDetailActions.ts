import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

import { Route } from "@/routes/_app/traces/$traceId";
import { useTimeRange } from "@shared/hooks/useTimeRangeQuery";
import { buildLogsHubHref, traceIdEqualsFilter } from "@shared/observability/deepLinks";

import type { useTraceDetailData } from "../../../hooks/useTraceDetailData";

type State = {
  resolvedTraceId: string;
  traceTimeBounds: { startMs?: number; endMs?: number };
  setSelectedSpanId: ReturnType<typeof useTraceDetailData>["setSelectedSpanId"];
  selectedSpanId: string | null;
};

export function useTraceDetailActions({
  resolvedTraceId,
  traceTimeBounds,
  setSelectedSpanId,
  selectedSpanId,
}: State) {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { getTimeRange } = useTimeRange();

  const waterfallSearch = search.q ?? "";

  const handleSpanClick = useCallback(
    (span: { span_id?: string }) => {
      const id = span.span_id ?? null;
      const next = id && id === selectedSpanId ? null : id;
      setSelectedSpanId(next);
      navigate({
        search: ((prev: Record<string, unknown>) => ({
          ...prev,
          span: next || undefined,
        })) as never,
        replace: true,
      });
    },
    [setSelectedSpanId, selectedSpanId, navigate]
  );

  const closeSpan = useCallback(() => {
    setSelectedSpanId(null);
    navigate({
      search: ((prev: Record<string, unknown>) => ({ ...prev, span: undefined })) as never,
      replace: true,
    });
  }, [setSelectedSpanId, navigate]);

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

  const addFilter = useCallback(
    (key: string, value: string) => {
      const token = `${key}:${value}`;
      const current = waterfallSearch.trim();
      let nextSearch = token;

      if (current.length > 0) {
        const tokens = current.split(/\s+/);
        if (tokens.includes(token)) return;
        nextSearch = `${current} ${token}`;
      }

      navigate({
        search: ((prev: Record<string, unknown>) => ({ ...prev, q: nextSearch })) as never,
        replace: true,
      });
    },
    [waterfallSearch, navigate]
  );

  return { handleSpanClick, closeSpan, openInLogs, goBack, addFilter };
}
