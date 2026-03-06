import { act, fireEvent, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useKeyboardShortcut } from './useKeyboardShortcut';

describe('useKeyboardShortcut', () => {
  it('fires when the configured modifier and key are pressed', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut('k', handler, { ctrlKey: true }));

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('accepts metaKey as the ctrl modifier on macOS-style shortcuts', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut('k', handler, { ctrlKey: true }));

    fireEvent.keyDown(document, { key: 'k', metaKey: true });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('ignores events from editable fields and when disabled', () => {
    const handler = vi.fn();
    const input = document.createElement('input');
    document.body.appendChild(input);

    const { rerender } = renderHook(
      ({ enabled }) => useKeyboardShortcut('Escape', handler, { enabled }),
      { initialProps: { enabled: true } },
    );

    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(handler).not.toHaveBeenCalled();

    rerender({ enabled: false });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handler).not.toHaveBeenCalled();

    input.remove();
  });
});
