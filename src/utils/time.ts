import { parseTimestampMs } from '@utils/logUtils';

const EMPTY_LABEL = '—';

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Formats a timestamp into "YYYY-MM-DD HH:mm:ss".
 * @param value Timestamp-like value.
 */
export function tsLabel(value: unknown): string {
  const ms = parseTimestampMs(value);
  if (!ms) return EMPTY_LABEL;

  const date = new Date(ms);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(
    date.getHours(),
  )}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

/**
 * Formats a timestamp into relative time (e.g. "5m ago").
 * @param value Timestamp-like value.
 */
export function relativeTime(value: unknown): string {
  const ms = parseTimestampMs(value);
  if (!ms) return '';

  const diffMs = Date.now() - ms;
  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

