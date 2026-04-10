import type { RelativeTimeRange, TimeRange } from "@/types";

import { STORAGE_KEYS, TIME_RANGES } from "@config/constants";
import type { ComparisonMode } from "@shared/components/ui/TimeSelector/constants";
import type { UserViewPreferences } from "@shared/types/preferences";

interface RecentPage {
  path: string;
  label: string;
  timestamp: number;
}

export interface PersistedAppState {
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
  return findPreset("30m") ?? TIME_RANGES[2];
}

/**
 * Migrate old TimeRange shapes ({ value, minutes, startTime, endTime })
 * to the new discriminated union.
 */
export function migrateTimeRange(value: unknown): TimeRange {
  if (!value || typeof value !== "object") {
    return getDefaultTimeRange();
  }

  const raw = value as Record<string, unknown>;

  // Already new format
  if (raw.kind === "relative" && typeof raw.preset === "string") {
    const found = findPreset(raw.preset as string);
    return found ?? getDefaultTimeRange();
  }
  if (raw.kind === "absolute" && typeof raw.startMs === "number" && typeof raw.endMs === "number") {
    return value as TimeRange;
  }

  // Legacy format: { value: '1h', minutes: 60 }
  if (typeof raw.value === "string" && raw.value !== "custom") {
    const found = findPreset(raw.value as string);
    return found ?? getDefaultTimeRange();
  }

  // Legacy custom: { value: 'custom', startTime, endTime }
  if (raw.value === "custom") {
    const startMs = Number(raw.startTime);
    const endMs = Number(raw.endTime);
    if (Number.isFinite(startMs) && Number.isFinite(endMs) && startMs < endMs) {
      return {
        kind: "absolute",
        startMs,
        endMs,
        label: typeof raw.label === "string" ? raw.label : "Custom range",
      };
    }
  }

  return getDefaultTimeRange();
}

const MAX_RECENT_RANGES = 8;

export function pushRecentRange(existing: TimeRange[], newRange: TimeRange): TimeRange[] {
  const key =
    newRange.kind === "relative" ? newRange.preset : `${newRange.startMs}-${newRange.endMs}`;
  const filtered = existing.filter((r) => {
    const rKey = r.kind === "relative" ? r.preset : `${r.startMs}-${r.endMs}`;
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
    .split(",")
    .map(Number)
    .filter((teamId) => Number.isFinite(teamId) && teamId > 0);
}

export function loadLegacyAppState(): PersistedAppState {
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
    sidebarCollapsed: readStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED) === "true",
    autoRefreshInterval: Number(readStorage(STORAGE_KEYS.AUTO_REFRESH) ?? "10000") || 10_000,
    theme: readStorage(STORAGE_KEYS.THEME) ?? "dark",
    notificationsEnabled: readStorage(STORAGE_KEYS.NOTIFICATIONS) !== "false",
    viewPreferences: readLegacyJSON<UserViewPreferences>(STORAGE_KEYS.VIEW_PREFS, {}),
    recentPages: [],
    recentTimeRanges: [],
    timezone: "local",
    comparisonMode: "off",
  };
}
