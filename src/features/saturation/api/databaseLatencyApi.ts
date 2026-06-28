import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import { latencySeriesSchema } from "./databaseSeriesSchemas";
import type { LatencySeriesPoint } from "./databaseSeriesSchemas";
import type { DatabaseFilters } from "./databaseSlowQueriesApi";
import { getSaturation, rangeParams } from "./saturationClient";

function withFilters(startTime: RequestTime, endTime: RequestTime, filters?: DatabaseFilters) {
  return { ...rangeParams(startTime, endTime), ...filters };
}

function fetchSeries(
  path: string,
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
): Promise<LatencySeriesPoint[]> {
  return getSaturation(
    path,
    z.array(latencySeriesSchema),
    withFilters(startTime, endTime, filters)
  );
}

export function getLatencyBySystem(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
) {
  return fetchSeries("/saturation/database/latency/by-system", startTime, endTime, filters);
}
