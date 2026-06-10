import { useAppStore } from "@store/appStore";

import { tokenStore } from "@shared/api/auth/tokenStore";

import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

/**
 *
 */
export function attachAuthInterceptor(instance: AxiosInstance): number {
  return instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const headers = config.headers;

    headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    headers.Pragma = "no-cache";
    headers.Expires = "0";

    const token = tokenStore.get();
    if (token != null) {
      headers.Authorization = `Bearer ${token}`;
    }

    const { selectedTeamId, selectedTeamIds } = useAppStore.getState();
    const teamIds = selectedTeamIds;
    const teamId = teamIds.length > 0 ? teamIds[0] : selectedTeamId;
    if (teamId != null) {
      headers["X-Team-Id"] = String(teamId);
    }
    if (teamIds.length > 1) {
      headers["X-Team-Ids"] = teamIds.join(",");
    }

    return config;
  });
}
