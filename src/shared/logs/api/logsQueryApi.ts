import { z } from "zod";

import { API_CONFIG } from "@config/apiConfig";
import { api } from "@shared/api/http/client";
import { validateResponse } from "@shared/api/utils/validate";
import type { ExplorerFilter } from "@shared/search/types/filters";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

import type { LogRecord, LogsQueryResponse } from "../types/log";
import { buildLogsFilters } from "./buildLogsFilters";

/**
 * Mirrors logs models.Log. Only the `attributes_*` maps are `omitempty` on the
 * Go side; every other field is always present on the wire.
 */
export const rawLogRowSchema = z.object({
  id: z.string(),
  // uint64 `json:",string"` on the Go side — always a JSON string.
  timestamp: z.string(),
  observed_timestamp: z.string(),
  severity_text: z.string(),
  severity_number: z.number(),
  severity_bucket: z.number(),
  body: z.string(),
  trace_id: z.string(),
  span_id: z.string(),
  trace_flags: z.number(),
  service_name: z.string(),
  host: z.string(),
  pod: z.string(),
  container: z.string(),
  environment: z.string(),
  attributes_string: z.record(z.string(), z.string()).optional(),
  attributes_number: z.record(z.string(), z.number()).optional(),
  attributes_bool: z.record(z.string(), z.boolean()).optional(),
  scope_name: z.string(),
  scope_version: z.string(),
});

/** Mirrors logs models.PageInfo; only nextCursor is `omitempty`. */
const pageInfoSchema = z.object({
  hasMore: z.boolean(),
  nextCursor: z.string().optional(),
  limit: z.number(),
});

function tsToNsString(ts: string): string {
  if (ts.includes("T")) {
    const ms = Date.parse(ts);
    if (!Number.isNaN(ms)) return String(BigInt(ms) * 1_000_000n);
  }
  return ts;
}

function base64UrlEncodeUtf8(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/** `id` is always present but may be empty when ClickHouse has no log_id. */
function fallbackLogId(row: z.infer<typeof rawLogRowSchema>): string {
  const payload = `${row.trace_id}:${row.span_id}:${tsToNsString(row.timestamp)}:${
    row.service_name
  }:${fnv1a(row.body)}`;
  return base64UrlEncodeUtf8(payload);
}

function coerceTimestampToIso(ts: string): string {
  if (ts.includes("T")) return ts;
  try {
    const bi = BigInt(ts);
    return new Date(Number(bi / 1_000_000n)).toISOString();
  } catch {
    return ts;
  }
}

export function normalizeLogRecord(row: z.infer<typeof rawLogRowSchema>): LogRecord {
  const id = row.id || fallbackLogId(row);
  return {
    id,
    timestamp: coerceTimestampToIso(row.timestamp),
    observed_timestamp: coerceTimestampToIso(row.observed_timestamp),
    service_name: row.service_name,
    severity_text: row.severity_text,
    severity_bucket: row.severity_bucket,
    body: row.body,
    host: row.host,
    pod: row.pod,
    container: row.container,
    environment: row.environment,
    scope_name: row.scope_name,
    scope_version: row.scope_version,
    trace_id: row.trace_id,
    span_id: row.span_id,
    attributes_string: row.attributes_string,
    attributes_number: row.attributes_number,
    attributes_bool: row.attributes_bool,
  };
}

const queryResponseSchema = z
  .object({
    results: z.array(rawLogRowSchema),
    pageInfo: pageInfoSchema,
  })
  .transform(
    (r): LogsQueryResponse => ({
      results: r.results.map(normalizeLogRecord),
      cursor: r.pageInfo.nextCursor || undefined,
      hasMore: r.pageInfo.hasMore,
    })
  );

export interface QueryLogsArgs {
  readonly startTime: number;
  readonly endTime: number;
  readonly filters: readonly ExplorerFilter[];
  readonly cursor?: string;
  readonly limit?: number;
}

export async function queryLogs(args: QueryLogsArgs): Promise<LogsQueryResponse> {
  const { body } = buildLogsFilters(args.filters, args.startTime, args.endTime, {
    cursor: args.cursor,
    limit: args.limit ?? 100,
  });
  const raw = await api.post<unknown>(`${V1}/logs/query`, body);
  const parsed = validateResponse(queryResponseSchema, raw);
  return dedupeRows(enforceIdFilters(parsed, body));
}

function dedupeRows(resp: LogsQueryResponse): LogsQueryResponse {
  const seen = new Set<string>();
  const out: LogRecord[] = [];
  for (const r of resp.results) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  if (out.length === resp.results.length) return resp;
  return { ...resp, results: out };
}

function enforceIdFilters(
  resp: LogsQueryResponse,
  body: { traceId?: string; spanId?: string }
): LogsQueryResponse {
  const traceFilter = body.traceId;
  const spanFilter = body.spanId;
  if (!traceFilter && !spanFilter) return resp;
  const filtered = resp.results.filter(
    (r) => (!traceFilter || r.trace_id === traceFilter) && (!spanFilter || r.span_id === spanFilter)
  );
  if (filtered.length !== resp.results.length) {
    console.warn(
      `[logs/query] Backend returned ${resp.results.length - filtered.length} row(s) that do not match the active id filter`,
      { traceFilter, spanFilter, returned: resp.results.length, kept: filtered.length }
    );
  }
  return { ...resp, results: filtered };
}
