/**
 * Application Configuration
 * Centralized configuration for the entire React application
 */

export const UI_CONFIG = {
  THEME: {
    PRIMARY_COLOR: "#8B7FFF",
    SUCCESS_COLOR: "#73C991",
    WARNING_COLOR: "#F7B63A",
    ERROR_COLOR: "#F04438",
    INFO_COLOR: "#67B7C9",
  },
  SIDEBAR_WIDTH: 220,
  SIDEBAR_COLLAPSED_WIDTH: 56,
  HEADER_HEIGHT: 56,
  PAGE_SIZES: [10, 20, 50, 100],
  DEFAULT_PAGE_SIZE: 20,
};

export const TIME_RANGES: import("@/types").RelativeTimeRange[] = [
  { kind: "relative", label: "Last 5 minutes", preset: "5m", minutes: 5 },
  { kind: "relative", label: "Last 15 minutes", preset: "15m", minutes: 15 },
  { kind: "relative", label: "Last 30 minutes", preset: "30m", minutes: 30 },
  { kind: "relative", label: "Last 1 hour", preset: "1h", minutes: 60 },
  { kind: "relative", label: "Last 3 hours", preset: "3h", minutes: 180 },
  { kind: "relative", label: "Last 6 hours", preset: "6h", minutes: 360 },
  { kind: "relative", label: "Last 12 hours", preset: "12h", minutes: 720 },
  { kind: "relative", label: "Last 24 hours", preset: "24h", minutes: 1440 },
  { kind: "relative", label: "Last 7 days", preset: "7d", minutes: 10080 },
  { kind: "relative", label: "Last 30 days", preset: "30d", minutes: 43200 },
];
export const CHART_COLORS = [
  "#5ea9ff",
  "#f38b6b",
  "#34d399",
  "#facc15",
  "#c084fc",
  "#22d3ee",
  "#f472b6",
  "#a3e635",
  "#fb923c",
  "#818cf8",
];

export const STORAGE_KEYS = {
  APP_STATE: "optikk_app_state",
  TENANT_ID: "optikk_tenant_id",
  TENANT_IDS: "optikk_tenant_ids",
  TIME_RANGE: "optikk_time_range",
  SIDEBAR_COLLAPSED: "optikk_sidebar_collapsed",
  AUTO_REFRESH: "optikk_auto_refresh",
  THEME: "optikk_theme",
  NOTIFICATIONS: "optikk_notifications",
  VIEW_PREFS: "optikk_view_prefs",
};

export const AUTO_REFRESH_INTERVALS = [
  { label: "Off", value: 0 },
  { label: "5s", value: 5_000 },
  { label: "10s", value: 10_000 },
  { label: "30s", value: 30_000 },
  { label: "1m", value: 60_000 },
  { label: "5m", value: 300_000 },
  { label: "15m", value: 900_000 },
  { label: "30m", value: 1_800_000 },
  { label: "1h", value: 3_600_000 },
];
