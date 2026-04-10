import { useCallback, useEffect } from "react";
import { useLocalStorage } from "react-use";

type VisibleColumnsState = Record<string, boolean>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Provides localStorage-backed column visibility state.
 * @param defaults Default column visibility map.
 * @param storageKey Optional localStorage key.
 */
export function usePersistedColumns(
  defaults: VisibleColumnsState,
  storageKey?: string
): readonly [
  VisibleColumnsState,
  (updater: VisibleColumnsState | ((previous: VisibleColumnsState) => VisibleColumnsState)) => void,
] {
  const [persistedColumns, setPersistedColumns] = useLocalStorage<
    VisibleColumnsState | Record<string, unknown>
  >(storageKey ?? "__disabled__", defaults);
  const visibleColumns =
    storageKey && isRecord(persistedColumns)
      ? Object.keys(defaults).reduce<VisibleColumnsState>(
          (acc, key) => {
            acc[key] =
              typeof persistedColumns[key] === "boolean"
                ? Boolean(persistedColumns[key])
                : defaults[key];
            return acc;
          },
          { ...defaults }
        )
      : defaults;

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    setPersistedColumns((previous) => {
      if (!isRecord(previous)) {
        return defaults;
      }

      const merged: VisibleColumnsState = { ...defaults };
      for (const key of Object.keys(defaults)) {
        if (typeof previous[key] === "boolean") {
          merged[key] = Boolean(previous[key]);
        }
      }
      return merged;
    });
  }, [defaults, setPersistedColumns, storageKey]);

  const updateVisibleColumns = useCallback(
    (
      updater: VisibleColumnsState | ((previous: VisibleColumnsState) => VisibleColumnsState)
    ): void => {
      if (!storageKey) {
        return;
      }

      setPersistedColumns((previous) => {
        const base = isRecord(previous)
          ? Object.keys(defaults).reduce<VisibleColumnsState>(
              (acc, key) => {
                acc[key] =
                  typeof previous[key] === "boolean" ? Boolean(previous[key]) : defaults[key];
                return acc;
              },
              { ...defaults }
            )
          : { ...defaults };
        const next = typeof updater === "function" ? updater(base) : updater;
        return { ...base, ...next };
      });
    },
    [defaults, setPersistedColumns, storageKey]
  );

  return [visibleColumns, updateVisibleColumns] as const;
}
