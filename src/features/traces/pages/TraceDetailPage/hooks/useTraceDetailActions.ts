import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

import { Route } from "@/routes/_app/traces/$traceId";
import { buildLogsHubHref, traceIdEqualsFilter } from "@shared/observability/deepLinks";

import type { useTraceDetailData } from "../../../hooks/useTraceDetailData";

type State = {
  resolvedTraceId: string;
  setSelectedSpanId: ReturnType<typeof useTraceDetailData>["setSelectedSpanId"];
  selectedSpanId: string | null;
  traceTimeBounds?: { startMs?: number; endMs?: number };
};

export function useTraceDetailActions({
  resolvedTraceId,
  setSelectedSpanId,
  selectedSpanId,
  traceTimeBounds,
}: State) {
  const navigate = useNavigate();
  const search = Route.useSearch();

  const waterfallSearch = search.q ?? "";

  const handleSpanClick = useCallback(
    (span: { spanId?: string }) => {
      const id = span.spanId ?? null;
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
    const fromMs =
      traceTimeBounds?.startMs && traceTimeBounds.startMs > 0
        ? traceTimeBounds.startMs - 5 * 60 * 1000
        : undefined;
    const toMs =
      traceTimeBounds?.endMs && traceTimeBounds.endMs > 0
        ? traceTimeBounds.endMs + 5 * 60 * 1000
        : undefined;
    navigate({
      to: buildLogsHubHref({
        filters: [traceIdEqualsFilter(resolvedTraceId)],
        fromMs,
        toMs,
      }) as never,
    });
  }, [navigate, resolvedTraceId, traceTimeBounds]);

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
