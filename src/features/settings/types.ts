import type {
  UserViewPreferenceKey,
  UserViewPreferenceValue,
  UserViewPreferences,
} from "@shared/types/preferences";

/** Lightweight tenant summary shown in the settings tenant tab. */
export interface SettingsTenantViewModel {
  readonly name?: string | null;
  readonly apiKey?: string | null;
  readonly role?: string | null;
}

export interface SettingsProfileViewModel {
  readonly name?: string | null;
  readonly email?: string | null;
  readonly 
  readonly role?: string | null;
  readonly tenants?: SettingsTenantViewModel[] | null;
}

export type SettingsViewPreferences = UserViewPreferences;
export type SettingsPreferenceKey = UserViewPreferenceKey;

export interface SettingsProfileFormValues {
  readonly name: string;
  readonly email?: string | null;
  readonly 
}

export interface SettingsProfileCommand {
  readonly name: string;
  readonly 
}

export type SettingsPreferenceValue = UserViewPreferenceValue;
