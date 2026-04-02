const CHART_THEME_FALLBACKS = {
  textPrimary: '#e7eaf1',
  textSecondary: '#b9c0cf',
  textMuted: '#8e96a9',
  bgPrimary: '#0f1117',
  bgSecondary: '#151821',
  bgTertiary: '#1c212c',
  borderColor: '#2b3140',
  borderLight: 'rgba(255,255,255,0.08)',
  colorPrimary: '#3b82f6',
  colorInfo: '#67b7c9',
} as const;

const CHART_PALETTE_TOKENS = [
  ['--chart-1', '#3b82f6'],
  ['--chart-2', '#f38b6b'],
  ['--chart-3', '#66c2a5'],
  ['--chart-4', '#f2c14e'],
  ['--chart-5', '#d978ff'],
  ['--chart-6', '#6bb6ff'],
  ['--chart-7', '#ef6f98'],
  ['--chart-8', '#8cd6c5'],
] as const;

function readCssVariable(variableName: string, fallback: string): string {
  if (typeof document === 'undefined') {
    return fallback;
  }

  return (
    getComputedStyle(document.documentElement).getPropertyValue(variableName).trim() || fallback
  );
}

/**
 * Resolve a CSS custom property or return a literal color unchanged.
 */
export function resolveThemeColor(token: string, fallback: string): string {
  const trimmed = token.trim();
  if (!trimmed) {
    return fallback;
  }

  if (trimmed.startsWith('--')) {
    return readCssVariable(trimmed, fallback);
  }

  const cssVarMatch = trimmed.match(/^var\((--[^),\s]+)(?:,\s*([^)]+))?\)$/);
  if (cssVarMatch) {
    return readCssVariable(cssVarMatch[1], cssVarMatch[2]?.trim() || fallback);
  }

  return trimmed;
}

export function getResolvedChartPalette(): string[] {
  return CHART_PALETTE_TOKENS.map(([token, fallback]) => resolveThemeColor(token, fallback));
}

export const CHART_THEME_DEFAULTS = {
  textPrimary: () => resolveThemeColor('--text-primary', CHART_THEME_FALLBACKS.textPrimary),
  textSecondary: () => resolveThemeColor('--text-secondary', CHART_THEME_FALLBACKS.textSecondary),
  textMuted: () => resolveThemeColor('--text-muted', CHART_THEME_FALLBACKS.textMuted),
  bgPrimary: () => resolveThemeColor('--bg-primary', CHART_THEME_FALLBACKS.bgPrimary),
  bgSecondary: () => resolveThemeColor('--bg-secondary', CHART_THEME_FALLBACKS.bgSecondary),
  bgTertiary: () => resolveThemeColor('--bg-tertiary', CHART_THEME_FALLBACKS.bgTertiary),
  borderColor: () => resolveThemeColor('--border-color', CHART_THEME_FALLBACKS.borderColor),
  borderLight: () => resolveThemeColor('--border-light', CHART_THEME_FALLBACKS.borderLight),
  colorPrimary: () => resolveThemeColor('--color-primary', CHART_THEME_FALLBACKS.colorPrimary),
  colorInfo: () => resolveThemeColor('--color-info', CHART_THEME_FALLBACKS.colorInfo),
} as const;
