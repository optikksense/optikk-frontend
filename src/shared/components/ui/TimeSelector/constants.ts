export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const RANGE_GROUPS = [
  {
    title: 'Minutes',
    items: [
      { label: '5m', value: '5m', minutes: 5 },
      { label: '15m', value: '15m', minutes: 15 },
      { label: '30m', value: '30m', minutes: 30 },
    ],
  },
  {
    title: 'Hours',
    items: [
      { label: '1h', value: '1h', minutes: 60 },
      { label: '3h', value: '3h', minutes: 180 },
      { label: '6h', value: '6h', minutes: 360 },
      { label: '12h', value: '12h', minutes: 720 },
      { label: '24h', value: '24h', minutes: 1440 },
    ],
  },
  {
    title: 'Days',
    items: [
      { label: '2d', value: '2d', minutes: 2880 },
      { label: '7d', value: '7d', minutes: 10080 },
      { label: '30d', value: '30d', minutes: 43200 },
      { label: '90d', value: '90d', minutes: 129600 },
    ],
  },
];

export const DISPLAY_MAP: Record<string, string> = {
  '5m': 'Last 5 min',
  '15m': 'Last 15 min',
  '30m': 'Last 30 min',
  '1h': 'Last 1 hour',
  '3h': 'Last 3 hours',
  '6h': 'Last 6 hours',
  '12h': 'Last 12 hours',
  '24h': 'Last 24 hours',
  '2d': 'Last 2 days',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

export const TIME_PICKER_TOKENS = {
  colors: {
    muted: '#6B7280',
    cyan: '#22D3EE',
    cyanMid: '#06AED5',
    cyanDim: 'rgba(34, 211, 238, 0.15)',
    cyanGlow: 'rgba(34, 211, 238, 0.4)',
    text: '#F9FAFB',
    panel2: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
    blackBtn: '#000000',
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
};
