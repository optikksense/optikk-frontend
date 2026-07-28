// API contract for the cloud inventory endpoints (query `/v1/cloud/*`).
// All values are derived from telemetry resource attributes (cloud.*, k8s.*).

export interface InventoryRow {
  readonly provider: string;
  readonly accounts: number;
  readonly regions: number;
  readonly nodes: number;
  readonly pods: number;
  readonly platforms: number;
  readonly resources: number;
  readonly lastSeen: string;
}

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
  readonly lastSeen: string;
}

export interface CloudOverview {
  readonly providers: readonly ProviderSummary[];
  readonly totalResources: number;
  readonly totalAccounts: number;
  readonly totalRegions: number;
  readonly totalNodes: number;
  readonly totalPods: number;
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
  readonly errorRate: number;
  readonly avgLatencyMs: number;
  readonly requestCount: number;
}

export interface CloudProviderDetail {
  readonly provider: string;
  readonly services: readonly PlatformService[];
  readonly accounts: readonly AccountBreakdown[];
  readonly resources: readonly AttentionResource[];
}
