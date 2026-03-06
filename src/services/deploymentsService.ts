/**
 * Deployments Service — API calls for deployment tracking.
 */
import { API_CONFIG } from '@config/constants';

import api from './api';

import type { QueryParams, RequestTime } from './service-types';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

/**
 * Service wrapper for deployment-related endpoints.
 */
export const deploymentsService = {
  async getDeployments(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {},
  ): Promise<unknown> {
    return api.get(`${BASE}/deployments`, { params: { startTime, endTime, ...params } });
  },

  async getDeployEvents(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName: string,
  ): Promise<unknown> {
    return api.get(`${BASE}/deployments/events`, { params: { startTime, endTime, serviceName } });
  },

  async getDeployDiff(
    _teamId: number | null,
    deployId: string | number,
    windowMinutes = 30,
  ): Promise<unknown> {
    return api.get(`${BASE}/deployments/${deployId}/diff`, { params: { windowMinutes } });
  },

  async createDeployment(_teamId: number | null, data: QueryParams): Promise<unknown> {
    return api.post(`${BASE}/deployments`, data);
  },
};
