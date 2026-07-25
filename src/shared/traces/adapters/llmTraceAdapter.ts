import type { TraceRecord } from "@shared/api/traces/schemas";
import type { LlmSpan, LlmTraceDetail } from "../../../features/llm/api/llmApi";
import type { SpanAttributes } from "../types/detail";
import type { SharedLlmTraceData } from "../types/trace";

export type { SharedLlmTraceData };

export function adaptLlmTraceToShared(detail: LlmTraceDetail): {
  traceId: string;
  spans: TraceRecord[];
  stats: {
    totalSpans: number;
    errors: number;
    services: Set<string>;
    durationMs: number;
  };
  traceTimeBounds: {
    startMs: number;
    endMs: number;
  };
  getSpanAttributes: (spanId: string) => SpanAttributes | null;
} {
  const spansSrc =
    detail.spans && detail.spans.length > 0
      ? detail.spans
      : [
          {
            spanId: `${detail.traceId}-root`,
            parentSpanId: "",
            name: detail.name || detail.service,
            service: detail.service,
            operation: detail.name || "chat",
            kind: "chat",
            vendor: "gen_ai",
            model: "",
            startMs: detail.startMs,
            durationMs: detail.durationMs,
            hasError: detail.hasError,
            inputTokens: detail.inputTokens,
            outputTokens: detail.outputTokens,
            cost: detail.cost,
            prompt: detail.prompt,
            completion: detail.output,
          } as LlmSpan,
        ];

  const services = new Set<string>();
  let errorCount = 0;

  const spans: TraceRecord[] = spansSrc.map((s, idx) => {
    services.add(s.service || detail.service);
    if (s.hasError) errorCount += 1;

    const startIso = new Date(s.startMs).toISOString();
    const endIso = new Date(s.startMs + (s.durationMs || 0)).toISOString();

    return {
      traceId: detail.traceId,
      spanId: s.spanId || `span-${idx}`,
      parentSpanId: s.parentSpanId || "",
      serviceName: s.service || detail.service,
      operationName: s.name || s.operation || "gen_ai",
      spanKind: (s.kind || "SPAN").toUpperCase(),
      startTime: startIso,
      endTime: endIso,
      durationMs: s.durationMs || 0,
      status: s.hasError ? "ERROR" : "OK",
      hasError: s.hasError,
      startNs: (s.startMs || 0) * 1_000_000,
      statusMessage: s.hasError ? "Error during LLM execution" : "",
    };
  });

  const spanMap = new Map(spansSrc.map((s) => [s.spanId, s]));

  const getSpanAttributes = (spanId: string): SpanAttributes | null => {
    const s = spanMap.get(spanId) ?? spansSrc[0];
    if (!s) return null;

    const attrStrings: Record<string, string> = {
      "gen_ai.system": s.vendor || "—",
      "gen_ai.request.model": s.model || "—",
      "gen_ai.response.model": s.responseModel || s.model || "—",
      "gen_ai.usage.input_tokens": String(s.inputTokens ?? 0),
      "gen_ai.usage.output_tokens": String(s.outputTokens ?? 0),
      "gen_ai.cost": `$${(s.cost ?? 0).toFixed(4)}`,
      "gen_ai.kind": s.kind || "span",
    };

    const resAttrs: Record<string, string> = {
      "service.name": s.service || detail.service,
    };
    if (detail.environment) resAttrs["deployment.environment"] = detail.environment;
    if (detail.userId) resAttrs["user.id"] = detail.userId;
    if (detail.sessionId) resAttrs["session.id"] = detail.sessionId;
    if (detail.release) resAttrs["service.version"] = detail.release;

    return {
      spanId: s.spanId,
      traceId: detail.traceId,
      operationName: s.name || s.operation,
      serviceName: s.service || detail.service,
      attributesString: attrStrings,
      resourceAttributes: resAttrs,
      attributes: attrStrings,
      exceptionMessage: s.hasError ? "LLM execution returned an error." : undefined,
      llmPrompt: s.prompt || detail.prompt,
      llmCompletion: s.completion || detail.output,
      llmVendor: s.vendor,
      llmModel: s.responseModel || s.model,
      llmInputTokens: s.inputTokens,
      llmOutputTokens: s.outputTokens,
      llmCost: s.cost,
      llmScores: detail.scores,
    };
  };

  const startMs = detail.startMs;
  const endMs = detail.startMs + (detail.durationMs || 0);

  return {
    traceId: detail.traceId,
    spans,
    stats: {
      totalSpans: spans.length,
      errors: errorCount,
      services,
      durationMs: detail.durationMs,
    },
    traceTimeBounds: {
      startMs,
      endMs,
    },
    getSpanAttributes,
  };
}
