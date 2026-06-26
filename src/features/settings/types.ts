import type {
  UserViewPreferenceKey,
  UserViewPreferenceValue,
  UserViewPreferences,
} from "@shared/types/preferences";

/** Lightweight team summary shown in the settings team tab. */
export interface SettingsTeamViewModel {
  readonly name?: string | null;
  readonly apiKey?: string | null;
  readonly role?: string | null;
}

export interface SettingsProfileViewModel {
  readonly name?: string | null;
  readonly email?: string | null;
  readonly avatarUrl?: string | null;
  readonly role?: string | null;
  readonly teams?: SettingsTeamViewModel[] | null;
}

export type SettingsViewPreferences = UserViewPreferences;
export type SettingsPreferenceKey = UserViewPreferenceKey;

export interface SettingsProfileFormValues {
  readonly name: string;
  readonly email?: string | null;
  readonly avatarUrl?: string | null;
}

export interface SettingsProfileCommand {
  readonly name: string;
  readonly avatarUrl?: string | null;
}

export type SettingsPreferenceValue = UserViewPreferenceValue;
