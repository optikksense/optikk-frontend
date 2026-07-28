import { z } from "zod";

import { API_CONFIG } from "@config/apiConfig";
import { api } from "@shared/api/http/client";
import { validateResponse } from "@shared/api/utils/validate";
import { pageInfoSchema } from "@shared/search/schemas/pageInfo";
import type { ExplorerFilter } from "@shared/search/types/filters";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

import type { LogRecord, LogsQueryResponse } from "../types/log";
import { buildLogsFilters } from "./buildLogsFilters";

   
                                                                               
                                                            
   
export const rawLogRowSchema = z.object({
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

function tsToNsString(ts: string): string {
  if (ts.includes("T")) {
    const ms = Date.parse(ts);
    if (!Number.isNaN(ms)) return String(BigInt(ms) * 1_000_000n);
  }
  return ts;
}

function base64UrlEncodeUtf8(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

                                                                             
function fallbackLogId(row: z.infer<typeof rawLogRowSchema>): string {
  const payload = `${row.traceId}:${row.spanId}:${tsToNsString(row.timestamp)}:${
    row.serviceName
  }:${fnv1a(row.body)}`;
  return base64UrlEncodeUtf8(payload);
}

export function coerceTimestampToIso(ts: string): string {
  if (ts.includes("T")) return ts;
  try {
    const bi = BigInt(ts);
    return new Date(Number(bi / 1_000_000n)).toISOString();
  } catch {
    return ts;
  }
}

export function normalizeLogRecord(row: z.infer<typeof rawLogRowSchema>): LogRecord {
  const id = row.id || fallbackLogId(row);
  return {
    id,
    timestamp: coerceTimestampToIso(row.timestamp),
    observedTimestamp: coerceTimestampToIso(row.observedTimestamp),
    serviceName: row.serviceName,
    severityText: row.severityText,
    severityBucket: row.severityBucket,
    body: row.body,
    host: row.host,
    pod: row.pod,
    container: row.container,
    environment: row.environment,
    scopeName: row.scopeName,
    scopeVersion: row.scopeVersion,
    traceId: row.traceId,
    spanId: row.spanId,
    attributesString: row.attributesString,
    attributesNumber: row.attributesNumber,
    attributesBool: row.attributesBool,
  };
}

const queryResponseSchema = z
  .object({
    results: z.array(rawLogRowSchema),
    pageInfo: pageInfoSchema,
  })
  .transform(
    (r): LogsQueryResponse => ({
      results: r.results.map(normalizeLogRecord),
      cursor: r.pageInfo.nextCursor || undefined,
      hasMore: r.pageInfo.hasMore,
    })
  );

export interface QueryLogsArgs {
  readonly startTime: number;
  readonly endTime: number;
  readonly filters: readonly ExplorerFilter[];
  readonly cursor?: string;
  readonly limit?: number;
}

export async function queryLogs(args: QueryLogsArgs): Promise<LogsQueryResponse> {
  const { body } = buildLogsFilters(args.filters, args.startTime, args.endTime, {
    cursor: args.cursor,
    limit: args.limit ?? 100,
  });
  const raw = await api.post<unknown>(`${V1}/logs/query`, body);
  const parsed = validateResponse(queryResponseSchema, raw);
  return dedupeRows(enforceIdFilters(parsed, body));
}

function dedupeRows(resp: LogsQueryResponse): LogsQueryResponse {
  const seen = new Set<string>();
  const out: LogRecord[] = [];
  for (const r of resp.results) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  if (out.length === resp.results.length) return resp;
  return { ...resp, results: out };
}

function enforceIdFilters(
  resp: LogsQueryResponse,
  body: { traceId?: string; spanId?: string }
): LogsQueryResponse {
  const traceFilter = body.traceId;
  const spanFilter = body.spanId;
  if (!traceFilter && !spanFilter) return resp;
  const filtered = resp.results.filter(
    (r) => (!traceFilter || r.traceId === traceFilter) && (!spanFilter || r.spanId === spanFilter)
  );
  if (filtered.length !== resp.results.length) {
    console.warn(
      `[logs/query] Backend returned ${resp.results.length - filtered.length} row(s) that do not match the active id filter`,
      { traceFilter, spanFilter, returned: resp.results.length, kept: filtered.length }
    );
  }
  return { ...resp, results: filtered };
}
