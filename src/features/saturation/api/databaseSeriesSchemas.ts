import { z } from "zod";

import { stringValue } from "./saturationClient";

const nullableNumber = z.coerce.number().nullable();

export const latencySeriesSchema = z
  .object({
    time_bucket: stringValue,
    group_by: stringValue,
    p50_ms: nullableNumber,
    p95_ms: nullableNumber,
    p99_ms: nullableNumber,
  })
  .strict();

export const opsSeriesSchema = z
  .object({
    time_bucket: stringValue,
    group_by: stringValue,
    ops_per_sec: nullableNumber,
  })
  .strict();

export type LatencySeriesPoint = z.infer<typeof latencySeriesSchema>;
export type OpsSeriesPoint = z.infer<typeof opsSeriesSchema>;
