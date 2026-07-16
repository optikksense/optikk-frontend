import { API_CONFIG } from "@config/apiConfig";
import api from "@shared/api/http/client";
import { validateResponse } from "@shared/api/utils/validate";
import { z } from "zod";
import { buildTracesFilters } from "./buildTracesFilters";

import { type ServiceTopologyResponse, topologyResponseSchema } from "@shared/api/topology";
import {
  criticalPathSpanSchema,
  errorPathSpanSchema,
  relatedTraceSchema,
  spanAttributesSchema,
  spanEventSchema,
  spanRecordSchema,
  traceErrorGroupSchema,
} from "@shared/api/traces/schemas";
import type {
  CriticalPathSpanRecord,
  ErrorPathSpanRecord,
  RelatedTraceRecord,
  SpanAttributesRecord,
  SpanEventRecord,
  SpanRecord,
  TraceErrorGroup,
} from "@shared/api/traces/schemas";
import type { TraceSummary, TracesFacets, TracesQueryRequest, TracesQueryResponse } from "./types";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

// ==========================================
// Traces Query & Explorer Schemas & Helpers
// ==========================================

/** Mirrors explorer.PageInfo; only nextCursor is `omitempty`. */
const pageInfoSchema = z.object({
  hasMore: z.boolean(),
  nextCursor: z.string().optional(),
  limit: z.number(),
});

function extractNextCursor(pageInfo: unknown): string | undefined {
  const parsed = pageInfoSchema.safeParse(pageInfo);
  if (parsed.success && parsed.data.nextCursor && parsed.data.nextCursor !== "") {
    return parsed.data.nextCursor;
  }
  return undefined;
}

/** Mirrors explorer.Trace — POST /traces/query results[]. */
const rawTraceRowSchema = z.object({
  trace_id: z.string(),
  start_ms: z.number(),
  end_ms: z.number(),
  duration_ms: z.number(),
  root_service: z.string(),
  root_operation: z.string(),
  root_status: z.string().optional(),
  root_http_method: z.string().optional(),
  root_http_status: z.string().optional(),
  span_count: z.number(),
  has_error: z.boolean(),
  error_count: z.number(),
  service_set: z.array(z.string()).optional(),
  truncated: z.boolean().optional(),
});

function normalizeHttpStatus(v: string | undefined): string | undefined {
  if (v == null || v === "" || v === "0") return undefined;
  return v;
}

function normalizeTraceSummary(row: z.infer<typeof rawTraceRowSchema>): TraceSummary {
  const durationNs = Math.round(row.duration_ms * 1_000_000);
  return {
    trace_id: row.trace_id,
    tenant_id: 0,
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

/** Mirrors explorer.FacetBucket. */
const facetBucketSchema = z.object({
  value: z.string(),
  count: z.number(),
});

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
  .partial()
  .nullable()
  .optional();

function normalizeFacets(raw: z.infer<typeof rawFacetsSchema>): TracesFacets | undefined {
  if (raw == null) return undefined;
  const out: Record<string, Array<{ value: string; count: number }>> = {};
  for (const [k, arr] of Object.entries(raw)) {
    if (arr.length > 0) {
      out[k] = arr.map((b) => ({ value: b.value, count: b.count }));
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** Mirrors explorer.TrendBucket — POST /traces/trend. */
const rawTrendRowSchema = z.object({
  time_bucket: z.string(),
  total: z.number(),
  errors: z.number(),
});

/** Mirrors explorer.QueryResponse — only results + pageInfo exist on the wire. */
const tracesQueryResponseSchema = z
  .object({
    results: z.union([z.array(rawTraceRowSchema), z.null()]).transform((v) => v ?? []),
    pageInfo: z.unknown().optional(),
  })
  .transform((r) => {
    const out: TracesQueryResponse = {
      traces: r.results.map(normalizeTraceSummary),
      nextCursor: extractNextCursor(r.pageInfo),
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
  const reqBody = buildTracesFilters(body.filters, body.startTime, body.endTime, {
    limit: body.limit,
    cursor: body.cursor,
  });
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
  const reqBody = buildTracesFilters(body.filters, body.startTime, body.endTime, {
    limit: 0,
  });
  const raw = await api.post<unknown>(`${BASE}/traces/facets`, reqBody);
  const validated = validateResponse(rawFacetsSchema, raw);
  return normalizeFacets(validated);
}

export async function queryTrend(body: TracesQueryRequest) {
  const reqBody = buildTracesFilters(body.filters, body.startTime, body.endTime, {
    limit: 0,
  });
  const raw = await api.post<unknown>(`${BASE}/traces/trend`, reqBody);
  const validated = validateResponse(z.union([z.array(rawTrendRowSchema), z.null()]), raw) ?? [];
  return validated.map((b) => ({
    time_bucket: b.time_bucket,
    total: b.total,
    errors: b.errors,
    warnings: 0,
  }));
}

/** GET /traces/{traceId}/spans always responds `{"spans": [...]}` (never null). */
const traceSpansEnvelopeSchema = z.object({
  spans: z.array(spanRecordSchema),
});

async function getTraceSpans(_tenantId: number | null, traceId: string): Promise<SpanRecord[]> {
  const data = await api.get(`${BASE}/traces/${traceId}/spans`);
  return validateResponse(traceSpansEnvelopeSchema, data).spans;
}

async function getSpanEvents(traceId: string): Promise<SpanEventRecord[]> {
  const data = await api.get(`${BASE}/traces/${traceId}/span-events`);
  return validateResponse(z.array(spanEventSchema), data);
}

async function getCriticalPath(traceId: string): Promise<CriticalPathSpanRecord[]> {
  const data = await api.get(`${BASE}/traces/${traceId}/critical-path`);
  return validateResponse(z.array(criticalPathSpanSchema), data);
}

async function getErrorPath(traceId: string): Promise<ErrorPathSpanRecord[]> {
  const data = await api.get(`${BASE}/traces/${traceId}/error-path`);
  return validateResponse(z.array(errorPathSpanSchema), data);
}

async function getSpanAttributes(traceId: string, spanId: string): Promise<SpanAttributesRecord> {
  const data = await api.get(`${BASE}/traces/${traceId}/spans/${spanId}/attributes`);
  return validateResponse(spanAttributesSchema, data);
}

async function getRelatedTraces(
  traceId: string,
  serviceName?: string,
  operationName?: string,
  startMs?: number,
  endMs?: number
): Promise<RelatedTraceRecord[]> {
  const data = await api.get(`${BASE}/traces/${traceId}/related`, {
    params: {
      service: serviceName,
      operation: operationName,
      startTime: startMs,
      endTime: endMs,
    },
  });
  return validateResponse(z.array(relatedTraceSchema), data);
}

// Serves topology.BuildGraph output, identical to GET /services/topology.
async function getServiceMap(traceId: string): Promise<ServiceTopologyResponse> {
  const data = await api.get(`${BASE}/traces/${traceId}/service-map`);
  return validateResponse(topologyResponseSchema, data ?? { nodes: [], edges: [] });
}

interface ServiceLatencyBaseline {
  readonly p95: number;
  readonly p99: number;
}

/**
 * Mirrors redfleet.ServiceREDMetric — GET /spans/red/services returns a bare
 * array. Fields this call does not read are still declared so the schema stays
 * an honest mirror of the contract and drift reporting stays meaningful.
 */
const redServicesSchema = z.array(
  z.object({
    service_name: z.string(),
    request_count: z.number(),
    error_count: z.number(),
    avg_latency: z.number(),
    p95_latency: z.number(),
    p99_latency: z.number(),
  })
);

async function getServiceLatencyBaselines(
  startMs: number,
  endMs: number
): Promise<Map<string, ServiceLatencyBaseline>> {
  const data = await api.get(`${BASE}/spans/red/services`, {
    params: { startTime: startMs, endTime: endMs },
  });
  const parsed = validateResponse(redServicesSchema, data ?? []);
  const out = new Map<string, ServiceLatencyBaseline>();
  for (const s of parsed) {
    out.set(s.service_name, { p95: s.p95_latency, p99: s.p99_latency });
  }
  return out;
}

async function getTraceErrors(traceId: string): Promise<TraceErrorGroup[]> {
  const data = await api.get(`${BASE}/traces/${traceId}/errors`);
  return validateResponse(z.array(traceErrorGroupSchema), data);
}

export const tracesService = {
  getTraceSpans,
  getSpanEvents,
  getCriticalPath,
  getErrorPath,
  getSpanAttributes,
  getRelatedTraces,
  getServiceMap,
  getServiceLatencyBaselines,
  getTraceErrors,
};
