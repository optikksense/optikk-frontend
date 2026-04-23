import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AbsoluteTimeRange, RelativeTimeRange, TimeRange } from "@/types";

import { STORAGE_KEYS } from "@config/constants";
import type { ComparisonMode } from "@shared/components/ui/TimeSelector/constants";
import type {
  UserViewPreferenceKey,
  UserViewPreferenceValue,
  UserViewPreferences,
} from "@shared/types/preferences";

import {
  type PersistedAppState,
  loadLegacyAppState,
  migrateTimeRange,
  pushRecentRange,
} from "./appStoreMigrations";

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

const defaultPersistedState = loadLegacyAppState();

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
        set((state) => {
          const isSame =
            state.timeRange.kind === range.kind &&
            (range.kind === "relative"
              ? range.preset === (state.timeRange as RelativeTimeRange).preset
              : (state.timeRange as AbsoluteTimeRange).startMs === range.startMs &&
                (state.timeRange as AbsoluteTimeRange).endMs === range.endMs);

          if (isSame) return state;

          return {
            timeRange: range,
            refreshKey: state.refreshKey + 1,
            recentTimeRanges: pushRecentRange(state.recentTimeRanges, range),
          };
        });
      },

      setCustomTimeRange: (startMs: number, endMs: number, label?: string): void => {
        set((state) => {
          const isSame =
            state.timeRange.kind === "absolute" &&
            (state.timeRange as AbsoluteTimeRange).startMs === startMs &&
            (state.timeRange as AbsoluteTimeRange).endMs === endMs;

          if (isSame) return state;

          const range: TimeRange = {
            kind: "absolute",
            startMs,
            endMs,
            label: label ?? "Custom range",
          };
          return {
            timeRange: range,
            refreshKey: state.refreshKey + 1,
            recentTimeRanges: pushRecentRange(state.recentTimeRanges, range),
          };
        });
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

        const selectedTeamIds = snapshot.selectedTeamIds ?? current.selectedTeamIds;
        let selectedTeamId = snapshot.selectedTeamId ?? current.selectedTeamId;
        if (selectedTeamId == null && selectedTeamIds.length > 0) {
          selectedTeamId = selectedTeamIds[0] ?? null;
        }

        return {
          ...current,
          ...snapshot,
          timeRange: migrateTimeRange(snapshot.timeRange),
          selectedTeamIds,
          selectedTeamId,
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
export const useAutoRefreshInterval = () => useAppStore((s) => s.autoRefreshInterval);
export const useNotificationsEnabled = () => useAppStore((s) => s.notificationsEnabled);
export const useViewPreferences = () => useAppStore((s) => s.viewPreferences);
export const useRecentPages = () => useAppStore((s) => s.recentPages);
export const useRecentTimeRanges = () => useAppStore((s) => s.recentTimeRanges);
