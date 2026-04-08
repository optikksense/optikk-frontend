/**
 * Shared utility functions for log data processing.
 * Reusable across LogsPage, LogRow, LogsRawView, and future pages.
 */

interface LogLike {
  id?: string | number | bigint | null;
  timestamp?: string | number | Date;
  trace_id?: string;
  span_id?: string;
  service_name?: string;
  [key: string]: unknown;
}

interface PageLike {
  logs?: unknown[];
  has_more?: boolean;
  next_cursor?: unknown;
  total?: unknown;
  total_count?: unknown;
  [key: string]: unknown;
}

type CursorValue = string | number | bigint;

function asPageLike(value: unknown): PageLike | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  // The backend returns multiple pagination schemas; normalize to a broad object map.
  return value as PageLike;
}

function asLogLike(value: unknown): LogLike {
  if (typeof value !== "object" || value === null) {
    return {};
  }
  // Logs are heterogeneous maps from multiple ingest pipelines.
  return value as LogLike;
}

/**
 * Returns a normalized logs array from a backend page shape.
 * @param page
 */
export function getLogsFromPage(page: unknown): unknown[] {
  const pageLike = asPageLike(page);
  if (!pageLike) return [];
  if (Array.isArray(pageLike.logs)) return pageLike.logs;
  return [];
}

/**
 * Resolves whether more log pages are expected from mixed backend pagination schemas.
 * @param page
 * @param allPages
 * @param pageSize
 */
export function getHasMoreFromPage(page: unknown, allPages: unknown[], pageSize: number): boolean {
  const pageLike = asPageLike(page);
  const explicitFlags = [pageLike?.has_more];

  const explicitFlag = explicitFlags.find((value) => typeof value === "boolean");
  if (typeof explicitFlag === "boolean") return explicitFlag;

  const pageLogs = getLogsFromPage(page);
  const totalCandidates = [pageLike?.total, pageLike?.total_count];

  for (const candidate of totalCandidates) {
    const total = Number(candidate);
    if (Number.isFinite(total) && total >= 0) {
      const loadedCount = (allPages || []).reduce((acc: number, currentPage: unknown) => {
        return acc + getLogsFromPage(currentPage).length;
      }, 0);
      return loadedCount < total;
    }
  }

  return pageLogs.length >= Number(pageSize || 0);
}

/**
 * Resolves the next pagination cursor from a page response.
 * @param page
 */
export function getNextCursorFromPage(page: unknown): CursorValue | undefined {
  const pageLike = asPageLike(page);
  const pageLogs = getLogsFromPage(page);
  const candidates = [pageLike?.next_cursor];

  for (const candidate of candidates) {
    if (candidate != null && candidate !== "" && candidate !== 0 && candidate !== "0") {
      if (
        typeof candidate === "string" ||
        typeof candidate === "number" ||
        typeof candidate === "bigint"
      ) {
        return candidate;
      }
    }
  }

  const tailLog = asLogLike(pageLogs[pageLogs.length - 1]);
  const tailId = tailLog.id;
  if (tailId != null && tailId !== 0 && tailId !== "0") {
    return tailId;
  }

  return undefined;
}

/**
 * Parses an unknown timestamp value to epoch milliseconds.
 * @param value
 */
export function parseTimestampMs(value: unknown): number {
  if (value == null || value === "") return 0;

  if (typeof value === "number" && Number.isFinite(value)) {
    if (value > 1e18) return Math.floor(value / 1e6); // ns -> ms
    if (value > 1e15) return Math.floor(value / 1e3); // us -> ms
    return Math.floor(value); // already ms
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return 0;

    if (/^-?\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      if (Number.isFinite(n)) {
        if (n > 1e18) return Math.floor(n / 1e6);
        if (n > 1e15) return Math.floor(n / 1e3);
        return Math.floor(n);
      }
    }

    let parsed = Date.parse(trimmed);
    if (!Number.isFinite(parsed)) {
      parsed = Date.parse(trimmed.replace(" ", "T"));
    }
    if (Number.isFinite(parsed)) return parsed;

    const m = trimmed.match(
      /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z)?$/
    );
    if (m) {
      const [, y, mo, d, h, mi, s, frac = "", z] = m;
      const ms = Number(`${frac}000`.slice(0, 3));
      if (z === "Z") {
        return Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s), ms);
      }
      return new Date(
        Number(y),
        Number(mo) - 1,
        Number(d),
        Number(h),
        Number(mi),
        Number(s),
        ms
      ).getTime();
    }
  }

  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : 0;
  }

  return 0;
}

/**
 * Returns timestamp in milliseconds from a log record.
 * @param log
 */
export function getTimestampMs(log: unknown): number {
  const logLike = asLogLike(log);
  return parseTimestampMs(logLike.timestamp);
}

/**
 * Normalizes an id-like value into BigInt when possible.
 * @param id
 */
export function toBigIntId(id: unknown): bigint | null {
  if (id == null || id === "") return null;
  if (typeof id === "bigint") return id;
  if (typeof id === "number" && Number.isFinite(id)) return BigInt(Math.trunc(id));
  if (typeof id === "string" && /^-?\d+$/.test(id)) {
    try {
      return BigInt(id);
    } catch (_error: unknown) {
      return null;
    }
  }
  return null;
}

/**
 * Sort comparator for descending log ids.
 * @param aId
 * @param bId
 */
export function compareIdsDesc(aId: unknown, bId: unknown): number {
  const aBig = toBigIntId(aId);
  const bBig = toBigIntId(bId);

  if (aBig != null && bBig != null) {
    if (aBig === bBig) return 0;
    return aBig > bBig ? -1 : 1;
  }

  const aStr = String(aId ?? "");
  const bStr = String(bId ?? "");
  if (aStr === bStr) return 0;
  return bStr.localeCompare(aStr);
}

/**
 * Reads a display value from a log row using legacy and normalized key aliases.
 * @param log
 * @param key
 */
export function getLogValue(log: unknown, key: string): unknown {
  const logLike = asLogLike(log);
  if (key === "service_name" || key === "service") {
    return logLike.service_name || logLike.service || "";
  }
  if (key === "trace_id") {
    return logLike.trace_id || "";
  }
  if (key === "span_id") {
    return logLike.span_id || "";
  }
  if (key === "message") {
    return logLike.message || logLike.body || "";
  }
  if (key === "level") {
    return logLike.level || logLike.severity_text || "";
  }
  return logLike[key] ?? "";
}

/**
 * Builds a stable React row key for log rows.
 * @param log
 */
export function rowKey(log: unknown): string {
  const logLike = asLogLike(log);
  const traceId = logLike.trace_id || "";
  const spanId = logLike.span_id || "";
  const timestamp = String(logLike.timestamp ?? "");

  return `${traceId}-${spanId}-${timestamp}`;
}

/**
 * Reads a total-count value from the first paginated backend response.
 * @param pages
 */
export function extractServerTotal(pages: unknown): number {
  const pageList = Array.isArray(pages) ? pages : [];
  const firstPage = asPageLike(pageList[0]);

  return Number(firstPage?.total ?? firstPage?.total_count ?? 0);
}

/** Maps supported volume step labels to their millisecond duration. */
export const STEP_MS_BY_LABEL: Record<string, number> = {
  "1m": 60_000,
  "2m": 120_000,
  "5m": 300_000,
  "10m": 600_000,
  "15m": 900_000,
  "30m": 1_800_000,
  "1h": 3_600_000,
  "2h": 7_200_000,
  "6h": 21_600_000,
  "12h": 43_200_000,
};

/** Formats a UTC timestamp to the bucket key shape returned by logs volume APIs. */
export function formatUtcBucketKey(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, "0");
  const dateLabel = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  const timeLabel = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:00`;
  return `${dateLabel} ${timeLabel}`;
}

/** Fills missing volume buckets across the exact queried time bounds. */
export function fillVolumeBucketGaps<T extends Record<string, unknown>>(
  rawBuckets: T[],
  step: string,
  startMs: number,
  endMs: number
): T[] {
  if (!rawBuckets.length || !step) return rawBuckets;

  const stepMs = STEP_MS_BY_LABEL[step] || 60_000;

  const byKey: Record<string, T> = {};
  for (const bucket of rawBuckets) {
    const key = String(bucket.timeBucket || bucket.time_bucket || "");
    if (key) {
      byKey[key] = bucket;
    }
  }

  const result: T[] = [];
  const slotStart = Math.floor(startMs / stepMs) * stepMs;
  const slotEnd = Math.floor(endMs / stepMs) * stepMs;
  for (let timestamp = slotStart; timestamp <= slotEnd; timestamp += stepMs) {
    const key = formatUtcBucketKey(new Date(timestamp));
    result.push(
      byKey[key] ||
        ({
          timeBucket: key,
          total: 0,
          errors: 0,
          warnings: 0,
          infos: 0,
          debugs: 0,
          fatals: 0,
        } as unknown as T)
    );
  }

  return result;
}
