import { memo } from "react";

export interface SuggestionOption {
  readonly value: string;
  readonly label?: string;
  readonly hint?: string;
}

interface Props {
  readonly options: readonly SuggestionOption[];
  readonly activeIndex: number;
  readonly onSelect: (opt: SuggestionOption) => void;
  readonly onHover: (index: number) => void;
  readonly loading?: boolean;
  readonly title?: string;
}

/** Popover dropdown for the DSL search bar. Renders values or field names. */
function QuerySuggestionsComponent(p: Props) {
  if (!p.loading && p.options.length === 0) return null;
  return (
    <div className="absolute z-30 mt-1 w-80 max-h-64 overflow-y-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-lg">
      {p.title ? (
        <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
          {p.title}
        </div>
      ) : null}
      {p.loading ? (
        <div className="px-2 py-2 text-[11px] text-[var(--text-muted)]">Loading…</div>
      ) : (
        <ul className="flex flex-col py-1">
          {p.options.map((opt, i) => (
            <li key={`${opt.value}-${i}`}>
              <button
                type="button"
                onMouseEnter={() => p.onHover(i)}
                onMouseDown={(e) => { e.preventDefault(); p.onSelect(opt); }}
                className={`flex w-full items-center justify-between px-3 py-1 text-left text-[12px] ${
                  i === p.activeIndex
                    ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                }`}
              >
                <span className="truncate font-mono">{opt.label ?? opt.value}</span>
                {opt.hint ? <span className="ml-2 text-[10px] text-[var(--text-muted)]">{opt.hint}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const QuerySuggestions = memo(QuerySuggestionsComponent);
