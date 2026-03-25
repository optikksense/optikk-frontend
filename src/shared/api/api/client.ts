import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

import { API_CONFIG } from '@config/apiConfig';

import { attachAuthInterceptor } from './interceptors/authInterceptor';
import { attachErrorInterceptor } from './interceptors/errorInterceptor';
import {
  createInvalidApiResponseError,
  isApiEnvelope,
  isHtmlLikePayload,
  normalizeApiPayload,
} from '../utils/decode';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

attachAuthInterceptor(axiosClient);
axiosClient.interceptors.response.use((response) => {
  const normalized = normalizeApiPayload(response.data);

  if (typeof normalized === 'string' && isHtmlLikePayload(normalized)) {
    return Promise.reject(
      createInvalidApiResponseError(response, 'Invalid API response', normalized)
    );
  }

  if (isApiEnvelope(normalized)) {
    if (!normalized.success) {
      const err = new AxiosError(
        'Request failed',
        AxiosError.ERR_BAD_RESPONSE,
        response.config,
        response.request,
        { ...response, data: normalized }
      );
      return Promise.reject(err);
    }
    return {
      ...response,
      data: normalizeApiPayload(normalized.data),
    };
  }

  return {
    ...response,
    data: normalized,
  };
});
attachErrorInterceptor(axiosClient);

async function unwrapResponse<T>(request: Promise<AxiosResponse<T>>): Promise<T> {
  const response = await request;
  return response.data;
}

export interface NormalizedApiClient {
  readonly raw: AxiosInstance;
  request<T = unknown>(config: AxiosRequestConfig): Promise<T>;
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

const api: NormalizedApiClient = {
  raw: axiosClient,
  request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return unwrapResponse(axiosClient.request<T>(config));
  },
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return unwrapResponse(axiosClient.get<T>(url, config));
  },
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return unwrapResponse(axiosClient.post<T>(url, data, config));
  },
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return unwrapResponse(axiosClient.put<T>(url, data, config));
  },
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return unwrapResponse(axiosClient.delete<T>(url, config));
  },
};

export { api };
export default api;
