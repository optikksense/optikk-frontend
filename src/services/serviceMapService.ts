/**
 * Service Map Service - API calls for service topology/dependency data
 */
import { API_CONFIG } from '@config/constants';

import api from './api';

import type { RequestTime } from './service-types';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

/**
 * Service wrapper for topology graph endpoints.
 */
export const serviceMapService = {
  async getTopology(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/services/topology`, {
      params: { startTime, endTime },
    });
  },
};
