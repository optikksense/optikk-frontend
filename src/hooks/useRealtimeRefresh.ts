import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';

import { useSSE } from './useSSE';

/**
 * Signal types emitted by the backend SSE broker after successful OTLP ingest.
 */
type SignalType = 'spans' | 'metrics' | 'logs';

/**
 * Maps an SSE signal type to the React Query key prefixes that should be
 * invalidated. This keeps the mapping centralised so new signal types or
 * query keys can be added in one place.
 */
const SIGNAL_QUERY_KEYS: Record<SignalType, string[]> = {
  spans: ['traces', 'overview', 'services', 'topology', 'slo', 'errors'],
  metrics: ['metrics', 'overview', 'saturation', 'nodes', 'resources', 'slo'],
  logs: ['logs', 'overview', 'errors'],
};

const DEBOUNCE_MS = 2000;

interface UseRealtimeRefreshOptions {
  /** Whether real-time refresh is enabled. Defaults to true. */
  enabled?: boolean;
}

/**
 * Connects to the backend SSE stream and triggers React Query cache
 * invalidation when new telemetry data is ingested.
 *
 * Invalidations are debounced: at most one invalidation per signal type
 * per DEBOUNCE_MS window, preventing excessive refetches during high-
 * throughput ingestion bursts.
 *
 * Usage: call this hook once near the app root (e.g. in App.tsx or a
 * layout component). It does not return UI -- it's a side-effect-only hook.
 *
 * ```tsx
 * function App() {
 *   useRealtimeRefresh();
 *   return <RouterOutlet />;
 * }
 * ```
 * @param options
 */
export function useRealtimeRefresh(options: UseRealtimeRefreshOptions = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();
  const { status, addEventListener } = useSSE({ enabled });

  // Track debounce timers per signal type.
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // Track whether an invalidation is pending per signal type.
  const pendingRef = useRef<Set<string>>(new Set());

  const invalidateForSignal = useCallback(
    (signal: string) => {
      const keys = SIGNAL_QUERY_KEYS[signal as SignalType];
      if (!keys) return;

      // If there's already a pending debounce for this signal, just mark it
      // so the trailing call picks it up. Don't schedule another timer.
      if (timersRef.current.has(signal)) {
        pendingRef.current.add(signal);
        return;
      }

      // Perform the invalidation immediately (first call in the window).
      queryClient.invalidateQueries({
        predicate: (query) => {
          const baseKey = String(query.queryKey[0] || '');
          return keys.some((k) => baseKey.includes(k));
        },
      });

      // Set a debounce timer. During this window, subsequent events for the
      // same signal are coalesced. After the window, if there was a pending
      // event, fire one more invalidation.
      const timer = setTimeout(() => {
        timersRef.current.delete(signal);
        if (pendingRef.current.has(signal)) {
          pendingRef.current.delete(signal);
          // Fire the trailing invalidation.
          queryClient.invalidateQueries({
            predicate: (query) => {
              const baseKey = String(query.queryKey[0] || '');
              return keys.some((k) => baseKey.includes(k));
            },
          });
        }
      }, DEBOUNCE_MS);

      timersRef.current.set(signal, timer);
    },
    [queryClient],
  );

  useEffect(() => {
    if (!enabled) return;

    const removeListener = addEventListener('data-update', (data: any) => {
      if (data?.signal) {
        invalidateForSignal(data.signal);
      }
    });

    return () => {
      removeListener();
      // Clear all pending timers on cleanup.
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
      pendingRef.current.clear();
    };
  }, [enabled, addEventListener, invalidateForSignal]);

  return { status };
}
