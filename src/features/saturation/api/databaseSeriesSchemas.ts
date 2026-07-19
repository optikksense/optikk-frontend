import { z } from "zod";

import { stringValue } from "./saturationClient";

const nullableNumber = z.number().nullable();

export const latencySeriesSchema = z.object({
  timeBucket: stringValue,
  groupBy: stringValue,
  p50Ms: nullableNumber,
  p95Ms: nullableNumber,
  p99Ms: nullableNumber,
});

export const opsSeriesSchema = z.object({
  timeBucket: stringValue,
  groupBy: stringValue,
  opsPerSec: nullableNumber,
});

export type LatencySeriesPoint = z.infer<typeof latencySeriesSchema>;
export type OpsSeriesPoint = z.infer<typeof opsSeriesSchema>;
