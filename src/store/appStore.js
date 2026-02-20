import { create } from 'zustand';
import { STORAGE_KEYS, TIME_RANGES } from '@config/constants';

const defaultTimeRange = TIME_RANGES.find((r) => r.value === '1h') || TIME_RANGES[3];

const savedTeamId = localStorage.getItem(STORAGE_KEYS.TEAM_ID);
const savedTimeRange = localStorage.getItem(STORAGE_KEYS.TIME_RANGE);
const savedCollapsed = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);

export const useAppStore = create((set) => ({
  selectedTeamId: savedTeamId ? Number(savedTeamId) : 1,
  timeRange: savedTimeRange
    ? TIME_RANGES.find((r) => r.value === savedTimeRange) || defaultTimeRange
    : defaultTimeRange,
  sidebarCollapsed: savedCollapsed === 'true',
  refreshKey: 0,
  theme: localStorage.getItem('observex_theme') || 'dark',
  notificationsEnabled: localStorage.getItem('observex_notifications') !== 'false',
  viewPreferences: JSON.parse(localStorage.getItem('observex_view_prefs') || '{}'),

  setSelectedTeamId: (teamId) => {
    localStorage.setItem(STORAGE_KEYS.TEAM_ID, teamId);
    set({ selectedTeamId: teamId });
  },

  setTimeRange: (valueOrRange) => {
    const val = typeof valueOrRange === 'string' ? valueOrRange : valueOrRange?.value;
    const range = TIME_RANGES.find((r) => r.value === val);
    if (range) {
      localStorage.setItem(STORAGE_KEYS.TIME_RANGE, range.value);
      set({ timeRange: range });
    }
  },

  toggleSidebar: () => {
    set((state) => {
      const newVal = !state.sidebarCollapsed;
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(newVal));
      return { sidebarCollapsed: newVal };
    });
  },

  triggerRefresh: () => {
    set((state) => ({ refreshKey: state.refreshKey + 1 }));
  },

  setTheme: (theme) => {
    localStorage.setItem('observex_theme', theme);
    set({ theme });
  },

  setNotificationsEnabled: (enabled) => {
    localStorage.setItem('observex_notifications', String(enabled));
    set({ notificationsEnabled: enabled });
  },

  setViewPreference: (key, value) => {
    set((state) => {
      const updated = { ...state.viewPreferences, [key]: value };
      localStorage.setItem('observex_view_prefs', JSON.stringify(updated));
      return { viewPreferences: updated };
    });
  },
}));
