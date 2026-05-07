import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Copy, ExternalLink, Network } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAppStore, useTimeRange } from "@/app/store/appStore";
import type { SuggestionOption } from "@/features/explorer/components/chrome/QuerySuggestions";
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
import { aggregateSeverityTrend, toTrendBuckets } from "@/features/explorer/utils/trend";
import { formatErrorForDisplay } from "@shared/api/utils/errorNormalization";
import { splitSavedViewUrl } from "@shared/utils/queryString";

import type { LogsFacets, LogsSummary } from "../../api/logsAnalyticsApi";
import { DEFAULT_LOG_COLUMNS } from "../../config/columns";
import { useLogsExplorer } from "../../hooks/useLogsExplorer";
import type { LogRecord } from "../../types/log";
import { SEVERITY_STYLES, severityColor } from "../../utils/severity";
import { buildLogColumns } from "./logsColumns";

/**
 * Page-level orchestration for the logs explorer. Composes URL state, the
 * four parallel reads (`useLogsExplorer`), column config, keyboard nav,
 * row styling, and the row context menu. The page component below is a
 * thin renderer — all derivations and callbacks live here.
 */
export function useLogsExplorerPage() {
  const navigate = useNavigate();
  const { state, list, summary, trend, facets } = useLogsExplorer();
  const { columns: columnConfig, setColumns } = useExplorerColumns("logs", DEFAULT_LOG_COLUMNS);
  const [pageIndex, setPageIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const setCustomTimeRange = useAppStore((s) => s.setCustomTimeRange);
  const timeRange = useTimeRange();

  const facetGroups = useMemo<FacetGroupModel[]>(() => facetsToGroups(facets.data), [facets.data]);
  const kpis = useMemo<SummaryKPI[]>(() => buildKPIs(summary.data), [summary.data]);
  const trendBuckets = useMemo(
    () => toTrendBuckets(aggregateSeverityTrend(trend.data)),
    [trend.data]
  );
  const filterKey = useMemo(() => JSON.stringify(state.filters), [state.filters]);
  const queryError = list.isError ? formatErrorForDisplay(list.error) : null;
  const searchTerm = useMemo(() => extractSearchTerm(state.filters), [state.filters]);
  const columnDefs = useMemo(() => buildLogColumns(searchTerm), [searchTerm]);
  const pageCount = list.pages.length;
  const pagedResults = list.pages[pageIndex]?.results ?? [];
  const filterValueSuggestions = useMemo(
    () => buildLogValueSuggestions(facets.data),
    [facets.data]
  );

  useEffect(() => {
    setPageIndex(0);
  }, [filterKey, timeRange]);

  useEffect(() => {
    if (pageIndex >= pageCount && pageCount > 0) {
      setPageIndex(pageCount - 1);
    }
  }, [pageIndex, pageCount]);

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
  const onClearFilters = useCallback(() => state.setFilters([]), [state]);
  const onRowClick = useCallback((row: LogRecord) => state.setDetail(row.id), [state]);
  const onSubmitFreeText = useCallback(
    (text: string) => {
      if (!text) return;
      state.setFilters([...state.filters, { field: "body", op: "contains", value: text }]);
    },
    [state]
  );
  const onLoadSavedView = useCallback(
    (url: string) => {
      const { pathname, search } = splitSavedViewUrl(url, "/logs");
      navigate({ to: pathname, search });
    },
    [navigate]
  );
  const onRetry = useCallback(() => {
    void list.refetch();
  }, [list]);
  const onPreviousPage = useCallback(() => {
    setPageIndex((current) => Math.max(0, current - 1));
  }, []);
  const onNextPage = useCallback(() => {
    if (pageIndex + 1 < pageCount) {
      setPageIndex(pageIndex + 1);
      return;
    }
    if (list.hasMore && !list.isFetchingMore) {
      const nextIndex = pageIndex + 1;
      void list.loadMore().then(() => setPageIndex(nextIndex));
    }
  }, [pageIndex, pageCount, list]);

  const openTraceDetail = useCallback(
    (traceId: string) => {
      if (!traceId) return;
      navigate({ to: `/traces/${encodeURIComponent(traceId)}` });
    },
    [navigate]
  );

  const getContextMenuItems = useCallback(
    (row: LogRecord): readonly ContextMenuEntry[] =>
      buildLogContextMenu(row, {
        filters: state.filters,
        setFilters: state.setFilters,
        openTraceDetail,
        openDrawer: state.setDetail,
      }),
    [state, openTraceDetail]
  );

  const getRowStyle = useCallback(
    (row: LogRecord) => ({ borderLeft: `3px solid ${severityColor(row.severity_bucket)}` }),
    []
  );
  const getRowClassName = useCallback((row: LogRecord) => logRowClassName(row.severity_bucket), []);

  useExplorerKeyboard({
    onSearchFocus: () => searchInputRef.current?.focus(),
    onNavNext: () => navigateRow(pagedResults, state.detail, +1, state.setDetail),
    onNavPrev: () => navigateRow(pagedResults, state.detail, -1, state.setDetail),
    onClose: () => state.setDetail(null),
  });

  const footer = useMemo<ReactNode>(() => {
    if (list.results.length === 0 && !list.hasMore) return null;
    return (
      <PaginationFooter
        pageIndex={pageIndex}
        pageCount={pageCount}
        pageRows={pagedResults.length}
        loadedRows={list.results.length}
        hasMore={list.hasMore}
        loadingNext={list.isFetchingMore}
        onPrevious={onPreviousPage}
        onNext={onNextPage}
      />
    );
  }, [
    list.results.length,
    list.hasMore,
    list.isFetchingMore,
    pageIndex,
    pageCount,
    pagedResults.length,
    onPreviousPage,
    onNextPage,
  ]);

  return {
    state,
    list,
    pagedResults,
    columnConfig,
    setColumns,
    columnDefs,
    facetGroups,
    kpis,
    trendBuckets,
    filterKey,
    queryError,
    timeRange,
    searchInputRef,
    filterValueSuggestions,
    handlers: {
      onTimeRangeChange,
      onInclude,
      onExclude,
      onClearFilters,
      onRowClick,
      onSubmitFreeText,
      onLoadSavedView,
      onRetry,
    },
    getContextMenuItems,
    getRowStyle,
    getRowClassName,
    footer,
  };
}

export type UseLogsExplorerPageReturn = ReturnType<typeof useLogsExplorerPage>;

// ---------- pure helpers (private to this module) ----------

function extractSearchTerm(filters: readonly ExplorerFilter[]): string | undefined {
  const f = filters.find(
    (x) => (x.field === "body" || x.field === "search") && (x.op === "contains" || x.op === "eq")
  );
  return f?.value || undefined;
}

function navigateRow(
  rows: readonly LogRecord[],
  currentId: string | null | undefined,
  delta: number,
  setId: (id: string | null) => void
): void {
  if (rows.length === 0) return;
  const idx = currentId ? rows.findIndex((r) => r.id === currentId) : -1;
  const next =
    idx === -1
      ? delta > 0
        ? 0
        : rows.length - 1
      : Math.max(0, Math.min(rows.length - 1, idx + delta));
  const target = rows[next];
  if (target) setId(target.id);
}

function facetsToGroups(facets: LogsFacets | undefined): FacetGroupModel[] {
  if (!facets) return [];
  const groups: FacetGroupModel[] = [];
  if (facets.service.length > 0) {
    groups.push({ field: "service_name", label: "Service", buckets: [...facets.service] });
  }
  if (facets.host && facets.host.length > 0) {
    groups.push({ field: "host", label: "Host", buckets: [...facets.host] });
  }
  if (facets.pod && facets.pod.length > 0) {
    groups.push({ field: "pod", label: "Pod", buckets: [...facets.pod] });
  }
  if (facets.environment && facets.environment.length > 0) {
    groups.push({ field: "environment", label: "Environment", buckets: [...facets.environment] });
  }
  if (facets.severity_bucket.length > 0) {
    groups.push({
      field: "severity_text",
      label: "Severity",
      buckets: facets.severity_bucket.map((value) => ({ value, count: 0 })),
    });
  }
  return groups;
}

function buildKPIs(s: LogsSummary | undefined): SummaryKPI[] {
  if (!s) return [];
  const errorRate = s.total > 0 ? (s.errors / s.total) * 100 : 0;
  return [
    { label: "Logs", value: formatCompact(s.total) },
    {
      label: "Errors",
      value: formatCompact(s.errors),
      tone: s.errors > 0 ? "error" : "default",
    },
    {
      label: "Error rate",
      value: `${errorRate.toFixed(2)}%`,
      tone: errorRate > 5 ? "error" : "default",
    },
  ];
}

function logRowClassName(bucket: number): string {
  if (bucket === 5) {
    return "bg-[rgba(184,119,217,0.06)] hover:bg-[rgba(184,119,217,0.12)]";
  }
  if (bucket >= 4) {
    return "bg-[rgba(242,73,92,0.055)] hover:bg-[rgba(242,73,92,0.11)]";
  }
  if (bucket === 3) {
    return "bg-[rgba(242,204,12,0.04)] hover:bg-[rgba(242,204,12,0.09)]";
  }
  return "border-l-transparent";
}

function buildLogValueSuggestions(
  facets: LogsFacets | undefined
): Readonly<Record<string, readonly SuggestionOption[]>> {
  const suggestions: Record<string, readonly SuggestionOption[]> = {
    severity_text: buildSeveritySuggestions(facets),
  };
  if (facets?.service.length) suggestions.service_name = facetOptions(facets.service);
  if (facets?.host?.length) suggestions.host = facetOptions(facets.host);
  if (facets?.pod?.length) suggestions.pod = facetOptions(facets.pod);
  if (facets?.environment?.length) suggestions.environment = facetOptions(facets.environment);
  return suggestions;
}

function buildSeveritySuggestions(facets: LogsFacets | undefined): readonly SuggestionOption[] {
  if (facets?.severity_bucket.length) {
    return facets.severity_bucket.map((value) => ({ value, label: value }));
  }
  return SEVERITY_STYLES.map((style) => ({
    value: style.label.toUpperCase(),
    label: style.label.toUpperCase(),
    hint: style.shortLabel,
  }));
}

function facetOptions(
  values: readonly { value: string; count: number }[]
): readonly SuggestionOption[] {
  return values.map((item) => ({
    value: item.value,
    label: item.value,
    hint: item.count.toLocaleString(),
  }));
}

function PaginationFooter({
  pageIndex,
  pageCount,
  pageRows,
  loadedRows,
  hasMore,
  loadingNext,
  onPrevious,
  onNext,
}: {
  readonly pageIndex: number;
  readonly pageCount: number;
  readonly pageRows: number;
  readonly loadedRows: number;
  readonly hasMore: boolean;
  readonly loadingNext: boolean;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
}) {
  const displayPageCount = hasMore ? `${pageCount}+` : String(Math.max(pageCount, 1));
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-mono text-[11px] text-[var(--text-secondary)]">
        Page {pageIndex + 1} of {displayPageCount} · {pageRows.toLocaleString()} rows on page ·{" "}
        {loadedRows.toLocaleString()} loaded
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous logs page"
          onClick={onPrevious}
          disabled={pageIndex === 0}
          className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-45"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          type="button"
          aria-label="Next logs page"
          onClick={onNext}
          disabled={loadingNext || (!hasMore && pageIndex + 1 >= pageCount)}
          className="inline-flex h-7 items-center gap-1 rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 font-medium text-[11px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-45"
        >
          {loadingNext ? "Loading" : "Next"}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

interface ContextMenuArgs {
  readonly filters: readonly ExplorerFilter[];
  readonly setFilters: (next: readonly ExplorerFilter[]) => void;
  readonly openTraceDetail: (traceId: string) => void;
  readonly openDrawer: (id: string) => void;
}

/** Datadog-style row context menu for the logs explorer. Filter actions are
 *  scoped to the dimensions present on the row; copy and navigation actions
 *  live below the separator. */
function buildLogContextMenu(row: LogRecord, args: ContextMenuArgs): readonly ContextMenuEntry[] {
  const items: ContextMenuEntry[] = [];

  pushIncludeExcludeFilter(items, args, "service_name", row.service_name, "service");
  if (row.host) pushIncludeExcludeFilter(items, args, "host", row.host, "host");
  if (row.pod) pushIncludeExcludeFilter(items, args, "pod", row.pod, "pod");
  if (row.severity_text) {
    pushIncludeExcludeFilter(items, args, "severity_text", row.severity_text, "severity");
  }

  items.push({ kind: "separator" });

  if (row.trace_id) {
    items.push({
      kind: "action",
      label: "View trace",
      icon: <Network size={12} />,
      onSelect: () => args.openTraceDetail(row.trace_id ?? ""),
    });
  }
  items.push({
    kind: "action",
    label: "Open details",
    icon: <ExternalLink size={12} />,
    onSelect: () => args.openDrawer(row.id),
  });

  items.push({ kind: "separator" });

  items.push({
    kind: "action",
    label: "Copy log id",
    icon: <Copy size={12} />,
    onSelect: () => copyToClipboard(row.id),
  });
  if (row.trace_id) {
    items.push({
      kind: "action",
      label: "Copy trace id",
      icon: <Copy size={12} />,
      onSelect: () => copyToClipboard(row.trace_id ?? ""),
    });
  }
  items.push({
    kind: "action",
    label: "Copy body",
    icon: <Copy size={12} />,
    onSelect: () => copyToClipboard(row.body),
  });

  return items;
}
