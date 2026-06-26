import { type KnownField, TRACE_KNOWN_FIELDS, findKnownField } from "./knownFields";

export type DslCompletionKind = "field" | "value" | "attribute" | "operator" | "empty";

export interface DslCompletionContext {
  readonly kind: DslCompletionKind;
  /** Characters before the caret that belong to the current token. */
  readonly tokenPrefix: string;

  readonly field: string | null;

  readonly caret: number;

  readonly tokenStart: number;

  readonly bodyHintToken?: string;
}

export function dslContextAtCaret(
  input: string,
  caret: number,
  fields: readonly KnownField[] = TRACE_KNOWN_FIELDS
): DslCompletionContext {
  if (input.trim() === "") {
    return { kind: "empty", tokenPrefix: "", field: null, caret, tokenStart: 0 };
  }
  const head = input.slice(0, caret);
  const lastWsIdx = findLastWhitespaceIdx(head);
  const tokenStart = lastWsIdx + 1;
  const token = head.slice(tokenStart);

  if (token === "" && lastWsIdx >= 0) {
    const prev = priorToken(head, lastWsIdx);
    if (prev !== null) {
      const stripped = stripNegation(prev);
      if (findKnownField(stripped, fields) !== undefined) {
        return {
          kind: "operator",
          tokenPrefix: "",
          field: stripped,
          caret,
          tokenStart: caret,
        };
      }
    }
  }

  const colonIdx = token.indexOf(":");
  if (colonIdx === -1) {
    const isAttr = token.startsWith("@");
    if (isAttr) {
      return {
        kind: "attribute",
        tokenPrefix: token.slice(1),
        field: null,
        caret,
        tokenStart,
      };
    }
    const stripped = stripNegation(token);
    const ctx: DslCompletionContext = {
      kind: "field",
      tokenPrefix: stripped,
      field: null,
      caret,
      tokenStart,
    };
    if (stripped.length >= 2 && findKnownField(stripped, fields) === undefined) {
      return { ...ctx, bodyHintToken: stripped };
    }
    return ctx;
  }

  const rawKey = token.slice(0, colonIdx);
  const key = stripNegation(rawKey);
  const valuePrefix = token.slice(colonIdx + 1);
  return { kind: "value", tokenPrefix: valuePrefix, field: key, caret, tokenStart };
}

function priorToken(head: string, lastWsIdx: number): string | null {
  let end = lastWsIdx;
  while (end > 0 && (head[end - 1] === " " || head[end - 1] === "\t")) end -= 1;
  if (end === 0) return null;
  let start = end - 1;
  while (start > 0 && head[start - 1] !== " " && head[start - 1] !== "\t") start -= 1;
  return head.slice(start, end);
}

function findLastWhitespaceIdx(s: string): number {
  for (let i = s.length - 1; i >= 0; i -= 1) {
    const ch = s[i];
    if (ch === " " || ch === "\t") return i;
  }
  return -1;
}

function stripNegation(token: string): string {
  return token.startsWith("-") ? token.slice(1) : token;
}

export function matchingFields(
  prefix: string,
  fields: readonly KnownField[] = TRACE_KNOWN_FIELDS
): readonly KnownField[] {
  if (prefix === "") return fields;
  const lower = prefix.toLowerCase();
  return fields.filter((f) => f.key.toLowerCase().includes(lower));
}
