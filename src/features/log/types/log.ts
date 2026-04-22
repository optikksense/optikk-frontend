import type {
  AnalyticsRequest,
  AnalyticsResponse,
  ExplorerFacetBucket,
  ExplorerQueryRequest,
  ExplorerQueryWarnings,
  ExplorerSummary,
  ExplorerTrendBucket,
} from "@features/explorer/types";

/**
 * `LogRecord` is the canonical row returned by `POST /api/v1/logs/query`.
 * Backend source: `internal/modules/logs/explorer/models.go` (post-rewrite).
 * Attributes land as typed maps per the `logs_v2` schema; we keep them loose
 * here so the UI can surface them without a hot-coupling ceremony.
 */
export interface LogRecord {
  readonly id: string;
  readonly timestamp: string;
  readonly observed_timestamp?: string;
  readonly service_name: string;
  readonly severity_text?: string;
  readonly severity_bucket: number;
  readonly body: string;
  readonly host?: string;
  readonly pod?: string;
  readonly container?: string;
  readonly environment?: string;
  readonly scope_name?: string;
  readonly scope_version?: string;
  readonly trace_id?: string;
  readonly span_id?: string;
  readonly attributes_string?: Readonly<Record<string, string>>;
  readonly attributes_number?: Readonly<Record<string, number>>;
  readonly attributes_bool?: Readonly<Record<string, boolean>>;
  readonly resource?: Readonly<Record<string, unknown>>;
}

export type LogCursor = string;

export interface LogsQueryResponse {
  readonly results: readonly LogRecord[];
  readonly cursor?: LogCursor;
  readonly facets?: Readonly<Record<string, readonly ExplorerFacetBucket[]>>;
  readonly trend?: readonly ExplorerTrendBucket[];
  readonly summary?: ExplorerSummary;
  readonly warnings?: readonly ExplorerQueryWarnings[];
}

export interface LogsGetByIdResponse {
  readonly log: LogRecord;
}

export type LogsQueryRequest = ExplorerQueryRequest;
export type LogsAnalyticsRequest = AnalyticsRequest;
export type LogsAnalyticsResponse = AnalyticsResponse;
