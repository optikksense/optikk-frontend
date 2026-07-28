import { X } from "lucide-react";
import { forwardRef, memo } from "react";

import { formatDsl, formatFilter } from "../../dsl/formatDsl";
import { findKnownField, knownFieldsForScope } from "../../dsl/knownFields";
import type { ExplorerFilter, ExplorerScope } from "../../types/filters";
import { ExplorerSearchBarDsl } from "./ExplorerSearchBarDsl";
import type { SuggestionOption } from "./QuerySuggestions";

interface Props {
  readonly filters: readonly ExplorerFilter[];
  readonly onApply: (filters: readonly ExplorerFilter[], raw: string) => void;
  readonly placeholder?: string;
  readonly scope?: ExplorerScope;
  readonly valueSuggestions?: Readonly<Record<string, readonly SuggestionOption[]>>;
}

                                                                                  
                                                                               
                                                                                
const CHIP_TONE: Record<string, string> = {
  Common:
    "border-[color-mix(in_oklch,var(--color-info),transparent_55%)] bg-[color-mix(in_oklch,var(--color-info),transparent_90%)] text-info",
  Identifiers:
    "border-[color-mix(in_oklch,var(--accent),transparent_55%)] bg-[color-mix(in_oklch,var(--accent),transparent_90%)] text-[var(--accent)]",
  Resource:
    "border-[color-mix(in_oklch,var(--color-success),transparent_55%)] bg-[color-mix(in_oklch,var(--color-success),transparent_90%)] text-success",
  Attributes:
    "border-[color-mix(in_oklch,var(--fatal-c),transparent_55%)] bg-[color-mix(in_oklch,var(--fatal-c),transparent_90%)] text-[var(--fatal-c)]",
  Search:
    "border-[color-mix(in_oklch,var(--color-warning),transparent_55%)] bg-[color-mix(in_oklch,var(--color-warning),transparent_90%)] text-warning",
};

const SEVERITY_TONE: Record<string, string> = {
  TRACE:
    "border-[color-mix(in_oklch,var(--text-muted),transparent_55%)] bg-[color-mix(in_oklch,var(--text-muted),transparent_90%)] text-foreground-muted",
  DEBUG:
    "border-[color-mix(in_oklch,var(--debug-c),transparent_55%)] bg-[color-mix(in_oklch,var(--debug-c),transparent_90%)] text-[var(--debug-c)]",
  INFO: "border-[color-mix(in_oklch,var(--info-c),transparent_55%)] bg-[color-mix(in_oklch,var(--info-c),transparent_90%)] text-[var(--info-c)]",
  WARN: "border-[color-mix(in_oklch,var(--warn-c),transparent_55%)] bg-[color-mix(in_oklch,var(--warn-c),transparent_90%)] text-[var(--warn-c)]",
  ERROR:
    "border-[color-mix(in_oklch,var(--err-c),transparent_55%)] bg-[color-mix(in_oklch,var(--err-c),transparent_90%)] text-[var(--err-c)]",
  FATAL:
    "border-[color-mix(in_oklch,var(--fatal-c),transparent_40%)] bg-[color-mix(in_oklch,var(--fatal-c),transparent_82%)] text-[var(--fatal-c)]",
};

function DslSearchBarWithChipsComponent(props: Props, ref: React.Ref<HTMLInputElement>) {
  const fields = knownFieldsForScope(props.scope);
  const onRemoveAt = (idx: number) => {
    const next = props.filters.filter((_, i) => i !== idx);
                                                                            
    props.onApply(next, formatDsl(next));
  };
  return (
    <div className="flex flex-col gap-1.5">
      <ExplorerSearchBarDsl
        ref={ref}
        filters={props.filters}
        onApply={props.onApply}
        placeholder={props.placeholder}
        scope={props.scope}
        valueSuggestions={props.valueSuggestions}
      />
      {props.filters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {props.filters.map((f, i) => (
            <Chip
              key={`${f.field}-${f.op}-${f.value}-${i}`}
              filter={f}
              tone={chipTone(f, fields)}
              onRemove={() => onRemoveAt(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function chipTone(
  f: ExplorerFilter,
  fields: readonly ReturnType<typeof knownFieldsForScope>[number][]
): string {
  if (f.field === "severityText") {
    return SEVERITY_TONE[f.value.toUpperCase()] ?? CHIP_TONE.Common;
  }
  if (f.field === "search" || f.field === "body") return CHIP_TONE.Search;
  if (f.field.startsWith("@")) return CHIP_TONE.Attributes;
  const known = findKnownField(f.field, fields);
  return CHIP_TONE[known?.category ?? "Common"] ?? CHIP_TONE.Common;
}

interface ChipProps {
  readonly filter: ExplorerFilter;
  readonly tone: string;
  readonly onRemove: () => void;
}

function Chip({ filter, tone, onRemove }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[11px] ${tone}`}
    >
      {                                                                                 }
      <span className="max-w-[260px] truncate">{formatFilter(filter)}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${filter.field} filter`}
        className="text-current/60 transition hover:text-current"
      >
        <X size={11} />
      </button>
    </span>
  );
}

export const DslSearchBarWithChips = memo(forwardRef(DslSearchBarWithChipsComponent));
