import { z } from 'zod';

/**
 * Zod schema for a log entry as returned by the backend.
 * The backend/frontend contract is snake_case at the API boundary.
 */
export const logEntrySchema = z.object({
  id: z.string().brand<'LogId'>(),
  // Timestamp arrives as a nanosecond integer or an ISO string
  timestamp: z.union([z.string(), z.number()]),
  severity_text: z.string().optional(),
  severity_number: z.number().optional(),
  observed_timestamp: z.union([z.string(), z.number()]).optional(),
  trace_id: z.string().optional(),
  span_id: z.string().optional(),
  trace_flags: z.number().optional(),
  service_name: z.string().optional(),
  scope_name: z.string().optional(),
  scope_version: z.string().optional(),
  attributes_string: z.record(z.string(), z.string()).optional(),
  attributes_number: z.record(z.string(), z.number()).optional(),
  attributes_bool: z.record(z.string(), z.boolean()).optional(),
  body: z.string().optional(),
  host: z.string().optional(),
  pod: z.string().optional(),
  container: z.string().optional(),
  environment: z.string().optional(),
  // Normalized frontend aliases
  level: z.string().optional(),
  message: z.string().optional(),
  service: z.string().optional(),
}).strict();

export type LogEntry = z.infer<typeof logEntrySchema>;
