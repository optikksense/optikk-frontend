import { API_CONFIG } from "@config/apiConfig";
import api from "@shared/api/http/client";
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
import { validateResponse } from "@shared/api/utils/validate";
import { pageInfoSchema } from "@shared/search/schemas/pageInfo";
import { z } from "zod";
import { buildTracesFilters } from "./buildTracesFilters";
import type { TraceSummary, TracesFacets, TracesQueryRequest, TracesQueryResponse } from "./types";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

// ==========================================
// Traces Query & Explorer Schemas & Helpers
// ==========================================

function extractNextCursor(pageInfo: unknown): string | undefined {
  const parsed = pageInfoSchema.safeParse(pageInfo);
  if (parsed.success && parsed.data.nextCursor && parsed.data.nextCursor !== "") {
    return parsed.data.nextCursor;
  }
  return undefined;
}

/** Mirrors explorer.Trace — POST /traces/query results[]. */
const rawTraceRowSchema = z.object({
  traceId: z.string(),
  startMs: z.number(),
  endMs: z.number(),
  durationMs: z.number(),
  rootService: z.string(),
  rootOperation: z.string(),
  rootStatus: z.string().optional(),
  rootHttpMethod: z.string().optional(),
  rootHttpStatus: z.string().optional(),
  spanCount: z.number(),
  hasError: z.boolean(),
  errorCount: z.number(),
  serviceSet: z.array(z.string()).optional(),
  truncated: z.boolean().optional(),
});

function normalizeHttpStatus(v: string | undefined): string | undefined {
  if (v == null || v === "" || v === "0") return undefined;
  return v;
}

function normalizeTraceSummary(row: z.infer<typeof rawTraceRowSchema>): TraceSummary {
  const durationNs = Math.round(row.durationMs * 1_000_000);
  return {
    traceId: row.traceId,
    tenantId: 0,
    startMs: row.startMs,
    endMs: row.endMs,
    durationNs: durationNs,
    rootService: row.rootService,
    rootOperation: row.rootOperation,
    rootStatus: row.rootStatus ?? "",
    rootHttpMethod: row.rootHttpMethod,
    rootHttpStatus: normalizeHttpStatus(row.rootHttpStatus),
    rootEndpoint: undefined,
    spanCount: row.spanCount,
    hasError: row.hasError,
    errorCount: row.errorCount,
    environment: undefined,
    serviceSet: row.serviceSet,
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
    httpMethod: facetBucketsArraySchema.optional(),
    httpStatus: facetBucketsArraySchema.optional(),
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
  timeBucket: z.string(),
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
  const { body: reqBody } = buildTracesFilters(body.filters, body.startTime, body.endTime, {
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
  const { body: reqBody } = buildTracesFilters(body.filters, body.startTime, body.endTime);
  const raw = await api.post<unknown>(`${BASE}/traces/facets`, reqBody);
  const validated = validateResponse(rawFacetsSchema, raw);
  return normalizeFacets(validated);
}

export async function queryTrend(body: TracesQueryRequest) {
  const { body: reqBody } = buildTracesFilters(body.filters, body.startTime, body.endTime);
  const raw = await api.post<unknown>(`${BASE}/traces/trend`, reqBody);
  const validated = validateResponse(z.union([z.array(rawTrendRowSchema), z.null()]), raw) ?? [];
  return validated.map((b) => ({
    timeBucket: b.timeBucket,
    total: b.total,
    errors: b.errors,
  }));
}

/** GET /traces/{traceId}/spans always responds `{"spans": [...]}` (never null). */
const traceSpansEnvelopeSchema = z.object({
  spans: z.array(spanRecordSchema),
});

async function getTraceSpans(
  _tenantId: number | null,
  traceId: string,
  startMs: number,
  endMs: number
): Promise<SpanRecord[]> {
  const data = await api.get(`${BASE}/traces/${traceId}/spans`, {
    params: { startTime: startMs, endTime: endMs },
  });
  return validateResponse(traceSpansEnvelopeSchema, data).spans;
}

async function getSpanEvents(
  traceId: string,
  startMs: number,
  endMs: number
): Promise<SpanEventRecord[]> {
  const data = await api.get(`${BASE}/traces/${traceId}/span-events`, {
    params: { startTime: startMs, endTime: endMs },
  });
  return validateResponse(z.array(spanEventSchema), data);
}

async function getCriticalPath(
  traceId: string,
  startMs: number,
  endMs: number
): Promise<CriticalPathSpanRecord[]> {
  const data = await api.get(`${BASE}/traces/${traceId}/critical-path`, {
    params: { startTime: startMs, endTime: endMs },
  });
  return validateResponse(z.array(criticalPathSpanSchema), data);
}

async function getErrorPath(
  traceId: string,
  startMs: number,
  endMs: number
): Promise<ErrorPathSpanRecord[]> {
  const data = await api.get(`${BASE}/traces/${traceId}/error-path`, {
    params: { startTime: startMs, endTime: endMs },
  });
  return validateResponse(z.array(errorPathSpanSchema), data);
}

async function getSpanAttributes(
  traceId: string,
  spanId: string,
  startMs: number,
  endMs: number
): Promise<SpanAttributesRecord> {
  const data = await api.get(`${BASE}/traces/${traceId}/spans/${spanId}/attributes`, {
    params: { startTime: startMs, endTime: endMs },
  });
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
async function getServiceMap(
  traceId: string,
  startMs: number,
  endMs: number
): Promise<ServiceTopologyResponse> {
  const data = await api.get(`${BASE}/traces/${traceId}/service-map`, {
    params: { startTime: startMs, endTime: endMs },
  });
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
    serviceName: z.string(),
    requestCount: z.number(),
    errorCount: z.number(),
    avgLatency: z.number(),
    p95Latency: z.number(),
    p99Latency: z.number(),
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
    out.set(s.serviceName, { p95: s.p95Latency, p99: s.p99Latency });
  }
  return out;
}

async function getTraceErrors(
  traceId: string,
  startMs: number,
  endMs: number
): Promise<TraceErrorGroup[]> {
  const data = await api.get(`${BASE}/traces/${traceId}/errors`, {
    params: { startTime: startMs, endTime: endMs },
  });
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
