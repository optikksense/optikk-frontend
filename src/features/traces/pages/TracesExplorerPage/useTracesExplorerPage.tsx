import { useNavigate } from "@tanstack/react-router";
import { Copy, ExternalLink } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

import { useAppStore, useTimeRange } from "@/app/store/appStore";
import type { SummaryKPI } from "@/features/explorer/components/chrome/SummaryStrip";
import type { FacetGroupModel } from "@/features/explorer/components/facets/FacetGroup";
import type { ContextMenuEntry } from "@/features/explorer/components/list/RowContextMenu";
import {
  copyToClipboard,
  pushIncludeExcludeFilter,
} from "@/features/explorer/components/list/rowContextMenuHelpers";
import { useExplorerColumns } from "@/features/explorer/hooks/useExplorerColumns";
import { useExplorerKeyboard } from "@/features/explorer/hooks/useExplorerKeyboard";
import type { ExplorerFilter } from "@/features/explorer/types/filters";
import { toTrendBuckets } from "@/features/explorer/utils/trend";
import { formatErrorForDisplay } from "@shared/api/utils/errorNormalization";
import { formatNumber } from "@shared/utils/formatters";
import { splitSavedViewUrl } from "@shared/utils/queryString";

import type { TraceScope } from "../../components/TraceScopeToggle";
import { type TraceSortMode } from "../../components/TraceSortToggle";
import { DEFAULT_TRACE_COLUMNS } from "../../config/columns";
import { useTracesExplorer } from "../../hooks/useTracesExplorer";
import type { TracesFacetBucket, TraceSummary } from "../../types/trace";
import { sortTraces } from "../../utils/sortTraces";
import { buildTraceColumns } from "./tracesColumns";

/**
 * Page-level orchestration for the traces explorer. Wraps `useTracesExplorer`
 * (URL state + bundled query) with column config, sort/scope state, the
 * row context menu, and `/`-focuses-search keyboard handling. The page
 * component is a thin renderer over the returned model.
 */
export function useTracesExplorerPage() {
  const { state, query, traces } = useTracesExplorer({ include: ["summary", "facets", "trend"] });
  const navigate = useNavigate();
  const { columns: columnConfig, setColumns } = useExplorerColumns("traces", DEFAULT_TRACE_COLUMNS);
  const [sortMode, setSortMode] = useState<TraceSortMode>("recent");
  const [scope, setScope] = useState<TraceScope>("traces");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const setCustomTimeRange = useAppStore((s) => s.setCustomTimeRange);
  const timeRange = useTimeRange();

  const facetGroups = useMemo<FacetGroupModel[]>(
    () => facetsToGroups(query.data?.facets),
    [query.data?.facets]
  );
  const kpis = useMemo<SummaryKPI[]>(() => buildKPIs(query.data?.summary), [query.data?.summary]);
  const trendBuckets = useMemo(() => toTrendBuckets(query.data?.trend), [query.data?.trend]);
  const columnDefs = useMemo(() => buildTraceColumns(), []);
  const sortedTraces = useMemo(() => sortTraces(traces, sortMode), [traces, sortMode]);
  const filterKey = useMemo(() => JSON.stringify(state.filters), [state.filters]);
  const queryError = query.isError ? formatErrorForDisplay(query.error) : null;

  const onTimeRangeChange = useCallback(
    (fromMs: number, toMs: number) => setCustomTimeRange(fromMs, toMs, "Brush"),
    [setCustomTimeRange]
  );
  const onInclude = useCallback(
    (field: string, value: string) =>
      state.setFilters([...state.filters, { field, op: "eq", value }]),
    [state]
  );
  const onExclude = useCallback(
    (field: string, value: string) =>
      state.setFilters([...state.filters, { field, op: "neq", value }]),
    [state]
  );
  const onRowClick = useCallback(
    (row: TraceSummary) => navigate({ to: `/traces/${encodeURIComponent(row.trace_id)}` }),
    [navigate]
  );
  const onFreeText = useCallback(
    (text: string) => {
      if (!text) return;
      state.setFilters([...state.filters, { field: "search", op: "contains", value: text }]);
    },
    [state]
  );
  const onRetry = useCallback(() => {
    void query.refetch();
  }, [query]);
  const onClearFilters = useCallback(() => state.setFilters([]), [state]);
  const onLoadSavedView = useCallback(
    (url: string) => {
      const { pathname, search } = splitSavedViewUrl(url, "/traces");
      navigate({ to: pathname, search });
    },
    [navigate]
  );

  const getContextMenuItems = useCallback(
    (row: TraceSummary): readonly ContextMenuEntry[] =>
      buildTraceContextMenu(row, {
        filters: state.filters,
        setFilters: state.setFilters,
        openTraceDetail: (id) => navigate({ to: `/traces/${encodeURIComponent(id)}` }),
      }),
    [state, navigate]
  );

  useExplorerKeyboard({
    onSearchFocus: () => searchInputRef.current?.focus(),
  });

  return {
    state,
    query,
    kpis,
    facetGroups,
    trendBuckets,
    columnDefs,
    columnConfig,
    setColumns,
    sortMode,
    setSortMode,
    sortedTraces,
    filterKey,
    queryError,
    scope,
    setScope,
    zoomed: timeRange.kind === "absolute",
    searchInputRef,
    getContextMenuItems,
    onTimeRangeChange,
    onInclude,
    onExclude,
    onRowClick,
    onFreeText,
    onRetry,
    onClearFilters,
    onLoadSavedView,
  };
}

export type UseTracesExplorerPageReturn = ReturnType<typeof useTracesExplorerPage>;

// ---------- pure helpers (private to this module) ----------

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
  readonly openTraceDetail: (traceId: string) => void;
}

/** Datadog-style row context menu for the traces explorer. Filter actions
 *  are scoped to root_service / operation / http_method / environment when
 *  present; copy actions cover trace_id and endpoint. */
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
    onSelect: () => args.openTraceDetail(row.trace_id),
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
