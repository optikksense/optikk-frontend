import { useEffect } from 'react';

/**
 * Registers a global keyboard shortcut. Automatically cleans up on unmount.
 * Skips when focus is inside an input/textarea/select.
 *
 * @param {string} key - The KeyboardEvent.key value (e.g., 'Escape', 'k')
 * @param {Function} callback - Handler invoked when key is pressed
 * @param {Object} [options]
 * @param {boolean} [options.enabled=true] - Whether the shortcut is active
 * @param {boolean} [options.ctrlKey=false] - Require Ctrl/Cmd modifier
 * @param {boolean} [options.shiftKey=false] - Require Shift modifier
 */
export function useKeyboardShortcut(key, callback, options = {}) {
  const { enabled = true, ctrlKey = false, shiftKey = false } = options;

  useEffect(() => {
    if (!enabled) return;
    const handler = (e) => {
      if (e.key !== key) return;
      if (ctrlKey && !(e.ctrlKey || e.metaKey)) return;
      if (shiftKey && !e.shiftKey) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      callback(e);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [key, callback, enabled, ctrlKey, shiftKey]);
}
