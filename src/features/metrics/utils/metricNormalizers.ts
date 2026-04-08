import { asRecord as _asRecord } from "@shared/utils/coerce";
import type {
  DomainRecord,
  EndpointMetricPoint,
  MetricSummary,
  MetricTimeSeriesPoint,
  ServiceMetricPoint,
} from "../types";

function asRecord(value: unknown): DomainRecord {
  return _asRecord(value) as DomainRecord;
}

function num(record: DomainRecord, ...keys: string[]): number {
  for (const key of keys) {
    const parsed = Number(record[key]);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function str(record: DomainRecord, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      return value;
    }
  }
  return "";
}

export /**
 *
 */
const normalizeMetricSummary = (summary: unknown = {}): MetricSummary => {
  const row = asRecord(summary);
  return {
    ...row,
    total_requests: num(row, "total_requests"),
    error_count: num(row, "error_count"),
    error_rate: num(row, "error_rate"),
    avg_latency: num(row, "avg_latency"),
    p95_latency: num(row, "p95_latency"),
    p99_latency: num(row, "p99_latency"),
  };
};

export /**
 *
 */
const normalizeTimeSeriesPoint = (point: unknown = {}): MetricTimeSeriesPoint => {
  const row = asRecord(point);
  return {
    ...row,
    timestamp: str(row, "timestamp", "time_bucket"),
    request_count: num(row, "request_count"),
    error_count: num(row, "error_count"),
    avg_latency: num(row, "avg_latency"),
    p50: num(row, "p50", "p50_latency"),
    p95: num(row, "p95", "p95_latency"),
    p99: num(row, "p99", "p99_latency"),
  };
};

export /**
 *
 */
const normalizeServiceMetric = (metric: unknown = {}): ServiceMetricPoint => {
  const row = asRecord(metric);
  return {
    ...row,
    service_name: str(row, "service_name", "name"),
    request_count: num(row, "request_count"),
    error_count: num(row, "error_count"),
    avg_latency: num(row, "avg_latency"),
    p50_latency: num(row, "p50_latency"),
    p95_latency: num(row, "p95_latency"),
    p99_latency: num(row, "p99_latency"),
  };
};

export /**
 *
 */
const normalizeEndpointMetric = (metric: unknown = {}): EndpointMetricPoint => {
  const row = asRecord(metric);
  return {
    ...row,
    service_name: str(row, "service_name"),
    operation_name: str(row, "operation_name"),
    http_method: str(row, "http_method"),
    request_count: num(row, "request_count"),
    error_count: num(row, "error_count"),
    avg_latency: num(row, "avg_latency"),
    p50_latency: num(row, "p50_latency"),
    p95_latency: num(row, "p95_latency"),
    p99_latency: num(row, "p99_latency"),
  };
};
