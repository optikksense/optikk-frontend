import type { ColumnConfig } from "@features/explorer/types";

/**
 * Default visible columns for the logs explorer list mode. Matches the
 * Datadog-classic column set: time • service • severity • host • body.
 * Additional fields live in `ALL_LOG_COLUMNS` and are added via the
 * column picker (`ResultsColumnPicker` from the explorer foundation).
 */
export const DEFAULT_LOG_COLUMNS: readonly ColumnConfig[] = [
  { key: "timestamp", visible: true, width: 180 },
  { key: "service", visible: true, width: 160 },
  { key: "severity", visible: true, width: 84 },
  { key: "host", visible: true, width: 160 },
  { key: "body", visible: true },
];

export interface LogColumnMeta {
  readonly key: string;
  readonly label: string;
  readonly width?: number;
  /** `true` means the column has no fixed width and absorbs remaining space. */
  readonly flex?: boolean;
}

export const ALL_LOG_COLUMNS: readonly LogColumnMeta[] = [
  { key: "timestamp", label: "Time", width: 180 },
  { key: "service", label: "Service", width: 160 },
  { key: "severity", label: "Severity", width: 84 },
  { key: "severity_bucket", label: "Severity #", width: 90 },
  { key: "host", label: "Host", width: 160 },
  { key: "pod", label: "Pod", width: 160 },
  { key: "container", label: "Container", width: 140 },
  { key: "environment", label: "Env", width: 120 },
  { key: "body", label: "Message", flex: true },
  { key: "trace_id", label: "Trace ID", width: 200 },
  { key: "span_id", label: "Span ID", width: 160 },
  { key: "observed_timestamp", label: "Observed", width: 180 },
  { key: "scope_name", label: "Scope", width: 160 },
  { key: "scope_version", label: "Scope v", width: 100 },
];

/** Stable key lookup for the column renderer. */
export const LOG_COLUMN_META: Readonly<Record<string, LogColumnMeta>> = Object.fromEntries(
  ALL_LOG_COLUMNS.map((meta) => [meta.key, meta])
);
