import { z } from 'zod';
import { tracesService } from '@shared/api/tracesService';
import { tracesResponseSchema } from '@/entities/trace/model';
import type { QueryParams, RequestTime } from '@shared/api/service-types';
import { normalizeTracesResponse } from '../utils/tracesUtils';

export interface TracesBackendParams extends QueryParams {
  limit?: number;
  offset?: number;
  status?: string;
  services?: string[];
  minDuration?: number;
  maxDuration?: number;
  traceId?: string;
  operationName?: string;
  httpMethod?: string;
  httpStatusCode?: string | number;
}

/**
 * Traces API layer with Zod validation.
 */
export const tracesApi = {
  async getTraces(
    teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: TracesBackendParams = {}
  ) {
    const response = await tracesService.getTraces(teamId, startTime, endTime, params);
    return tracesResponseSchema.parse(normalizeTracesResponse(response));
  },

  async getTraceSpans(teamId: number | null, traceId: string) {
    const response = await tracesService.getTraceSpans(teamId, traceId);
    return z.array(z.any()).parse(response); // Tree parsing logic usually in hooks
  },
};
