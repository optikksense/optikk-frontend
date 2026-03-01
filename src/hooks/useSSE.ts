import { useEffect, useRef, useState, useCallback } from 'react';
import { STORAGE_KEYS } from '@config/constants';
import { safeGet } from '@utils/storage';
import { useAppStore } from '@store/appStore';

export interface SSEEvent {
  type: string;
  data: any;
}

export type SSEStatus = 'connecting' | 'connected' | 'disconnected';

interface UseSSEOptions {
  /** Whether the SSE connection should be active. Defaults to true. */
  enabled?: boolean;
}

/**
 * Hook that connects to the backend SSE endpoint for real-time events.
 *
 * - Automatically includes auth token and team ID headers via URL query params
 *   (EventSource doesn't support custom headers, so the token is sent as a
 *   query parameter; the backend's TenantMiddleware reads Authorization header
 *   which the browser sets from the token in the URL).
 * - Reconnects on disconnection with exponential backoff (1s -> 2s -> 4s -> ... -> 30s).
 * - Cleans up on unmount or when the team changes.
 */
export function useSSE(options: UseSSEOptions = {}) {
  const { enabled = true } = options;
  const selectedTeamId = useAppStore((s) => s.selectedTeamId);

  const [status, setStatus] = useState<SSEStatus>('disconnected');
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);

  // Refs for reconnection logic.
  const esRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  // Listeners registered by consumers (useRealtimeRefresh, etc.).
  const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const addEventListener = useCallback((eventType: string, handler: (data: any) => void) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType)!.add(handler);

    // Return cleanup function.
    return () => {
      listenersRef.current.get(eventType)?.delete(handler);
    };
  }, []);

  useEffect(() => {
    unmountedRef.current = false;

    if (!enabled || !selectedTeamId) {
      // Close any existing connection when disabled or no team.
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      setStatus('disconnected');
      return;
    }

    function connect() {
      if (unmountedRef.current) return;

      const token = safeGet(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        setStatus('disconnected');
        return;
      }

      // Build the SSE URL. We use the /api/events/stream endpoint.
      // EventSource doesn't support custom headers, so we rely on the
      // Vite dev proxy (or production reverse proxy) to forward cookies/headers.
      // We pass token and teamId as query params; a thin middleware or the
      // existing TenantMiddleware can pick them up.
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const url = `${baseUrl}/api/events/stream?token=${encodeURIComponent(token)}&teamId=${selectedTeamId}`;

      setStatus('connecting');

      const es = new EventSource(url);
      esRef.current = es;

      es.addEventListener('connected', () => {
        if (unmountedRef.current) return;
        retryCountRef.current = 0; // reset backoff on successful connection
        setStatus('connected');
      });

      es.addEventListener('data-update', (e: MessageEvent) => {
        if (unmountedRef.current) return;
        try {
          const parsed = JSON.parse(e.data);
          const evt: SSEEvent = { type: 'data-update', data: parsed };
          setLastEvent(evt);

          // Notify registered listeners.
          const handlers = listenersRef.current.get('data-update');
          if (handlers) {
            handlers.forEach((fn) => fn(parsed));
          }
        } catch {
          // Ignore malformed events.
        }
      });

      es.onerror = () => {
        if (unmountedRef.current) return;
        es.close();
        esRef.current = null;
        setStatus('disconnected');

        // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s max.
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30_000);
        retryCountRef.current += 1;

        retryTimerRef.current = setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      unmountedRef.current = true;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      setStatus('disconnected');
    };
  }, [enabled, selectedTeamId]);

  return { status, lastEvent, addEventListener };
}
