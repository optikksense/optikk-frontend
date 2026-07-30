import { type ReactNode, forwardRef, memo } from "react";

import { cn } from "@shared/lib/utils";
import type { ExplorerFilter } from "../../types/filters";
import type { ExplorerScope } from "../../types/filters";
import { ExplorerSearchBarDsl } from "./ExplorerSearchBarDsl";
import type { SuggestionOption } from "./QuerySuggestions";

interface Props {
  readonly filters: readonly ExplorerFilter[];
  readonly onChangeFilters: (next: readonly ExplorerFilter[]) => void;
  readonly kpiStrip?: ReactNode;
  readonly actions?: ReactNode;
  readonly searchPlaceholder?: string;

  readonly scope?: ExplorerScope;
  readonly valueSuggestions?: Readonly<Record<string, readonly SuggestionOption[]>>;
  readonly disableBareFreeTextFallback?: boolean;
  readonly sticky?: boolean;
  readonly className?: string;
}

export const ExplorerHeader = memo(
  forwardRef<HTMLInputElement, Props>(function ExplorerHeader(props, ref) {
    return (
      <header
        className={cn(
          "z-20 flex flex-col gap-2 border-border border-b bg-background px-4 py-3",
          props.sticky !== false && "sticky top-0",
          props.className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <ExplorerSearchBarDsl
              ref={ref}
              filters={props.filters}
              onApply={(filters) => props.onChangeFilters(filters)}
              placeholder={props.searchPlaceholder}
              scope={props.scope}
              valueSuggestions={props.valueSuggestions}
              disableBareFreeTextFallback={props.disableBareFreeTextFallback}
            />
          </div>
          {props.actions ? <div className="flex items-center gap-2">{props.actions}</div> : null}
        </div>
        {props.kpiStrip ? <div>{props.kpiStrip}</div> : null}
      </header>
    );
  })
);
