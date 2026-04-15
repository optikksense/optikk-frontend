/**
 * Settings Service - API calls for user profile and preferences
 */
import { API_CONFIG } from "@config/apiConfig";

import api from "./api";

import type { UserViewPreferences } from "@shared/types/preferences";

export interface SettingsProfileCommand {
  readonly name: string;
  readonly avatarUrl?: string | null;
}

export interface SettingsProfileResponse {
  readonly name?: string | null;
  readonly email?: string | null;
  readonly avatarUrl?: string | null;
  readonly role?: string | null;
  readonly preferences?: UserViewPreferences;
  readonly teams?: ReadonlyArray<{
    readonly name?: string | null;
    readonly apiKey?: string | null;
    readonly role?: string | null;
  }> | null;
}

export interface SettingsPreferencesResponse {
  readonly preferences: UserViewPreferences;
}

/**
 * Service wrapper for user settings endpoints.
 */
export const settingsService = {
  async getProfile(): Promise<SettingsProfileResponse> {
    return api.get(API_CONFIG.ENDPOINTS.SETTINGS.PROFILE);
  },

  async updateProfile(data: SettingsProfileCommand): Promise<SettingsProfileResponse> {
    return api.put(API_CONFIG.ENDPOINTS.SETTINGS.PROFILE, data);
  },

  async updatePreferences(
    preferences: Partial<UserViewPreferences>
  ): Promise<SettingsPreferencesResponse> {
    return api.put(API_CONFIG.ENDPOINTS.SETTINGS.PREFERENCES, { preferences });
  },
};
