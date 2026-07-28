import { type ReactNode, forwardRef, memo } from "react";

import { DslSearchBarWithChips } from "@shared/search/components/chrome/DslSearchBarWithChips";
import type { SuggestionOption } from "@shared/search/components/chrome/QuerySuggestions";

import type { ExplorerFilter } from "@shared/search/types/filters";

interface Props {
  readonly filters: readonly ExplorerFilter[];
  readonly onChangeFilters: (next: readonly ExplorerFilter[]) => void;
  readonly actions?: ReactNode;
  readonly valueSuggestions?: Readonly<Record<string, readonly SuggestionOption[]>>;
}

                                                                                  
export const LogsToolbar = memo(
  forwardRef<HTMLInputElement, Props>(function LogsToolbar(props, ref) {
    return (
      <header className="flex shrink-0 items-center gap-[10px]">
        <div className="min-w-0 flex-1">
          <DslSearchBarWithChips
            ref={ref}
            filters={props.filters}
            onApply={(f) => props.onChangeFilters(f)}
            placeholder='Search logs: serviceName:checkout severityText:ERROR "timeout"'
            scope="logs"
            valueSuggestions={props.valueSuggestions}
          />
        </div>
        {props.actions}
      </header>
    );
  })
);
