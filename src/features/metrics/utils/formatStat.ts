import { formatNumber } from "@shared/utils/formatters";

/** Compact numeric formatting for KPI / table stat cells. */
export function formatStatValue(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  return formatNumber(value);
}

export function formatDelta(delta: number | null): string {
  if (delta == null || Number.isNaN(delta)) return "—";
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  return `${sign}${formatStatValue(Math.abs(delta))}`;
}

export function deltaDirection(delta: number | null): "up" | "down" | "flat" {
  if (delta == null || Number.isNaN(delta) || delta === 0) return "flat";
  return delta > 0 ? "down" : "up";
}
