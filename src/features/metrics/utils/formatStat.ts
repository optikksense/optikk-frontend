/** Compact numeric formatting for KPI / table stat cells. */
export function formatStatValue(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${(value / 1_000).toFixed(1)}k`;
  if (abs >= 100) return value.toFixed(0);
  if (abs >= 1) return value.toFixed(1);
  return value.toFixed(2);
}

/** Signed delta string, e.g. "+12.4" / "−3.0", using a true minus glyph. */
export function formatDelta(delta: number | null): string {
  if (delta == null || Number.isNaN(delta)) return "—";
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  return `${sign}${formatStatValue(Math.abs(delta))}`;
}

/**
 * Delta direction for coloring. For latency-like metrics an increase is "bad"
 * (down/red), a decrease is "good" (up/green); flat is neutral.
 */
export function deltaDirection(delta: number | null): "up" | "down" | "flat" {
  if (delta == null || Number.isNaN(delta) || delta === 0) return "flat";
  return delta > 0 ? "down" : "up";
}
