import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { type TopologyResponse, getTopology } from "@/features/services/api/serviceCatalogApi";

export interface DependencyEdge {
  readonly peer: string;
  readonly callCount: number;
  readonly errorRate: number;
  readonly p95LatencyMs: number;
}

export interface ServiceDependencies {
  readonly upstream: DependencyEdge[];
  readonly downstream: DependencyEdge[];
}

function buildDependencies(
  topology: TopologyResponse | undefined,
  serviceName: string
): ServiceDependencies {
  const upstream: DependencyEdge[] = [];
  const downstream: DependencyEdge[] = [];
  for (const edge of topology?.edges ?? []) {
    if (edge.target === serviceName) {
      upstream.push(toEdge(edge.source, edge));
    } else if (edge.source === serviceName) {
      downstream.push(toEdge(edge.target, edge));
    }
  }
  return { upstream, downstream };
}

function toEdge(peer: string, raw: TopologyResponse["edges"][number]): DependencyEdge {
  return {
    peer,
    callCount: raw.call_count,
    errorRate: raw.error_rate,
    p95LatencyMs: raw.p95_latency_ms,
  };
}

export function useServiceTopology(serviceName: string) {
  const query = useTimeRangeQuery<TopologyResponse>(
    "service-detail.topology",
    (_team, start, end) => getTopology(start, end),
    { enabled: Boolean(serviceName) }
  );
  const dependencies = useMemo(
    () => buildDependencies(query.data, serviceName),
    [query.data, serviceName]
  );
  return { ...query, dependencies };
}
