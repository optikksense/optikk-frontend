export const API_PROXY_BASE = "/api";
const API_TIMEOUT_MS = 30000;
const API_RETRY_ATTEMPTS = 3;

export const DEV_FRONTEND_PORT = 3000;
const DEV_BACKEND_HOST = "localhost";
const DEV_BACKEND_PORT = 19090;
export const DEV_BACKEND_URL = `http://${DEV_BACKEND_HOST}:${DEV_BACKEND_PORT}`;

const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/v1/auth/login",
    SIGNUP: "/v1/auth/signup",
    REFRESH: "/v1/auth/refresh",
    LOGOUT: "/v1/auth/logout",
    DEVICE_APPROVE: "/v1/auth/device/approve",
  },
  TENANTS: {
    LIST: "/v1/tenants",
    SWITCH: "/v1/tenants/switch",
  },
  V1_BASE: "/v1",
  DASHBOARDS: {
    PAGES: "/v1/dashboard-pages",
  },
} as const;

export const API_V1_BASE = API_ENDPOINTS.V1_BASE;

export const API_CONFIG = {
  BASE_URL: API_PROXY_BASE,
  TIMEOUT: API_TIMEOUT_MS,
  RETRY_ATTEMPTS: API_RETRY_ATTEMPTS,
  ENDPOINTS: API_ENDPOINTS,
} as const;
