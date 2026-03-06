import { useCallback, useEffect, useRef, useState } from 'react';

import { useAppStore } from '@store/appStore';

import { safeGet } from '@utils/storage';

import { STORAGE_KEYS } from '@config/constants';

/**
 *
 */
export interface SSEEvent {
  readonly type: string;
  readonly data: unknown;
}

/**
 *
 */
export type SSEStatus = 'connecting' | 'connected' | 'disconnected';

interface UseSSEOptions {
  /** Whether the SSE connection should be active. Defaults to true. */
  readonly enabled?: boolean;
}

type SSEHandler = (data: unknown) => void;

type EventListeners = Map<string, Set<SSEHandler>>;

function getRetryDelayMs(retryCount: number): number {
  return Math.min(1000 * Math.pow(2, retryCount), 30_000);
}

function parseSSEData(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch (_error: unknown) {
    return raw;
  }
}

/**
 * Hook that connects to the backend SSE endpoint for real-time events.
 *
 * - Automatically includes auth token and team ID in query params.
 * - Reconnects on disconnection with exponential backoff (1s -> 2s -> 4s -> ... -> 30s).
 * - Cleans up on unmount or when the team changes.
 * @param options
 */
export function useSSE(options: UseSSEOptions = {}): {
  status: SSEStatus;
  lastEvent: SSEEvent | null;
  addEventListener: (eventType: string, handler: SSEHandler) => () => void;
} {
  const { enabled = true } = options;
  const selectedTeamId = useAppStore((state) => state.selectedTeamId);

  const [status, setStatus] = useState<SSEStatus>('disconnected');
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);
  const listenersRef = useRef<EventListeners>(new Map());

  const addEventListener = useCallback((eventType: string, handler: SSEHandler): (() => void) => {
    const existingHandlers = listenersRef.current.get(eventType);
    if (existingHandlers) {
      existingHandlers.add(handler);
    } else {
      listenersRef.current.set(eventType, new Set([handler]));
    }

    return (): void => {
      const handlers = listenersRef.current.get(eventType);
      handlers?.delete(handler);
    };
  }, []);

  useEffect(() => {
    unmountedRef.current = false;

    if (!enabled || !selectedTeamId) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setStatus('disconnected');
      return;
    }

    const connect = (): void => {
      if (unmountedRef.current) {
        return;
      }

      const token = safeGet(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        setStatus('disconnected');
        return;
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const streamUrl = `${baseUrl}/api/events/stream?token=${encodeURIComponent(token)}&teamId=${selectedTeamId}`;
      setStatus('connecting');

      const eventSource = new EventSource(streamUrl);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('connected', () => {
        if (unmountedRef.current) {
          return;
        }
        retryCountRef.current = 0;
        setStatus('connected');
      });

      eventSource.addEventListener('data-update', (event: MessageEvent<string>) => {
        if (unmountedRef.current) {
          return;
        }

        const parsedData = parseSSEData(event.data);
        setLastEvent({ type: 'data-update', data: parsedData });

        const handlers = listenersRef.current.get('data-update');
        if (!handlers) {
          return;
        }
        for (const handler of handlers) {
          handler(parsedData);
        }
      });

      eventSource.onerror = () => {
        if (unmountedRef.current) {
          return;
        }

        eventSource.close();
        eventSourceRef.current = null;
        setStatus('disconnected');

        const delayMs = getRetryDelayMs(retryCountRef.current);
        retryCountRef.current += 1;
        retryTimerRef.current = setTimeout(connect, delayMs);
      };
    };

    connect();

    return (): void => {
      unmountedRef.current = true;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setStatus('disconnected');
    };
  }, [enabled, selectedTeamId]);

  return { status, lastEvent, addEventListener };
}
