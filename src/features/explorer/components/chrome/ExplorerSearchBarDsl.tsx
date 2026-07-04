import { type KeyboardEvent, forwardRef, memo, useCallback, useEffect, useRef, useState } from "react";
import { Group, Input, Popover, SearchField } from "react-aria-components";

import { useDslSearchBar } from "../../hooks/useDslSearchBar";
import { formatDsl } from "../../search/formatDsl";
import type { ExplorerFilter, ExplorerScope } from "../../types/filters";
import { QuerySuggestions, type SuggestionOption } from "./QuerySuggestions";

interface Props {
  readonly filters: readonly ExplorerFilter[];
  readonly onApply: (filters: readonly ExplorerFilter[], raw: string) => void;
  readonly placeholder?: string;
  readonly scope?: ExplorerScope;
  readonly valueSuggestions?: Readonly<Record<string, readonly SuggestionOption[]>>;
  readonly disableBareFreeTextFallback?: boolean;
}

/**
 * Datadog-style single-line DSL query bar. Parses filters on every keystroke
 * for inline error feedback, pops a suggestions menu on context, applies on
 * Enter. See `parseDsl` for the accepted grammar.
 */
function ExplorerSearchBarDslComponent(props: Props, ref: React.Ref<HTMLInputElement>) {
  const seed = formatDsl(props.filters);
  const [showPopover, setShowPopover] = useState(false);
  const s = useDslSearchBar({
    initial: seed,
    scope: props.scope,
    valueSuggestions: props.valueSuggestions,
  });
  useSyncSeedOnExternalChange(seed, s.input, s.setInput, s.setCaret);
  const activeOpt = s.suggestions[s.activeIdx];
  const onSelect = useCallback(
    (opt: SuggestionOption) => {
      s.acceptSuggestion(opt);
      setShowPopover(true);
    },
    [s]
  );
  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      handleKeyDown(
        e,
        showPopover,
        setShowPopover,
        s,
        props.onApply,
        activeOpt,
        props.disableBareFreeTextFallback
      );
    },
    [showPopover, s, props.onApply, activeOpt]
  );
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
  const triggerRef = useRef<HTMLDivElement>(null);
  return (
    <SearchField
      value={s.input}
      onChange={() => {
        // SearchField onChange doesn't provide caret pos, so we rely on Input onChange
      }}
      aria-label="Search query"
      className="relative w-full"
    >
      <Group ref={triggerRef} className={inputClass(s.parsed.errors.length > 0)}>
        <Input
          ref={p.inputRef}
          placeholder={p.placeholder ?? 'service:foo -env:prod @http.status_code:>=500 "timeout"'}
          onChange={(e) => {
            s.onChange(e.target.value, e.target.selectionStart ?? e.target.value.length);
            p.setShowPopover(true);
          }}
          onSelect={(e) => s.setCaret((e.target as HTMLInputElement).selectionStart ?? 0)}
          onFocus={() => p.setShowPopover(true)}
          onKeyDown={p.onKeyDown}
          className="w-full bg-transparent outline-none"
          spellCheck={false}
          autoComplete="off"
        />
      </Group>
      <Popover
        triggerRef={triggerRef}
        isOpen={p.showPopover}
        onOpenChange={p.setShowPopover}
        isNonModal
        placement="bottom start"
        className="w-[var(--trigger-width)]"
      >
        <QuerySuggestions
          options={s.suggestions}
          activeIndex={s.activeIdx}
          onSelect={p.onSelect}
          onHover={s.setActiveIdx}
          loading={s.isLoading}
          title={popoverTitle(s.context)}
          highlight={s.context.tokenPrefix}
        />
      </Popover>
      {s.parsed.errors.length > 0 ? (
        <div className="mt-1 text-[10px] text-error">{s.parsed.errors[0].message}</div>
      ) : null}
    </SearchField>
  );
}

function inputClass(hasError: boolean): string {
  const base =
    "flex w-full items-center rounded border px-2 py-1 font-mono text-[13px] outline-none focus-within:border-[var(--accent)]";
  return hasError ? `${base} border-error bg-background` : `${base} border-border bg-background`;
}

function popoverTitle(context: ReturnType<typeof useDslSearchBar>["context"]): string | undefined {
  if (context.kind === "empty") return undefined;
  if (context.kind === "operator") return `Operators for ${context.field}`;
  if (context.kind === "attribute") return "Attributes";
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
  disableBareFreeTextFallback: boolean | undefined
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
    s.commit();
    onApply(effectiveFilters(s, { disableBareFreeTextFallback }), s.input);
  }
}

function effectiveFilters(
  s: ReturnType<typeof useDslSearchBar>,
  opts: { readonly disableBareFreeTextFallback?: boolean } = {}
): Props["filters"] {
  if (s.parsed.filters.length > 0) return s.parsed.filters;
  if (opts.disableBareFreeTextFallback) return [];
  const raw = s.input.trim();
  if (raw === "") return [];
  return [{ field: "search", op: "contains", value: raw }];
}

function useSyncSeedOnExternalChange(
  seed: string,
  current: string,
  setInput: (v: string) => void,
  setCaret: (v: number) => void
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
