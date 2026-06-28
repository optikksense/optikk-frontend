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

export type SlowQueryPatternRow = z.infer<typeof slowQueryPatternSchema>;

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
