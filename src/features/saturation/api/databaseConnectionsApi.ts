import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import type { DatabaseFilters } from "./databaseSlowQueriesApi";
import { getSaturation, rangeParams, stringValue } from "./saturationClient";

const nullableNumber = z.coerce.number().nullable();

const connCountPointSchema = z
  .object({
    time_bucket: stringValue,
    pool_name: stringValue,
    state: stringValue,
    count: nullableNumber,
  })
  .strict();

const connUtilPointSchema = z
  .object({
    time_bucket: stringValue,
    pool_name: stringValue,
    util_pct: nullableNumber,
  })
  .strict();

const connLimitsRowSchema = z
  .object({
    pool_name: stringValue,
    max: nullableNumber,
    idle_max: nullableNumber,
    idle_min: nullableNumber,
  })
  .strict();

const pendingPointSchema = z
  .object({
    time_bucket: stringValue,
    pool_name: stringValue,
    count: nullableNumber,
  })
  .strict();

const timeoutPointSchema = z
  .object({
    time_bucket: stringValue,
    pool_name: stringValue,
    timeout_rate: nullableNumber,
  })
  .strict();

const poolLatencyPointSchema = z
  .object({
    time_bucket: stringValue,
    pool_name: stringValue,
    p50_ms: nullableNumber,
    p95_ms: nullableNumber,
    p99_ms: nullableNumber,
  })
  .strict();

export type ConnCountPoint = z.infer<typeof connCountPointSchema>;
export type ConnUtilPoint = z.infer<typeof connUtilPointSchema>;
export type ConnLimitsRow = z.infer<typeof connLimitsRowSchema>;
export type PendingPoint = z.infer<typeof pendingPointSchema>;
export type TimeoutPoint = z.infer<typeof timeoutPointSchema>;
export type PoolLatencyPoint = z.infer<typeof poolLatencyPointSchema>;

function withFilters(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
) {
  return { ...rangeParams(startTime, endTime), ...filters };
}

export function getConnectionCount(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return getSaturation<ConnCountPoint[]>(
    "/saturation/database/connections/count",
    z.array(connCountPointSchema),
    withFilters(s, e, f)
  );
}

export function getConnectionUtilization(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return getSaturation<ConnUtilPoint[]>(
    "/saturation/database/connections/utilization",
    z.array(connUtilPointSchema),
    withFilters(s, e, f)
  );
}

export function getConnectionLimits(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return getSaturation<ConnLimitsRow[]>(
    "/saturation/database/connections/limits",
    z.array(connLimitsRowSchema),
    withFilters(s, e, f)
  );
}

export function getConnectionPending(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return getSaturation<PendingPoint[]>(
    "/saturation/database/connections/pending",
    z.array(pendingPointSchema),
    withFilters(s, e, f)
  );
}

export function getConnectionTimeoutRate(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return getSaturation<TimeoutPoint[]>(
    "/saturation/database/connections/timeout-rate",
    z.array(timeoutPointSchema),
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
