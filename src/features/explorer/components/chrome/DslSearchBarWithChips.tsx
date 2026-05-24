import { X } from "lucide-react";
import { forwardRef, memo } from "react";


import { findKnownField, knownFieldsForScope } from "../../search/knownFields";
import type { ExplorerFilter, ExplorerFilterOp, ExplorerScope } from "../../types/filters";
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
  Common: "border-[#86b3ff]/40 bg-[#86b3ff]/10 text-[#cfe0ff]",
  Identifiers: "border-[#bfa9ff]/40 bg-[#bfa9ff]/10 text-[#dccff7]",
  Resource: "border-[#7fc8a4]/40 bg-[#7fc8a4]/10 text-[#cfe6dc]",
  Attributes: "border-[#e6a4d4]/40 bg-[#e6a4d4]/10 text-[#f4d2e7]",
  Search: "border-[#f9c269]/40 bg-[#f9c269]/10 text-[#f4dba6]",
};

const SEVERITY_TONE: Record<string, string> = {
  TRACE: "border-[#7d8590]/50 bg-[#7d8590]/10 text-[#a6abb4]",
  DEBUG: "border-[#86b3ff]/50 bg-[#86b3ff]/10 text-[#cfe0ff]",
  INFO: "border-[#7fc8a4]/50 bg-[#7fc8a4]/10 text-[#cfe6dc]",
  WARN: "border-[#f9c269]/50 bg-[#f9c269]/10 text-[#f4dba6]",
  ERROR: "border-[#e8494d]/50 bg-[#e8494d]/10 text-[#f5b6b8]",
  FATAL: "border-[#e8494d]/70 bg-[#e8494d]/20 text-[#f7c8ca]",
};

/** Composes the DSL bar with a chip strip below for visual filter editing. */
function DslSearchBarWithChipsComponent(props: Props, ref: React.Ref<HTMLInputElement>) {
  const fields = knownFieldsForScope(props.scope);
  const onRemoveAt = (idx: number) => {
    const next = props.filters.filter((_, i) => i !== idx);
    props.onApply(next, "");
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
              // eslint-disable-next-line react/no-array-index-key
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
  if (f.field === "severity_text") {
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
      <span className="truncate max-w-[260px]">
        {filter.field === "search" ? "" : `${filter.field}${opLabel(filter.op)}`}
        {filter.value}
      </span>
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

function opLabel(op: ExplorerFilterOp): string {
  switch (op) {
    case "eq":
      return ":";
    case "neq":
      return "!=";
    case "contains":
      return "~";
    case "not_contains":
      return "!~";
    case "in":
      return ":";
    case "not_in":
      return "!:";
    case "gt":
      return ":>";
    case "gte":
      return ":>=";
    case "lt":
      return ":<";
    case "lte":
      return ":<=";
    case "exists":
      return ":*";
    case "not_exists":
      return "!:*";
    default:
      return ":";
  }
}

export const DslSearchBarWithChips = memo(forwardRef(DslSearchBarWithChipsComponent));
