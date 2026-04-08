import { formatRelativeTime } from "@shared/utils/formatters";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  useEffect(() => {
    const timerId = window.setInterval(() => setNow(Date.now()), 5_000);
    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (!autoRefreshInterval) return;

    const timerId = window.setInterval(() => {
      refreshRef.current();
      setLastRefreshAt(Date.now());
    }, autoRefreshInterval);
    return () => window.clearInterval(timerId);
  }, [autoRefreshInterval]);

  const refreshLabel = useMemo(
    () => formatRelativeTime(lastRefreshAt),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [now, lastRefreshAt]
  );

  return { lastRefreshAt, refreshLabel, triggerRefresh };
}
