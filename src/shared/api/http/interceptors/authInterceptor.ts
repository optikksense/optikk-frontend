import { session } from "@shared/api/auth/session";

import { useAppStore } from "@app/store/appStore";

import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

   
                                                                             
                                                                           
                                        
   
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
