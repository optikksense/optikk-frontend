/**
 * AI Observability — Domain Types.
 * Maps 1:1 to backend API response DTOs.
 */

// -------- Overview --------

export interface AiSummary {
  totalRequests: number;
  errorCount: number;
  errorRate: number;
  avgLatencyMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  avgTokensPerSec: number;
  uniqueModels: number;
  uniqueServices: number;
  uniqueOperations: number;
}

export interface AiModelSummary {
  model: string;
  provider: string;
  requestCount: number;
  avgLatencyMs: number;
  p95Ms: number;
  errorCount: number;
  errorRate: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  tokensPerSec: number;
}

export interface AiOperationSummary {
  operation: string;
  requestCount: number;
  avgLatencyMs: number;
  errorCount: number;
  errorRate: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AiServiceSummary {
  serviceName: string;
  requestCount: number;
  models: string;
  errorCount: number;
}

export interface AiModelHealth {
  model: string;
  provider: string;
  requestCount: number;
  avgLatencyMs: number;
  p95Ms: number;
  errorRate: number;
  health: "healthy" | "degraded" | "critical";
}

export interface AiTopSlow {
  model: string;
  operation: string;
  p95Ms: number;
  requestCount: number;
}

export interface AiTopError {
  model: string;
  operation: string;
  errorCount: number;
  errorRate: number;
  requestCount: number;
}

export interface AiFinishReason {
  finishReason: string;
  count: number;
  percentage: number;
}

export interface AiTimeseriesPoint {
  timestamp: string;
  series: string;
  value: number;
}

export interface AiTimeseriesDualPoint {
  timestamp: string;
  series: string;
  value1: number;
  value2: number;
}

// -------- Explorer --------

export interface AiSpan {
  spanId: string;
  traceId: string;
  parentSpanId: string;
  serviceName: string;
  operationName: string;
  model: string;
  provider: string;
  operationType: string;
  timestamp: string;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  hasError: boolean;
  statusMessage: string;
  finishReason: string;
  temperature: number;
}

export interface AiFacetValue {
  value: string;
  count: number;
}

export interface AiFacets {
  models: { values: AiFacetValue[] };
  providers: { values: AiFacetValue[] };
  operations: { values: AiFacetValue[] };
  services: { values: AiFacetValue[] };
  finishReasons: { values: AiFacetValue[] };
}

export interface AiExplorerSummary {
  totalSpans: number;
  errorCount: number;
  avgLatencyMs: number;
  p95Ms: number;
  totalTokens: number;
  uniqueModels: number;
}

export interface AiHistogramPoint {
  timestamp: string;
  count: number;
}

// -------- Span Detail --------

export interface AiSpanDetail {
  spanId: string;
  traceId: string;
  parentSpanId: string;
  serviceName: string;
  operationName: string;
  kindString: string;
  timestamp: string;
  durationMs: number;
  hasError: boolean;
  statusMessage: string;
  model: string;
  responseModel: string;
  provider: string;
  operationType: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  frequencyPenalty: number;
  presencePenalty: number;
  seed: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  tokensPerSec: number;
  finishReason: string;
  responseId: string;
  serverAddress: string;
  conversationId: string;
}

export interface AiMessage {
  role: string;
  content: string;
}

export interface AiTraceContextSpan {
  spanId: string;
  parentSpanId: string;
  serviceName: string;
  operationName: string;
  kindString: string;
  timestamp: string;
  durationMs: number;
  hasError: boolean;
  isAi: boolean;
}

export interface AiRelatedSpan {
  spanId: string;
  timestamp: string;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  hasError: boolean;
  finishReason: string;
}

export interface AiTokenBreakdown {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  avgInputModel: number;
  avgOutputModel: number;
}

// -------- Analytics --------

export interface AiModelCatalogEntry {
  model: string;
  provider: string;
  requestCount: number;
  avgLatencyMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  errorRate: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  tokensPerSec: number;
  topOperations: string;
  topServices: string;
  estimatedCost: number;
  health: "healthy" | "degraded" | "critical";
}

export interface AiLatencyBucket {
  model: string;
  bucketMs: number;
  count: number;
}

export interface AiParamImpact {
  temperature: number;
  avgLatency: number;
  errorRate: number;
  count: number;
}

export interface AiModelTimeseries {
  timestamp: string;
  requestCount: number;
  avgLatencyMs: number;
  p95Ms: number;
  errorRate: number;
  inputTokens: number;
  outputTokens: number;
}

export interface AiCostSummary {
  totalEstimatedCost: number;
  costPerRequest: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  byModel: AiModelCost[];
}

export interface AiModelCost {
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
}

export interface AiCostTimeseriesPoint {
  timestamp: string;
  model: string;
  estimatedCost: number;
}

export interface AiTokenEconomics {
  totalInput: number;
  totalOutput: number;
  inputOutputRatio: number;
  avgTokensPerRequest: number;
  requestCount: number;
}

export interface AiErrorPattern {
  model: string;
  operation: string;
  statusMessage: string;
  errorCount: number;
  firstSeen: string;
  lastSeen: string;
}

export interface AiErrorTimeseriesPoint {
  timestamp: string;
  model: string;
  errorCount: number;
  errorRate: number;
}

export interface AiFinishReasonTrend {
  timestamp: string;
  finishReason: string;
  count: number;
}

export interface AiConversation {
  conversationId: string;
  serviceName: string;
  model: string;
  turnCount: number;
  totalTokens: number;
  hasError: boolean;
  firstTurn: string;
  lastTurn: string;
}

export interface AiConversationTurn {
  spanId: string;
  timestamp: string;
  model: string;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  hasError: boolean;
  finishReason: string;
}

export interface AiConversationSummary {
  turnCount: number;
  totalTokens: number;
  totalMs: number;
  models: string;
  errorTurns: number;
  firstTurn: string;
  lastTurn: string;
}

// -------- Common filter params --------

export interface AiFilterParams {
  service?: string;
  model?: string;
  operation?: string;
  provider?: string;
}

export interface AiExplorerFilterParams extends AiFilterParams {
  status?: "error" | "ok";
  finishReason?: string;
  minDurationMs?: number;
  maxDurationMs?: number;
  traceId?: string;
  limit?: number;
  offset?: number;
  sort?: "timestamp" | "duration" | "tokens";
  sortDir?: "asc" | "desc";
}
