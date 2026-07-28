import { buildTracesFilters } from "@shared/api/traces/buildTracesFilters";
import { ExplorerHeader } from "@shared/search/components/chrome/ExplorerHeader";
import { ExplorerLayout } from "@shared/search/components/chrome/ExplorerLayout";
import { SearchTranslationNotice } from "@shared/search/components/chrome/SearchTranslationNotice";
import type { ExplorerFilter } from "@shared/search/types/filters";
import { TracesExplorerContent } from "@shared/traces/components/TracesExplorerContent";
import { useMemo } from "react";

import { TracesFacetRail } from "./components/TracesFacetRail";
import { useTracesExplorerPage } from "./useTracesExplorerPage";

export default function TracesExplorerPage() {
  const p = useTracesExplorerPage();

  const translationWarnings = useMemo(
    () => buildTracesFilters(p.state.filters, p.startTime, p.endTime).warnings,
    [p.state.filters, p.startTime, p.endTime]
  );

  return (
    <ExplorerLayout
      header={
        <>
          <ExplorerHeader
            ref={p.searchInputRef}
            scope="traces"
            filters={p.state.filters}
            onChangeFilters={(f: readonly ExplorerFilter[]) => p.state.setFilters(f)}
          />
          <SearchTranslationNotice warnings={translationWarnings} />
        </>
      }
      facets={
        <TracesFacetRail
          groups={p.facetGroups}
          onInclude={p.onInclude}
          activeFilterCount={p.state.filters.length}
          onClearAll={p.onClearFilters}
        />
      }
      content={<TracesExplorerContent model={p.model} />}
    />
  );
}
