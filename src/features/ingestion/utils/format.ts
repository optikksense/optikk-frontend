// Humanize large record counts (B / M / k). The store measures ingestion in
// record counts, not bytes, so the whole page is denominated this way.
export function fmtCount(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return Math.round(n).toLocaleString();
}

// Per-signal colors, reused by the chart, breakdown bars and pillar cards.
export const SIGNAL_COLORS: Record<string, string> = {
  logs: "var(--color-info,#3b82f6)",
  spans: "#6366f1",
  metrics: "var(--color-success,#10b981)",
};

// Cyclic palette for "by service" series and table dots.
export const SERVICE_PALETTE = [
  "var(--color-info,#3b82f6)",
  "#6366f1",
  "var(--color-success,#10b981)",
  "#eab308",
  "var(--color-error,#ef4444)",
  "#f97316",
  "#818cf8",
];
