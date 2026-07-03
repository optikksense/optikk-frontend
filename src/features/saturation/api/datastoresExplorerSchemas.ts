import { z } from "zod";

import { integerValue, numericValue, stringValue } from "./saturationClient";

const datastoreSummarySchema = z
  .object({
    total_systems: integerValue,
    database_systems: integerValue,
    redis_systems: integerValue,
    query_count: numericValue,
    p95_latency_ms: numericValue,
    error_rate: numericValue,
    active_connections: numericValue,
  })
  .strict();

export const datastoreSystemRowSchema = z
  .object({
    system: stringValue,
    category: stringValue,
    query_count: numericValue,
    avg_latency_ms: numericValue,
    p95_latency_ms: numericValue,
    error_rate: numericValue,
    active_connections: numericValue,
    server_hint: stringValue,
    last_seen: stringValue,
  })
  .strict();
export type DatastoreSummary = z.infer<typeof datastoreSummarySchema>;
export type DatastoreSystemRow = z.infer<typeof datastoreSystemRowSchema>;
