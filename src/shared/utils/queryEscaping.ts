/**
 * Escape a value for use in the backend query-parser syntax.
 *
 * - Empty / whitespace-only strings become `""`.
 * - Values containing whitespace, quotes, parens, or colons are wrapped in
 *   escaped double-quotes.
 * - All other values are returned as-is (trimmed).
 */
export function escapeQueryValue(value: string): string {
  const v = value.trim();
  if (v === "") return '""';
  if (/[\s"():]/.test(v)) {
    return `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return v;
}
