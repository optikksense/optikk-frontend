import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import { opsSeriesSchema, readWriteSeriesSchema } from "./databaseSeriesSchemas";
import type { OpsSeriesPoint, ReadWriteSeriesPoint } from "./databaseSeriesSchemas";
import type { DatabaseFilters } from "./databaseSlowQueriesApi";
import { getSaturation, rangeParams } from "./saturationClient";

function withFilters(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
) {
  return { ...rangeParams(startTime, endTime), ...filters };
}

function fetchOps(
  path: string,
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
): Promise<OpsSeriesPoint[]> {
  return getSaturation(path, z.array(opsSeriesSchema), withFilters(startTime, endTime, filters));
}

export function getOpsBySystem(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return fetchOps("/saturation/database/ops/by-system", s, e, f);
}
export function getOpsByOperation(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return fetchOps("/saturation/database/ops/by-operation", s, e, f);
}
export function getOpsByCollection(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return fetchOps("/saturation/database/ops/by-collection", s, e, f);
}
export function getOpsByNamespace(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return fetchOps("/saturation/database/ops/by-namespace", s, e, f);
}
export function getOpsReadVsWrite(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
): Promise<ReadWriteSeriesPoint[]> {
  return getSaturation(
    "/saturation/database/ops/read-vs-write",
    z.array(readWriteSeriesSchema),
    withFilters(startTime, endTime, filters)
  );
}
