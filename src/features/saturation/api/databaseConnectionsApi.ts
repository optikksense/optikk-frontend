import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import type { DatabaseFilters } from "./databaseSlowQueriesApi";
import { getSaturation, rangeParams, stringValue } from "./saturationClient";

const nullableNumber = z.coerce.number().nullable();

// Mirrors the Go `connections` module models (pointer floats => nullable numbers).

export const connectionCountPointSchema = z
  .object({
    time_bucket: stringValue,
    pool_name: stringValue,
    state: stringValue,
    count: nullableNumber,
  })
  .strict();

export const connectionUtilPointSchema = z
  .object({
    time_bucket: stringValue,
    pool_name: stringValue,
    util_pct: nullableNumber,
  })
  .strict();

export const connectionLimitsSchema = z
  .object({
    pool_name: stringValue,
    max: nullableNumber,
    idle_max: nullableNumber,
    idle_min: nullableNumber,
  })
  .strict();

export const pendingRequestsPointSchema = z
  .object({
    time_bucket: stringValue,
    pool_name: stringValue,
    count: nullableNumber,
  })
  .strict();

export const connectionTimeoutPointSchema = z
  .object({
    time_bucket: stringValue,
    pool_name: stringValue,
    timeout_rate: nullableNumber,
  })
  .strict();

export const poolLatencyPointSchema = z
  .object({
    time_bucket: stringValue,
    pool_name: stringValue,
    p50_ms: nullableNumber,
    p95_ms: nullableNumber,
    p99_ms: nullableNumber,
  })
  .strict();

export type ConnectionCountPoint = z.infer<typeof connectionCountPointSchema>;
export type ConnectionUtilPoint = z.infer<typeof connectionUtilPointSchema>;
export type ConnectionLimits = z.infer<typeof connectionLimitsSchema>;
export type PendingRequestsPoint = z.infer<typeof pendingRequestsPointSchema>;
export type ConnectionTimeoutPoint = z.infer<typeof connectionTimeoutPointSchema>;
export type PoolLatencyPoint = z.infer<typeof poolLatencyPointSchema>;

function withFilters(startTime: RequestTime, endTime: RequestTime, filters?: DatabaseFilters) {
  return { ...rangeParams(startTime, endTime), ...filters };
}

export function getConnectionCount(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return getSaturation<ConnectionCountPoint[]>(
    "/saturation/database/connections/count",
    z.array(connectionCountPointSchema),
    withFilters(s, e, f)
  );
}

export function getConnectionUtilization(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return getSaturation<ConnectionUtilPoint[]>(
    "/saturation/database/connections/utilization",
    z.array(connectionUtilPointSchema),
    withFilters(s, e, f)
  );
}

export function getConnectionLimits(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return getSaturation<ConnectionLimits[]>(
    "/saturation/database/connections/limits",
    z.array(connectionLimitsSchema),
    withFilters(s, e, f)
  );
}

export function getPendingRequests(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return getSaturation<PendingRequestsPoint[]>(
    "/saturation/database/connections/pending",
    z.array(pendingRequestsPointSchema),
    withFilters(s, e, f)
  );
}

export function getConnectionTimeoutRate(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return getSaturation<ConnectionTimeoutPoint[]>(
    "/saturation/database/connections/timeout-rate",
    z.array(connectionTimeoutPointSchema),
    withFilters(s, e, f)
  );
}

export function getConnectionWaitTime(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return getSaturation<PoolLatencyPoint[]>(
    "/saturation/database/connections/wait-time",
    z.array(poolLatencyPointSchema),
    withFilters(s, e, f)
  );
}

export function getConnectionCreateTime(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return getSaturation<PoolLatencyPoint[]>(
    "/saturation/database/connections/create-time",
    z.array(poolLatencyPointSchema),
    withFilters(s, e, f)
  );
}

export function getConnectionUseTime(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return getSaturation<PoolLatencyPoint[]>(
    "/saturation/database/connections/use-time",
    z.array(poolLatencyPointSchema),
    withFilters(s, e, f)
  );
}
