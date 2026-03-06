import { APP_COLORS } from '@config/colorLiterals';
/**
 * Utility functions for formatting data
 */

/**
 * Numeric thresholds used across formatter helpers.
 */
const ONE_THOUSAND = 1000;
const ONE_MILLION = 1_000_000;
const ONE_BILLION = 1_000_000_000;
const ONE_MINUTE_MS = 60_000;
const ONE_DAY_HOURS = 24;
const THIRTY_DAYS = 30;
const MICROSECONDS_MULTIPLIER = 1000;

/**
 * Format large numbers with K, M, B suffixes
 * @param num
 */
export function formatNumber(num: number | string | null | undefined): string {
  let value = Number(num);
  value = value === 0 ? 0 : value;
  if (!Number.isFinite(value)) return '0';
  if (value >= ONE_BILLION) {
    return `${(value / ONE_BILLION).toFixed(1)}B`;
  }
  if (value >= ONE_MILLION) {
    return `${(value / ONE_MILLION).toFixed(1)}M`;
  }
  if (value >= ONE_THOUSAND) {
    return `${(value / ONE_THOUSAND).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Format duration in milliseconds to human-readable format
 * @param ms
 */
export function formatDuration(ms: number | string | null | undefined): string {
  let value = Number(ms);
  value = value === 0 ? 0 : value;
  if (!Number.isFinite(value)) return '0ms';
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

/**
 * Format timestamp to readable date/time
 * @param timestamp
 */
export function formatTimestamp(timestamp: number | string | Date): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

/**
 * Format bytes to human-readable format
 * @param bytes
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i] ?? 'B'}`;
}

/**
 * Format percentage
 * @param value
 * @param clamp
 */
export function normalizePercentage(
  value: number | string | null | undefined,
  clamp = true,
): number {
  let raw = Number(value);
  raw = raw === 0 ? 0 : raw;
  if (!Number.isFinite(raw)) return 0;

  // Accept both fraction form (0.72) and percentage form (72).
  const percent = raw >= 0 && raw <= 1 ? raw * 100 : raw;
  if (!clamp) return percent;
  return Math.min(Math.max(percent, 0), 100);
}

/**
 *
 * @param value
 * @param decimals
 * @param clamp
 */
export function formatPercentage(
  value: number | string | null | undefined,
  decimals = 2,
  clamp = true,
): string {
  const percent = normalizePercentage(value, clamp);
  return `${percent.toFixed(decimals)}%`;
}

/**
 * Format a timestamp as relative time (e.g. "3m ago", "2h ago")
 * @param timestamp
 */
export function formatRelativeTime(timestamp: number | string | Date): string {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();

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

/**
 * Get the color for a service health status.
 * @param status
 */
export function getHealthColor(status: string): string {
  const colors: Record<string, string> = {
    healthy: APP_COLORS.hex_73c991,
    degraded: APP_COLORS.hex_f79009,
    unhealthy: APP_COLORS.hex_f04438,
    unknown: APP_COLORS.hex_98a2b3,
  };
  return colors[status] ?? colors.unknown;
}

/**
 * Truncate text to maxLength, appending ellipsis if truncated.
 * @param text
 * @param maxLength
 */
export function truncateText(text: string, maxLength = 100): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Get error rate color based on threshold.
 * @param rate
 */
export function getErrorRateColor(rate: number): string {
  if (rate > 5) return APP_COLORS.hex_f04438;
  if (rate > 1) return APP_COLORS.hex_f79009;
  return APP_COLORS.hex_73c991;
}
