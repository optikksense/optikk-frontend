import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useRef } from "react";

import { useAppStore, useTimeRange } from "@/app/store/appStore";
import type { SuggestionOption } from "@/features/explorer/components/chrome/QuerySuggestions";
import type { SavedViewLite } from "@/features/explorer/hooks/useDslSearchBar";
import type { ExplorerFilter } from "@/features/explorer/types/filters";
import { useSavedViews } from "@/features/savedViews/hooks/useSavedViews";
import { splitSavedViewUrl } from "@shared/utils/queryString";
import { resolveTimeRangeBounds } from "@/types";

import type { LogsFacets } from "../../api/logsAnalyticsApi";
import { useLogsExplorer } from "../../hooks/useLogsExplorer";
import { useLogsExplorerStore } from "../../store/logsExplorerStore";
import type { LogRecord } from "../../types/log";
import { SEVERITY_STYLES } from "../../utils/severity";

import { LogDetailPanel } from "../../components/detail/LogDetailPanel";
import { LogsFacetPanel } from "../../components/facets/LogsFacetPanel";

import { LogsTable } from "../../components/table/LogsTable";
import { LogsTableFooter } from "../../components/table/LogsTableFooter";
import { LogsTableToolbar } from "../../components/table/LogsTableToolbar";
import { LogsActions } from "../../components/toolbar/LogsActions";
import { LogsToolbar } from "../../components/toolbar/LogsToolbar";
import { LogsTrendChart } from "../../components/trend/LogsTrendChart";

import "./LogsExplorerPage.css";

function extractSearchTerm(filters: readonly ExplorerFilter[]): string | undefined {
  const f = filters.find(
    (x) => (x.field === "body" || x.field === "search") && (x.op === "contains" || x.op === "eq")
  );
  return f?.value || undefined;
}

function buildValueSuggestions(
  facets: LogsFacets | undefined
): Readonly<Record<string, readonly SuggestionOption[]>> {
  const suggestions: Record<string, readonly SuggestionOption[]> = {
    severity_text: SEVERITY_STYLES.map((s) => ({
      value: s.label.toUpperCase(),
      label: s.label.toUpperCase(),
      hint: s.shortLabel,
    })),
  };
  if (facets?.service.length) {
    suggestions.service_name = facets.service.map((i) => ({
      value: i.value,
      label: i.value,
      hint: i.count.toLocaleString(),
    }));
  }
  if (facets?.host?.length) {
    suggestions.host = facets.host.map((i) => ({ value: i.value, label: i.value }));
  }
  if (facets?.pod?.length) {
    suggestions.pod = facets.pod.map((i) => ({ value: i.value, label: i.value }));
  }
  if (facets?.environment?.length) {
    suggestions.environment = facets.environment.map((i) => ({ value: i.value, label: i.value }));
  }
  return suggestions;
}

/**
 * Main logs explorer page — composes all zones: toolbar, facets, trend chart,
 * table, and detail panel as an inline 380px column on the right when open.
 */
export default function LogsExplorerPage() {
  const navigate = useNavigate();
  const { state, list, trend, facets } = useLogsExplorer();
  const timeRange = useTimeRange();
  const { startTime, endTime } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);
  const setCustomTimeRange = useAppStore((s) => s.setCustomTimeRange);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const goNextPage = useLogsExplorerStore((s) => s.goNextPage);
  const goPrevPage = useLogsExplorerStore((s) => s.goPrevPage);

  const searchTerm = useMemo(() => extractSearchTerm(state.filters), [state.filters]);
  const valueSuggestions = useMemo(() => buildValueSuggestions(facets.data), [facets.data]);
  const savedViewsQuery = useSavedViews("logs");
  const savedViews = useMemo<readonly SavedViewLite[]>(
    () => savedViewsQuery.views.map((v) => ({ name: v.name, url: v.url })),
    [savedViewsQuery.views]
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
  const onTimeRangeChange = useCallback(
    (fromMs: number, toMs: number) => setCustomTimeRange(fromMs, toMs, "Brush"),
    [setCustomTimeRange]
  );
  const onLoadSavedView = useCallback(
    (url: string) => {
      const { pathname, search } = splitSavedViewUrl(url, "/logs");
      navigate({ to: pathname, search });
    },
    [navigate]
  );

  const results = list.results;
  const detailIdx = state.detail ? results.findIndex((r) => r.id === state.detail) : -1;
  const onDetailPrev = detailIdx > 0 ? () => state.setDetail(results[detailIdx - 1].id) : undefined;
  const onDetailNext =
    detailIdx >= 0 && detailIdx < results.length - 1
      ? () => state.setDetail(results[detailIdx + 1].id)
      : undefined;

  const detailOpen = Boolean(state.detail);

  return (
    <div className="logs-explorer-root">
      <div className="ok-body">
        <LogsToolbar
          ref={searchInputRef}
          filters={state.filters}
          onChangeFilters={(f) => state.setFilters(f)}
          actions={<LogsActions onLoadSavedView={onLoadSavedView} />}
          valueSuggestions={valueSuggestions}
          savedViews={savedViews}
          onSavedViewSelect={onLoadSavedView}
        />

        <div className={`ok-grid ${detailOpen ? "has-detail" : ""}`}>
          <LogsFacetPanel
            facets={facets.data}
            onInclude={onInclude}
            onExclude={onExclude}
            activeFilterCount={state.filters.length}
            onClearAll={onClearFilters}
          />

          <div className="ok-results">
            <LogsTrendChart
              trend={trend.data}
              zoomed={timeRange.kind === "absolute"}
              onTimeRangeChange={onTimeRangeChange}
              minTimeMs={startTime}
              maxTimeMs={endTime}
            />

            <div className="ok-rwrap">
              <LogsTableToolbar />
              <LogsTable
                rows={results}
                searchTerm={searchTerm}
                loading={list.isPending}
                selectedId={state.detail}
                onRowClick={onRowClick}
              />
              {results.length > 0 || list.hasMore ? (
                <LogsTableFooter
                  pageIndex={list.pageIndex}
                  pageCount={list.pageCount}
                  pageRows={results.length}
                  loadedRows={results.length}
                  hasMore={list.hasMore}
                  loadingNext={list.isPending && results.length === 0}
                  onPrevious={goPrevPage}
                  onNext={goNextPage}
                />
              ) : null}
            </div>
          </div>

          {detailOpen && state.detail ? (
            <LogDetailPanel
              logId={state.detail}
              onClose={() => state.setDetail(null)}
              onPrev={onDetailPrev}
              onNext={onDetailNext}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

