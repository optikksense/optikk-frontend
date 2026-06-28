import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import { opsSeriesSchema } from "./databaseSeriesSchemas";
import type { OpsSeriesPoint } from "./databaseSeriesSchemas";
import type { DatabaseFilters } from "./databaseSlowQueriesApi";
import { getSaturation, rangeParams } from "./saturationClient";

function withFilters(startTime: RequestTime, endTime: RequestTime, filters?: DatabaseFilters) {
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
