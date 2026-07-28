import type { ExplorerFilter, ExplorerFilterOp } from "../types/filters";

import { type KnownField, TRACE_KNOWN_FIELDS, findKnownField } from "./knownFields";
import { type Token, tokenizeDsl } from "./tokenizeDsl";

interface ParseError {
  readonly offset: number;
  readonly length: number;
  readonly message: string;
}

export interface ParseResult {
  readonly filters: ExplorerFilter[];
  readonly errors: ParseError[];
}

                                                                            
export function parseDsl(
  input: string,
  fields: readonly KnownField[] = TRACE_KNOWN_FIELDS
): ParseResult {
  const filters: ExplorerFilter[] = [];
  const errors: ParseError[] = [];
  for (const tok of tokenizeDsl(input)) {
    if (tok.kind === "bare") handleBare(tok, filters);
    else if (tok.kind === "quoted") handleQuoted(tok, filters);
    else if (tok.kind === "kv") handleKv(tok, filters, errors, fields);
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

function handleKv(
  tok: Token,
  out: ExplorerFilter[],
  errors: ParseError[],
  fields: readonly KnownField[]
) {
  const keyRaw = tok.key ?? "";
  const valueRaw = tok.value ?? "";
  const negate = keyRaw.startsWith("-");
  const key = negate ? keyRaw.slice(1) : keyRaw;
  if (key === "" || valueRaw === "") {
    errors.push({ offset: tok.offset, length: tok.length, message: "Empty field or value" });
    return;
  }
  if (!isValidField(key, fields)) {
    errors.push({ offset: tok.offset, length: tok.length, message: `Unknown field "${key}"` });
    return;
  }
  if (valueRaw === "*") {
    if (!key.startsWith("@")) {
      errors.push({
        offset: tok.offset,
        length: tok.length,
        message: "The :* exists operator only works on @attributes",
      });
      return;
    }
    out.push({ field: key, op: negate ? "not_exists" : "exists", value: "" });
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
                                                                           
  if (raw.length >= 2 && raw.startsWith('"') && raw.endsWith('"')) {
    const inner = raw.slice(1, -1);
    return inner === "" ? null : { op: "eq", value: inner };
  }
  const cmp = parseComparison(raw);
  if (cmp) return cmp;
  if (raw.startsWith("(") && raw.endsWith(")")) {
    const inner = raw.slice(1, -1);
    const parts = inner
      .split(/\s+OR\s+/i)
      .map((p) => p.trim())
      .filter(Boolean);
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

function isValidField(key: string, fields: readonly KnownField[]): boolean {
  if (key.startsWith("@")) return key.length > 1;
  return findKnownField(key, fields) !== undefined;
}
