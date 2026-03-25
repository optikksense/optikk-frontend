import { z } from 'zod';
import { tracesService } from '@shared/api/tracesService';
import { tracesResponseSchema } from '@entities/trace/model';
import { spanRecordSchema } from '@shared/api/schemas/tracesSchemas';
import type { QueryParams, RequestTime } from '@shared/api/service-types';
import { normalizeTracesResponse } from '../utils/tracesUtils';
import type { TraceExplorerParams } from '../types';

export interface TracesBackendParams extends QueryParams, TraceExplorerParams {}

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
    return z.array(spanRecordSchema).parse(response);
  },
};
