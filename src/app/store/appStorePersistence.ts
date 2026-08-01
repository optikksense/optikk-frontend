import type { TimeRange } from "@shared/types";

import type { ComparisonMode } from "@shared/components/ui/TimeSelector/constants";
import type { UserViewPreferences } from "@shared/types/preferences";

interface RecentPage {
  path: string;
  label: string;
  timestamp: number;
}

export interface PersistedAppState {
  readonly selectedTenantId: number | null;
  readonly selectedTenantIds: number[];
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

const MAX_RECENT_RANGES = 8;

export function pushRecentRange(existing: TimeRange[], newRange: TimeRange): TimeRange[] {
  const key =
    newRange.kind === "relative" ? newRange.preset : `${newRange.startMs}-${newRange.endMs}`;
  const filtered = existing.filter((range) => {
    const rangeKey = range.kind === "relative" ? range.preset : `${range.startMs}-${range.endMs}`;
    return rangeKey !== key;
  });
  return [newRange, ...filtered].slice(0, MAX_RECENT_RANGES);
}
