/** One generation-level row from POST /v1/ai/explorer/query (OpenTelemetry Gen AI on spans). */
export type LlmGenerationRecord = {
  span_id: string;
  trace_id: string;
  service_name: string;
  operation_name: string;
  start_time: string;
  duration_ms: number;
  status: string;
  status_message?: string;

  ai_system: string;
  ai_request_model: string;
  ai_response_model?: string;
  ai_operation: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  temperature?: string;
  max_tokens?: string;
  finish_reason?: string;
  error_type?: string;

  estimated_cost: number;
};

export interface LlmSummary {
  total_calls: number;
  error_calls: number;
  avg_latency_ms: number;
  p50_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  total_input_tokens: number;
  total_output_tokens: number;
}

export interface LlmFacetBucket {
  value: string;
  count: number;
}

export interface LlmExplorerFacets {
  ai_system: LlmFacetBucket[];
  ai_model: LlmFacetBucket[];
  ai_operation: LlmFacetBucket[];
  service_name: LlmFacetBucket[];
  status: LlmFacetBucket[];
  finish_reason: LlmFacetBucket[];
  prompt_template: LlmFacetBucket[];
}

export interface LlmTrendBucket {
  time_bucket: string;
  total_calls: number;
  error_calls: number;
  avg_latency_ms: number;
  total_tokens: number;
}

export interface LlmExplorerResponse {
  results: LlmGenerationRecord[];
  summary: LlmSummary;
  facets: LlmExplorerFacets;
  trend: LlmTrendBucket[];
  pageInfo: {
    total: number;
    offset: number;
    limit: number;
  };
}

/** One aggregated session from POST /v1/ai/explorer/sessions/query */
export interface LlmSessionRecord {
  session_id: string;
  generation_count: number;
  trace_count: number;
  first_start: string;
  last_start: string;
  total_input_tokens: number;
  total_output_tokens: number;
  error_count: number;
  dominant_model: string;
  dominant_service: string;
}

export interface LlmSessionsResponse {
  results: LlmSessionRecord[];
  pageInfo: {
    total: number;
    offset: number;
    limit: number;
  };
}
