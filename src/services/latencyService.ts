/**
 * Latency Service — API calls for latency analysis.
 */
import { API_CONFIG } from '@config/constants';

import api from './api';

import type { QueryParams, RequestTime } from './service-types';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

/**
 * Service wrapper for latency endpoints.
 */
export const latencyService = {
  async getHistogram(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {},
  ): Promise<unknown> {
    return api.get(`${BASE}/latency/histogram`, { params: { startTime, endTime, ...params } });
  },

  async getHeatmap(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName: string,
    interval = '5m',
  ): Promise<unknown> {
    return api.get(`${BASE}/latency/heatmap`, { params: { startTime, endTime, serviceName, interval } });
  },
};
