import { useEffect, useMemo, useRef, useState } from "react";

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
  status: "idle" | "connecting" | "live" | "closed" | "error";
  lagMs: number;
  droppedCount: number;
  errorMessage: string | null;
}

/** Native WebSocket live tail — same origin as the UI; path is proxied to the API in dev. */
const WS_PATH = "/api/v1/ws/live";

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_CAP_MS = 30_000;

interface ServerMessage {
  event: string;
  data?: unknown;
}

function liveTailWebSocketUrl(): string {
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
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
  const [status, setStatus] = useState<UseSocketStreamResult<Item>["status"]>("idle");
  const [lagMs, setLagMs] = useState(0);
  const [droppedCount, setDroppedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const paramsKey = useMemo(() => JSON.stringify(params ?? {}), [params]);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setStatus("idle");
      setLagMs(0);
      setDroppedCount(0);
      setErrorMessage(null);
      return;
    }

    let intentionallyClosed = false;
    let ws: WebSocket | null = null;

    function connect() {
      setStatus("connecting");
      if (reconnectAttemptRef.current === 0) {
        setItems([]);
      }

      ws = new WebSocket(liveTailWebSocketUrl());

      ws.onopen = () => {
        setStatus("live");
        setErrorMessage(null);
        reconnectAttemptRef.current = 0;
        ws!.send(
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

        if (event === itemEvent && data && typeof data === "object" && data !== null) {
          const payload = data as { item?: unknown; lagMs?: number; droppedCount?: number };
          if (!payload.item) return;

          setStatus("live");
          if (payload.lagMs != null) setLagMs(payload.lagMs);
          if (payload.droppedCount != null) setDroppedCount(payload.droppedCount);

          setItems((previous) => {
            const nextItem = normalizeItem ? normalizeItem(payload.item) : (payload.item as Item);
            if (nextItem === undefined) return previous;
            const cap =
              typeof maxItems === "number" && Number.isFinite(maxItems) && maxItems > 0
                ? maxItems
                : 250;

            if (getItemKey && getItemTimestamp) {
              const key = getItemKey(nextItem);
              const time = getItemTimestamp(nextItem);

              const filtered = previous.filter((p) => getItemKey(p) !== key);
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

        if (event === "heartbeat" && data && typeof data === "object" && data !== null) {
          const payload = data as { lagMs?: number; droppedCount?: number };
          if (payload.lagMs != null) setLagMs(payload.lagMs);
          if (payload.droppedCount != null) setDroppedCount(payload.droppedCount);
          return;
        }

        if (event === "done") {
          setStatus("closed");
          return;
        }

        if (event === "subscribeError" && data && typeof data === "object" && data !== null) {
          const raw = data as { message?: string };
          setStatus("error");
          setErrorMessage(raw.message ?? "Subscription error");
        }
      };

      ws.onerror = () => {
        if (!intentionallyClosed) {
          setStatus("error");
          setErrorMessage("WebSocket connection failed");
        }
      };

      ws.onclose = () => {
        if (intentionallyClosed) {
          setStatus("closed");
          return;
        }

        if (reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            RECONNECT_BASE_MS * 2 ** reconnectAttemptRef.current,
            RECONNECT_CAP_MS
          );
          reconnectAttemptRef.current += 1;
          setStatus("connecting");
          reconnectTimerRef.current = setTimeout(connect, delay);
        } else {
          setStatus("error");
          setErrorMessage("Connection lost after multiple retries");
        }
      };
    }

    connect();

    return () => {
      intentionallyClosed = true;
      if (reconnectTimerRef.current != null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      reconnectAttemptRef.current = 0;
      if (ws) {
        ws.close();
      }
      setStatus("closed");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, subscribeEvent, itemEvent, paramsKey, maxItems]);

  return useMemo(
    () => ({ items, status, lagMs, droppedCount, errorMessage }),
    [droppedCount, errorMessage, items, lagMs, status]
  );
}
