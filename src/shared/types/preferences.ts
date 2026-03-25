export interface UserViewPreferences {
  readonly theme?: 'light' | 'dark' | 'system';
  readonly timezone?: string;
  readonly refreshInterval?: number;
  readonly sidebarCollapsed?: boolean;
  readonly density?: 'compact' | 'comfortable';
  readonly notificationsEnabled?: boolean;
  readonly favorites?: string[];
  readonly defaultTimeRange?: string;
  readonly defaultPageSize?: number;
}

export type UserViewPreferenceKey = keyof UserViewPreferences;

export type UserViewPreferenceValue =
  Exclude<UserViewPreferences[UserViewPreferenceKey], undefined>;
