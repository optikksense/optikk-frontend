import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import type { DatabaseFilters } from "./databaseSlowQueriesApi";
import { getSaturation, numericValue, rangeParams, stringValue } from "./saturationClient";

const nullableNumber = z.coerce.number().nullable();

const serviceCallsSchema = z
  .object({
    service: stringValue,
    call_count: numericValue,
  })
  .strict();

const queryDetailSummarySchema = z
  .object({
    query_hash: stringValue,
    query_text: stringValue,
    db_system: stringValue,
    collection_name: stringValue,
    operation_name: stringValue,
    call_count: numericValue,
    error_count: numericValue,
    p50_ms: nullableNumber,
    p95_ms: nullableNumber,
    p99_ms: nullableNumber,
    avg_ms: numericValue,
    total_time_ms: numericValue,
    avg_rows: nullableNumber,
    services: z.array(serviceCallsSchema).default([]),
  })
  .strict();

export type QueryDetailSummary = z.infer<typeof queryDetailSummarySchema>;

const queryTimeseriesPointSchema = z
  .object({
    time_bucket: stringValue,
    call_count: numericValue,
    error_count: numericValue,
    avg_ms: nullableNumber,
    p99_ms: nullableNumber,
  })
  .strict();

export type QueryTimeseriesPoint = z.infer<typeof queryTimeseriesPointSchema>;

const queryExecutionSchema = z
  .object({
    timestamp: stringValue,
    trace_id: stringValue,
    span_id: stringValue,
    duration_ms: numericValue,
    is_error: z.boolean().default(false),
    service: stringValue,
    host: stringValue,
    rows: nullableNumber,
  })
  .strict();

export type QueryExecutionRow = z.infer<typeof queryExecutionSchema>;

function withHash(
  hash: string,
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters,
  extra?: Record<string, string | number | undefined>
) {
  return { ...rangeParams(startTime, endTime), hash, ...filters, ...extra };
}

export function getQueryDetailSummary(
  hash: string,
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
): Promise<QueryDetailSummary | null> {
  return getSaturation(
    "/saturation/database/query-detail/summary",
    queryDetailSummarySchema.nullable(),
    withHash(hash, startTime, endTime, filters)
  );
}

export function getQueryDetailTimeseries(
  hash: string,
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
): Promise<QueryTimeseriesPoint[]> {
  return getSaturation(
    "/saturation/database/query-detail/timeseries",
    z.array(queryTimeseriesPointSchema),
    withHash(hash, startTime, endTime, filters)
  );
}

export function getQueryDetailExecutions(
  hash: string,
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters,
  limit = 50
): Promise<QueryExecutionRow[]> {
  return getSaturation(
    "/saturation/database/query-detail/executions",
    z.array(queryExecutionSchema),
    withHash(hash, startTime, endTime, filters, { limit })
  );
}
