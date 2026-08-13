/** Shared monitor wizard constants — single source of truth for eval/renotify windows. */

export const EVAL_WINDOWS = [60, 300, 900, 3600] as const;

export const RENOTIFY_WINDOWS = [900, 1800, 3600, 7200, 0] as const;

export const DEFAULT_MUTE_SECONDS = 3600;

/**
 * Format a duration in seconds to a human-readable label.
 *   60 → "1m", 3600 → "1h", 0 → "never"
 */
export function formatWindowLabel(sec: number): string {
  if (sec === 0) return "never";
  return sec >= 3600 ? `${sec / 3600}h` : `${sec / 60}m`;
}
