import { queryOptions } from '@tanstack/react-query';
import { logsApi, type LogsBackendParams } from './logsApi';
import { logsKeys } from './logsKeys';
import type { TeamId } from '@shared/types/branded';
import type { RequestTime } from '@shared/api/service-types';

/**
 * Log feature query options factory.
 * Standardizes query keys, fetchers, and stale times.
 */
export const logQueries = {
  all: () => queryOptions({
    queryKey: logsKeys.all,
  }),
  
  list: (params: {
    teamId: TeamId | null;
    startTime: RequestTime;
    endTime: RequestTime;
    backendParams: LogsBackendParams;
  }) => queryOptions({
    queryKey: logsKeys.list(params.teamId, String(params.startTime), JSON.stringify(params.backendParams)),
    queryFn: () => logsApi.getLogs(params),
    staleTime: 30000,
  }),

  stats: (params: {
    teamId: TeamId | null;
    startTime: RequestTime;
    endTime: RequestTime;
    backendParams: LogsBackendParams;
  }) => queryOptions({
    queryKey: logsKeys.stats(params.teamId, String(params.startTime), JSON.stringify(params.backendParams)),
    queryFn: () => logsApi.getLogStats(params),
    staleTime: 60000,
  }),

  volume: (params: {
    teamId: TeamId | null;
    startTime: RequestTime;
    endTime: RequestTime;
    step?: string;
    backendParams: LogsBackendParams;
  }) => queryOptions({
    queryKey: ['logs', 'volume', params.teamId, String(params.startTime), params.step, JSON.stringify(params.backendParams)],
    queryFn: () => logsApi.getLogVolume(params),
    staleTime: 60000,
  }),

  aggregate: (params: {
    teamId: TeamId | null;
    startTime: RequestTime;
    endTime: RequestTime;
    groupBy?: string;
    step?: string;
    topN?: number;
    metric?: string;
    backendParams?: LogsBackendParams;
  }) => queryOptions({
    queryKey: ['logs', 'aggregate', params.teamId, String(params.startTime), params.groupBy, params.step, params.metric, JSON.stringify(params.backendParams)],
    queryFn: () => logsApi.getLogAggregate(params),
    staleTime: 60000,
  }),
};
