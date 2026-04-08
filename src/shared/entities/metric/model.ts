import { z } from "zod";

export const metricDataSchema = z
  .object({
    timestamp: z.string(),
    value: z.number(),
  })
  .strict();

export type MetricData = z.infer<typeof metricDataSchema>;
