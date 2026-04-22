import type { ColumnConfig } from "../types/results";

export const DEFAULT_LOG_COLUMNS: readonly ColumnConfig[] = [
  { key: "timestamp", visible: true, width: 170 },
  { key: "severity", visible: true, width: 84 },
  { key: "service", visible: true, width: 160 },
  { key: "body", visible: true },
  { key: "host", visible: false, width: 140 },
  { key: "environment", visible: false, width: 120 },
];

export const DEFAULT_TRACE_COLUMNS: readonly ColumnConfig[] = [
  { key: "start", visible: true, width: 170 },
  { key: "duration", visible: true, width: 120 },
  { key: "service", visible: true, width: 160 },
  { key: "operation", visible: true },
  { key: "status", visible: true, width: 84 },
  { key: "http", visible: true, width: 140 },
];
