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

export interface AiInsightSummary {
  totalRequests: number;
  avgQps: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  timeoutCount: number;
  errorCount: number;
  totalTokens: number;
  totalCostUsd: number;
  avgCostPerQuery: number;
  cacheHitRate: number;
  piiDetectionRate: number;
  guardrailBlockRate: number;
  avgTokensPerSec: number;
  activeModels: number;
}

export interface AiPerformanceMetric {
  modelName: string;
  modelProvider: string;
  requestType: string;
  totalRequests: number;
  avgQps: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  maxLatencyMs: number;
  timeoutCount: number;
  errorCount: number;
  timeoutRate: number;
  errorRate: number;
  avgTokensPerSec: number;
  avgRetryCount: number;
}

export interface AiPerformanceTimeSeries {
  modelName: string;
  timestamp: string;
  requestCount: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  timeoutCount: number;
  errorCount: number;
  tokensPerSec: number;
}

export interface AiCostMetric {
  modelName: string;
  modelProvider: string;
  totalRequests: number;
  totalCostUsd: number;
  avgCostPerQuery: number;
  maxCostPerQuery: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  avgPromptTokens: number;
  avgCompletionTokens: number;
  cacheHitRate: number;
  totalCacheTokens: number;
}

export interface AiCostTimeSeries {
  modelName: string;
  timestamp: string;
  costPerInterval: number;
  promptTokens: number;
  completionTokens: number;
  requestCount: number;
}

export interface AiTokenBreakdown {
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  systemTokens: number;
  cacheTokens: number;
}

export interface AiSecurityMetric {
  modelName: string;
  modelProvider: string;
  totalRequests: number;
  piiDetectedCount: number;
  piiDetectionRate: number;
  guardrailBlockedCount: number;
  guardrailBlockRate: number;
  contentPolicyCount: number;
  contentPolicyRate: number;
}

export interface AiSecurityTimeSeries {
  modelName: string;
  timestamp: string;
  totalRequests: number;
  piiCount: number;
  guardrailCount: number;
  contentPolicyCount: number;
}

export interface AiPiiCategory {
  modelName: string;
  piiCategories: string;
  detectionCount: number;
}

export interface AiModelInsight {
  modelName: string;
  modelProvider: string;
  totalRequests: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  errorRate: number;
  totalCostUsd: number;
  totalTokens: number;
  piiDetectionRate: number;
  guardrailBlockRate: number;
  avgTokensPerSec: number;
}

export interface AiPrompt {
  id: string;
  teamId: number;
  name: string;
  slug: string;
  description: string;
  modelProvider: string;
  modelName: string;
  systemPrompt: string;
  userTemplate: string;
  tags: string[];
  latestVersion: number;
  activeVersionId?: string;
  updatedAt: string;
  createdAt: string;
}

export interface AiPromptVersion {
  id: string;
  promptId: string;
  versionNumber: number;
  changelog: string;
  systemPrompt: string;
  userTemplate: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
}

export interface AiDataset {
  id: string;
  teamId: number;
  name: string;
  description: string;
  tags: string[];
  itemCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface AiDatasetItem {
  id: string;
  datasetId: string;
  input: Record<string, unknown>;
  expectedOutput: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AiFeedback {
  id: string;
  teamId: number;
  targetType: "run" | "prompt" | "dataset-item" | "eval-run" | "experiment-run";
  targetId: string;
  runSpanId?: string;
  traceId?: string;
  score: number;
  label: string;
  comment: string;
  createdBy: string;
  createdAt: string;
}

export interface AiEvalSuite {
  id: string;
  teamId: number;
  name: string;
  description: string;
  promptId: string;
  datasetId: string;
  judgeModel: string;
  status: "draft" | "active" | "paused";
  updatedAt: string;
  createdAt: string;
}

export interface AiEvalRun {
  id: string;
  evalId: string;
  promptVersionId: string;
  datasetId: string;
  status: "queued" | "running" | "completed" | "failed";
  averageScore: number;
  passRate: number;
  totalCases: number;
  completedCases: number;
  summary: Record<string, unknown>;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
}

export interface AiEvalScore {
  id: string;
  evalRunId: string;
  datasetItemId: string;
  score: number;
  resultLabel: string;
  reason: string;
  outputText: string;
  createdAt: string;
}

export interface AiExperiment {
  id: string;
  teamId: number;
  name: string;
  description: string;
  datasetId: string;
  status: "draft" | "running" | "paused" | "completed";
  updatedAt: string;
  createdAt: string;
}

export interface AiExperimentVariant {
  id: string;
  experimentId: string;
  promptVersionId: string;
  label: string;
  weight: number;
  createdAt: string;
}

export interface AiExperimentRun {
  id: string;
  experimentId: string;
  status: "queued" | "running" | "completed" | "failed";
  winnerVariantId?: string;
  summary: Record<string, unknown>;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
}

export type AiDrawerEntity =
  | "model"
  | "run"
  | "conversation"
  | "prompt"
  | "dataset"
  | "dataset-item"
  | "eval"
  | "eval-run"
  | "experiment"
  | "experiment-run"
  | "feedback";

export interface AiSavedView {
  id: string;
  label: string;
  description: string;
}
