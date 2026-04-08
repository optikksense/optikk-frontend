import type { QueryParamValue, QueryParams } from "@shared/api/service-types";

import type { StructuredFilter } from "@shared/hooks/useURLFilters";

/**
 *
 */
export type DomainRecord = Record<string, unknown>;

/**
 *
 */
export interface LogRecord extends DomainRecord {
  timestamp: string | number; // nanosecond int from OTLP or ISO string
  // Normalized fields (set by logsApi.normalizeLog)
  level?: string;
  message?: string;
  service?: string;
  // Raw OTLP / API field names
  severityText?: string;
  body?: string;
  service_name?: string;
  serviceName?: string;
  host?: string;
  pod?: string;
  container?: string;
  logger?: string;
  thread?: string;
  traceId?: string;
  trace_id?: string;
  spanId?: string;
  span_id?: string;
}

/**
 *
 */
export interface LogFacet extends DomainRecord {
  value: string;
  count: number;
}

/**
 *
 */
export interface LogVolumeBucket extends DomainRecord {
  time_bucket: string;
  total?: number;
  errors?: number;
  warnings?: number;
  infos?: number;
  debugs?: number;
  fatals?: number;
}

export interface LogAggregateRow extends DomainRecord {
  time_bucket: string;
  group_value: string;
  count: number;
  error_rate?: number;
}

export interface LogAttributeFilter {
  key: string;
  value: string;
  op: "eq" | "neq" | "contains" | "regex";
}

/**
 *
 */
export interface LogFilterOperator {
  key: string;
  label: string;
  symbol: string;
}

/**
 *
 */
export interface LogFilterField {
  key: string;
  label: string;
  icon: string;
  group: string;
  operators: LogFilterOperator[];
}

/**
 *
 */
export type LogStructuredFilter = StructuredFilter;

/**
 *
 */
export interface LogsBackendParams {
  [K: string]: QueryParamValue | LogAttributeFilter[] | undefined;
  limit?: number;
  offset?: number;
  search?: string;
  searchMode?: string;
  severities?: string[];
  excludeSeverities?: string[];
  services?: string[];
  excludeServices?: string[];
  hosts?: string[];
  excludeHosts?: string[];
  pods?: string[];
  containers?: string[];
  environments?: string[];
  loggers?: string[];
  traceId?: string;
  spanId?: string;
  attributeFilters?: LogAttributeFilter[];
}

/**
 *
 */
export interface LogsListResponse {
  logs: LogRecord[];
  total: number;
}

/**
 *
 */
export interface LogsStatsResponse {
  total: number;
  fields: {
    level: LogFacet[];
    service_name: LogFacet[];
  };
}

/**
 *
 */
export interface LogsVolumeResponse {
  step: string;
  buckets: LogVolumeBucket[];
}
