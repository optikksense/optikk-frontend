import { useCallback, useMemo } from 'react';
import { useSearchParamsCompat as useSearchParams } from '@shared/hooks/useSearchParamsCompat';

interface UseUrlSyncedTabOptions<T extends string> {
  allowedTabs: readonly T[];
  defaultTab: T;
  paramName?: string;
  clearParamOnDefault?: boolean;
}

interface UseUrlSyncedTabResult<T extends string> {
  activeTab: T;
  setActiveTab: (nextTab: T) => void;
  onTabChange: (nextTab: string) => void;
}

/**
 * Keeps a tab state synchronized with a URL query parameter.
 * @param options Hook configuration.
 */
export function useUrlSyncedTab<T extends string>({
  allowedTabs,
  defaultTab,
  paramName = 'tab',
  clearParamOnDefault = true,
}: UseUrlSyncedTabOptions<T>): UseUrlSyncedTabResult<T> {
  const [searchParams, setSearchParams] = useSearchParams();

  const allowedTabSet = useMemo(() => new Set<string>(allowedTabs), [allowedTabs]);

  const activeTab = useMemo<T>(() => {
    const candidate = searchParams.get(paramName);
    if (candidate && allowedTabSet.has(candidate)) {
      return candidate as T;
    }
    return defaultTab;
  }, [searchParams, paramName, defaultTab, allowedTabSet]);

  const setActiveTab = useCallback(
    (nextTab: T): void => {
      if (!allowedTabSet.has(nextTab)) return;

      const next = new URLSearchParams(searchParams);
      if (clearParamOnDefault && nextTab === defaultTab) {
        next.delete(paramName);
      } else {
        next.set(paramName, nextTab);
      }
      setSearchParams(next, { replace: true });
    },
    [allowedTabSet, clearParamOnDefault, defaultTab, paramName, searchParams, setSearchParams]
  );

  const onTabChange = useCallback(
    (nextTab: string): void => {
      if (!allowedTabSet.has(nextTab)) return;
      setActiveTab(nextTab as T);
    },
    [allowedTabSet, setActiveTab]
  );

  return { activeTab, setActiveTab, onTabChange };
}
