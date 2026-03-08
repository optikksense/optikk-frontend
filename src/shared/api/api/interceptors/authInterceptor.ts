import { getStoredTeamId, getStoredTeamIds, getStoredToken } from '@shared/api/auth/authStorage';

import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 *
 */
export function attachAuthInterceptor(instance: AxiosInstance): number {
  return instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const headers = config.headers;

    headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    headers.Pragma = 'no-cache';
    headers.Expires = '0';

    const teamIds = getStoredTeamIds();
    const teamId = teamIds.length > 0 ? teamIds[0] : getStoredTeamId();
    if (teamId != null) {
      headers['X-Team-Id'] = String(teamId);
    }
    if (teamIds.length > 1) {
      headers['X-Team-Ids'] = teamIds.join(',');
    }

    const token = getStoredToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  });
}
