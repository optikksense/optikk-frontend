import { API_CONFIG } from "@config/apiConfig";
import { z } from "zod";

import type { AnalyticsColumn, AnalyticsRequest, AnalyticsResponse } from "@/features/explorer/types";

import api from "@shared/api/api/client";
import { validateResponse } from "@shared/api/utils/validate";

import type { TraceSummary, TracesQueryRequest, TracesQueryResponse } from "../types/trace";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const warningSchema = z.object({ code: z.string(), message: z.string() }).strict();

function normalizeWarnings(
  raw: readonly (string | z.infer<typeof warningSchema>)[] | undefined
): TracesQueryResponse["warnings"] {
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

/** Backend `explorer.Trace` / traces_index row (`internal/modules/traces/explorer/models.go`). */
const rawTraceRowSchema = z.object({
  trace_id: z.string(),
  start_ms: z.coerce.number(),
  end_ms: z.coerce.number(),
  duration_ms: z.coerce.number(),
  root_service: z.string(),
  root_operation: z.string(),
  root_status: z.string().optional(),
  root_http_method: z.string().optional(),
  root_http_status: z.union([z.string(), z.number()]).optional(),
  span_count: z.coerce.number(),
  has_error: z.coerce.boolean(),
  error_count: z.coerce.number(),
  service_set: z.array(z.string()).optional(),
  truncated: z.coerce.boolean().optional(),
});

function parseHttpStatus(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(String(v));
  return Number.isFinite(n) ? n : undefined;
}

function normalizeTraceSummary(row: z.infer<typeof rawTraceRowSchema>): TraceSummary {
  const durationNs = Math.round(row.duration_ms * 1_000_000);
  return {
    trace_id: row.trace_id,
    team_id: 0,
    start_ms: row.start_ms,
    end_ms: row.end_ms,
    duration_ns: durationNs,
    root_service: row.root_service,
    root_operation: row.root_operation,
    root_status: row.root_status ?? "",
    root_http_method: row.root_http_method,
    root_http_status: parseHttpStatus(row.root_http_status),
    root_endpoint: undefined,
    span_count: row.span_count,
    has_error: row.has_error,
    error_count: row.error_count,
    environment: undefined,
    service_set: row.service_set,
    truncated: row.truncated,
  };
}

const facetBucketSchema = z.object({
  value: z.string(),
  count: z.coerce.number(),
});

const facetBucketsArraySchema = z
  .union([z.array(facetBucketSchema), z.null()])
  .transform((v) => v ?? []);

/** Facets object from `explorer.Facets` — keys: service, operation, http_method, http_status, status. */
const rawFacetsSchema = z
  .object({
    service: facetBucketsArraySchema.optional(),
    operation: facetBucketsArraySchema.optional(),
    http_method: facetBucketsArraySchema.optional(),
    http_status: facetBucketsArraySchema.optional(),
    status: facetBucketsArraySchema.optional(),
  })
  .partial()
  .nullable()
  .optional();

function normalizeFacets(
  raw: z.infer<typeof rawFacetsSchema>
): TracesQueryResponse["facets"] {
  if (raw == null) return undefined;
  const out: Record<string, Array<{ value: string; count: number }>> = {};
  for (const [k, arr] of Object.entries(raw)) {
    if (arr.length > 0) {
      out[k] = arr.map((b) => ({ value: b.value, count: b.count }));
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

const rawSummarySchema = z.object({
  total_traces: z.coerce.number(),
  total_errors: z.coerce.number(),
  total_duration_ns: z.coerce.number().optional(),
});

const rawTrendRowSchema = z.object({
  time_bucket: z.string(),
  total: z.coerce.number(),
  errors: z.coerce.number(),
});

const tracesQueryResponseSchema = z
  .object({
    results: z.union([z.array(rawTraceRowSchema), z.null()]).transform((v) => v ?? []),
    pageInfo: z.unknown().optional(),
    summary: rawSummarySchema.nullable().optional(),
    facets: rawFacetsSchema,
    trend: z.union([z.array(rawTrendRowSchema), z.null()]).optional(),
    warnings: z.array(z.union([z.string(), warningSchema])).optional(),
  })
  .transform((r) => {
    const out: TracesQueryResponse = {
      traces: r.results.map(normalizeTraceSummary),
      nextCursor: extractNextCursor(r.pageInfo),
      summary:
        r.summary != null
          ? { total: r.summary.total_traces, errors: r.summary.total_errors }
          : undefined,
      facets: normalizeFacets(r.facets ?? undefined),
      trend: r.trend?.map((b) => ({
        time_bucket: b.time_bucket,
        total: b.total,
        errors: b.errors,
        warnings: 0,
      })),
      warnings: normalizeWarnings(r.warnings),
    };
    return out;
  });

function inferColumnType(rows: Record<string, unknown>[], name: string): AnalyticsColumn["type"] {
  for (const r of rows) {
    const v = r[name];
    if (v == null) continue;
    if (typeof v === "number") return "number";
    if (typeof v === "boolean") return "number";
    if (typeof v === "string") {
      if (v.includes("T") && !Number.isNaN(Date.parse(v))) return "time";
      if (/^-?\d+(\.\d+)?$/.test(v.trim())) return "number";
      return "string";
    }
  }
  return "string";
}

/** Traces analytics returns `rows: { [col]: value }[]` (Go `[]AnalyticsRow`). Grid UI expects columns + 2d rows. */
function analyticsObjectsToGrid(rows: Record<string, unknown>[]): Pick<AnalyticsResponse, "columns" | "rows"> {
  if (rows.length === 0) {
    return { columns: [], rows: [] };
  }
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r)))].sort();
  const columns: AnalyticsColumn[] = keys.map((name) => ({
    name,
    type: inferColumnType(rows, name),
  }));
  const grid = rows.map((r) =>
    keys.map((k) => {
      const v = r[k];
      if (v == null) return "";
      if (typeof v === "number" || typeof v === "string") return v;
      if (typeof v === "boolean") return v ? 1 : 0;
      return String(v);
    })
  );
  return { columns, rows: grid };
}

const rawTracesAnalyticsSchema = z
  .object({
    vizMode: z.string().optional(),
    step: z.string().optional(),
    rows: z.union([z.array(z.record(z.string(), z.any())), z.null()]).transform((v) => v ?? []),
    warnings: z.array(z.union([z.string(), warningSchema])).optional(),
  })
  .transform((r) => {
    const grid = analyticsObjectsToGrid(r.rows as Record<string, unknown>[]);
    return {
      ...grid,
      warnings: normalizeWarnings(r.warnings),
    } satisfies AnalyticsResponse;
  });

async function query(body: TracesQueryRequest): Promise<TracesQueryResponse> {
  const raw = await api.post<unknown>(`${BASE}/traces/query`, body);
  if (import.meta.env.DEV) {
    const st = body.startTime;
    const en = body.endTime;
    if (st > 0 && en > st && en < 1e12) {
      console.warn(
        "[traces/query] startTime/endTime look like seconds, not ms — queries may return no rows.",
        { startTime: st, endTime: en }
      );
    }
  }
  try {
    return validateResponse(tracesQueryResponseSchema, raw);
  } catch (err) {
    if (import.meta.env.DEV) {
      let snippet: string;
      try {
        snippet = JSON.stringify(raw).slice(0, 800);
      } catch {
        snippet = String(raw).slice(0, 800);
      }
      console.warn("[traces/query] validateResponse failed — check API contract vs Zod schema.", {
        snippet,
        error: err,
      });
    }
    throw err;
  }
}

async function analytics(body: AnalyticsRequest): Promise<AnalyticsResponse> {
  const raw = await api.post<unknown>(`${BASE}/traces/analytics`, body);
  return validateResponse(rawTracesAnalyticsSchema, raw);
}

async function getById(traceId: string): Promise<TraceSummary> {
  const raw = await api.get<unknown>(`${BASE}/traces/${encodeURIComponent(traceId)}`);
  const row = validateResponse(rawTraceRowSchema, raw);
  return normalizeTraceSummary(row);
}

export const tracesExplorerApi = { query, analytics, getById };
export type { TracesQueryResponse } from "../types/trace";
