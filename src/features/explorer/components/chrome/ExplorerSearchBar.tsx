import { Search, X } from "lucide-react";
import { forwardRef, useCallback, useState } from "react";
import { Group, Input, SearchField } from "react-aria-components";

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
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-accent px-2 py-1 text-[12px] text-foreground-secondary">
      <span className="font-mono text-[11px] text-foreground">
        {filter.field}
        {":"}
        {filter.value}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${filter.field}:${filter.value}`}
        className="text-foreground-muted hover:text-foreground"
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
    <SearchField 
      value={text}
      onChange={setText}
      onSubmit={(val) => {
        if (val.trim().length > 0) {
          onSubmitFreeText(val.trim());
          setText("");
        }
      }}
      aria-label={placeholder}
      className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-border bg-muted px-2 py-1"
    >
      <Search size={14} className="shrink-0 text-foreground-muted" />
      <Group className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
        {filters.map((filter, index) => (
          <FilterChip
            key={`${filter.field}:${filter.op}:${filter.value}:${index}`}
            filter={filter}
            onRemove={() => removeAt(index)}
          />
        ))}
        <Input
          ref={ref}
          placeholder={placeholder}
          className="min-w-[120px] flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-foreground-muted"
        />
      </Group>
    </SearchField>
  );
});
