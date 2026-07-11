import { ExplorerHeader } from "@shared/search/components/chrome/ExplorerHeader";
import type { ExplorerFilter } from "@shared/search/types/filters";
import { formatNumber } from "@shared/utils/formatters";

import { TracesFacetRail } from "./components/TracesFacetRail";
import { TracesTable } from "./components/TracesTable";
import { TrendStrip } from "./components/TrendStrip";
import { useTracesExplorerPage } from "./useTracesExplorerPage";

/**
 * Traces list page: query header + a two-zone body (facets rail | content),
 * where content stacks summary stat pills, the trace-volume chart, and the
 * results table. Row click navigates to the trace detail page.
 */
export default function TracesExplorerPage() {
  const p = useTracesExplorerPage();

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="bg-surface-muted">
        <ExplorerHeader
          ref={p.searchInputRef}
          variant="dsl"
          filters={p.state.filters}
          onChangeFilters={(f: readonly ExplorerFilter[]) => p.state.setFilters(f)}
          onSubmitFreeText={p.onFreeText}
          hideTimePicker={true}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden grid grid-cols-[236px_1fr]">
        {}
        <TracesFacetRail
          groups={p.facetGroups}
          onInclude={p.onInclude}
          activeFilterCount={p.state.filters.length}
          onClearAll={p.onClearFilters}
        />

        {}
        <div className="flex flex-col min-h-0 bg-background p-4 md:p-[18px_22px]">
          <div className="flex flex-row items-center gap-2.5 mb-4 shrink-0">
            <StatPill label="Total" value={formatNumber(p.summary?.total ?? 0)} />
            <StatPill
              label="Errors"
              value={formatNumber(p.summary?.errors ?? 0)}
              dot="var(--color-error)"
            />
          </div>

          {p.trendBuckets.length > 0 ? (
            <div className="shrink-0">
              <TrendStrip buckets={p.trendBuckets} startTime={p.startTime} endTime={p.endTime} />
            </div>
          ) : null}

          <div className="flex flex-1 min-h-0 flex-col mt-4">
            <TracesTable
              traces={p.sortedTraces}
              onRowClick={(t) => p.onOpenTrace(t.trace_id)}
              onNextPage={p.onNextPage}
              onPrevPage={p.onPrevPage}
              hasNextPage={p.hasNextPage}
              hasPrevPage={p.hasPrevPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, dot }: { label: string; value: string; dot?: string }) {
  return (
    <div className="flex flex-row items-center gap-2 h-8 px-[14px] rounded-full border border-border bg-card">
      {dot ? <span style={{ backgroundColor: dot }} className="w-2 h-2 rounded-full" /> : null}
      <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-foreground-muted">
        {label}
      </span>
      <span className="text-[15px] font-bold text-foreground">{value}</span>
    </div>
  );
}
