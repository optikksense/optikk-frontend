import { ExplorerHeader } from "@/features/explorer/components/chrome/ExplorerHeader";
import type { ExplorerFilter } from "@/features/explorer/types/filters";
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
      <div style={{ backgroundColor: "#fcfaf7" }}>
        <ExplorerHeader
          ref={p.searchInputRef}
          variant="dsl"
          filters={p.state.filters}
          onChangeFilters={(f: readonly ExplorerFilter[]) => p.state.setFilters(f)}
          onSubmitFreeText={p.onFreeText}
          hideTimePicker={true}
        />
      </div>

      <div
        className="min-h-0 flex-1 overflow-hidden"
        style={{ display: "grid", gridTemplateColumns: "236px 1fr" }}
      >
        {}
        <TracesFacetRail
          groups={p.facetGroups}
          onInclude={p.onInclude}
          activeFilterCount={p.state.filters.length}
          onClearAll={p.onClearFilters}
        />

        {}
        <div className="flex flex-col min-h-0 bg-background" style={{ padding: "18px 22px" }}>
          <div
            className="flex flex-row items-center"
            style={{ gap: 10, marginBottom: 16, flexShrink: 0 }}
          >
            <StatPill label="Total" value={formatNumber(p.summary?.total ?? 0)} />
            <StatPill
              label="Errors"
              value={formatNumber(p.summary?.errors ?? 0)}
              dot="var(--color-error)"
            />
          </div>

          {p.trendBuckets.length > 0 ? (
            <div style={{ flexShrink: 0 }}>
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
    <div
      className="flex flex-row items-center"
      style={{
        gap: 8,
        height: 32,
        padding: "0 14px",
        borderRadius: 999,
        border: "1px solid var(--line)",
        background: "var(--bg-card)",
      }}
    >
      {dot ? <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} /> : null}
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--fg-3)",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 15, fontWeight: 700, color: "var(--fg-0)" }}>{value}</span>
    </div>
  );
}
