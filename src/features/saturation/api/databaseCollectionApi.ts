import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import {
  errorSeriesSchema,
  latencySeriesSchema,
  opsSeriesSchema,
  readWriteSeriesSchema,
} from "./databaseSeriesSchemas";
import type {
  ErrorSeriesPoint,
  LatencySeriesPoint,
  OpsSeriesPoint,
  ReadWriteSeriesPoint,
} from "./databaseSeriesSchemas";
import type { DatabaseFilters } from "./databaseSlowQueriesApi";
import { getSaturation, numericValue, rangeParams, stringValue } from "./saturationClient";

const collectionTopQuerySchema = z
  .object({
    query_text: stringValue,
    p99_ms: z.coerce.number().nullable(),
    call_count: numericValue,
    error_count: numericValue,
  })
  .strict();

export type CollectionTopQuery = z.infer<typeof collectionTopQuerySchema>;

function withCollection(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
) {
  return { ...rangeParams(startTime, endTime), ...filters };
}

export function getCollectionLatency(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
): Promise<LatencySeriesPoint[]> {
  return getSaturation(
    "/saturation/database/collection/latency",
    z.array(latencySeriesSchema),
    withCollection(startTime, endTime, filters)
  );
}

export function getCollectionOps(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
): Promise<OpsSeriesPoint[]> {
  return getSaturation(
    "/saturation/database/collection/ops",
    z.array(opsSeriesSchema),
    withCollection(startTime, endTime, filters)
  );
}

export function getCollectionErrors(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
): Promise<ErrorSeriesPoint[]> {
  return getSaturation(
    "/saturation/database/collection/errors",
    z.array(errorSeriesSchema),
    withCollection(startTime, endTime, filters)
  );
}

export function getCollectionQueryTexts(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters,
  limit = 20
): Promise<CollectionTopQuery[]> {
  return getSaturation(
    "/saturation/database/collection/query-texts",
    z.array(collectionTopQuerySchema),
    { ...withCollection(startTime, endTime, filters), limit }
  );
}

export function getCollectionReadVsWrite(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
): Promise<ReadWriteSeriesPoint[]> {
  return getSaturation(
    "/saturation/database/collection/read-vs-write",
    z.array(readWriteSeriesSchema),
    withCollection(startTime, endTime, filters)
  );
}
