import { useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

interface UseSocketStreamOptions<Item> {
  enabled: boolean;
  /** The socket.io event to subscribe to (e.g. 'subscribe:spans', 'subscribe:logs') */
  subscribeEvent: string;
  /** The socket.io event that delivers items (e.g. 'span', 'log') */
  itemEvent: string;
  /** Params sent with the subscribe event */
  params?: Record<string, unknown>;
  maxItems?: number;
  normalizeItem?: (value: unknown) => Item;
}

interface UseSocketStreamResult<Item> {
  items: Item[];
  status: 'idle' | 'connecting' | 'live' | 'closed' | 'error';
  lagMs: number;
  droppedCount: number;
  errorMessage: string | null;
}

const SOCKET_PATH = '/socket.io/';
const NAMESPACE = '/live';

export function useSocketStream<Item>({
  enabled,
  subscribeEvent,
  itemEvent,
  params,
  maxItems = 250,
  normalizeItem,
}: UseSocketStreamOptions<Item>): UseSocketStreamResult<Item> {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<UseSocketStreamResult<Item>['status']>('idle');
  const [lagMs, setLagMs] = useState(0);
  const [droppedCount, setDroppedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stable serialized params for effect dependency
  const paramsKey = useMemo(() => JSON.stringify(params ?? {}), [params]);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setStatus('idle');
      setLagMs(0);
      setDroppedCount(0);
      setErrorMessage(null);
      return;
    }

    setStatus('connecting');

    const socket: Socket = io(NAMESPACE, {
      path: SOCKET_PATH,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setStatus('live');
      socket.emit(subscribeEvent, params ?? {});
    });

    socket.on(itemEvent, (payload: { item?: unknown; lagMs?: number; droppedCount?: number }) => {
      if (!payload?.item) return;

      setStatus('live');
      if (payload.lagMs != null) setLagMs(payload.lagMs);
      if (payload.droppedCount != null) setDroppedCount(payload.droppedCount);

      setItems((previous) => {
        const nextItem = normalizeItem ? normalizeItem(payload.item) : (payload.item as Item);
        if (nextItem === undefined) return previous;
        return [nextItem, ...previous].slice(0, maxItems);
      });
    });

    socket.on('heartbeat', (payload: { lagMs?: number; droppedCount?: number }) => {
      if (payload?.lagMs != null) setLagMs(payload.lagMs);
      if (payload?.droppedCount != null) setDroppedCount(payload.droppedCount);
    });

    socket.on('done', () => {
      setStatus('closed');
    });

    socket.on('disconnect', () => {
      setStatus('closed');
    });

    socket.on('connect_error', (err) => {
      setStatus('error');
      setErrorMessage(err?.message ?? 'Socket connection failed');
    });

    // Backend emits subscribeError (not "error") — Socket.IO reserves "error" for transport/protocol use.
    socket.on('subscribeError', (payload: unknown) => {
      const message =
        typeof payload === 'string'
          ? payload
          : payload &&
              typeof payload === 'object' &&
              payload !== null &&
              'message' in payload &&
              typeof (payload as { message: unknown }).message === 'string'
            ? (payload as { message: string }).message
            : 'Subscription error';
      setStatus('error');
      setErrorMessage(message);
    });

    return () => {
      socket.disconnect();
      setStatus('closed');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, subscribeEvent, itemEvent, paramsKey, maxItems]);

  return useMemo(
    () => ({ items, status, lagMs, droppedCount, errorMessage }),
    [droppedCount, errorMessage, items, lagMs, status]
  );
}
