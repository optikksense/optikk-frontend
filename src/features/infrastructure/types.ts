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

export interface LoadAverageResult {
  readonly load_1m: number;
  readonly load_5m: number;
  readonly load_15m: number;
}

export interface NodeAllocatable {
  readonly cpu_cores: number;
  readonly memory_bytes: number;
}

export interface PhaseStat {
  readonly phase: string;
  readonly count: number;
}

export interface HistogramSummary {
  readonly p50: number;
  readonly p95: number;
  readonly p99: number;
  readonly avg: number;
}

export interface JvmCpuStats {
  readonly cpu_time_value: number;
  readonly recent_utilization: number;
}

export interface ReplicaStat {
  readonly replica_set: string;
  readonly desired: number;
  readonly available: number;
}

export interface K8sPodRestartRow {
  readonly pod_name: string;
  readonly namespace: string;
  readonly restarts: number;
}
