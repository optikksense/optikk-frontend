/**
 * API Service — Axios instance with interceptors
 *
 * Fix 1 (httpOnly cookie auth):
 * - JWT is stored in an httpOnly cookie set by the backend — we no longer
 *   inject it as an Authorization header for browser requests.
 * - withCredentials: true tells the browser to include the cookie on every
 *   cross-origin request (requires Access-Control-Allow-Credentials: true on
 *   the backend, which middleware.go now sets).
 * - The client-side JWT decode/expiry check is removed — trust the server's 401.
 * - SDK/CLI clients that pass an Authorization header still work because the
 *   backend middleware accepts both (cookie fallback is only used when no
 *   Authorization header is present).
 */
import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '@config/constants';
import { safeGet, safeRemove } from '@utils/storage';

const AUTH_PRESENT_KEY = 'optic_auth_present';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  // Send the httpOnly cookie on every request (same-origin + cross-origin).
  withCredentials: true,
});

// Request interceptor — cache headers + optional team switching header
api.interceptors.request.use(
  (config) => {
    // Disable browser/proxy response caching for telemetry queries.
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers.Pragma = 'no-cache';
    config.headers.Expires = '0';

    // Multi-team switching: include X-Team-Id so the backend scope queries
    // to the selected team. The backend validates this against the JWT's
    // Teams claim (Fix 2) before honouring the override.
    const teamId = safeGet(STORAGE_KEYS.TEAM_ID);
    if (teamId) {
      config.headers['X-Team-Id'] = teamId;
    }

    // Note: No Authorization header injection — the httpOnly cookie is sent
    // automatically by the browser via withCredentials.
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — unwrap ApiResponse, handle auth errors
api.interceptors.response.use(
  (response) => {
    const data = response.data;
    // Unwrap ApiResponse if present (has success and data properties)
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return data.data;
    }
    return data;
  },
  (error: any) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized — the cookie is invalid, expired, or was revoked.
        // Clear the non-sensitive local markers and signal the React app.
        safeRemove(AUTH_PRESENT_KEY);
        safeRemove(STORAGE_KEYS.AUTH_TOKEN); // legacy cleanup
        safeRemove(STORAGE_KEYS.USER_DATA);
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }

      return Promise.reject({
        status,
        message: data?.error?.message || data?.message || 'An error occurred',
        data: data,
      });
    } else if (error.request) {
      return Promise.reject({
        status: 0,
        message: 'Network error - please check your connection',
      });
    } else {
      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

export default api;
