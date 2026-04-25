import { ExplorerHeader } from "@/features/explorer/components/chrome/ExplorerHeader";
import { SummaryStrip } from "@/features/explorer/components/chrome/SummaryStrip";
import { FacetRail } from "@/features/explorer/components/facets/FacetRail";
import type { ExplorerFilter, ExplorerMode } from "@/features/explorer/types/filters";

import { ExplorerMainBody } from "./ExplorerMainBody";
import { useTracesExplorerPage } from "./useTracesExplorerPage";

/**
 * Three-zone traces explorer: query header + facet rail + results body.
 * Row click navigates to /traces/$traceId.
 */
export default function TracesExplorerPage() {
  const p = useTracesExplorerPage();
  return (
    <div className="flex h-full flex-col bg-[var(--bg-primary)]">
      <ExplorerHeader
        variant="dsl"
        filters={p.state.filters}
        onChangeFilters={(f: readonly ExplorerFilter[]) => p.state.setFilters(f)}
        onSubmitFreeText={p.onFreeText}
        mode={p.state.mode}
        onModeChange={(m: ExplorerMode) => p.state.setMode(m)}
        kpiStrip={p.kpis.length > 0 ? <SummaryStrip kpis={p.kpis} /> : null}
      />
      <div className="flex flex-1 overflow-hidden">
        <FacetRail
          groups={p.facetGroups}
          onInclude={p.onInclude}
          onExclude={p.onExclude}
          activeFilterCount={p.state.filters.length}
          onClearAll={p.onClearFilters}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <ExplorerMainBody p={p} />
        </div>
      </div>
    </div>
  );
}
