export interface InfrastructureNode {
  readonly host: string;
  readonly pod_count: number;
  readonly container_count: number;
  readonly services: readonly string[];
  readonly request_count: number;
  readonly error_count: number;
  readonly error_rate: number;
  readonly avg_latency_ms: number;
  readonly p95_latency_ms: number;
  readonly last_seen: string;
}

export interface InfrastructureNodeSummary {
  readonly healthy_nodes: number;
  readonly degraded_nodes: number;
  readonly unhealthy_nodes: number;
  readonly total_pods: number;
}

/** Root-span aggregates per Kubernetes pod name (see GET /v1/infrastructure/fleet/pods). */
export interface FleetPod {
  readonly pod_name: string;
  readonly host: string;
  readonly services: readonly string[];
  readonly request_count: number;
  readonly error_count: number;
  readonly error_rate: number;
  readonly avg_latency_ms: number;
  readonly p95_latency_ms: number;
  readonly last_seen: string;
}

export interface MetricValue {
  readonly value: number;
}
