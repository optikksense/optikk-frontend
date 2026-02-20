/**
 * Authentication Service
 */
import api from './api';
import { API_CONFIG, STORAGE_KEYS } from '@config/constants';

export const authService = {
  /**
   * Axios interceptor unwraps ApiResponse and returns payload directly.
   * Keep a compatibility fallback for any wrapped callers.
   */
  normalizeAuthPayload(response) {
    if (!response) return null;
    if (response.success && response.data) return response.data;
    return response;
  },

  /**
   * Login user
   */
  async login(email, password) {
    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    const payload = this.normalizeAuthPayload(response);
    if (payload?.token) {
      // Store auth data
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, payload.token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(payload.user));

      // Store team ID if available - check both possible locations
      const teamId = payload.currentTeam?.id ||
                     payload.teams?.[0]?.id ||
                     payload.user?.teams?.[0]?.id;

      if (teamId) {
        localStorage.setItem(STORAGE_KEYS.TEAM_ID, teamId);
      }
    }

    return payload || response;
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(STORAGE_KEYS.TEAM_ID);
    }
  },

  /**
   * Validate current session
   */
  async validateSession() {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.VALIDATE);
      const payload = this.normalizeAuthPayload(response);
      return payload?.valid === true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get current user from storage
   */
  getCurrentUser() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
};
