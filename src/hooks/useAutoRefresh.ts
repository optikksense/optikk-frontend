import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseAutoRefreshOptions {
  autoRefreshInterval: number;
  onRefresh: () => void;
}

interface UseAutoRefreshResult {
  lastRefreshAt: number;
  refreshLabel: string;
  triggerRefresh: () => void;
}

function toRelativeLabel(nowMs: number, sinceMs: number): string {
  const diffSeconds = Math.max(0, Math.floor((nowMs - sinceMs) / 1000));
  if (diffSeconds < 60) return `${diffSeconds}s ago`;

  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
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

  useEffect(() => {
    const timerId = window.setInterval(() => setNow(Date.now()), 1000);
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
    () => toRelativeLabel(now, lastRefreshAt),
    [now, lastRefreshAt],
  );

  return { lastRefreshAt, refreshLabel, triggerRefresh };
}

