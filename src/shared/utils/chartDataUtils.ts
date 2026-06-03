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

/**
 * Align a sparse array of backend rows to dense time buckets for chart rendering.
 * Aggregates values falling into the same bucket and zero-fills missing buckets.
 */
export function alignChartData(
  rows: ReadonlyArray<Record<string, unknown>>,
  keys: string[],
  timeBuckets: Array<string | number>
): number[] {
  if (!timeBuckets || timeBuckets.length === 0) return [];

  const stepMs =
    timeBuckets.length >= 2
      ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime()
      : 60_000;

  const totals: Record<string, number> = {};

  for (const row of rows) {
    const ts = firstValue(row, ["timestamp", "time_bucket"], "") as string;
    if (!ts) continue;

    const rowTime = tsMs(ts);
    if (Number.isNaN(rowTime)) continue;

    const alignedMs = Math.floor(rowTime / stepMs) * stepMs;
    const key = tsKey(new Date(alignedMs).toISOString());
    const v = Number(firstValue(row, keys, 0));

    totals[key] = (totals[key] ?? 0) + (Number.isFinite(v) ? v : 0);
  }

  return timeBuckets.map((t) => totals[tsKey(t)] ?? 0);
}
