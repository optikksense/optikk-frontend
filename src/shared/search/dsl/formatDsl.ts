import type { ExplorerFilter, ExplorerFilterOp } from "../types/filters";

/** Inverse of parseDsl — renders filters back into a DSL string. */
export function formatDsl(filters: readonly ExplorerFilter[]): string {
  return filters
    .map(formatFilter)
    .filter((s) => s !== "")
    .join(" ");
}

/** Renders one filter as retypeable DSL (also used for chip labels). */
function formatFilter(f: ExplorerFilter): string {
  if (f.field === "search") return formatSearch(f);
  const prefix = isNegation(f.op) ? "-" : "";
  const head = `${prefix}${f.field}`;
  return `${head}:${formatValue(f.op, f.value)}`;
}

function formatSearch(f: ExplorerFilter): string {
  if (f.value === "") return "";
  return /\s/.test(f.value) ? `"${f.value}"` : f.value;
}

function formatValue(op: ExplorerFilterOp, value: string): string {
  switch (op) {
    case "exists":
    case "not_exists":
      return "*";
    case "gt":
      return `>${value}`;
    case "gte":
      return `>=${value}`;
    case "lt":
      return `<${value}`;
    case "lte":
      return `<=${value}`;
    case "in":
    case "not_in":
      return `(${value
        .split(",")
        .map((v) => v.trim())
        .join(" OR ")})`;
    default:
      return quoteIfNeeded(value);
  }
}

function quoteIfNeeded(value: string): string {
  return /\s/.test(value) ? `"${value}"` : value;
}

function isNegation(op: ExplorerFilterOp): boolean {
  return op === "neq" || op === "not_in" || op === "not_contains" || op === "not_exists";
}
