import { type ReactNode, forwardRef, memo } from "react";

import { DslSearchBarWithChips } from "@/features/explorer/components/chrome/DslSearchBarWithChips";
import type { SuggestionOption } from "@/features/explorer/components/chrome/QuerySuggestions";
import type { SavedViewLite } from "@/features/explorer/hooks/useDslSearchBar";
import type { ExplorerFilter } from "@/features/explorer/types/filters";

interface Props {
  readonly filters: readonly ExplorerFilter[];
  readonly onChangeFilters: (next: readonly ExplorerFilter[]) => void;
  readonly actions?: ReactNode;
  readonly valueSuggestions?: Readonly<Record<string, readonly SuggestionOption[]>>;
  readonly savedViews?: readonly SavedViewLite[];
  readonly onSavedViewSelect?: (url: string) => void;
}

/** Top toolbar — DSL search bar with chip filters, plus Views / Share actions. */
export const LogsToolbar = memo(
  forwardRef<HTMLInputElement, Props>(function LogsToolbar(props, ref) {
    return (
      <header className="ok-search-row">
        <div style={{ flex: 1, minWidth: 0 }}>
          <DslSearchBarWithChips
            ref={ref}
            filters={props.filters}
            onApply={(f) => props.onChangeFilters(f)}
            placeholder='Search logs: service_name:checkout severity_text:ERROR "timeout"'
            scope="logs"
            valueSuggestions={props.valueSuggestions}
            savedViews={props.savedViews}
            onSavedViewSelect={props.onSavedViewSelect}
          />
        </div>
        {props.actions}
      </header>
    );
  })
);
