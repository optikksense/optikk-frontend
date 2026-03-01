/**
 * Application Configuration
 * Centralized configuration for the entire React application
 */

export const API_CONFIG = {
  BASE_URL: '/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      VALIDATE: '/auth/validate',
      ME: '/auth/me',
    },
    DASHBOARD: {
      OVERVIEW: '/dashboard/overview',
      METRICS: '/dashboard/metrics',
      LOGS: '/dashboard/logs',
      TRACES: '/dashboard/traces',
      SERVICES: '/dashboard/services',
    },
    TEAMS: {
      LIST: '/teams',
      SWITCH: '/teams/switch',
    },
    ALERTS: {
      LIST: '/alerts',
      PAGED: '/alerts/paged',
      CREATE: '/alerts',
      ACKNOWLEDGE: '/alerts', // + /{id}/acknowledge
      RESOLVE: '/alerts',     // + /{id}/resolve
      MUTE: '/alerts',        // + /{id}/mute
      ACTIVE_COUNT: '/alerts/count/active',
    },
    V1_BASE: '/v1',
    SETTINGS: {
      PROFILE: '/settings/profile',
      PREFERENCES: '/settings/preferences',
    },
    SERVICE_DETAIL: '/dashboard/services', // + /{serviceName}
  },
};

export const ALERT_SEVERITIES = [
  { label: 'Critical', value: 'critical', color: '#F04438' },
  { label: 'Warning', value: 'warning', color: '#F79009' },
  { label: 'Info', value: 'info', color: '#06AED5' },
];

export const ALERT_STATUSES = [
  { label: 'Active', value: 'ACTIVE', color: '#F04438' },
  { label: 'Acknowledged', value: 'ACKNOWLEDGED', color: '#F79009' },
  { label: 'Resolved', value: 'RESOLVED', color: '#73C991' },
  { label: 'Muted', value: 'MUTED', color: '#98A2B3' },
];

export const ALERT_TYPES = [
  { label: 'Metric', value: 'metric' },
  { label: 'Log', value: 'log' },
  { label: 'Trace', value: 'trace' },
  { label: 'APM', value: 'apm' },
];

export const ALERT_OPERATORS = [
  { label: '>', value: '>' },
  { label: '<', value: '<' },
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' },
  { label: '==', value: '==' },
  { label: '!=', value: '!=' },
];

export const INCIDENT_STATUSES = [
  { label: 'Open', value: 'open', color: '#F04438' },
  { label: 'Investigating', value: 'investigating', color: '#F79009' },
  { label: 'Identified', value: 'identified', color: '#06AED5' },
  { label: 'Monitoring', value: 'monitoring', color: '#5E60CE' },
  { label: 'Resolved', value: 'resolved', color: '#73C991' },
];

export const UI_CONFIG = {
  THEME: {
    PRIMARY_COLOR: '#5E60CE',
    SUCCESS_COLOR: '#73C991',
    WARNING_COLOR: '#F79009',
    ERROR_COLOR: '#F04438',
    INFO_COLOR: '#06AED5',
  },
  SIDEBAR_WIDTH: 240,
  SIDEBAR_COLLAPSED_WIDTH: 64,
  HEADER_HEIGHT: 64,
  PAGE_SIZES: [10, 20, 50, 100],
  DEFAULT_PAGE_SIZE: 20,
};

export const TIME_RANGES = [
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

export const STATUS_COLORS = {
  OK: '#73C991',
  ERROR: '#F04438',
  WARNING: '#F79009',
  INFO: '#06AED5',
  UNKNOWN: '#98A2B3',
};

export const LOG_LEVELS = {
  TRACE: { label: 'Trace', color: '#98A2B3' },
  DEBUG: { label: 'Debug', color: '#06AED5' },
  INFO: { label: 'Info', color: '#73C991' },
  WARN: { label: 'Warn', color: '#F79009' },
  ERROR: { label: 'Error', color: '#F04438' },
  FATAL: { label: 'Fatal', color: '#D92D20' },
};

export const CHART_COLORS = [
  '#5E60CE',
  '#73C991',
  '#F79009',
  '#06AED5',
  '#9E77ED',
  '#F04438',
  '#36BFFA',
  '#FDB022',
  '#F670C7',
  '#16B364',
];

export const SERVICE_HEALTH = {
  healthy: { label: 'Healthy', color: '#73C991' },
  degraded: { label: 'Degraded', color: '#F79009' },
  unhealthy: { label: 'Unhealthy', color: '#F04438' },
  unknown: { label: 'Unknown', color: '#98A2B3' },
};

export const INFRASTRUCTURE_TYPES = [
  { label: 'Host', value: 'host', icon: 'Server' },
  { label: 'Pod', value: 'pod', icon: 'Box' },
  { label: 'Container', value: 'container', icon: 'Container' },
];

export const TRACE_STATUSES = [
  { label: 'OK', value: 'OK', color: '#73C991' },
  { label: 'Error', value: 'ERROR', color: '#F04438' },
  { label: 'Unset', value: 'UNSET', color: '#98A2B3' },
];

export const DEPLOYMENT_STATUSES = [
  { label: 'Success', value: 'success', color: '#73C991' },
  { label: 'Failed', value: 'failed', color: '#F04438' },
  { label: 'In Progress', value: 'in_progress', color: '#F79009' },
  { label: 'Rolled Back', value: 'rolled_back', color: '#98A2B3' },
];

export const DEPLOYMENT_ENVIRONMENTS = [
  { label: 'Production', value: 'production' },
  { label: 'Staging', value: 'staging' },
  { label: 'Development', value: 'development' },
  { label: 'QA', value: 'qa' },
];

export const HEALTH_CHECK_TYPES = [
  { label: 'HTTP', value: 'http' },
  { label: 'TCP', value: 'tcp' },
  { label: 'ICMP', value: 'icmp' },
  { label: 'Synthetic', value: 'synthetic' },
];

export const HEALTH_CHECK_STATUSES = [
  { label: 'Up', value: 'up', color: '#73C991' },
  { label: 'Down', value: 'down', color: '#F04438' },
  { label: 'Degraded', value: 'degraded', color: '#F79009' },
];

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'optikk_auth_token',
  USER_DATA: 'optikk_user_data',
  TEAM_ID: 'optikk_team_id',
  TIME_RANGE: 'optikk_time_range',
  SIDEBAR_COLLAPSED: 'optikk_sidebar_collapsed',
  AUTO_REFRESH: 'optikk_auto_refresh',
  THEME: 'optikk_theme',
  NOTIFICATIONS: 'optikk_notifications',
  VIEW_PREFS: 'optikk_view_prefs',
};

// Auto-refresh interval options (value = milliseconds, 0 = off)
export const AUTO_REFRESH_INTERVALS = [
  { label: 'Off', value: 0 },
  { label: '10s', value: 10_000 },
  { label: '30s', value: 30_000 },
  { label: '1m', value: 60_000 },
  { label: '5m', value: 300_000 },
  { label: '10m', value: 600_000 },
];
