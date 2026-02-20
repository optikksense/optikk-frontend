/**
 * Infrastructure Service - API calls for host/pod/container metrics
 */
import api from './api';
import { API_CONFIG } from '@config/constants';

const BASE = API_CONFIG.ENDPOINTS.V1.INFRASTRUCTURE;

export const infrastructureService = {
  async getMetrics(teamId, startTime, endTime) {
    return api.get(`${BASE}/infrastructure`, {
      params: { startTime, endTime },
    });
  },
};
