import api from "@/shared/api/http/client";
import type { RequestTime } from "@/shared/api/service-types";
import { validateResponse } from "@/shared/api/utils/validate";
import { API_CONFIG } from "@config/apiConfig";
import { z } from "zod";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

const metricComparisonSchema = z.object({
  current: z.number(),
  baseline: z.number().nullable(),
  delta: z.number().nullable(),
  deltaPercent: z.number().nullable(),
});

const comparisonContextSchema = z.object({
  service: z.string(),
  environment: z.string(),
  version: z.string(),
  baselineVersion: z.string().nullable(),
  firstSeen: z.string(),
  window: z.object({
    currentStart: z.string(),
    currentEnd: z.string(),
    baselineStart: z.string(),
    baselineEnd: z.string(),
  }),
});

const deploymentSchema = z.object({
  service: z.string(),
  environment: z.string(),
  version: z.string(),
  previousVersion: z.string().nullable(),
  firstSeen: z.string(),
  timelineEnd: z.string(),
  trafficShare: z.number(),
  requestCount: z.number(),
  errorRate: z.number(),
  errorRateDelta: z.number().nullable(),
  p95Ms: z.number(),
  p95DeltaMs: z.number().nullable(),
});

const deploymentsListSchema = z.object({
  results: z.array(deploymentSchema),
  environments: z.array(z.string()),
  summary: z.object({
    deploymentCount: z.number(),
    serviceCount: z.number(),
    environmentCount: z.number(),
    latestFirstSeen: z.string().nullable(),
  }),
});

const deploymentCompareSchema = z.object({
  context: comparisonContextSchema,
  metrics: z.object({
    requests: metricComparisonSchema,
    errors: metricComparisonSchema,
    errorRate: metricComparisonSchema,
    p50Ms: metricComparisonSchema,
    p75Ms: metricComparisonSchema,
    p90Ms: metricComparisonSchema,
    p95Ms: metricComparisonSchema,
    p99Ms: metricComparisonSchema,
  }),
});

const deploymentTrafficSchema = z.object({
  context: comparisonContextSchema,
  timestamps: z.array(z.number()),
  series: z.array(
    z.object({
      version: z.string(),
      requests: z.array(z.number()),
    })
  ),
});

const errorChangeSchema = z.object({
  groupId: z.string(),
  operationName: z.string(),
  exceptionType: z.string(),
  currentCount: z.number(),
  baselineCount: z.number(),
});

const deploymentErrorsSchema = z.object({
  context: comparisonContextSchema,
  new: z.array(errorChangeSchema),
  resolved: z.array(errorChangeSchema),
});

const redValuesSchema = z.object({
  requests: z.number(),
  errors: z.number(),
  errorRate: z.number(),
  p95Ms: z.number(),
});

const dimensionDiffSchema = z.object({
  context: comparisonContextSchema,
  results: z.array(
    z.object({
      name: z.string(),
      current: redValuesSchema,
      baseline: redValuesSchema.nullable(),
      requestDelta: z.number().nullable(),
      errorRateDelta: z.number().nullable(),
      p95DeltaMs: z.number().nullable(),
    })
  ),
});

export type Deployment = z.infer<typeof deploymentSchema>;
export type DeploymentsList = z.infer<typeof deploymentsListSchema>;
export type MetricComparison = z.infer<typeof metricComparisonSchema>;
export type DeploymentCompare = z.infer<typeof deploymentCompareSchema>;
export type DeploymentTraffic = z.infer<typeof deploymentTrafficSchema>;
export type DeploymentErrors = z.infer<typeof deploymentErrorsSchema>;
export type ErrorChange = z.infer<typeof errorChangeSchema>;
export type DimensionDiff = z.infer<typeof dimensionDiffSchema>["results"][number];
export type DimensionDiffResponse = z.infer<typeof dimensionDiffSchema>;

function detailPath(service: string, version: string, suffix = ""): string {
  return `${V1}/deployments/${encodeURIComponent(service)}/${encodeURIComponent(version)}${suffix}`;
}

function detailParams(
  startTime: RequestTime,
  endTime: RequestTime,
  environment: string,
  limit?: number
) {
  return {
    startTime,
    endTime,
    environment,
    ...(limit === undefined ? {} : { limit }),
  };
}

async function getValidated<T extends z.ZodTypeAny>(
  path: string,
  schema: T,
  params: Record<string, RequestTime>,
  signal?: AbortSignal
): Promise<z.infer<T>> {
  const payload = await api.get<unknown>(path, { params, signal });
  return validateResponse(schema, payload);
}

export function getDeployments(
  startTime: RequestTime,
  endTime: RequestTime,
  signal?: AbortSignal
): Promise<DeploymentsList> {
  return getValidated(`${V1}/deployments`, deploymentsListSchema, { startTime, endTime }, signal);
}

export function getDeploymentCompare(
  service: string,
  version: string,
  environment: string,
  startTime: RequestTime,
  endTime: RequestTime,
  signal?: AbortSignal
): Promise<DeploymentCompare> {
  return getValidated(
    detailPath(service, version),
    deploymentCompareSchema,
    detailParams(startTime, endTime, environment),
    signal
  );
}

export function getDeploymentTraffic(
  service: string,
  version: string,
  environment: string,
  startTime: RequestTime,
  endTime: RequestTime,
  signal?: AbortSignal
): Promise<DeploymentTraffic> {
  return getValidated(
    detailPath(service, version, "/traffic"),
    deploymentTrafficSchema,
    detailParams(startTime, endTime, environment),
    signal
  );
}

export function getDeploymentErrors(
  service: string,
  version: string,
  environment: string,
  startTime: RequestTime,
  endTime: RequestTime,
  limit = 50,
  signal?: AbortSignal
): Promise<DeploymentErrors> {
  return getValidated(
    detailPath(service, version, "/errors"),
    deploymentErrorsSchema,
    detailParams(startTime, endTime, environment, limit),
    signal
  );
}

export function getDeploymentEndpoints(
  service: string,
  version: string,
  environment: string,
  startTime: RequestTime,
  endTime: RequestTime,
  limit = 50,
  signal?: AbortSignal
): Promise<DimensionDiffResponse> {
  return getValidated(
    detailPath(service, version, "/endpoints"),
    dimensionDiffSchema,
    detailParams(startTime, endTime, environment, limit),
    signal
  );
}

export function getDeploymentDependencies(
  service: string,
  version: string,
  environment: string,
  startTime: RequestTime,
  endTime: RequestTime,
  limit = 50,
  signal?: AbortSignal
): Promise<DimensionDiffResponse> {
  return getValidated(
    detailPath(service, version, "/dependencies"),
    dimensionDiffSchema,
    detailParams(startTime, endTime, environment, limit),
    signal
  );
}
