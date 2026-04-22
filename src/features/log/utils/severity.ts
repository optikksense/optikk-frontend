/**
 * Severity bucket ↔ label ↔ color mapping.
 *
 * Buckets mirror the backend's `severity_bucket UInt8` column (0..5) per
 * the logs_v2 schema (`db/clickhouse/31_logs_v2.sql`). Keep the tuples
 * ordered so callers can iterate legends deterministically.
 */

export type SeverityBucket = 0 | 1 | 2 | 3 | 4 | 5;

export interface SeverityStyle {
  readonly bucket: SeverityBucket;
  readonly label: string;
  readonly shortLabel: string;
  readonly color: string;
}

const STYLES: readonly SeverityStyle[] = [
  { bucket: 0, label: "Trace", shortLabel: "TRC", color: "#7e8ea0" },
  { bucket: 1, label: "Debug", shortLabel: "DBG", color: "#4e9fdd" },
  { bucket: 2, label: "Info", shortLabel: "INF", color: "#73bf69" },
  { bucket: 3, label: "Warn", shortLabel: "WRN", color: "#e0b400" },
  { bucket: 4, label: "Error", shortLabel: "ERR", color: "#e8494d" },
  { bucket: 5, label: "Fatal", shortLabel: "FTL", color: "#c00021" },
];

export const SEVERITY_STYLES: readonly SeverityStyle[] = STYLES;

export function severityStyle(bucket: number | undefined | null): SeverityStyle {
  if (bucket == null) return STYLES[2];
  const clamped = Math.max(0, Math.min(5, Math.trunc(bucket))) as SeverityBucket;
  return STYLES[clamped];
}

export function severityLabel(bucket: number | undefined | null): string {
  return severityStyle(bucket).label;
}

export function severityColor(bucket: number | undefined | null): string {
  return severityStyle(bucket).color;
}

export function severityFromText(text: string | undefined | null): SeverityBucket {
  const upper = (text ?? "").toUpperCase();
  if (upper.startsWith("FATAL")) return 5;
  if (upper.startsWith("ERROR") || upper === "ERR") return 4;
  if (upper.startsWith("WARN")) return 3;
  if (upper.startsWith("INFO")) return 2;
  if (upper.startsWith("DEBUG")) return 1;
  if (upper.startsWith("TRACE")) return 0;
  return 2;
}
