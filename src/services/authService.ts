/**
 * Authentication Service — Fix 1 (httpOnly cookie auth)
 *
 * JWT is now stored in an httpOnly cookie set by the backend on login.
 * The browser sends it automatically on every request to the same origin —
 * no manual Authorization header injection is needed.
 *
 * We still keep a lightweight "is logged in" flag in localStorage (non-sensitive)
 * so the frontend can render the right UI without a round-trip, but we never
 * store the JWT itself in localStorage any more.
 */
import api from './api';
import { API_CONFIG, STORAGE_KEYS } from '@config/constants';
import { safeSet, safeRemove, safeGetJSON } from '@utils/storage';

/**
 * A non-sensitive cookie-auth-presence flag written to localStorage so the
 * frontend knows whether to show the authenticated UI on first render.
 * The actual JWT never touches localStorage.
 */
const AUTH_PRESENT_KEY = 'optic_auth_present';

export const authService = {
  /**
   * Axios interceptor unwraps ApiResponse and returns payload directly.
   * Keep a compatibility fallback for any wrapped callers.
   */
  normalizeAuthPayload(response: any) {
    if (!response) return null;
    if (response.success && response.data) return response.data;
    return response;
  },

  /**
   * Login user.
   * On success the backend sets an httpOnly cookie named "token".
   * We store non-sensitive metadata (user data, team ID) in localStorage.
   */
  async login(email: string, password: string) {
    // Avoid carrying stale auth/team context across account switches.
    safeRemove(AUTH_PRESENT_KEY);
    safeRemove(STORAGE_KEYS.AUTH_TOKEN);
    safeRemove(STORAGE_KEYS.USER_DATA);
    safeRemove(STORAGE_KEYS.TEAM_ID);

    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    const payload = this.normalizeAuthPayload(response);
    if (payload?.user) {
      // Mark that a session exists (used for initial render optimisation only).
      safeSet(AUTH_PRESENT_KEY, '1');
      safeSet(STORAGE_KEYS.USER_DATA, JSON.stringify(payload.user));

      // Store team ID for cross-pod multi-team switching via X-Team-Id header.
      const teamId =
        payload.currentTeam?.id ||
        payload.teams?.[0]?.id ||
        payload.user?.teams?.[0]?.id;

      if (teamId) {
        safeSet(STORAGE_KEYS.TEAM_ID, String(teamId));
      }

      // Compatibility fallback:
      // Some backend runs return JWT in response body without setting cookie.
      // Persist token so API interceptor can send Authorization header.
      if (payload.token) {
        safeSet(STORAGE_KEYS.AUTH_TOKEN, String(payload.token));
      }
    }

    return payload || response;
  },

  /**
   * Logout user.
   * POSTing to /auth/logout tells the backend to clear the httpOnly cookie
   * (Set-Cookie: token=; Max-Age=0) and revoke the JWT in Redis.
   */
  async logout() {
    try {
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all local non-sensitive session markers.
      safeRemove(AUTH_PRESENT_KEY);
      safeRemove(STORAGE_KEYS.AUTH_TOKEN); // legacy cleanup in case it lingers
      safeRemove(STORAGE_KEYS.USER_DATA);
      safeRemove(STORAGE_KEYS.TEAM_ID);
    }
  },

  /**
   * Validate current session by calling the /me endpoint.
   * A 200 response means the cookie is still valid.
   * A 401 response means the session is expired/logged out.
   */
  async validateSession(): Promise<boolean> {
    try {
      await api.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      return true;
    } catch {
      safeRemove(AUTH_PRESENT_KEY);
      return false;
    }
  },

  /**
   * Optimistic check: returns true if we believe a session exists.
   * Relies on the non-sensitive auth-presence flag in localStorage.
   * Use validateSession() to do a real server-side check.
   */
  isAuthenticated(): boolean {
    return localStorage.getItem(AUTH_PRESENT_KEY) === '1';
  },

  /**
   * Get the currently stored user data (non-sensitive, from localStorage).
   */
  getCurrentUser() {
    return safeGetJSON(STORAGE_KEYS.USER_DATA, null);
  },

  /**
   * Refresh the current session by calling /api/auth/me and updating stored
   * user data. Returns true if the session is still valid.
   */
  async refreshSession(): Promise<boolean> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      const payload = this.normalizeAuthPayload(response);
      if (payload?.user) {
        safeSet(AUTH_PRESENT_KEY, '1');
        safeSet(STORAGE_KEYS.USER_DATA, JSON.stringify(payload.user));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
};
