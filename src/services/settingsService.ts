/**
 * Settings Service - API calls for user profile and preferences
 */
import { API_CONFIG } from '@config/constants';

import api from './api';

/**
 * JSON object shape for settings payload submissions.
 */
type SettingsPayload = Record<string, unknown>;

/**
 * Service wrapper for user settings endpoints.
 */
export const settingsService = {
  async getProfile(): Promise<unknown> {
    return api.get(API_CONFIG.ENDPOINTS.SETTINGS.PROFILE);
  },

  async updateProfile(data: SettingsPayload): Promise<unknown> {
    return api.put(API_CONFIG.ENDPOINTS.SETTINGS.PROFILE, data);
  },

  async updatePreferences(preferences: SettingsPayload): Promise<unknown> {
    return api.put(API_CONFIG.ENDPOINTS.SETTINGS.PREFERENCES, { preferences });
  },
};
