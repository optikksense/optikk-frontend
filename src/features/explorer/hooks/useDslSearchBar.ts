import { useCallback, useMemo, useState } from "react";

import type { SuggestionOption } from "../components/chrome/QuerySuggestions";
import { dslContextAtCaret, matchingFields } from "../search/dslContext";
import {
  CATEGORY_ORDER,
  type KnownField,
  OPERATOR_OPTIONS,
  POPULAR_ATTRIBUTE_KEYS,
  SUGGESTABLE_SCALAR_FIELDS,
  knownFieldsForScope,
  quickTemplatesForScope,
} from "../search/knownFields";
import { parseDsl } from "../search/parseDsl";
import { getRecent, pushRecent } from "../search/recentSearches";
import type { ExplorerScope } from "../types/filters";
import { useQuerySuggestions } from "./useQuerySuggestions";

interface Args {
  readonly initial: string;
  readonly scope?: ExplorerScope;
  readonly valueSuggestions?: Readonly<Record<string, readonly SuggestionOption[]>>;
}

const SUGGEST_PREFIX = "__suggest__:";
const RECENT_PREFIX = "__recent__:";
const TEMPLATE_PREFIX = "__template__:";
const BODY_HINT_PREFIX = "__bodyhint__:";
const OPERATOR_PREFIX = "__op__:";

function encodeSuggest(prefix: string, value: string): string {
  return `${prefix}${value}`;
}

function decodeSuggest(value: string): { prefix: string; value: string } | null {
  for (const p of [
    SUGGEST_PREFIX,
    RECENT_PREFIX,
    TEMPLATE_PREFIX,
    BODY_HINT_PREFIX,
    OPERATOR_PREFIX,
  ]) {
    if (value.startsWith(p)) return { prefix: p, value: value.slice(p.length) };
  }
  return null;
}

/**
 * State + derived suggestion data for the DSL search bar. Keeps the React
 * component lean — it only renders.
 */
export function useDslSearchBar({
  initial,
  scope,
  valueSuggestions,
}: Args) {
  const [input, setInput] = useState(initial);
  const [caret, setCaret] = useState(initial.length);
  const [activeIdx, setActiveIdx] = useState(0);
  const knownFields = useMemo(() => knownFieldsForScope(scope), [scope]);

  const parsed = useMemo(() => parseDsl(input, knownFields), [input, knownFields]);
  const context = useMemo(
    () => dslContextAtCaret(input, caret, knownFields),
    [input, caret, knownFields]
  );
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

  const recents = useMemo(() => (scope ? getRecent(scope) : []), [scope]);
  const templates = useMemo(() => quickTemplatesForScope(scope), [scope]);

  const suggestions = useMemo<readonly SuggestionOption[]>(
    () =>
      buildSuggestions({
        context,
        values: valueQuery.data ?? [],
        localValues: localValueSuggestions,
        knownFields,
        recents,
        templates,
      }),
    [context, valueQuery.data, localValueSuggestions, knownFields, recents, templates]
  );
  // `isPending` stays true while the query is `enabled: false` (react-query default),
  // so we use `isFetching` — true only during an actual in-flight request.
  const isLoading =
    context.kind === "value" && localValueSuggestions.length === 0 && valueQuery.isFetching;

  const onChange = useCallback((next: string, pos: number) => {
    setInput(next);
    setCaret(pos);
    setActiveIdx(0);
  }, []);

  const acceptSuggestion = useCallback(
    (opt: SuggestionOption) => {
      const decoded = decodeSuggest(opt.value);
      if (decoded?.prefix === RECENT_PREFIX || decoded?.prefix === TEMPLATE_PREFIX) {
        const next = decoded.value;
        setInput(next);
        setCaret(next.length);
        setActiveIdx(0);
        return;
      }
      if (decoded?.prefix === BODY_HINT_PREFIX) {
        const token = decoded.value;
        const { head, tail } = splitAroundToken(input, context.tokenStart, caret);
        const insert = `body:"${token}" `;
        const nextInput = `${head}${insert}${tail}`;
        const nextCaret = head.length + insert.length;
        setInput(nextInput);
        setCaret(nextCaret);
        setActiveIdx(0);
        return;
      }
      if (decoded?.prefix === OPERATOR_PREFIX) {
        // Operator mode: cursor is at end of input after a known key + space.
        // Replace the trailing whitespace with `<key><insert>` so e.g.
        // `service_name ` + `:` → `service_name:`, `!=` becomes `-service_name:`.
        const op = decoded.value; // raw insert string from OPERATOR_OPTIONS
        const nextInput = applyOperator(input, context.field ?? "", op);
        setInput(nextInput);
        setCaret(nextInput.length);
        setActiveIdx(0);
        return;
      }
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

  const commit = useCallback(() => {
    if (scope) pushRecent(scope, input);
  }, [scope, input]);

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
    commit,
  };
}

function normalizeSuggestField(field: string): string {
  if (field === "http_status_code") return "http_status";
  return field;
}

function isSuggestableField(field: string | null): boolean {
  if (field === null) return false;
  if (field.startsWith("@")) return true;
  return SUGGESTABLE_SCALAR_FIELDS.has(normalizeSuggestField(field));
}

interface BuildArgs {
  readonly context: ReturnType<typeof dslContextAtCaret>;
  readonly values: readonly { value: string; count: number }[];
  readonly localValues: readonly SuggestionOption[];
  readonly knownFields: readonly KnownField[];
  readonly recents: readonly { q: string; ts: number }[];
  readonly templates: readonly { label: string; query: string; description: string }[];
}

function buildSuggestions(a: BuildArgs): readonly SuggestionOption[] {
  if (a.context.kind === "empty") {
    return buildEmptyState(a);
  }
  if (a.context.kind === "operator") {
    return OPERATOR_OPTIONS.map((op) => ({
      value: encodeSuggest(OPERATOR_PREFIX, op.insert),
      label: op.label,
      description: op.description,
      typeBadge: op.typeBadge,
      icon: "operator",
      category: "Operators",
    }));
  }
  if (a.context.kind === "attribute") {
    return POPULAR_ATTRIBUTE_KEYS.filter((k) =>
      k.key.toLowerCase().slice(1).includes(a.context.tokenPrefix.toLowerCase())
    ).map((k) => ({
      value: `${k.key}:`,
      label: k.key,
      description: k.description,
      typeBadge: "STR",
      icon: "attr",
      category: "Attributes",
    }));
  }
  if (a.context.kind === "field") {
    const fieldOptions = matchingFields(a.context.tokenPrefix, a.knownFields)
      .slice()
      .sort(byCategoryThenKey)
      .map<SuggestionOption>((f) => ({
        value: `${f.key}:`,
        label: f.key,
        description: f.description,
        typeBadge: f.typeBadge,
        icon: f.icon,
        category: f.category,
      }));
    if (a.context.bodyHintToken) {
      const t = a.context.bodyHintToken;
      return [
        {
          value: encodeSuggest(BODY_HINT_PREFIX, t),
          label: `Search body for: "${t}"`,
          description: "Free-text search across log message body",
          typeBadge: "TXT",
          icon: "body",
          category: "Search",
        },
        ...fieldOptions,
      ];
    }
    return fieldOptions;
  }
  // value
  if (a.localValues.length > 0) return a.localValues;
  return a.values.map((v) => ({
    value: v.value,
    label: v.value,
    hint: v.count.toLocaleString(),
  }));
}

function buildEmptyState(a: BuildArgs): readonly SuggestionOption[] {
  const out: SuggestionOption[] = [];
  for (const r of a.recents) {
    out.push({
      value: encodeSuggest(RECENT_PREFIX, r.q),
      label: r.q,
      icon: "recent",
      category: "Recent",
    });
  }

  for (const t of a.templates) {
    out.push({
      value: encodeSuggest(TEMPLATE_PREFIX, t.query),
      label: t.label,
      description: t.description,
      hint: t.query,
      icon: "template",
      category: "Suggested filters",
    });
  }
  return out;
}

function byCategoryThenKey(a: KnownField, b: KnownField): number {
  const ai = CATEGORY_ORDER.indexOf(a.category);
  const bi = CATEGORY_ORDER.indexOf(b.category);
  if (ai !== bi) return ai - bi;
  return a.key.localeCompare(b.key);
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
  return value; // field/attribute: value already contains `:` if needed
}

/**
 * Operator-mode insert. Caret is at end-of-input after `<key> `; we strip
 * trailing whitespace and either append the operator verbatim, or — for the
 * `!=` sentinel — prefix the trailing key with `-` and append `:`.
 */
function applyOperator(input: string, key: string, op: string): string {
  const trimmed = input.replace(/[ \t]+$/, "");
  if (op === "!=") {
    if (key === "" || !trimmed.endsWith(key)) return `${trimmed}:`;
    const head = trimmed.slice(0, trimmed.length - key.length);
    return `${head}-${key}:`;
  }
  return `${trimmed}${op}`;
}
