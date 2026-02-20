/**
 * Service Map Service - API calls for service topology/dependency data
 */
import api from './api';
import { API_CONFIG } from '@config/constants';

const BASE = API_CONFIG.ENDPOINTS.V1.TOPOLOGY;

export const serviceMapService = {
  async getTopology(teamId, startTime, endTime) {
    return api.get(`${BASE}/services/topology`, {
      params: { startTime, endTime },
    });
  },
};
