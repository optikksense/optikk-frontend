/**
 * Dashboard Service - API calls for dashboard data
 */
import api from './api';
import { API_CONFIG } from '@config/constants';

export const dashboardService = {
  /**
   * Get overview data
   */
  async getOverview(teamId, startTime, endTime) {
    return api.get(API_CONFIG.ENDPOINTS.DASHBOARD.OVERVIEW, {
      params: { teamId, startTime, endTime },
    });
  },

  /**
   * Get metrics data
   */
  async getMetrics(teamId, startTime, endTime, serviceName, interval) {
    return api.get(API_CONFIG.ENDPOINTS.DASHBOARD.METRICS, {
      params: { teamId, startTime, endTime, serviceName, interval },
    });
  },

  /**
   * Get logs data
   */
  async getLogs(teamId, startTime, endTime, params = {}) {
    return api.get(API_CONFIG.ENDPOINTS.DASHBOARD.LOGS, {
      params: {
        teamId,
        startTime,
        endTime,
        ...params, // serviceName, level, search, page, size
      },
    });
  },

  /**
   * Get traces data
   */
  async getTraces(teamId, startTime, endTime, params = {}) {
    return api.get(API_CONFIG.ENDPOINTS.DASHBOARD.TRACES, {
      params: {
        teamId,
        startTime,
        endTime,
        ...params, // serviceName, status, minDuration, maxDuration, page, size
      },
    });
  },

  /**
   * Get trace details by ID
   */
  async getTraceDetails(traceId, teamId) {
    return api.get(`${API_CONFIG.ENDPOINTS.DASHBOARD.TRACES}/${traceId}`, {
      params: { teamId },
    });
  },

  /**
   * Get services data
   */
  async getServices(teamId, startTime, endTime) {
    return api.get(API_CONFIG.ENDPOINTS.DASHBOARD.SERVICES, {
      params: { teamId, startTime, endTime },
    });
  },
};

