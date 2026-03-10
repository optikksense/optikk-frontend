import { z } from 'zod';

/**
 * Zod schema for a log entry as returned by the backend.
 * The API uses OTLP field names (severityText, body, serviceName) rather than
 * the legacy frontend aliases (level, message, service). All name variants are
 * accepted here; normalizeLog() in logsApi.ts unifies them before use.
 */
export const logEntrySchema = z.object({
  id: z.string().brand<'LogId'>(),
  // Timestamp arrives as a nanosecond integer or an ISO string
  timestamp: z.union([z.string(), z.number()]),
  // OTLP / API field names
  severityText: z.string().optional(),
  body: z.string().optional(),
  serviceName: z.string().optional(),
  // Legacy / normalized aliases (may already be present in some responses)
  level: z.string().optional(),
  message: z.string().optional(),
  service: z.string().optional(),
  service_name: z.string().optional(),
}).passthrough();

export type LogEntry = z.infer<typeof logEntrySchema>;
