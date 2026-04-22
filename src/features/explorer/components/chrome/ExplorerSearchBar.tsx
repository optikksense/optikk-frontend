import { Search, X } from "lucide-react";
import { forwardRef, useCallback, useState } from "react";

import type { ExplorerFilter } from "../../types/filters";

interface Props {
  readonly filters: readonly ExplorerFilter[];
  readonly onChangeFilters: (next: readonly ExplorerFilter[]) => void;
  readonly onSubmitFreeText: (text: string) => void;
  readonly placeholder?: string;
}

function FilterChip({
  filter,
  onRemove,
}: {
  filter: ExplorerFilter;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-color)] bg-[rgba(255,255,255,0.04)] px-2 py-1 text-[12px] text-[var(--text-secondary)]">
      <span className="font-mono text-[11px] text-[var(--text-primary)]">
        {filter.field}
        {":"}
        {filter.value}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${filter.field}:${filter.value}`}
        className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <X size={12} />
      </button>
    </span>
  );
}

/**
 * Sticky search: chips render existing structured filters; freetext input
 * submits a `body:contains` (logs) / `operation_name:contains` (traces)
 * at the page-level handler. Cross-feature imports are not allowed here.
 */
export const ExplorerSearchBar = forwardRef<HTMLInputElement, Props>(function ExplorerSearchBar(
  { filters, onChangeFilters, onSubmitFreeText, placeholder = "Search..." },
  ref
) {
  const [text, setText] = useState("");
  const removeAt = useCallback(
    (index: number) => onChangeFilters(filters.filter((_, i) => i !== index)),
    [filters, onChangeFilters]
  );
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1">
      <Search size={14} className="shrink-0 text-[var(--text-muted)]" />
      {filters.map((filter, index) => (
        <FilterChip
          key={`${filter.field}:${filter.op}:${filter.value}:${index}`}
          filter={filter}
          onRemove={() => removeAt(index)}
        />
      ))}
      <input
        ref={ref}
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && text.trim().length > 0) {
            onSubmitFreeText(text.trim());
            setText("");
          }
        }}
        placeholder={placeholder}
        className="min-w-[120px] flex-1 bg-transparent text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
      />
    </div>
  );
});
