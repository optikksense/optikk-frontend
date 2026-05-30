import type { SimpleTableColumn } from "@shared/components/primitives/ui";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import type {
  DatastoreConnectionRow,
  DatastoreErrorRow,
  DatastoreNamespaceRow,
  DatastoreOperationRow,
  DatastoreServerRow,
  SlowQueryPattern,
} from "../../api/saturationApi";

export const SERVER_COLUMNS: SimpleTableColumn<DatastoreServerRow>[] = [
  {
    title: "Server",
    key: "server",
    width: 280,
    render: (_value, row) => (
      <span className="font-medium text-foreground">{row.server}</span>
    ),
  },
  {
    title: "p50",
    key: "p50_ms",
    align: "right",
    width: 100,
    render: (_value, row) => formatDuration(row.p50_ms),
  },
  {
    title: "p95",
    key: "p95_ms",
    align: "right",
    width: 100,
    render: (_value, row) => formatDuration(row.p95_ms),
  },
  {
    title: "p99",
    key: "p99_ms",
    align: "right",
    width: 100,
    render: (_value, row) => formatDuration(row.p99_ms),
  },
];

export const NAMESPACE_COLUMNS: SimpleTableColumn<DatastoreNamespaceRow>[] = [
  {
    title: "Namespace",
    key: "namespace",
    width: 280,
    render: (_value, row) => (
      <span className="font-medium text-foreground">{row.namespace || "—"}</span>
    ),
  },
  {
    title: "Spans",
    key: "span_count",
    align: "right",
    width: 120,
    render: (_value, row) => formatNumber(row.span_count),
  },
];

export const OPERATION_COLUMNS: SimpleTableColumn<DatastoreOperationRow>[] = [
  {
    title: "Operation",
    key: "operation",
    width: 240,
    render: (_value, row) => (
      <span className="font-medium text-foreground">{row.operation || "unknown"}</span>
    ),
  },
  {
    title: "Ops/s",
    key: "ops_per_sec",
    align: "right",
    width: 110,
    render: (_value, row) => formatNumber(row.ops_per_sec),
  },
  {
    title: "p95",
    key: "p95_ms",
    align: "right",
    width: 110,
    render: (_value, row) => formatDuration(row.p95_ms),
  },
  {
    title: "Err/s",
    key: "errors_per_sec",
    align: "right",
    width: 110,
    render: (_value, row) => formatNumber(row.errors_per_sec),
  },
];

export const ERROR_COLUMNS: SimpleTableColumn<DatastoreErrorRow>[] = [
  {
    title: "Error Type",
    key: "error_type",
    width: 300,
    render: (_value, row) => (
      <span className="font-medium text-foreground">{row.error_type || "unknown"}</span>
    ),
  },
  {
    title: "Err/s",
    key: "errors_per_sec",
    align: "right",
    width: 110,
    render: (_value, row) => formatNumber(row.errors_per_sec),
  },
];

export const CONNECTION_COLUMNS: SimpleTableColumn<DatastoreConnectionRow>[] = [
  {
    title: "Pool",
    key: "pool_name",
    width: 220,
    render: (_value, row) => (
      <span className="font-medium text-foreground">{row.pool_name || "default"}</span>
    ),
  },
  {
    title: "Used",
    key: "used_connections",
    align: "right",
    width: 90,
    render: (_value, row) => formatNumber(row.used_connections),
  },
  {
    title: "Util %",
    key: "util_pct",
    align: "right",
    width: 90,
    render: (_value, row) => formatPercentage(row.util_pct),
  },
  {
    title: "Pending",
    key: "pending_requests",
    align: "right",
    width: 90,
    render: (_value, row) => formatNumber(row.pending_requests),
  },
  {
    title: "Timeout/s",
    key: "timeout_rate",
    align: "right",
    width: 110,
    render: (_value, row) => formatNumber(row.timeout_rate),
  },
  {
    title: "Wait p95",
    key: "p95_wait_ms",
    align: "right",
    width: 100,
    render: (_value, row) => formatDuration(row.p95_wait_ms),
  },
];

export const SLOW_QUERY_COLUMNS: SimpleTableColumn<SlowQueryPattern>[] = [
  {
    title: "Query / Command",
    key: "query_text",
    width: 520,
    render: (_value, row) => (
      <div className="flex flex-col gap-1">
        <span className="line-clamp-2 font-medium text-foreground">
          {row.query_text || "No query text"}
        </span>
        <span className="text-[11px] text-foreground-muted">
          {row.collection_name ? `Collection ${row.collection_name}` : "Command-level telemetry"}
        </span>
      </div>
    ),
  },
  {
    title: "p95",
    key: "p95_ms",
    align: "right",
    width: 110,
    render: (_value, row) => formatDuration(row.p95_ms),
  },
  {
    title: "Calls",
    key: "call_count",
    align: "right",
    width: 110,
    render: (_value, row) => formatNumber(row.call_count),
  },
  {
    title: "Errors",
    key: "error_count",
    align: "right",
    width: 110,
    render: (_value, row) => formatNumber(row.error_count),
  },
];
