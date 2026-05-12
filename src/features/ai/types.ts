import type { ExplorerFilter } from "@/features/explorer/types/filters";

export type AiTabId = "models" | "prompts" | "agents" | "retrieval" | "traces";

export interface AiQueryArgs {
  readonly startTime: number;
  readonly endTime: number;
  readonly filters: readonly ExplorerFilter[];
  readonly limit?: number;
}

export interface AiModelRatePoint {
  readonly timestamp: string;
  readonly provider: string;
  readonly model: string;
  readonly operation: string;
  readonly requests: number;
  readonly rate: number;
}

export interface AiLatencyPoint {
  readonly timestamp: string;
  readonly provider?: string;
  readonly model?: string;
  readonly operation?: string;
  readonly promptName?: string;
  readonly promptVersion?: string;
  readonly toolName?: string;
  readonly toolType?: string;
  readonly dataSource?: string;
  readonly avgMs: number;
  readonly p50Ms: number;
  readonly p95Ms: number;
  readonly p99Ms: number;
}

export interface AiErrorRatePoint {
  readonly timestamp: string;
  readonly provider: string;
  readonly model: string;
  readonly operation: string;
  readonly requests: number;
  readonly errors: number;
  readonly errorRate: number;
}

export interface AiTokenUsagePoint {
  readonly timestamp: string;
  readonly provider?: string;
  readonly model?: string;
  readonly operation?: string;
  readonly promptName?: string;
  readonly promptVersion?: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly totalTokens: number;
}

export interface AiCostPoint {
  readonly timestamp: string;
  readonly provider?: string;
  readonly model?: string;
  readonly operation?: string;
  readonly promptName?: string;
  readonly promptVersion?: string;
  readonly estimatedInputCost: number;
  readonly estimatedOutputCost: number;
  readonly estimatedTotalCost: number;
}

export interface AiCallRow {
  readonly timestamp: string;
  readonly traceId: string;
  readonly spanId: string;
  readonly service: string;
  readonly environment: string;
  readonly provider: string;
  readonly model: string;
  readonly operation: string;
  readonly name: string;
  readonly durationMs: number;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly totalTokens: number;
  readonly estimatedTotalCost: number;
  readonly status: string;
  readonly errorType?: string;
}

export interface AiPromptUsagePoint {
  readonly timestamp: string;
  readonly promptName: string;
  readonly promptVersion?: string;
  readonly calls: number;
}

export interface AiAgentRunPoint {
  readonly timestamp: string;
  readonly agentName: string;
  readonly operation: string;
  readonly runs: number;
  readonly errors: number;
}

export interface AiToolCallPoint {
  readonly timestamp: string;
  readonly toolName: string;
  readonly toolType: string;
  readonly calls: number;
}

export interface AiToolErrorPoint {
  readonly timestamp: string;
  readonly toolName: string;
  readonly errorType: string;
  readonly errors: number;
}

export interface AiRetrievalRatePoint {
  readonly timestamp: string;
  readonly dataSource: string;
  readonly provider: string;
  readonly requests: number;
  readonly rate: number;
}

export interface AiRetrievalErrorPoint {
  readonly timestamp: string;
  readonly dataSource: string;
  readonly provider: string;
  readonly requests: number;
  readonly errors: number;
  readonly errorRate: number;
}

export interface AiTraceRow {
  readonly timestamp: string;
  readonly traceId: string;
  readonly spanId: string;
  readonly service: string;
  readonly environment: string;
  readonly provider: string;
  readonly model: string;
  readonly operation: string;
  readonly name: string;
  readonly promptName?: string;
  readonly promptVersion?: string;
  readonly agentName?: string;
  readonly toolName?: string;
  readonly dataSource?: string;
  readonly durationMs: number;
  readonly totalTokens: number;
  readonly estimatedTotalCost: number;
  readonly status: string;
  readonly errorType?: string;
}

export interface AiFacetBucket {
  readonly value: string;
  readonly count: number;
}

export interface AiFacets {
  readonly providers: readonly AiFacetBucket[];
  readonly models: readonly AiFacetBucket[];
  readonly operations: readonly AiFacetBucket[];
  readonly services: readonly AiFacetBucket[];
  readonly environments: readonly AiFacetBucket[];
  readonly promptNames: readonly AiFacetBucket[];
  readonly agentNames: readonly AiFacetBucket[];
  readonly toolNames: readonly AiFacetBucket[];
  readonly dataSources: readonly AiFacetBucket[];
}
