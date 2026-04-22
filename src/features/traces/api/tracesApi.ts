/**
 * Retargeted shim — preserves the legacy `tracesApi.getTraces` / `getTraceSpans`
 * signatures used by overview dashboards (ServicePage, deployment-compare)
 * while forwarding requests through the new `tracesExplorerApi.query`.
 *
 * Dashboards use a narrow slice of params (services, status, limit, offset);
 * this file translates that shape into the `ExplorerFilter[]` the new
 * backend querycompiler accepts. Keep external signatures stable.
 */
import type { TraceRecord, TracesResponse } from "@shared/entities/trace/model";
import { tracesService } from "@shared/api/tracesService";

import type { ExplorerFilter } from "@/features/explorer/types";

import { tracesExplorerApi } from "./tracesExplorerApi";
import type { TraceSummary } from "../types/trace";

export interface LegacyTracesQueryParams {
  readonly services?: readonly string[];
  readonly status?: string;
  readonly limit?: number;
  readonly offset?: number;
}

function buildFilters(params: LegacyTracesQueryParams): ExplorerFilter[] {
  const filters: ExplorerFilter[] = [];
  for (const service of params.services ?? []) {
    if (service) {
      filters.push({ field: "service_name", op: "eq", value: service });
    }
  }
  if (params.status) {
    filters.push({ field: "status", op: "eq", value: params.status });
  }
  return filters;
}

function toTraceRecord(summary: TraceSummary): TraceRecord {
  return {
    span_id: "",
    trace_id: summary.trace_id,
    service_name: summary.root_service,
    operation_name: summary.root_operation,
    start_time: new Date(summary.start_ms).toISOString(),
    end_time: new Date(summary.end_ms).toISOString(),
    duration_ms: summary.duration_ns / 1_000_000,
    status: summary.root_status,
    span_kind: "SERVER",
    http_method: summary.root_http_method,
    http_status_code: summary.root_http_status,
  };
}

async function getTraces(
  _teamId: number | null,
  startTime: number,
  endTime: number,
  params: LegacyTracesQueryParams = {}
): Promise<TracesResponse> {
  const response = await tracesExplorerApi.query({
    startTime,
    endTime,
    filters: buildFilters(params),
    limit: params.limit ?? 50,
    include: ["summary"],
  });
  return {
    traces: response.traces.map(toTraceRecord),
    has_more: Boolean(response.nextCursor),
    next_cursor: response.nextCursor,
    limit: params.limit,
    summary: response.summary
      ? {
          total_traces: response.summary.total,
          error_traces: response.summary.errors,
          avg_duration: 0,
          p50_duration: 0,
          p95_duration: 0,
          p99_duration: 0,
        }
      : undefined,
  };
}

/** TraceDetailPage still owns the spans endpoint via `tracesService`; forward. */
function getTraceSpans(teamId: number | null, traceId: string) {
  return tracesService.getTraceSpans(teamId, traceId);
}

export const tracesApi = { getTraces, getTraceSpans };
