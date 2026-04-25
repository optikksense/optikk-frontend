export type TokenKind = "bare" | "quoted" | "kv" | "whitespace";

export interface Token {
  readonly kind: TokenKind;
  readonly offset: number;
  readonly length: number;
  readonly raw: string;
  /** For kv tokens: already-split sides (operator marker like `-` stays part of key). */
  readonly key?: string;
  readonly value?: string;
}

/**
 * Lightweight Datadog-DSL tokenizer: splits on whitespace, respects double-quoted
 * phrases, and recognises `key:value` (with optional leading `-` for negation).
 * Nested quotes, AND/OR/parens — out of scope; any unmatched input becomes a
 * bare token and falls through to the search-contains fallback.
 */
export function tokenizeDsl(input: string): readonly Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (ch === " " || ch === "\t") {
      i += 1;
      continue;
    }
    if (ch === '"') {
      i = readQuoted(input, i, out);
      continue;
    }
    i = readBareOrKv(input, i, out);
  }
  return out;
}

function readQuoted(input: string, start: number, out: Token[]): number {
  let j = start + 1;
  while (j < input.length && input[j] !== '"') j += 1;
  const endIncl = j < input.length ? j + 1 : j;
  out.push({
    kind: "quoted",
    offset: start,
    length: endIncl - start,
    raw: input.slice(start, endIncl),
    value: input.slice(start + 1, j),
  });
  return endIncl;
}

function readBareOrKv(input: string, start: number, out: Token[]): number {
  let j = start;
  let colonAt = -1;
  let inParens = false;
  while (j < input.length) {
    const c = input[j];
    if ((c === " " || c === "\t") && !inParens) break;
    if (c === "(") inParens = true;
    else if (c === ")") inParens = false;
    else if (c === ":" && colonAt === -1) colonAt = j;
    j += 1;
  }
  const raw = input.slice(start, j);
  if (colonAt > start) {
    const key = input.slice(start, colonAt);
    const value = input.slice(colonAt + 1, j);
    out.push({ kind: "kv", offset: start, length: j - start, raw, key, value });
  } else {
    out.push({ kind: "bare", offset: start, length: j - start, raw });
  }
  return j;
}
