import { API_CONFIG } from "@config/apiConfig";
import api from "@shared/api/api/client";
import { validateResponse } from "@shared/api/utils/validate";
import { z } from "zod";

import type { TraceSummary, TracesQueryRequest, TracesQueryResponse } from "../types/trace";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export const warningSchema = z.object({ code: z.string(), message: z.string() }).strict();

export function normalizeWarnings(
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
export const rawTraceRowSchema = z
  .object({
    trace_id: z.string(),
    start_ms: z.coerce.number(),
    end_ms: z.coerce.number(),
    duration_ms: z.coerce.number(),
    root_service: z.string(),
    root_operation: z.string(),
    root_status: z.string().optional(),
    root_http_method: z.string().optional(),
    root_http_status: z.string().optional(),
    span_count: z.coerce.number(),
    has_error: z.coerce.boolean(),
    error_count: z.coerce.number(),
    service_set: z.array(z.string()).optional(),
    truncated: z.coerce.boolean().optional(),
  })
  .strict();

function normalizeHttpStatus(v: string | undefined): string | undefined {
  if (v == null || v === "" || v === "0") return undefined;
  return v;
}

export function normalizeTraceSummary(row: z.infer<typeof rawTraceRowSchema>): TraceSummary {
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
    root_http_status: normalizeHttpStatus(row.root_http_status),
    root_endpoint: undefined,
    span_count: row.span_count,
    has_error: row.has_error,
    error_count: row.error_count,
    environment: undefined,
    service_set: row.service_set,
    truncated: row.truncated,
  };
}

const facetBucketSchema = z
  .object({
    value: z.string(),
    count: z.coerce.number(),
  })
  .strict();

const facetBucketsArraySchema = z
  .union([z.array(facetBucketSchema), z.null()])
  .transform((v) => v ?? []);

const rawFacetsSchema = z
  .object({
    service: facetBucketsArraySchema.optional(),
    operation: facetBucketsArraySchema.optional(),
    http_method: facetBucketsArraySchema.optional(),
    http_status: facetBucketsArraySchema.optional(),
    status: facetBucketsArraySchema.optional(),
  })
  .strict()
  .partial()
  .nullable()
  .optional();

function normalizeFacets(raw: z.infer<typeof rawFacetsSchema>): TracesQueryResponse["facets"] {
  if (raw == null) return undefined;
  const out: Record<string, Array<{ value: string; count: number }>> = {};
  for (const [k, arr] of Object.entries(raw)) {
    if (arr.length > 0) {
      out[k] = arr.map((b) => ({ value: b.value, count: b.count }));
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

const rawSummarySchema = z
  .object({
    total_traces: z.coerce.number(),
    total_errors: z.coerce.number(),
    total_duration_ns: z.coerce.number().optional(),
  })
  .strict();

const rawTrendRowSchema = z
  .object({
    time_bucket: z.string(),
    total: z.coerce.number(),
    errors: z.coerce.number(),
  })
  .strict();

const tracesQueryResponseSchema = z
  .object({
    results: z.union([z.array(rawTraceRowSchema), z.null()]).transform((v) => v ?? []),
    pageInfo: z.unknown().optional(),
    summary: rawSummarySchema.nullable().optional(),
    facets: rawFacetsSchema,
    trend: z.union([z.array(rawTrendRowSchema), z.null()]).optional(),
    warnings: z.array(z.union([z.string(), warningSchema])).optional(),
  })
  .strict()
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

function logDevSnippet(raw: unknown, err: unknown) {
  if (!import.meta.env.DEV) return;
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

export async function query(body: TracesQueryRequest): Promise<TracesQueryResponse> {
  const { include: _ignore, ...reqBody } = body;
  const raw = await api.post<unknown>(`${BASE}/traces/query`, reqBody);

  if (
    import.meta.env.DEV &&
    body.startTime > 0 &&
    body.endTime > body.startTime &&
    body.endTime < 1e12
  ) {
    console.warn(
      "[traces/query] startTime/endTime look like seconds, not ms — queries may return no rows.",
      { startTime: body.startTime, endTime: body.endTime }
    );
  }

  try {
    return validateResponse(tracesQueryResponseSchema, raw);
  } catch (err) {
    logDevSnippet(raw, err);
    throw err;
  }
}

export async function queryFacets(body: TracesQueryRequest) {
  const { include: _ignore, ...reqBody } = body;
  const raw = await api.post<unknown>(`${BASE}/traces/facets`, reqBody);
  const validated = validateResponse(rawFacetsSchema, raw);
  return normalizeFacets(validated);
}

export async function queryTrend(body: TracesQueryRequest) {
  const { include: _ignore, ...reqBody } = body;
  const raw = await api.post<unknown>(`${BASE}/traces/trend`, reqBody);
  const validated = validateResponse(z.union([z.array(rawTrendRowSchema), z.null()]), raw) ?? [];
  return validated.map((b) => ({
    time_bucket: b.time_bucket,
    total: b.total,
    errors: b.errors,
    warnings: 0,
  }));
}
