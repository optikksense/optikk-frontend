/**
 * Shared chart data utilities extracted from time-series chart components.
 * Used to normalize API response data for chart rendering.
 */

/** Normalize a timestamp to "YYYY-MM-DD HH:mm" for reliable cross-source matching. */
export function tsKey(ts: string | number | null | undefined): string {
  if (!ts) return "";
  return String(ts).replace("T", " ").replace("Z", "").substring(0, 16);
}

/** Parse timestamp values robustly across API formats. Returns epoch ms. */
export function tsMs(ts: string | number | null | undefined): number {
  if (!ts) return Number.NaN;
  const raw = String(ts).trim();
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(normalized);
  const ms = new Date(hasTimezone ? normalized : `${normalized}Z`).getTime();
  return Number.isNaN(ms) ? Number.NaN : ms;
}

/** Return the first non-empty value from `row[key]` across the given key aliases. */
export function firstValue<T>(row: unknown, keys: string[], fallback: T): T {
  if (!row || typeof row !== "object") return fallback;
  const record = row as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== "") {
      return value as T;
    }
  }
  return fallback;
}
