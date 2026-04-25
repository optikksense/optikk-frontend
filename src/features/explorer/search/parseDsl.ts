import type { ExplorerFilter, ExplorerFilterOp } from "../types/filters";

import { findKnownField } from "./knownFields";
import { tokenizeDsl, type Token } from "./tokenizeDsl";

export interface ParseError {
  readonly offset: number;
  readonly length: number;
  readonly message: string;
}

export interface ParseResult {
  readonly filters: ExplorerFilter[];
  readonly errors: ParseError[];
}

/** Parse a Datadog-style DSL string into explorer filters (best-effort). */
export function parseDsl(input: string): ParseResult {
  const filters: ExplorerFilter[] = [];
  const errors: ParseError[] = [];
  for (const tok of tokenizeDsl(input)) {
    if (tok.kind === "bare") handleBare(tok, filters);
    else if (tok.kind === "quoted") handleQuoted(tok, filters);
    else if (tok.kind === "kv") handleKv(tok, filters, errors);
  }
  return { filters, errors };
}

function handleBare(tok: Token, out: ExplorerFilter[]) {
  if (tok.raw === "") return;
  out.push({ field: "search", op: "contains", value: tok.raw });
}

function handleQuoted(tok: Token, out: ExplorerFilter[]) {
  const value = tok.value ?? "";
  if (value === "") return;
  out.push({ field: "search", op: "contains", value });
}

function handleKv(tok: Token, out: ExplorerFilter[], errors: ParseError[]) {
  const keyRaw = tok.key ?? "";
  const valueRaw = tok.value ?? "";
  const negate = keyRaw.startsWith("-");
  const key = negate ? keyRaw.slice(1) : keyRaw;
  if (key === "" || valueRaw === "") {
    errors.push({ offset: tok.offset, length: tok.length, message: "Empty field or value" });
    return;
  }
  if (!isValidField(key)) {
    errors.push({ offset: tok.offset, length: tok.length, message: `Unknown field "${key}"` });
    return;
  }
  const parsed = parseValue(valueRaw);
  if (parsed === null) {
    errors.push({ offset: tok.offset, length: tok.length, message: "Could not parse value" });
    return;
  }
  out.push({ field: key, op: effectiveOp(parsed.op, negate), value: parsed.value });
}

interface ParsedValue {
  readonly op: ExplorerFilterOp;
  readonly value: string;
}

function parseValue(raw: string): ParsedValue | null {
  const cmp = parseComparison(raw);
  if (cmp) return cmp;
  if (raw.startsWith("(") && raw.endsWith(")")) {
    const inner = raw.slice(1, -1);
    const parts = inner.split(/\s+OR\s+/i).map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) return null;
    return { op: "in", value: parts.join(",") };
  }
  return { op: "eq", value: raw };
}

function parseComparison(raw: string): ParsedValue | null {
  if (raw.startsWith(">=")) return { op: "gte", value: raw.slice(2) };
  if (raw.startsWith("<=")) return { op: "lte", value: raw.slice(2) };
  if (raw.startsWith(">")) return { op: "gt", value: raw.slice(1) };
  if (raw.startsWith("<")) return { op: "lt", value: raw.slice(1) };
  return null;
}

function effectiveOp(op: ExplorerFilterOp, negate: boolean): ExplorerFilterOp {
  if (!negate) return op;
  if (op === "eq") return "neq";
  if (op === "in") return "not_in";
  if (op === "contains") return "not_contains";
  return op;
}

function isValidField(key: string): boolean {
  if (key.startsWith("@")) return key.length > 1;
  return findKnownField(key) !== undefined;
}
