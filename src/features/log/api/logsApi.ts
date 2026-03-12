import { z } from 'zod';
import { logsService } from '@shared/api/logsService';
import { logEntrySchema, type LogEntry } from '@entities/log/model';
import type { TeamId } from '@shared/types/branded';
import type { QueryParams, RequestTime } from '@shared/api/service-types';

/**
 * Normalized backend parameters for logs.
 */
export interface LogsBackendParams extends QueryParams {
  limit?: number;
  offset?: number;
  search?: string;
  severities?: string[];
  excludeSeverities?: string[];
  services?: string[];
  excludeServices?: string[];
  hosts?: string[];
  excludeHosts?: string[];
  pods?: string[];
  containers?: string[];
  loggers?: string[];
  traceId?: string;
  spanId?: string;
}

export const logsStatsSchema = z.object({
  total: z.number(),
  fields: z.object({
    // Backend returns severity_text and service
    severity_text: z.array(z.object({ value: z.string(), count: z.number() })).optional(),
    service: z.array(z.object({ value: z.string(), count: z.number() })).optional(),
    // Legacy / Frontend aliases
    level: z.array(z.object({ value: z.string(), count: z.number() })).optional(),
    service_name: z.array(z.object({ value: z.string(), count: z.number() })).optional(),
  }),
}).passthrough();

export type LogsStats = z.infer<typeof logsStatsSchema>;

export const logsVolumeSchema = z.object({
  step: z.string(),
  buckets: z.array(z.object({
    time_bucket: z.string(),
    total: z.number(),
    errors: z.number(),
    warnings: z.number(),
    infos: z.number(),
    debugs: z.number(),
    fatals: z.number(),
  })),
}).passthrough();

export const logsAggregateRowSchema = z.object({
  time_bucket: z.string(),
  group_value: z.string(),
  count: z.number(),
  error_rate: z.number().optional(),
});

export const logsAggregateSchema = z.object({
  group_by: z.string(),
  step: z.string(),
  metric: z.string(),
  rows: z.array(logsAggregateRowSchema),
}).passthrough();

export type LogsAggregate = z.infer<typeof logsAggregateSchema>;
export type LogsAggregateRow = z.infer<typeof logsAggregateRowSchema>;

export type LogsVolume = z.infer<typeof logsVolumeSchema>;

/**
 * Normalizes a parsed log entry, ensuring legacy frontend fields
 * (level, message, service) are populated from OTLP fields if missing.
 */
function normalizeLog(raw: z.infer<typeof logEntrySchema>): LogEntry {
  return {
    ...raw,
    // Prefer snake_case primary fields, fall back to legacy camelCase aliases
    level: raw.severity_text ?? raw.level ?? raw.severityText ?? '',
    message: raw.body ?? raw.message ?? '',
    service: raw.service_name ?? raw.service ?? raw.serviceName ?? '',
    service_name: raw.service_name ?? raw.service ?? raw.serviceName ?? '',
    trace_id: raw.trace_id ?? raw.traceId ?? '',
    span_id: raw.span_id ?? raw.spanId ?? '',
  };
}

/**
 * Log Feature API wrapper.
 * Integrates Zod validation and branded types for strict API boundaries.
 */
export const logsApi = {
  getLogs: async (params: {
    teamId: TeamId | null;
    startTime: RequestTime;
    endTime: RequestTime;
    backendParams?: LogsBackendParams;
  }): Promise<{ logs: LogEntry[]; total: number }> => {
    const response = await logsService.getLogs(
      params.teamId,
      params.startTime,
      params.endTime,
      params.backendParams
    ) as any;

    const parsedLogs = z.array(logEntrySchema).parse(response.logs || []);

    return {
      logs: parsedLogs.map(normalizeLog),
      total: Number(response.total || 0),
    };
  },

  getLogStats: async (params: {
    teamId: TeamId | null;
    startTime: RequestTime;
    endTime: RequestTime;
    backendParams?: LogsBackendParams;
  }): Promise<LogsStats> => {
    const response = await logsService.getLogStats(
      params.teamId,
      params.startTime,
      params.endTime,
      params.backendParams
    ) as any;

    const parsed = logsStatsSchema.parse(response);
    
    // Normalize backend fields to frontend names
    return {
      total: parsed.total,
      fields: {
        level: parsed.fields.level ?? parsed.fields.severity_text ?? [],
        service_name: parsed.fields.service_name ?? parsed.fields.service ?? [],
      }
    } as LogsStats;
  },

  getLogVolume: async (params: {
    teamId: TeamId | null;
    startTime: RequestTime;
    endTime: RequestTime;
    step?: string;
    backendParams?: LogsBackendParams;
  }): Promise<LogsVolume> => {
    const response = await logsService.getLogVolume(
      params.teamId,
      params.startTime,
      params.endTime,
      params.step,
      params.backendParams
    ) as any;

    const parsed = logsVolumeSchema.parse(response);

    return parsed;
  },

  getLogAggregate: async (params: {
    teamId: TeamId | null;
    startTime: RequestTime;
    endTime: RequestTime;
    groupBy?: string;
    step?: string;
    topN?: number;
    metric?: string;
    backendParams?: LogsBackendParams;
  }): Promise<LogsAggregate> => {
    const response = await logsService.getLogAggregate(
      params.teamId,
      params.startTime,
      params.endTime,
      params.groupBy,
      params.step,
      params.topN,
      params.metric,
      params.backendParams,
    ) as any;
    return logsAggregateSchema.parse(response);
  },
};
