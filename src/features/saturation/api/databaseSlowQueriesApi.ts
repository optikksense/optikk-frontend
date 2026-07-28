import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import { getSaturation, numericValue, rangeParams, stringValue } from "./saturationClient";

const nullableNumber = z.number().nullable();
const scopedString = stringValue.optional().default("");

export const slowQueryPatternSchema = z.object({
                                                                  
  queryHash: scopedString,
  queryText: stringValue,
  dbSystem: scopedString,
  collectionName: stringValue,
  namespace: scopedString,
  server: scopedString,
  p50Ms: nullableNumber,
  p95Ms: nullableNumber,
  p99Ms: nullableNumber,
  callCount: numericValue,
  errorCount: numericValue,
});

export type SlowQueryPatternRow = z.infer<typeof slowQueryPatternSchema>;

export interface DatabaseFilters {
  readonly dbSystem?: string;
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
