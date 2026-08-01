import { z } from "zod";

import { stringValue } from "./saturationClient";

const nullableNumber = z.number().nullable();

export const latencySeriesSchema = z.object({
  timeBucketMs: z.number(),
  groupBy: stringValue,
  p50Ms: nullableNumber,
  p95Ms: nullableNumber,
  p99Ms: nullableNumber,
});

export type LatencySeriesPoint = z.infer<typeof latencySeriesSchema>;
