/**
 * AI feature domain types.
 */
export interface LLMRun {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  serviceName: string;
  operationName: string;
  model: string;
  provider?: string;
  operationType?: string;
  startTime: string;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  hasError: boolean;
  statusMessage?: string;
  finishReason?: string;
  inputPreview?: string;
  outputPreview?: string;
  spanKind: string;
}

export interface LLMRunSummary {
  totalRuns: number;
  errorRuns: number;
  errorRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  totalTokens: number;
  uniqueModels: number;
}

export interface LLMRunModel {
  model: string;
  provider?: string;
}

export interface LLMRunOperation {
  operationType: string;
}

export interface LLMRunDetail {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  serviceName: string;
  operationName: string;
  model: string;
  provider?: string;
  operationType?: string;
  startTime: string;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  hasError: boolean;
  statusMessage?: string;
  finishReason?: string;
  spanKind: string;
  attributes?: Record<string, string>;
}

export interface LLMMessage {
  role: string;
  content: string;
  type: "prompt" | "completion";
}

export interface ChainSpan {
  spanId: string;
  parentSpanId?: string;
  serviceName: string;
  operationName: string;
  startTime: string;
  durationMs: number;
  hasError: boolean;
  spanKind: string;
  role: string;
  model?: string;
}

export interface LLMRunContext {
  ancestors: ChainSpan[];
  current: ChainSpan;
  children: ChainSpan[];
}

export interface LLMTraceSpan {
  spanId: string;
  parentSpanId?: string;
  serviceName: string;
  operationName: string;
  startTime: string;
  durationMs: number;
  hasError: boolean;
  spanKind: string;
  role: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface LLMTraceSummary {
  totalSpans: number;
  llmCalls: number;
  toolCalls: number;
  totalTokens: number;
  modelsUsed: string[];
  totalMs: number;
  llmMs: number;
  llmTimePct: number;
  hasErrors: boolean;
  serviceCount: number;
}

export interface Conversation {
  conversationId: string;
  serviceName: string;
  model: string;
  turnCount: number;
  totalTokens: number;
  firstTurn: string;
  lastTurn: string;
  hasErrors: boolean;
}

export interface ConversationTurn {
  spanId: string;
  traceId: string;
  model: string;
  operationType?: string;
  startTime: string;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  hasError: boolean;
  inputPreview?: string;
  outputPreview?: string;
}

export interface LLMRunFilters {
  models?: string[];
  providers?: string[];
  operations?: string[];
  services?: string[];
  status?: string;
  minDurationMs?: number;
  maxDurationMs?: number;
  minTokens?: number;
  maxTokens?: number;
  traceId?: string;
  limit?: number;
  cursorTimestamp?: string;
  cursorSpanId?: string;
}
