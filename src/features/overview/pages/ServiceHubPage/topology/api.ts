import { z } from 'zod';

import { API_V1_BASE } from '@config/apiConfig';
import api from '@shared/api/api';

const numeric = z.coerce.number().default(0);
const str = z.string().default('');

const serviceNodeSchema = z.object({
  name: str,
  request_count: numeric,
  error_count: numeric,
  error_rate: numeric,
  p50_latency_ms: numeric,
  p95_latency_ms: numeric,
  p99_latency_ms: numeric,
  health: z.enum(['healthy', 'degraded', 'unhealthy']).catch('healthy'),
});

const serviceEdgeSchema = z.object({
  source: str,
  target: str,
  call_count: numeric,
  error_count: numeric,
  error_rate: numeric,
  p50_latency_ms: numeric,
  p95_latency_ms: numeric,
});

export const topologyResponseSchema = z.object({
  nodes: z.array(serviceNodeSchema).default([]),
  edges: z.array(serviceEdgeSchema).default([]),
});

export type ServiceTopologyNode = z.infer<typeof serviceNodeSchema>;
export type ServiceTopologyEdge = z.infer<typeof serviceEdgeSchema>;
export type ServiceTopologyResponse = z.infer<typeof topologyResponseSchema>;

interface FetchParams {
  startTime: number | string;
  endTime: number | string;
  service?: string;
}

export async function fetchServiceTopology(params: FetchParams): Promise<ServiceTopologyResponse> {
  const raw = await api.get<unknown>(`${API_V1_BASE}/services/topology`, {
    params: {
      startTime: params.startTime,
      endTime: params.endTime,
      ...(params.service ? { service: params.service } : {}),
    },
  });
  return topologyResponseSchema.parse(raw ?? { nodes: [], edges: [] });
}
