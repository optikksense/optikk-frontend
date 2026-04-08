export type DomainRecord = Record<string, unknown>;

// Metrics Explorer Types

export type MetricType = "gauge" | "counter" | "histogram" | "summary";

export interface MetricNameEntry {
  readonly name: string;
  readonly type: MetricType;
  readonly unit?: string;
  readonly description?: string;
}

export interface MetricTag {
  readonly key: string;
  readonly values: string[];
}

export type MetricAggregation =
  | "avg"
  | "sum"
  | "min"
  | "max"
  | "count"
  | "p50"
  | "p95"
  | "p99"
  | "rate";

export type MetricFilterOperator = "eq" | "neq" | "in" | "not_in" | "wildcard";

export interface MetricTagFilter {
  readonly key: string;
  readonly operator: MetricFilterOperator;
  readonly value: string | string[];
}

export type MetricSpaceAggregation = "avg" | "sum" | "min" | "max";

export interface MetricQueryDefinition {
  readonly id: string;
  readonly aggregation: MetricAggregation;
  readonly metricName: string;
  readonly where: MetricTagFilter[];
  readonly groupBy: string[];
  readonly spaceAggregation: MetricSpaceAggregation;
}

export type ChartType = "line" | "area" | "bar";

export type TimeStep = "1m" | "5m" | "15m" | "1h" | "1d";

export interface MetricSeriesData {
  readonly tags: Record<string, string>;
  readonly values: Array<number | null>;
}

export interface MetricQueryResult {
  readonly timestamps: number[];
  readonly series: MetricSeriesData[];
}

export type MetricExplorerResults = Record<string, MetricQueryResult>;

export interface FormulaDefinition {
  readonly id: string;
  readonly expression: string;
}

export interface MetricsServiceOption extends DomainRecord {
  name?: string;
  service_name?: string;
  serviceName?: string;
}

export interface MetricSummary extends DomainRecord {
  total_requests: number;
  error_count: number;
  error_rate: number;
  avg_latency: number;
  p95_latency: number;
  p99_latency: number;
}

export interface MetricTimeSeriesPoint extends DomainRecord {
  timestamp: string;
  request_count: number;
  error_count: number;
  avg_latency: number;
  p50: number;
  p95: number;
  p99: number;
}

export interface ServiceMetricPoint extends DomainRecord {
  service_name: string;
  request_count: number;
  error_count: number;
  avg_latency: number;
  p50_latency: number;
  p95_latency: number;
  p99_latency: number;
}

export interface EndpointMetricPoint extends ServiceMetricPoint {
  operation_name: string;
  http_method: string;
  endpoint_name?: string;
}

export interface UseMetricsQueriesParams {
  selectedService: string | null;
  showErrorsOnly: boolean;
  activeTab: "overview" | "latency" | "services";
}

export interface UseMetricsQueriesResult {
  servicesData: MetricsServiceOption[] | undefined;
  summaryData: MetricSummary | undefined;
  summaryLoading: boolean;
  metricsData: MetricTimeSeriesPoint[] | undefined;
  metricsLoading: boolean;
  serviceMetricsData: ServiceMetricPoint[] | undefined;
  endpointMetricsData: EndpointMetricPoint[] | undefined;
  endpointTimeSeriesData: MetricTimeSeriesPoint[] | undefined;
}
