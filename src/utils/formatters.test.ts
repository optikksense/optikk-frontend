import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  formatDuration,
  formatNumber,
  formatPercentage,
  formatRelativeTime,
  getErrorRateColor,
  getHealthColor,
  normalizePercentage,
  truncateText,
} from './formatters';

describe('formatters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T12:00:00.000Z'));
  });

  it('formats large numbers and invalid values', () => {
    expect(formatNumber(950)).toBe('950');
    expect(formatNumber(1_500)).toBe('1.5K');
    expect(formatNumber(2_500_000)).toBe('2.5M');
    expect(formatNumber(3_500_000_000)).toBe('3.5B');
    expect(formatNumber('invalid')).toBe('0');
  });

  it('formats durations across supported units', () => {
    expect(formatDuration(0.25)).toBe('250μs');
    expect(formatDuration(250)).toBe('250ms');
    expect(formatDuration(1_500)).toBe('1.50s');
    expect(formatDuration(120_000)).toBe('2.00m');
    expect(formatDuration('bad')).toBe('0ms');
  });

  it('normalizes and formats percentages with optional clamping', () => {
    expect(normalizePercentage(0.37)).toBe(37);
    expect(normalizePercentage(175)).toBe(100);
    expect(normalizePercentage(-12)).toBe(0);
    expect(normalizePercentage(175, false)).toBe(175);
    expect(formatPercentage(0.1234, 1)).toBe('12.3%');
    expect(formatPercentage(175, 0, false)).toBe('175%');
  });

  it('formats relative times by recency', () => {
    expect(formatRelativeTime('2026-03-01T11:59:30.000Z')).toBe('30s ago');
    expect(formatRelativeTime('2026-03-01T11:45:00.000Z')).toBe('15m ago');
    expect(formatRelativeTime('2026-03-01T08:00:00.000Z')).toBe('4h ago');
    expect(formatRelativeTime('2026-02-27T12:00:00.000Z')).toBe('2d ago');
    expect(formatRelativeTime('2025-12-01T12:00:00.000Z')).toContain('12/1/2025');
  });

  it('returns display helpers for colors and truncation', () => {
    expect(getHealthColor('healthy')).toBe('#73C991');
    expect(getHealthColor('missing')).toBe('#98A2B3');
    expect(getErrorRateColor(0.4)).toBe('#73C991');
    expect(getErrorRateColor(3)).toBe('#F79009');
    expect(getErrorRateColor(7)).toBe('#F04438');
    expect(truncateText('short', 10)).toBe('short');
    expect(truncateText('1234567890', 5)).toBe('12345...');
  });
});
