import { API_CONFIG } from "@config/apiConfig";
import { api } from "@shared/api/api/client";
import { validateResponse } from "@shared/api/utils/validate";
import { z } from "zod";

import type { ExplorerFilter } from "@/features/explorer/types/filters";

import type {
  AiAgentRunPoint,
  AiCallRow,
  AiCostPoint,
  AiErrorRatePoint,
  AiFacets,
  AiLatencyPoint,
  AiModelRatePoint,
  AiPromptUsagePoint,
  AiQueryArgs,
  AiRetrievalErrorPoint,
  AiRetrievalRatePoint,
  AiTokenUsagePoint,
  AiToolCallPoint,
  AiToolErrorPoint,
  AiTraceRow,
} from "../types";
import { operationsForAiSpanType } from "../utils/spanTypes";

const BASE = `${API_CONFIG.ENDPOINTS.V1_BASE}/ai`;

const bucketSchema = z.object({
  value: z.string(),
  count: z.coerce.number(),
});

const facetsSchema = z
  .object({
    providers: z.array(bucketSchema).optional().default([]),
    models: z.array(bucketSchema).optional().default([]),
    operations: z.array(bucketSchema).optional().default([]),
    services: z.array(bucketSchema).optional().default([]),
    environments: z.array(bucketSchema).optional().default([]),
    promptNames: z.array(bucketSchema).optional().default([]),
    agentNames: z.array(bucketSchema).optional().default([]),
    toolNames: z.array(bucketSchema).optional().default([]),
    dataSources: z.array(bucketSchema).optional().default([]),
  })
  .transform((raw): AiFacets => raw);

const modelRateSchema = z.object({
  timestamp: z.string(),
  provider: z.string(),
  model: z.string(),
  operation: z.string(),
  requests: z.coerce.number(),
  rate: z.coerce.number(),
});

const modelLatencySchema = z.object({
  timestamp: z.string(),
  provider: z.string().optional(),
  model: z.string().optional(),
  operation: z.string().optional(),
  promptName: z.string().optional(),
  promptVersion: z.string().optional(),
  toolName: z.string().optional(),
  toolType: z.string().optional(),
  dataSource: z.string().optional(),
  avgMs: z.coerce.number(),
  p50Ms: z.coerce.number(),
  p95Ms: z.coerce.number(),
  p99Ms: z.coerce.number(),
});

const errorRateSchema = z.object({
  timestamp: z.string(),
  provider: z.string(),
  model: z.string(),
  operation: z.string(),
  requests: z.coerce.number(),
  errors: z.coerce.number(),
  errorRate: z.coerce.number(),
});

const tokenUsageSchema = z.object({
  timestamp: z.string(),
  provider: z.string().optional(),
  model: z.string().optional(),
  operation: z.string().optional(),
  promptName: z.string().optional(),
  promptVersion: z.string().optional(),
  inputTokens: z.coerce.number(),
  outputTokens: z.coerce.number(),
  totalTokens: z.coerce.number(),
});

const costSchema = z.object({
  timestamp: z.string(),
  provider: z.string().optional(),
  model: z.string().optional(),
  operation: z.string().optional(),
  promptName: z.string().optional(),
  promptVersion: z.string().optional(),
  estimatedInputCost: z.coerce.number(),
  estimatedOutputCost: z.coerce.number(),
  estimatedTotalCost: z.coerce.number(),
});

const callRowSchema = z.object({
  timestamp: z.string(),
  traceId: z.string(),
  spanId: z.string(),
  service: z.string(),
  environment: z.string(),
  provider: z.string(),
  model: z.string(),
  operation: z.string(),
  name: z.string(),
  durationMs: z.coerce.number(),
  inputTokens: z.coerce.number(),
  outputTokens: z.coerce.number(),
  totalTokens: z.coerce.number(),
  estimatedTotalCost: z.coerce.number(),
  status: z.string(),
  errorType: z.string().optional(),
});

const promptUsageSchema = z.object({
  timestamp: z.string(),
  promptName: z.string(),
  promptVersion: z.string().optional(),
  calls: z.coerce.number(),
});

const agentRunSchema = z.object({
  timestamp: z.string(),
  agentName: z.string(),
  operation: z.string(),
  runs: z.coerce.number(),
  errors: z.coerce.number(),
});

const toolCallSchema = z.object({
  timestamp: z.string(),
  toolName: z.string(),
  toolType: z.string(),
  calls: z.coerce.number(),
});

const toolErrorSchema = z.object({
  timestamp: z.string(),
  toolName: z.string(),
  errorType: z.string(),
  errors: z.coerce.number(),
});

const retrievalRateSchema = z.object({
  timestamp: z.string(),
  dataSource: z.string(),
  provider: z.string(),
  requests: z.coerce.number(),
  rate: z.coerce.number(),
});

const retrievalErrorSchema = z.object({
  timestamp: z.string(),
  dataSource: z.string(),
  provider: z.string(),
  requests: z.coerce.number(),
  errors: z.coerce.number(),
  errorRate: z.coerce.number(),
});

const traceRowSchema = z.object({
  timestamp: z.string(),
  traceId: z.string(),
  spanId: z.string(),
  service: z.string(),
  environment: z.string(),
  provider: z.string(),
  model: z.string(),
  operation: z.string(),
  name: z.string(),
  promptName: z.string().optional(),
  promptVersion: z.string().optional(),
  agentName: z.string().optional(),
  toolName: z.string().optional(),
  dataSource: z.string().optional(),
  durationMs: z.coerce.number(),
  totalTokens: z.coerce.number(),
  estimatedTotalCost: z.coerce.number(),
  status: z.string(),
  errorType: z.string().optional(),
});

function arrayOf<T extends z.ZodTypeAny>(schema: T) {
  return z.union([z.array(schema), z.null()]).transform((rows) => rows ?? []);
}

type AiParams = Record<string, string | number | readonly string[]>;

const FILTER_PARAM_KEYS: Record<string, string> = {
  provider: "providers",
  model: "models",
  operation: "operations",
  service: "services",
  environment: "environments",
  promptName: "promptNames",
  promptVersion: "promptVersions",
  agentName: "agentNames",
  toolName: "toolNames",
  dataSource: "dataSources",
};

function splitFilterValue(value: string): readonly string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function addValues(params: Record<string, string[]>, key: string, values: readonly string[]) {
  if (values.length === 0) return;
  params[key] = [...(params[key] ?? []), ...values];
}

function buildParams(args: AiQueryArgs): AiParams {
  const arrays: Record<string, string[]> = {};
  for (const filter of args.filters) {
    if (filter.op !== "eq" && filter.op !== "in") continue;
    const values = splitFilterValue(filter.value);
    if (filter.field === "spanType") {
      for (const value of values) {
        addValues(arrays, "operations", operationsForAiSpanType(value));
      }
      continue;
    }
    const paramKey = FILTER_PARAM_KEYS[filter.field];
    if (paramKey) {
      addValues(arrays, paramKey, values);
    }
  }

  const params: AiParams = {
    startTime: args.startTime,
    endTime: args.endTime,
    limit: args.limit ?? 100,
  };
  for (const [key, values] of Object.entries(arrays)) {
    params[key] = Array.from(new Set(values));
  }
  return params;
}

function getArray<T>(path: string, args: AiQueryArgs, schema: z.ZodType<T>) {
  return api
    .get<unknown>(`${BASE}${path}`, { params: buildParams(args) })
    .then((raw) => validateResponse(arrayOf(schema), raw));
}

export const aiObservabilityApi = {
  getFacets(args: AiQueryArgs): Promise<AiFacets> {
    return api
      .get<unknown>(`${BASE}/facets`, { params: buildParams(args) })
      .then((raw) => validateResponse(facetsSchema, raw));
  },
  getLLMRequestRateByModel(args: AiQueryArgs): Promise<readonly AiModelRatePoint[]> {
    return getArray("/llm/request-rate-by-model", args, modelRateSchema);
  },
  getLLMLatencyByModel(args: AiQueryArgs): Promise<readonly AiLatencyPoint[]> {
    return getArray("/llm/latency-by-model", args, modelLatencySchema);
  },
  getLLMErrorRateByModel(args: AiQueryArgs): Promise<readonly AiErrorRatePoint[]> {
    return getArray("/llm/error-rate-by-model", args, errorRateSchema);
  },
  getLLMTokenUsageByModel(args: AiQueryArgs): Promise<readonly AiTokenUsagePoint[]> {
    return getArray("/llm/token-usage-by-model", args, tokenUsageSchema);
  },
  getLLMTokenUsageByProvider(args: AiQueryArgs): Promise<readonly AiTokenUsagePoint[]> {
    return getArray("/llm/token-usage-by-provider", args, tokenUsageSchema);
  },
  getLLMCostByModel(args: AiQueryArgs): Promise<readonly AiCostPoint[]> {
    return getArray("/llm/cost-by-model", args, costSchema);
  },
  getLLMCostByProvider(args: AiQueryArgs): Promise<readonly AiCostPoint[]> {
    return getArray("/llm/cost-by-provider", args, costSchema);
  },
  getTopExpensiveCalls(args: AiQueryArgs): Promise<readonly AiCallRow[]> {
    return getArray("/llm/top-expensive-calls", args, callRowSchema);
  },
  getTopSlowCalls(args: AiQueryArgs): Promise<readonly AiCallRow[]> {
    return getArray("/llm/top-slow-calls", args, callRowSchema);
  },
  getPromptUsageByPrompt(args: AiQueryArgs): Promise<readonly AiPromptUsagePoint[]> {
    return getArray("/prompts/usage-by-prompt", args, promptUsageSchema);
  },
  getPromptUsageByVersion(args: AiQueryArgs): Promise<readonly AiPromptUsagePoint[]> {
    return getArray("/prompts/usage-by-version", args, promptUsageSchema);
  },
  getPromptLatencyByVersion(args: AiQueryArgs): Promise<readonly AiLatencyPoint[]> {
    return getArray("/prompts/latency-by-version", args, modelLatencySchema);
  },
  getPromptTokenUsageByVersion(args: AiQueryArgs): Promise<readonly AiTokenUsagePoint[]> {
    return getArray("/prompts/token-usage-by-version", args, tokenUsageSchema);
  },
  getPromptCostByVersion(args: AiQueryArgs): Promise<readonly AiCostPoint[]> {
    return getArray("/prompts/cost-by-version", args, costSchema);
  },
  getPromptTraces(args: AiQueryArgs): Promise<readonly AiTraceRow[]> {
    return getArray("/prompts/traces", args, traceRowSchema);
  },
  getAgentRunsByAgent(args: AiQueryArgs): Promise<readonly AiAgentRunPoint[]> {
    return getArray("/agents/runs-by-agent", args, agentRunSchema);
  },
  getToolCallsByTool(args: AiQueryArgs): Promise<readonly AiToolCallPoint[]> {
    return getArray("/agents/tool-calls-by-tool", args, toolCallSchema);
  },
  getToolErrorsByTool(args: AiQueryArgs): Promise<readonly AiToolErrorPoint[]> {
    return getArray("/agents/tool-errors-by-tool", args, toolErrorSchema);
  },
  getToolLatencyByTool(args: AiQueryArgs): Promise<readonly AiLatencyPoint[]> {
    return getArray("/agents/tool-latency-by-tool", args, modelLatencySchema);
  },
  getRetrievalRequestRateByStore(args: AiQueryArgs): Promise<readonly AiRetrievalRatePoint[]> {
    return getArray("/retrieval/request-rate-by-store", args, retrievalRateSchema);
  },
  getRetrievalLatencyByStore(args: AiQueryArgs): Promise<readonly AiLatencyPoint[]> {
    return getArray("/retrieval/latency-by-store", args, modelLatencySchema);
  },
  getRetrievalErrorsByStore(args: AiQueryArgs): Promise<readonly AiRetrievalErrorPoint[]> {
    return getArray("/retrieval/errors-by-store", args, retrievalErrorSchema);
  },
  queryTraces(args: AiQueryArgs): Promise<readonly AiTraceRow[]> {
    return getArray("/traces/query", args, traceRowSchema);
  },
};

export function hasUnsupportedAiFilters(filters: readonly ExplorerFilter[]): boolean {
  return filters.some((filter) => filter.field === "search" || filter.field.startsWith("@"));
}
