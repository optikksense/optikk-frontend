import { memo } from "react";

export type TraceSortMode = "recent" | "slowest" | "errors_first";

interface Props {
  readonly mode: TraceSortMode;
  readonly onChange: (mode: TraceSortMode) => void;
}

const OPTIONS: ReadonlyArray<{ value: TraceSortMode; label: string }> = [
  { value: "recent", label: "Most recent" },
  { value: "slowest", label: "Slowest" },
  { value: "errors_first", label: "Errors first" },
];

/**
 * Client-side sort of the currently-loaded page. Backend keyset pagination
 * relies on start_ms DESC so a server-side order-by is a separate project
 * (see plan §Phase 4 — "orderBy on /traces/query").
 */
function TraceSortToggleComponent({ mode, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-1 text-[11px]">
      <span className="text-[var(--text-muted)]">Sort:</span>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={
            opt.value === mode
              ? "rounded bg-[var(--bg-secondary)] px-2 py-0.5 text-[var(--text-primary)]"
              : "rounded px-2 py-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export const TraceSortToggle = memo(TraceSortToggleComponent);
