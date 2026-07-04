import { session } from "@shared/api/auth/session";

import { useAppStore } from "@store/appStore";

import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

/**
 * Stamps the Bearer token and tenant scope on every request. Only headers in
 * the backend CORS allowlist may be added here, or cross-origin preflights
 * fail and the browser blocks the call.
 */
export function attachAuthInterceptor(instance: AxiosInstance): number {
  return instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = session.getAccessToken();
    if (token != null) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const { selectedTenantId } = useAppStore.getState();
    if (selectedTenantId != null) {
      config.headers["X-Tenant-Id"] = String(selectedTenantId);
    }

    return config;
  });
}
