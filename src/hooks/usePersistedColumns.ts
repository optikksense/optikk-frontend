import { useCallback, useEffect, useState } from 'react';

export type VisibleColumnsState = Record<string, boolean>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function loadPersistedColumns(
  storageKey: string | undefined,
  defaults: VisibleColumnsState,
): VisibleColumnsState {
  if (!storageKey) return defaults;

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaults;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return defaults;

    const merged: VisibleColumnsState = { ...defaults };
    for (const key of Object.keys(defaults)) {
      const value = parsed[key];
      if (typeof value === 'boolean') {
        merged[key] = value;
      }
    }
    return merged;
  } catch (_error: unknown) {
    return defaults;
  }
}

function persistColumns(
  storageKey: string | undefined,
  value: VisibleColumnsState,
): void {
  if (!storageKey) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (_error: unknown) {
    return;
  }
}

/**
 * Provides localStorage-backed column visibility state.
 * @param defaults Default column visibility map.
 * @param storageKey Optional localStorage key.
 */
export function usePersistedColumns(
  defaults: VisibleColumnsState,
  storageKey?: string,
): readonly [
  VisibleColumnsState,
  (
    updater:
      | VisibleColumnsState
      | ((previous: VisibleColumnsState) => VisibleColumnsState),
  ) => void,
] {
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumnsState>(() =>
    loadPersistedColumns(storageKey, defaults),
  );

  useEffect(() => {
    setVisibleColumns((previous) => {
      const merged: VisibleColumnsState = { ...defaults };
      for (const key of Object.keys(defaults)) {
        if (typeof previous[key] === 'boolean') {
          merged[key] = previous[key];
        }
      }

      const hasSameKeys =
        Object.keys(previous).length === Object.keys(merged).length
        && Object.keys(merged).every((key) => previous[key] === merged[key]);

      return hasSameKeys ? previous : merged;
    });
  }, [defaults]);

  const updateVisibleColumns = useCallback(
    (
      updater:
        | VisibleColumnsState
        | ((previous: VisibleColumnsState) => VisibleColumnsState),
    ): void => {
      setVisibleColumns((previous) => {
        const next = typeof updater === 'function' ? updater(previous) : updater;
        persistColumns(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  return [visibleColumns, updateVisibleColumns] as const;
}
