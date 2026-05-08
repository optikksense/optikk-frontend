/**
 * `LogRecord` is the canonical row returned by `POST /api/v1/logs/query`.
 * Backend source: `internal/modules/logs/shared/models/models.go`. Attributes
 * land as typed maps per the ClickHouse logs schema; the UI keeps them loose
 * so it can surface them without hot-coupling ceremony.
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

/**
 * `POST /api/v1/logs/query` is list-only — `summary`/`trend`/`facets` come from
 * their own peer endpoints (see logsAnalyticsApi.ts) and are fanned in
 * parallel from the page hook.
 */
export interface LogsQueryResponse {
  readonly results: readonly LogRecord[];
  readonly cursor?: LogCursor;
  readonly hasMore: boolean;
}

export interface LogsGetByIdResponse {
  readonly log: LogRecord;
}
