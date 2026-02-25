import api from './api';
import { API_CONFIG } from '@config/constants';

const BASE = API_CONFIG.ENDPOINTS.V1.SERVICES_METRICS;

export const exploreService = {
  async listSavedQueries(teamId, queryType) {
    return api.get(`${BASE}/explore/saved-queries`, {
      params: { queryType: queryType || undefined },
    });
  },

  async createSavedQuery(teamId, payload) {
    return api.post(`${BASE}/explore/saved-queries`, payload);
  },

  async updateSavedQuery(teamId, id, payload) {
    return api.put(`${BASE}/explore/saved-queries/${id}`, payload);
  },

  async deleteSavedQuery(teamId, id) {
    return api.delete(`${BASE}/explore/saved-queries/${id}`);
  },
};
