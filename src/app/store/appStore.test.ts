import { afterEach, describe, expect, it, vi } from 'vitest';

import { STORAGE_KEYS } from '@config/constants';

async function loadStore(
  seed: Record<string, string> = {}
): Promise<typeof import('./appStore').useAppStore> {
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

  it('hydrates initial state from storage and migrates legacy format', async () => {
    const useAppStore = await loadStore({
      [STORAGE_KEYS.APP_STATE]: JSON.stringify({
        state: {
          selectedTeamId: 42,
          selectedTeamIds: [42],
          timeRange: { label: 'Last 24 hours', value: '24h', minutes: 1440 },
          sidebarCollapsed: true,
          autoRefreshInterval: 30000,
          theme: 'light',
          notificationsEnabled: false,
          viewPreferences: { density: 'compact' },
        },
        version: 0,
      }),
    });

    expect(useAppStore.getState()).toMatchObject({
      selectedTeamId: 42,
      timeRange: expect.objectContaining({ kind: 'relative', preset: '24h', minutes: 1440 }),
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
    expect(localStorage.getItem(STORAGE_KEYS.APP_STATE)).toContain('"selectedTeamId":7');

    const refreshKey = useAppStore.getState().refreshKey;
    useAppStore.getState().setTimeRange({ kind: 'relative', preset: '7d', label: 'Last 7 days', minutes: 10080 });

    expect(useAppStore.getState().timeRange).toMatchObject({ kind: 'relative', preset: '7d' });
    expect(useAppStore.getState().refreshKey).toBe(refreshKey + 1);
    expect(localStorage.getItem(STORAGE_KEYS.APP_STATE)).toContain('"preset":"7d"');
  });

  it('supports custom ranges, sidebar toggles, and preferences', async () => {
    const useAppStore = await loadStore();

    const initialRefresh = useAppStore.getState().refreshKey;
    useAppStore.getState().setCustomTimeRange(1000, 2000, 'Custom');
    expect(useAppStore.getState().timeRange).toEqual({
      kind: 'absolute',
      startMs: 1000,
      endMs: 2000,
      label: 'Custom',
    });
    expect(useAppStore.getState().refreshKey).toBe(initialRefresh + 1);
    expect(localStorage.getItem(STORAGE_KEYS.APP_STATE)).toContain('"kind":"absolute"');

    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarCollapsed).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.APP_STATE)).toContain('"sidebarCollapsed":true');

    useAppStore.getState().setAutoRefreshInterval(60_000);
    useAppStore.getState().setTheme('light');
    useAppStore.getState().setNotificationsEnabled(false);
    useAppStore.getState().setViewPreference('density', 'compact');
    useAppStore.getState().triggerRefresh();

    expect(useAppStore.getState()).toMatchObject({
      autoRefreshInterval: 60_000,
      theme: 'light',
      notificationsEnabled: false,
      viewPreferences: { density: 'compact' },
    });
    const rawViewPrefs = localStorage.getItem(STORAGE_KEYS.APP_STATE);
    expect(rawViewPrefs).not.toBeNull();
    const parsed = JSON.parse(rawViewPrefs ?? '{}');
    expect(parsed.state).toMatchObject({
      autoRefreshInterval: 60_000,
      theme: 'light',
      notificationsEnabled: false,
      viewPreferences: { density: 'compact' },
    });
  });

  it('tracks recent time ranges', async () => {
    const useAppStore = await loadStore();

    useAppStore.getState().setTimeRange({ kind: 'relative', preset: '5m', label: '5m', minutes: 5 });
    useAppStore.getState().setTimeRange({ kind: 'relative', preset: '1h', label: '1h', minutes: 60 });
    useAppStore.getState().setTimeRange({ kind: 'relative', preset: '7d', label: '7d', minutes: 10080 });

    const recent = useAppStore.getState().recentTimeRanges;
    expect(recent).toHaveLength(3);
    expect(recent[0]).toMatchObject({ preset: '7d' });
    expect(recent[1]).toMatchObject({ preset: '1h' });
    expect(recent[2]).toMatchObject({ preset: '5m' });
  });

  it('sets timezone and comparison mode', async () => {
    const useAppStore = await loadStore();

    useAppStore.getState().setTimezone('UTC');
    expect(useAppStore.getState().timezone).toBe('UTC');

    useAppStore.getState().setComparisonMode('previous_period');
    expect(useAppStore.getState().comparisonMode).toBe('previous_period');
  });
});
