// API contract for the cloud inventory endpoints (query `/v1/cloud/*`).
// All values are derived from telemetry resource attributes (cloud.*, k8s.*).

export interface CategoryCount {
  readonly category: string;
  readonly count: number;
}

export interface HealthCounts {
  readonly healthy: number;
  readonly degraded: number;
  readonly unhealthy: number;
}

export interface ProviderSummary {
  readonly provider: string;
  readonly accounts: number;
  readonly regions: number;
  readonly nodes: number;
  readonly pods: number;
  readonly resources: number;
  readonly restarts: number;
  readonly categories: readonly CategoryCount[];
  readonly health: HealthCounts;
  readonly last_seen: string;
}

export interface CloudOverview {
  readonly providers: readonly ProviderSummary[];
  readonly total_resources: number;
  readonly total_accounts: number;
  readonly total_regions: number;
  readonly total_nodes: number;
  readonly total_pods: number;
  readonly unhealthy: number;
  readonly degraded: number;
}

export interface PlatformService {
  readonly platform: string;
  readonly category: string;
  readonly count: number;
}

export interface AccountBreakdown {
  readonly account: string;
  readonly resources: number;
  readonly nodes: number;
  readonly pods: number;
}

export interface AttentionResource {
  readonly entity: string;
  readonly service: string;
  readonly region: string;
  readonly platform: string;
  readonly health: string;
  readonly error_rate: number;
  readonly avg_latency_ms: number;
  readonly request_count: number;
}

export interface CloudProviderDetail {
  readonly provider: string;
  readonly services: readonly PlatformService[];
  readonly accounts: readonly AccountBreakdown[];
  readonly resources: readonly AttentionResource[];
}
