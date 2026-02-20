/**
 * Settings Service - API calls for user profile and preferences
 */
import api from './api';
import { API_CONFIG } from '@config/constants';

export const settingsService = {
  async getProfile() {
    return api.get(API_CONFIG.ENDPOINTS.SETTINGS.PROFILE);
  },

  async updateProfile(data) {
    return api.put(API_CONFIG.ENDPOINTS.SETTINGS.PROFILE, data);
  },

  async updatePreferences(preferences) {
    return api.put(API_CONFIG.ENDPOINTS.SETTINGS.PREFERENCES, { preferences });
  },
};
