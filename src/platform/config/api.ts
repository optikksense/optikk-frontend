export const API_PROXY_BASE = "/api"
export const API_CONFIG = {
  baseUrl: API_PROXY_BASE,
  timeoutMs: 30_000,
  endpoints: {
    auth: {
      login: "/v1/auth/login",
      logout: "/v1/auth/logout",
      me: "/v1/auth/me",
    },
    settings: {
      profile: "/v1/settings/profile",
      preferences: "/v1/settings/preferences",
    },
    liveTail: "/v1/ws/live",
  },
} as const
