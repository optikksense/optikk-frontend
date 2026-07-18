import { useNavigate } from "@tanstack/react-router";
import { Copy, ExternalLink } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

import { useAppStore, useTimeRange } from "@/app/store/appStore";
import type { SummaryKPI } from "@shared/search/components/chrome/SummaryStrip";
import type { FacetGroupModel } from "@shared/search/components/facets/FacetGroup";
import type { ContextMenuEntry } from "@shared/search/components/list/RowContextMenu";
import {
  copyToClipboard,
  pushIncludeExcludeFilter,
} from "@shared/search/components/list/rowContextMenuHelpers";
import { useExplorerKeyboard } from "@shared/search/hooks/useExplorerKeyboard";
import type { ExplorerFilter } from "@shared/search/types/filters";
import { toTrendBuckets } from "@shared/search/utils/trend";
import { formatNumber } from "@shared/utils/formatters";

import { resolveTimeRangeBounds } from "@shared/types";

import type { TraceSummary, TracesFacetBucket } from "@shared/api/traces/types";
import { useTracesExplorer } from "../../hooks/useTracesExplorer";
import { sortTraces } from "../../utils/sortTraces";

/**
 * Page-level orchestration for the traces explorer. Wraps `useTracesExplorer`
 * (URL state + bundled query) with column config, sort/scope state, the
 * row context menu, and `/`-focuses-search keyboard handling. The page
 * component is a thin renderer over the returned model.
 */
export function useTracesExplorerPage() {
  const { state, query, facetsQuery, trendQuery, traces, facets, summary, trend } =
    useTracesExplorer({ include: ["summary", "facets", "trend"] });
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [cursorHistory, setCursorHistory] = useState<string[]>([]);

  const setCustomTimeRange = useAppStore((s) => s.setCustomTimeRange);
  const timeRange = useTimeRange();
  const { startTime, endTime } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);

  const facetGroups = useMemo<FacetGroupModel[]>(() => facetsToGroups(facets), [facets]);
  const kpis = useMemo<SummaryKPI[]>(() => buildKPIs(summary), [summary]);
  const trendBuckets = useMemo(() => toTrendBuckets(trend), [trend]);
  const sortedTraces = useMemo(() => sortTraces(traces, "recent"), [traces]);

  const onTimeRangeChange = useCallback(
    (fromMs: number, toMs: number) => setCustomTimeRange(fromMs, toMs, "Brush"),
    [setCustomTimeRange]
  );
  // Changing the filter set invalidates the keyset cursor; reset pagination too.
  const applyFilters = useCallback(
    (next: readonly ExplorerFilter[]) => {
      state.setFilters(next);
      setCursorHistory([]);
      state.setCursor(null);
    },
    [state]
  );
  const onInclude = useCallback(
    (field: string, value: string) => applyFilters([...state.filters, { field, op: "eq", value }]),
    [applyFilters, state.filters]
  );
  const onExclude = useCallback(
    (field: string, value: string) => applyFilters([...state.filters, { field, op: "neq", value }]),
    [applyFilters, state.filters]
  );

  const onOpenTrace = useCallback(
    (trace: TraceSummary) => {
      const endTime = Math.max(
        trace.end_ms,
        trace.start_ms + Math.ceil(trace.duration_ns / 1_000_000)
      );
      navigate({
        to: `/traces/${encodeURIComponent(trace.trace_id)}`,
        search: { startTime: trace.start_ms, endTime },
      });
    },
    [navigate]
  );
  const onFreeText = useCallback(
    (text: string) => {
      if (!text) return;
      applyFilters([...state.filters, { field: "search", op: "contains", value: text }]);
    },
    [applyFilters, state.filters]
  );
  const onRetry = useCallback(() => {
    void query.refetch();
    if (facetsQuery) void facetsQuery.refetch();
    if (trendQuery) void trendQuery.refetch();
  }, [query, facetsQuery, trendQuery]);
  const onClearFilters = useCallback(() => applyFilters([]), [applyFilters]);

  const onNextPage = useCallback(() => {
    if (query.data?.nextCursor) {
      setCursorHistory((prev) => [...prev, state.cursor || ""]);
      state.setCursor(query.data.nextCursor);
    }
  }, [query.data?.nextCursor, state.cursor, state.setCursor]);

  const onPrevPage = useCallback(() => {
    setCursorHistory((prev) => {
      const next = [...prev];
      const prevCursor = next.pop();
      if (prevCursor !== undefined) {
        state.setCursor(prevCursor === "" ? null : prevCursor);
      }
      return next;
    });
  }, [state.setCursor]);

  const getContextMenuItems = useCallback(
    (row: TraceSummary): readonly ContextMenuEntry[] =>
      buildTraceContextMenu(row, {
        filters: state.filters,
        setFilters: applyFilters,
        openTraceDetail: (trace) => onOpenTrace(trace),
      }),
    [state.filters, applyFilters, onOpenTrace]
  );

  useExplorerKeyboard({
    onSearchFocus: () => searchInputRef.current?.focus(),
  });

  return {
    state,
    query,
    kpis,
    summary,
    facetGroups,
    trendBuckets,
    sortedTraces,
    zoomed: timeRange.kind === "absolute",
    searchInputRef,
    getContextMenuItems,
    onTimeRangeChange,
    onInclude,
    onExclude,
    onOpenTrace,
    onFreeText,
    onRetry,
    onClearFilters,
    onNextPage,
    onPrevPage,
    hasPrevPage: cursorHistory.length > 0,
    hasNextPage: Boolean(query.data?.nextCursor),

    startTime,
    endTime,
  };
}

function facetsToGroups(
  facets: Readonly<Record<string, readonly TracesFacetBucket[]>> | undefined
): FacetGroupModel[] {
  if (!facets) return [];
  return Object.entries(facets).map(([field, buckets]) => ({
    field,
    label: humanLabel(field),
    buckets: [...buckets],
  }));
}

function humanLabel(field: string): string {
  if (field === "service") return "Service";
  if (field === "operation") return "Operation";
  if (field === "http_method") return "Method";
  if (field === "http_status") return "HTTP";
  if (field === "status") return "Status";
  return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ");
}

function buildKPIs(summary: { total: number; errors: number } | undefined): SummaryKPI[] {
  if (!summary) return [];
  const errorRate = summary.total > 0 ? (summary.errors / summary.total) * 100 : 0;
  return [
    { label: "Traces", value: formatNumber(summary.total) },
    {
      label: "Errors",
      value: formatNumber(summary.errors),
      tone: summary.errors > 0 ? "error" : "default",
    },
    {
      label: "Error rate",
      value: `${errorRate.toFixed(2)}%`,
      tone: errorRate > 5 ? "error" : "default",
    },
  ];
}

interface ContextMenuArgs {
  readonly filters: readonly ExplorerFilter[];
  readonly setFilters: (next: readonly ExplorerFilter[]) => void;
  readonly openTraceDetail: (trace: TraceSummary) => void;
}

function buildTraceContextMenu(
  row: TraceSummary,
  args: ContextMenuArgs
): readonly ContextMenuEntry[] {
  const items: ContextMenuEntry[] = [];

  pushIncludeExcludeFilter(items, args, "service", row.root_service, "service");
  if (row.root_operation) {
    pushIncludeExcludeFilter(items, args, "operation", row.root_operation, "operation");
  }
  if (row.root_http_method) {
    pushIncludeExcludeFilter(items, args, "http_method", row.root_http_method, "method");
  }
  if (row.environment) {
    pushIncludeExcludeFilter(items, args, "environment", row.environment, "env");
  }

  items.push({ kind: "separator" });
  items.push({
    kind: "action",
    label: "Open trace",
    icon: <ExternalLink size={12} />,
    onSelect: () => args.openTraceDetail(row),
  });

  items.push({ kind: "separator" });
  items.push({
    kind: "action",
    label: "Copy trace id",
    icon: <Copy size={12} />,
    onSelect: () => copyToClipboard(row.trace_id),
  });
  if (row.root_endpoint) {
    items.push({
      kind: "action",
      label: "Copy endpoint",
      icon: <Copy size={12} />,
      onSelect: () => copyToClipboard(row.root_endpoint ?? ""),
    });
  }

  return items;
}
