import { z } from "zod";

import type { ExplorerFilter } from "@features/explorer/types/filters";
import { api } from "@shared/api/api/client";
import { validateResponse } from "@shared/api/utils/validate";

import type { LogRecord, LogsQueryResponse } from "../types/log";
import { buildLogsFilters } from "./buildLogsFilters";

export const rawLogRowSchema = z.object({
  id: z.string().optional(),
  log_id: z.string().optional(),
  timestamp: z.union([z.string(), z.number()]),
  observed_timestamp: z.union([z.string(), z.number()]).optional(),
  severity_text: z.string().optional(),
  severity_number: z.coerce.number().optional(),
  severity_bucket: z.coerce.number(),
  body: z.string(),
  trace_id: z.string().optional(),
  span_id: z.string().optional(),
  trace_flags: z.coerce.number().optional(),
  service_name: z.string(),
  host: z.string().optional(),
  pod: z.string().optional(),
  container: z.string().optional(),
  environment: z.string().optional(),
  attributes_string: z.record(z.string(), z.string()).optional(),
  attributes_number: z.record(z.string(), z.number()).optional(),
  attributes_bool: z.record(z.string(), z.boolean()).optional(),
  scope_name: z.string().optional(),
  scope_version: z.string().optional(),
});

const pageInfoSchema = z
  .object({
    hasMore: z.boolean().optional(),
    nextCursor: z.string().optional(),
    limit: z.coerce.number().optional(),
  })
  .optional();

function tsToNsString(ts: string | number): string {
  if (typeof ts === "number") return String(Math.round(ts));
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

function fallbackLogId(row: z.infer<typeof rawLogRowSchema>): string {
  const payload = `${row.trace_id ?? ""}:${row.span_id ?? ""}:${tsToNsString(row.timestamp)}`;
  return base64UrlEncodeUtf8(payload);
}

function coerceTimestampToIso(ts: string | number): string {
  if (typeof ts === "string") {
    if (ts.includes("T")) return ts;
    try {
      const bi = BigInt(ts);
      return new Date(Number(bi / 1_000_000n)).toISOString();
    } catch {
      return ts;
    }
  }
  return new Date(ts / 1_000_000).toISOString();
}

export function normalizeLogRecord(row: z.infer<typeof rawLogRowSchema>): LogRecord {
  const id = row.id || row.log_id || fallbackLogId(row);
  return {
    id,
    timestamp: coerceTimestampToIso(row.timestamp),
    observed_timestamp:
      row.observed_timestamp != null ? coerceTimestampToIso(row.observed_timestamp) : undefined,
    service_name: row.service_name,
    severity_text: row.severity_text,
    severity_bucket: row.severity_bucket,
    body: row.body,
    host: row.host,
    pod: row.pod,
    container: row.container,
    environment: row.environment,
    scope_name: row.scope_name,
    scope_version: row.scope_version,
    trace_id: row.trace_id,
    span_id: row.span_id,
    attributes_string: row.attributes_string,
    attributes_number: row.attributes_number,
    attributes_bool: row.attributes_bool,
  };
}

const queryResponseSchema = z
  .object({
    results: z.array(rawLogRowSchema),
    pageInfo: pageInfoSchema,
  })
  .transform((r): LogsQueryResponse => ({
    results: r.results.map(normalizeLogRecord),
    cursor: r.pageInfo?.nextCursor || undefined,
    hasMore: r.pageInfo?.hasMore ?? false,
  }));

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
  const raw = await api.post<unknown>("/v1/logs/query", body);
  return validateResponse(queryResponseSchema, raw);
}
