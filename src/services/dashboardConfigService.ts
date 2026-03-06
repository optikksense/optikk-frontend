/**
 * Dashboard Config Service — API calls for dashboard chart YAML configurations.
 *
 * Each "page" (e.g. 'overview', 'metrics', 'saturation') has a YAML config that
 * defines which charts to render, their layout, data sources, and display options.
 * Teams can override the built-in defaults via saveDashboardConfig().
 */
import { API_CONFIG } from '@config/constants';

import api from './api';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

/**
 * Service wrapper for dashboard configuration endpoints.
 */
export const dashboardConfigService = {
  async getDashboardConfig(_teamId: number | null, pageId: string): Promise<unknown> {
    return api.get(`${BASE}/dashboard-config/${pageId}`);
  },

  async saveDashboardConfig(
    _teamId: number | null,
    pageId: string,
    configYaml: string,
  ): Promise<unknown> {
    return api.put(`${BASE}/dashboard-config/${pageId}`, { configYaml });
  },

  async listDashboardPages(_teamId: number | null): Promise<unknown> {
    return api.get(`${BASE}/dashboard-config/pages`);
  },
};
