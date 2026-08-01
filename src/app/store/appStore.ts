import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AbsoluteTimeRange, RelativeTimeRange, TimeRange } from "@shared/types";
import { resolveTimeRangeBounds } from "@shared/types";

import { STORAGE_KEYS } from "@config/constants";
import type { ComparisonMode } from "@shared/components/ui/TimeSelector/constants";
import type { UserViewPreferenceKey, UserViewPreferences } from "@shared/types/preferences";

import { type PersistedAppState, pushRecentRange } from "./appStorePersistence";

interface ResolvedTimeBounds {
  readonly startTime: number;
  readonly endTime: number;
}

interface AppState extends PersistedAppState {
  readonly refreshKey: number;
  readonly lastRefreshAt: number;
  // Time bounds resolved once per user action (range change / refresh),
  // never during render. Query hooks key on these values.
  readonly resolvedTimeBounds: ResolvedTimeBounds;
  readonly setSelectedTenantId: (tenantId: number | null) => void;
  readonly setSelectedTenantIds: (tenantIds: number[]) => void;
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

const defaultPersistedState: PersistedAppState = {
  selectedTenantId: null,
  selectedTenantIds: [],
  timeRange: { kind: "relative", label: "Last 30 minutes", preset: "30m", minutes: 30 },
  sidebarCollapsed: false,
  autoRefreshInterval: 10_000,
  theme: "light",
  notificationsEnabled: true,
  viewPreferences: {},
  recentPages: [],
  recentTimeRanges: [],
  timezone: "local",
  comparisonMode: "off",
};

function mergePersistedState(persisted: unknown, current: AppState): AppState {
  const snapshot = persisted as Partial<PersistedAppState> | undefined;
  if (!snapshot) return current;

  const timeRange = snapshot.timeRange ?? current.timeRange;
  const selectedTenantIds = snapshot.selectedTenantIds ?? current.selectedTenantIds;
  return {
    ...current,
    ...snapshot,
    timeRange,
    resolvedTimeBounds: resolveTimeRangeBounds(timeRange),
    selectedTenantIds,
    selectedTenantId: snapshot.selectedTenantId ?? selectedTenantIds[0] ?? null,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...defaultPersistedState,
      refreshKey: 0,
      lastRefreshAt: Date.now(),
      resolvedTimeBounds: resolveTimeRangeBounds(defaultPersistedState.timeRange),

      // Tenant isolation is carried by the query keys: useStandardQuery
      // appends tenantId to every key, so a scope switch can never render
      // another tenant's cached response.
      setSelectedTenantId: (selectedTenantId) =>
        set({
          selectedTenantId,
          selectedTenantIds: selectedTenantId == null ? [] : [selectedTenantId],
        }),

      setSelectedTenantIds: (selectedTenantIds) =>
        set({ selectedTenantIds, selectedTenantId: selectedTenantIds[0] ?? null }),

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
            resolvedTimeBounds: resolveTimeRangeBounds(range),
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
            resolvedTimeBounds: { startTime: startMs, endTime: endMs },
            recentTimeRanges: pushRecentRange(state.recentTimeRanges, range),
          };
        });
      },

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      triggerRefresh: (): void => {
        set((state) => {
          // Advance relative bounds so query keys pick up the new window.
          const next = resolveTimeRangeBounds(state.timeRange);
          const unchanged =
            next.startTime === state.resolvedTimeBounds.startTime &&
            next.endTime === state.resolvedTimeBounds.endTime;
          return {
            refreshKey: state.refreshKey + 1,
            lastRefreshAt: Date.now(),
            resolvedTimeBounds: unchanged ? state.resolvedTimeBounds : next,
          };
        });
      },

      setAutoRefreshInterval: (autoRefreshInterval) => set({ autoRefreshInterval }),
      setTheme: (theme) => set({ theme }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),

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

      setTimezone: (timezone) => set({ timezone }),
      setComparisonMode: (comparisonMode) => set({ comparisonMode }),
    }),
    {
      name: STORAGE_KEYS.APP_STATE,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedAppState => ({
        selectedTenantId: state.selectedTenantId,
        selectedTenantIds: state.selectedTenantIds,
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
      merge: mergePersistedState,
    }
  )
);

// Computed selectors — use these instead of accessing store shape directly.
// Reduces coupling so store internals can change without updating every consumer.
export const useTimeRange = () => useAppStore((s) => s.timeRange);
export const useResolvedTimeBounds = () => useAppStore((s) => s.resolvedTimeBounds);
export const useTenantId = () => useAppStore((s) => s.selectedTenantId);
export const useRefreshKey = () => useAppStore((s) => s.refreshKey);
export const useLastRefreshAt = () => useAppStore((s) => s.lastRefreshAt);
export const useSidebarCollapsed = () => useAppStore((s) => s.sidebarCollapsed);
export const useTheme = () => useAppStore((s) => s.theme);
export const useTimezone = () => useAppStore((s) => s.timezone);
