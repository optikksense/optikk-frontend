import axios from "axios";

import { useAuthStore } from "@store/authStore";

import { API_CONFIG } from "@config/apiConfig";

import { resolveApiBaseURL } from "../api/baseUrl";
import { normalizeAuthPayload } from "./schemas";
import { tokenStore } from "./tokenStore";

// Uses a bare axios call (not the shared client) so a 401 here cannot
// trigger the retry interceptor recursively.
async function doRefresh(): Promise<string | null> {
  try {
    const response = await axios.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, undefined, {
      baseURL: resolveApiBaseURL(),
      timeout: API_CONFIG.TIMEOUT,
      withCredentials: true,
    });
    const payload = normalizeAuthPayload(response.data);
    const token = payload?.accessToken ?? null;
    tokenStore.set(token);
    if (payload && token != null) {
      useAuthStore.getState().applyAuthPayload(payload);
    }
    return token;
  } catch {
    tokenStore.clear();
    return null;
  }
}

let inflight: Promise<string | null> | null = null;

/** Single-flight refresh: concurrent 401s share one refresh request. */
export function refreshAccessToken(): Promise<string | null> {
  inflight ??= doRefresh().finally(() => {
    inflight = null;
  });
  return inflight;
}
