import { afterEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS } from '@config/constants';

async function loadStore(seed: Record<string, string> = {}): Promise<typeof import('./appStore').useAppStore> {
  localStorage.clear();
  for (const [key, value] of Object.entries(seed)) {
    localStorage.setItem(key, value);
  }

  vi.resetModules();
  const module = await import('./appStore');
  return module.useAppStore;
}

describe('appStore', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('hydrates initial state from storage', async () => {
    const useAppStore = await loadStore({
      [STORAGE_KEYS.TEAM_ID]: '42',
      [STORAGE_KEYS.TIME_RANGE]: '24h',
      [STORAGE_KEYS.SIDEBAR_COLLAPSED]: 'true',
      [STORAGE_KEYS.AUTO_REFRESH]: '30000',
      [STORAGE_KEYS.THEME]: 'light',
      [STORAGE_KEYS.NOTIFICATIONS]: 'false',
      [STORAGE_KEYS.VIEW_PREFS]: JSON.stringify({ density: 'compact' }),
    });

    expect(useAppStore.getState()).toMatchObject({
      selectedTeamId: 42,
      timeRange: expect.objectContaining({ value: '24h' }),
      sidebarCollapsed: true,
      autoRefreshInterval: 30000,
      theme: 'light',
      notificationsEnabled: false,
      viewPreferences: { density: 'compact' },
    });
  });

  it('persists selected team and time range updates', async () => {
    const useAppStore = await loadStore();

    useAppStore.getState().setSelectedTeamId(7);
    expect(useAppStore.getState().selectedTeamId).toBe(7);
    expect(localStorage.getItem(STORAGE_KEYS.TEAM_ID)).toBe('7');

    const refreshKey = useAppStore.getState().refreshKey;
    useAppStore.getState().setTimeRange('7d');

    expect(useAppStore.getState().timeRange.value).toBe('7d');
    expect(useAppStore.getState().refreshKey).toBe(refreshKey + 1);
    expect(localStorage.getItem(STORAGE_KEYS.TIME_RANGE)).toBe('7d');

    useAppStore.getState().setTimeRange('not-a-range');
    expect(useAppStore.getState().timeRange.value).toBe('7d');
  });

  it('supports custom ranges, sidebar toggles, and preferences', async () => {
    const useAppStore = await loadStore();
    const customRange = {
      label: 'Custom',
      value: 'custom',
      startTime: 1000,
      endTime: 2000,
    };

    const initialRefresh = useAppStore.getState().refreshKey;
    useAppStore.getState().setCustomTimeRange(customRange);
    expect(useAppStore.getState().timeRange).toEqual(customRange);
    expect(useAppStore.getState().refreshKey).toBe(initialRefresh + 1);
    expect(localStorage.getItem(STORAGE_KEYS.TIME_RANGE)).toBe('custom');

    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarCollapsed).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED)).toBe('true');

    useAppStore.getState().setAutoRefreshInterval(60_000);
    useAppStore.getState().setTheme('light');
    useAppStore.getState().setNotificationsEnabled(false);
    useAppStore.getState().setViewPreference('chartDensity', 'compact');
    useAppStore.getState().triggerRefresh();

    expect(useAppStore.getState()).toMatchObject({
      autoRefreshInterval: 60_000,
      theme: 'light',
      notificationsEnabled: false,
      viewPreferences: { chartDensity: 'compact' },
    });
    expect(localStorage.getItem(STORAGE_KEYS.AUTO_REFRESH)).toBe('60000');
    expect(localStorage.getItem(STORAGE_KEYS.THEME)).toBe('light');
    expect(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)).toBe('false');
    const rawViewPrefs = localStorage.getItem(STORAGE_KEYS.VIEW_PREFS);
    expect(rawViewPrefs).not.toBeNull();
    expect(JSON.parse(rawViewPrefs ?? '{}')).toEqual({
      chartDensity: 'compact',
    });
  });
});
