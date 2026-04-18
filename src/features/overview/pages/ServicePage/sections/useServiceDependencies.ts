import { useMemo } from "react";

import {
  getServiceTopology,
  type ServiceTopologyEdge,
  type ServiceTopologyResponse,
} from "@/features/overview/pages/ServiceHubPage/topology/api";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export interface DependencyRow {
  readonly peerService: string;
  readonly callCount: number;
  readonly errorRate: number;
  readonly p95: number;
}

function toRow(edge: ServiceTopologyEdge, peer: string): DependencyRow {
  return {
    peerService: peer,
    callCount: edge.call_count,
    errorRate: edge.error_rate,
    p95: edge.p95_latency_ms,
  };
}

function upstreamRows(
  edges: readonly ServiceTopologyEdge[],
  serviceName: string
): DependencyRow[] {
  return edges.filter((edge) => edge.target === serviceName).map((edge) => toRow(edge, edge.source));
}

function downstreamRows(
  edges: readonly ServiceTopologyEdge[],
  serviceName: string
): DependencyRow[] {
  return edges.filter((edge) => edge.source === serviceName).map((edge) => toRow(edge, edge.target));
}

const EMPTY_TOPOLOGY: ServiceTopologyResponse = { nodes: [], edges: [] };

export function useServiceDependencies(serviceName: string): {
  topology: ServiceTopologyResponse;
  upstream: DependencyRow[];
  downstream: DependencyRow[];
  loading: boolean;
} {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery<ServiceTopologyResponse>(
    "service-page-dependencies",
    async (_teamId, startTime, endTime) =>
      getServiceTopology({ startTime, endTime, service: serviceName }),
    { extraKeys: [serviceName], enabled }
  );

  const topology = query.data ?? EMPTY_TOPOLOGY;
  const upstream = useMemo(
    () => upstreamRows(topology.edges, serviceName),
    [topology.edges, serviceName]
  );
  const downstream = useMemo(
    () => downstreamRows(topology.edges, serviceName),
    [topology.edges, serviceName]
  );

  return {
    topology,
    upstream,
    downstream,
    loading: query.isLoading && topology.edges.length === 0,
  };
}
