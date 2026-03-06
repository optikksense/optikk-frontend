import { API_CONFIG } from '@config/constants';

import api from './api';

import type { RequestTime } from './service-types';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

/**
 * Service wrapper for services-page endpoints.
 */
export const servicesPageService = {
  async getTotalServices(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/services/summary/total`, { params: { startTime, endTime } });
  },

  async getHealthyServices(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/services/summary/healthy`, { params: { startTime, endTime } });
  },

  async getDegradedServices(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/services/summary/degraded`, { params: { startTime, endTime } });
  },

  async getUnhealthyServices(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/services/summary/unhealthy`, { params: { startTime, endTime } });
  },

  async getServiceMetrics(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/services/metrics`, { params: { startTime, endTime } });
  },

  async getServiceTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    interval = '5m',
  ): Promise<unknown> {
    return api.get(`${BASE}/services/timeseries`, { params: { startTime, endTime, interval } });
  },

  async getTopology(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/services/topology`, { params: { startTime, endTime } });
  },
};
