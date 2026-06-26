import { type ReactNode, forwardRef, memo } from "react";

import type { ExplorerFilter } from "../../types/filters";
import type { ExplorerScope } from "../../types/filters";
import { ExplorerSearchBar } from "./ExplorerSearchBar";
import { ExplorerSearchBarDsl } from "./ExplorerSearchBarDsl";
import { ExplorerTimePicker } from "./ExplorerTimePicker";
import type { SuggestionOption } from "./QuerySuggestions";

export type SearchBarVariant = "classic" | "dsl";

interface Props {
  readonly filters: readonly ExplorerFilter[];
  readonly onChangeFilters: (next: readonly ExplorerFilter[]) => void;
  readonly onSubmitFreeText: (text: string) => void;
  readonly kpiStrip?: ReactNode;
  /** Slot rendered between the search bar and the time picker. Used for
   * scope-specific affordances (Saved Views, Share, etc). */
  readonly actions?: ReactNode;
  readonly searchPlaceholder?: string;

  readonly variant?: SearchBarVariant;
  readonly scope?: ExplorerScope;
  readonly valueSuggestions?: Readonly<Record<string, readonly SuggestionOption[]>>;
  readonly disableBareFreeTextFallback?: boolean;
  readonly hideTimePicker?: boolean;
}

export const ExplorerHeader = memo(
  forwardRef<HTMLInputElement, Props>(function ExplorerHeader(props, ref) {
    return (
      <header className="sticky top-0 z-20 flex flex-col gap-2 border-border border-b bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <SearchBar props={props} inputRef={ref} />
          </div>
          {props.actions ? <div className="flex items-center gap-2">{props.actions}</div> : null}
          {!props.hideTimePicker && <ExplorerTimePicker />}
        </div>
        {props.kpiStrip ? <div>{props.kpiStrip}</div> : null}
      </header>
    );
  })
);

function SearchBar({ props, inputRef }: { props: Props; inputRef: React.Ref<HTMLInputElement> }) {
  if (props.variant === "dsl") {
    return (
      <ExplorerSearchBarDsl
        ref={inputRef}
        filters={props.filters}
        onApply={(filters) => props.onChangeFilters(filters)}
        placeholder={props.searchPlaceholder}
        scope={props.scope}
        valueSuggestions={props.valueSuggestions}
        disableBareFreeTextFallback={props.disableBareFreeTextFallback}
      />
    );
  }
  return (
    <ExplorerSearchBar
      ref={inputRef}
      filters={props.filters}
      onChangeFilters={props.onChangeFilters}
      onSubmitFreeText={props.onSubmitFreeText}
      placeholder={props.searchPlaceholder}
    />
  );
}
