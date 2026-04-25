import { useCallback, useMemo, useState } from "react";

import { dslContextAtCaret, matchingFields } from "../search/dslContext";
import { SUGGESTABLE_SCALAR_FIELDS } from "../search/knownFields";
import { parseDsl } from "../search/parseDsl";
import type { SuggestionOption } from "../components/chrome/QuerySuggestions";
import { useQuerySuggestions } from "./useQuerySuggestions";

interface Args {
  readonly initial: string;
}

/**
 * State + derived suggestion data for the DSL search bar. Keeps the React
 * component lean — it only renders.
 */
export function useDslSearchBar({ initial }: Args) {
  const [input, setInput] = useState(initial);
  const [caret, setCaret] = useState(initial.length);
  const [activeIdx, setActiveIdx] = useState(0);

  const parsed = useMemo(() => parseDsl(input), [input]);
  const context = useMemo(() => dslContextAtCaret(input, caret), [input, caret]);

  const valueQuery = useQuerySuggestions({
    field: context.kind === "value" && context.field !== null ? normalizeSuggestField(context.field) : null,
    prefix: context.tokenPrefix,
    enabled: context.kind === "value" && isSuggestableField(context.field),
  });

  const suggestions = useMemo<readonly SuggestionOption[]>(
    () => buildSuggestions(context, valueQuery.data ?? []),
    [context, valueQuery.data],
  );
  const isLoading = context.kind === "value" && valueQuery.isPending;

  const onChange = useCallback((next: string, pos: number) => {
    setInput(next);
    setCaret(pos);
    setActiveIdx(0);
  }, []);

  const acceptSuggestion = useCallback((opt: SuggestionOption) => {
    const { head, tail } = splitAroundToken(input, context.tokenStart, caret);
    const insert = renderInsert(context, opt.value);
    const nextInput = `${head}${insert}${tail}`;
    const nextCaret = head.length + insert.length;
    setInput(nextInput);
    setCaret(nextCaret);
    setActiveIdx(0);
  }, [input, caret, context]);

  return { input, setInput, caret, setCaret, parsed, context, suggestions, isLoading,
    activeIdx, setActiveIdx, onChange, acceptSuggestion };
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
): readonly SuggestionOption[] {
  if (context.kind === "field") {
    return matchingFields(context.tokenPrefix).map((f) => ({
      value: `${f.key}:`,
      label: f.key,
      hint: f.label,
    }));
  }
  return values.map((v) => ({ value: v.value, label: v.value, hint: `${v.count}` }));
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
