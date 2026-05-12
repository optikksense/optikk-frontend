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

/** Top toolbar: DSL search bar (with chips) + action buttons. Time picker lives in the global header. */
export const LogsToolbar = memo(
  forwardRef<HTMLInputElement, Props>(function LogsToolbar(props, ref) {
    return (
      <header className="sticky top-0 z-20 flex items-start gap-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3">
        <div className="min-w-0 flex-1">
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
        {props.actions ? <div className="flex items-center gap-2">{props.actions}</div> : null}
      </header>
    );
  })
);
