import type { TraceLog } from "@shared/api/traces/schemas";

import { coerceTimestampToIso } from "../api/logsQueryApi";
import type { LogRecord } from "../types/log";

   
                                                                       
                                                                           
                                                                               
                                                                             
                                   
   
export function traceLogToLogRecord(log: TraceLog): LogRecord {
  return {
    id: log.id,
    timestamp: coerceTimestampToIso(log.timestamp),
    observedTimestamp: coerceTimestampToIso(log.observedTimestamp),
    serviceName: log.serviceName,
    severityText: log.severityText,
    severityBucket: log.severityBucket,
    body: log.body,
    host: log.host,
    pod: log.pod,
    container: log.container,
    environment: log.environment,
    scopeName: log.scopeName,
    scopeVersion: log.scopeVersion,
    traceId: log.traceId,
    spanId: log.spanId,
    attributesString: log.attributesString,
    attributesNumber: log.attributesNumber,
    attributesBool: log.attributesBool,
  };
}
