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

function extractNextCursor(pageInfo: unknown): string | undefined {
  const parsed = pageInfoSchema.safeParse(pageInfo);
  if (parsed.success && parsed.data.nextCursor && parsed.data.nextCursor !== "") {
    return parsed.data.nextCursor;
  }
  return undefined;
}

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

const rawTrendRowSchema = z.object({
  timeBucket: z.string(),
  total: z.number(),
  errors: z.number(),
});

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

const nullableArray = <T extends z.ZodTypeAny>(item: T) =>
  z.union([z.array(item), z.null(), z.undefined()]).transform((v) => v ?? ([] as z.infer<T>[]));

// Consolidated trace detail: summary + span list + server-derived views.
// summary is null when the trace has no spans in the requested range.
const traceDetailResponseSchema = z.object({
  summary: rawTraceRowSchema.nullable(),
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
    summary: parsed.summary ? normalizeTraceSummary(parsed.summary) : null,
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
