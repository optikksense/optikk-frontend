import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import { getSaturation, numericValue, rangeParams, stringValue } from "./saturationClient";

const nullableNumber = z.coerce.number().nullable();

const slowQueryPatternSchema = z
  .object({
    query_text: stringValue,
    collection_name: stringValue,
    p50_ms: nullableNumber,
    p95_ms: nullableNumber,
    p99_ms: nullableNumber,
    call_count: numericValue,
    error_count: numericValue,
  })
  .strict();

const slowCollectionRowSchema = z
  .object({
    collection_name: stringValue,
    p99_ms: nullableNumber,
    ops_per_sec: nullableNumber,
    error_rate: nullableNumber,
  })
  .strict();

const slowRatePointSchema = z
  .object({
    time_bucket: stringValue,
    slow_per_sec: nullableNumber,
  })
  .strict();

const p99ByQueryTextSchema = z
  .object({
    query_text: stringValue,
    p99_ms: nullableNumber,
    sample_count: numericValue,
  })
  .passthrough();

export type SlowQueryPatternRow = z.infer<typeof slowQueryPatternSchema>;
export type SlowCollectionRow = z.infer<typeof slowCollectionRowSchema>;
export type SlowRatePoint = z.infer<typeof slowRatePointSchema>;
export type P99ByQueryTextRow = z.infer<typeof p99ByQueryTextSchema>;

export interface DatabaseFilters {
  readonly db_system?: string;
  readonly collection?: string;
  readonly server?: string;
  readonly namespace?: string;
}

function withFilters(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters,
  extra?: Record<string, string | number | undefined>
) {
  return { ...rangeParams(startTime, endTime), ...filters, ...extra };
}

export function getSlowQueryPatterns(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters,
  limit = 20
): Promise<SlowQueryPatternRow[]> {
  return getSaturation(
    "/saturation/database/slow-queries/patterns",
    z.array(slowQueryPatternSchema),
    withFilters(startTime, endTime, filters, { limit })
  );
}

export function getSlowQueryCollections(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters,
  limit = 20
): Promise<SlowCollectionRow[]> {
  return getSaturation(
    "/saturation/database/slow-queries/collections",
    z.array(slowCollectionRowSchema),
    withFilters(startTime, endTime, filters, { limit })
  );
}

export function getSlowQueryRate(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters,
  threshold_ms = 1000
): Promise<SlowRatePoint[]> {
  return getSaturation(
    "/saturation/database/slow-queries/rate",
    z.array(slowRatePointSchema),
    withFilters(startTime, endTime, filters, { threshold_ms })
  );
}

export function getP99ByQueryText(
  startTime: RequestTime,
  endTime: RequestTime,
  filters?: DatabaseFilters,
  limit = 50
): Promise<P99ByQueryTextRow[]> {
  return getSaturation(
    "/saturation/database/slow-queries/p99-by-text",
    z.array(p99ByQueryTextSchema),
    withFilters(startTime, endTime, filters, { limit })
  );
}
