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
import {
  type TraceSummary,
  type TracesFacets,
  type TracesQueryRequest,
  type TracesQueryResponse,
  traceSummarySchema,
} from "./types";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

function extractNextCursor(pageInfo: unknown): string | undefined {
  const parsed = pageInfoSchema.safeParse(pageInfo);
  if (parsed.success && parsed.data.nextCursor && parsed.data.nextCursor !== "") {
    return parsed.data.nextCursor;
  }
  return undefined;
}

const facetBucketSchema = z.object({
  value: z.string(),
  count: z.number(),
});

const rawFacetsSchema = z
  .object({
    service: z.array(facetBucketSchema).optional(),
    operation: z.array(facetBucketSchema).optional(),
    httpMethod: z.array(facetBucketSchema).optional(),
    httpStatus: z.array(facetBucketSchema).optional(),
    status: z.array(facetBucketSchema).optional(),
  })
  .partial();

const rawTrendRowSchema = z.object({
  timeBucketMs: z.number(),
  total: z.number(),
  errors: z.number(),
});

const tracesQueryResponseSchema = z
  .object({
    results: z.union([z.array(traceSummarySchema), z.null()]).transform((v) => v ?? []),
    pageInfo: z.unknown().optional(),
  })
  .transform((r) => {
    const out: TracesQueryResponse = {
      traces: r.results,
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
  const facets: TracesFacets = validateResponse(rawFacetsSchema, raw);
  return Object.keys(facets).length > 0 ? facets : undefined;
}

export async function queryTrend(body: TracesQueryRequest) {
  const { body: reqBody } = buildTracesFilters(body.filters, body.startTime, body.endTime);
  const raw = await api.post<unknown>(`${BASE}/traces/trend`, reqBody);
  const validated = validateResponse(z.union([z.array(rawTrendRowSchema), z.null()]), raw) ?? [];
  return validated.map((b) => ({
    timeBucketMs: b.timeBucketMs,
    total: b.total,
    errors: b.errors,
  }));
}

const nullableArray = <T extends z.ZodTypeAny>(item: T) =>
  z.union([z.array(item), z.null(), z.undefined()]).transform((v) => v ?? ([] as z.infer<T>[]));

// Consolidated trace detail: summary + span list + server-derived views.
// summary is null when the trace has no spans in the requested range.
const traceDetailResponseSchema = z.object({
  summary: traceSummarySchema.nullable(),
  spans: nullableArray(spanRecordSchema),
  criticalPath: nullableArray(criticalPathSpanSchema),
  errorPath: nullableArray(errorPathSpanSchema),
  serviceMap: topologyResponseSchema,
  errors: nullableArray(traceErrorGroupSchema),
});

interface TraceDetailResponse {
  readonly summary: TraceSummary | null;
  readonly spans: SpanRecord[];
  readonly criticalPath: CriticalPathSpanRecord[];
  readonly errorPath: ErrorPathSpanRecord[];
  readonly serviceMap: ServiceTopologyResponse;
  readonly errors: TraceErrorGroup[];
}

async function getTraceDetail(
  traceId: string,
  startMs: number,
  endMs: number,
  signal?: AbortSignal
): Promise<TraceDetailResponse> {
  const data = await api.get(`${BASE}/traces/${traceId}`, {
    params: { startTime: startMs, endTime: endMs },
    signal,
  });
  const parsed = validateResponse(traceDetailResponseSchema, data);
  return {
    summary: parsed.summary,
    spans: parsed.spans,
    criticalPath: parsed.criticalPath,
    errorPath: parsed.errorPath,
    serviceMap: parsed.serviceMap,
    errors: parsed.errors,
  };
}

async function getSpanEvents(
  traceId: string,
  startMs: number,
  endMs: number,
  signal?: AbortSignal
): Promise<SpanEventRecord[]> {
  const data = await api.get(`${BASE}/traces/${traceId}/span-events`, {
    params: { startTime: startMs, endTime: endMs },
    signal,
  });
  return validateResponse(z.array(spanEventSchema), data);
}

async function getSpanAttributes(
  traceId: string,
  spanId: string,
  startMs: number,
  endMs: number,
  signal?: AbortSignal
): Promise<SpanAttributesRecord> {
  const data = await api.get(`${BASE}/traces/${traceId}/spans/${spanId}/attributes`, {
    params: { startTime: startMs, endTime: endMs },
    signal,
  });
  return validateResponse(spanAttributesSchema, data);
}

async function getRelatedTraces(
  traceId: string,
  serviceName?: string,
  operationName?: string,
  startMs?: number,
  endMs?: number,
  signal?: AbortSignal
): Promise<RelatedTraceRecord[]> {
  const data = await api.get(`${BASE}/traces/${traceId}/related`, {
    params: {
      service: serviceName,
      operation: operationName,
      startTime: startMs,
      endTime: endMs,
    },
    signal,
  });
  return validateResponse(z.array(relatedTraceSchema), data);
}

interface ServiceLatencyBaseline {
  readonly p95: number;
  readonly p99: number;
}

const fleetOverviewServicesSchema = z.object({
  services: z.array(
    z.object({
      serviceName: z.string(),
      p95Latency: z.number(),
      p99Latency: z.number(),
    })
  ),
});

async function getServiceLatencyBaselines(
  startMs: number,
  endMs: number,
  signal?: AbortSignal
): Promise<Map<string, ServiceLatencyBaseline>> {
  const data = await api.get(`${BASE}/spans/red/fleet-overview`, {
    params: { startTime: startMs, endTime: endMs },
    signal,
  });
  const parsed = validateResponse(fleetOverviewServicesSchema, data ?? { services: [] });
  const out = new Map<string, ServiceLatencyBaseline>();
  for (const s of parsed.services) {
    out.set(s.serviceName, { p95: s.p95Latency, p99: s.p99Latency });
  }
  return out;
}

export const tracesService = {
  getTraceDetail,
  getSpanEvents,
  getSpanAttributes,
  getRelatedTraces,
  getServiceLatencyBaselines,
};
