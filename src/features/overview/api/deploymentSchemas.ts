import { z } from "zod";

export const numericValue = z.coerce.number().default(0);
export const stringValue = z.string().default("");
export const booleanValue = z.coerce.boolean().default(false);

export const latestDeploymentSchema = z
  .object({
    service_name: stringValue,
    version: stringValue,
    environment: stringValue,
    deployed_at: stringValue,
    last_seen_at: stringValue,
    is_active: booleanValue,
    commit_sha: stringValue.optional(),
    commit_author: stringValue.optional(),
    repo_url: stringValue.optional(),
    pr_url: stringValue.optional(),
  })
  .strict();

export const versionTrafficPointSchema = z
  .object({
    timestamp: stringValue,
    version: stringValue,
    rps: numericValue,
  })
  .strict();

export const compareWindowSchema = z
  .object({
    start_ms: numericValue,
    end_ms: numericValue,
  })
  .strict();

export const impactMetricsSchema = z
  .object({
    request_count: numericValue,
    error_count: numericValue,
    error_rate: numericValue,
    p95_ms: numericValue,
    p99_ms: numericValue,
    rps: numericValue,
  })
  .strict();

export const compareErrorRegressionSchema = z
  .object({
    group_id: stringValue,
    operation_name: stringValue,
    status_message: stringValue,
    http_status_code: numericValue,
    before_count: numericValue,
    after_count: numericValue,
    delta_count: numericValue,
    last_occurrence: stringValue,
    sample_trace_id: stringValue,
    severity: stringValue,
  })
  .strict();

export const compareEndpointRegressionSchema = z
  .object({
    endpoint_name: stringValue,
    operation_name: stringValue,
    http_method: stringValue,
    before_requests: numericValue,
    after_requests: numericValue,
    request_delta: numericValue,
    before_error_rate: numericValue,
    after_error_rate: numericValue,
    error_rate_delta: numericValue,
    before_p95_ms: numericValue,
    after_p95_ms: numericValue,
    p95_delta_ms: numericValue,
    before_p99_ms: numericValue,
    after_p99_ms: numericValue,
    p99_delta_ms: numericValue,
    regression_score: numericValue,
  })
  .strict();

export const deploymentCompareSchema = z
  .object({
    deployment: latestDeploymentSchema,
    before_window: compareWindowSchema.optional(),
    after_window: compareWindowSchema,
    has_baseline: booleanValue,
    summary: z
      .object({
        before: impactMetricsSchema.optional(),
        after: impactMetricsSchema,
      })
      .strict(),
    top_errors: z.array(compareErrorRegressionSchema).default([]),
    top_endpoints: z.array(compareEndpointRegressionSchema).default([]),
    timeline_start_ms: numericValue,
    timeline_end_ms: numericValue,
  })
  .strict();

export const deploymentRowSchema = z
  .object({
    service_name: stringValue,
    version: stringValue,
    environment: stringValue,
    first_seen: stringValue,
    last_seen: stringValue,
    span_count: numericValue,
  })
  .strict();

export const deploymentListResponseSchema = z
  .object({
    deployments: z.array(deploymentRowSchema).default([]),
    total: numericValue,
    active_version: stringValue,
    active_environment: stringValue,
  })
  .strict();

export const deploymentImpactRowSchema = z
  .object({
    service_name: stringValue,
    version: stringValue,
    environment: stringValue,
    deployed_at: stringValue,
    is_baseline: booleanValue,
    error_rate_before: numericValue,
    error_rate_after: numericValue,
    error_rate_delta: numericValue,
    p95_before: numericValue,
    p95_after: numericValue,
    p95_delta: numericValue,
    rps_before: numericValue,
    rps_after: numericValue,
    rps_delta: numericValue,
  })
  .strict();

export const deploymentImpactResponseSchema = z
  .object({
    impacts: z.array(deploymentImpactRowSchema).default([]),
  })
  .strict();

export const activeVersionSchema = z
  .object({
    version: stringValue,
    environment: stringValue,
  })
  .strict();
