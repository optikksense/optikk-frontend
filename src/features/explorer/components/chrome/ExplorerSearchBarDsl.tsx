import { forwardRef, memo, useCallback, useEffect, useState, type KeyboardEvent } from "react";

import { useDslSearchBar } from "../../hooks/useDslSearchBar";
import { formatDsl } from "../../search/formatDsl";
import type { ExplorerFilter } from "../../types/filters";
import { QuerySuggestions, type SuggestionOption } from "./QuerySuggestions";

interface Props {
  readonly filters: readonly ExplorerFilter[];
  readonly onApply: (filters: readonly ExplorerFilter[], raw: string) => void;
  readonly placeholder?: string;
}

/**
 * Datadog-style single-line DSL query bar. Parses filters on every keystroke
 * for inline error feedback, pops a suggestions menu on context, applies on
 * Enter. See `parseDsl` for the accepted grammar.
 */
function ExplorerSearchBarDslComponent(props: Props, ref: React.Ref<HTMLInputElement>) {
  const seed = formatDsl(props.filters);
  const [showPopover, setShowPopover] = useState(false);
  const s = useDslSearchBar({ initial: seed });
  useSyncSeedOnExternalChange(seed, s.input, s.setInput, s.setCaret);
  const activeOpt = s.suggestions[s.activeIdx];
  const onSelect = useCallback((opt: SuggestionOption) => {
    s.acceptSuggestion(opt);
    setShowPopover(true);
  }, [s]);
  const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    handleKeyDown(e, showPopover, setShowPopover, s, props.onApply, activeOpt);
  }, [showPopover, s, props.onApply, activeOpt]);
  return (
    <DslBarLayout
      inputRef={ref}
      state={s}
      showPopover={showPopover}
      setShowPopover={setShowPopover}
      onSelect={onSelect}
      onKeyDown={onKeyDown}
      placeholder={props.placeholder}
    />
  );
}

interface LayoutProps {
  readonly inputRef: React.Ref<HTMLInputElement>;
  readonly state: ReturnType<typeof useDslSearchBar>;
  readonly showPopover: boolean;
  readonly setShowPopover: (v: boolean) => void;
  readonly onSelect: (opt: SuggestionOption) => void;
  readonly onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  readonly placeholder?: string;
}

function DslBarLayout(p: LayoutProps) {
  const { state: s } = p;
  return (
    <div className="relative">
      <input
        ref={p.inputRef}
        type="text"
        value={s.input}
        placeholder={p.placeholder ?? "service:foo -env:prod @http.status_code:>=500 \"timeout\""}
        onChange={(e) => { s.onChange(e.target.value, e.target.selectionStart ?? e.target.value.length); p.setShowPopover(true); }}
        onSelect={(e) => s.setCaret((e.target as HTMLInputElement).selectionStart ?? 0)}
        onFocus={() => p.setShowPopover(true)}
        onBlur={() => setTimeout(() => p.setShowPopover(false), 150)}
        onKeyDown={p.onKeyDown}
        className={inputClass(s.parsed.errors.length > 0)}
        spellCheck={false}
        autoComplete="off"
      />
      {p.showPopover ? (
        <QuerySuggestions
          options={s.suggestions}
          activeIndex={s.activeIdx}
          onSelect={p.onSelect}
          onHover={s.setActiveIdx}
          loading={s.isLoading}
          title={popoverTitle(s.context)}
        />
      ) : null}
      {s.parsed.errors.length > 0 ? (
        <div className="mt-1 text-[10px] text-[#e8494d]">{s.parsed.errors[0].message}</div>
      ) : null}
    </div>
  );
}

function inputClass(hasError: boolean): string {
  const base = "w-full rounded border px-2 py-1 font-mono text-[13px] outline-none focus:border-[var(--accent)]";
  return hasError
    ? `${base} border-[#e8494d] bg-[var(--bg-primary)]`
    : `${base} border-[var(--border-color)] bg-[var(--bg-primary)]`;
}

function popoverTitle(context: ReturnType<typeof useDslSearchBar>["context"]): string | undefined {
  if (context.kind === "field") return "Fields";
  if (context.field) return `Values for ${context.field}`;
  return undefined;
}

function handleKeyDown(
  e: KeyboardEvent<HTMLInputElement>,
  showPopover: boolean,
  setShowPopover: (v: boolean) => void,
  s: ReturnType<typeof useDslSearchBar>,
  onApply: Props["onApply"],
  activeOpt: SuggestionOption | undefined,
) {
  if (e.key === "Escape") {
    setShowPopover(false);
    return;
  }
  if (e.key === "ArrowDown" && showPopover && s.suggestions.length > 0) {
    e.preventDefault();
    s.setActiveIdx((s.activeIdx + 1) % s.suggestions.length);
    return;
  }
  if (e.key === "ArrowUp" && showPopover && s.suggestions.length > 0) {
    e.preventDefault();
    s.setActiveIdx((s.activeIdx - 1 + s.suggestions.length) % s.suggestions.length);
    return;
  }
  if ((e.key === "Tab" || e.key === "Enter") && showPopover && activeOpt) {
    e.preventDefault();
    s.acceptSuggestion(activeOpt);
    return;
  }
  if (e.key === "Enter") {
    e.preventDefault();
    setShowPopover(false);
    onApply(effectiveFilters(s), s.input);
  }
}

/** If parsing failed or produced nothing but the input has text, fall back to a single
 * search:contains filter so the user never loses what they typed. */
function effectiveFilters(s: ReturnType<typeof useDslSearchBar>): Props["filters"] {
  if (s.parsed.filters.length > 0) return s.parsed.filters;
  const raw = s.input.trim();
  if (raw === "") return [];
  return [{ field: "search", op: "contains", value: raw }];
}

function useSyncSeedOnExternalChange(
  seed: string,
  current: string,
  setInput: (v: string) => void,
  setCaret: (v: number) => void,
) {
  const [lastSeed, setLastSeed] = useState(seed);
  useEffect(() => {
    if (seed !== lastSeed) {
      setLastSeed(seed);
      if (seed !== current) {
        setInput(seed);
        setCaret(seed.length);
      }
    }
  }, [seed, lastSeed, current, setInput, setCaret]);
}

export const ExplorerSearchBarDsl = memo(forwardRef(ExplorerSearchBarDslComponent));
