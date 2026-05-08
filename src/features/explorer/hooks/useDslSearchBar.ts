import { useCallback, useMemo, useState } from "react";

import type { SuggestionOption } from "../components/chrome/QuerySuggestions";
import { dslContextAtCaret, matchingFields } from "../search/dslContext";
import {
  type KnownField,
  SUGGESTABLE_SCALAR_FIELDS,
  knownFieldsForScope,
} from "../search/knownFields";
import { parseDsl } from "../search/parseDsl";
import type { ExplorerScope } from "../types/filters";
import { useQuerySuggestions } from "./useQuerySuggestions";

interface Args {
  readonly initial: string;
  readonly scope?: ExplorerScope;
  readonly valueSuggestions?: Readonly<Record<string, readonly SuggestionOption[]>>;
}

/**
 * State + derived suggestion data for the DSL search bar. Keeps the React
 * component lean — it only renders.
 */
export function useDslSearchBar({ initial, scope, valueSuggestions }: Args) {
  const [input, setInput] = useState(initial);
  const [caret, setCaret] = useState(initial.length);
  const [activeIdx, setActiveIdx] = useState(0);
  const knownFields = useMemo(() => knownFieldsForScope(scope), [scope]);

  const parsed = useMemo(() => parseDsl(input, knownFields), [input, knownFields]);
  const context = useMemo(() => dslContextAtCaret(input, caret), [input, caret]);
  const localValueSuggestions = useMemo(
    () => filterLocalSuggestions(valueSuggestions?.[context.field ?? ""], context.tokenPrefix),
    [valueSuggestions, context.field, context.tokenPrefix]
  );

  const valueQuery = useQuerySuggestions({
    field:
      context.kind === "value" && context.field !== null
        ? normalizeSuggestField(context.field)
        : null,
    prefix: context.tokenPrefix,
    enabled:
      context.kind === "value" &&
      localValueSuggestions.length === 0 &&
      scope !== "logs" &&
      isSuggestableField(context.field),
  });

  const suggestions = useMemo<readonly SuggestionOption[]>(
    () => buildSuggestions(context, valueQuery.data ?? [], localValueSuggestions, knownFields),
    [context, valueQuery.data, localValueSuggestions, knownFields]
  );
  const isLoading =
    context.kind === "value" && localValueSuggestions.length === 0 && valueQuery.isPending;

  const onChange = useCallback((next: string, pos: number) => {
    setInput(next);
    setCaret(pos);
    setActiveIdx(0);
  }, []);

  const acceptSuggestion = useCallback(
    (opt: SuggestionOption) => {
      const { head, tail } = splitAroundToken(input, context.tokenStart, caret);
      const insert = renderInsert(context, opt.value);
      const nextInput = `${head}${insert}${tail}`;
      const nextCaret = head.length + insert.length;
      setInput(nextInput);
      setCaret(nextCaret);
      setActiveIdx(0);
    },
    [input, caret, context]
  );

  return {
    input,
    setInput,
    caret,
    setCaret,
    parsed,
    context,
    suggestions,
    isLoading,
    activeIdx,
    setActiveIdx,
    onChange,
    acceptSuggestion,
  };
}

function normalizeSuggestField(field: string): string {
  // Backend scalar suggestion uses `http_status`; FE normalizes.
  if (field === "http_status_code") return "http_status";
  return field;
}

function isSuggestableField(field: string | null): boolean {
  if (field === null) return false;
  if (field.startsWith("@")) return true;
  return SUGGESTABLE_SCALAR_FIELDS.has(normalizeSuggestField(field));
}

function buildSuggestions(
  context: ReturnType<typeof dslContextAtCaret>,
  values: readonly { value: string; count: number }[],
  localValues: readonly SuggestionOption[],
  knownFields: readonly KnownField[]
): readonly SuggestionOption[] {
  if (context.kind === "field") {
    return matchingFields(context.tokenPrefix, knownFields).map((f) => ({
      value: `${f.key}:`,
      label: f.key,
      hint: f.label,
    }));
  }
  if (localValues.length > 0) return localValues;
  return values.map((v) => ({ value: v.value, label: v.value, hint: `${v.count}` }));
}

function filterLocalSuggestions(
  options: readonly SuggestionOption[] | undefined,
  prefix: string
): readonly SuggestionOption[] {
  if (!options) return [];
  const q = prefix.trim().toLowerCase();
  if (!q) return options;
  return options.filter((option) => (option.label ?? option.value).toLowerCase().includes(q));
}

function splitAroundToken(input: string, tokenStart: number, caret: number) {
  return { head: input.slice(0, tokenStart), tail: input.slice(caret) };
}

function renderInsert(context: ReturnType<typeof dslContextAtCaret>, value: string): string {
  if (context.kind === "value") {
    const quoted = /\s/.test(value) ? `"${value}"` : value;
    const key = context.field ?? "";
    return `${key}:${quoted} `;
  }
  return value; // field or attribute: value already contains the `:` if needed
}
