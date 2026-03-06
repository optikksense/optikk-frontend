import { API_CONFIG } from '@config/constants';

import api from './api';

import type { QueryParams, RequestTime } from './service-types';

const BASE = `${API_CONFIG.ENDPOINTS.V1_BASE}/overview`;

/**
 * Service wrapper for overview dashboard endpoints.
 */
export const overviewService = {
  async getSummary(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/summary`, { params: { startTime, endTime } });
  },

  async getTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
    interval = '5m',
  ): Promise<unknown> {
    return api.get(`${BASE}/timeseries`, { params: { startTime, endTime, serviceName, interval } });
  },

  async getServices(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/services`, { params: { startTime, endTime } });
  },

  async getEndpointMetrics(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
  ): Promise<unknown> {
    return api.get(`${BASE}/endpoints/metrics`, { params: { startTime, endTime, serviceName } });
  },

  async getEndpointTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
  ): Promise<unknown> {
    return api.get(`${BASE}/endpoints/timeseries`, { params: { startTime, endTime, serviceName } });
  },

  async getSloSli(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
    interval = '5m',
  ): Promise<unknown> {
    return api.get(`${BASE}/slo`, { params: { startTime, endTime, serviceName, interval } });
  },

  async getErrorGroups(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {},
  ): Promise<unknown> {
    return api.get(`${BASE}/errors/groups`, { params: { startTime, endTime, ...params } });
  },

  async getServiceErrorRate(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
    interval = '5m',
  ): Promise<unknown> {
    return api.get(`${BASE}/errors/service-error-rate`, { params: { startTime, endTime, serviceName, interval } });
  },

  async getErrorVolume(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
    interval = '5m',
  ): Promise<unknown> {
    return api.get(`${BASE}/errors/error-volume`, { params: { startTime, endTime, serviceName, interval } });
  },

  async getLatencyDuringErrorWindows(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
    interval = '5m',
  ): Promise<unknown> {
    return api.get(`${BASE}/errors/latency-during-error-windows`, {
      params: { startTime, endTime, serviceName, interval },
    });
  },
};
