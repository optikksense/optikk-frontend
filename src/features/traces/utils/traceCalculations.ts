import type { TraceRecord } from "@shared/api/traces/schemas";

export interface TraceStats {
  totalSpans: number;
  duration: number;
  services: Set<string>;
  errors: number;
}

   
                                                           
   
export const calculateTraceStats = (spans: TraceRecord[]): TraceStats => {
  const stats: TraceStats = {
    totalSpans: spans.length,
    duration: 0,
    services: new Set<string>(),
    errors: 0,
  };

  if (spans.length === 0) return stats;

  let minStart = Number.POSITIVE_INFINITY;
  let maxEnd = Number.NEGATIVE_INFINITY;

  spans.forEach((span) => {
    if (span.serviceName) stats.services.add(span.serviceName);
    if (span.status === "ERROR") stats.errors++;

    const start = span.startTime ? new Date(span.startTime).getTime() : 0;
    const end = span.endTime ? new Date(span.endTime).getTime() : 0;

    if (start && start < minStart) minStart = start;
    if (end && end > maxEnd) maxEnd = end;
  });

  if (minStart !== Number.POSITIVE_INFINITY && maxEnd !== Number.NEGATIVE_INFINITY) {
    stats.duration = maxEnd - minStart;
  }

  return stats;
};

export function normalizeSpan(
  span: Partial<TraceRecord> & {
    startNs?: number;
    kind?: string;
    hasError?: boolean;
    statusCode?: string;
    [key: string]: unknown;
  }
): TraceRecord {
  const durationMs = Number(span.durationMs ?? 0);
  const startNsRaw = span.startNs;
  const startNs = typeof startNsRaw === "number" && Number.isFinite(startNsRaw) ? startNsRaw : null;

  let startTime = span.startTime ?? "";
  let endTime = span.endTime ?? "";
  if (startNs != null && startNs > 0) {
    const startMs = startNs / 1_000_000;
    const endMs = startMs + durationMs;
    startTime = new Date(startMs).toISOString();
    endTime = new Date(endMs).toISOString();
  }

  const spanKind = span.spanKind ?? span.kind ?? "";
  const statusFromWire =
    span.hasError === true
      ? "ERROR"
      : typeof span.statusCode === "string" && span.statusCode.toUpperCase().includes("ERROR")
        ? "ERROR"
        : span.statusCode || span.status;

  return {
    ...span,
    spanId: span.spanId as string,
    traceId: span.traceId as string,
    serviceName: span.serviceName ?? "",
    operationName: span.operationName ?? "",
    parentSpanId: span.parentSpanId as string | undefined,
    spanKind: spanKind as string,
    durationMs: durationMs,
    startTime,
    endTime,
    status: (statusFromWire || "OK") as string,
    statusMessage: span.statusMessage as string | undefined,
    httpMethod: span.httpMethod as string | undefined,
    httpUrl: span.httpUrl as string | undefined,
    httpStatusCode: span.httpStatusCode as number | undefined,
    hasError: span.hasError ?? false,
    startNs: startNs ?? 0,
  };
}

function coerceLogTimestamp(ts: unknown): string {
  if (ts == null) return "";
  const s = String(ts);
  if (s.includes("T")) return s;
  try {
    const bi = BigInt(s);
    return new Date(Number(bi / 1_000_000n)).toISOString();
  } catch {
    return s;
  }
}

export function normalizeTraceLog<T extends Record<string, unknown>>(log: T) {
  return {
    ...log,
    timestamp: coerceLogTimestamp(log.timestamp),
    serviceName: log.serviceName,
    traceId: log.traceId,
    spanId: log.spanId,
    level: (log.level as string | undefined) || (log.severityText as string | undefined) || "INFO",
    message: (log.message as string | undefined) || (log.body as string | undefined) || "",
  };
}
