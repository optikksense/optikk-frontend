import { KNOWN_FIELDS, type KnownField } from "./knownFields";

export type DslCompletionKind = "field" | "value" | "attribute";

export interface DslCompletionContext {
  readonly kind: DslCompletionKind;
  /** Characters before the caret that belong to the current token. */
  readonly tokenPrefix: string;
  /** For value/attribute: the field key to suggest against (`service`, `@http.status_code`, etc). */
  readonly field: string | null;
  /** Caret position (absolute in the full input). */
  readonly caret: number;
  /** Offset where the current token started (for replace-range on accept). */
  readonly tokenStart: number;
}

/**
 * Classifies what the user is typing at the caret so the popover knows whether
 * to suggest field names, value options, or custom attribute keys.
 */
export function dslContextAtCaret(input: string, caret: number): DslCompletionContext {
  const head = input.slice(0, caret);
  const lastWsIdx = findLastWhitespaceIdx(head);
  const tokenStart = lastWsIdx + 1;
  const token = head.slice(tokenStart);
  const colonIdx = token.indexOf(":");
  if (colonIdx === -1) {
    const isAttr = token.startsWith("@");
    return {
      kind: isAttr ? "attribute" : "field",
      tokenPrefix: isAttr ? token.slice(1) : stripNegation(token),
      field: null,
      caret,
      tokenStart,
    };
  }
  const rawKey = token.slice(0, colonIdx);
  const key = stripNegation(rawKey);
  const valuePrefix = token.slice(colonIdx + 1);
  return { kind: "value", tokenPrefix: valuePrefix, field: key, caret, tokenStart };
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

/** Top-K field keys matching a prefix (case-insensitive), for the field dropdown. */
export function matchingFields(prefix: string): readonly KnownField[] {
  if (prefix === "") return KNOWN_FIELDS;
  const lower = prefix.toLowerCase();
  return KNOWN_FIELDS.filter((f) => f.key.toLowerCase().includes(lower));
}
