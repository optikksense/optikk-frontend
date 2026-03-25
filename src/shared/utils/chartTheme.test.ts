import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getResolvedChartPalette, resolveThemeColor } from './chartTheme';

describe('chartTheme', () => {
  beforeEach(() => {
    document.documentElement.style.setProperty('--text-primary', '#e7eaf1');
    document.documentElement.style.setProperty('--text-secondary', '#b9c0cf');
    document.documentElement.style.setProperty('--chart-1', '#8b7fff');
    document.documentElement.style.setProperty('--chart-2', '#f38b6b');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('style');
  });

  it('resolves CSS custom properties passed as variable names or var() references', () => {
    expect(resolveThemeColor('--text-primary', '#ffffff')).toBe('#e7eaf1');
    expect(resolveThemeColor('var(--text-secondary)', '#ffffff')).toBe('#b9c0cf');
    expect(resolveThemeColor('#123456', '#ffffff')).toBe('#123456');
  });

  it('returns concrete palette colors for chart libraries', () => {
    expect(getResolvedChartPalette().slice(0, 2)).toEqual(['#8b7fff', '#f38b6b']);
    expect(getResolvedChartPalette().every((color) => !color.includes('var('))).toBe(true);
  });
});
