import { z } from "zod";

import type { ExplorerFilter } from "@/features/explorer/types/filters";
import { api } from "@shared/api/api/client";
import { validateResponse } from "@shared/api/utils/validate";

import type { LogRecord, LogsQueryResponse } from "../types/log";
import { buildLogsFilters } from "./buildLogsFilters";

export const rawLogRowSchema = z
  .object({
    id: z.string().optional(),
    log_id: z.string().optional(),
    timestamp: z.union([z.string(), z.number()]),
    observed_timestamp: z.union([z.string(), z.number()]).optional(),
    severity_text: z.string().optional(),
    severity_number: z.coerce.number().optional(),
    severity_bucket: z.coerce.number(),
    body: z.string(),
    trace_id: z.string().optional(),
    span_id: z.string().optional(),
    trace_flags: z.coerce.number().optional(),
    service_name: z.string(),
    host: z.string().optional(),
    pod: z.string().optional(),
    container: z.string().optional(),
    environment: z.string().optional(),
    attributes_string: z.record(z.string(), z.string()).optional(),
    attributes_number: z.record(z.string(), z.number()).optional(),
    attributes_bool: z.record(z.string(), z.boolean()).optional(),
    scope_name: z.string().optional(),
    scope_version: z.string().optional(),
  })
  .strict();

const pageInfoSchema = z
  .object({
    hasMore: z.boolean().optional(),
    nextCursor: z.string().optional(),
    limit: z.coerce.number().optional(),
  })
  .strict()
  .optional();

function tsToNsString(ts: string | number): string {
  if (typeof ts === "number") return String(Math.round(ts));
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

// FNV-1a 32-bit — small, fast, no deps. Used to disambiguate rows that share
// (trace_id, span_id, timestamp) but have different bodies (common for batch-
// flushed Locust / OTel-collector logs that all land at the same millisecond).
function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

function fallbackLogId(row: z.infer<typeof rawLogRowSchema>): string {
  const payload = `${row.trace_id ?? ""}:${row.span_id ?? ""}:${tsToNsString(
    row.timestamp
  )}:${row.service_name ?? ""}:${fnv1a(row.body ?? "")}`;
  return base64UrlEncodeUtf8(payload);
}

function coerceTimestampToIso(ts: string | number): string {
  if (typeof ts === "string") {
    if (ts.includes("T")) return ts;
    try {
      const bi = BigInt(ts);
      return new Date(Number(bi / 1_000_000n)).toISOString();
    } catch {
      return ts;
    }
  }
  return new Date(ts / 1_000_000).toISOString();
}

export function normalizeLogRecord(row: z.infer<typeof rawLogRowSchema>): LogRecord {
  const id = row.id || row.log_id || fallbackLogId(row);
  return {
    id,
    timestamp: coerceTimestampToIso(row.timestamp),
    observed_timestamp:
      row.observed_timestamp != null ? coerceTimestampToIso(row.observed_timestamp) : undefined,
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
  .strict()
  .transform(
    (r): LogsQueryResponse => ({
      results: r.results.map(normalizeLogRecord),
      cursor: r.pageInfo?.nextCursor || undefined,
      hasMore: r.pageInfo?.hasMore ?? false,
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
  const raw = await api.post<unknown>("/v1/logs/query", body);
  const parsed = validateResponse(queryResponseSchema, raw);
  return dedupeRows(enforceIdFilters(parsed, body));
}

/**
 * Defensive dedupe by `id`. The backend list endpoint normally returns unique
 * rows, but pipeline misconfigs (OTel collector double-forwarding,
 * at-least-once ingest retry) can ship the same log twice. Keep the first
 * occurrence so selection / keys stay stable.
 */
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

/**
 * Defensive client-side filter for trace_id / span_id. The BE list endpoint
 * applies these filters, but if any row leaks through (BE regression, CH
 * binding edge case, or stale cache), drop it client-side and emit a warning
 * once per response so we surface the inconsistency rather than render rows
 * the user explicitly excluded.
 */
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
