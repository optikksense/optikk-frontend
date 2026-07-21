import {
  formatDuration,
  formatNumber,
  formatPercentage,
  formatRelativeTime,
} from "@shared/utils/formatters";

// Shared formatters for the Service Detail page. Wraps standard formatters
// so number rendering matches design specifications consistently.

export function fmtNum(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return formatNumber(n);
}

export function fmtMs(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return "—";
  return formatDuration(ms);
}

export function fmtPct(value: number | null | undefined, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return formatPercentage(value, digits, false);
}

export function ratioFromCounts(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return (numerator * 100) / denominator;
}

export function relativeTimeFromIso(iso: string | undefined | null): string {
  if (!iso) return "—";
  return formatRelativeTime(iso);
}
