import type { ReactNode } from "react";

export interface ServiceDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  serviceName: string;
  title?: string | null;
  initialData?: Record<string, unknown> | null;
}

export interface DrawerSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export interface TrendPanelProps {
  title: string;
  subtitle: string;
  headline: string;
  tone?: "requests" | "errors" | "latency";
  children: ReactNode;
}

export interface Column<Row> {
  key: string;
  label: string;
  render: (row: Row) => ReactNode;
  align?: "left" | "right" | "center";
}

export interface ServiceSummarySnapshot {
  requestCount: number;
  errorCount: number;
  errorRate: number;
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
}

export interface DependencyRow {
  id: string;
  serviceName: string;
  callCount: number;
  p95LatencyMs: number;
}

export interface EndpointRow {
  id: string;
  service_name: string;
  operation_name: string;
  endpoint_name?: string;
  http_method: string;
  request_count: number;
  error_count: number;
  avg_latency: number;
  p95_latency: number;
}
