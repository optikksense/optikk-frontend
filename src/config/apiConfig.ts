export const API_PROXY_BASE = "/api";
const API_TIMEOUT_MS = 30000;
const API_RETRY_ATTEMPTS = 3;

export const DEV_FRONTEND_PORT = 3000;
const DEV_BACKEND_HOST = "localhost";
const DEV_BACKEND_PORT = 19090;
export const DEV_BACKEND_URL = `http://${DEV_BACKEND_HOST}:${DEV_BACKEND_PORT}`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/v1/auth/login",
    SIGNUP: "/v1/auth/signup",
    REFRESH: "/v1/auth/refresh",
    LOGOUT: "/v1/auth/logout",
  },
  ONBOARDING: {
    STATUS: "/v1/onboarding/status",
  },
  TEAMS: {
    LIST: "/v1/teams",
    SWITCH: "/v1/teams/switch",
  },
  V1_BASE: "/v1",
  DASHBOARDS: {
    PAGES: "/v1/dashboard-pages",
  },
  SETTINGS: {
    PROFILE: "/v1/settings/profile",
    PREFERENCES: "/v1/settings/preferences",
  },
} as const;

export const API_V1_BASE = API_ENDPOINTS.V1_BASE;

export const API_CONFIG = {
  BASE_URL: API_PROXY_BASE,
  TIMEOUT: API_TIMEOUT_MS,
  RETRY_ATTEMPTS: API_RETRY_ATTEMPTS,
  ENDPOINTS: API_ENDPOINTS,
} as const;
