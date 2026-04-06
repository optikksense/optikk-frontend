import { useEffect, useMemo, useState } from 'react';

interface UseSocketStreamOptions<Item> {
  enabled: boolean;
  /** Subscribe op: 'subscribe:spans' | 'subscribe:logs' */
  subscribeEvent: string;
  /** Item event name for routing (e.g. 'span', 'log') — must match server events */
  itemEvent: string;
  /** Params sent as subscribe payload (includes teamId) */
  params?: Record<string, unknown>;
  maxItems?: number;
  normalizeItem?: (value: unknown) => Item;
  /** If provided, deduplicates items merging into the stream */
  getItemKey?: (item: Item) => string;
  /** If provided, inserts items ordered by timestamp (newest first) */
  getItemTimestamp?: (item: Item) => number;
}

interface UseSocketStreamResult<Item> {
  items: Item[];
  status: 'idle' | 'connecting' | 'live' | 'closed' | 'error';
  lagMs: number;
  droppedCount: number;
  errorMessage: string | null;
}

/** Native WebSocket live tail — same origin as the UI; path is proxied to the API in dev. */
const WS_PATH = '/api/v1/ws/live';

interface ServerMessage {
  event: string;
  data?: unknown;
}

function liveTailWebSocketUrl(): string {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}${WS_PATH}`;
}

export function useSocketStream<Item>({
  enabled,
  subscribeEvent,
  itemEvent,
  params,
  maxItems = 250,
  normalizeItem,
  getItemKey,
  getItemTimestamp,
}: UseSocketStreamOptions<Item>): UseSocketStreamResult<Item> {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<UseSocketStreamResult<Item>['status']>('idle');
  const [lagMs, setLagMs] = useState(0);
  const [droppedCount, setDroppedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    // New subscription / reconnect (paramsKey, team, etc.): do not accumulate on top of a previous buffer.
    setItems([]);

    const ws = new WebSocket(liveTailWebSocketUrl());

    ws.onopen = () => {
      setStatus('live');
      ws.send(
        JSON.stringify({
          op: subscribeEvent,
          payload: params ?? {},
        })
      );
    };

    ws.onmessage = (ev: MessageEvent<string>) => {
      let msg: ServerMessage;
      try {
        msg = JSON.parse(ev.data) as ServerMessage;
      } catch {
        return;
      }

      const { event, data } = msg;

      if (event === itemEvent && data && typeof data === 'object' && data !== null) {
        const payload = data as { item?: unknown; lagMs?: number; droppedCount?: number };
        if (!payload.item) return;

        setStatus('live');
        if (payload.lagMs != null) setLagMs(payload.lagMs);
        if (payload.droppedCount != null) setDroppedCount(payload.droppedCount);

        setItems((previous) => {
          const nextItem = normalizeItem ? normalizeItem(payload.item) : (payload.item as Item);
          if (nextItem === undefined) return previous;
          const cap =
            typeof maxItems === 'number' && Number.isFinite(maxItems) && maxItems > 0
              ? maxItems
              : 250;

          if (getItemKey && getItemTimestamp) {
            const key = getItemKey(nextItem);
            const time = getItemTimestamp(nextItem);

            const filtered = previous.filter((p) => getItemKey(p) !== key);
            // findIndex where timestamp <= new time (newest first)
            const insertIdx = filtered.findIndex((p) => getItemTimestamp(p) <= time);

            if (insertIdx === -1) {
              filtered.push(nextItem);
            } else {
              filtered.splice(insertIdx, 0, nextItem);
            }
            return filtered.slice(0, cap);
          }

          return [nextItem, ...previous].slice(0, cap);
        });
        return;
      }

      if (event === 'heartbeat' && data && typeof data === 'object' && data !== null) {
        const payload = data as { lagMs?: number; droppedCount?: number };
        if (payload.lagMs != null) setLagMs(payload.lagMs);
        if (payload.droppedCount != null) setDroppedCount(payload.droppedCount);
        return;
      }

      if (event === 'done') {
        setStatus('closed');
        return;
      }

      if (event === 'subscribeError' && data && typeof data === 'object' && data !== null) {
        const raw = data as { message?: string };
        setStatus('error');
        setErrorMessage(raw.message ?? 'Subscription error');
      }
    };

    ws.onerror = () => {
      setStatus('error');
      setErrorMessage('WebSocket connection failed');
    };

    ws.onclose = () => {
      setStatus((s) => (s === 'error' ? s : 'closed'));
    };

    return () => {
      ws.close();
      setStatus('closed');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, subscribeEvent, itemEvent, paramsKey, maxItems]);

  return useMemo(
    () => ({ items, status, lagMs, droppedCount, errorMessage }),
    [droppedCount, errorMessage, items, lagMs, status]
  );
}
