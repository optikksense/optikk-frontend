import type { ReactNode, RefObject } from "react";

import type { FacetGroupModel } from "@shared/search/components/facets/FacetGroup";
import { FacetRail } from "@shared/search/components/facets/FacetRail";
import type { ExplorerStateApi } from "@shared/search/hooks/useExplorerState";
import type { ExplorerScope } from "@shared/search/types/filters";

import { ExplorerHeader } from "./ExplorerHeader";
import { ExplorerLayout } from "./ExplorerLayout";
import type { SuggestionOption } from "./QuerySuggestions";

interface ClientExplorerLayoutProps {
  readonly state: ExplorerStateApi;
  readonly searchInputRef: RefObject<HTMLInputElement | null>;
  readonly facetGroups: readonly FacetGroupModel[];
  readonly valueSuggestions: Readonly<Record<string, readonly SuggestionOption[]>>;
  readonly scope: ExplorerScope;
  readonly searchPlaceholder: string;
  readonly content: ReactNode;
  readonly actions?: ReactNode;
  readonly embedded?: boolean;
}

export function ClientExplorerLayout({
  state,
  searchInputRef,
  facetGroups,
  valueSuggestions,
  scope,
  searchPlaceholder,
  content,
  actions,
  embedded = false,
}: ClientExplorerLayoutProps) {
  return (
    <ExplorerLayout
      embedded={embedded}
      header={
        <ExplorerHeader
          ref={searchInputRef}
          sticky={!embedded}
          scope={scope}
          filters={state.filters}
          onChangeFilters={state.setFilters}
          valueSuggestions={valueSuggestions}
          searchPlaceholder={searchPlaceholder}
          actions={actions}
        />
      }
      facets={
        <FacetRail
          groups={facetGroups}
          onInclude={(field, value) => state.addFilter({ field, op: "eq", value })}
          activeFilterCount={state.filters.length}
          onClearAll={state.clearAll}
        />
      }
      content={content}
    />
  );
}
