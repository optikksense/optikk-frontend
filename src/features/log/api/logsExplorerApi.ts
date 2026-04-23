import { z } from "zod";

import type { ExplorerQueryWarnings, ExplorerTrendBucket } from "@features/explorer/types/queries";
import { api } from "@shared/api/api/client";
import { validateResponse } from "@shared/api/utils/validate";

import type {
  LogRecord,
  LogsAnalyticsRequest,
  LogsAnalyticsResponse,
  LogsGetByIdResponse,
  LogsQueryRequest,
  LogsQueryResponse,
} from "../types/log";

/**
 * Thin client for the logs explorer endpoints. All responses are Zod-validated
 * so contract drift surfaces as a console warning (see `validateResponse`),
 * and the UI never silently renders a stale shape.
 *
 * Endpoints (backend: `internal/modules/logs/explorer/handler.go`):
 *   POST /api/v1/logs/query
 *   POST /api/v1/logs/analytics
 *   GET  /api/v1/logs/:id
 */

const warningSchema = z.object({ code: z.string(), message: z.string() });

const facetBucketSchema = z.object({ value: z.string(), count: z.coerce.number() });

/** Go's encoding/json emits JSON null for nil slices; the explorer returns that for empty facet groups. */
const facetBucketsArraySchema = z
  .union([z.array(facetBucketSchema), z.null()])
  .transform((v) => v ?? []);

/** Backend trend rows are long-form (one row per time_bucket × severity_bucket). */
const rawTrendRowSchema = z.object({
  time_bucket: z.string(),
  severity_bucket: z.coerce.number(),
  count: z.coerce.number(),
});

const summarySchema = z.object({
  total: z.coerce.number(),
  errors: z.coerce.number(),
  warns: z.coerce.number().optional(),
});

const rawLogRowSchema = z.object({
  id: z.string().optional(),
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
});

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
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fallbackLogId(row: z.infer<typeof rawLogRowSchema>): string {
  const payload = `${row.trace_id ?? ""}:${row.span_id ?? ""}:${tsToNsString(row.timestamp)}`;
  return base64UrlEncodeUtf8(payload);
}

function coerceTimestampToIso(ts: string | number): string {
  if (typeof ts === "string") {
    if (ts.includes("T")) return ts;
    try {
      const bi = BigInt(ts);
      const ms = Number(bi / 1_000_000n);
      return new Date(ms).toISOString();
    } catch {
      return ts;
    }
  }
  const ms = ts / 1_000_000;
  return new Date(ms).toISOString();
}

function normalizeLogRecord(row: z.infer<typeof rawLogRowSchema>): LogRecord {
  return {
    id: row.id != null && row.id !== "" ? row.id : fallbackLogId(row),
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

function aggregateTrendRows(
  rows: readonly z.infer<typeof rawTrendRowSchema>[]
): readonly ExplorerTrendBucket[] {
  const map = new Map<string, { total: number; errors: number; warnings: number }>();
  for (const r of rows) {
    let v = map.get(r.time_bucket);
    if (!v) {
      v = { total: 0, errors: 0, warnings: 0 };
      map.set(r.time_bucket, v);
    }
    v.total += r.count;
    if (r.severity_bucket >= 4) v.errors += r.count;
    if (r.severity_bucket === 3) v.warnings += r.count;
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([time_bucket, agg]) => ({
      time_bucket,
      total: agg.total,
      errors: agg.errors,
      warnings: agg.warnings,
    }));
}

function normalizeWarnings(
  raw: readonly (string | z.infer<typeof warningSchema>)[] | undefined
): readonly ExplorerQueryWarnings[] | undefined {
  if (!raw?.length) return undefined;
  return raw.map((item) => (typeof item === "string" ? { code: "query", message: item } : item));
}

function extractNextCursor(pageInfo: unknown): string | undefined {
  if (pageInfo && typeof pageInfo === "object" && "nextCursor" in pageInfo) {
    const c = (pageInfo as { nextCursor?: string }).nextCursor;
    return c && c !== "" ? c : undefined;
  }
  return undefined;
}

const queryResponseSchema = z
  .object({
    results: z.array(rawLogRowSchema),
    pageInfo: z.unknown().optional(),
    facets: z.record(z.string(), facetBucketsArraySchema).optional(),
    trend: z.array(rawTrendRowSchema).optional(),
    summary: summarySchema.optional(),
    warnings: z.array(z.union([z.string(), warningSchema])).optional(),
  })
  .transform((r) => {
    const out: LogsQueryResponse = {
      results: r.results.map(normalizeLogRecord),
      cursor: extractNextCursor(r.pageInfo),
      facets: r.facets,
      trend: r.trend?.length ? aggregateTrendRows(r.trend) : undefined,
      summary: r.summary ? { total: r.summary.total, errors: r.summary.errors } : undefined,
      warnings: normalizeWarnings(r.warnings),
    };
    return out;
  });

const analyticsResponseSchema = z.object({
  columns: z.array(z.object({ name: z.string(), type: z.enum(["string", "number", "time"]) })),
  rows: z.array(z.array(z.union([z.string(), z.number()]))),
  warnings: z.array(z.union([z.string(), warningSchema])).optional(),
});

/** GET /v1/logs/:id returns the same `Log` object as list rows (envelope `data`), not `{ log: ... }`. */
const getByIdSchema = rawLogRowSchema.transform((row) => ({ log: normalizeLogRecord(row) }));

export async function queryLogs(body: LogsQueryRequest): Promise<LogsQueryResponse> {
  const raw = await api.post<unknown>("/v1/logs/query", body);
  if (import.meta.env.DEV) {
    const st = body.startTime;
    const en = body.endTime;
    if (st > 0 && en > st && en < 1e12) {
      console.warn(
        "[queryLogs] startTime/endTime look like seconds, not ms — list queries may return no rows.",
        { startTime: st, endTime: en }
      );
    }
  }
  try {
    return validateResponse(queryResponseSchema, raw);
  } catch (err) {
    if (import.meta.env.DEV) {
      let snippet: string;
      try {
        snippet = JSON.stringify(raw).slice(0, 800);
      } catch {
        snippet = String(raw).slice(0, 800);
      }
      console.warn("[queryLogs] validateResponse failed — check API contract vs Zod schema.", {
        snippet,
        error: err,
      });
    }
    throw err;
  }
}

export async function analyticsLogs(body: LogsAnalyticsRequest): Promise<LogsAnalyticsResponse> {
  const raw = await api.post<unknown>("/v1/logs/analytics", body);
  const parsed = validateResponse(analyticsResponseSchema, raw);
  return {
    ...parsed,
    warnings: normalizeWarnings(parsed.warnings),
  } as LogsAnalyticsResponse;
}

export async function getLogById(id: string): Promise<LogsGetByIdResponse> {
  const raw = await api.get<unknown>(`/v1/logs/${encodeURIComponent(id)}`);
  return validateResponse(getByIdSchema, raw);
}

export type { LogRecord };
