import { ExplorerHeader } from "@shared/search/components/chrome/ExplorerHeader";
import { ExplorerLayout } from "@shared/search/components/chrome/ExplorerLayout";
import { StatPill } from "@shared/search/components/chrome/StatPill";
import {
  TrendChart,
  type TrendChartBucket,
  type TrendChartSegment,
} from "@shared/search/components/trend/TrendChart";
import type { ExplorerFilter } from "@shared/search/types/filters";
import { formatNumber } from "@shared/utils/formatters";
import { useMemo } from "react";

import { TracesFacetRail } from "./components/TracesFacetRail";
import { TracesTable } from "./components/TracesTable";
import { useTracesExplorerPage } from "./useTracesExplorerPage";

const TRACES_SEGMENTS: readonly TrendChartSegment[] = [
  { key: "ok", label: "OK", color: "var(--ok)" },
  { key: "errors", label: "Errors", color: "var(--err)" },
];

/**
 * Traces list page: query header + a two-zone body (facets rail | content),
 * where content stacks summary stat pills, the trace-volume chart, and the
 * results table. Row click navigates to the trace detail page.
 */
export default function TracesExplorerPage() {
  const p = useTracesExplorerPage();

  const trendData = useMemo<TrendChartBucket[] | undefined>(() => {
    if (!p.trendBuckets || p.trendBuckets.length === 0) return undefined;
    return p.trendBuckets.map((b) => {
      const errors = b.counts.errors || 0;
      return {
        ts: b.ts,
        counts: {
          ok: Math.max(0, b.counts.total - errors),
          errors,
        },
      };
    });
  }, [p.trendBuckets]);

  return (
    <ExplorerLayout
      header={
        <ExplorerHeader
          ref={p.searchInputRef}
          variant="dsl"
          filters={p.state.filters}
          onChangeFilters={(f: readonly ExplorerFilter[]) => p.state.setFilters(f)}
          onSubmitFreeText={p.onFreeText}
        />
      }
      facets={
        <TracesFacetRail
          groups={p.facetGroups}
          onInclude={p.onInclude}
          activeFilterCount={p.state.filters.length}
          onClearAll={p.onClearFilters}
        />
      }
      content={
        <>
          <div className="mb-4 flex shrink-0 flex-row items-center gap-2.5">
            <StatPill label="Total" value={formatNumber(p.summary?.total ?? 0)} />
            <StatPill
              label="Errors"
              value={formatNumber(p.summary?.errors ?? 0)}
              dot="var(--color-error)"
            />
          </div>

          <div className="shrink-0">
            <TrendChart
              title="Trace Volume Over Time"
              segments={TRACES_SEGMENTS}
              data={trendData}
              minTimeMs={p.startTime}
              maxTimeMs={p.endTime}
              onTimeRangeChange={p.onTimeRangeChange}
            />
          </div>

          <div className="mt-4 flex flex-col">
            <TracesTable
              traces={p.sortedTraces}
              onRowClick={p.onOpenTrace}
              onNextPage={p.onNextPage}
              onPrevPage={p.onPrevPage}
              hasNextPage={p.hasNextPage}
              hasPrevPage={p.hasPrevPage}
            />
          </div>
        </>
      }
    />
  );
}
