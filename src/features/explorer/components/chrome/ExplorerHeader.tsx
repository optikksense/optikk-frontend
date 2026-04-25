import { forwardRef, memo, type ReactNode } from "react";

import type { ExplorerFilter, ExplorerMode } from "../../types/filters";
import { ExplorerModeToggle } from "./ExplorerModeToggle";
import { ExplorerSearchBar } from "./ExplorerSearchBar";
import { ExplorerSearchBarDsl } from "./ExplorerSearchBarDsl";
import { ExplorerTimePicker } from "./ExplorerTimePicker";

export type SearchBarVariant = "classic" | "dsl";

interface Props {
  readonly filters: readonly ExplorerFilter[];
  readonly onChangeFilters: (next: readonly ExplorerFilter[]) => void;
  readonly onSubmitFreeText: (text: string) => void;
  readonly mode: ExplorerMode;
  readonly onModeChange: (next: ExplorerMode) => void;
  readonly kpiStrip?: ReactNode;
  readonly searchPlaceholder?: string;
  /** "dsl" renders the Datadog-style parsed query bar; "classic" keeps the chip builder. */
  readonly variant?: SearchBarVariant;
}

export const ExplorerHeader = memo(
  forwardRef<HTMLInputElement, Props>(function ExplorerHeader(props, ref) {
    return (
      <header className="sticky top-0 z-20 flex flex-col gap-2 border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <SearchBar props={props} inputRef={ref} />
          </div>
          <ExplorerTimePicker />
          <ExplorerModeToggle mode={props.mode} onChange={props.onModeChange} />
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
