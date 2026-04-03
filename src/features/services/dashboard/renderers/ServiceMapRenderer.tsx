import { useMemo } from 'react';

import type {
  ServiceGraphEdge,
  ServiceGraphNode,
} from '@shared/components/ui/charts/specialized/ServiceGraph';
import ServiceTopologyMap from '../../components/topology/ServiceTopologyMap';
import { useDashboardData } from '@shared/components/ui/dashboard/hooks/useDashboardData';
import { getDashboardRecordArrayField } from '@shared/components/ui/dashboard/utils/runtimeValue';
import type { DashboardPanelRendererProps } from '@shared/components/ui/dashboard/dashboardPanelRegistry';

interface ServiceMapPayload {
  readonly nodes: readonly ServiceGraphNode[];
  readonly edges: readonly ServiceGraphEdge[];
}

/**
 *
 */
export function ServiceMapRenderer({
  chartConfig,
  dataSources,
  fillHeight: _fillHeight,
}: DashboardPanelRendererProps) {
  const { rawData } = useDashboardData(chartConfig, dataSources);
  const payload = useMemo<ServiceMapPayload>(() => {
    const nodeRows = getDashboardRecordArrayField(rawData, 'nodes');
    const edgeRows = getDashboardRecordArrayField(rawData, 'edges');

    const nodes = nodeRows.map((row) => ({
      name: String(row.name ?? ''),
      status: String(row.status ?? 'healthy'),
      requestCount: Number(row.request_count ?? 0),
      errorRate: Number(row.error_rate ?? 0),
      avgLatency: Number(row.avg_latency ?? 0),
      riskScore: typeof row.risk_score === 'number' ? row.risk_score : undefined,
    }));

    const edges = edgeRows.map((row) => ({
      source: String(row.source ?? ''),
      target: String(row.target ?? ''),
      callCount: Number(row.call_count ?? 0),
      avgLatency: Number(row.avg_latency ?? 0),
      p95LatencyMs: Number(row.p95_latency_ms ?? 0),
      errorRate: Number(row.error_rate ?? 0),
    }));

    return {
      nodes,
      edges,
    };
  }, [rawData]);

  if (payload.nodes.length === 0) {
    return (
      <div className="text-muted" style={{ textAlign: 'center', padding: 32 }}>
        No data
      </div>
    );
  }
  return (
    <div className="h-full min-h-0">
      <ServiceTopologyMap nodes={[...payload.nodes]} edges={[...payload.edges]} />
    </div>
  );
}
