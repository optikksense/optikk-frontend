/**
 * Application Configuration
 * Centralized configuration for the entire React application
 */



export /**
        *
        */
const UI_CONFIG = {
  THEME: {
    PRIMARY_COLOR: '#7C7FF2',
    SUCCESS_COLOR: '#52876B',
    WARNING_COLOR: '#D97706',
    ERROR_COLOR: '#DC2626',
    INFO_COLOR: '#4DA6C8',
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
const TIME_RANGES = [
  { label: 'Last 5 minutes', value: '5m', minutes: 5 },
  { label: 'Last 15 minutes', value: '15m', minutes: 15 },
  { label: 'Last 30 minutes', value: '30m', minutes: 30 },
  { label: 'Last 1 hour', value: '1h', minutes: 60 },
  { label: 'Last 3 hours', value: '3h', minutes: 180 },
  { label: 'Last 6 hours', value: '6h', minutes: 360 },
  { label: 'Last 12 hours', value: '12h', minutes: 720 },
  { label: 'Last 24 hours', value: '24h', minutes: 1440 },
  { label: 'Last 7 days', value: '7d', minutes: 10080 },
  { label: 'Last 30 days', value: '30d', minutes: 43200 },
];

export /**
        *
        */
const STATUS_COLORS = {
  OK: '#52876B',
  ERROR: '#DC2626',
  WARNING: '#D97706',
  INFO: '#4DA6C8',
  UNKNOWN: '#6B7280',
};

export /**
        *
        */
const LOG_LEVELS = {
  TRACE: { label: 'Trace', color: '#6B7280' },
  DEBUG: { label: 'Debug', color: '#4DA6C8' },
  INFO: { label: 'Info', color: '#52876B' },
  WARN: { label: 'Warn', color: '#D97706' },
  ERROR: { label: 'Error', color: '#DC2626' },
  FATAL: { label: 'Fatal', color: '#991B1B' },
};

export /**
        *
        */
const CHART_COLORS = [
  '#648FFF',
  '#785EF0',
  '#DC267F',
  '#FE6100',
  '#FFB000',
  '#009E73',
  '#56B4E9',
  '#CC79A7',
  '#7C7FF2',
  '#52876B',
];







export /**
        *
        */
const STORAGE_KEYS = {
  AUTH_TOKEN: 'optikk_auth_token',
  USER_DATA: 'optikk_user_data',
  TEAM_ID: 'optikk_team_id',
  TEAM_IDS: 'optikk_team_ids',
  TIME_RANGE: 'optikk_time_range',
  SIDEBAR_COLLAPSED: 'optikk_sidebar_collapsed',
  AUTO_REFRESH: 'optikk_auto_refresh',
  THEME: 'optikk_theme',
  NOTIFICATIONS: 'optikk_notifications',
  VIEW_PREFS: 'optikk_view_prefs',
};

// Auto-refresh interval options (value = milliseconds, 0 = off)
export /**
        *
        */
const AUTO_REFRESH_INTERVALS = [
  { label: 'Off', value: 0 },
  { label: '10s', value: 10_000 },
  { label: '30s', value: 30_000 },
  { label: '1m', value: 60_000 },
  { label: '5m', value: 300_000 },
  { label: '10m', value: 600_000 },
];
