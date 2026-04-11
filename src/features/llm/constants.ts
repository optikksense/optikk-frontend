import type { LlmExplorerFacets, LlmSummary } from "./types";

/** Model pricing for client-side cost estimation (USD per 1K tokens). */
export const MODEL_PRICING: Record<string, { inputPer1K: number; outputPer1K: number }> = {
  "gpt-4": { inputPer1K: 0.03, outputPer1K: 0.06 },
  "gpt-4-turbo": { inputPer1K: 0.01, outputPer1K: 0.03 },
  "gpt-4-turbo-preview": { inputPer1K: 0.01, outputPer1K: 0.03 },
  "gpt-4o": { inputPer1K: 0.005, outputPer1K: 0.015 },
  "gpt-4o-mini": { inputPer1K: 0.00015, outputPer1K: 0.0006 },
  "gpt-4.1": { inputPer1K: 0.002, outputPer1K: 0.008 },
  "gpt-4.1-mini": { inputPer1K: 0.0004, outputPer1K: 0.0016 },
  "gpt-4.1-nano": { inputPer1K: 0.0001, outputPer1K: 0.0004 },
  "gpt-3.5-turbo": { inputPer1K: 0.0005, outputPer1K: 0.0015 },
  o3: { inputPer1K: 0.01, outputPer1K: 0.04 },
  "o3-mini": { inputPer1K: 0.00115, outputPer1K: 0.0044 },
  "o4-mini": { inputPer1K: 0.00115, outputPer1K: 0.0044 },
  "claude-opus-4-20250514": { inputPer1K: 0.015, outputPer1K: 0.075 },
  "claude-sonnet-4-20250514": { inputPer1K: 0.003, outputPer1K: 0.015 },
  "claude-3-opus-20240229": { inputPer1K: 0.015, outputPer1K: 0.075 },
  "claude-3-sonnet-20240229": { inputPer1K: 0.003, outputPer1K: 0.015 },
  "claude-3-haiku-20240307": { inputPer1K: 0.00025, outputPer1K: 0.00125 },
  "claude-3-5-sonnet-20241022": { inputPer1K: 0.003, outputPer1K: 0.015 },
  "claude-3-5-haiku-20241022": { inputPer1K: 0.0008, outputPer1K: 0.004 },
  "gemini-1.5-pro": { inputPer1K: 0.00125, outputPer1K: 0.005 },
  "gemini-1.5-flash": { inputPer1K: 0.000075, outputPer1K: 0.0003 },
  "gemini-2.0-flash": { inputPer1K: 0.0001, outputPer1K: 0.0004 },
  "gemini-2.5-pro": { inputPer1K: 0.00125, outputPer1K: 0.01 },
  "gemini-2.5-flash": { inputPer1K: 0.00015, outputPer1K: 0.0006 },
};

export const LLM_FILTER_FIELDS = [
  { key: "provider", label: "Provider", type: "string" as const },
  { key: "model", label: "Model", type: "string" as const },
  { key: "operation", label: "Operation", type: "string" as const },
  { key: "service_name", label: "Service", type: "string" as const },
  { key: "prompt", label: "Prompt template", type: "string" as const },
  { key: "session", label: "Session", type: "string" as const },
  { key: "status", label: "Status", type: "string" as const },
  { key: "finish_reason", label: "Finish reason", type: "string" as const },
];

export const LLM_ANALYTICS_FIELDS = [
  { name: "gen_ai.system", description: "Provider" },
  { name: "gen_ai.request.model", description: "Model" },
  { name: "gen_ai.operation.name", description: "Operation" },
  { name: "service", description: "Service" },
  { name: "status", description: "Status" },
];

export const LLM_METRIC_FIELDS = [
  { value: "gen_ai.usage.input_tokens", label: "Input tokens" },
  { value: "gen_ai.usage.output_tokens", label: "Output tokens" },
  { value: "gen_ai.usage.total_tokens", label: "Total tokens" },
  { value: "duration_ms", label: "Latency (ms)" },
];

export const EMPTY_LLM_FACETS: LlmExplorerFacets = {
  ai_system: [],
  ai_model: [],
  ai_operation: [],
  service_name: [],
  status: [],
  finish_reason: [],
  prompt_template: [],
};

export const EMPTY_LLM_SUMMARY: LlmSummary = {
  total_calls: 0,
  error_calls: 0,
  avg_latency_ms: 0,
  p50_latency_ms: 0,
  p95_latency_ms: 0,
  p99_latency_ms: 0,
  total_input_tokens: 0,
  total_output_tokens: 0,
};
