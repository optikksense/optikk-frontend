import { forwardRef, memo, type ReactNode } from "react";

import type { ExplorerFilter, ExplorerMode } from "../../types/filters";
import { ExplorerModeToggle } from "./ExplorerModeToggle";
import { ExplorerSearchBar } from "./ExplorerSearchBar";
import { ExplorerTimePicker } from "./ExplorerTimePicker";

interface Props {
  readonly filters: readonly ExplorerFilter[];
  readonly onChangeFilters: (next: readonly ExplorerFilter[]) => void;
  readonly onSubmitFreeText: (text: string) => void;
  readonly mode: ExplorerMode;
  readonly onModeChange: (next: ExplorerMode) => void;
  readonly kpiStrip?: ReactNode;
  readonly searchPlaceholder?: string;
}

export const ExplorerHeader = memo(
  forwardRef<HTMLInputElement, Props>(function ExplorerHeader(props, ref) {
    const {
      filters,
      onChangeFilters,
      onSubmitFreeText,
      mode,
      onModeChange,
      kpiStrip,
      searchPlaceholder,
    } = props;
    return (
      <header className="sticky top-0 z-20 flex flex-col gap-2 border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <ExplorerSearchBar
              ref={ref}
              filters={filters}
              onChangeFilters={onChangeFilters}
              onSubmitFreeText={onSubmitFreeText}
              placeholder={searchPlaceholder}
            />
          </div>
          <ExplorerTimePicker />
          <ExplorerModeToggle mode={mode} onChange={onModeChange} />
        </div>
        {kpiStrip ? <div>{kpiStrip}</div> : null}
      </header>
    );
  })
);
