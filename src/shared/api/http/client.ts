import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";

declare module "axios" {
  // The response interceptor lifts the envelope's comparison sibling here so
  // `data` stays the payload for every caller.
  interface AxiosResponse {
    comparison?: unknown;
  }
}

import { API_CONFIG } from "@config/apiConfig";

import {
  createInvalidApiResponseError,
  isApiEnvelope,
  isHtmlLikePayload,
  normalizeApiPayload,
} from "../utils/decode";
import { resolveApiBaseURL } from "./baseUrl";
import { attachAuthInterceptor } from "./interceptors/authInterceptor";
import { attachErrorInterceptor } from "./interceptors/errorInterceptor";

const axiosClient = axios.create({
  baseURL: resolveApiBaseURL(),
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

attachAuthInterceptor(axiosClient);
axiosClient.interceptors.response.use((response) => {
  const normalized = normalizeApiPayload(response.data);

  if (typeof normalized === "string" && isHtmlLikePayload(normalized)) {
    return Promise.reject(
      createInvalidApiResponseError(response, "Invalid API response", normalized)
    );
  }

  if (isApiEnvelope(normalized)) {
    if (!normalized.success) {
      const err = new AxiosError(
        "Request failed",
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
      comparison:
        normalized.comparison === undefined
          ? undefined
          : normalizeApiPayload(normalized.comparison),
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

/** A payload plus the same shape for the previous period, when requested. */
export interface Comparable<T> {
  readonly data: T;
  readonly comparison?: T;
}

async function unwrapComparable<T>(request: Promise<AxiosResponse<T>>): Promise<Comparable<T>> {
  const response = await request;
  return { data: response.data, comparison: response.comparison as T | undefined };
}

const api = {
  raw: axiosClient,
  request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return unwrapResponse(axiosClient.request<T>(config));
  },
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return unwrapResponse(axiosClient.get<T>(url, config));
  },
  /** Use for endpoints called with compareTo; otherwise use get. */
  getComparable<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<Comparable<T>> {
    return unwrapComparable(axiosClient.get<T>(url, config));
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
