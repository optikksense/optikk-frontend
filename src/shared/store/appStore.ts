import { create } from 'zustand';

import type { TimeRange } from '@/types';

import { getStoredTeamIds, setStoredTeamIds } from '@shared/api/auth/authStorage';

import { safeGet, safeGetJSON, safeSet, safeSetJSON } from '@shared/utils/storage';

import { STORAGE_KEYS, TIME_RANGES } from '@config/constants';

interface ViewPreferences {
  theme?: 'light' | 'dark' | 'system';
  timezone?: string;
  refreshInterval?: number;
  sidebarCollapsed?: boolean;
  density?: 'compact' | 'comfortable';
  [key: string]: unknown;
}

interface QueryClientLike {
  invalidateQueries: () => Promise<void> | void;
}

interface AppState {
  readonly selectedTeamId: number | null;
  readonly selectedTeamIds: number[];
  readonly timeRange: TimeRange;
  readonly sidebarCollapsed: boolean;
  readonly refreshKey: number;
  readonly autoRefreshInterval: number;
  readonly theme: string;
  readonly notificationsEnabled: boolean;
  readonly viewPreferences: ViewPreferences;
  readonly setSelectedTeamId: (teamId: number | null) => void;
  readonly setSelectedTeamIds: (teamIds: number[]) => void;
  readonly setTimeRange: (valueOrRange: string | TimeRange) => void;
  readonly setCustomTimeRange: (customRange: TimeRange) => void;
  readonly toggleSidebar: () => void;
  readonly triggerRefresh: () => void;
  readonly setAutoRefreshInterval: (ms: number) => void;
  readonly setTheme: (theme: string) => void;
  readonly setNotificationsEnabled: (enabled: boolean) => void;
  readonly setViewPreference: (key: string, value: unknown) => void;
}

function asTimeRange(value: unknown): TimeRange | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  // Time ranges are configured as dynamic objects in constants.ts.
  return value as TimeRange;
}

function getDefaultTimeRange(): TimeRange {
  const range = TIME_RANGES.find((candidate) => candidate.value === '1h') ?? TIME_RANGES[3];
  const parsed = asTimeRange(range);
  if (parsed) {
    return parsed;
  }
  return { label: '1h', value: '1h', minutes: 60 };
}

function getInitialTimeRange(savedTimeRange: string | null): TimeRange {
  if (!savedTimeRange) {
    return getDefaultTimeRange();
  }

  const resolved = TIME_RANGES.find((candidate) => candidate.value === savedTimeRange);
  return asTimeRange(resolved) ?? getDefaultTimeRange();
}

async function invalidateQueryClientCache(): Promise<void> {
  try {
    const moduleRef = await import('../../main');
    if (!('queryClient' in moduleRef)) {
      return;
    }
    // Runtime import type is unknown to TS here; narrow to optional queryClient.
    const queryClient = (moduleRef as { queryClient?: QueryClientLike }).queryClient;
    if (queryClient?.invalidateQueries) {
      await queryClient.invalidateQueries();
    }
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      console.warn('Unable to invalidate query cache on team switch', error);
    }
  }
}

const savedTeamId = safeGet(STORAGE_KEYS.TEAM_ID);
const savedTeamIds = getStoredTeamIds();
const savedTimeRange = safeGet(STORAGE_KEYS.TIME_RANGE);
const savedCollapsed = safeGet(STORAGE_KEYS.SIDEBAR_COLLAPSED);
const savedAutoRefresh = safeGet(STORAGE_KEYS.AUTO_REFRESH);

/**
 * Global app-level UI and query coordination store.
 */
export const useAppStore = create<AppState>((set) => ({
  selectedTeamId: savedTeamId ? Number(savedTeamId) : null,
  selectedTeamIds: savedTeamIds.length > 0 ? savedTeamIds : (savedTeamId ? [Number(savedTeamId)] : []),
  timeRange: getInitialTimeRange(savedTimeRange),
  sidebarCollapsed: savedCollapsed === 'true',
  refreshKey: 0,
  autoRefreshInterval: savedAutoRefresh !== null ? Number(savedAutoRefresh) : 10_000,
  theme: safeGet(STORAGE_KEYS.THEME, 'dark'),
  notificationsEnabled: safeGet(STORAGE_KEYS.NOTIFICATIONS) !== 'false',
  viewPreferences: safeGetJSON<ViewPreferences>(STORAGE_KEYS.VIEW_PREFS, {}),

  setSelectedTeamId: (teamId: number | null): void => {
    if (teamId !== null) {
      safeSet(STORAGE_KEYS.TEAM_ID, String(teamId));
    } else {
      safeSet(STORAGE_KEYS.TEAM_ID, '');
    }
    set({ selectedTeamId: teamId });

    // Intentionally fire-and-forget cache invalidation after team switch.
    void invalidateQueryClientCache();
  },

  setSelectedTeamIds: (teamIds: number[]): void => {
    const primary = teamIds[0] ?? null;
    if (primary !== null) {
      safeSet(STORAGE_KEYS.TEAM_ID, String(primary));
    } else {
      safeSet(STORAGE_KEYS.TEAM_ID, '');
    }
    setStoredTeamIds(teamIds);
    set({ selectedTeamIds: teamIds, selectedTeamId: primary });

    // Intentionally fire-and-forget cache invalidation after team switch.
    void invalidateQueryClientCache();
  },

  setTimeRange: (valueOrRange: string | TimeRange): void => {
    const value = typeof valueOrRange === 'string' ? valueOrRange : valueOrRange.value;
    const range = asTimeRange(TIME_RANGES.find((candidate) => candidate.value === value));
    if (!range) {
      return;
    }

    safeSet(STORAGE_KEYS.TIME_RANGE, range.value);
    set((state) => ({ timeRange: range, refreshKey: state.refreshKey + 1 }));
  },

  setCustomTimeRange: (customRange: TimeRange): void => {
    safeSet(STORAGE_KEYS.TIME_RANGE, 'custom');
    set((state) => ({ timeRange: customRange, refreshKey: state.refreshKey + 1 }));
  },

  toggleSidebar: (): void => {
    set((state) => {
      const sidebarCollapsed = !state.sidebarCollapsed;
      safeSet(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(sidebarCollapsed));
      return { sidebarCollapsed };
    });
  },

  triggerRefresh: (): void => {
    set((state) => ({ refreshKey: state.refreshKey + 1 }));
  },

  setAutoRefreshInterval: (ms: number): void => {
    safeSet(STORAGE_KEYS.AUTO_REFRESH, String(ms));
    set({ autoRefreshInterval: ms });
  },

  setTheme: (theme: string): void => {
    safeSet(STORAGE_KEYS.THEME, theme);
    set({ theme });
  },

  setNotificationsEnabled: (enabled: boolean): void => {
    safeSet(STORAGE_KEYS.NOTIFICATIONS, String(enabled));
    set({ notificationsEnabled: enabled });
  },

  setViewPreference: (key: string, value: unknown): void => {
    set((state) => {
      const viewPreferences = { ...state.viewPreferences, [key]: value };
      safeSetJSON(STORAGE_KEYS.VIEW_PREFS, viewPreferences);
      return { viewPreferences };
    });
  },
}));
