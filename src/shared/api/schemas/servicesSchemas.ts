import { z } from 'zod';

export const serviceSummarySchema = z.object({
  service_name: z.string().default(''),
  request_count: z.number().default(0),
  error_count: z.number().default(0),
  error_rate: z.number().default(0),
  avg_latency: z.number().default(0),
  p50_latency: z.number().default(0),
  p95_latency: z.number().default(0),
  p99_latency: z.number().default(0),
}).strict();

export type ServiceSummary = z.infer<typeof serviceSummarySchema>;
