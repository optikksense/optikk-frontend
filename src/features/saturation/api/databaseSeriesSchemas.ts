import { z } from "zod";

import { numericValue, stringValue } from "./saturationClient";

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

export const errorSeriesSchema = z
  .object({
    time_bucket: stringValue,
    group_by: stringValue,
    errors_per_sec: nullableNumber,
  })
  .strict();

export const errorRatioSchema = z
  .object({
    time_bucket: stringValue,
    error_ratio_pct: nullableNumber,
  })
  .strict();

export const readWriteSeriesSchema = z
  .object({
    time_bucket: stringValue,
    read_ops_per_sec: nullableNumber,
    write_ops_per_sec: nullableNumber,
  })
  .strict();

export const latencyHeatmapBucketSchema = z
  .object({
    time_bucket: stringValue,
    bucket_label: stringValue,
    count: numericValue,
    density: numericValue,
  })
  .strict();

export type LatencySeriesPoint = z.infer<typeof latencySeriesSchema>;
export type OpsSeriesPoint = z.infer<typeof opsSeriesSchema>;
export type ErrorSeriesPoint = z.infer<typeof errorSeriesSchema>;
export type ErrorRatioPoint = z.infer<typeof errorRatioSchema>;
export type ReadWriteSeriesPoint = z.infer<typeof readWriteSeriesSchema>;
export type LatencyHeatmapBucket = z.infer<typeof latencyHeatmapBucketSchema>;
