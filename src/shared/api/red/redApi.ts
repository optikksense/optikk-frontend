import api, { type Comparable } from "@/shared/api/http/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";
import { validateResponse } from "@shared/api/utils/validate";
import { z } from "zod";
import { type REDFiltersParams, buildREDFilters } from "./buildREDFilters";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export type { Comparable };

async function getJson<S extends z.ZodTypeAny>(
  path: string,
  params: REDFiltersParams,
  schema: S,
  signal?: AbortSignal
): Promise<z.infer<S>> {
  return validateResponse(schema, await api.get<unknown>(`${V1}${path}`, { params, signal }));
}

async function getComparableJson<S extends z.ZodTypeAny>(
  path: string,
  params: REDFiltersParams,
  schema: S,
  signal?: AbortSignal
): Promise<Comparable<z.infer<S>>> {
  const { data, comparison } = await api.getComparable<unknown>(`${V1}${path}`, { params, signal });
  return {
    data: validateResponse(schema, data),
    comparison: comparison === undefined ? undefined : validateResponse(schema, comparison),
  };
}

const timestamped = { timestamp: z.string() };

interface ServiceNode {
  readonly name: string;
  readonly requestCount: number;
  readonly errorCount: number;
  readonly errorRate: number;
  readonly p50LatencyMs: number;
  readonly p95LatencyMs: number;
  readonly p99LatencyMs: number;
  readonly health: string;
}

interface ServiceEdge {
  readonly source: string;
  readonly target: string;
  readonly callCount: number;
  readonly errorCount: number;
  readonly errorRate: number;
  readonly p50LatencyMs: number;
  readonly p95LatencyMs: number;
}

export interface TopologyResponse {
  readonly nodes: ServiceNode[];
  readonly edges: ServiceEdge[];
}

export function getTopology(
  s: RequestTime,
  e: RequestTime,
  service?: string
): Promise<TopologyResponse> {
  const params: Record<string, RequestTime | string> = { startTime: s, endTime: e };
  if (service) params.service = service;
  return api.get<TopologyResponse>(`${V1}/services/topology`, { params });
}

const redServiceRowSchema = z.object({
  serviceName: z.string(),
  requestCount: z.number(),
  errorCount: z.number(),
  avgLatency: z.number(),
  p95Latency: z.number(),
  p99Latency: z.number(),
});

const fleetOverviewSchema = z.object({
  totals: z.object({
    serviceCount: z.number(),
    totalSpanCount: z.number(),
    totalErrors: z.number(),
    totalRps: z.number(),
    avgErrorRate: z.number(),
    avgP50Ms: z.number(),
    avgP95Ms: z.number(),
    avgP99Ms: z.number(),
  }),
  services: z.array(redServiceRowSchema),
});

export type RedServiceRow = z.infer<typeof redServiceRowSchema>;
type FleetOverview = z.infer<typeof fleetOverviewSchema>;

export type ServiceCatalogRedSummary = FleetOverview["totals"] & {
  readonly services: RedServiceRow[];
};

function normalizeFleetOverview(overview: FleetOverview): ServiceCatalogRedSummary {
  return { ...overview.totals, services: overview.services };
}

export async function getRedSummary(
  s: RequestTime,
  e: RequestTime,
  services?: string | readonly string[],
  signal?: AbortSignal
): Promise<ServiceCatalogRedSummary> {
  const params = buildREDFilters(s, e, services);
  return normalizeFleetOverview(
    await getJson("/spans/red/fleet-overview", params, fleetOverviewSchema, signal)
  );
}

export async function getRedSummaryWithComparison(
  s: RequestTime,
  e: RequestTime,
  services?: string | readonly string[],
  signal?: AbortSignal
): Promise<Comparable<ServiceCatalogRedSummary>> {
  const params = { ...buildREDFilters(s, e, services), compareTo: "previous_period" };
  const { data, comparison } = await getComparableJson(
    "/spans/red/fleet-overview",
    params,
    fleetOverviewSchema,
    signal
  );
  return {
    data: normalizeFleetOverview(data),
    comparison: comparison && normalizeFleetOverview(comparison),
  };
}

// Columnar shape: unix-ms timestamps shared by every series entry.
const requestRateSeriesSchema = z.object({
  timestamps: z.array(z.number()),
  series: z.array(
    z.object({
      serviceName: z.string(),
      rps: z.array(z.number()),
    })
  ),
});

export type RequestRateSeries = z.infer<typeof requestRateSeriesSchema>;

export function getRequestRateSeries(
  s: RequestTime,
  e: RequestTime,
  services?: string | readonly string[],
  signal?: AbortSignal
): Promise<RequestRateSeries> {
  const params = buildREDFilters(s, e, services);
  return getJson("/spans/red/request-rate", params, requestRateSeriesSchema, signal);
}

const requestErrorRatePointSchema = z.object({
  ...timestamped,
  rps: z.number(),
  requestCount: z.number(),
  errorCount: z.number(),
  errorRate: z.number(),
});

export type RequestErrorRatePoint = z.infer<typeof requestErrorRatePointSchema>;

export function getRequestAndErrorRateSeries(
  s: RequestTime,
  e: RequestTime,
  services?: string | readonly string[],
  signal?: AbortSignal
): Promise<RequestErrorRatePoint[]> {
  const params = buildREDFilters(s, e, services);
  return getJson(
    "/spans/red/request-and-error-rate",
    params,
    z.array(requestErrorRatePointSchema),
    signal
  );
}

const statusTimeseriesPointSchema = z.object({
  ...timestamped,
  status2xx: z.number(),
  status4xx: z.number(),
  status5xx: z.number(),
  statusOther: z.number(),
});

const latencyPercentilesPointSchema = z.object({
  ...timestamped,
  p50Ms: z.number(),
  p95Ms: z.number(),
  p99Ms: z.number(),
});

export type StatusTimeseriesPoint = z.infer<typeof statusTimeseriesPointSchema>;
export type LatencyPercentilesPoint = z.infer<typeof latencyPercentilesPointSchema>;

export function getStatusTimeseries(
  s: RequestTime,
  e: RequestTime,
  services?: string | readonly string[]
): Promise<StatusTimeseriesPoint[]> {
  const params = buildREDFilters(s, e, services);
  return getJson("/spans/red/status-timeseries", params, z.array(statusTimeseriesPointSchema));
}

export function getLatencyPercentilesTimeseries(
  s: RequestTime,
  e: RequestTime,
  services?: string | readonly string[]
): Promise<LatencyPercentilesPoint[]> {
  const params = buildREDFilters(s, e, services);
  return getJson(
    "/spans/red/latency-percentiles-timeseries",
    params,
    z.array(latencyPercentilesPointSchema)
  );
}

const topEndpointSchema = z.object({
  operationName: z.string(),
  serviceName: z.string(),
  spanKind: z.string(),
  httpRoute: z.string(),
  httpMethod: z.string(),
  rpcSystem: z.string(),
  rps: z.number(),
  errorRate: z.number(),
  errorCount: z.number(),
  totalCount: z.number(),
  p50Ms: z.number(),
  p95Ms: z.number(),
  p99Ms: z.number(),
});

function pageOf<S extends z.ZodTypeAny>(row: S) {
  return z.object({
    results: z.array(row),
    pageInfo: z.object({
      hasMore: z.boolean(),
      nextCursor: z.string().optional(),
      limit: z.number(),
    }),
  });
}

const topEndpointsPageSchema = pageOf(topEndpointSchema);

export type TopEndpoint = z.infer<typeof topEndpointSchema>;

export function getTopEndpoints(
  s: RequestTime,
  e: RequestTime,
  services?: string | readonly string[],
  limit = 50,
  compareTo?: "previous_period",
  cursor?: string
): Promise<Comparable<z.infer<typeof topEndpointsPageSchema>>> {
  const params = buildREDFilters(s, e, services, { limit, cursor, compareTo });
  return getComparableJson("/spans/red/top-endpoints", params, topEndpointsPageSchema);
}

const topDBQuerySchema = z.object({
  operationName: z.string(),
  serviceName: z.string(),
  dbSystem: z.string(),
  rps: z.number(),
  errorRate: z.number(),
  errorCount: z.number(),
  totalCount: z.number(),
  p50Ms: z.number(),
  p95Ms: z.number(),
  p99Ms: z.number(),
});

const topDBQueriesPageSchema = pageOf(topDBQuerySchema);

export type TopDBQuery = z.infer<typeof topDBQuerySchema>;

export function getTopDBQueries(
  s: RequestTime,
  e: RequestTime,
  services?: string | readonly string[],
  limit = 50,
  compareTo?: "previous_period",
  cursor?: string
): Promise<Comparable<z.infer<typeof topDBQueriesPageSchema>>> {
  const params = buildREDFilters(s, e, services, { limit, cursor, compareTo });
  return getComparableJson("/spans/red/top-db-queries", params, topDBQueriesPageSchema);
}

const serviceSummarySchema = z.object({
  serviceName: z.string(),
  requestCount: z.number(),
  errorCount: z.number(),
  rps: z.number(),
  errorRate: z.number(),
  p50Ms: z.number(),
  p95Ms: z.number(),
  p99Ms: z.number(),
  cpuUtilization: z.number(),
  memoryUtilization: z.number(),
  diskUtilization: z.number(),
});

const saturationPointSchema = z.object({ ...timestamped, value: z.number() });

export type ServiceSummaryResponse = z.infer<typeof serviceSummarySchema>;
export type SaturationTimeSeriesPoint = z.infer<typeof saturationPointSchema>;

export function getServiceSummary(
  s: RequestTime,
  e: RequestTime,
  services: string | readonly string[],
  compareTo?: "previous_period"
): Promise<Comparable<ServiceSummaryResponse>> {
  const params = buildREDFilters(s, e, services, { compareTo });
  return getComparableJson("/spans/red/summary", params, serviceSummarySchema);
}

export function getServiceSaturationTimeseries(
  s: RequestTime,
  e: RequestTime,
  services: string | readonly string[]
): Promise<SaturationTimeSeriesPoint[]> {
  const params = buildREDFilters(s, e, services);
  return getJson("/spans/red/saturation-timeseries", params, z.array(saturationPointSchema));
}
