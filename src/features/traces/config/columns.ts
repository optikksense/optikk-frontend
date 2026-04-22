import type { ColumnConfig } from "@/features/explorer/types";

/**
 * Default visible columns for the traces list.
 * (start time, duration bar, service, operation, status, http method.)
 */
export const DEFAULT_TRACE_COLUMNS: readonly ColumnConfig[] = [
  { key: "start", visible: true, width: 170 },
  { key: "duration", visible: true, width: 140 },
  { key: "service", visible: true, width: 160 },
  { key: "operation", visible: true },
  { key: "status", visible: true, width: 96 },
  { key: "http_method", visible: true, width: 80 },
];

/**
 * Full column catalog — surfaced by the ColumnPicker so users can toggle
 * extra fields on/off. Order here defines the picker order.
 */
export const ALL_TRACE_COLUMNS: readonly {
  readonly key: string;
  readonly label: string;
  readonly width?: number;
}[] = [
  { key: "start", label: "Start time", width: 170 },
  { key: "duration", label: "Duration", width: 140 },
  { key: "service", label: "Service", width: 160 },
  { key: "operation", label: "Operation" },
  { key: "endpoint", label: "Endpoint", width: 200 },
  { key: "status", label: "Status", width: 96 },
  { key: "http_method", label: "HTTP method", width: 80 },
  { key: "root_http_status", label: "HTTP status", width: 96 },
  { key: "span_count", label: "Span count", width: 96 },
  { key: "has_error", label: "Error?", width: 80 },
  { key: "environment", label: "Environment", width: 120 },
];
