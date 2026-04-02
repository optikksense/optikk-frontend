import { z } from 'zod';

import { API_CONFIG } from '@config/apiConfig';
import api from '@/shared/api/api/client';
import { decodeApiResponse } from '@/shared/api/utils/validate';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const transactionRowSchema = z
  .object({
    group_value: z.string(),
    log_count: z.number(),
    duration_ns: z.number(),
    max_severity: z.number(),
    first_seen: z.number(),
    last_seen: z.number(),
    services: z.array(z.string()),
  })
  .strict();

const transactionsResponseSchema = z
  .object({
    group_by_field: z.string(),
    transactions: z.array(transactionRowSchema),
  })
  .strict();

export type LogTransactionRow = z.infer<typeof transactionRowSchema>;
export type LogTransactionsResponse = z.infer<typeof transactionsResponseSchema>;

export const logTransactionsApi = {
  async query(body: {
    startTime: number;
    endTime: number;
    query: string;
    groupByField: string;
    limit?: number;
  }): Promise<LogTransactionsResponse> {
    const response = await api.post(`${BASE}/logs/transactions`, body);
    return decodeApiResponse(transactionsResponseSchema, response, {
      context: 'log transactions',
      expectedType: 'object',
      message: 'Invalid log transactions response',
    });
  },
};
