import { formatRelativeTime } from "@shared/utils/formatters";
import { useCallback, useMemo, useRef, useState } from "react";
import { useVisibilityInterval } from "./useVisibilityInterval";

interface UseAutoRefreshOptions {
  autoRefreshInterval: number;
  onRefresh: () => void;
}

interface UseAutoRefreshResult {
  lastRefreshAt: number;
  refreshLabel: string;
  triggerRefresh: () => void;
}

/**
 * Encapsulates manual/interval refresh timers and "last refreshed" label state.
 * @param options Hook options.
 */
export function useAutoRefresh({
  autoRefreshInterval,
  onRefresh,
}: UseAutoRefreshOptions): UseAutoRefreshResult {
  const [lastRefreshAt, setLastRefreshAt] = useState<number>(() => Date.now());
  const [now, setNow] = useState<number>(() => Date.now());

  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh;

  const triggerRefresh = useCallback((): void => {
    refreshRef.current();
    setLastRefreshAt(Date.now());
  }, []);

  // Update "Xs ago" label periodically without re-rendering every second (avoids header flicker).
  // Skip ticks when the tab is hidden to save CPU / battery.
  useVisibilityInterval(() => setNow(Date.now()), 5_000);

  // Trigger refresh periodically when page is visible.
  useVisibilityInterval(() => {
    refreshRef.current();
    setLastRefreshAt(Date.now());
  }, autoRefreshInterval);

  const refreshLabel = useMemo(() => formatRelativeTime(lastRefreshAt), [now, lastRefreshAt]);

  return { lastRefreshAt, refreshLabel, triggerRefresh };
}
