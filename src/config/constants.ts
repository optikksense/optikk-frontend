/**
 * Application Configuration
 * Centralized configuration for the entire React application
 */

export /**
 *
 */
const UI_CONFIG = {
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

export /**
 *
 */
const TIME_RANGES: import("@/types").RelativeTimeRange[] = [
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

export /**
 *
 */
const STATUS_COLORS = {
  OK: "#73C991",
  ERROR: "#F04438",
  WARNING: "#F7B63A",
  INFO: "#67B7C9",
  UNKNOWN: "#6B7280",
};

export /**
 *
 */
const LOG_LEVELS = {
  TRACE: { label: "Trace", color: "#6B7280" },
  DEBUG: { label: "Debug", color: "#67B7C9" },
  INFO: { label: "Info", color: "#73C991" },
  WARN: { label: "Warn", color: "#F7B63A" },
  ERROR: { label: "Error", color: "#F04438" },
  FATAL: { label: "Fatal", color: "#991B1B" },
};

export /**
 *
 */
const CHART_COLORS = [
  "#8B7FFF",
  "#F38B6B",
  "#66C2A5",
  "#F2C14E",
  "#D978FF",
  "#6BB6FF",
  "#EF6F98",
  "#8CD6C5",
  "#A695FF",
  "#8EA1FF",
];

export /**
 *
 */
const STORAGE_KEYS = {
  APP_STATE: "optikk_app_state",
  AUTH_STATE: "optikk_auth_state",
  USER_DATA: "optikk_user_data",
  TEAM_ID: "optikk_team_id",
  TEAM_IDS: "optikk_team_ids",
  TIME_RANGE: "optikk_time_range",
  SIDEBAR_COLLAPSED: "optikk_sidebar_collapsed",
  AUTO_REFRESH: "optikk_auto_refresh",
  THEME: "optikk_theme",
  NOTIFICATIONS: "optikk_notifications",
  VIEW_PREFS: "optikk_view_prefs",
};

// Auto-refresh interval options (value = milliseconds, 0 = off)
export /**
 *
 */
const AUTO_REFRESH_INTERVALS = [
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
