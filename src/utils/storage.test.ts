import { describe, expect, it, vi } from 'vitest';

import { safeGet, safeGetJSON, safeRemove, safeSet, safeSetJSON } from './storage';

describe('storage utils', () => {
  it('reads and writes primitive values safely', () => {
    safeSet('theme', 'dark');
    expect(safeGet('theme')).toBe('dark');
    safeRemove('theme');
    expect(safeGet('theme', 'light')).toBe('light');
  });

  it('reads and writes JSON payloads safely', () => {
    safeSetJSON('prefs', { density: 'compact' });
    expect(safeGetJSON('prefs')).toEqual({ density: 'compact' });
    localStorage.setItem('prefs', '{bad json');
    expect(safeGetJSON('prefs', { density: 'comfortable' })).toEqual({ density: 'comfortable' });
  });

  it('swallows storage errors and returns fallbacks', () => {
    const getItemSpy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const removeItemSpy = vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(safeGet('missing', 'fallback')).toBe('fallback');
    expect(safeGetJSON('missing', { ok: true })).toEqual({ ok: true });
    expect(() => safeSet('a', 'b')).not.toThrow();
    expect(() => safeSetJSON('a', { b: true })).not.toThrow();
    expect(() => safeRemove('a')).not.toThrow();

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
    removeItemSpy.mockRestore();
  });
});
