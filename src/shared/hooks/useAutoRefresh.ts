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
  // Skip ticks when the tab is hidden to save CPU / battery.
  useEffect(() => {
    let timerId: number | null = null;
    const start = () => {
      if (timerId != null) return;
      timerId = window.setInterval(() => setNow(Date.now()), 5_000);
    };
    const stop = () => {
      if (timerId != null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        setNow(Date.now());
        start();
      }
    };
    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!autoRefreshInterval) return;
    let timerId: number | null = null;
    const start = () => {
      if (timerId != null) return;
      timerId = window.setInterval(() => {
        refreshRef.current();
        setLastRefreshAt(Date.now());
      }, autoRefreshInterval);
    };
    const stop = () => {
      if (timerId != null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [autoRefreshInterval]);

  const refreshLabel = useMemo(
    () => formatRelativeTime(lastRefreshAt),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [now, lastRefreshAt]
  );

  return { lastRefreshAt, refreshLabel, triggerRefresh };
}
