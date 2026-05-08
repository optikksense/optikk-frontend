import { z } from "zod";

import { integerValue, numericValue, stringValue } from "./saturationClient";

export const datastoreSummarySchema = z
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

export const datastoreCollectionSpotlightSchema = z
  .object({
    collection_name: stringValue,
    p99_ms: numericValue,
    ops_per_sec: numericValue,
  })
  .strict();

export const datastoreOverviewSchema = z
  .object({
    system: stringValue,
    category: stringValue,
    query_count: numericValue,
    error_rate: numericValue,
    avg_latency_ms: numericValue,
    p95_latency_ms: numericValue,
    p99_latency_ms: numericValue,
    active_connections: numericValue,
    cache_hit_rate: numericValue.optional(),
    top_server: stringValue,
    namespace_count: integerValue,
    collection_count: integerValue,
    read_ops_per_sec: numericValue,
    write_ops_per_sec: numericValue,
    top_collections: z.array(datastoreCollectionSpotlightSchema).default([]),
  })
  .strict();

export const datastoreServerRowSchema = z
  .object({
    server: stringValue,
    p50_ms: numericValue,
    p95_ms: numericValue,
    p99_ms: numericValue,
  })
  .strict();

export const datastoreNamespaceRowSchema = z
  .object({
    namespace: stringValue,
    span_count: numericValue,
  })
  .strict();

export const datastoreOperationRowSchema = z
  .object({
    operation: stringValue,
    ops_per_sec: numericValue,
    p50_ms: numericValue,
    p95_ms: numericValue,
    p99_ms: numericValue,
    errors_per_sec: numericValue,
  })
  .strict();

export const datastoreErrorRowSchema = z
  .object({
    error_type: stringValue,
    errors_per_sec: numericValue,
  })
  .strict();

export const datastoreConnectionRowSchema = z
  .object({
    pool_name: stringValue,
    used_connections: numericValue,
    util_pct: numericValue,
    pending_requests: numericValue,
    timeout_rate: numericValue,
    p95_wait_ms: numericValue,
    max_connections: numericValue,
    idle_max: numericValue,
    idle_min: numericValue,
  })
  .strict();

export const slowQueryPatternSchema = z
  .object({
    query_text: stringValue,
    collection_name: stringValue,
    p50_ms: numericValue,
    p95_ms: numericValue,
    p99_ms: numericValue,
    call_count: numericValue,
    error_count: numericValue,
  })
  .strict();

export type DatastoreSummary = z.infer<typeof datastoreSummarySchema>;
export type DatastoreSystemRow = z.infer<typeof datastoreSystemRowSchema>;
export type DatastoreCollectionSpotlight = z.infer<typeof datastoreCollectionSpotlightSchema>;
export type DatastoreOverview = z.infer<typeof datastoreOverviewSchema>;
export type DatastoreServerRow = z.infer<typeof datastoreServerRowSchema>;
export type DatastoreNamespaceRow = z.infer<typeof datastoreNamespaceRowSchema>;
export type DatastoreOperationRow = z.infer<typeof datastoreOperationRowSchema>;
export type DatastoreErrorRow = z.infer<typeof datastoreErrorRowSchema>;
export type DatastoreConnectionRow = z.infer<typeof datastoreConnectionRowSchema>;
export type SlowQueryPattern = z.infer<typeof slowQueryPatternSchema>;
