import { formatRelativeTime } from "@shared/utils/formatters";

// Shared formatters for the Service Detail page. Mirror the prototype's
// `sdNum`, `sdMs`, `sdPct`, `sdDelta` helpers so number rendering matches
// the design pixel-for-pixel.

export function fmtNum(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return Math.round(n).toLocaleString();
}

export function fmtMs(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)}ms`;
}

export function fmtPct(value: number | null | undefined, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function ratioFromCounts(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return (numerator * 100) / denominator;
}

export function relativeTimeFromIso(iso: string | undefined | null): string {
  if (!iso) return "\u2014";
  return formatRelativeTime(iso);
}
