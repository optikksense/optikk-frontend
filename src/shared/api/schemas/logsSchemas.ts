import { z } from "zod";

import { logEntrySchema } from "@entities/log/model";

export const logRecordSchema = logEntrySchema;

export const logVolumeBucketSchema = z
  .object({
    time_bucket: z.string(),
    total: z.number().default(0),
    errors: z.number().default(0),
    warnings: z.number().default(0),
    infos: z.number().default(0),
    debugs: z.number().default(0),
    fatals: z.number().default(0),
  })
  .strict();

export const logVolumeSchema = z
  .object({
    step: z.string(),
    buckets: z.array(logVolumeBucketSchema).default([]),
  })
  .strict();

export type LogRecord = z.infer<typeof logRecordSchema>;
export type LogVolume = z.infer<typeof logVolumeSchema>;
