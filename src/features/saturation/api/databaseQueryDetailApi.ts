import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import type { DatabaseFilters } from "./databaseSlowQueriesApi";
import { getSaturation, numericValue, rangeParams, stringValue } from "./saturationClient";

const nullableNumber = z.number().nullable();

const serviceCallsSchema = z.object({
  service: stringValue,
  callCount: numericValue,
});

const queryDetailSummarySchema = z.object({
  queryHash: stringValue,
  queryText: stringValue,
  dbSystem: stringValue,
  collectionName: stringValue,
  operationName: stringValue,
  callCount: numericValue,
  errorCount: numericValue,
  p50Ms: nullableNumber,
  p95Ms: nullableNumber,
  p99Ms: nullableNumber,
  avgMs: numericValue,
  totalTimeMs: numericValue,
  avgRows: nullableNumber,
                                                        
  services: z.array(serviceCallsSchema),
});

export type QueryDetailSummary = z.infer<typeof queryDetailSummarySchema>;

const queryTimeseriesPointSchema = z.object({
  timeBucket: stringValue,
  callCount: numericValue,
  errorCount: numericValue,
  avgMs: nullableNumber,
  p99Ms: nullableNumber,
});

export type QueryTimeseriesPoint = z.infer<typeof queryTimeseriesPointSchema>;

const queryExecutionSchema = z.object({
  timestamp: stringValue,
  traceId: stringValue,
  spanId: stringValue,
  durationMs: numericValue,
  isError: z.boolean(),
  service: stringValue,
  host: stringValue,
  rows: nullableNumber,
});

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
