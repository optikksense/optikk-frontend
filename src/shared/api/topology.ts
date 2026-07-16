import { z } from "zod";

import { API_V1_BASE } from "@config/apiConfig";
import api from "@shared/api/http/client";
import { validateResponse } from "@shared/api/utils/validate";

/**
 * Mirrors services/topology models. No field is `omitempty`, and `nodes`/
 * `edges` are built with `make(..., 0, n)` so they are never null.
 */
const serviceNodeSchema = z.object({
  name: z.string(),
  request_count: z.number(),
  error_count: z.number(),
  error_rate: z.number(),
  p50_latency_ms: z.number(),
  p95_latency_ms: z.number(),
  p99_latency_ms: z.number(),
  // classifyHealth only ever returns these three constants.
  health: z.enum(["healthy", "degraded", "unhealthy"]),
});

const serviceEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  call_count: z.number(),
  error_count: z.number(),
  error_rate: z.number(),
  p50_latency_ms: z.number(),
  p95_latency_ms: z.number(),
});

export const topologyResponseSchema = z.object({
  nodes: z.array(serviceNodeSchema),
  edges: z.array(serviceEdgeSchema),
});

export type ServiceTopologyNode = z.infer<typeof serviceNodeSchema>;
export type ServiceTopologyEdge = z.infer<typeof serviceEdgeSchema>;
export type ServiceTopologyResponse = z.infer<typeof topologyResponseSchema>;

interface FetchParams {
  startTime: number | string;
  endTime: number | string;
  service?: string;
}

export async function getServiceTopology(params: FetchParams): Promise<ServiceTopologyResponse> {
  const raw = await api.get<unknown>(`${API_V1_BASE}/services/topology`, {
    params: {
      startTime: params.startTime,
      endTime: params.endTime,
      ...(params.service ? { service: params.service } : {}),
    },
  });
  return validateResponse(topologyResponseSchema, raw ?? { nodes: [], edges: [] });
}
