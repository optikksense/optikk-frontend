import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import {
  latencyHeatmapBucketSchema,
  latencySeriesSchema,
} from "./databaseSeriesSchemas";
import type {
  LatencyHeatmapBucket,
  LatencySeriesPoint,
} from "./databaseSeriesSchemas";
import type { DatabaseFilters } from "./databaseSlowQueriesApi";
import { getSaturation, rangeParams } from "./saturationClient";

function withFilters(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
) {
  return { ...rangeParams(startTime, endTime), ...filters };
}

function fetchSeries(
  path: string,
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
): Promise<LatencySeriesPoint[]> {
  return getSaturation(path, z.array(latencySeriesSchema), withFilters(startTime, endTime, filters));
}

export function getLatencyBySystem(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
) {
  return fetchSeries("/saturation/database/latency/by-system", startTime, endTime, filters);
}

export function getLatencyByOperation(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
) {
  return fetchSeries("/saturation/database/latency/by-operation", startTime, endTime, filters);
}

export function getLatencyByCollection(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
) {
  return fetchSeries("/saturation/database/latency/by-collection", startTime, endTime, filters);
}

export function getLatencyByNamespace(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
) {
  return fetchSeries("/saturation/database/latency/by-namespace", startTime, endTime, filters);
}

export function getLatencyByServer(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
) {
  return fetchSeries("/saturation/database/latency/by-server", startTime, endTime, filters);
}

export function getLatencyHeatmap(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters
): Promise<LatencyHeatmapBucket[]> {
  return getSaturation(
    "/saturation/database/latency/heatmap",
    z.array(latencyHeatmapBucketSchema),
    withFilters(startTime, endTime, filters)
  );
}
