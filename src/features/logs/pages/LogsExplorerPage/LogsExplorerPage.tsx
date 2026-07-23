import { useCallback, useMemo, useRef } from "react";

import { useTimeRange } from "@/app/store/appStore";
import { ExplorerHeader } from "@shared/search/components/chrome/ExplorerHeader";
import { ExplorerLayout } from "@shared/search/components/chrome/ExplorerLayout";
import type { SuggestionOption } from "@shared/search/components/chrome/QuerySuggestions";
import { SearchTranslationNotice } from "@shared/search/components/chrome/SearchTranslationNotice";

import { resolveTimeRangeBounds } from "@shared/types";

import { buildLogsFilters } from "@shared/logs/api/buildLogsFilters";
import type { LogsFacets } from "@shared/logs/api/logsAnalyticsApi";
import { useLogsExplorer } from "@shared/logs/hooks/useLogsExplorer";
import { SEVERITY_STYLES } from "@shared/logs/utils/severity";

import { LogsExplorerContent } from "@shared/logs/components/LogsExplorerContent";
import { LogDetailDrawer } from "@shared/logs/components/detail/LogDetailDrawer";
import { LogsFacetPanel } from "../../components/facets/LogsFacetPanel";

import { LogsActions } from "../../components/toolbar/LogsActions";

function buildValueSuggestions(
  facets: LogsFacets | undefined
): Readonly<Record<string, readonly SuggestionOption[]>> {
  const suggestions: Record<string, readonly SuggestionOption[]> = {
    severityText: SEVERITY_STYLES.map((s) => ({
      value: s.label.toUpperCase(),
      label: s.label.toUpperCase(),
      hint: s.shortLabel,
    })),
  };
  if (facets?.service.length) {
    suggestions.serviceName = facets.service.map((i) => ({
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
 * table, and detail panel. Matches the DOM shape of TracesExplorerPage.
 */
export default function LogsExplorerPage() {
  const explorer = useLogsExplorer();
  const { state, facets } = explorer;
  const timeRange = useTimeRange();
  const { startTime, endTime } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const valueSuggestions = useMemo(() => buildValueSuggestions(facets.data), [facets.data]);
  const translationWarnings = useMemo(
    () => buildLogsFilters(state.filters, startTime, endTime).warnings,
    [state.filters, startTime, endTime]
  );

  const onInclude = useCallback(
    (field: string, value: string) => state.addFilter({ field, op: "eq", value }),
    [state]
  );
  const onExclude = useCallback(
    (field: string, value: string) => state.addFilter({ field, op: "neq", value }),
    [state]
  );
  const onClearFilters = useCallback(() => state.setFilters([]), [state]);

  const results = explorer.list.results;
  const detailIdx = state.detail ? results.findIndex((r) => r.id === state.detail) : -1;
  const onDetailPrev = detailIdx > 0 ? () => state.setDetail(results[detailIdx - 1].id) : undefined;
  const onDetailNext =
    detailIdx >= 0 && detailIdx < results.length - 1
      ? () => state.setDetail(results[detailIdx + 1].id)
      : undefined;

  const detailOpen = Boolean(state.detail);

  return (
    <>
      <ExplorerLayout
        header={
          <>
            <ExplorerHeader
              ref={searchInputRef}
              variant="dsl"
              filters={state.filters}
              onChangeFilters={(f) => state.setFilters(f)}
              onSubmitFreeText={() => {}}
              actions={<LogsActions />}
              valueSuggestions={valueSuggestions}
              searchPlaceholder='Search logs: serviceName:checkout severityText:ERROR "timeout"'
              scope="logs"
            />
            <SearchTranslationNotice warnings={translationWarnings} />
          </>
        }
        facets={
          <LogsFacetPanel
            facets={facets.data}
            onInclude={onInclude}
            onExclude={onExclude}
            activeFilterCount={state.filters.length}
            onClearAll={onClearFilters}
          />
        }
        content={<LogsExplorerContent explorer={explorer} />}
      />

      <LogDetailDrawer
        logId={state.detail ?? ""}
        open={detailOpen}
        onClose={() => state.setDetail(null)}
        onPrev={onDetailPrev}
        onNext={onDetailNext}
      />
    </>
  );
}
