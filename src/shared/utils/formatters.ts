/**
 * Utility functions for formatting data
 */

/**
 * Numeric thresholds used across formatter helpers.
 */
const ONE_THOUSAND = 1000;
const ONE_MINUTE_MS = 60_000;
const ONE_DAY_HOURS = 24;
const THIRTY_DAYS = 30;
const MICROSECONDS_MULTIPLIER = 1000;

const compactFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatNumber(num: number | string | null | undefined): string {
  const value = Number(num);
  if (!Number.isFinite(value)) return "0";
  return compactFormatter.format(value);
}

export function formatDuration(ms: number | string | null | undefined): string {
  let value = Number(ms);
  value = value === 0 ? 0 : value;
  if (!Number.isFinite(value)) return "0ms";
  if (value === 0) return "0ms";
  if (value < 1) {
    return `${(value * MICROSECONDS_MULTIPLIER).toFixed(0)}μs`;
  }
  if (value < ONE_THOUSAND) {
    return `${value.toFixed(0)}ms`;
  }
  if (value < ONE_MINUTE_MS) {
    return `${(value / ONE_THOUSAND).toFixed(2)}s`;
  }
  return `${(value / ONE_MINUTE_MS).toFixed(2)}m`;
}

export function formatTimestamp(timestamp: number | string | Date): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / k ** i;

  const formattedVal =
    i === 0 ? Math.round(val).toString() : Number.parseFloat(val.toFixed(2)).toString();
  return `${formattedVal}${sizes[i] ?? "B"}`;
}

export function normalizePercentage(
  value: number | string | null | undefined,
  clamp = true
): number {
  let raw = Number(value);
  raw = raw === 0 ? 0 : raw;
  if (!Number.isFinite(raw)) return 0;

  const percent = raw >= 0 && raw <= 1 ? raw * 100 : raw;
  if (!clamp) return percent;
  return Math.min(Math.max(percent, 0), 100);
}

export function formatPercentage(
  value: number | string | null | undefined,
  decimals = 2,
  clamp = true
): string {
  const percent = normalizePercentage(value, clamp);
  return `${percent.toFixed(decimals)}%`;
}

export function formatRelativeTime(timestamp: number | string | Date): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "—";
  const now = Date.now();
  const diff = now - date.getTime();

  const seconds = Math.floor(diff / ONE_THOUSAND);
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < ONE_DAY_HOURS) return `${hours}h ago`;

  const days = Math.floor(hours / ONE_DAY_HOURS);
  if (days < THIRTY_DAYS) return `${days}d ago`;

  return formatTimestamp(timestamp);
}
