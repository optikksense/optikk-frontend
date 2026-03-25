import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { TimeRange, RelativeTimeRange } from '@/types';

import { STORAGE_KEYS, TIME_RANGES } from '@config/constants';
import type { ComparisonMode } from '@shared/components/ui/TimeSelector/constants';
import type {
  UserViewPreferenceKey,
  UserViewPreferenceValue,
  UserViewPreferences,
} from '@shared/types/preferences';

interface RecentPage {
  path: string;
  label: string;
  timestamp: number;
}

interface PersistedAppState {
  readonly selectedTeamId: number | null;
  readonly selectedTeamIds: number[];
  readonly timeRange: TimeRange;
  readonly sidebarCollapsed: boolean;
  readonly autoRefreshInterval: number;
  readonly theme: string;
  readonly notificationsEnabled: boolean;
  readonly viewPreferences: UserViewPreferences;
  readonly recentPages: RecentPage[];
  readonly recentTimeRanges: TimeRange[];
  readonly timezone: string;
  readonly comparisonMode: ComparisonMode;
}

interface AppState extends PersistedAppState {
  readonly refreshKey: number;
  readonly setSelectedTeamId: (teamId: number | null) => void;
  readonly setSelectedTeamIds: (teamIds: number[]) => void;
  readonly setTimeRange: (range: TimeRange) => void;
  readonly setCustomTimeRange: (startMs: number, endMs: number, label?: string) => void;
  readonly toggleSidebar: () => void;
  readonly triggerRefresh: () => void;
  readonly setAutoRefreshInterval: (ms: number) => void;
  readonly setTheme: (theme: string) => void;
  readonly setNotificationsEnabled: (enabled: boolean) => void;
  readonly setViewPreference: <K extends UserViewPreferenceKey>(
    key: K,
    value: NonNullable<UserViewPreferences[K]>
  ) => void;
  readonly addRecentPage: (path: string, label: string) => void;
  readonly toggleFavorite: (path: string) => void;
  readonly setTimezone: (tz: string) => void;
  readonly setComparisonMode: (mode: ComparisonMode) => void;
}

const MAX_RECENT_RANGES = 8;

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function readLegacyJSON<T>(key: string, fallback: T): T {
  const raw = readStorage(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function findPreset(preset: string): RelativeTimeRange | null {
  return TIME_RANGES.find((r) => r.preset === preset) ?? null;
}

function getDefaultTimeRange(): RelativeTimeRange {
  return findPreset('30m') ?? TIME_RANGES[2];
}

/**
 * Migrate old TimeRange shapes ({ value, minutes, startTime, endTime })
 * to the new discriminated union.
 */
function migrateTimeRange(value: unknown): TimeRange {
  if (!value || typeof value !== 'object') {
    return getDefaultTimeRange();
  }

  const raw = value as Record<string, unknown>;

  // Already new format
  if (raw.kind === 'relative' && typeof raw.preset === 'string') {
    const found = findPreset(raw.preset as string);
    return found ?? getDefaultTimeRange();
  }
  if (raw.kind === 'absolute' && typeof raw.startMs === 'number' && typeof raw.endMs === 'number') {
    return value as TimeRange;
  }

  // Legacy format: { value: '1h', minutes: 60 }
  if (typeof raw.value === 'string' && raw.value !== 'custom') {
    const found = findPreset(raw.value as string);
    return found ?? getDefaultTimeRange();
  }

  // Legacy custom: { value: 'custom', startTime, endTime }
  if (raw.value === 'custom') {
    const startMs = Number(raw.startTime);
    const endMs = Number(raw.endTime);
    if (Number.isFinite(startMs) && Number.isFinite(endMs) && startMs < endMs) {
      return {
        kind: 'absolute',
        startMs,
        endMs,
        label: typeof raw.label === 'string' ? raw.label : 'Custom range',
      };
    }
  }

  return getDefaultTimeRange();
}

function pushRecentRange(existing: TimeRange[], newRange: TimeRange): TimeRange[] {
  const key =
    newRange.kind === 'relative' ? newRange.preset : `${newRange.startMs}-${newRange.endMs}`;
  const filtered = existing.filter((r) => {
    const rKey = r.kind === 'relative' ? r.preset : `${r.startMs}-${r.endMs}`;
    return rKey !== key;
  });
  return [newRange, ...filtered].slice(0, MAX_RECENT_RANGES);
}

function readLegacyTeamIDs(): number[] {
  const raw = readStorage(STORAGE_KEYS.TEAM_IDS);
  if (!raw) {
    return [];
  }

  return raw
    .split(',')
    .map(Number)
    .filter((teamId) => Number.isFinite(teamId) && teamId > 0);
}

function loadLegacyAppState(): PersistedAppState {
  const selectedTeamIdRaw = readStorage(STORAGE_KEYS.TEAM_ID);
  const selectedTeamId =
    selectedTeamIdRaw && Number.isFinite(Number(selectedTeamIdRaw))
      ? Number(selectedTeamIdRaw)
      : null;
  const selectedTeamIds = readLegacyTeamIDs();

  return {
    selectedTeamId,
    selectedTeamIds:
      selectedTeamIds.length > 0 ? selectedTeamIds : selectedTeamId != null ? [selectedTeamId] : [],
    timeRange: migrateTimeRange(readStorage(STORAGE_KEYS.TIME_RANGE)),
    sidebarCollapsed: readStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true',
    autoRefreshInterval: Number(readStorage(STORAGE_KEYS.AUTO_REFRESH) ?? '10000') || 10_000,
    theme: readStorage(STORAGE_KEYS.THEME) ?? 'dark',
    notificationsEnabled: readStorage(STORAGE_KEYS.NOTIFICATIONS) !== 'false',
    viewPreferences: readLegacyJSON<UserViewPreferences>(STORAGE_KEYS.VIEW_PREFS, {}),
    recentPages: [],
    recentTimeRanges: [],
    timezone: 'local',
    comparisonMode: 'off',
  };
}

function initialState(): PersistedAppState {
  return loadLegacyAppState();
}

const defaultPersistedState = initialState();

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...defaultPersistedState,
      refreshKey: 0,

      setSelectedTeamId: (teamId: number | null): void => {
        set({
          selectedTeamId: teamId,
          selectedTeamIds: teamId != null ? [teamId] : [],
        });
      },

      setSelectedTeamIds: (teamIds: number[]): void => {
        const primary = teamIds[0] ?? null;
        set({
          selectedTeamIds: teamIds,
          selectedTeamId: primary,
        });
      },

      setTimeRange: (range: TimeRange): void => {
        set((state) => ({
          timeRange: range,
          refreshKey: state.refreshKey + 1,
          recentTimeRanges: pushRecentRange(state.recentTimeRanges, range),
        }));
      },

      setCustomTimeRange: (startMs: number, endMs: number, label?: string): void => {
        const range: TimeRange = {
          kind: 'absolute',
          startMs,
          endMs,
          label: label ?? 'Custom range',
        };
        set((state) => ({
          timeRange: range,
          refreshKey: state.refreshKey + 1,
          recentTimeRanges: pushRecentRange(state.recentTimeRanges, range),
        }));
      },

      toggleSidebar: (): void => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      triggerRefresh: (): void => {
        set((state) => ({ refreshKey: state.refreshKey + 1 }));
      },

      setAutoRefreshInterval: (ms: number): void => {
        set({ autoRefreshInterval: ms });
      },

      setTheme: (theme: string): void => {
        set({ theme });
      },

      setNotificationsEnabled: (enabled: boolean): void => {
        set({ notificationsEnabled: enabled });
      },

      setViewPreference: <K extends UserViewPreferenceKey>(
        key: K,
        value: NonNullable<UserViewPreferences[K]>
      ): void => {
        set((state) => ({
          viewPreferences: { ...state.viewPreferences, [key]: value },
        }));
      },

      addRecentPage: (path: string, label: string): void => {
        set((state) => {
          const filtered = state.recentPages.filter((p) => p.path !== path);
          const next = [{ path, label, timestamp: Date.now() }, ...filtered].slice(0, 5);
          return { recentPages: next };
        });
      },

      toggleFavorite: (path: string): void => {
        set((state) => {
          const current = state.viewPreferences.favorites ?? [];
          const next = current.includes(path)
            ? current.filter((p) => p !== path)
            : [...current, path];
          return { viewPreferences: { ...state.viewPreferences, favorites: next } };
        });
      },

      setTimezone: (tz: string): void => {
        set({ timezone: tz });
      },

      setComparisonMode: (mode: ComparisonMode): void => {
        set({ comparisonMode: mode });
      },
    }),
    {
      name: STORAGE_KEYS.APP_STATE,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedAppState => ({
        selectedTeamId: state.selectedTeamId,
        selectedTeamIds: state.selectedTeamIds,
        timeRange: state.timeRange,
        sidebarCollapsed: state.sidebarCollapsed,
        autoRefreshInterval: state.autoRefreshInterval,
        theme: state.theme,
        notificationsEnabled: state.notificationsEnabled,
        viewPreferences: state.viewPreferences,
        recentPages: state.recentPages,
        recentTimeRanges: state.recentTimeRanges,
        timezone: state.timezone,
        comparisonMode: state.comparisonMode,
      }),
      merge: (persisted, current) => {
        const snapshot = persisted as Partial<PersistedAppState> | undefined;
        if (!snapshot) {
          return current;
        }

        return {
          ...current,
          ...snapshot,
          timeRange: migrateTimeRange(snapshot.timeRange),
          selectedTeamIds: snapshot.selectedTeamIds ?? current.selectedTeamIds,
          selectedTeamId: snapshot.selectedTeamId ?? current.selectedTeamId,
          viewPreferences: snapshot.viewPreferences ?? current.viewPreferences,
          recentPages: snapshot.recentPages ?? current.recentPages,
          recentTimeRanges: snapshot.recentTimeRanges ?? current.recentTimeRanges,
          timezone: snapshot.timezone ?? current.timezone,
          comparisonMode: snapshot.comparisonMode ?? current.comparisonMode,
        };
      },
    }
  )
);

// Computed selectors — use these instead of accessing store shape directly.
// Reduces coupling so store internals can change without updating every consumer.
export const useTimeRange = () => useAppStore((s) => s.timeRange);
export const useTeamId = () => useAppStore((s) => s.selectedTeamId);
export const useTeamIds = () => useAppStore((s) => s.selectedTeamIds);
export const useRefreshKey = () => useAppStore((s) => s.refreshKey);
export const useSidebarCollapsed = () => useAppStore((s) => s.sidebarCollapsed);
export const useTheme = () => useAppStore((s) => s.theme);
export const useTimezone = () => useAppStore((s) => s.timezone);
export const useComparisonMode = () => useAppStore((s) => s.comparisonMode);
