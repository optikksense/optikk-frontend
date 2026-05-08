import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import { errorRatioSchema, errorSeriesSchema } from "./databaseSeriesSchemas";
import type { ErrorRatioPoint, ErrorSeriesPoint } from "./databaseSeriesSchemas";
import type { DatabaseFilters } from "./databaseSlowQueriesApi";
import { getSaturation, rangeParams } from "./saturationClient";

function withFilters(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
) {
  return { ...rangeParams(startTime, endTime), ...filters };
}

function fetchErrorSeries(
  path: string,
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
): Promise<ErrorSeriesPoint[]> {
  return getSaturation(path, z.array(errorSeriesSchema), withFilters(startTime, endTime, filters));
}

export function getDbErrorsBySystem(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return fetchErrorSeries("/saturation/database/errors/by-system", s, e, f);
}
export function getDbErrorsByOperation(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return fetchErrorSeries("/saturation/database/errors/by-operation", s, e, f);
}
export function getDbErrorsByErrorType(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return fetchErrorSeries("/saturation/database/errors/by-error-type", s, e, f);
}
export function getDbErrorsByCollection(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return fetchErrorSeries("/saturation/database/errors/by-collection", s, e, f);
}
export function getDbErrorsByStatus(s: RequestTime, e: RequestTime, f?: DatabaseFilters) {
  return fetchErrorSeries("/saturation/database/errors/by-status", s, e, f);
}
export function getDbErrorRatio(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
): Promise<ErrorRatioPoint[]> {
  return getSaturation(
    "/saturation/database/errors/ratio",
    z.array(errorRatioSchema),
    withFilters(startTime, endTime, filters)
  );
}
