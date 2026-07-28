import { z } from "zod";

   
                                   
  
                                                                           
                                                                           
                                                                            
                                                              
   

   
                                                                              
                                                                    
                                                                   
   
const traceRecordSchema = z.object({
  spanId: z.string(),
  traceId: z.string(),
  serviceName: z.string().default(""),
  operationName: z.string().default(""),
  startTime: z.string().default(""),
  endTime: z.string().default(""),
  durationMs: z.number().default(0),
  status: z.string().default("UNSET"),
  spanKind: z.string().default(""),
  statusMessage: z.string().optional(),
  httpMethod: z.string().optional(),
  httpUrl: z.string().optional(),
  httpStatusCode: z.number().optional(),
  serviceNameOriginal: z.string().optional(),
  parentSpanId: z.string().optional(),
  hasError: z.boolean().default(false),
  startNs: z.number().default(0),
});

                                                                 
export const spanRecordSchema = z.object({
  spanId: z.string(),
  parentSpanId: z.string(),
  traceId: z.string(),
  serviceName: z.string(),
  operationName: z.string(),
  spanKind: z.string(),
  status: z.string(),
  hasError: z.boolean(),
  durationMs: z.number(),
  startNs: z.number(),
});

                                                           
export const traceLogSchema = z.object({
  id: z.string(),
                                                                   
  timestamp: z.string(),
  observedTimestamp: z.string(),
  severityText: z.string(),
  severityNumber: z.number(),
  severityBucket: z.number(),
  body: z.string(),
  traceId: z.string(),
  spanId: z.string(),
  traceFlags: z.number(),
  serviceName: z.string(),
  host: z.string(),
  pod: z.string(),
  container: z.string(),
  environment: z.string(),
  attributesString: z.record(z.string(), z.string()).optional(),
  attributesNumber: z.record(z.string(), z.number()).optional(),
  attributesBool: z.record(z.string(), z.boolean()).optional(),
  scopeName: z.string(),
  scopeVersion: z.string(),
});

                                                                              
const traceLogsResponseSchema = z.object({
  logs: z.array(traceLogSchema).default([]),
  isSpeculative: z.boolean().default(false),
});

                                                                    
export const spanEventSchema = z.object({
  spanId: z.string(),
  traceId: z.string(),
  eventName: z.string(),
  timestamp: z.string(),
  attributes: z.string(),
});

                                                                            
export const criticalPathSpanSchema = z.object({
  spanId: z.string(),
  operationName: z.string(),
  serviceName: z.string(),
  durationMs: z.number(),
});

                                                                      
export const errorPathSpanSchema = z.object({
  spanId: z.string(),
  parentSpanId: z.string(),
  operationName: z.string(),
  serviceName: z.string(),
  status: z.string(),
  statusMessage: z.string(),
  startTime: z.string(),
  durationMs: z.number(),
});

                               
const spanLinkSchema = z.object({
  traceId: z.string(),
  spanId: z.string(),
  traceState: z.string().optional(),
  attributes: z.record(z.string(), z.string()).optional(),
});

                                                                                       
export const spanAttributesSchema = z.object({
  spanId: z.string(),
  traceId: z.string(),
  operationName: z.string(),
  serviceName: z.string(),
  attributesString: z.record(z.string(), z.string()),
  resourceAttributes: z.record(z.string(), z.string()),
  links: z.array(spanLinkSchema).optional(),
  exceptionType: z.string().optional(),
  exceptionMessage: z.string().optional(),
  exceptionStacktrace: z.string().optional(),
  dbSystem: z.string().optional(),
  dbName: z.string().optional(),
  dbStatement: z.string().optional(),
  dbStatementNormalized: z.string().optional(),
  attributes: z.record(z.string(), z.string()).optional(),
});

                                                                   
export const relatedTraceSchema = z.object({
  traceId: z.string(),
  spanId: z.string(),
  operationName: z.string(),
  serviceName: z.string(),
  durationMs: z.number(),
  status: z.string(),
  startTime: z.string(),
});

export type TraceRecord = z.infer<typeof traceRecordSchema>;
export type SpanRecord = z.infer<typeof spanRecordSchema>;
export type TraceLog = z.infer<typeof traceLogSchema>;
export type TraceLogsResponse = z.infer<typeof traceLogsResponseSchema>;
export type SpanEventRecord = z.infer<typeof spanEventSchema>;
export type CriticalPathSpanRecord = z.infer<typeof criticalPathSpanSchema>;
export type ErrorPathSpanRecord = z.infer<typeof errorPathSpanSchema>;
export type SpanAttributesRecord = z.infer<typeof spanAttributesSchema>;
export type RelatedTraceRecord = z.infer<typeof relatedTraceSchema>;

                                         
const traceErrorSpanSchema = z.object({
  spanId: z.string(),
  serviceName: z.string(),
  operationName: z.string(),
  exceptionMessage: z.string().optional(),
  statusMessage: z.string().optional(),
  startTime: z.string(),
  durationMs: z.number(),
});

                                          
export const traceErrorGroupSchema = z.object({
  exceptionType: z.string(),
  count: z.number(),
  spans: z.array(traceErrorSpanSchema),
});

export type TraceErrorGroup = z.infer<typeof traceErrorGroupSchema>;

                                                                                  
const traceSummarySchema = z.object({
  totalTraces: z.number().default(0),
  errorTraces: z.number().default(0),
  avgDuration: z.number().default(0),
  p50Duration: z.number().default(0),
  p95Duration: z.number().default(0),
  p99Duration: z.number().default(0),
});

const tracesResponseSchema = z.object({
  traces: z.array(traceRecordSchema),
  hasMore: z.boolean().optional(),
  nextCursor: z.string().optional(),
  limit: z.number().optional(),
  summary: traceSummarySchema.optional(),
});

export type TracesResponse = z.infer<typeof tracesResponseSchema>;
