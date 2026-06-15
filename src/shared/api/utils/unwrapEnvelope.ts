/**
 * Unwraps data from standard API envelopes (e.g. { data: T } or { data: T, comparison: T }).
 * Handled gracefully for direct objects/arrays and envelopes.
 */
export function unwrapEnvelope<T>(value: unknown): T {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return value as T;
  }
  const record = value as Record<string, unknown>;
  if ("data" in record) {
    const keys = Object.keys(record);
    // Unwraps { data: T } or { data: T, comparison: T } or similar envelopes.
    // Ensure we do not unwrap records that have more keys besides data and comparison
    if (keys.length <= 2 && (keys.length === 1 || "comparison" in record)) {
      return record.data as T;
    }
  }
  return value as T;
}
