export const API_PROXY_BASE = '/api';
export const API_TIMEOUT_MS = 30000;
export const API_RETRY_ATTEMPTS = 3;

export const DEV_FRONTEND_PORT = 3000;
export const DEV_BACKEND_HOST = 'localhost';
export const DEV_BACKEND_PORT = 9090;
export const DEV_BACKEND_URL = `http://${DEV_BACKEND_HOST}:${DEV_BACKEND_PORT}`;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/v1/login',
    LOGOUT: '/auth/logout',
    VALIDATE: '/auth/validate',
    ME: '/auth/me',
  },
  TEAMS: {
    LIST: '/teams',
    SWITCH: '/teams/switch',
  },
  V1_BASE: '/v1',
  SETTINGS: {
    PROFILE: '/settings/profile',
    PREFERENCES: '/settings/preferences',
  },
  EVENTS: {
    STREAM: '/v1/events/stream',
  },
} as const;

export const API_CONFIG = {
  BASE_URL: API_PROXY_BASE,
  TIMEOUT: API_TIMEOUT_MS,
  RETRY_ATTEMPTS: API_RETRY_ATTEMPTS,
  ENDPOINTS: API_ENDPOINTS,
} as const;
