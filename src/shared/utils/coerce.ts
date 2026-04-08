/**
 * Shared type-coercion helpers for normalizing untyped API responses.
 */

/**
 * Coerce an unknown value to a plain record. Returns `{}` for non-objects.
 */
export function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return {};
  }
  return value as Record<string, unknown>;
}

/**
 * Coerce an unknown value to an array. Returns `[]` for non-arrays.
 */
export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Coerce an unknown value to a finite number. Returns `0` for non-numeric values.
 */
export function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Coerce an unknown value to a string. Returns `''` for non-strings.
 */
export function toStringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}
