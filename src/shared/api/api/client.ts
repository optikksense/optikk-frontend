import axios, { AxiosError } from 'axios';

import { API_CONFIG } from '@config/apiConfig';

import { attachAuthInterceptor } from './interceptors/authInterceptor';
import { attachErrorInterceptor } from './interceptors/errorInterceptor';
import {
  createInvalidApiResponseError,
  isApiEnvelope,
  isHtmlLikePayload,
  normalizeApiPayload,
} from '../utils/decode';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

attachAuthInterceptor(api);
api.interceptors.response.use((response) => {
  const normalized = normalizeApiPayload(response.data) as any;

  if (typeof normalized === 'string' && isHtmlLikePayload(normalized)) {
    return Promise.reject(
      createInvalidApiResponseError(response, 'Invalid API response', normalized),
    );
  }

  if (isApiEnvelope(normalized)) {
    if (!normalized.success) {
      const err = new AxiosError(
        'Request failed',
        AxiosError.ERR_BAD_RESPONSE,
        response.config,
        response.request,
        { ...response, data: normalized as unknown as Record<string, unknown> },
      );
      return Promise.reject(err);
    }
    return normalizeApiPayload(normalized.data) as any;
  }

  return normalized;
});
attachErrorInterceptor(api);

export { api };
export default api;
