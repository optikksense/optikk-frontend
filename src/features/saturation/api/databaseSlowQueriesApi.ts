import { z } from "zod";

import { numericValue, stringValue } from "./saturationClient";

const nullableNumber = z.number().nullable();

export const slowQueryPatternSchema = z
  .object({
    queryHash: z.string().regex(/^[0-9a-f]{16}$/),
    queryText: stringValue,
    dbSystem: stringValue,
    collectionName: stringValue,
    namespace: stringValue,
    server: stringValue,
    p50Ms: nullableNumber,
    p95Ms: nullableNumber,
    p99Ms: nullableNumber,
    callCount: numericValue,
    errorCount: numericValue,
  })
  .strict();

export type SlowQueryPatternRow = z.infer<typeof slowQueryPatternSchema>;

export interface DatabaseFilters {
  readonly dbSystem?: string;
  readonly collection?: string;
  readonly server?: string;
  readonly namespace?: string;
}
