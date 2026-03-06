import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

/**
 *
 * @param errorRate
 */
export function deriveNodeStatus(errorRate: any): 'healthy' | 'degraded' | 'unhealthy' {
  const rate = Number(errorRate) || 0;
  if (rate > 10) return 'unhealthy';
  if (rate > 2) return 'degraded';
  return 'healthy';
}

export const STATUS_CONFIG: Record<string, { label: string; color: string; icon: JSX.Element }> = {
  healthy: { label: 'Healthy', color: '#73C991', icon: <CheckCircle2 size={14} /> },
  degraded: { label: 'Degraded', color: '#F79009', icon: <AlertTriangle size={14} /> },
  unhealthy: { label: 'Unhealthy', color: '#F04438', icon: <XCircle size={14} /> },
};

export const NODE_COLUMNS = [
  { key: 'host', label: 'Host', defaultWidth: 200 },
  { key: 'status', label: 'Status', defaultWidth: 110 },
  { key: 'pod_count', label: 'Pods', defaultWidth: 80 },
  { key: 'container_count', label: 'Containers', defaultWidth: 100 },
  { key: 'request_count', label: 'Requests', defaultWidth: 100 },
  { key: 'error_rate', label: 'Error Rate', defaultWidth: 100 },
  { key: 'avg_latency_ms', label: 'Avg Latency', defaultWidth: 110 },
  { key: 'p95_latency_ms', label: 'P95 Latency', defaultWidth: 110 },
  { key: 'services', label: 'Services', defaultWidth: 180 },
  { key: 'last_seen', label: 'Last Seen', defaultWidth: 150, flex: true },
];

export const NODE_SERVICE_COLUMNS = [
  { key: 'service_name', label: 'Service', defaultWidth: 180 },
  { key: 'request_count', label: 'Requests', defaultWidth: 100 },
  { key: 'error_rate', label: 'Error Rate', defaultWidth: 100 },
  { key: 'avg_latency_ms', label: 'Avg Latency', defaultWidth: 110 },
  { key: 'p95_latency_ms', label: 'P95 Latency', defaultWidth: 110 },
  { key: 'pod_count', label: 'Pods', defaultWidth: 70, flex: true },
];
