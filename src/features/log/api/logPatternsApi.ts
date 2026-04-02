import { z } from 'zod';

import { API_CONFIG } from '@config/apiConfig';
import api from '@/shared/api/api/client';
import { decodeApiResponse } from '@/shared/api/utils/validate';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const patternRowSchema = z
  .object({
    pattern: z.string(),
    count: z.number(),
    first_seen: z.number(),
    last_seen: z.number(),
    sample: z.string(),
  })
  .strict();

const patternsResponseSchema = z.object({ patterns: z.array(patternRowSchema) }).strict();

export type LogPatternRow = z.infer<typeof patternRowSchema>;
export type LogPatternsResponse = z.infer<typeof patternsResponseSchema>;

export const logPatternsApi = {
  async query(body: {
    startTime: number;
    endTime: number;
    query: string;
    limit?: number;
  }): Promise<LogPatternsResponse> {
    const response = await api.post(`${BASE}/logs/patterns`, body);
    return decodeApiResponse(patternsResponseSchema, response, {
      context: 'log patterns',
      expectedType: 'object',
      message: 'Invalid log patterns response',
    });
  },
};
