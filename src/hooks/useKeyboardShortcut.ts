import { useEffect } from 'react';

interface KeyboardShortcutOptions {
  enabled?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
}

/**
 * Registers a global keyboard shortcut. Automatically cleans up on unmount.
 * Skips when focus is inside an input/textarea/select.
 * @param key - The KeyboardEvent.key value (e.g., 'Escape', 'k')
 * @param callback - Handler invoked when key is pressed
 * @param [options]
 */
export function useKeyboardShortcut(key: string, callback: (e: KeyboardEvent) => void, options: KeyboardShortcutOptions = {}) {
  const { enabled = true, ctrlKey = false, shiftKey = false } = options;

  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== key) return;
      if (ctrlKey && !(e.ctrlKey || e.metaKey)) return;
      if (shiftKey && !e.shiftKey) return;
      const target = e.target as HTMLElement;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      callback(e);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [key, callback, enabled, ctrlKey, shiftKey]);
}
