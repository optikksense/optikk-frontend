/**
 *
 */
export type DomainRecord = Record<string, unknown>;

/**
 *
 */
export interface ServiceTimeSeriesPoint extends DomainRecord {
  timestamp: string;
  service_name: string;
  operation_name: string;
  http_method: string;
  request_count: number;
  error_count: number;
  avg_latency: number;
  p50: number;
  p95: number;
  p99: number;
}

/**
 *
 */
export interface ServiceEndpointRow extends DomainRecord {
  service_name: string;
  operation_name: string;
  http_method: string;
  request_count: number;
  error_count: number;
  avg_latency: number;
  p95_latency: number;
  p99_latency: number;
}

/**
 *
 */
export interface ServiceErrorGroupRow extends DomainRecord {
  service_name: string;
  operation_name: string;
  status_message: string;
  http_status_code: number;
  error_count: number;
  last_occurrence: string;
  first_occurrence: string;
  sample_trace_id: string;
}

/**
 *
 */
export interface ServiceLogRow extends DomainRecord {
  timestamp: string;
  level: string;
  message: string;
  trace_id: string;
  span_id: string;
}

/**
 *
 */
export interface ServiceDependency extends DomainRecord {
  source: string;
  target: string;
  call_count: number;
}
