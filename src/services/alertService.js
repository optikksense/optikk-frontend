import api from './api';
import { API_CONFIG } from '@config/constants';

export const alertService = {
  async getAlerts(params = {}) {
    // Accepts either a string (legacy: status) or an object with {teamId, startTime, endTime, status}
    const p = typeof params === 'string' ? { status: params } : params;
    return api.get(API_CONFIG.ENDPOINTS.ALERTS.LIST, { params: p });
  },

  async getActiveAlertCount() {
    const res = await api.get(API_CONFIG.ENDPOINTS.ALERTS.ACTIVE_COUNT);
    return res.data ?? res;
  },

  async createAlert(data) {
    return api.post(API_CONFIG.ENDPOINTS.ALERTS.CREATE, data);
  },

  async acknowledgeAlert(id) {
    return api.post(`${API_CONFIG.ENDPOINTS.ALERTS.ACKNOWLEDGE}/${id}/acknowledge`);
  },

  async resolveAlert(id) {
    return api.post(`${API_CONFIG.ENDPOINTS.ALERTS.RESOLVE}/${id}/resolve`);
  },

  async muteAlert(id, minutes = 60) {
    return api.post(`${API_CONFIG.ENDPOINTS.ALERTS.MUTE}/${id}/mute`, null, {
      params: { minutes },
    });
  },

  async muteAlertWithReason(id, minutes = 60, reason = '') {
    return api.post(`${API_CONFIG.ENDPOINTS.ALERTS.MUTE}/${id}/mute-with-reason`, { reason }, {
      params: { minutes },
    });
  },

  async bulkMuteAlerts(ids, minutes = 60, reason = '') {
    return api.post(`${API_CONFIG.ENDPOINTS.ALERTS.LIST}/bulk/mute`, { ids, minutes, reason });
  },

  async bulkResolveAlerts(ids) {
    return api.post(`${API_CONFIG.ENDPOINTS.ALERTS.LIST}/bulk/resolve`, { ids });
  },

  async getAlertsForIncident(policyId) {
    return api.get(`${API_CONFIG.ENDPOINTS.ALERTS.LIST}/for-incident/${policyId}`);
  },
};
