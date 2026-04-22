import { useTeamId } from "@app/store/appStore";
import { useCallback, useEffect, useState } from "react";

import type { ColumnConfig } from "../types/results";

function storageKey(scope: string, teamId: number | null): string {
  return `explorer:${scope}:${teamId ?? "default"}:columns`;
}

function load(key: string, fallback: readonly ColumnConfig[]): readonly ColumnConfig[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as ColumnConfig[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, columns: readonly ColumnConfig[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(columns));
  } catch {
    /* ignore quota errors */
  }
}

/**
 * Column config is persisted per `${scope}:${teamId}` so switching teams
 * doesn't leak view preferences. Re-keys on team change.
 */
export function useExplorerColumns(
  scope: string,
  defaults: readonly ColumnConfig[]
): {
  columns: readonly ColumnConfig[];
  setColumns: (next: readonly ColumnConfig[]) => void;
  reset: () => void;
} {
  const teamId = useTeamId();
  const key = storageKey(scope, teamId);
  const [columns, setColumnsState] = useState<readonly ColumnConfig[]>(() => load(key, defaults));

  useEffect(() => {
    setColumnsState(load(key, defaults));
  }, [key, defaults]);

  const setColumns = useCallback(
    (next: readonly ColumnConfig[]): void => {
      setColumnsState(next);
      save(key, next);
    },
    [key]
  );

  const reset = useCallback((): void => {
    setColumnsState(defaults);
    save(key, defaults);
  }, [key, defaults]);

  return { columns, setColumns, reset };
}
