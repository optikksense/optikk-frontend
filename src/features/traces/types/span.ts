import type { ExplorerFilter } from "@/features/explorer/types";

export interface SpanRow {
  readonly span_id: string;
  readonly trace_id: string;
  readonly parent_span_id?: string;
  readonly service_name: string;
  readonly operation: string;
  readonly kind?: string;
  readonly duration_ms: number;
  readonly timestamp_ns: number;
  readonly has_error: boolean;
  readonly status?: string;
  readonly http_method?: string;
  readonly response_status_code?: string;
  readonly environment?: string;
}

export interface SpansQueryRequest {
  readonly startTime: number;
  readonly endTime: number;
  readonly filters: readonly ExplorerFilter[];
  readonly limit?: number;
  readonly cursor?: string;
}

export interface SpansQueryResponse {
  readonly spans: readonly SpanRow[];
  readonly nextCursor?: string;
  readonly warnings?: ReadonlyArray<{ code: string; message: string }>;
}
