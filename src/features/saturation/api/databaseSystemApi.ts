import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import {
  errorSeriesSchema,
  latencySeriesSchema,
  opsSeriesSchema,
} from "./databaseSeriesSchemas";
import type {
  ErrorSeriesPoint,
  LatencySeriesPoint,
  OpsSeriesPoint,
} from "./databaseSeriesSchemas";
import type { DatabaseFilters } from "./databaseSlowQueriesApi";
import { getSaturation, numericValue, rangeParams, stringValue } from "./saturationClient";

const systemCollectionRowSchema = z
  .object({
    collection_name: stringValue,
    p99_ms: z.coerce.number().nullable(),
    ops_per_sec: z.coerce.number().nullable(),
  })
  .strict();

const systemNamespaceSchema = z
  .object({
    namespace: stringValue,
    span_count: numericValue,
  })
  .strict();

export type SystemCollectionRow = z.infer<typeof systemCollectionRowSchema>;
export type SystemNamespace = z.infer<typeof systemNamespaceSchema>;

function withSystem(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
) {
  return { ...rangeParams(startTime, endTime), ...filters };
}

export function getSystemLatency(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return getSaturation<LatencySeriesPoint[]>(
    "/saturation/database/system/latency",
    z.array(latencySeriesSchema),
    withSystem(s, e, f)
  );
}

export function getSystemOps(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return getSaturation<OpsSeriesPoint[]>(
    "/saturation/database/system/ops",
    z.array(opsSeriesSchema),
    withSystem(s, e, f)
  );
}

export function getSystemErrors(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return getSaturation<ErrorSeriesPoint[]>(
    "/saturation/database/system/errors",
    z.array(errorSeriesSchema),
    withSystem(s, e, f)
  );
}

export function getSystemTopCollectionsByLatency(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters,
  limit = 10
) {
  return getSaturation<SystemCollectionRow[]>(
    "/saturation/database/system/top-collections-by-latency",
    z.array(systemCollectionRowSchema),
    { ...withSystem(startTime, endTime, filters), limit }
  );
}

export function getSystemTopCollectionsByVolume(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters,
  limit = 10
) {
  return getSaturation<SystemCollectionRow[]>(
    "/saturation/database/system/top-collections-by-volume",
    z.array(systemCollectionRowSchema),
    { ...withSystem(startTime, endTime, filters), limit }
  );
}

export function getSystemNamespaces(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters,
  limit = 50
) {
  return getSaturation<SystemNamespace[]>(
    "/saturation/database/system/namespaces",
    z.array(systemNamespaceSchema),
    { ...withSystem(startTime, endTime, filters), limit }
  );
}
