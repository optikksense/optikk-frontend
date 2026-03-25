import type {
  UserViewPreferenceKey,
  UserViewPreferenceValue,
  UserViewPreferences,
} from '@shared/types/preferences';

/** Lightweight team summary shown in the settings team tab. */
export interface SettingsTeamViewModel {
  readonly name?: string;
  readonly apiKey?: string;
  readonly role?: string;
}

/** Normalized settings profile data rendered by the settings page. */
export interface SettingsProfileViewModel {
  readonly name?: string;
  readonly email?: string;
  readonly avatarUrl?: string;
  readonly role?: string;
  readonly teams?: SettingsTeamViewModel[];
}

/** Shared preferences stored for the current user. */
export type SettingsViewPreferences = UserViewPreferences;
export type SettingsPreferenceKey = UserViewPreferenceKey;

/** Form values collected from the profile editor. */
export interface SettingsProfileFormValues {
  readonly name: string;
  readonly email?: string;
  readonly avatarUrl?: string;
}

/** Command payload submitted when saving the profile form. */
export interface SettingsProfileCommand {
  readonly name: string;
  readonly avatarUrl?: string;
}

/** Allowed preference value primitives accepted by the settings page. */
export type SettingsPreferenceValue = UserViewPreferenceValue;
