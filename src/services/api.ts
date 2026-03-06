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

import { safeGet, safeRemove } from '@utils/storage';

import { API_CONFIG, STORAGE_KEYS } from '@config/constants';

const AUTH_PRESENT_KEY = 'optic_auth_present';

interface ApiErrorShape {
  readonly status: number;
  readonly message: string;
  readonly data?: unknown;
}

interface ApiEnvelope {
  readonly success: boolean;
  readonly data: unknown;
}

function isApiEnvelope(value: unknown): value is ApiEnvelope {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.success === 'boolean' && 'data' in record;
}

function extractApiMessage(data: unknown): string {
  if (typeof data !== 'object' || data === null) {
    return 'An error occurred';
  }

  const record = data as Record<string, unknown>;
  const nestedError = record.error;
  if (typeof nestedError === 'object' && nestedError !== null) {
    const nestedRecord = nestedError as Record<string, unknown>;
    if (typeof nestedRecord.message === 'string' && nestedRecord.message.length > 0) {
      return nestedRecord.message;
    }
  }

  if (typeof record.message === 'string' && record.message.length > 0) {
    return record.message;
  }

  return 'An error occurred';
}

function toApiError(error: unknown): ApiErrorShape {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        safeRemove(AUTH_PRESENT_KEY);
        safeRemove(STORAGE_KEYS.AUTH_TOKEN);
        safeRemove(STORAGE_KEYS.USER_DATA);
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }

      return {
        status,
        message: extractApiMessage(data),
        data,
      };
    }

    if (error.request) {
      return {
        status: 0,
        message: 'Network error - please check your connection',
      };
    }

    return {
      status: 0,
      message: error.message || 'An unexpected error occurred',
    };
  }

  if (error instanceof Error) {
    return {
      status: 0,
      message: error.message,
    };
  }

  return {
    status: 0,
    message: 'An unexpected error occurred',
  };
}

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

    // Cookie-first auth, with token fallback for environments that return
    // JWT in login response body but don't set httpOnly cookie.
    const token = safeGet(STORAGE_KEYS.AUTH_TOKEN);
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — unwrap ApiResponse, handle auth errors
api.interceptors.response.use(
  (response) => {
    const data = response.data;
    // Unwrap ApiResponse if present (has success and data properties)
    if (isApiEnvelope(data)) {
      return data.data;
    }
    return data;
  },
  (error: unknown) => Promise.reject(toApiError(error)),
);

export { api };
export default api;
