import type { LogRecord } from "../types/log";

   
                                                                            
                                                                           
                                         
   
export function getTraceId(log: LogRecord): string | null {
  if (log.traceId) return log.traceId;
  const attrs = log.attributesString;
  if (!attrs) return null;
  const v = attrs.traceId ?? attrs["trace.id"] ?? attrs.traceId ?? attrs.TraceId;
  return v && v.length > 0 ? v : null;
}

export function getSpanId(log: LogRecord): string | null {
  if (log.spanId) return log.spanId;
  const attrs = log.attributesString;
  if (!attrs) return null;
  const v = attrs.spanId ?? attrs["span.id"] ?? attrs.spanId ?? attrs.SpanId;
  return v && v.length > 0 ? v : null;
}
