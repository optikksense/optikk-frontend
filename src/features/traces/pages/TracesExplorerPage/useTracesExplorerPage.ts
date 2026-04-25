import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { useAppStore, useTimeRange } from "@/app/store/appStore";
import type { FacetGroupModel } from "@/features/explorer/components/facets/FacetGroup";
import type { SummaryKPI } from "@/features/explorer/components/chrome/SummaryStrip";
import { useExplorerColumns } from "@/features/explorer/hooks/useExplorerColumns";
import { toTrendBuckets } from "@/features/explorer/utils/trend";
import { formatErrorForDisplay } from "@shared/api/utils/errorNormalization";

import { type TraceSortMode } from "../../components/TraceSortToggle";
import type { TraceScope } from "../../components/TraceScopeToggle";
import { sortTraces } from "../../utils/sortTraces";
import { DEFAULT_TRACE_COLUMNS } from "../../config/columns";
import { useTracesExplorer } from "../../hooks/useTracesExplorer";
import { useTracesLatencyTrend } from "../../hooks/useTracesLatencyTrend";
import type { TraceSummary } from "../../types/trace";
import { buildTraceColumns } from "./tracesColumns";

/** Bundles all state + derived values for TracesExplorerPage. Keeps the page component lean. */
export function useTracesExplorerPage() {
  const { state, query, traces } = useTracesExplorer({ include: ["summary", "facets", "trend"] });
  const navigate = useNavigate();
  const { columns: columnConfig, setColumns } = useExplorerColumns("traces", DEFAULT_TRACE_COLUMNS);
  const [sortMode, setSortMode] = useState<TraceSortMode>("recent");
  const [scope, setScope] = useState<TraceScope>("traces");
  const latency = useTracesLatencyTrend(state.filters);

  const facetGroups = useMemo<FacetGroupModel[]>(() => facetsToGroups(query.data?.facets), [query.data?.facets]);
  const kpis = useMemo<SummaryKPI[]>(() => buildKPIs(query.data?.summary), [query.data?.summary]);
  const trendBuckets = useMemo(() => toTrendBuckets(query.data?.trend), [query.data?.trend]);
  const columnDefs = useMemo(() => buildTraceColumns({ overall: latency.overall }), [latency.overall]);
  const sortedTraces = useMemo(() => sortTraces(traces, sortMode), [traces, sortMode]);
  const filterKey = useMemo(() => JSON.stringify(state.filters), [state.filters]);
  const queryError = query.isError ? formatErrorForDisplay(query.error) : null;

  const handlers = useHandlers(state, navigate, query);
  const timeRange = useTimeRange();

  return {
    state, query, kpis, facetGroups, trendBuckets,
    latency, columnDefs, columnConfig, setColumns,
    sortMode, setSortMode, sortedTraces, filterKey, queryError,
    scope, setScope,
    zoomed: timeRange.kind === "absolute",
    ...handlers,
  };
}

function useHandlers(
  state: ReturnType<typeof useTracesExplorer>["state"],
  navigate: ReturnType<typeof useNavigate>,
  query: ReturnType<typeof useTracesExplorer>["query"],
) {
  const setCustomTimeRange = useAppStore((s) => s.setCustomTimeRange);
  const onTimeRangeChange = useCallback(
    (fromMs: number, toMs: number) => setCustomTimeRange(fromMs, toMs, "Brush"),
    [setCustomTimeRange],
  );
  const onInclude = useCallback(
    (field: string, value: string) => state.setFilters([...state.filters, { field, op: "eq", value }]),
    [state],
  );
  const onExclude = useCallback(
    (field: string, value: string) => state.setFilters([...state.filters, { field, op: "neq", value }]),
    [state],
  );
  const onRowClick = useCallback(
    (row: TraceSummary) => navigate({ to: `/traces/${encodeURIComponent(row.trace_id)}` }),
    [navigate],
  );
  const onFreeText = useCallback(
    (text: string) => {
      if (!text) return;
      state.setFilters([...state.filters, { field: "search", op: "contains", value: text }]);
    },
    [state],
  );
  const onRetry = useCallback(() => { void query.refetch(); }, [query]);
  const onClearFilters = useCallback(() => state.setFilters([]), [state]);
  return { onTimeRangeChange, onInclude, onExclude, onRowClick, onFreeText, onRetry, onClearFilters };
}

function facetsToGroups(
  facets: Readonly<Record<string, readonly any[]>> | undefined,
): FacetGroupModel[] {
  if (!facets) return [];
  return Object.entries(facets).map(([field, buckets]) => ({
    field,
    label: humanLabel(field),
    buckets: buckets as any[],
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
    { label: "Traces", value: formatCompact(summary.total) },
    { label: "Errors", value: formatCompact(summary.errors), tone: summary.errors > 0 ? "error" : "default" },
    { label: "Error rate", value: `${errorRate.toFixed(2)}%`, tone: errorRate > 5 ? "error" : "default" },
  ];
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
